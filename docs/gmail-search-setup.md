# Gmail API search preview setup

Version 0.1.4 development adds a separate one-account, read-only Google connection. Existing Thunderbird account configuration and sending stay native. This preview uses a macOS Python helper; Python 3.12 or later must already be installed. OAuth, synthetic Gmail API search/fetch and native viewer display have been exercised in a disposable profile. Public distribution and signed helper packaging remain incomplete.

## Google project

Enable Gmail API in an owner-controlled Google Cloud project. Configure an OAuth app with an appropriate support/contact email, External audience in Testing for personal Gmail testing, and only the owner as a test user initially. Use an Internal audience only for an eligible Workspace organization and its users. Register a Desktop OAuth client and download its client JSON locally.

Google client configuration must never be committed or bundled. The client ID is public by design; account access/refresh tokens are private. This implementation needs no API key. Desktop client secrets are not a reliable security boundary for distributed installed apps. Do not repurpose service-account keys or Thunderbird's credentials.

For wider distribution, finish the published privacy policy, application branding/domain requirements and Google's verification for restricted `gmail.readonly` access. Open-source publication does not establish OAuth approval. Testing-mode refresh access may expire and require reconnection. Do not promise unrestricted public sign-in from this development setup.

## Local helper

After approving local installation and the new Google connection, run:

```sh
python3 native/install.py --credentials /absolute/path/to/downloaded-client.json
```

This copies helper code and the local client JSON under `~/Library/Application Support/Thunderstream/gmail-search/`, with owner-only file permissions, and registers only `thunderstream@local.invalid` in `~/Library/Mozilla/NativeMessagingHosts/eu.thunderstream.gmail_search.json`. The installer supports `--dry-run /absolute/path` to prepare files without registering a native host. Client configuration is not printed. Refresh credentials go into macOS Keychain; access tokens remain only in helper memory. No token is returned to extension storage or UI.

Install the core test XPI in the disposable Thunderbird profile. Open the palette and choose Search Gmail. Connect Google account requests optional nativeMessaging, launches system-browser Google consent with PKCE and a temporary loopback callback, and requests only `gmail.readonly`. The owner completes sign-in and consent. No OAuth consent, Keychain prompt or software trust warning is bypassed.

## Search and limits

The page shows the connected account. Search defaults to All Mail, with a Gmail label scope available. Google syntax is passed through; results are paged in groups of up to 50. Use Include Spam and Trash with `in:anywhere`, `in:spam` or `in:trash`; default searches exclude those folders. Counts describe the current page, not an exact total.

Opening fetches the exact Gmail ID and displays its RFC822 bytes in Thunderbird's native viewer. It is a server copy, without a mailbox association; this slice does not integrate native archive or sender identity selection for that copy. Do not describe it as a complete triage workflow. Messages over 25 MiB cannot be opened in this preview. Google website alias expansion and thread-wide search semantics are not promised.

Disconnect locally removes this helper's saved credentials. It remains available when Google is unreachable. Google authorization can also be revoked in Google Account settings. Disabling the add-on does not revoke the Google grant or delete Keychain data; disconnect first if removal is desired. Requests are bounded and failure does not silently retry.

## Verification status

133 Node tests and 21 Python tests pass, including native-helper and package validation. Regressions cover query/page binding, stale responses, exact server ID opening, incomplete bytes, account-cache changes, offline local disconnect, retired-port recovery, and OAuth `invalid_grant` recovery. The recovery test sends the revoked response through the HTTP error mapper, then verifies that a replacement refresh token can fetch the account profile. Resource validation and deterministic packaging pass. Live OAuth, local disconnect/reconnect, label-scoped archived search and scoped no-result behavior succeeded. In Thunderbird, a fresh search returned the one synthetic message, and opening it displayed the exact server copy in the native viewer. The displayed message had no mailbox association and its Archive, Spam and Delete controls were disabled. A direct shell launch could not read the saved Keychain item (`keychain-unavailable`), so it did not verify the live token-refresh endpoint. Controlled-clock tests cover cached-token reuse and refresh at expiry; live refresh after expiry remains unverified. Unit tests confirm duplicate RFC Message-ID headers do not affect exact Gmail-ID retrieval, but live duplicate-header behavior and revoked-access recovery remain unverified. Wider distribution and everyday use remain gated on qualification.

Sources: [Google desktop OAuth](https://developers.google.com/identity/protocols/oauth2/native-app), [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Gmail API search differences](https://developers.google.com/workspace/gmail/api/guides/filtering), [Thunderbird native messaging](https://developer.thunderbird.net/add-ons/mailextensions/supported-webextension-api), [native message display](https://webextension-api.thunderbird.net/en/mv2/messageDisplay.html).
