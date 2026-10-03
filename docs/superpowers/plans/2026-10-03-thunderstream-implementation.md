# Thunderstream Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a packaged Thunderstream foundation, then qualify the native UI enhancements for MVP 0.1.

**Architecture:** A public-API MailExtension owns user-requested workflows. Independent themes supply appearance, and a separate optional UI compatibility add-on owns narrowly scoped native-window hooks. Thunderbird remains the mail engine.

**Tech Stack:** Plain JavaScript ES modules, HTML/CSS, Thunderbird MailExtension APIs, Node built-in test runner, Python zipfile packaging.

**Spec:** `docs/superpowers/specs/2026-10-03-thunderstream-design.md` (approved 2026-10-03).

## Global Constraints

- No fork, replacement mail view, shadow message database or persistent userChrome.css installation.
- No analytics, backend, remote scripts, credential handling or Google API scopes.
- No message-body rewriting.
- Keep the repository private initially.
- Do not assign an open-source licence without the owner's choice.
- Never test send/delete/archive against production mail.
- No application runtime verification has occurred in this planning session.
- Use actual verified Thunderbird builds to set support ranges; moving documentation labels are not tested versions.
- All commands are explicit user actions; ordinary Thunderbird Send and synchronization remain untouched.

## Review Focus

- Selection changes or a disappearing message during a bulk action must not target unrelated mail (Task 2).
- Compose cancellation, queued send or duplicate clicks must not archive prematurely or send twice (Task 5).
- Non-English inbox names and mixed-account unified views must preserve correct account context (Task 4).
- IME, nested editors and international # key layouts must not trigger triage while typing (Task 7).
- User layout changes after setup and partially attached UI hooks must survive reset/cleanup safely (Tasks 1 and 7).

## Delivery and execution

Tasks 1–6 produce a foundation pre-release. Tasks 7–9 qualify the native interface and full MVP; unsupported hooks remain disabled and unfinished stories remain explicitly listed. Execute sequentially because the adapters, selection context and command registry are shared contracts. Native execution is recommended; avoid fresh agent contexts per small component.

Remote repository creation is currently unavailable through the connected GitHub tools. Build locally first. When a private remote is available, push commits without exposing mailbox data; do not block local work on remote setup.

## Task 1: Settings, capability detection and reversible layout

**Files:** `extension/settings.js`, `extension/capabilities.js`, `extension/layout.js`, `tests/settings.test.js`, `tests/capabilities.test.js`, `tests/layout.test.js`, `package.json`.

**Interfaces:** `loadSettings(storage) -> Promise<Settings>`; `saveSettings(storage, settings) -> Promise<void>`; `detectCapabilities(api) -> Promise<CapabilityMap>`; `applyLayout(api, storage, tabId) -> Promise<void>`; `restoreLayout(api, storage, tabId) -> Promise<RestoreResult>`.

Settings schema v1: `{schemaVersion:1, keyboardEnabled:false, density:'comfortable', recentTagIds:[], uiFeatures:{}}`. Layout restoration metadata is separate from user settings so reset cannot erase it before restoration. Capability entries use `{available:boolean, reason:string}`; missing APIs never throw out of detection.

- [ ] Write failing tests: `loadDefaults` asserts keyboard disabled; `migrateInvalidSettings` asserts unsupported values normalize; `missingApiDisablesOnlyItsFeature` asserts compose still available without archive; `restorePreservesLaterUserEdit` asserts user-changed layout is not overwritten; `applyTwicePreservesOriginal` asserts a second apply does not overwrite the first baseline.
- [ ] Run `node --test tests/settings.test.js tests/capabilities.test.js tests/layout.test.js`; expect failure before implementation.
- [ ] Implement the interfaces using storage.local, runtime.getBrowserInfo and public mailTabs methods. Recommended layout is vertical with folder and reading panes visible. Record only touched fields, including Thunderbird's application-wide layout effect.
- [ ] Run the same tests; expect all pass.
- [ ] Commit as `feat: add reversible settings and feature capabilities`.

