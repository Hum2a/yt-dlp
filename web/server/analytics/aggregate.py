import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path


def _utc_day_bounds(date_str: str) -> tuple[int, int]:
    day = datetime.strptime(date_str, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    start = int(day.timestamp())
    end = int((day + timedelta(days=1)).timestamp())
    return start, end


def aggregate_date(conn: sqlite3.Connection, date_str: str) -> None:
    """Rebuild ``daily_stats`` rows for ``date_str`` (YYYY-MM-DD, UTC) from ``events``."""
    start_ts, end_ts = _utc_day_bounds(date_str)
    conn.execute('DELETE FROM daily_stats WHERE date = ?', (date_str,))
    conn.execute(
        """
        INSERT INTO daily_stats (date, metric, count)
        SELECT ?, name, COUNT(*)
        FROM events
        WHERE ts >= ? AND ts < ?
        GROUP BY name
        """,
        (date_str, start_ts, end_ts),
    )
    conn.commit()


def rotate_raw_events(conn: sqlite3.Connection, *, keep_days: int = 7) -> int:
    """Delete raw ``events`` older than ``keep_days`` full UTC days (by event ``ts``)."""
    if keep_days < 1:
        return 0
    today_midnight = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    cutoff_day = today_midnight - timedelta(days=keep_days)
    cutoff_ts = int(cutoff_day.timestamp())
    cur = conn.execute('DELETE FROM events WHERE ts < ?', (cutoff_ts,))
    conn.commit()
    return cur.rowcount if cur.rowcount is not None else 0


def run_nightly(
    db_path: Path,
    *,
    date_str: str,
    keep_days: int,
    do_rotate: bool,
) -> tuple[int, int]:
    """
    Aggregate one UTC calendar day, optionally prune old events.

    Returns (metrics_written_or_updated_rows, events_deleted).
    """
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        from .store import init_db

        init_db(conn)
        aggregate_date(conn, date_str)
        cur = conn.execute(
            'SELECT COUNT(*) FROM daily_stats WHERE date = ?',
            (date_str,),
        )
        metric_rows = int(cur.fetchone()[0])
        deleted = rotate_raw_events(conn, keep_days=keep_days) if do_rotate else 0
    return metric_rows, deleted
