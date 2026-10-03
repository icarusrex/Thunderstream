# Compatibility

| Component | Package floor | Actual native result |
|---|---|---|
| Core | Thunderbird 140.0 (provisional API floor) | Thunderbird 157.0.1 on macOS 27.0.1: installs unsigned and works against a POP/SMTP fixture. Gmail and IMAP not tested |
| Light/dark themes | Thunderbird 140.0 | Light applied on 157.0.1; dark not run |
| UI companion | No verified profiles | Inactive, not installed in testing |

Every API the core calls was checked against the schemas shipped in 157.0.1 (`omni.ja`); see the [audit](audit/2026-10-03-independent-audit.md), section 5. Versions between 140 and 157, and ESR builds, are untested.

The core probes public API availability per feature. That is not proof of correct runtime behaviour on untested versions. The optional companion never attaches hooks without a matching checked-in, verified profile and matching DOM probes.

Themes use documented WebExtension colour properties, with no executable content. Thunderbird may map these differently from Firefox.

Follow the smoke-test document and test with a dedicated Gmail or IMAP account before using any package on real mail. There is no claimed upstream-update compatibility beyond the public API design.
