"""
Nightly usage aggregation (first-party SQLite).

Typical cron (UTC), after midnight::

    15 0 * * * YTDLP_ANALYTICS_DB=/var/lib/ytdlp/analytics.db /path/to/venv/bin/ytdlp-aggregate-analytics

Windows Task Scheduler: same executable and env var.

Options:
    --date YYYY-MM-DD   Calendar day in UTC (default: yesterday UTC).
    --db PATH           Override DB file (else YTDLP_ANALYTICS_DB or data/analytics.db).
    --keep-days N       Raw event retention in UTC days (default: 7).
    --no-rotate         Only aggregate; do not delete old raw rows.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .aggregate import run_nightly
from .store import get_db_path


def _yesterday_utc() -> str:
    d = datetime.now(timezone.utc).date() - timedelta(days=1)
    return d.isoformat()


def main() -> None:
    p = argparse.ArgumentParser(description='Aggregate analytics events into daily_stats.')
    p.add_argument('--date', help='UTC date YYYY-MM-DD (default: yesterday UTC)')
    p.add_argument('--db', type=Path, help='SQLite path (overrides YTDLP_ANALYTICS_DB)')
    p.add_argument('--keep-days', type=int, default=7, help='Raw event retention (UTC days)')
    p.add_argument('--no-rotate', action='store_true', help='Skip deleting old events')
    args = p.parse_args()

    date_str = args.date or _yesterday_utc()
    datetime.strptime(date_str, '%Y-%m-%d')  # validate

    db_path = args.db.expanduser().resolve() if args.db else get_db_path()
    metric_rows, deleted = run_nightly(
        db_path,
        date_str=date_str,
        keep_days=max(1, args.keep_days),
        do_rotate=not args.no_rotate,
    )
    print(f'aggregated date={date_str} db={db_path} daily_stats_rows={metric_rows} events_deleted={deleted}')


if __name__ == '__main__':
    main()
