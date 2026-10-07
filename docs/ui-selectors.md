# Native UI selector registry

## Managed appearance, 2026-10-07

The active stylesheet is `ui-compat/styles/chrome.css`, installed as a profile CSS import by `scripts/install_appearance.py`. The privileged companion remains inactive with `PROFILES=[]`. These are separate deployment mechanisms.

Qualified source: Mac Thunderbird 157.0.1, BuildID 20261001134409. Inspected the installed `omni.ja` definitions for about3Pane, thread-card, tree-listbox, unifiedToolbar and messageHeader before selecting widgets. Scope is exactly `messenger.xhtml`, `about:3pane` and `about:message`.

Selectors cover native folder rows/icons/counts, thread card container/sender/subject/date/unread indicators, outer toolbar/tab backgrounds and message header action buttons. No stylesheet targets message HTML or compose documents. Folder busy/error classes keep their original icon treatments. Palette, native selection, focus outlines and native message actions remain available.

Virtualized list row height and root font size remain owned by Thunderbird. The typography changes apply to children without changing the virtual scrolling geometry. This avoids a CSS row-height override disagreeing with the native list's calculated height. Body previews are absent from the installed native card template and are not supplied by this appearance.

Native evidence and recovery contract: [appearance delivery](delivery/2026-10-07-native-appearance.md). Standard dark mode was visually checked. Native light/high-contrast, screen-reader, IME and additional builds remain unqualified. The companion's keyboard guard remains a tested guard, not an installed unmodified-key listener.
