"""CLI entry: ``ytdlp-web-server`` (uvicorn with reload)."""

from __future__ import annotations

import os
import sys


def main() -> None:
    import uvicorn

    host = os.environ.get('YTDLP_WEB_HOST', '127.0.0.1')
    port = int(os.environ.get('YTDLP_WEB_PORT', '8000'))
    reload = os.environ.get('YTDLP_WEB_RELOAD', '1') not in ('0', 'false', 'False')

    # Ensure ``web/server`` is on sys.path when running as installed script
    server_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if server_root not in sys.path:
        sys.path.insert(0, server_root)

    uvicorn.run(
        'app.main:app',
        host=host,
        port=port,
        reload=reload,
        reload_dirs=[server_root] if reload else None,
    )


if __name__ == '__main__':
    main()
