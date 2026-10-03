# Thunderstream — original user specification

Provenance: Transcribed from the user's original project message in this conversation. Markdown formatting has been normalized; requirements and priorities are preserved. The original message ends mid-sentence in Phase 3; that ending is preserved below. This is the original product backlog, not the subsequent implementation design or a statement of completed work.

---

Thunderstream

## Product goal

Thunderstream is an opinionated macOS-focused productivity layer for Thunderbird that makes email feel faster, cleaner, and closer to a modern Google Workspace client without forking Thunderbird.

Thunderbird remains responsible for:

- application updates
- security updates
- Gmail OAuth
- IMAP
- SMTP
- local mail storage
- message rendering
- calendar
- contacts
- account management

Thunderstream should primarily consist of:

1. a Thunderbird WebExtension
2. a Thunderbird theme
3. minimal optional CSS/UI customisation where supported APIs are insufficient

Thunderstream must never become necessary for Thunderbird to send, receive, store, or recover email.

---

## Epic 0 — Architecture and safety

### TS-001 — Run on stock Thunderbird

As a user, I want Thunderstream to run on the official Thunderbird release so that I continue receiving upstream security and feature updates.

Acceptance criteria:

- Thunderstream installs as an add-on/theme.
- No Thunderbird source code is modified.
- No custom Thunderbird binary is required.
- Thunderbird can update through its normal update mechanism.
- Thunderstream can be disabled without reinstalling Thunderbird.
- Existing Thunderbird profiles remain valid.

Priority: P0

### TS-002 — Graceful failure

As a user, I want email to continue working if Thunderstream breaks so that a UI extension can never lock me out of my mailbox.

Acceptance criteria:

- Failure of Thunderstream does not prevent Thunderbird starting.
- Failure does not prevent IMAP/Gmail synchronization.
- Failure does not prevent sending email.
- Failure does not modify or corrupt Thunderbird's message database.
- Disabling Thunderstream restores vanilla Thunderbird behaviour.
- Thunderstream does not sit in the mail send/receive path.

Priority: P0

### TS-003 — Prefer public Thunderbird APIs

As a maintainer, I want Thunderstream to use supported Thunderbird APIs wherever possible so that Thunderbird updates cause minimal breakage.

Acceptance criteria:

- WebExtension APIs are preferred over internal APIs.
- Standard theme APIs are preferred over undocumented CSS.
- Unsupported/internal hooks are isolated behind a compatibility layer.
- Internal selectors are documented.
- Unsupported customisations can fail independently without breaking core functionality.

Priority: P0

### TS-004 — Compatibility detection

As a user, I want Thunderstream to detect incompatible Thunderbird versions so that unsupported UI customisations do not break the application.

Acceptance criteria:

- Extension identifies Thunderbird version at startup.
- Features that depend on incompatible APIs can be disabled individually.
- Core Thunderstream features remain available where possible.
- User receives a concise compatibility warning rather than application failure.

Priority: P1

---

## Epic 1 — Clean Mimestream-style interface

### TS-101 — Simplified three-pane layout

As a user, I want a clean three-pane email layout so that I can scan mail without Thunderbird UI clutter.

Desired structure:

Sidebar | Message list | Message

Acceptance criteria:

- Account/sidebar remains visible.
- Message list has high information density without feeling cramped.
- Reading pane is visually dominant when a message is selected.
- Unnecessary toolbars and chrome are hidden by default.
- Layout remains compatible with Thunderbird resizing and full-screen mode.

Priority: P0

### TS-102 — macOS-native visual treatment

As a Mac user, I want Thunderstream to visually fit macOS so that Thunderbird feels like a native productivity application.

Acceptance criteria:

- Consistent macOS-style spacing.
- Sensible typography hierarchy.
- Native-feeling sidebar proportions.
- Light and dark mode supported.
- Selected rows, hover states, separators, and focus states are visually consistent.
- No excessive borders or legacy desktop UI chrome.

Priority: P1

### TS-103 — Compact message list

As a user processing a large inbox, I want a compact message list so that I can scan many messages quickly.

Each row should prioritise:

- sender
- subject
- short preview
- date/time
- unread state
- star
- attachment indicator

Acceptance criteria:

- Compact and comfortable density options.
- Sender and subject remain readable at common laptop widths.
- Unread mail is clearly distinguishable without excessive visual weight.
- Threads are visually understandable.

Priority: P0

### TS-104 — Remove low-value UI

As a user, I want unused Thunderbird controls hidden so that the interface exposes only things I regularly use.

Acceptance criteria:

