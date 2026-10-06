# Compatibility and native evidence

Baseline recorded 2026-10-06. Source/package/installed hashes are in [the build record](builds/2026-10-06-baseline.json). Task status is on the vault Thunderstream `BUILD.md`; update this file when actual compatibility evidence changes.

| Component | Declared floor | Actual evidence | Practical limit |
|---|---|---|---|
| Core 0.1.5 | Thunderbird 140.0, provisional API floor | Exact installed/source hash match; ordinary nested/Favorite navigation, native Cards/Table, disable/re-enable and exact-profile restart passed on 157.0.1/macOS 27.0.1 | Synthetic navigation plus Light/larger native text/960-pixel window/pane-focus/two-window qualification on this build; VoiceOver, IME, extension-page zoom and broader builds unqualified |
| Core 0.1.4 | Thunderbird 140.0, provisional API floor | Installed XPI matches current source; synthetic Gmail API result opens on Thunderbird 157.0.1/macOS 27.0.1 | No proof of every build >=140; fetched server copies have no mailbox triage association |
| Earlier foundation workflows | Native records for core 0.1.3 | POP/SMTP fixture and synthetic Gmail SMTP/IMAP, identity, archive, tags, restart and disable paths recorded | Do not transfer native send qualification to changed source without component equality; ambiguous-send cases remain open |
| Dark theme 0.1.3 | Thunderbird 140.0 declared | Installed hash matches current dist/source; enabled and visibly applied on the disposable profile | Color treatment only; row/typography/sidebar redesign absent |
| Light theme 0.1.3 | Thunderbird 140.0 declared | Exact package installed and visibly applied; synthetic native card/reader/palette checks pass on 157.0.1/macOS 27.0.1 | Tested color/native controls only; complete visual/assistive-technology coverage not claimed |
| UI companion 0.1.2 | No verified exact-version profiles | Source/package scaffold; no companion XPI found in disposable profile during inventory | `PROFILES=[]`; experiment reports hooks disabled; no row/sidebar/unmodified-key feature is qualified |
| Mac search helper | macOS only | Three installed code-file hashes match current source on disk | Shared per-user installation; running process revision and live refresh/revoked recovery remain unverified |

The published release remains v0.1.2, verified through GitHub's releases endpoint on 2026-10-06. PR #4's merge and green CI cover its older source revision, not the later local helper/theme follow-ups.

See [release status](release-status.md), [native opening](audit/2026-10-05-gmail-search-native-open.md), [Gmail foundation](audit/2026-10-04-gmail-0.1.3.md), [reliability](audit/2026-10-04-reliability-0.1.3.md), [offline guard](audit/2026-10-04-n25-offline-guard.md) and [selector registry](ui-selectors.md). Only exact builds with runtime evidence may enable native profiles.

Native frontend continuation: [bounded audit](audit/2026-10-06-native-frontend.md) and [exact component record](builds/2026-10-06-frontend.json). No product code or native hook changed in this pass.
