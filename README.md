# Thunderstream

A productivity layer for stock Thunderbird: a command palette, a quick tag picker, an explicit sender chooser and optional Send & Archive. The target is a Mac app for Google Workspace with the useful Mimestream experience and no additional recurring mail-app subscription. The [current scope](docs/current-scope.md) records the remaining Gmail and interface requirements.

Local-first: no hosted backend or analytics. Thunderbird keeps owning mail delivery, storage, rendering, calendars, contacts and identities. The optional 0.1.4 Gmail search preview uses a separate read-only Google connection through a local Mac helper; its credentials are not bundled. See [search setup and limits](docs/gmail-search-setup.md).

**Status: published pre-release 0.1.2; 0.1.3 under review in PR #3.** The 0.1.3 test build was exercised in Thunderbird 157.0.1 on macOS against a local POP/SMTP fixture and synthetic mail in an owner-authorized Gmail account. Gmail SMTP/IMAP, archive destinations, existing label preservation, restart and disable/re-enable were checked. The latest test artifact blocks explicitly offline Send & Archive before any send attempt; native reconnect/retry and other ambiguous-send cases remain unverified. Keep the optional feature off outside deliberate tests. This is a foundation; Gmail-backed search, a Gmail label picker and the planned interface work remain incomplete. See [release status](docs/release-status.md).

**0.1.4 Gmail search is an unreleased development preview.** Its optional Mac helper implements Gmail API queries, label scope, paging and exact server-message retrieval with a separate read-only connection. Automated and synthetic browser checks pass; live Google authorization, Keychain lifecycle and native message opening remain qualification gates. This is not yet a complete search-and-triage workflow. See [setup and limits](docs/gmail-search-setup.md) and [privacy](docs/privacy.md).

## What works today

- **Command palette** (toolbar, mail tabs and message tabs/windows): filter, arrow keys, archive, selection-wide star/unstar, unread, Trash, account and folder navigation, tag filter and Quick Filter search.
- **Tag picker**: searchable Thunderbird tags with explicit add, remove or leave unchanged. Thunderbird tags, not Gmail labels.
- **Sender chooser** for palette compose/reply/forward. It suggests an identity matching one of the message recipients, falling back to the message account’s default identity, and always shows the concrete From address. This matched native Reply in the tested alias-address case; advanced/catch-all identity heuristics are not mirrored.
- **Send & Archive** (off by default): after a confirmed immediate send, archives the replied-to message and the earlier messages it references, in the original's folder. The popup shows the count before sending. Newer replies, subject matches and queued mail are never archived.
- **Light and dark themes**, installed independently of the core.

Bulk results distinguish completed, failed and uncertain messages, and nothing retries automatically. An attempted send stays locked while its compose tab exists, including on rejection: check Sent and Outbox before deciding what to do.

Not built yet: single-key triage, a rebuilt sidebar, compact rows, simplified compose and a global palette. The privileged UI companion is an inactive scaffold with no enabled version profiles. Persistent layout changes are disabled until disable cleanup is solved.

## Install for testing

Use a disposable Thunderbird profile with test accounts. Download the XPIs from the [prereleases](https://github.com/icarusrex/Thunderstream/releases), then Add-ons Manager → gear → Install Add-on From File → `thunderstream-core.xpi`. Themes install separately. Packages are unsigned and not on addons.thunderbird.net.

The toolbar button opens the palette. No shortcut is assigned by default, because the obvious chords collide with native ones (⌘K is native Search). Assign one in Manage Extension Shortcuts, choosing a chord that works on your keyboard layout. Upgrading from 0.1.0 may keep old assignments; clear them, especially the compose chord that collided with Send Later. See [keyboard help](docs/keyboard.md).

Select messages before opening the palette. Captured context expires after five minutes, and a changed selection aborts the action.

To use Send & Archive, enable it in settings, which requests the optional `compose.send` permission.

## Disable and recovery

Core, themes and companion disable independently through Thunderbird; disabling restores the stock UI. Reset changes only Thunderstream settings and eligible legacy layout state, never account configuration. If 0.1.0 changed your layout, press **Restore previous layout** before disabling. Unresolved pane baselines from a previous session stay visible in settings for manual recovery.

## Build and test

Node 24 and Python 3.12; no npm dependencies. CI runs the same steps on every push and pull request.

```sh
npm test
python3 tests/package_validation_test.py
python3 scripts/validate.py
python3 scripts/package.py
```

`package.py` writes four deterministic XPIs to `dist/` (fixed ZIP metadata). Package validation resolves local resources and imports and allows experiment APIs only in the companion.

## Documentation

[Original requirements](docs/original-spec.md) · [Independent audit and native evidence](docs/audit/2026-10-03-independent-audit.md) · [Audit remediation](docs/audit-remediation.md) · [Release status](docs/release-status.md) · [Permissions](docs/permissions.md) · [Compatibility](docs/compatibility.md) · [Native smoke test](docs/smoke-test.md) · [Privacy](docs/publication/privacy.md)

## Licence

[Mozilla Public License 2.0](LICENSE), the same licence as Thunderbird.
