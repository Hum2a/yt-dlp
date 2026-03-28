"""Start yt-dlp downloads into a fixed server directory (background task)."""

from __future__ import annotations

import logging
import os
import subprocess
import sys
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field

from app.terminal import _REPO_ROOT, _URL_RE, _merge_env

router = APIRouter()
logger = logging.getLogger(__name__)


class DownloadBody(BaseModel):
    urls: list[str] = Field(min_length=1, max_length=16)
    audio_only: bool = False


def _validate_urls(urls: list[str]) -> None:
    for u in urls:
        if not _URL_RE.match(u):
            raise HTTPException(
                status_code=400,
                detail=f'Only http(s) URLs are allowed: {u[:120]!r}',
            )


def _output_dir() -> Path:
    server_root = Path(__file__).resolve().parents[1]
    raw = os.environ.get('YTDLP_DOWNLOAD_DIR', '').strip()
    if raw:
        return Path(raw).expanduser().resolve()
    return (server_root / 'data' / 'downloads').resolve()


def _run_ytdlp_download(urls: list[str], audio_only: bool) -> None:
    out_dir = _output_dir()
    out_dir.mkdir(parents=True, exist_ok=True)
    log_path = out_dir / 'yt-dlp-web.log'
    out_tmpl = str(out_dir / '%(title)s [%(id)s].%(ext)s')

    cmd = [
        sys.executable,
        '-m',
        'yt_dlp',
        '-o',
        out_tmpl,
        '--no-colors',
        '--newline',
    ]
    if audio_only:
        cmd.extend(['-f', 'bestaudio/best'])
    cmd.extend(urls)

    env = _merge_env()
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(_REPO_ROOT),
            env=env,
        )
    except OSError as e:
        logger.exception('yt-dlp spawn failed')
        with log_path.open('a', encoding='utf-8', errors='replace') as f:
            f.write(f'\n[spawn error] {e}\n')
        return

    with log_path.open('a', encoding='utf-8', errors='replace') as f:
        f.write(f'\n--- job urls={urls!r} audio_only={audio_only} returncode={proc.returncode} ---\n')
        if proc.stderr:
            f.write(proc.stderr[-12000:])
        if proc.stdout:
            f.write('\n[stdout tail]\n')
            f.write(proc.stdout[-4000:])


@router.post('/download')
def start_download(body: DownloadBody, background_tasks: BackgroundTasks) -> dict:
    _validate_urls(body.urls)
    out_dir = _output_dir()
    log_path = out_dir / 'yt-dlp-web.log'
    background_tasks.add_task(_run_ytdlp_download, list(body.urls), body.audio_only)
    return {
        'ok': True,
        'accepted': True,
        'url_count': len(body.urls),
        'audio_only': body.audio_only,
        'output_dir': str(out_dir),
        'log_file': str(log_path),
        'message': 'Download started in the background. Files appear in output_dir when finished; errors append to log_file.',
    }
