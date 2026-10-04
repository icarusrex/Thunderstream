import base64
import io
import json
import struct
import sys
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'native'))
from gmail_host import GmailHost, read_frame, write_frame
from google_auth import authorization_request, callback_code, AuthError


class Account:
    email = 'owner@fixture.test'
    def __init__(self):
        self.requests = []
        self.fail_metadata = False
    def get(self, path, params=None):
        self.requests.append((path, params))
        if path == 'profile': return {'emailAddress': self.email}
        if path == 'labels': return {'labels': [{'id': 'Label_1', 'name': 'Projects'}]}
        if path == 'messages': return {'messages': [{'id': 'abc1', 'threadId': 't1'}], 'nextPageToken': 'page2', 'resultSizeEstimate': 5}
        if self.fail_metadata: raise AuthError('rate-limited')
        if params.get('format') == 'raw':
            return {'id': path.split('/')[-1], 'raw': base64.urlsafe_b64encode(b'Message-ID: <duplicate@fixture.test>\r\n\r\nExact abc1').decode()}
        return {'id': 'abc1', 'internalDate': '1000', 'payload': {'headers': [{'name': 'From', 'value': 'Peer <peer@fixture.test>'}, {'name': 'Subject', 'value': '<img onerror=evil>'}]}}


class HelperTests(unittest.TestCase):
    def test_query_label_and_page_are_preserved_without_local_translation(self):
        account = Account(); host = GmailHost(account)
        result = host.handle({'op': 'search', 'query': 'from:peer OR "exact phrase" -old', 'labelId': 'Label_1', 'pageToken': 'previous'})
        self.assertEqual(account.requests[0], ('messages', {'q': 'from:peer OR "exact phrase" -old', 'maxResults': 50, 'labelIds': 'Label_1', 'pageToken': 'previous'}))
        self.assertEqual(result['items'][0]['subject'], '<img onerror=evil>')
        self.assertEqual(result['email'], 'owner@fixture.test')
        self.assertEqual(result['nextPageToken'], 'page2')

    def test_metadata_failure_is_not_empty_success(self):
        account = Account(); account.fail_metadata = True
        with self.assertRaisesRegex(AuthError, 'rate-limited'):
            GmailHost(account).handle({'op': 'search', 'query': 'has:attachment'})

    def test_open_is_bound_to_exact_gmail_id_not_duplicate_rfc_header(self):
        account = Account(); host = GmailHost(account)
        result = host.handle({'op': 'read', 'messageId': 'abc1'})
        chunk = host.handle({'op': 'chunk', 'handle': result['handle'], 'offset': 0})
        self.assertEqual(base64.b64decode(chunk['data']), b'Message-ID: <duplicate@fixture.test>\r\n\r\nExact abc1')
        self.assertEqual(account.requests, [('messages/abc1', {'format': 'raw'})])

    def test_wrong_server_identity_and_path_injection_are_rejected(self):
        account = Account(); original = account.get
        account.get = lambda *args: {'id': 'abc2', 'raw': 'QQ'}
        with self.assertRaisesRegex(AuthError, 'message-mismatch'): GmailHost(account).handle({'op': 'read', 'messageId': 'abc1'})
        account.get = original
        with self.assertRaisesRegex(AuthError, 'invalid-message'): GmailHost(account).handle({'op': 'read', 'messageId': '../profile'})
        with self.assertRaisesRegex(AuthError, 'unsupported'): GmailHost(account).handle({'op': 'send'})

    def test_native_frames_are_bounded_and_truncation_is_rejected(self):
        stream = io.BytesIO(); write_frame(stream, {'id': 7, 'ok': True}); stream.seek(0)
        self.assertEqual(read_frame(stream), {'id': 7, 'ok': True})
        with self.assertRaises(ValueError): read_frame(io.BytesIO(struct.pack('@I', 2000000)))
        with self.assertRaises(ValueError): read_frame(io.BytesIO(struct.pack('@I', 20) + b'{}'))

    def test_pkce_readonly_scope_and_callback_state(self):
        url, verifier, state = authorization_request('fixture.apps.googleusercontent.com', 'http://127.0.0.1:4444/callback')
        q = parse_qs(urlsplit(url).query)
        self.assertEqual(q['scope'], ['https://www.googleapis.com/auth/gmail.readonly'])
        self.assertEqual(q['code_challenge_method'], ['S256'])
        self.assertGreaterEqual(len(verifier), 43)
        self.assertEqual(callback_code('/callback?state=' + state + '&code=fixture-code', state), 'fixture-code')
        with self.assertRaisesRegex(AuthError, 'invalid-callback'): callback_code('/callback?state=wrong&code=bad', state)
        with self.assertRaisesRegex(AuthError, 'consent-denied'): callback_code('/callback?state=' + state + '&error=access_denied', state)


if __name__ == '__main__': unittest.main()
