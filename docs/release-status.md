# Release status: 0.1.3 foundation and 0.1.4 search preview

## Unreleased 0.1.4 Gmail API search

The optional Mac helper and Search Gmail page implement a one-account read-only Google connection, literal Gmail queries, All Mail/label scope, captured pagination and exact Gmail-ID retrieval for native server-copy viewing. No credentials are included in packages. The owner-authorized OAuth connection, Keychain reconnect and live search/fetch for one synthetic labeled message passed in a disposable profile. There is no publicly released Google-connected build.

133 Node tests, 8 native-helper Python tests and 10 package-validation Python tests pass, as do resource validation, packaging and whitespace checks. A real helper subprocess verified framing and missing-client handling. A browser fixture exercised the production page and service with synthetic results: search, paging, query invalidation, inert HTML subjects and local disconnect. An independent review identified offline disconnect and retired-port recovery defects; both were reproduced and fixed, alongside changed-account access-cache handling.

Native Thunderbird File display, Keychain refresh/disconnect, archived or uncached search, duplicate Message-ID behavior and revoked-access recovery remain unverified. This feature is not yet qualified for everyday use. Read-only scope does not establish native mailbox association or sender selection for opened server copies. See [setup](gmail-search-setup.md), [privacy](privacy.md), the [live test record](audit/2026-10-04-gmail-search-live.md) and the [implementation plan](superpowers/plans/2026-10-04-gmail-api-search.md).

## Earlier 0.1.3 native evidence

The [current owner-approved product scope](current-scope.md) maps the six Mimestream priorities to the existing backlog and separates the installed foundation from missing product work.

Pre-release foundation, not complete MVP 0.1. Installed and exercised natively on macOS 27.0.1 with Thunderbird 157.0.1, against a local POP/SMTP fixture and an owner-authorized Gmail account in a disposable profile. Gmail testing used only synthetic self-addressed messages. VoiceOver, the dark theme and multi-window targeting remain unverified. Evidence: [independent audit](audit/2026-10-03-independent-audit.md), [0.1.3 native verification](audit/2026-10-04-native-0.1.3.md) and [Gmail verification](audit/2026-10-04-gmail-0.1.3.md). Published prerelease remains 0.1.2; 0.1.3 foundation changes are merged but unreleased.

NV = natively verified, P = partial, M = missing.

| MVP scope | Current implementation | Native | Remaining gap |
|---|---|---|---|
| Stock Thunderbird | Independent core/theme packages; no fork or mail engine | NV (POP/SMTP and Gmail SMTP/IMAP) | Other providers and broader production trial |
| Theme | Light/dark colours | NV light | Dark not run; native spacing, typography and rows |
| Three-pane layout | Legacy restore data retained; new writes blocked | M | Owner decision: layout vs safe disable |
| Clean sidebar | Inactive companion scaffold | M | Destinations, More, pins, native hooks |
| Compact message list | Density setting disabled | M | Native rows/preview/thread treatment |
| Keyboard triage | Palette plus user-assigned chord; no default shortcuts | P | Single-key triage (companion) or drop it |
| Command palette | Toolbar and message-header button, navigation, tag filter, Quick Filter search | NV for implemented scope, including Escape on palette/tag picker | Global invocation |
| Archive-first workflow | Native archive command on captured selection | P; Gmail archive destination verified through Send & Archive | Direct shortcut; standalone Gmail archive command |
| Send & Archive | Off by default; confirmed send, then the conversation in the original's folder; explicit offline preflight | NV successful POP/Gmail paths; local 550/451, cancelled subject, double-click, queued-mail archive guard and offline no-op | Native same-compose reconnect/retry; Sent-copy/archive failure and closing during send |
| Label/tag picker | Thunderbird tags, partial outcomes, leave unchanged | NV for tags; existing Gmail label preserved on archive | Gmail label picker remains absent |
| Simplified compose | Native compose retained | M | Native visual simplification |
| Unified inbox | Native selections; Unified Inbox needs its folder-pane mode on | P | Mixed-account testing |
| Sender/account visibility | Recipient-match/account-default suggestion; concrete From shown | NV for tested alias case | Advanced native heuristics such as catch-all identities |
| Safe disable/reset | Disable restores stock UI; local reset; no new layout writes | NV disable/re-enable and restart on Gmail | Reset and legacy recovery natively |

Development checks: 124 Node tests and 8 Python tests, resource/import validation and deterministic packaging. Earlier CI passed at `1a09129`; current changes require CI on the new revision.

0.1.3 development: N18 is Fixed-N for the exercised POP/Gmail identity and Send & Archive paths; N19 passed for palette/tag-picker Escape on this environment. N25 is Fixed-N for explicitly offline preflight on the tested build: zero send attempts, deliveries, queued messages or folder changes. Native same-compose reconnect/retry remains unverified. N13 (no theme preview images) remains open. The Gmail smoke-test gate passed; a limited core-workflow trial is supported, with Send & Archive kept off outside deliberate tests while other ambiguous-send cases remain open. See the [reliability continuation](audit/2026-10-04-reliability-0.1.3.md) and [N25 correction](audit/2026-10-04-n25-offline-guard.md). Phase 2/3 features remain out of scope.
