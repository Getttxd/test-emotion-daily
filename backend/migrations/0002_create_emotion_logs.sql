-- Migration number: 0002
CREATE TABLE IF NOT EXISTS emotion_logs (
    id TEXT PRIMARY KEY,
    mood TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK(intensity >= 1 AND intensity <= 10),
    note TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emotion_logs_date ON emotion_logs (date);
