"""Narrow native protocol: OAuth, search, exact read and bounded chunks only."""
import base64
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import re
import secrets
import struct
import sys
import time
from google_auth import GoogleAuth, AuthError

MAX_FRAME = 1024 * 1024
MAX_MAIL = 25 * 1024 * 1024
CHUNK = 256 * 1024


def read_frame(stream):
    header = stream.read(4)
    if not header: return None
    if len(header) != 4: raise ValueError('truncated-frame')
    length, = struct.unpack('@I', header)
    if not 0 < length <= MAX_FRAME: raise ValueError('invalid-frame')
    raw = stream.read(length)
    if len(raw) != length: raise ValueError('truncated-frame')
    value = json.loads(raw)
    if not isinstance(value, dict): raise ValueError('invalid-frame')
    return value


def write_frame(stream, value):
    raw = json.dumps(value, ensure_ascii=True).encode()
    if len(raw) > MAX_FRAME: raise ValueError('oversize-frame')
    stream.write(struct.pack('@I', len(raw)) + raw); stream.flush()


def message_id(value):
    if not isinstance(value, str) or not re.fullmatch('[a-fA-F0-9]{1,64}', value): raise AuthError('invalid-message')
    return value


class GmailHost:
    def __init__(self, account):
        self.account = account
        self.blobs = {}

    def handle(self, request):
        op = request.get('op')
        if 'email' in request and request['email'] != self.account.email: raise AuthError('account-changed')
        if op == 'status':
            email = self.account.email
            state = {'email': email, 'connected': bool(email), 'labels': []}
            if email:
                try: state['labels'] = self.account.get('labels').get('labels', [])
                except AuthError as error: state['warning'] = str(error)
            return state
        if op == 'connect':
            self.account.connect(); self.blobs.clear()
            return self.handle({'op': 'status'})
        if op == 'disconnect':
            self.account.disconnect(); self.blobs.clear()
            return {'connected': False}
        if op == 'search':
            query = request.get('query')
            if not isinstance(query, str) or not query.strip() or len(query) > 4096: raise AuthError('invalid-query')
            params = {'q': query, 'maxResults': 50}
            if request.get('includeSpamTrash') is True or request.get('labelId') in ('SPAM', 'TRASH'): params['includeSpamTrash'] = 'true'
            for source, target in [('labelId', 'labelIds'), ('pageToken', 'pageToken')]:
                value = request.get(source)
                if value:
                    if not isinstance(value, str) or len(value) > 4096: raise AuthError('invalid-query')
                    params[target] = value
            listing = self.account.get('messages', params)
            ids = [message_id(item['id']) for item in listing.get('messages', [])]
            if len(ids) > 50: raise AuthError('invalid-response')
            def metadata(mid):
                data = self.account.get('messages/' + mid, {'format': 'metadata', 'metadataHeaders': ['From', 'Subject', 'Date']})
                if data.get('id') != mid: raise AuthError('message-mismatch')
                headers = {h['name'].lower(): h['value'] for h in data.get('payload', {}).get('headers', [])}
                return {'id': mid, 'from': headers.get('from', ''), 'subject': headers.get('subject', ''), 'date': headers.get('date', ''), 'internalDate': data.get('internalDate', '')}
            with ThreadPoolExecutor(max_workers=6) as pool: items = list(pool.map(metadata, ids))
            return {'email': self.account.email, 'items': items, 'nextPageToken': listing.get('nextPageToken', '')}
        if op == 'read':
            mid = message_id(request.get('messageId'))
            data = self.account.get('messages/' + mid, {'format': 'raw'})
            if data.get('id') != mid: raise AuthError('message-mismatch')
            raw = data.get('raw')
            if not isinstance(raw, str) or not re.fullmatch('[A-Za-z0-9_=-]*', raw): raise AuthError('invalid-response')
            content = base64.urlsafe_b64decode(raw + '=' * (-len(raw) % 4))
            if len(content) > MAX_MAIL: raise AuthError('message-too-large')
            self.blobs.clear()  # Only one open operation's bytes are retained.
            handle = secrets.token_urlsafe(24)
            self.blobs[handle] = (content, time.monotonic())
            return {'handle': handle, 'size': len(content)}
        if op == 'chunk':
            record = self.blobs.get(request.get('handle'))
            if not record or time.monotonic() - record[1] > 120: self.blobs.clear(); raise AuthError('read-expired')
            content = record[0]; offset = request.get('offset')
            if type(offset) is not int or not 0 <= offset < len(content): raise AuthError('invalid-offset')
            block = content[offset:offset + CHUNK]
            done = offset + len(block) == len(content)
            if done: self.blobs.clear()
            return {'data': base64.b64encode(block).decode(), 'done': done}
        raise AuthError('unsupported-request')


def main():
    # Native registration permits only this extension; reject accidental other callers too.
    if len(sys.argv) < 3 or sys.argv[2] != 'thunderstream@local.invalid': return
    config = Path(__file__).with_name('google-client.json')
    host = None
    while True:
        try:
            request = read_frame(sys.stdin.buffer)
            if request is None: return
        except (ValueError, OSError): return
        try:
            if host is None:
                if not config.is_file(): raise AuthError('client-not-configured')
                from keychain import Keychain
                client = json.loads(config.read_text()).get('installed')
                if not client or not client.get('client_id'): raise AuthError('client-not-configured')
                host = GmailHost(GoogleAuth(client, Keychain()))
            result = {'id': request.get('id'), 'ok': True, **host.handle(request)}
        except AuthError as error: result = {'id': request.get('id'), 'ok': False, 'code': str(error)}
        except Exception: result = {'id': request.get('id'), 'ok': False, 'code': 'helper-failed'}
        write_frame(sys.stdout.buffer, result)


if __name__ == '__main__': main()
