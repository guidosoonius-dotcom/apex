"""
/api/deliverables — GET list (with ?q=&client=&verdict= filters), POST upsert.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
from _shared import db, send_json, send_cors_ok, read_json
import urllib.parse
import datetime


class handler(BaseHTTPRequestHandler):

    def log_message(self, *a): pass

    def do_OPTIONS(self):
        send_cors_ok(self)

    def do_GET(self):
        try:
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            client  = params.get('client',  [None])[0]
            verdict = params.get('verdict', [None])[0]
            q       = params.get('q',       [None])[0]
            del_id  = params.get('id',      [None])[0]

            con = db()

            # Single record fetch (for detail panel)
            if del_id:
                row = con.execute(
                    'SELECT * FROM deliverable_library WHERE id = ?', (del_id,)
                ).fetchone()
                con.close()
                if row:
                    send_json(self, dict(row))
                else:
                    send_json(self, {'error': 'Not found'}, 404)
                return

            sql  = 'SELECT * FROM deliverable_library WHERE 1=1'
            args = []
            if client:
                sql += ' AND client LIKE ?'
                args.append(f'%{client}%')
            if verdict:
                sql += ' AND verdict = ?'
                args.append(verdict)
            if q:
                sql += ' AND (label LIKE ? OR client LIKE ? OR content LIKE ?)'
                args += [f'%{q}%', f'%{q}%', f'%{q}%']
            sql += ' ORDER BY created_at DESC'

            rows = con.execute(sql, args).fetchall()
            con.close()

            result = []
            for r in rows:
                d = dict(r)
                d['preview'] = d['content'][:400] + ('…' if len(d['content']) > 400 else '')
                result.append(d)
            send_json(self, result)
        except Exception as e:
            send_json(self, {'error': str(e)}, 500)

    def do_POST(self):
        try:
            p       = read_json(self)
            now     = datetime.datetime.utcnow().isoformat()
            content = p.get('content', '')
            wc      = len(content.split())
            con     = db()
            con.execute("""
                INSERT INTO deliverable_library
                    (id, engagement_id, gate_id, label, content, verdict,
                     client, sector, deliverable_type, word_count, created_at)
                VALUES
                    (:id,:engagement_id,:gate_id,:label,:content,:verdict,
                     :client,:sector,:deliverable_type,:word_count,:now)
                ON CONFLICT(id) DO UPDATE SET
                    content    = excluded.content,
                    verdict    = excluded.verdict,
                    word_count = excluded.word_count
            """, {
                'id':              p.get('id'),
                'engagement_id':   p.get('engagement_id', ''),
                'gate_id':         p.get('gate_id', ''),
                'label':           p.get('label', 'Deliverable'),
                'content':         content,
                'verdict':         p.get('verdict', ''),
                'client':          p.get('client', ''),
                'sector':          p.get('sector', ''),
                'deliverable_type':p.get('deliverable_type', ''),
                'word_count':      wc,
                'now':             now,
            })
            con.commit()
            con.close()
            send_json(self, {'ok': True, 'word_count': wc})
        except Exception as e:
            send_json(self, {'error': str(e)}, 500)
