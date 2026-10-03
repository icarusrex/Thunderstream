# Thunderstream

A local-first productivity layer for stock Thunderbird, focused on macOS and Google Workspace. **Audit-remediated foundation 0.1.1: not the complete MVP 0.1, not verified in Thunderbird, not ready for real mail.**

Thunderbird owns updates, OAuth, IMAP, SMTP, mail storage, rendering, calendars, contacts and identities. Thunderstream has no backend, analytics or mail synchronization implementation.

## Available foundation

- Toolbar command palette: filter, keyboard navigation, archive, selection-wide star/unstar, unread, Trash and account inbox navigation.
- Searchable Thunderbird tag picker, explicit add/remove/leave unchanged; this is not Gmail label management.
- Explicit sender chooser for palette compose/reply/forward. Use native Reply/Forward to retain Thunderbird's own identity rules.
- Optional Send & Archive for replies, off by default. A confirmed immediate send archives only the replied-to message, not the conversation.
- Independent light/dark color themes, local settings, legacy layout recovery and help.

Bulk results distinguish completed, failed and uncertain messages. No automatic retry occurs. An attempted send remains locked while its compose tab exists, including on rejection: check Sent/Outbox before deciding what to do.

Native single-key triage, rebuilt sidebar, row density, compose styling, a global palette and mail-search bridge remain unfinished. The separate privileged UI companion is an inactive scaffold with no enabled version profiles. Persistent layout application is disabled until reliable disable cleanup is verified. Themes do not implement macOS spacing or native row styling.

## Build and test

Development toolchain: Node 24 and Python 3.12; no npm dependencies. Extract `thunderstream-source.zip` first if viewing the archive publication.

```sh
npm test
python3 tests/package_validation_test.py
python3 scripts/validate.py
python3 scripts/package.py
```

Four deterministic XPI packages are written to `dist/`. ZIP metadata is fixed; byte reproducibility is tested within the same compression toolchain. Package validation resolves local resources/imports and permits experiments only for the companion. The workflow inside the source archive is **not an active GitHub repository workflow**.

## Controlled testing only

Use a disposable official Thunderbird profile with test accounts. Add-ons Manager → gear → Install Add-on From File → `thunderstream-core.xpi`. Install a theme independently. Install acceptance and behavior remain unverified; packages are not published on ATN.

The toolbar opens the palette; no command shortcut is assigned by default. Upgrading from 0.1.0 may retain old assignments: manually clear them in Manage Extension Shortcuts, especially the compose chord that collided with native Send Later. See [keyboard help](docs/keyboard.md).

Select messages before opening the palette. Captured context expires after five minutes; changed selections abort mutations. Standalone message windows and multi-window targeting need native verification.

Enable Send & Archive in settings to request optional `compose.send`. The compose action shows the sending identity and replied-to-message scope. Failed/uncertain sends never archive; archive failure never automatically resends. Native pre-send reminders and permission-prompt behavior still need testing.

## Disable and recovery

Core, themes and companion disable independently through Thunderbird. Native mail handling remains Thunderbird's responsibility. No new persistent layout changes are allowed in this preview. If 0.1.0 already changed your layout, use **Restore previous layout** before disabling. After a restart, unresolved pane baselines remain visible in settings for manual recovery; automatic restoration on disable remains unresolved. Reset changes only Thunderstream settings and eligible legacy layout state, never account configuration.

See [original requirements](docs/original-spec.md), [audit remediation](docs/audit-remediation.md), [release status](docs/release-status.md), [permissions](docs/permissions.md), [compatibility](docs/compatibility.md), and [native smoke test](docs/smoke-test.md).

Repository: https://github.com/icarusrex/Thunderstream. No open-source licence has been assigned.
