"""Merge user-provided JSON into a safe YoutubeDL ``params`` dict (allowlisted keys only)."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

_FORMAT_PRESETS: dict[str, str] = {
    'best': 'bv*+ba/b',
    'best_1080': 'bv*[height<=1080]+ba/b[height<=1080]/b',
    'best_720': 'bv*[height<=720]+ba/b[height<=720]/b',
    'best_480': 'bv*[height<=480]+ba/b[height<=480]/b',
    'audio': 'bestaudio/best',
}

_MERGE_FORMATS = frozenset({'mp4', 'mkv', 'webm', 'mov', 'flv', 'avi'})

_AUDIO_CODECS = frozenset({'best', 'mp3', 'm4a', 'opus', 'vorbis', 'wav', 'flac', 'alac', 'aac'})


def _as_bool(v: Any) -> bool | None:
    if isinstance(v, bool):
        return v
    if v in (None, '', 0):
        return None
    return bool(v)


def _as_int(v: Any, *, lo: int, hi: int) -> int | None:
    if v is None or v == '':
        return None
    try:
        n = int(v)
    except (TypeError, ValueError):
        return None
    return max(lo, min(hi, n))


def _as_float(v: Any) -> float | None:
    if v is None or v == '':
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _as_str(v: Any, max_len: int = 4096) -> str | None:
    if v is None:
        return None
    s = str(v).strip()
    if not s:
        return None
    return s[:max_len]


def _split_cats(s: str) -> set[str]:
    parts = re.split(r'[\s,]+', s.strip())
    return {p for p in parts if p and re.match(r'^[\w.*+\-]+$', p)}


def _subtitle_langs(v: Any) -> list[str] | None:
    if v is None:
        return None
    if isinstance(v, list):
        raw = [str(x).strip() for x in v if str(x).strip()]
    else:
        raw = [p.strip() for p in str(v).split(',') if p.strip()]
    if not raw:
        return None
    out: list[str] = []
    for x in raw[:32]:
        if re.match(r'^[\w.*\-]+$', x):
            out.append(x[:32])
    return out or None


def build_ytdl_opts(user: dict[str, Any] | None, out_dir: Path) -> dict[str, Any]:
    """
    Build kwargs for ``YoutubeDL``. User-controlled keys are allowlisted; output always stays under ``out_dir``.
    """
    user = user or {}
    if not isinstance(user, dict):
        user = {}

    out: dict[str, Any] = {
        'quiet': True,
        'no_warnings': False,
        'noprogress': True,
        'paths': {'home': str(out_dir.resolve())},
        'outtmpl': {'default': '%(title)s [%(id)s].%(ext)s'},
    }

    # --- format ---
    preset = _as_str(user.get('format_preset'), 32) or 'best'
    if preset not in _FORMAT_PRESETS:
        preset = 'best'
    custom = _as_str(user.get('format_custom'), 500)
    out['format'] = custom if custom else _FORMAT_PRESETS[preset]

    nop = _as_bool(user.get('noplaylist'))
    if nop is True:
        out['noplaylist'] = True

    pl_items = _as_str(user.get('playlist_items'), 200)
    if pl_items:
        out['playlist_items'] = pl_items

    mof = (_as_str(user.get('merge_output_format'), 12) or '').lower()
    if mof in _MERGE_FORMATS:
        out['merge_output_format'] = mof

    if _as_bool(user.get('prefer_free_formats')) is True:
        out['prefer_free_formats'] = True

    if _as_bool(user.get('restrictfilenames')) is True:
        out['restrictfilenames'] = True

    # --- subtitles ---
    if _as_bool(user.get('writesubtitles')) is True:
        out['writesubtitles'] = True
    if _as_bool(user.get('writeautomaticsub')) is True:
        out['writeautomaticsub'] = True
    sl = _subtitle_langs(user.get('subtitleslangs'))
    if sl:
        out['subtitleslangs'] = sl
    if _as_bool(user.get('embedsubtitles')) is True:
        out['embedsubtitles'] = True

    # --- thumbnails / metadata ---
    if _as_bool(user.get('writethumbnail')) is True:
        out['writethumbnail'] = True
    if _as_bool(user.get('embedthumbnail')) is True:
        out['embedthumbnail'] = True
    if _as_bool(user.get('writeinfojson')) is True:
        out['writeinfojson'] = True
    if _as_bool(user.get('writedescription')) is True:
        out['writedescription'] = True

    # --- SponsorBlock ---
    if _as_bool(user.get('no_sponsorblock')) is True:
        out['no_sponsorblock'] = True
    else:
        sm = _as_str(user.get('sponsorblock_mark'), 200)
        if sm:
            out['sponsorblock_mark'] = _split_cats(sm)
        sr = _as_str(user.get('sponsorblock_remove'), 200)
        if sr:
            out['sponsorblock_remove'] = _split_cats(sr)
    sct = _as_str(user.get('sponsorblock_chapter_title'), 300)
    if sct:
        out['sponsorblock_chapter_title'] = sct

    # --- audio extraction (FFmpeg) ---
    if _as_bool(user.get('extract_audio')) is True:
        codec = (_as_str(user.get('audio_codec'), 16) or 'mp3').lower()
        if codec not in _AUDIO_CODECS:
            codec = 'mp3'
        qual = _as_str(user.get('audio_quality'), 16) or '192'
        out.setdefault('postprocessors', []).append(
            {
                'key': 'FFmpegExtractAudio',
                'preferredcodec': codec,
                'preferredquality': qual,
            }
        )

    # --- network ---
    proxy = _as_str(user.get('proxy'), 512)
    if proxy and proxy.startswith(('http://', 'https://', 'socks5://', 'socks5h://')):
        out['proxy'] = proxy
    st = _as_float(user.get('socket_timeout'))
    if st is not None and 0 < st <= 600:
        out['socket_timeout'] = st
    retries = _as_int(user.get('retries'), lo=0, hi=100)
    if retries is not None:
        out['retries'] = retries
    fr = _as_int(user.get('fragment_retries'), lo=0, hi=100)
    if fr is not None:
        out['fragment_retries'] = fr
    cf = _as_int(user.get('concurrent_fragment_downloads'), lo=1, hi=32)
    if cf is not None:
        out['concurrent_fragment_downloads'] = cf

    # --- geo ---
    if _as_bool(user.get('geo_bypass')) is True:
        out['geo_bypass'] = True
    gc = _as_str(user.get('geo_bypass_country'), 8)
    if gc and re.match(r'^[A-Z]{2}$', gc.upper()):
        out['geo_bypass_country'] = gc.upper()

    # Hard deny paths / templates from client
    out['paths'] = {'home': str(out_dir.resolve())}
    out['outtmpl'] = {'default': '%(title)s [%(id)s].%(ext)s'}

    return out
