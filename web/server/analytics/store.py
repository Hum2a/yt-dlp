import json
import os
import sqlite3
import time
from pathlib import Path

_ANALYTICS_ENV = 'YTDLP_ANALYTICS_DB'

_SCHEMA = """
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    name TEXT NOT NULL,
    props_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);

CREATE TABLE IF NOT EXISTS daily_stats (
    date TEXT NOT NULL,
    metric TEXT NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (date, metric)
);
"""


def get_db_path() -> Path:
    raw = os.environ.get(_ANALYTICS_ENV)
    if raw:
        return Path(raw).expanduser().resolve()
    base = Path(__file__).resolve().parent.parent
    return (base / 'data' / 'analytics.db').resolve()


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(_SCHEMA)
    conn.commit()


def record_event(name: str, props: dict | None = None, *, db_path: Path | None = None) -> None:
    """Append one analytics row. ``props`` must be JSON-serializable (``default=str`` on encode)."""
    path = db_path or get_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(props or {}, separators=(',', ':'), default=str)
    now = int(time.time())
    with sqlite3.connect(path) as conn:
        init_db(conn)
        conn.execute(
            'INSERT INTO events (ts, name, props_json) VALUES (?, ?, ?)',
            (now, name, payload),
        )
        conn.commit()
