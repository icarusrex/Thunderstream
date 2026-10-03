# Release status — 2026-10-03

Audit-remediated foundation 0.1.1, not complete MVP 0.1. No Thunderbird or macOS smoke test has run. Tests establish program/package behavior, not installability or native compatibility.

| MVP scope | Current implementation | Remaining gap |
|---|---|---|
| Stock Thunderbird | Independent core/theme packages; no fork or mail engine | Install/load/update/disable testing |
| Theme | Light/dark colors | Native spacing, typography and rows |
| Three-pane layout | Legacy restore data retained; new writes blocked | Reliable disable cleanup and full layout |
| Clean sidebar | Inactive companion scaffold | Destinations, More, pins, native hooks |
| Compact message list | Density setting disabled | Native rows/preview/thread treatment |
| Keyboard triage | No shortcut defaults; dormant single-key guards | Verified native keyboard profile |
| Command palette | Accessible toolbar popup | Global invocation and standalone messages |
| Archive-first workflow | Prominent native archive command, captured selection | Native/Gmail destination tests |
| Send & Archive | Off by default; confirmed send then original-message archive; uncertain send locked | Conversation-wide archiving, native send-check tests |
| Label/tag picker | Thunderbird tags, partial outcomes, leave unchanged | Gmail label behavior |
| Simplified compose | Native compose retained | Native visual simplification |
| Unified inbox | Uses native account/message selections | Native mixed-account testing |
| Sender/account visibility | Explicit alphabetic sender choice; compose identity shown | Native reply identity defaults in palette |
| Safe disable/reset | Local reset; no new persistent layout writes; legacy baselines retained | Legacy manual recovery and native lifecycle verification |

Development checks: **81 Node tests, 8 Python tests**, resource/import validation and deterministic packaging. No native smoke test, VoiceOver test or live mail test has run. The companion requests full experiment privilege, contains no enabled profile and is not needed for the core.

The GitHub publication contains source and XPI archives. CI is inside the source archive; it is not running as a repository workflow. See audit-remediation.md for each finding's disposition, including residual concurrency and window-targeting risks. Phase 2/3 features remain out of scope.