## Task 2: Selection snapshot and native triage

**Files:** `extension/mail-adapter.js`, `extension/selection.js`, `extension/triage.js`, `tests/selection.test.js`, `tests/triage.test.js`.

**Interfaces:** `captureSelection(api, tabId) -> Promise<{tabId:number,messageIds:number[]}>`; `validateSelection(api, snapshot) -> Promise<number[]>`; `executeTriage(api, action, snapshot) -> Promise<ActionResult>` where action is `archive|star|unread|trash` and ActionResult is `{ok:boolean,code:string}`.

- [ ] Write failing tests: `consumeAllSelectionPages` asserts three pages are included once; `staleSelectionAborts` asserts a changed selection causes no mutations; `missingMessageAborts` asserts vanished IDs are not replaced; `archiveUsesNativeApi` asserts messages.archive receives the snapshot IDs; `trashIsNotPermanent` asserts the verified API deletion option requests normal trash behaviour; `starTogglesPerMessage` asserts mixed states toggle individually.
- [ ] Run `node --test tests/selection.test.js tests/triage.test.js`; expect failure.
- [ ] Verify exact current messages, mailTabs and permission schemas in official docs. Implement pagination and revalidation. Do not reinterpret partial bulk failures as atomic success; return a concise failure code and avoid automatic retries of mutations.
- [ ] Run the same tests; expect all pass.
- [ ] Commit as `feat: add native archive and safe selection triage`.

## Task 3: Command registry, palette and core packaging

**Files:** `extension/manifest.json`, `extension/background.html`, `extension/background.js`, `extension/commands.js`, `extension/ui/palette.html`, `extension/ui/palette.js`, `extension/ui/base.css`, `tests/commands.test.js`, `scripts/package.py`, `scripts/validate.py`.

**Interfaces:** `createCommands(api, services) -> Command[]`, where Command is `{id,title,keywords,available,run(context)}`; `filterCommands(commands, query) -> Command[]`; context is `{tabId:number,selection?:SelectionSnapshot}`. Background captures originating mail/compose tab before opening any extension surface; never mistake the palette tab for the source.

- [ ] Write failing tests: `queryRanksCommonCommands` asserts archive and compose rank above settings for empty query; `paletteRetainsSourceTab` asserts action uses its originating tab; `disabledCommandDoesNotRun` asserts unsupported commands cannot mutate; `maliciousTextRendersAsText` asserts command/query content is not interpreted as HTML.
- [ ] Run `node --test tests/commands.test.js`; expect failure.
- [ ] Implement a browser-action palette, native compose/reply commands and a modifier shortcut with conflict documentation. Use textContent, arrow navigation, Enter and Escape. Use a supported manifest/background format after checking target API compatibility; provisional minimum versions must be labelled unverified. No remote assets. Add permission rationale for every actual manifest permission.
- [ ] Run tests plus `python3 scripts/validate.py` and `python3 scripts/package.py`; expect validated manifest references and `dist/thunderstream-core.xpi` containing manifest.json at archive root.
- [ ] Commit as `feat: package core extension with command palette`.

## Task 4: Tags, account navigation and settings UI

**Files:** `extension/tags.js`, `extension/accounts.js`, `extension/ui/tags.html`, `extension/ui/tags.js`, `extension/ui/settings.html`, `extension/ui/settings.js`, `extension/ui/help.html`, `tests/tags.test.js`, `tests/accounts.test.js`.

**Interfaces:** `applyTagDelta(api, snapshot, {add:string[],remove:string[]}) -> Promise<ActionResult>`; `listInboxDestinations(api) -> Promise<Destination[]>`, where Destination is `{accountId,name,folderId}`; registry adds `tags`, account inbox destinations, `settings`, `apply-layout` and `restore-layout`.

