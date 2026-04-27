"""
/api/messages — proxy POST requests to Anthropic's Messages API.
The x-api-key header is forwarded from the client (stored in browser localStorage).
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
from _shared import CORS_HEADERS, send_cors_ok
import urllib.request
import urllib.error
import json

ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'


class handler(BaseHTTPRequestHandler):

    def log_message(self, *a): pass  # silence access logs

    def do_OPTIONS(self):
        send_cors_ok(self)

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body   = self.rfile.read(length)

        fwd = {
            'Content-Type':      self.headers.get('Content-Type', 'application/json'),
            'anthropic-version': self.headers.get('anthropic-version', '2023-06-01'),
        }
        if self.headers.get('x-api-key'):
            fwd['x-api-key'] = self.headers['x-api-key']
        if self.headers.get('anthropic-beta'):
            fwd['anthropic-beta'] = self.headers['anthropic-beta']

        req = urllib.request.Request(ANTHROPIC_URL, data=body, headers=fwd, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                self._relay(resp.status, data)
        except urllib.error.HTTPError as e:
            self._relay(e.code, e.read())
        except Exception as e:
            self._relay(502, json.dumps({'error': str(e)}).encode())

    def _relay(self, status, data):
        self.send_response(status)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.send_header('Content-Type',   'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)
