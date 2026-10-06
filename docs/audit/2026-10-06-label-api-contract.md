# Supported-API Gmail label probe, 2026-10-06

## Decision

Do not implement a full Gmail membership picker using the tested native copy/move route. Addition works for the selected fixture, but moving a label reference to All Mail did not remove its Gmail label. Moving that reference to Inbox did remove it, which cannot preserve an archived message's Inbox absence. A complete membership reader and ambiguous cross-folder identity contract also remain absent.

The current read-only Google helper stays unchanged. An additive-only native label action is a possible separately bounded design; it would need clear wording, same-account destination validation and honest completion evidence, and would not supply selected membership/removal. An exact-Gmail-ID API action would require a separate access/mapping design and owner authorization for new Google mutation scope. Neither route is implemented by this probe. Continue unrelated read-only search convenience work.

## Environment and method

- Source: `8fbbc7cd54d69f2a541add52f58aada69801bb76`; product payload `935d472`.
- Installed core 0.1.5: SHA-256 `76d254fa948264e656df66248ae192cc9b2cf72fe323974931bfafeb9d8bdf02`.
- Thunderbird 157.0.1, macOS 27.0.1, existing Thunderstream Gmail Test profile.
- Existing extension debugger console, background context; no diagnostic extension installed and no source or permission changed.
- APIs: `messages.get/query/continueList`, `folders.query/get`, `messages.tags.list`, `messages.copy/move`, `messages.onCopied/onMoved`.
- Guards re-read the exact source/destination, required the synthetic fixture subject/header marker, account and folder, and selected only the event-linked single message. These fixture guards are throwaway diagnostic code, not a production identity algorithm.
- Independent per-message Gmail connector reads checked all five known synthetic server messages before and after. No real correspondence, profile mail files, client configuration, credentials or raw server snapshots are committed.

## Baseline

Five synthetic server messages existed. M1 had the existing test label and Sent, without Inbox. M2 had Sent without Inbox. M3, M4 and M5 had Sent and Inbox. M4 is the unrelated same-subject fixture used in the earlier native feasibility probe; it had a Thunderbird Work tag, which was absent from Gmail's label IDs.

The native query returned 15 references for the fixture family: 14 Gmail folder references plus one local copy of M1. The five messages appear through Inbox, All Mail, Sent and the custom test-label view with distinct Thunderbird IDs. The local M1 copy shares its RFC header ID with the Gmail original. Account boundaries therefore matter even in this existing corpus. This does not exercise two distinct Gmail server messages with the same RFC header.

Five virtual tag folders and five native tag keys were returned. They were Thunderbird tags, not the Gmail custom-label membership set.

## Operations and observations

| Step | Native operation/reference | Independent server result |
|---|---|---|
| Add | `messages.copy([5], returnedTestLabelId, {isUserAction:true})`; `onCopied` linked native ID 5 in Inbox to 17 in the test-label folder | Only M4 gained the test label; Inbox and Sent remained. M1 retained its label, all other memberships unchanged, five server messages remained |
| Attempt removal through All Mail | `messages.move([17], returnedAllMailId, {isUserAction:true})`; `onMoved` linked 17 to 18 in All Mail | M4 still had the test label, Sent and Inbox. Exact label-scoped server search returned M1 and M4. No duplicate server message appeared |
| Fresh resolution | Old ID 17 became unavailable; `messages.query` for the known fixture in the source label returned new native ID 19 | Server label membership still present, consistent with the fresh native reference |
| Restore through Inbox | Fresh native label ID 19 was moved to the returned same-account Inbox; `onMoved` linked 19 to 20 | M4 returned to Sent and Inbox without the test label. Only M1 remained in the test label. All five messages' label sets matched the baseline |

The resolved copy/move promises were observed before their corresponding events were delivered. A resolved operation and an `onMoved` event did not establish successful Gmail label removal through All Mail. The event is useful for an operation-local reference transition; it is not complete server membership evidence.

The Work tag stayed on the event-linked native references. The API does not expose Gmail labels through `MessageHeader.tags`.

## Installed API/source inspection

The exact installed `omni.ja` message schema exposes folder, internal message ID, RFC header ID and Thunderbird tags in `MessageHeader`, with no Gmail server-ID or label-membership field. Its schema SHA-256 is `f4164813de4179af6bd938c4a7a6c7cc1b509d023cbb31cffeb5bd9e0441a4fc`.

Installed `ext-messages.js` SHA-256 is `55d53d118d26820ad06dd07bd4347e4ee5cf715e5c11f0ec056d124b4160484d`. The copy/move implementation forwards to the native copy service, returns after its completion status and does not supply a Gmail membership postcondition. The probe isolates a destination-dependent native/server result; it does not establish the lower-level Gmail/IMAP cause or a defect in Thunderstream's shipped code.

Primary references: [messages API documentation source](https://github.com/thunderbird/webext-docs/blob/beta-mv2/messages.rst) and [messages API](https://webextension-api.thunderbird.net/en/mv2/messages.html). The installed build is the authority for fields exercised here. Documentation-page fetching was rate-limited; official source/search material and the local installed schema were inspected instead.

## Cleanup and limits

Both temporary event listeners were removed and verified absent, the extension debugger and its extra tab were closed, and the native local synthetic fixture was restored as the current view. All five synthetic messages' server memberships were restored. No message was sent, deleted or created; no new Google access was requested. Native `isUserAction` operations can update Thunderbird's last copy/move destination preference; no layout preference write was introduced by Thunderstream.

Not exercised: an archived label removal that preserves Inbox absence, unrelated custom labels on the selected message, distinct same-account duplicate RFC headers, concurrent edits, mixed-account/bulk partial outcomes, restart continuity and hidden/nested label coverage. The negative All Mail result is sufficient to reject this tested route as a complete picker contract. It is not evidence that every possible native strategy is impossible.

Automated product tests were not rerun for throwaway console diagnostics and documentation. The unchanged product retains the navigation build's 146 Node plus 21 Python baseline and exact-head CI. Raw UI observations remain in this chat; this record contains sanitized synthetic/software metadata only.
