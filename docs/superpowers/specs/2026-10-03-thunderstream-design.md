# Thunderstream — initial architecture and release design

Status: historical architecture design, followed by a foundation implementation and independent audit. Native verification is outstanding. The original user specification in ../../original-spec.md remains authoritative; deviations below are limitations, not amendments to requirements.

## Purpose and constraints

Build a macOS-focused productivity layer on official Thunderbird: a cleaner three-pane interface and faster inbox processing for Google Workspace and ordinary IMAP accounts. Preserve Thunderbird as the owner of updates, authentication, synchronization, storage, rendering, sending, calendars, contacts and account configuration. Removing every Thunderstream component must leave a usable mailbox and unchanged account credentials.

The supplied TS stories are the product backlog. This design determines implementation boundaries; it does not claim every desired UI behaviour is available through public APIs.

## Alternatives and decision

1. Public APIs and themes only: lowest maintenance, but limited control over native chrome and global unmodified keyboard shortcuts.
2. Public API core, independent themes, separate optional UI compatibility add-on: recommended. Native workflow actions survive failure of custom UI hooks. The compatibility add-on can be disabled independently and exposes its broader access honestly.
3. One extension with embedded privileged hooks: fewer installation steps, but combines permissions and failure domains. Reject for the initial architecture.

No fork, replacement mail view, shadow message database or persistent userChrome.css installation. A separate UI add-on is an implementation refinement of the requested minimal optional UI customisation. If its feasibility checks fail, preserve the public core and report the incomplete UX requirements.

## Components

### Core MailExtension

Use plain JavaScript modules and HTML/CSS with no runtime framework. Route user actions through a small command registry, Thunderbird API adapter and feature capability registry. Extension pages contain the command palette, searchable tag picker, settings and help. Native message display and compose windows remain authoritative.

Core actions: compose, reply, reply-all, forward, archive, toggle star, mark unread, trash, apply/remove existing Thunderbird tags, select an account inbox and open settings. Selection is captured when an action begins and revalidated before a destructive operation. Multi-message actions consume every page of a Thunderbird MessageList. Never infer a message ID from a row position.

The palette is available through an action button and a registered modifier shortcut. Cmd+K is the desired shortcut; check conflicts and supply a configurable fallback rather than silently displacing Thunderbird behaviour. Within extension-owned pages, regular DOM keyboard handling is safe. Native-window single-key handling is delegated to the UI add-on.

### Themes

Produce independent light and dark theme packages using documented theme properties. Use neutral surfaces, system typography where available, restrained teal accents, clear focus and selection. Themes do not promise row previews, native sidebar reconstruction or compose-toolbar geometry. Automatic theme switching is a later capability unless verified independently.

### Optional UI compatibility add-on

Own native-window key interception, reversible chrome styles and any native palette overlay. Communicate with the core through explicit allowlisted command messages; reject arbitrary code, selectors and unsupported senders. Privileged hooks must not send or synchronize mail directly.

Each hook has its own supported-version range, DOM probes, attachment and cleanup function. Unknown versions disable unvalidated hooks. Missing selectors disable that hook, not the module or Thunderbird. The add-on requires a separate capability and permission explanation because experiments provide broader application access than ordinary extension APIs.

Keyboard handling is opt-in. Ignore editable controls, contenteditable, composition/IME events, modifier chords and unrelated windows. Inspect the full event path and active editor state. Consume an event only when its command is supported and applicable. J/K move within Thunderbird's actual displayed ordering, including threads and filtered views; do not synthesize ordering from an independent query. Disable J/K if safe selection navigation cannot be verified. A means reply-all only when keyboard mode owns the event; vanilla A behaviour returns when disabled. Test # on common macOS keyboard layouts.

No startup observers block Thunderbird. No Send interception or onBeforeSend veto is needed. All listeners, style nodes and injected controls are removed on shutdown. A privileged hook cannot be proven harmless under every possible bug; independent packaging and strict scope reduce exposure rather than guarantee it.

## Workflow semantics

### Archive and trash

Archive delegates to Thunderbird's archive API and account configuration. Never hardcode a Gmail All Mail destination or reinterpret archive as delete. Trash uses native non-permanent deletion; permanent deletion is out of scope. If archiving is unavailable or fails, report it and retain the message.

### Send & Archive

An explicit compose action uses Thunderbird's send API; ordinary Send is untouched. Capture the original related message before initiating send and prevent duplicate action execution for the same compose tab. The foundation currently archives only the replied-to message. This does not satisfy TS-203 conversation archiving. Keep it an explicit release blocker until safe native inbox-thread capture and revalidation are implemented and verified.

Use immediate send mode and verify the reported completion mode. A queued Outbox item, cancelled send, server failure, ambiguous result or missing related message does not trigger archive. Never treat a generic resolved send Promise as proof of sending: default mode may queue offline mail. If send succeeds but archive fails, display 'Sent; original message could not be archived'. Never retry sending to repair archive failure. In-flight archive correlation is local and short-lived; loss on shutdown leaves mail unarchived rather than guessing.

### Tags versus Gmail labels

The MVP picker edits existing Thunderbird tags. Clearly call them tags; do not present them as Gmail server labels. Gmail's IMAP folder presentation remains under Thunderbird. Cross-folder copying, removing a Gmail label and server-label synchronization require separate verified semantics. Removing a tag must never delete a message. Preserve existing tags not changed by the user.

