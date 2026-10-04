# Release status: 0.1.3 development

Pre-release foundation, not complete MVP 0.1. Installed and exercised natively on macOS 27.0.1 with Thunderbird 157.0.1, against a local POP/SMTP fixture and an owner-authorized Gmail account in a disposable profile. Gmail testing used only synthetic self-addressed messages. VoiceOver, the dark theme and multi-window targeting remain unverified. Evidence: [independent audit](audit/2026-10-03-independent-audit.md), [0.1.3 native verification](audit/2026-10-04-native-0.1.3.md) and [Gmail verification](audit/2026-10-04-gmail-0.1.3.md). Published prerelease remains 0.1.2; PR #3 is open.

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
| Send & Archive | Off by default; confirmed send, then the conversation in the original's folder | NV (POP and Gmail synthetic paths) | Other configurations; ambiguous send scenarios |
| Label/tag picker | Thunderbird tags, partial outcomes, leave unchanged | NV for tags; existing Gmail label preserved on archive | Gmail label picker remains absent |
| Simplified compose | Native compose retained | M | Native visual simplification |
| Unified inbox | Native selections; Unified Inbox needs its folder-pane mode on | P | Mixed-account testing |
| Sender/account visibility | Recipient-match/account-default suggestion; concrete From shown | NV for tested alias case | Advanced native heuristics such as catch-all identities |
| Safe disable/reset | Disable restores stock UI; local reset; no new layout writes | NV disable | Reset and legacy recovery natively |

Development checks: 121 Node tests and 8 Python tests, resource/import validation and deterministic packaging. Both CI checks passed at `197b3c2`.

0.1.3 development: N18 is Fixed-N for the exercised POP/Gmail identity and Send & Archive paths; N19 passed for palette/tag-picker Escape on this environment. N13 (no theme preview images) remains open. The Gmail smoke-test gate passed; a limited core-workflow trial is supported, with Send & Archive kept off unless deliberately enabled. Phase 2/3 features remain out of scope.
