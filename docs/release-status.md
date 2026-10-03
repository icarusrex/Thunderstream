# Release status — 0.1.2

Pre-release foundation, not complete MVP 0.1. Installed and exercised natively on macOS 27.0.1 with Thunderbird 157.0.1, in a disposable profile against a local POP/SMTP fixture (`docs/audit/native-fixture/`). Gmail, IMAP, VoiceOver, the dark theme and multi-window targeting have not been tested natively. Full evidence: [independent audit](audit/2026-10-03-independent-audit.md).

NV = natively verified, P = partial, M = missing.

| MVP scope | Current implementation | Native | Remaining gap |
|---|---|---|---|
| Stock Thunderbird | Independent core/theme packages; no fork or mail engine | NV (POP/SMTP) | Gmail and IMAP pass |
| Theme | Light/dark colours | NV light | Dark not run; native spacing, typography and rows |
| Three-pane layout | Legacy restore data retained; new writes blocked | M | Owner decision: layout vs safe disable |
| Clean sidebar | Inactive companion scaffold | M | Destinations, More, pins, native hooks |
| Compact message list | Density setting disabled | M | Native rows/preview/thread treatment |
| Keyboard triage | Palette plus user-assigned chord; no default shortcuts | P | Single-key triage (companion) or drop it |
| Command palette | Toolbar and message-header button, navigation, tag filter, Quick Filter search | NV for implemented scope | Global invocation; Escape key check (N19) |
| Archive-first workflow | Native archive command on captured selection | P | Gmail archive destination; direct shortcut |
| Send & Archive | Off by default; confirmed send, then the conversation in the original's folder | NV (POP) | Gmail All Mail/label copies |
| Label/tag picker | Thunderbird tags, partial outcomes, leave unchanged | NV for tags | Gmail label behaviour |
| Simplified compose | Native compose retained | M | Native visual simplification |
| Unified inbox | Native selections; Unified Inbox needs its folder-pane mode on | P | Mixed-account testing |
| Sender/account visibility | Suggested identity mirrors native Reply; concrete From shown | NV | Advanced native heuristics (catch-all) |
| Safe disable/reset | Disable restores stock UI; local reset; no new layout writes | NV disable | Reset and legacy recovery natively |

Development checks: 119 Node tests and 8 Python tests, resource/import validation and deterministic packaging, run in CI on every push and pull request.

Open after 0.1.2: N18 (console noise when a popup closes before the background replies; fix pending native check), N19 (Escape under automation), N13 (no theme preview images). Real-mail use waits on one pass with a dedicated Gmail test account. Phase 2/3 features remain out of scope.
