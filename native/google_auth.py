"""Desktop OAuth PKCE and fixed-origin, read-only Google requests. No logging."""
import base64
import hashlib
import hmac
import http.server
import json
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser

SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'
MAX_RESPONSE = 36 * 1024 * 1024


class AuthError(Exception): pass


def authorization_request(client_id, redirect):
    verifier = secrets.token_urlsafe(48)
    state = secrets.token_urlsafe(32)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    query = urllib.parse.urlencode({'client_id': client_id, 'redirect_uri': redirect,
        'response_type': 'code', 'scope': SCOPE, 'state': state,
        'code_challenge': challenge, 'code_challenge_method': 'S256',
        'access_type': 'offline', 'prompt': 'consent select_account'})
    return 'https://accounts.google.com/o/oauth2/v2/auth?' + query, verifier, state


def callback_code(path, state):
    url = urllib.parse.urlsplit(path)
    q = urllib.parse.parse_qs(url.query)
    if url.path != '/callback' or q.get('state') != [state] or not hmac.compare_digest(q['state'][0], state):
        raise AuthError('invalid-callback')
    if q.get('error'): raise AuthError('consent-denied')
    if len(q.get('code', [])) != 1 or not q['code'][0]: raise AuthError('invalid-callback')
    return q['code'][0]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args): return None


def request_json(url, *, data=None, token=None):
    headers = {'Accept': 'application/json'}
    if token: headers['Authorization'] = 'Bearer ' + token
    encoded = urllib.parse.urlencode(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=encoded, headers=headers)
    try:
        with urllib.request.build_opener(NoRedirect).open(req, timeout=20) as response:
            raw = response.read(MAX_RESPONSE + 1)
            if len(raw) > MAX_RESPONSE: raise AuthError('message-too-large')
            return json.loads(raw)
    except urllib.error.HTTPError as error:
        code = {400: 'google-request-failed', 401: 'sign-in-required', 403: 'access-denied', 429: 'rate-limited'}.get(error.code, 'google-unavailable')
        raise AuthError(code) from None
    except (urllib.error.URLError, TimeoutError, OSError): raise AuthError('network-unavailable') from None
    except (ValueError, TypeError): raise AuthError('invalid-response') from None


class GoogleAuth:
    def __init__(self, client, vault, request=request_json):
        self.client, self.vault, self.request = client, vault, request
        self.access = None
        self.expires = 0
        self.access_identity = None
        self.lock = threading.Lock()

    @property
    def email(self):
        saved = self.vault.load()
        return saved.get('email', '') if saved else ''

    def _token_fields(self):
        fields = {'client_id': self.client['client_id']}
        if self.client.get('client_secret'): fields['client_secret'] = self.client['client_secret']
        return fields

    def connect(self):
        result = {}
        class Callback(http.server.BaseHTTPRequestHandler):
            def log_message(self, *_): pass
            def do_GET(handler):
                try: result['code'] = callback_code(handler.path, state)
                except AuthError as error:
                    if str(error) == 'invalid-callback':
                        handler.send_error(400); return
                    result['error'] = str(error)
                handler.send_response(200)
                handler.send_header('Content-Type', 'text/plain; charset=utf-8')
                handler.send_header('Cache-Control', 'no-store')
                handler.send_header('Content-Security-Policy', "default-src 'none'")
                handler.end_headers()
                handler.wfile.write(b'Return to Thunderstream. You may close this tab.')
        with http.server.HTTPServer(('127.0.0.1', 0), Callback) as server:
            server.timeout = 1
            redirect = f'http://127.0.0.1:{server.server_port}/callback'
            url, verifier, state = authorization_request(self.client['client_id'], redirect)
            if not webbrowser.open(url): raise AuthError('browser-unavailable')
            deadline = time.monotonic() + 180
            while not result and time.monotonic() < deadline: server.handle_request()
        if result.get('error'): raise AuthError(result['error'])
        if not result.get('code'): raise AuthError('sign-in-timeout')
        tokens = self.request('https://oauth2.googleapis.com/token', data={**self._token_fields(),
            'code': result['code'], 'code_verifier': verifier, 'redirect_uri': redirect, 'grant_type': 'authorization_code'})
        if tokens.get('scope', SCOPE).split() != [SCOPE] or not tokens.get('refresh_token') or not tokens.get('access_token'):
            raise AuthError('invalid-grant')
        profile = self.request('https://gmail.googleapis.com/gmail/v1/users/me/profile', token=tokens['access_token'])
        if not profile.get('emailAddress'): raise AuthError('invalid-response')
        saved = {'email': profile['emailAddress'], 'client_id': self.client['client_id'], 'refresh_token': tokens['refresh_token']}
        self.vault.save(saved)
        self.access_identity = (saved['email'], saved['client_id'], saved['refresh_token'])
        self.access = tokens['access_token']; self.expires = time.time() + int(tokens.get('expires_in', 3600)) - 60

    def disconnect(self):
        self.vault.clear(); self.access = None; self.expires = 0; self.access_identity = None

    def _token(self):
        with self.lock:
            saved = self.vault.load()
            if not saved or saved.get('client_id') != self.client['client_id']: raise AuthError('sign-in-required')
            identity = (saved['email'], saved['client_id'], saved['refresh_token'])
            if self.access and time.time() < self.expires and identity == self.access_identity: return self.access
            tokens = self.request('https://oauth2.googleapis.com/token', data={**self._token_fields(), 'grant_type': 'refresh_token', 'refresh_token': saved['refresh_token']})
            if not tokens.get('access_token'): raise AuthError('sign-in-required')
            self.access_identity = identity
            self.access = tokens['access_token']; self.expires = time.time() + int(tokens.get('expires_in', 3600)) - 60
            return self.access

    def get(self, path, params=None):
        url = 'https://gmail.googleapis.com/gmail/v1/users/me/' + path
        if params: url += '?' + urllib.parse.urlencode(params, doseq=True)
        return self.request(url, token=self._token())