- Hideable controls include unused toolbars, buttons, status elements, and navigation items.
- Essential Thunderbird controls remain reachable.
- Hidden elements can be restored from Thunderstream settings.
- No Thunderbird preference is permanently destroyed.

Priority: P1

---

## Epic 2 — Fast inbox workflow

### TS-201 — Archive-first workflow

As a user, I want archiving to be the primary inbox action so that I can keep my inbox small without creating elaborate folders.

Acceptance criteria:

- Archive action is prominent.
- Archive has a keyboard shortcut.
- Archive action respects the account's configured Thunderbird behaviour.
- Gmail accounts archive rather than delete where appropriate.

Priority: P0

### TS-202 — One-key message actions

As a power user, I want common email actions accessible from single-key shortcuts so that I can process email without reaching for the mouse.

Target shortcuts:

- "J" — next message
- "K" — previous message
- "E" — archive
- "R" — reply
- "A" — reply all
- "F" — forward
- "L" — label/tag
- "S" — star
- "#" — delete
- "U" — mark unread
- "C" — compose

Acceptance criteria:

- Shortcuts do not trigger while typing in editable fields.
- User can enable/disable keyboard mode.
- Conflicts with Thunderbird shortcuts are handled explicitly.
- Keyboard behaviour is documented in a compact cheat sheet.

Priority: P0

### TS-203 — Send and archive

As a user, I want to reply and archive the conversation in one action so that completed threads disappear from my inbox immediately.

Acceptance criteria:

- "Send & Archive" available in compose/reply interface.
- Keyboard shortcut available.
- Successful send triggers archive.
- Failed send does not archive.
- Behaviour can be disabled.

Priority: P0

### TS-204 — Rapid triage actions

As a user, I want archive, delete, star, label, unread, and reply actions available directly from the message list so that I can triage without opening every message.

Acceptance criteria:

- Hover or selected-row actions available.
- Keyboard equivalents exist.
- Actions work on multiple selected messages.
- Visual design remains uncluttered until interaction.

Priority: P1

---

## Epic 3 — Command palette

### TS-301 — Global command palette

As a keyboard-oriented user, I want a command palette so that I can reach actions without memorising every menu location.

Trigger:

"⌘K"

Example commands:

Compose
Search mail
Go to Inbox
Go to Sent
Switch account
Apply label…
Move message…
Archive
Mark unread
Open settings

Acceptance criteria:

- Opens rapidly from anywhere in Thunderbird.
- Commands can be filtered by typing.
- Arrow keys navigate.
- Enter executes.
- Escape closes.
- Common commands appear before obscure commands.

Priority: P0

### TS-302 — Account switching through command palette

As a user with several accounts, I want to switch accounts from the command palette so that account navigation is fast.

Acceptance criteria:

- Typing an account name surfaces it.
- Selecting an account opens its inbox.
- Current account is visually identifiable.
- Works with Gmail and normal IMAP accounts.

Priority: P1

### TS-303 — Label navigation through command palette

As a Gmail-oriented user, I want to navigate labels quickly through the command palette so that I do not need a huge sidebar.

Acceptance criteria:

- Labels/tags are searchable.
- Selecting one opens matching mail.
- Frequently used labels appear first.
- Works without modifying Gmail storage architecture.

Priority: P1

---

## Epic 4 — Gmail-friendly labels

### TS-401 — Present Gmail labels cleanly

As a Google Workspace user, I want Gmail labels presented as labels rather than forcing me into a traditional folder mental model.

Acceptance criteria:

- Gmail labels are visually differentiated from folders where Thunderbird exposes enough information.
- Applying a label is quick.
- Removing a label does not delete a message.
- Multiple labels can be visible where Thunderbird supports the underlying behaviour.
- Thunderstream does not create its own shadow message organisation database.

Priority: P1

### TS-402 — Fast label picker

As a user, I want pressing "L" to open a searchable label picker so that applying a label takes seconds.

Acceptance criteria:

- Picker opens over current message.
- Typing filters available labels.
- Recently used labels appear first.
- Multiple labels can be selected where supported.
- Enter applies the selection.

Priority: P1

### TS-403 — Favourite labels

As a user, I want to pin a small number of labels so that my sidebar stays useful without becoming enormous.

Acceptance criteria:

- Labels can be pinned/unpinned.
- Pinned labels appear prominently.
- Full label hierarchy remains accessible elsewhere.
- Pin state is stored in Thunderstream settings only.

Priority: P2

---

## Epic 5 — Search

### TS-501 — Fast Thunderbird search entry

As a user, I want search accessible immediately from the keyboard so that finding old email feels instant.

