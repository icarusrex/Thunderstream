# Native appearance delivery, 2026-10-07

## Delivery contract

Start with the existing Thunderstream core 0.1.10. Give the everyday Thunderbird inbox a calmer Mac mail appearance while retaining native mail behavior. The concrete first delivery is a visible, installed appearance plus a reversible installer. Feature coverage is not asserted as a numerical Mimestream percentage.

The interface uses neutral surfaces, blue selection, native Mac typography, rounded folder selections, monochrome folders, plain unread counts, flat card rows with hairlines, clearer sender/subject/date hierarchy and a calmer native reader header. Both light and dark palettes are implemented. The screenshot qualification in this delivery covers standard dark mode.

Existing Quick Open/Favorites, account groups, tag picker, sender chooser, reference navigator and optional Send & Archive remain in the core. Thunderbird continues to own mail storage, delivery, ordinary IMAP, compose, identities, attachments and message rendering. The optional Gmail search helper retains its existing separate setup and read-only limits.

## Architecture and recovery

The privileged companion stays inactive. The installer adds one managed import to `chrome/userChrome.css`, copies the stylesheet to `chrome/thunderstream.css` and sets only `toolkit.legacyUserProfileCustomizations.stylesheets`. Existing user CSS and the original preference are preserved in restoration data. New unrelated preferences and user CSS added afterward are retained on removal. User edits to the managed stylesheet block removal/update rather than being discarded.

Writes are atomic per file, with rollback after caught filesystem errors and retry recovery for interrupted transactions. Restoration data is saved before profile changes and removed last. These paths have direct filesystem tests, including injected write failures and process interruptions. Thunderbird must be stopped; a held profile lock blocks modification.

This replaces the prior proposal to postpone all native appearance until companion activation. The owner authorized sensible decisions and execution of a visibly improved interface. No new extension or Google permissions are introduced.

## Install or remove

Supported installer target: Mac Thunderbird 157.0.1, BuildID 20261001134409. Quit Thunderbird first. Find the profile folder in Help > Troubleshooting Information > Profile Folder. From the repository or extracted appearance bundle:

```sh
python3 scripts/install_appearance.py install --profile '/absolute/path/to/profile'
python3 scripts/install_appearance.py status --profile '/absolute/path/to/profile'
python3 scripts/install_appearance.py remove --profile '/absolute/path/to/profile'
```

Restart Thunderbird after installation or removal. Removing the appearance restores prior styling; it does not uninstall the core. Disabling the core does not remove the managed CSS. Preserve `thunderstream-appearance.json` until removal completes.

The installer rejects a different build when installing. Already installed CSS remains across application updates, so remove it before moving to an unqualified build or qualify the new version first. This is a version-specific CSS layer, not a supported native theme API or a Thunderbird fork.

## Native evidence

- Inspected the installed application's `omni.ja` sources for exact selectors and virtual row geometry.
- Started the exact named test profile with the regular process stopped, avoiding the earlier wrong-window verification problem.
- Visually inspected synthetic native folder/card rows and selected an already-read fixture with attachment. Native reader, Reply, Forward, Archive, Spam, Delete and attachment controls remained visible. No mail was sent, archived or deleted during these appearance checks.
- Installed, removed and reinstalled the appearance in the stopped test profile. Automated tests also verify restoration of preexisting CSS and preferences.
- Installed in the stopped everyday profile, reopened Thunderbird and visually confirmed the dark native inbox, folder styling and message rows at the normal 1476 by 756 window size. Core 0.1.10 remains active.
- Opened the installed core palette for a selected already-read thread in the everyday profile. Quick Open, account-group selector and native mail action entries rendered; Escape dismissed it. No action was executed.
- Final local qualification passed 243 Node tests, 11 helper tests, 10 package tests and 10 installer tests, source validation, deterministic XPI packaging and whitespace checks.
- Independent code review found restoration ordering, partial-removal and edited-stylesheet defects; each was corrected with regression coverage. Final review reported no remaining actionable findings.

No private mailbox content or profile is included in repository evidence or the distribution bundle.

## Remaining product gaps

The native widgets have been restyled, not replaced. Virtualized row geometry and pane widths remain native. A 481px test window clips native labels/header controls and is outside the qualified layout. Light/high-contrast, assistive technology, IME, other builds and all existing workflow combinations remain unqualified in this delivery.

Body previews require actual message data and a further reader/list integration. Complete conversations, Gmail label membership, durable message links, single-key triage and a simplified compose interface remain separate work. Existing reference navigation and Thunderbird tags must not be described as complete Gmail conversations or labels.
