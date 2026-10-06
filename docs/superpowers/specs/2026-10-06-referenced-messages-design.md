# Referenced messages with the native reader

## Intent and decision

C01 needs a defined membership and per-message target before a fuller conversation UI. Deliver a small referenced-message navigator using native headers and the native reader. This is a list of the selected message and explicit References/In-Reply-To matches in its original folder, not a complete conversation: newer replies and other folders are excluded, subjects are never used for matching, and missing/ambiguous/unavailable matches are visible.

## Contract

Launch from the existing palette with exactly one freshly validated selected/displayed message. Capture its native ID, RFC header ID, account, folder and original window. Require native messages.getHeaders, get/query and messageDisplay.open; getHeaders absence makes only this command unavailable. No getFull/body/attachment/decryption/helper fallback, new permission, native preferences or send/archive behavior change.

Use raw native headers, deduplicate exact angle-bracket IDs, exclude the selected RFC ID and limit to the most recent 50 references. Queries use original folderId and headerMessageId, and results are checked again for exact folder/account/header identity. Two matches make a reference ambiguous, not a choice; pagination must be checked. At most 20 pages per query; incomplete/error results are unavailable rather than missing. Abort outstanding list cursors after early exit when the native abort API is available.

Create an ephemeral five-minute session bound to the returned extension tab and window. Launch validates original selection; later listing/opening stays anchored to that captured message regardless of a different mail selection. Closing the navigator invalidates its session; closing the source tab does not retarget it. Initialization captures an allowlist of returned native IDs and identity snapshots. Opening accepts only a listed integer ID, verifies the anchor/target still has its exact folder/account/RFC identity, and rechecks unique reference resolution. Moved/missing/changed IDs and newly ambiguous duplicates fail visibly. Native open uses messageId, never a globally resolved headerMessageId, and always the captured window. Serialize requests per reference session; discard results after expiry/close during async reads.

The page exposes selected vs referenced items, subject, sender, date, original account/folder and explicit missing/ambiguous/unavailable/truncated notices using inert text/native buttons. Open in Thunderbird keeps native MIME/HTML/remote content, encryption, attachments and per-message Reply/Reply All/Forward/read/star behavior in the native reader. This slice adds no custom reader or mail mutation controls. Refresh rechecks the anchored list; errors preserve retry and explain the exact gap. No real-mail metadata is saved in build evidence.

## Acceptance

Test source selection/owner/expiry, same-folder and exact-header boundaries, duplicate/pagination/missing/offline/header-limit cases, no body access, current-selection independence, fresh target revalidation, failed-open retry, concurrent-open lock and close-during-read behavior. Render production UI/service with synthetic native APIs for inert names, keyboard, errors/retry, empty and narrow layout. Full suites, one independent reviewer, deterministic package/source/install/startup identity, existing draft PR CI and vault tracking are required. Native runtime behavior remains open until the disposable window can be selected safely.
