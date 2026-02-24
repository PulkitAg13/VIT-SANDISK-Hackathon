import sqlite3
import os

DB_PATH = os.path.join("app", "database", "smart_search.db")


def get_connection():
    return sqlite3.connect(DB_PATH)


def initialize_database():
    conn = get_connection()
    cursor = conn.cursor()

    with open(os.path.join("app", "database", "schema.sql"), "r") as f:
        cursor.executescript(f.read())

    conn.commit()
    conn.close()