- [ ] Write failing tests: `tagDeltaPreservesOtherTags` asserts unrelated tags survive; `removeTagNeverDeletes` asserts no delete call; `deletedTagIsRejected` asserts stale tags are rejected; `localizedInboxUsesFolderType` asserts Portuguese/Czech inbox names work; `unifiedSelectionUsesOriginalAccount` asserts each message retains its native ID/account context.
- [ ] Run `node --test tests/tags.test.js tests/accounts.test.js`; expect failure.
- [ ] Implement current tag discovery through the verified tag API, searchable multi-selection, recent valid tag ordering and explicit add/remove behaviour. Navigate to inbox by metadata, and leave unified inbox implementation native. Settings expose feature status, keyboard opt-in, help, reset and layout restoration. Identity changes remain native.
- [ ] Run the same tests; expect all pass.
- [ ] Commit as `feat: add tag picker and native account navigation`.

## Task 5: Explicit Send & Archive

**Files:** `extension/send-and-archive.js`, `extension/ui/compose.html`, `extension/ui/compose.js`, `tests/send-and-archive.test.js`; modify manifest and command registry for compose action and necessary permissions.

**Interfaces:** `createSendAndArchive(api) -> {run(tabId):Promise<ActionResult>}`. The instance owns an in-flight map per compose tab. Capture relatedMessageId before send. Only explicit action invocation enters this path.

- [ ] Write failing tests: `successfulImmediateSendArchivesOriginal` asserts one sendNow call and one archive call; `failedSendDoesNotArchive` asserts zero archives; `queuedSendDoesNotArchive` asserts zero archives; `duplicateClickDoesNotSendTwice` asserts one send; `archiveFailureDoesNotResend` asserts one send and result code `sent-archive-failed`; `missingRelatedMessageDisablesAction` asserts no send from this combined action; `closedComposeStillUsesCapturedOriginal` asserts no dependency on rereading a closed tab.
- [ ] Run `node --test tests/send-and-archive.test.js`; expect failure.
- [ ] Implement explicit compose action, configurable modifier shortcut, immediate mode, verified send completion and concise outcomes. Display `Sent; original message could not be archived` for post-send archive failure. Do not register a vetoing onBeforeSend listener. Keep native From visible; help states original-message archive scope.
- [ ] Run the same tests; expect all pass.
- [ ] Commit as `feat: add send and archive with confirmed-send gating`.

## Task 6: Themes and foundation release documentation

**Files:** `themes/light/manifest.json`, `themes/dark/manifest.json`, `README.md`, `docs/permissions.md`, `docs/compatibility.md`, `docs/keyboard.md`, `.github/workflows/check.yml`; modify packaging script.

**Interfaces:** Packaging emits independent `thunderstream-light.xpi` and `thunderstream-dark.xpi` beside core. No theme dependency on the core.

- [ ] Add failing package validation asserting no missing files, no executable content in themes, no Google scopes, and no remote script URLs. Validate documented theme properties against official schemas.
- [ ] Run `python3 scripts/validate.py`; expect failure before themes exist.
- [ ] Implement neutral light/dark theme colours, restrained teal selection accents and documentation. Mark core as foundation/pre-release and every runtime compatibility row `not tested` until real evidence exists. CI uses a supported Node LTS, built-in runner and Python packaging without runtime npm dependencies.
- [ ] Run `node --test tests/*.test.js`, `python3 scripts/validate.py` and `python3 scripts/package.py`; expect pass and three independent XPIs.
- [ ] Commit as `feat: add independent themes and foundation packaging`.

## Task 7: Isolated UI compatibility bridge and keyboard lifecycle

**Files:** `ui-compat/manifest.json`, `ui-compat/background.js`, `ui-compat/api/schema.json`, `ui-compat/api/implementation.js`, `ui-compat/keyboard.js`, `ui-compat/profiles.js`, `tests/keyboard.test.js`, `tests/ui-lifecycle.test.js`; modify core external-message handler and packaging.

**Interfaces:** `shouldHandleKey(event, context) -> boolean`; `resolveKey(event) -> string|null`; `attachHooks(window, profile, emit) -> cleanupFunction`; `selectProfile(version, probes) -> Profile|null`. Bridge payload is `{type:'command',commandId,windowId}`; only the exact declared companion extension ID is accepted. Settings/capability payloads contain no arbitrary selectors or JavaScript.