Acceptance criteria:

- "⌘K" or dedicated search shortcut can start mail search.
- Search query field receives focus immediately.
- Results can be navigated with keyboard.
- Search remains compatible with Thunderbird's built-in search/index.

Priority: P0

### TS-502 — Search syntax helpers

As a user, I want common search filters exposed through simple syntax or chips so that I can perform precise searches without navigating dialogs.

Examples:

from:
to:
subject:
before:
after:
tag:
has:attachment

Acceptance criteria:

- Thunderstream translates supported syntax into Thunderbird searches.
- Unsupported syntax is clearly distinguished.
- Search syntax is documented inline.

Priority: P1

### TS-503 — Optional Gmail API search

As a Google Workspace user, I want an optional server-side Gmail search mode so that large Gmail mailboxes can use Google's native search capabilities.

Examples:

from:rolf newer_than:30d
has:attachment
label:members
filename:pdf

Architectural constraint:

This is an enhancement only. It must not replace Thunderbird's normal Gmail synchronization.

Acceptance criteria:

- Disabled by default initially.
- Uses OAuth rather than storing Google passwords.
- Search can fall back to Thunderbird search.
- Failure of Google API search has no effect on normal email.
- Results open corresponding Thunderbird messages when possible.
- Gmail API access is isolated in its own module.

Priority: P2 / experimental

---

## Epic 6 — Compose experience

### TS-601 — Simplified compose window

As a user, I want compose to focus on writing rather than expose dozens of controls so that sending mail feels lightweight.

Acceptance criteria:

Default visible controls:

- From
- To
- Cc/Bcc when requested
- Subject
- Body
- Attach
- Send

Secondary formatting controls remain available but visually subordinate.

Priority: P1

### TS-602 — Send from correct account

As a user with multiple identities, I want the sending identity to be obvious so that I do not accidentally send business mail from the wrong address.

Acceptance criteria:

- Current sender identity is always visible.
- Account/identity can be changed quickly.
- Reply defaults remain controlled by Thunderbird/account configuration.
- Thunderstream does not silently override sender identity.

Priority: P0

### TS-603 — Templates

As a user who sends recurring business emails, I want reusable templates so that I can compose common messages quickly.

Templates may include:

- subject
- body
- signature
- optional recipients
- simple variables

Acceptance criteria:

- Searchable from command palette.
- Can insert into a new message.
- User can edit before sending.
- Template data stored locally in extension settings unless explicitly changed later.

Priority: P2

### TS-604 — Quick snippets

As a user, I want reusable text snippets so that repeated phrases can be inserted without maintaining full email templates.

Examples:

meeting follow-up
intro paragraph
membership response
conference follow-up
signature variants

Priority: P2

---

## Epic 7 — Accounts and identity

### TS-701 — Unified inbox

As a user with multiple email accounts, I want a unified inbox so that I can see new mail in one place.

Acceptance criteria:

- Built upon Thunderbird's account/message model.
- Gmail and IMAP messages coexist.
- Account identity remains visible per message.
- Opening unified inbox does not alter message location.

Priority: P0

### TS-702 — Work profiles

As a user, I want to group accounts into profiles so that I can separate different work contexts without separate Thunderbird installations.

Example:

OpenADR
  work@...

Consulting
  consulting@...

Personal
  personal@...

Acceptance criteria:

- Profiles control presentation, not underlying account storage.
- Switching profile changes visible accounts/labels.
- All accounts remain managed by Thunderbird.
- Profile configuration survives extension updates.

Priority: P2

### TS-703 — Account-specific accent

As a user with multiple addresses, I want subtle account differentiation so that I can immediately recognise which identity I am using.

Acceptance criteria:

- Optional small account accent/indicator.
- Must not overwhelm message UI.
- Works in light and dark mode.

Priority: P2

---

## Epic 8 — Sidebar

### TS-801 — Opinionated sidebar

As a user, I want the sidebar to show only high-value destinations so that navigation remains simple.

Default:

Inbox
Starred
Sent
Drafts
Archive
Pinned labels

Less-used folders can live behind:

More

Priority: P0

### TS-802 — Collapsible accounts

As a user with several mailboxes, I want accounts collapsible so that inactive accounts do not consume screen space.

Priority: P1

### TS-803 — Unread counts

As a user, I want meaningful unread counts beside inboxes/labels so that I can see where attention is required.

Acceptance criteria:

- Counts come from Thunderbird state.
- Thunderstream does not maintain a parallel unread-state database.

Priority: P1

---

## Epic 9 — Thread/conversation experience

### TS-901 — Clear conversation hierarchy

