#!/usr/bin/env python3
# Run from repo root: python devscripts/generate_ytdlp_cli_catalog.py
# Writes web/client/public/ytdlp-cli-catalog.json for the Features FAQ page.

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'web' / 'client' / 'public' / 'ytdlp-cli-catalog.json'

sys.path.insert(0, str(ROOT))

from yt_dlp.options import create_parser  # noqa: E402
from yt_dlp.version import __version__  # noqa: E402


def _option_dict(opt) -> dict:
    longs = list(getattr(opt, '_long_opts', []) or [])
    shorts = list(getattr(opt, '_short_opts', []) or [])
    t = getattr(opt, 'type', None)
    type_name = None
    if t is not None and t is not str:
        type_name = getattr(t, '__name__', str(t))
    elif t is str:
        type_name = 'str'
    return {
        'flags': shorts + longs,
        'dest': opt.dest,
        'metavar': opt.metavar,
        'help': (opt.help or '').strip(),
        'action': opt.action,
        'type': type_name,
        'takes_value': bool(opt.takes_value()),
    }


def main() -> None:
    parser = create_parser()
    groups_out = []
    for group in parser.option_groups:
        opts = [_option_dict(o) for o in group.option_list]
        if not opts:
            continue
        groups_out.append(
            {
                'title': group.title,
                'description': (getattr(group, 'description', None) or '').strip(),
                'options': opts,
            }
        )

    top_level = [_option_dict(o) for o in parser.option_list]
    catalog = {
        'yt_dlp_version': __version__,
        'groups': groups_out,
        'ungrouped': top_level,
        'option_count': sum(len(g['options']) for g in groups_out) + len(top_level),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, indent=2), encoding='utf-8')
    print(f'Wrote {catalog["option_count"]} options to {OUT}')


if __name__ == '__main__':
    main()
