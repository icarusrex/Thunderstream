# Current product scope, 2026-10-04

Owner-confirmed goal: a Mac application for Google Workspace providing the useful Mimestream experience without an additional recurring mail-app subscription. Thunderbird is an acceptable foundation with specific interface improvements. Use established Mimestream product behavior as the reference; keep specs small and verify consequential decisions explicitly.

The owner approved the six areas below and requested reconciliation with the existing plan and deployed work. This updates the target product scope. It does not make the existing 0.1.3 foundation a complete MVP or approve new Google permissions, a backend, a replacement mail engine or previously unverified native hooks.

## Reconciliation

| Approved area | Existing stories and plan | Actual current state | Next bounded requirement |
|---|---|---|---|
| Gmail labels | TS-401/402; foundation Task 4 deliberately implements Thunderbird tags | Native tags work; a Gmail test label survived archive. A native Copy To / Move To probe now verifies basic label add/remove on one synthetic message. No Gmail picker or complete membership reader exists | Existing Gmail label actions, preserving Inbox and unrelated labels; verify identity/membership mapping before implementation |
| Gmail search | TS-501/502/503; design defers syntax translation and Gmail API search | Palette Quick Filter is folder-local and has a restricted syntax; it is not equivalent to Gmail search | Investigate supported server search; explicit account and All Mail/current-label scope. No new Google access is silently authorized |
| Sidebar favorites | TS-801/802/803 and TS-403; Task 8 is compatibility-dependent | Native sidebar remains; companion scaffold is inactive | A separate sidebar presentation spec preserving complete native navigation and clean disable |
| Message rows | TS-101/102/103/104; Task 8 requires native-widget feasibility | Theme colors exist; density and persistent layout writes are gated. Row preview/spacing changes are not implemented | A separate row-treatment spec, initially one preview line and attachment indication where native capabilities permit |
| Sender identity | TS-602; Tasks 3/4/5 and later native evidence | Native From retained; explicit chooser and recipient-match/account-default suggestions tested on alias and Gmail cases | Retain current behavior; qualify additional actual Workspace aliases. Automatic Gmail alias discovery/history-based selection is not implemented |
| Keyboard triage | TS-201/202/301; Task 7 plus Task 9 qualification | Native actions through palette work. User-assigned modifier shortcut supported; single-key native profiles remain disabled | Qualify one exact supported native profile; protect editors, IME, selection context and disable cleanup |

Gmail labels and Gmail-compatible search are now target product requirements instead of being substituted by tags or treated as optional solely because the foundation omitted them. A Gmail API implementation remains an architectural decision to verify separately. Original priorities and the historical design remain preserved; this document records the newer owner direction.

## Deployment and evidence baseline

Published prerelease: 0.1.2. Open development PR: #3, branch `fix-n18-popup-unload`. At reconciliation, PR head was `1a09129d498f40ed8c2e5a7e35f9c2cd7dd6acf4`. The installed disposable-profile core was 0.1.3, built from tested code `197b3c2f0855c92315d166f51ae1b96b6e0dd4c5`, SHA-256 `6cf9e4e2bcf1789ab34081a3b02bab5d9f1dd96dc3ff87902b3a856a20b480da`. This was an installed test build; it was not a new published release or a complete Mimestream replacement.

See [release status](release-status.md), [Gmail verification](audit/2026-10-04-gmail-0.1.3.md), [reliability continuation](audit/2026-10-04-reliability-0.1.3.md) and [native label feasibility](audit/2026-10-04-native-label-feasibility.md).

The owner subsequently identified native Google search as the likely highest-value feature. The [proposed first search slice](gmail-search-first-slice.md) recommends prioritizing search next and records the API/IMAP decision. It does not authorize a new Google connection.

## Next work and boundaries

1. Resolve N25 within the existing Send & Archive reliability requirement. Explicit offline state should produce a prompt result without invoking send or archive; a later explicit retry is permitted only because no send was attempted. Preserve the lock after every actual send attempt.
2. Finish investigating label membership and safe message mapping through supported Thunderbird interfaces. Native Copy To / Move To evidence establishes a limited route, not a complete picker contract.
3. Investigate Gmail search separately. If supported interfaces are insufficient, present the smallest integration design and its access/cost tradeoffs for explicit approval.
4. Qualify sidebar, rows and keyboard independently rather than introducing one large privileged UI change.

Small product specs should each state goal, affected UI/behavior, exclusions, failure/disable behavior and native acceptance checks. Defer AI, hosted push, a mobile client, profiles, notification scheduling, templates, server filter/category management and broader conversation/compose reshaping until separately approved.

The earlier proposed reusable local outcome verifier remains unimplemented. It is useful verification tooling, but it is not a substitute for the approved Gmail product requirements.