### Search, accounts and inbox

Preserve Thunderbird's search and unified-folder implementation. Use supported navigation where verified; do not create a second inbox index. Account inbox navigation uses account/folder metadata rather than localized folder names. Keep sender identity visible and never silently change it. Search syntax translation and Gmail API search are outside the first release.

## Appearance and reversible configuration

Offer an explicit 'Apply recommended layout' action rather than changing every window silently at startup. Public mailTabs layout changes may affect all mail tabs. Record only the previous presentation values touched by Thunderstream. Reset restores values only where the current value still matches the Thunderstream-applied value, so subsequent user edits survive. Extension settings reset never changes credentials, identities, server settings or archive configuration.

CSS affects window chrome only. It must not hide the sender, security/encryption indicators, attachment warnings, send errors or essential account controls. No message-body rewriting. Essential hidden controls remain reachable in native menus. Automatic disable cleanup applies to injected styles and controls; native saved layout settings require the explicit restore command and remain usable even if retained.

The custom sidebar and compact native rows are compatibility-dependent release requirements, not capabilities supplied by a standard theme. Retain access to all native folders and account management. The original wish for every row to include a preview is subject to a native-widget feasibility check; do not extract/cache message bodies just to fake this feature.

## Permissions and data

Use storage for settings, accountsRead for account/folder discovery, messagesRead for selection and related-message metadata, messagesUpdate for read/star/tag changes, messagesMove for archiving, compose for native drafts and compose.send for the explicit Send & Archive action. Verify exact permissions against the selected target API schema before writing the manifest. Add deletion and other permissions only to implemented features. Request optional permissions where supported; otherwise split or defer functionality rather than claiming per-feature permission isolation.

No analytics, backend, remote scripts, credential handling or Google API scopes. Do not fetch message bodies for the initial workflows. Broad API permission names still permit more access than the code uses; explain that distinction in the permission documentation. Logs contain capability names and error categories, not message bodies, addresses or subjects.

Settings use a versioned local schema with migration and defaults. Store display preferences, keyboard opt-in and recent tag IDs only. No duplicate read-state, label-state, folder-state or unread-count database. Account/folder IDs are revalidated after profile changes.

## Project structure to implement after approval

- extension/: core manifest, background entry, API adapters, commands, capability registry, settings, palette, tag picker and compose action.
- themes/light/ and themes/dark/: independent theme manifests.
- ui-compat/: separate experiment manifest, narrow API schema, hook implementation, version profiles and cleanup.
- tests/: meaningful unit and integration fixtures for action correctness, settings and hook cleanup.
- scripts/: dependency-light validation and XPI packaging.
- docs/: architecture, permission rationale, installation, keyboard help, compatibility matrix, smoke-test evidence and supplied TS backlog.

Use Node's built-in test runner where practical. Packaging can use Python's zipfile to avoid a bundler. Do not assign an open-source licence without the owner's choice. Repository visibility follows the owner’s instructions; privacy remediation status is documented separately.

## Delivery sequence and gates

Foundation: version/capability detection, independent packaging, reversible settings and API adapters.

First usable core: action palette, archive/star/unread, native reply and compose, tag picker, native account navigation, explicit layout setup and themes.

Send & Archive: implement only with failed-send, queued-send, duplicate-click and archive-failure tests.

Compatibility work: prove safe native keyboard interception and full cleanup first; then sidebar, density and compose chrome, each behind its own feature switch.

MVP 0.1 is complete only when the desired UI requirements pass on actual macOS Thunderbird. Before that, distribute a clearly marked foundation/pre-release. Unsupported global palette or sidebar hooks cannot be counted as completed stories merely because extension pages look correct.

## Verification

Unit tests cover stale selections, multi-page selections, tag preservation, Send & Archive outcomes, duplicate execution, settings migration and conditional restoration. UI-hook tests cover editing/IME guards, unsupported versions and repeated attach/cleanup.

Native smoke tests use isolated disposable Thunderbird profiles with a Gmail test account and ordinary IMAP test account. Never test send/delete/archive against production mail. Verify startup, load, inbox, message display, compose, sender identity, successful and failed send, native archive destination, palette, mixed-account unified inbox, disable/re-enable and all-hook cleanup. Repeat on the chosen supported ESR and release builds; record exact versions and OS. The eventual minimum/maximum manifest versions follow verified builds, not today's moving documentation labels.

CI validates packages and tests pure logic. It does not establish native macOS compatibility. No application runtime verification has occurred in this planning session.

## Publication status

The initial foundation was published as a source ZIP and four XPIs. The CI file inside the ZIP was not an active repository workflow. The original publication has been temporarily made private during commit-email remediation. Connector write access is still unavailable; see the current audit-remediation document for delivery state.

## Official references checked

- Thunderbird mailTabs: https://webextension-api.thunderbird.net/en/mv2/mailTabs.html
- Thunderbird compose: https://webextension-api.thunderbird.net/en/mv2/compose.html
- Thunderbird commands: https://webextension-api.thunderbird.net/en/mv2/commands.html
- Shortcut format: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands
- Thunderbird experiments: https://developer.thunderbird.net/add-ons/mailextensions/experiments

These establish the public/experiment boundaries. Exact target-version behaviour remains a runtime verification requirement.
