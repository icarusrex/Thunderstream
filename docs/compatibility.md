# Compatibility

| Component | Package floor | Actual native result |
|---|---|---|
| Core | Thunderbird 140.0 (provisional API floor) | Not tested |
| Light/dark themes | Thunderbird 140.0 | Not tested |
| UI companion | No verified profiles | Inactive |

The core probes public API availability per feature. This is not proof of correct runtime behaviour. Version numbers in online documentation move; they are not build evidence. The optional companion never attaches hooks without a matching checked-in, verified profile and matching DOM probes.

Themes use documented WebExtension colour properties, with no executable content. Thunderbird may map these differently from Firefox; actual appearance requires native inspection.

The development environment has Node and Python, but no native macOS Thunderbird runtime. Follow the smoke-test document before using any package on real mail. There is no claimed upstream-update compatibility beyond the public API design.
