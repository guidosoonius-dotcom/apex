"""
Shared utilities for APEX Vercel serverless functions.
SQLite lives in /tmp (writable on Vercel, ephemeral per Lambda lifecycle).
"""
import sqlite3
import json
import os
import re
import datetime

DB_PATH = '/tmp/apex.db'

NAVY  = (15,  27,  45)
TEAL  = (14, 124, 123)
GOLD  = (201, 168,  76)
WHITE = (240, 245, 250)
FOG   = (139, 163, 190)

CORS_HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version, anthropic-beta',
}


def init_db(con):
    con.executescript("""
        CREATE TABLE IF NOT EXISTS engagements (
            id               TEXT PRIMARY KEY,
            client           TEXT,
            sector           TEXT,
            deliverable      TEXT,
            status           TEXT DEFAULT 'ready',
            brief            TEXT,
            agents           TEXT,
            created_at       TEXT DEFAULT (datetime('now')),
            updated_at       TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS deliverable_library (
            id               TEXT PRIMARY KEY,
            engagement_id    TEXT,
            gate_id          TEXT,
            label            TEXT NOT NULL,
            content          TEXT NOT NULL,
            verdict          TEXT,
            client           TEXT,
            sector           TEXT,
            deliverable_type TEXT,
            word_count       INTEGER DEFAULT 0,
            created_at       TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_del_eng    ON deliverable_library(engagement_id);
        CREATE INDEX IF NOT EXISTS idx_del_client ON deliverable_library(client);
        CREATE INDEX IF NOT EXISTS idx_del_verdict ON deliverable_library(verdict);
    """)
    con.commit()


def db():
    """Return an open sqlite3 connection, initialising the schema on first call."""
    needs_init = not os.path.exists(DB_PATH)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    if needs_init:
        init_db(con)
    return con


def send_json(h, data, status=200):
    body = json.dumps(data, default=str).encode()
    h.send_response(status)
    for k, v in CORS_HEADERS.items():
        h.send_header(k, v)
    h.send_header('Content-Type',   'application/json')
    h.send_header('Content-Length', str(len(body)))
    h.end_headers()
    h.wfile.write(body)


def send_cors_ok(h):
    h.send_response(200)
    for k, v in CORS_HEADERS.items():
        h.send_header(k, v)
    h.end_headers()


def read_json(h):
    length = int(h.headers.get('Content-Length', 0))
    return json.loads(h.rfile.read(length))


# ── Markdown helpers (shared by docx / pptx builders) ────────────────────────

def strip_inline(text):
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*',     r'\1', text)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    text = re.sub(r'`(.+?)`',       r'\1', text)
    return text


def parse_md(content):
    blocks = []
    for raw in content.split('\n'):
        line = raw.rstrip()
        if   line.startswith('# '):    blocks.append(('title',  line[2:].strip()))
        elif line.startswith('## '):   blocks.append(('h1',     line[3:].strip()))
        elif line.startswith('### '):  blocks.append(('h2',     line[4:].strip()))
        elif line.startswith(('- ', '* ')): blocks.append(('bullet', line[2:].strip()))
        elif line == '---':            blocks.append(('hr',     ''))
        elif line == '':               blocks.append(('empty',  ''))
        else:                          blocks.append(('para',   line))
    return blocks


def is_meta(text):
    return bool(re.match(r'\*?\*?Client:', text) or
                re.match(r'\*?\*?Sector:', text)  or
                re.match(r'Date:', text))


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
