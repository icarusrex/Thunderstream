# Gmail API native message opening, 2026-10-05

## Setup

- macOS 27.0.1 (26A434), Thunderbird 157.0.1, Thunderstream 0.1.4.
- Disposable test profile, Google account `aronlaz@gmail.com`, read-only `gmail.readonly` OAuth scope.
- Test XPI: `thunderstream-core-0.1.4-gmail-search-test.xpi`, SHA-256 `b611ba26dc50c132bd1e111161a5d5873615e418633da92fd89c3da7ad76298c`.

## Results

- Selected Gmail label `Thunderstream Test 20261004A` and searched `subject:"Thunderstream Gmail Test 20261004A"`.
- Gmail API returned exactly one result with the expected subject and sender.
- Opening the result fetched the exact result ID as RFC822 and displayed it in a Thunderbird native message tab. The message body was the expected synthetic test text.
- The native viewer loaded the temporary file `gmail-message.eml`. The server-copy viewer disabled Archive, Spam and Delete controls, so this test did not mutate the mailbox.
- The fetched message was 961 bytes. Its SHA-256 was `089589882aea4851d5b0d1d74e9f44c07a84bf8ea747f550d53d715b3fab501c`, matching the earlier exact-fetch record.
- After closing and reopening the Gmail Search tab, the page restored the connected account and labels. Repeating the same label-scoped query returned the same single synthetic result.
- Added `-in:inbox` to the label-scoped query. Gmail still returned the result, confirming this synthetic message is archived. Opening it again displayed the same synthetic body in a new temporary native message file.
- Used Disconnect locally. The page cleared the connected account and disabled search. Reconnected the same test account with the same read-only scope; the account and labels returned, and the archived query again returned one result that opened in Thunderbird.
- Searched the same test label for `subject:"Thunderstream Gmail Test 20261004A-NOMATCH-20261005"`. Gmail returned the expected `No matching messages.` state, then re-enabled Search and Disconnect locally.
- No Inbox or All Mail messages were opened.
- Repeated the native-open check after surfacing the disposable Thunderbird profile. With `Thunderstream Test 20261004A` selected, `subject:"Thunderstream Gmail Test 20261004A"` returned exactly one message. Opening it displayed the expected synthetic body in a temporary `gmail-message-4.eml` tab; Archive, Spam and Delete remained disabled. No Gmail Inbox message was opened and no mailbox action was taken.
- A separate Gmail web search by subject alone grouped several synthetic messages into multiple conversations. Adding the dedicated label reduced the view to the intended test conversation, confirming why live qualification must retain the explicit label scope.

## Outcome and remaining work

Native display of an exact Gmail API-fetched message passes on this Thunderbird build. The label-scoped archived search, a scoped no-result query, and local disconnect/reconnect paths also pass for the synthetic test. This verifies server-copy display, not mailbox association, native archive/reply behavior, or broad release readiness. Uncached search, duplicate Message-ID behavior, revoked-access recovery and token refresh remain to be qualified. Keep the preview in development.

## Token refresh logic check

A disposable in-process fake vault and token endpoint with a controlled clock verified that the helper reuses a cached access token before expiry and requests one replacement at expiry. A regression test also sends Google's `invalid_grant` response through the real HTTP error mapper, confirms sign-in is requested, then saves a replacement grant and verifies that the helper can fetch the account profile. These checks cover local helper behavior only. They do not verify macOS Keychain persistence, Google's live token endpoint, testing-mode refresh-token lifetime, or native UI recovery, so live token-refresh and revoked-access qualification remain open.
