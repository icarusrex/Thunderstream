# Native Quick Open 0.1.5 qualification

Date: 2026-10-06. Source `935d472051f0d2c7101083a27b1415224ea9bda5`, `codex/native-navigation`; Thunderbird 157.0.1/macOS 27.0.1. Existing disposable profile: Thunderstream Gmail Test. Core SHA-256: `76d254fa948264e656df66248ae192cc9b2cf72fe323974931bfafeb9d8bdf02`.

## Scope and fixture

The improvement adds ordinary folders and native Favorites to Quick Open. It retains account context and fresh folder/mode resolution. It does not change the native renderer, row styles, layout preferences, Google access or mail mutation behavior.

Used the existing Local Folders synthetic-message probe and one newly created empty nested local folder, `TS Navigation 20261006`, marked Favorite through Thunderbird's native menu. No real message was acted on. The local empty fixture and its Favorite flag remain for repeatable navigation qualification.

## Observed acceptance

- Old 0.1.4 palette lacked the synthetic ordinary-folder destination; only Quick Filter was offered.
- 0.1.5 displayed the nested returned path, Local Folders account and current marker; Favorite appeared once.
- Enter opened the empty nested Favorite in the originating native mail tab (0 Messages).
- favorite filtering, Down/Up selection and Escape dismissal passed without message mutation.
- Ordinary parent-folder Enter navigation restored the original synthetic message folder (1 Message).
- Native vertical panes, Cards/Table choices and table subject/correspondent/date metadata remained usable; Cards restored.
- Core disable removed its native action buttons; native Cards/read controls remained usable. Re-enable restored core 0.1.5.
- Exact-profile relaunch restored core 0.1.5; Favorite persisted, Enter navigation and toolbar invocation from the empty folder passed.

The old installed 0.1.4 behavior and the new 0.1.5 behavior were observed against the same local fixture. After update, Add-ons Manager reported 0.1.5. The installed XPI hash equals dist and the tested source payload. The same bytes remained installed through disable/re-enable and restart.

## Build and review evidence

146 Node tests, 11 helper Python tests and 10 package Python tests pass, plus resource and whitespace validation. The new discovery cases failed first (5 expected failures), then passed; the new stale/account/mode cases failed first (7 expected failures), then passed. Logs: [delivery Node](../builds/2026-10-06-navigation-logs/delivery-node.log), [helper](../builds/2026-10-06-navigation-logs/delivery-helper.log), [package](../builds/2026-10-06-navigation-logs/delivery-package.log), [resource validation](../builds/2026-10-06-navigation-logs/delivery-validator.log), [discovery RED](../builds/2026-10-06-navigation-logs/task1-red.log), [fresh-resolution RED](../builds/2026-10-06-navigation-logs/task2-red.log).

The independent whole-branch review (`origin/main e20dd1e` through `935d472`) found no actionable defect, including carried local auth/theme changes. It approved native deployment and qualification; the review alone did not establish release readiness.

## Review boundary decisions

- Native keyboard/rendering/disable/restart were reviewed through actual qualification in this session. The broader frontend matrix remains separate. Cost of extending this evidence incorrectly: regressions on untested layouts/builds.
- Live Google expiry/revocation and Keychain recovery stay explicitly open. Local helper tests are not proof of those live cases. Cost of claiming them closed: misleading everyday-use readiness.
- Rows/sidebar redesign, unmodified keys and untested Thunderbird versions remain unfinished/unqualified. Cost of treating this navigation slice as the full frontend: unsupported interface behavior.

## Restart execution issue

The registered profile launch produced a running test process without an observable window; the computer-control connection reported `noWindowsAvailable`. Relaunching the exact test-profile path with Thunderbird's command-line profile argument restored the expected window. The visible 0.1.5 manager state, restored synthetic fixture, persisted Favorite and successful Enter navigation establish the functional restart result. This records the execution issue without attributing it to the core.

## Limits and next action

Navigation is qualified for the exercised synthetic scope on 157.0.1. No broad production-mail trial, native IME/VoiceOver/large-text/multi-window matrix or revised Light palette qualification is inferred. Existing live authentication and Send & Archive failure gaps stay open. Next F01 step: qualify the remaining native frontend matrix before choosing any exact-build row/sidebar hook.

Structured evidence: [navigation delivery record](../builds/2026-10-06-navigation.json). Plan: [native navigation](../superpowers/plans/2026-10-06-native-navigation.md).
