# Durable references: contract audit

## Decision

D01 is design-gated. Do not ship a saved native message number, an RFC-header-only link or a guessed Gmail web URL. Source/API audit establishes useful identifiers, but no durable user-facing link has been qualified.

## Evidence

- [Thunderbird messages documentation](https://webextension-api.thunderbird.net/en/mv2/messages.html) states native messageId does not survive restart or follow a move. Its accountId/headerMessageId query is a lookup, not proof of unique server identity. Online queries are currently NNTP-only, so absent local IMAP matches do not establish server deletion.
- Installed Thunderbird 157.0.1 MessageHeader schema exposes headerMessageId, folder and runtime id, but no X-GM-MSGID/server Gmail ID. Schema hash and field inventory are retained in the send-lifecycle build record.
- [Google messages resource](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages) documents immutable Gmail message IDs. [Google IMAP extensions](https://developers.google.com/workspace/gmail/imap/imap-extensions) exposes X-GM-MSGID across folders and distinguishes it from X-GM-THRID. This does not document an account-qualified web routing contract or exact-message presentation after a web link opens.
- Current optional helper returns exact Gmail message IDs and checks the requested email against its single connected account. Extension result allowlists are ephemeral and prevent arbitrary ID opening. Temporary raw-message copies are native reader inputs, not durable links.
- No primary documentation for an account-qualified exact-message Gmail web link was located in this audit. That is a qualification gap, not proof that such URLs never work. No account email, Gmail ID or mail content was saved in these records.

## Next supported design

Consider an explicitly local, account-qualified saved Gmail reference resolved through the existing readonly helper. It would need a versioned stored format, exact account match with no automatic fallback, import/selection authorization, missing-account/deleted-message/auth-expiry outcomes, and no broadening of the current search-result allowlist without an explicit saved-reference contract. A bookmark/reference manager is additional product scope and does not by itself create a link that other apps can open. Public URI registration and cross-provider references need separate designs.

Native restart, server move, account removal and duplicate-header fixtures remain unqualified. Continue independent reliability work rather than exposing a misleading Copy Link action.
