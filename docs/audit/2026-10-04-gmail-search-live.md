# Gmail API search live test, 2026-10-04

## Setup

The owner configured a Google Cloud Desktop OAuth client in a project kept in Testing and authorized one personal test account. The helper and 0.1.4 extension were installed for a disposable Thunderbird profile. The everyday Thunderbird profile was left untouched. OAuth used the `gmail.readonly` scope; no API key, service-account key, hosted backend or credential was committed or bundled.

## Results

- Google consent completed for the intended test account. The helper reported the saved connection after starting a new process, confirming Keychain reconnect.
- Gmail API search was limited to the synthetic test label and returned exactly one message.
- The returned Gmail message ID was fetched directly as RFC822. One bounded chunk returned 961 bytes, and size/integrity checks passed. SHA-256: `089589882aea4851d5b0d1d74e9f44c07a84bf8ea747f550d53d715b3fab501c`.
- The test read only this synthetic message. No normal mailbox messages were opened.

## Remaining qualification

Thunderbird native display of the fetched RFC822 File is unverified. An isolated-profile launch attempt exited before displaying the message, so it does not count as a pass. Archived or uncached messages, duplicate Message-ID behavior, revoked access, token refresh and explicit disconnect also remain unverified. Keep the preview in development and do not claim a complete search-and-triage workflow until the native opening path is exercised.
