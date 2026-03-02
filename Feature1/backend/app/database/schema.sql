CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT UNIQUE,
    file_name TEXT,
    file_extension TEXT,
    size_bytes INTEGER,
    created_at TEXT,
    modified_at TEXT,
    sha256_hash TEXT,
    embedding BLOB,
    access_count INTEGER DEFAULT 0,
    last_accessed TEXT
);