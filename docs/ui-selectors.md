# Native UI selector registry

No native selectors or version profiles have been verified or enabled. `ui-compat/profiles.js` intentionally contains an empty list. The test fixtures exercise generic attachment and cleanup; they do not establish correctness against Thunderbird's DOM.

`appearance.js` provides reversible class attachment and neutral design tokens only. Those tokens do not change native row density until a verified profile maps them to the actual widget. It does not implement a reconstructed sidebar, native compose restyling or global palette overlay. `keyboard.js` is a tested guard, not an installed native key listener.

Before enabling a profile, record exact build/OS and inspect native source. Specify selectors for mail-window chrome only, required probes, exact version list, lifecycle cleanup, and smoke evidence. Exclude message content, From controls, security indicators, warnings and native folder-recovery controls. J/K must use actual displayed selection ordering.

Known source-reference retrieval was unavailable in this session. No speculative selector has been substituted.