- [ ] Write failing tests: `nestedEditorIgnored`, `imeIgnored`, `modifierChordIgnored`, `hashWithShiftRecognized`, `unsupportedVersionAttachesNothing`, `partialAttachCleansUp`, `repeatAttachDoesNotDuplicate`, `untrustedSenderRejected`, `unsupportedCommandNotConsumed` and `shutdownRestoresNativeKeys`; assert no command events or leaked listeners in rejected/cleaned-up cases.
- [ ] Run `node --test tests/keyboard.test.js tests/ui-lifecycle.test.js`; expect failure.
- [ ] Inspect exact Thunderbird UI source for chosen test versions. Implement narrow experiment lifecycle, bounded bridge and opt-in keyboard mode. Implement J/K only against actual displayed selection ordering when verified. Unknown versions have no enabled profiles. Document experiment full-access implications and lack of optional permission isolation.
- [ ] Run the same tests plus package validation; expect pass. Native profile enablement remains blocked until Task 9's runtime evidence.
- [ ] Commit as `feat: isolate native keyboard hooks in optional companion`.

## Task 8: Reversible native visual enhancements

**Files:** `ui-compat/styles/chrome.css`, `ui-compat/appearance.js`, `tests/appearance.test.js`, `docs/ui-selectors.md`; modify hook profiles and compatibility documentation.

**Interfaces:** `attachAppearance(window, profile, settings) -> cleanupFunction`; selectors are supplied exclusively by checked-in version profiles. CSS classes and nodes are namespaced `thunderstream-`.

- [ ] Write failing tests: `missingSidebarDisablesOnlySidebar`, `stylesRemovedOnCleanup`, `senderAndWarningsRemainVisible`, `allFoldersRemainReachable`, `densityChangesOnlyChrome`; assert no message-body nodes change and no residual style nodes remain after cleanup.
- [ ] Run `node --test tests/appearance.test.js`; expect failure.
- [ ] Implement compact/comfortable density, sidebar simplification with native More access, subdued compose chrome and optional palette overlay only for selectors verified against the target builds. Document each selector and failure fallback. Never fabricate row previews by extracting bodies. Unsupported enhancements stay marked incomplete.
- [ ] Run the same tests; expect pass.
- [ ] Commit as `feat: add reversible native appearance hooks`.

## Task 9: Native compatibility qualification and release evidence

**Files:** `docs/smoke-test.md`, `docs/release-status.md`; modify supported profiles and manifest ranges only after verified results.

**Interfaces:** Evidence rows contain exact OS, Thunderbird build, package commit, test scenario, result and observed limitation. No test row defaults to pass.

- [ ] Write executable smoke instructions for isolated test profiles and dummy/test Gmail + IMAP accounts: startup, load, inbox, message, compose/identity, native send success/failure, queued-send behaviour, archive destinations, tag picker, mixed-account unified view, palette focus, typing guards, resizing, fullscreen, light/dark, disable/re-enable and cleanup.
- [ ] Run all Node tests, package validation and archive checks. Record exact counts and outcomes.
- [ ] Execute the smoke matrix on available actual macOS ESR and release builds. If no macOS Thunderbird runtime is available, leave those rows `not tested`, do not enable unverified hooks, and deliver the foundation as pre-release with that limitation.
- [ ] Set supported ranges only for builds with evidence. Update release status with implemented, unavailable and unverified TS requirements; full MVP requires actual macOS evidence.
- [ ] Commit as `docs: record compatibility evidence and release status`.

## Plan self-review

The architecture, reversible settings, public API preference, command palette, triage, tags, compose and themes have explicit tasks. UI enhancements are separated from the core and gated by native evidence. Review Focus conditions are assigned to their owning tests. Later-phase templates, profiles, Gmail API search, notification rules and cross-folder conversation archiving are intentionally excluded. Exact version support and native UI selectors are decided from verified target builds during execution, rather than invented in this plan.
