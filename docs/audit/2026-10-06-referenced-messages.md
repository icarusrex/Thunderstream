# Referenced messages and native reading contract

## Decision and implemented boundary

C01's first deliverable is explicit same-folder reference navigation. A capability-gated Quick Open command captures exactly one freshly checked selected/displayed message and opens a local metadata page. The page labels the selected message, shows unique explicit References/In-Reply-To matches with subject/sender/date, displays original account/folder and explains missing, duplicate, unavailable and truncated results. It excludes newer replies, other folders and subject-only matches. This is not a complete conversation membership or aggregate reader.

Opening a listed item rechecks account/folder/RFC identity, its membership in the returned allowlist, the anchored original and current unique reference resolution. It delegates the exact native message ID to Thunderbird in the captured window. Reader rendering, attachments, remote-content/encryption controls, per-message Reply/Reply All/Forward and read/star behavior remain native. No new mail mutation controls, layout writes, identities, helper access or permissions are introduced. Existing Send & Archive ancestry behavior is unchanged.

The page owns a five-minute token bound to its returned tab/window. Initial requests wait for native tab creation to bind the owner. A later mail selection does not retarget the anchored list; closing the navigator or expiry invalidates it. IDs are transient, stored only in this runtime session, and are not claimed durable. Lookup and opening requests are serialized per view; async close/expiry/stale checks discard unusable results.

## Native API evidence

The installed Thunderbird 157.0.1 message schema and implementation expose `messages.getHeaders`. Its source parser uses `bodyFormat: "none"` and returns header information without using the full-message/decryption path. The service requires that API and never calls getFull or a helper fallback. On older supported builds without this capability only the new command is unavailable; other core features remain available. [Official messages API](https://webextension-api.thunderbird.net/en/mv2/messages.html).

Native `messageDisplay.open` accepts an exact messageId plus tab location, active flag and window ID. The service uses that explicit ID rather than global RFC-ID resolution. [Official messageDisplay API](https://webextension-api.thunderbird.net/en/mv2/messageDisplay.html).

Native folder threading/view grouping exists in the API surface checked, but it does not by itself supply the exact complete conversation membership needed for a new aggregate reader. Native threading and reading remain the recommended baseline. [Official mailTabs API](https://webextension-api.thunderbird.net/en/mv2/mailTabs.html). Relevant installed schema/implementation hashes are recorded in the build JSON; source inspection is not runtime qualification.

## Verification

Added 40 Node regressions covering selection, capability absence without body fallback, saved mailbox context, exact folder/account/header filtering, duplicate IDs and pagination, missing/offline/bounded lookup, owner tabs/windows/source pages, expiry/close, changed/reused/moved targets, newly ambiguous results, selection independence, native-open retry and concurrency, page metadata/keyboard-native controls and error/refresh behavior. The complete suite passes 235 Node plus 11 helper Python and 10 package Python tests: 256 total. Resource and whitespace checks pass. [Saved logs](../builds/2026-10-06-references-logs/final-node.log).

Three timing/order defects were reproduced and fixed before final review: a target moving during lookup, the page initializing before owner binding, and direct-parent omission when native header property order met the reference limit. Independent final review found no actionable defects. Rendered qualification then caught an inaccurate offline count. Unreadable source headers now show an unknown-list warning; counted unavailable notices apply only to known individual lookups. Failure/pass regressions and a bounded reviewer follow-up confirm the correction.

The reproducible fixture runs the production page and reference service with synthetic native APIs. Visible checks passed account/folder and selected/reference labels, inert markup-like metadata, exact message/window opening with Enter, Space activation and opening retry, duplicate exclusion/missing warnings, offline warning/refresh, selected-only empty state and a 375px layout without horizontal overflow. No native reader or real mail/account access occurred. [Rendered evidence](evidence-2026-10-06-references/normal.txt).

Reproduce with `python3 scripts/references-page-fixture.py /private/tmp/thunderstream-references-fixture`, serve that directory locally and open `ui/references.html`. Visible fixture links expose retry, duplicates, empty and offline cases. The browser tab/server were closed and the temporary viewport override reset.

## Package and deployment

Tested product source: `949dfe9557e230432b766aec519f535bf2d5c905`. All four deterministic packages equal their source trees. Core 0.1.9 SHA-256: `733f7b0157cfda287a3513fc4905134a98fd59e0b755504141fdf643d23a2acc`.

Stopped only the process whose arguments identified the named Thunderstream Gmail Test disposable profile. Retained core 0.1.8 for rollback, atomically installed core 0.1.9 and restarted the exact profile. Installed bytes match dist; startup metadata reports 0.1.9 active, userDisabled false, appDisabled false. [Build record](../builds/2026-10-06-references.json).

Installed reference-page/native message opening remains unqualified because computer control selects the regular-profile window. Existing installed group/search/alias/signature checks also remain open. No regular-profile deployment or public release occurred. Work continues in [draft PR #5](https://github.com/icarusrex/Thunderstream/pull/5); public prerelease remains v0.1.2.
