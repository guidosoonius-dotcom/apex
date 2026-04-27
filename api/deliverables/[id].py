"""
/api/deliverables/:id — DELETE a specific deliverable.
Vercel dynamic route: the [id] segment is available in self.path.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from http.server import BaseHTTPRequestHandler
from _shared import db, send_json, send_cors_ok
import urllib.parse
import re


def _extract_id(path):
    """Pull the last path segment as the deliverable ID."""
    clean = path.split('?')[0].rstrip('/')
    m = re.search(r'/([^/]+)$', clean)
    return urllib.parse.unquote(m.group(1)) if m else None


class handler(BaseHTTPRequestHandler):

    def log_message(self, *a): pass

    def do_OPTIONS(self):
        send_cors_ok(self)

    def do_GET(self):
        """Return full content for a single deliverable."""
        del_id = _extract_id(self.path)
        if not del_id:
            send_json(self, {'error': 'Missing id'}, 400)
            return
        try:
            con = db()
            row = con.execute(
                'SELECT * FROM deliverable_library WHERE id = ?', (del_id,)
            ).fetchone()
            con.close()
            if row:
                send_json(self, dict(row))
            else:
                send_json(self, {'error': 'Not found'}, 404)
        except Exception as e:
            send_json(self, {'error': str(e)}, 500)

    def do_DELETE(self):
        del_id = _extract_id(self.path)
        if not del_id:
            send_json(self, {'error': 'Missing id'}, 400)
            return
        try:
            con = db()
            con.execute('DELETE FROM deliverable_library WHERE id = ?', (del_id,))
            con.commit()
            con.close()
            send_json(self, {'ok': True})
        except Exception as e:
            send_json(self, {'error': str(e)}, 500)
