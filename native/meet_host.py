"""Separate Google Meet connection. No mail/calendar data crosses this protocol."""
import http.server
import json
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from google_auth import GoogleAuth, AuthError, authorization_request, callback_code, NoRedirect
from gmail_host import read_frame, write_frame
from keychain import Keychain

MEET_SCOPE = 'https://www.googleapis.com/auth/meetings.space.created'
SCOPES = {MEET_SCOPE, 'openid', 'https://www.googleapis.com/auth/userinfo.email'}


class MeetAuth(GoogleAuth):
    def __init__(self, client, vault, expected_email):
        super().__init__(client, vault)
        self.expected_email = expected_email

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
                handler.wfile.write(b'Return to Thunderstream Meet. You may close this tab.')
        with http.server.HTTPServer(('127.0.0.1', 0), Callback) as server:
            server.timeout = 1
            redirect = f'http://127.0.0.1:{server.server_port}/callback'
            url, verifier, state = authorization_request(self.client['client_id'], redirect)
            parsed = urllib.parse.urlsplit(url)
            query = dict(urllib.parse.parse_qsl(parsed.query))
            query.update(scope='openid email ' + MEET_SCOPE, login_hint=self.expected_email)
            url = urllib.parse.urlunsplit(parsed._replace(query=urllib.parse.urlencode(query)))
            if not webbrowser.open(url): raise AuthError('browser-unavailable')
            deadline = time.monotonic() + 180
            while not result and time.monotonic() < deadline: server.handle_request()
        if result.get('error'): raise AuthError(result['error'])
        if not result.get('code'): raise AuthError('sign-in-timeout')
        tokens = self.request('https://oauth2.googleapis.com/token', data={**self._token_fields(),
            'code': result['code'], 'code_verifier': verifier, 'redirect_uri': redirect, 'grant_type': 'authorization_code'})
        granted = set(tokens.get('scope', '').split())
        if 'email' in granted: granted.remove('email'); granted.add('https://www.googleapis.com/auth/userinfo.email')
        if granted != SCOPES or not tokens.get('refresh_token') or not tokens.get('access_token'):
            raise AuthError('meet-consent-incomplete')
        profile = self.request('https://openidconnect.googleapis.com/v1/userinfo', token=tokens['access_token'])
        if profile.get('email_verified') is not True or profile.get('email', '').lower() != self.expected_email:
            raise AuthError('wrong-google-account')
        saved = {'email': self.expected_email, 'client_id': self.client['client_id'], 'refresh_token': tokens['refresh_token']}
        self.vault.save(saved)
        self.access_identity = (saved['email'], saved['client_id'], saved['refresh_token'])
        self.access = tokens['access_token']; self.expires = time.time() + int(tokens.get('expires_in', 3600)) - 60

    def create(self):
        if self.email != self.expected_email: raise AuthError('sign-in-required')
        request = urllib.request.Request('https://meet.googleapis.com/v2/spaces', data=b'{}', method='POST',
            headers={'Authorization': 'Bearer ' + self._token(), 'Content-Type': 'application/json', 'Accept': 'application/json'})
        try:
            with urllib.request.build_opener(NoRedirect).open(request, timeout=20) as response:
                raw = response.read(65537)
                if len(raw) > 65536: raise AuthError('invalid-response')
                value = json.loads(raw)
        except urllib.error.HTTPError as error:
            code = {401: 'sign-in-required', 403: 'meet-access-denied', 429: 'rate-limited'}.get(error.code, 'meeting-result-uncertain')
            error.close(); raise AuthError(code) from None
        except (urllib.error.URLError, TimeoutError, OSError): raise AuthError('meeting-result-uncertain') from None
        except (ValueError, TypeError): raise AuthError('invalid-response') from None
        uri = value.get('meetingUri') if isinstance(value, dict) else None
        if not isinstance(uri, str) or not re.fullmatch(r'https://meet\.google\.com/[a-z]{3}-[a-z]{4}-[a-z]{3}', uri):
            raise AuthError('invalid-response')
        return {'url': uri, 'email': self.expected_email}


def main():
    if len(sys.argv) < 3 or sys.argv[2] != 'thunderstream-meet@local.invalid': return
    config = Path(__file__).with_name('google-client.json')
    account = None
    while True:
        try:
            request = read_frame(sys.stdin.buffer)
            if request is None: return
        except (ValueError, OSError): return
        try:
            if account is None:
                client = json.loads(config.read_text()).get('installed', {})
                if not client.get('client_id'): raise AuthError('client-not-configured')
                vault = Keychain(); vault.service = b'eu.thunderstream.meet'; vault.account = b'google-meet'
                expected_email = json.loads(Path(__file__).with_name('meet-account.json').read_text()).get('email', '')
                if not isinstance(expected_email, str) or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', expected_email): raise AuthError('account-not-configured')
                account = MeetAuth(client, vault, expected_email.lower())
            op = request.get('op')
            if set(request) - {'id', 'op'}: raise AuthError('unsupported-request')
            if op == 'status': result = {'connected': account.email == account.expected_email, 'email': account.email}
            elif op == 'connect': account.connect(); result = {'connected': True, 'email': account.expected_email}
            elif op == 'disconnect': account.disconnect(); result = {'connected': False, 'email': ''}
            elif op == 'create': result = account.create()
            else: raise AuthError('unsupported-request')
            response = {'id': request.get('id'), 'ok': True, **result}
        except AuthError as error: response = {'id': request.get('id'), 'ok': False, 'code': str(error)}
        except Exception: response = {'id': request.get('id'), 'ok': False, 'code': 'meet-helper-failed'}
        write_frame(sys.stdout.buffer, response)


if __name__ == '__main__': main()
