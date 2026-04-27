"""
/api/engagements — GET list, POST upsert.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
from _shared import db, send_json, send_cors_ok, read_json
import json
import datetime


class handler(BaseHTTPRequestHandler):

    def log_message(self, *a): pass

    def do_OPTIONS(self):
        send_cors_ok(self)

    def do_GET(self):
        try:
            con  = db()
            rows = con.execute(
                'SELECT * FROM engagements ORDER BY created_at DESC'
            ).fetchall()
            con.close()
            send_json(self, [dict(r) for r in rows])
        except Exception as e:
            send_json(self, {'error': str(e)}, 500)

    def do_POST(self):
        try:
            p   = read_json(self)
            now = datetime.datetime.utcnow().isoformat()
            con = db()
            con.execute("""
                INSERT INTO engagements
                    (id, client, sector, deliverable, status, brief, agents, created_at, updated_at)
                VALUES
                    (:id,:client,:sector,:deliverable,:status,:brief,:agents,:now,:now)
                ON CONFLICT(id) DO UPDATE SET
                    status     = excluded.status,
                    updated_at = excluded.updated_at
            """, {
                'id':          p.get('id'),
                'client':      p.get('client', ''),
                'sector':      p.get('sector', ''),
                'deliverable': p.get('deliverable', ''),
                'status':      p.get('status', 'ready'),
                'brief':       p.get('brief', ''),
                'agents':      json.dumps(p.get('agents', [])),
                'now':         now,
            })
            con.commit()
            con.close()
            send_json(self, {'ok': True})
        except Exception as e:
            send_json(self, {'error': str(e)}, 500)
