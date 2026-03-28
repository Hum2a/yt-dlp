"""Start yt-dlp downloads via YoutubeDL API (allowlisted user options)."""

from __future__ import annotations

import logging
import traceback
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field

from app.terminal import _URL_RE
from app.ydl_opts import build_ytdl_opts

router = APIRouter()
logger = logging.getLogger(__name__)


class DownloadBody(BaseModel):
    urls: list[str] = Field(min_length=1, max_length=16)
    """Allowlisted YoutubeDL options (see ``app.ydl_opts``)."""
    options: dict[str, Any] = Field(default_factory=dict)


def _validate_urls(urls: list[str]) -> None:
    for u in urls:
        if not _URL_RE.match(u):
            raise HTTPException(
                status_code=400,
                detail=f'Only http(s) URLs are allowed: {u[:120]!r}',
            )


def _output_dir() -> Path:
    import os

    server_root = Path(__file__).resolve().parents[1]
    raw = os.environ.get('YTDLP_DOWNLOAD_DIR', '').strip()
    if raw:
        return Path(raw).expanduser().resolve()
    return (server_root / 'data' / 'downloads').resolve()


def _append_log(log_path: Path, text: str) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open('a', encoding='utf-8', errors='replace') as f:
        f.write(text)


def _run_ytdlp_download(urls: list[str], options: dict[str, Any]) -> None:
    out_dir = _output_dir()
    out_dir.mkdir(parents=True, exist_ok=True)
    log_path = out_dir / 'yt-dlp-web.log'

    try:
        opts = build_ytdl_opts(options, out_dir)
    except Exception as e:
        _append_log(log_path, f'\n[opts error] {e!r}\n')
        logger.exception('build_ytdl_opts failed')
        return

    _append_log(log_path, f'\n--- job start urls={urls!r} ---\n')

    try:
        import yt_dlp
    except ImportError as e:
        _append_log(log_path, f'\n[import error] {e!r}\n')
        return

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            ydl.download(urls)
    except Exception as e:
        tb = traceback.format_exc()
        _append_log(log_path, f'\n[download error] {e!r}\n{tb[-16000:]}\n')
        logger.exception('YoutubeDL.download failed')


@router.post('/download')
def start_download(body: DownloadBody, background_tasks: BackgroundTasks) -> dict:
    _validate_urls(body.urls)
    if len(body.options) > 120:
        raise HTTPException(status_code=400, detail='Too many option keys.')
    out_dir = _output_dir()
    log_path = out_dir / 'yt-dlp-web.log'
    background_tasks.add_task(_run_ytdlp_download, list(body.urls), dict(body.options))
    return {
        'ok': True,
        'accepted': True,
        'url_count': len(body.urls),
        'output_dir': str(out_dir),
        'log_file': str(log_path),
        'message': 'Download started in the background. Files appear in output_dir when finished; errors append to log_file.',
    }
