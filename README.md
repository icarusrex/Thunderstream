> Current planning and build tracking: [Mimestream roadmap](docs/superpowers/plans/2026-10-06-mimestream-roadmap.md), [capability comparison](docs/mimestream-capability-comparison.md), and [build process](docs/build-process.md). App task status is maintained in the vault Thunderstream `BUILD.md`. Theme/search-page implementation does not mean the broader frontend is complete.

# Thunderstream

A productivity layer for stock Thunderbird: a command palette, a quick tag picker, an explicit sender chooser and optional Send & Archive. The target is a Mac app for Google Workspace with the useful Mimestream experience and no additional recurring mail-app subscription. The [current scope](docs/current-scope.md) records the remaining Gmail and interface requirements.

Local-first: no hosted backend or analytics. Thunderbird keeps owning mail delivery, storage, rendering, calendars, contacts and identities. The optional 0.1.4 Gmail search preview uses a separate read-only Google connection through a local Mac helper; its credentials are not bundled. See [search setup and limits](docs/gmail-search-setup.md).

**Current deployment: core 0.1.10 prerelease**, with Light and Dark themes 0.1.3. [Download core](https://github.com/icarusrex/Thunderstream/releases/download/v0.1.10/thunderstream-core.xpi) · [Dark theme](https://github.com/icarusrex/Thunderstream/releases/download/v0.1.10/thunderstream-dark.xpi) · [Light theme](https://github.com/icarusrex/Thunderstream/releases/download/v0.1.10/thunderstream-light.xpi) · [Release notes](https://github.com/icarusrex/Thunderstream/releases/tag/v0.1.10).

This build includes complete Quick Open folder/Favorite navigation, local account groups, search query/scope conveniences, corrected sender suggestions, a same-folder referenced-message navigator and the Send & Archive compose-close correction. It keeps Thunderbird's native reader, compose identities and security controls. A separately installed native appearance now restyles the sidebar, message cards, toolbar and reader header. Complete conversation membership, Gmail label picker, body previews and durable message links remain unfinished. See [appearance delivery and rollback](docs/delivery/2026-10-07-native-appearance.md).

The optional Gmail search helper is a one-account read-only Mac preview with separate local setup. No credentials are bundled. It opens an exact fetched server copy in the native reader; it does not provide full search-result triage or unrestricted public Google sign-in. See [setup and limits](docs/gmail-search-setup.md).

The existing evidence covers 264 automated tests, packaged lifecycle regressions, independent reviews and the dated native checks in [release status](docs/release-status.md). Current installed reference/group/search/alias/signature interaction, live authentication recovery and remaining native send failures are not fully qualified. Send & Archive remains off by default. Publishing or installing a package does not close those gaps.

## What works today

- **Command palette** (toolbar, mail tabs and message tabs/windows): filter, arrow keys, archive, selection-wide star/unstar, unread, Trash, account-qualified folder paths and native Favorites navigation, tag filter and Quick Filter search.
- **Tag picker**: searchable Thunderbird tags with explicit add, remove or leave unchanged. Thunderbird tags, not Gmail labels.
- **Sender chooser** for palette compose/reply/forward. It suggests an identity matching one of the message recipients, falling back to the message account’s default identity, and always shows the concrete From address. This matched native Reply in the tested alias-address case; advanced/catch-all identity heuristics are not mirrored.
- **Send & Archive** (off by default): after a confirmed immediate send, archives the replied-to message and the earlier messages it references, in the original's folder. The popup shows the count before sending. Newer replies, subject matches and queued mail are never archived.
- **Account groups**: local Quick Open folder-destination scopes, including All accounts. This does not reconfigure Thunderbird's native sidebar or alerts.
- **Referenced-message navigator**: the selected message plus unique explicit references in its original folder, with missing/duplicate/unavailable notices and exact native reader opening. This is not complete conversation membership.
- **Gmail search conveniences**: explicit query/operator/date suggestions and account/label/Spam/Trash scope, through the optional read-only helper.
- **Light and dark themes**, installed independently of the core.

Bulk results distinguish completed, failed and uncertain messages, and nothing retries automatically. An attempted send stays locked while its compose tab exists, including on rejection: check Sent and Outbox before deciding what to do.

Not built yet: single-key triage, a reconstructed sidebar, body previews, simplified compose and a global palette. The privileged UI companion remains inactive. The new appearance uses a managed CSS import with its own installer and removal command; disabling the core does not remove this styling.

## Native appearance

The [native appearance installer](docs/delivery/2026-10-07-native-appearance.md) supports Mac Thunderbird 157.0.1, build 20261001134409. It gives the existing mail widgets flat rows, clearer typography, monochrome folders and calmer selection colors. Quit Thunderbird before installation or removal. The installer preserves existing profile styles and records restoration data. This delivery is visually checked in both a synthetic profile and the everyday profile. Light colors and high contrast are implemented but have not received native visual qualification in this delivery.

## Install

Download the core and optional theme XPIs from [0.1.10](https://github.com/icarusrex/Thunderstream/releases/tag/v0.1.10), then Add-ons Manager → gear → Install Add-on From File → `thunderstream-core.xpi`. Themes install separately. Packages are unsigned and not on addons.thunderbird.net. Core and theme installation does not authorize a Google connection; the optional helper needs its own local setup. The inactive privileged UI companion is not included in this release.

The toolbar button opens the palette. No shortcut is assigned by default, because the obvious chords collide with native ones (⌘K is native Search). Assign one in Manage Extension Shortcuts, choosing a chord that works on your keyboard layout. Upgrading from 0.1.0 may keep old assignments; clear them, especially the compose chord that collided with Send Later. See [keyboard help](docs/keyboard.md).

Select messages before opening the palette. Captured context expires after five minutes, and a changed selection aborts the action.

To use Send & Archive, enable it in settings, which requests the optional `compose.send` permission.

## Disable and recovery

Core, themes and companion disable independently through Thunderbird. Remove the separately installed native appearance with its removal command to restore prior styling. Reset changes only Thunderstream settings and eligible legacy layout state, never account configuration. If 0.1.0 changed your layout, press **Restore previous layout** before disabling. Unresolved pane baselines from a previous session stay visible in settings for manual recovery.

## Build and test

Node 24 and Python 3.12; no npm dependencies. CI runs the same steps on every push and pull request.

```sh
npm test
python3 tests/package_validation_test.py
python3 tests/gmail_helper_test.py
python3 -m unittest discover -s tests -p appearance_install_test.py
python3 scripts/validate.py
python3 scripts/package.py
```

`package.py` writes four deterministic XPIs to `dist/` (fixed ZIP metadata). Package validation resolves local resources and imports and allows experiment APIs only in the companion.

## Documentation

[Original requirements](docs/original-spec.md) · [Independent audit and native evidence](docs/audit/2026-10-03-independent-audit.md) · [Audit remediation](docs/audit-remediation.md) · [Release status](docs/release-status.md) · [Permissions](docs/permissions.md) · [Compatibility](docs/compatibility.md) · [Native smoke test](docs/smoke-test.md) · [Privacy](docs/publication/privacy.md)

## Licence

[Mozilla Public License 2.0](LICENSE), the same licence as Thunderbird.