As a user, I want email threads displayed clearly so that long conversations are easy to understand.

Acceptance criteria:

- Latest relevant message is easy to identify.
- Read messages can be visually collapsed or de-emphasised where APIs permit.
- Sender and date remain visible.
- Quoted-history clutter is reduced visually where safely possible.

Priority: P1

### TS-902 — Inline conversation actions

As a user, I want reply, reply-all, and forward available near the message content so that conversation actions remain contextual.

Priority: P1

---

## Epic 10 — Notifications and focus

### TS-1001 — Account-specific notifications

As a user, I want notifications configurable by account so that low-priority accounts do not interrupt me.

Acceptance criteria:

- Configuration sits above Thunderbird where APIs permit.
- Thunderstream does not implement its own mail polling.

Priority: P2

### TS-1002 — Important-only notifications

As a user, I want the option to suppress noisy categories or folders so that only useful mail interrupts me.

Priority: P2

---

## Epic 11 — Settings

### TS-1101 — Minimal settings

As a user, I want Thunderstream's settings to remain small and understandable so that customising email does not become a project.

Suggested sections:

Appearance
Keyboard
Sidebar
Accounts
Search
Compose
Advanced

Priority: P1

### TS-1102 — Reset to defaults

As a user, I want a one-click reset so that experimentation cannot permanently damage my mail setup.

Acceptance criteria:

- Reset affects Thunderstream settings only.
- Thunderbird account configuration remains untouched.

Priority: P1

### TS-1103 — Export/import configuration

As a user, I want to export Thunderstream settings so that I can reproduce the setup on another Mac.

Acceptance criteria:

- Export contains only Thunderstream configuration.
- No account passwords or OAuth tokens included.
- Human-readable JSON preferred.

Priority: P2

---

## Epic 12 — Update resilience

### TS-1201 — Feature-level compatibility

As a maintainer, I want fragile UI customisations isolated from core features so that a Thunderbird update cannot break the entire extension.

Example:

Keyboard shortcuts       ✓
Command palette          ✓
Theme                    ✓
Custom compose CSS       ✕

If compose CSS breaks, everything else should continue working.

Priority: P0

### TS-1202 — Automated compatibility smoke test

As a maintainer, I want basic tests run against current Thunderbird versions so that breaking changes are detected early.

Minimum tests:

- Thunderbird starts.
- Thunderstream loads.
- Inbox opens.
- Message opens.
- Compose opens.
- Send UI loads.
- Archive command executes.
- Command palette opens.
- Extension can be disabled cleanly.

Priority: P1

### TS-1203 — Minimal dependency surface

As a maintainer, I want Thunderstream to depend on as few third-party packages as practical so that maintenance and supply-chain risk remain low.

Priority: P1

---

## Epic 13 — Privacy and security

### TS-1301 — Local-first extension

As a user, I want Thunderstream to operate locally wherever possible so that the extension does not create another service holding my email data.

Acceptance criteria:

- No Thunderstream backend required for MVP.
- No analytics by default.
- No copying message bodies to third-party services.
- Thunderbird remains responsible for credentials and account access.

Priority: P0

### TS-1302 — Minimal extension permissions

As a security-conscious user, I want Thunderstream to request only the permissions necessary for enabled functionality.

Acceptance criteria:

- Permissions documented.
- Experimental Gmail API integration requests additional access only when enabled.
- Unused API scopes are not requested.

Priority: P0

### TS-1303 — No credential storage

As a user, I want Thunderstream to avoid handling account passwords so that Thunderbird/Google remain responsible for authentication.

Priority: P0

---

## MVP

The first release should deliberately be small.

### MVP 0.1

Build:

- stock Thunderbird compatibility
- Thunderstream theme
- simplified three-pane layout
- clean sidebar
- compact message list
- keyboard triage
- command palette
- archive-first workflow
- Send & Archive
- quick label/tag picker
- simplified compose UI
- unified inbox compatibility
- sender/account visibility
- safe disable/reset behaviour

Do not initially build:

- custom Gmail sync
- replacement message database
- custom SMTP/IMAP implementation
- Gmail categories engine
- server-side Gmail filter management
- AI features
- cloud account
- mobile client
- Thunderbird fork

---

## Phase 2

Once the core UI proves itself:

- templates
- snippets
- profiles
- account notification rules
- better thread presentation
- favourite labels
- advanced keyboard customisation
- settings sync/export
- optional Gmail API search

---

## Phase 3 / experimental

Only pursue these if usage proves they solve a real problem:

Gmail native search bridge

Use Gmail's API for Google-native search while continuing to open/manage messages
