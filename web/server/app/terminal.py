"""
Sanitized execution of yt-dlp CLI arguments from user input (no shell).

Security model:
- Parse with shlex only (no shell); reject newlines and obvious shell metacharacters.
- Strip optional ``yt-dlp`` / ``python -m yt_dlp`` prefix.
- Validate arguments with the same optparse parser yt-dlp uses.
- Reject if any high-risk option differs from parser defaults (cookies, exec, batch files, etc.).
- Positional URLs must be http(s) only.
- Run ``sys.executable -m yt_dlp`` with a bounded timeout and output cap.
"""

from __future__ import annotations

import optparse
import os
import re
import shlex
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

_REPO_ROOT = Path(__file__).resolve().parents[3]
_MAX_OUTPUT_CHARS = 400_000
_TIMEOUT_SEC = 120
_MAX_ARGV = 256

_BLOCKED_DESTS = frozenset(
    {
        'exec_cmd',
        'exec_before_dl_cmd',
        'netrc_cmd',
        'batchfile',
        'cookiefile',
        'cookiesfrombrowser',
        'load_info_filename',
        'config_locations',
        'plugin_dirs',
        'update_self',
    },
)

_URL_RE = re.compile(r'^https?://', re.IGNORECASE)
_BAD_CHARS = frozenset('`$|;&\n\r\x00')


class TerminalRunBody(BaseModel):
    line: str = Field(min_length=1, max_length=32768)


def _ensure_ytdlp_importable() -> None:
    root = str(_REPO_ROOT)
    if root not in sys.path:
        sys.path.insert(0, root)


@lru_cache(maxsize=1)
def _parser_and_defaults():
    _ensure_ytdlp_importable()
    from yt_dlp.options import create_parser

    parser = create_parser()
    default_opts, _ = parser.parse_args([])
    return parser, default_opts


def _merge_env() -> dict:
    env = os.environ.copy()
    sep = ';' if sys.platform == 'win32' else ':'
    root = str(_REPO_ROOT)
    cur = env.get('PYTHONPATH', '').strip()
    env['PYTHONPATH'] = root if not cur else f'{root}{sep}{cur}'
    return env


def _strip_prefix(argv: list[str]) -> list[str]:
    if not argv:
        return argv
    if argv[0] == 'yt-dlp':
        return argv[1:]
    if len(argv) >= 3 and argv[0] == 'python' and argv[1] == '-m' and argv[2] in ('yt_dlp', 'yt-dlp'):
        return argv[3:]
    raise HTTPException(
        status_code=400,
        detail='Command must start with yt-dlp, or python -m yt_dlp, or be arguments only (same as after yt-dlp).',
    )


def _reject_bad_tokens(parts: list[str]) -> None:
    for p in parts:
        if any(c in p for c in _BAD_CHARS):
            raise HTTPException(status_code=400, detail='Forbidden character in argument.')
        if p.startswith('@'):
            raise HTTPException(status_code=400, detail='Response files (@file) are not allowed.')
        if p == '-':
            raise HTTPException(status_code=400, detail='stdin URL (-) is not allowed.')


def _validate_urls(urls: list[str]) -> None:
    if len(urls) > 32:
        raise HTTPException(status_code=400, detail='Too many URLs (max 32).')
    for u in urls:
        if not _URL_RE.match(u):
            raise HTTPException(
                status_code=400,
                detail=f'Only http(s) URLs are allowed as positional arguments, got: {u[:80]!r}',
            )


def _assert_safe_opts(user_opts, default_opts) -> None:
    for dest in _BLOCKED_DESTS:
        if not hasattr(user_opts, dest):
            continue
        if getattr(user_opts, dest) != getattr(default_opts, dest):
            raise HTTPException(
                status_code=400,
                detail=f'That option is disabled in the web terminal (high-risk for file or shell access).',
            )


def run_sanitized_line(line: str) -> dict:
    raw = line.strip()
    if not raw:
        raise HTTPException(status_code=400, detail='Empty command.')

    try:
        parts = shlex.split(raw, posix=True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f'Could not parse command: {e}') from e

    if len(parts) > _MAX_ARGV:
        raise HTTPException(status_code=400, detail='Too many arguments.')

    _reject_bad_tokens(parts)

    if parts and parts[0] not in ('yt-dlp', 'python'):
        argv = parts
    else:
        argv = _strip_prefix(parts)

    _reject_bad_tokens(argv)

    parser, default_opts = _parser_and_defaults()
    try:
        user_opts, urls = parser.parse_args(argv)
    except optparse.OptParseError as e:
        raise HTTPException(status_code=400, detail=str(e).strip()) from e

    _assert_safe_opts(user_opts, default_opts)
    _validate_urls(urls)

    cmd = [sys.executable, '-m', 'yt_dlp', *argv]
    env = _merge_env()

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=_TIMEOUT_SEC,
            cwd=str(_REPO_ROOT),
            env=env,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail=f'yt-dlp exceeded {_TIMEOUT_SEC}s timeout.') from None

    out = proc.stdout or ''
    err = proc.stderr or ''
    truncated = False
    if len(out) + len(err) > _MAX_OUTPUT_CHARS:
        truncated = True
        half = _MAX_OUTPUT_CHARS // 2
        out = out[:half] + '\n… [stdout truncated] …\n'
        err = err[:half] + '\n… [stderr truncated] …\n'

    return {
        'returncode': proc.returncode,
        'stdout': out,
        'stderr': err,
        'truncated': truncated,
        'argv_display': ['yt-dlp', *argv],
    }


@router.post('/terminal/run')
def terminal_run(body: TerminalRunBody) -> dict:
    return run_sanitized_line(body.line)
