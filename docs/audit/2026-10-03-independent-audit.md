# Thunderstream independent audit — 2026-10-03

Auditor: Claude (Opus 5.5), taking over from the previous implementer. Requirements authority: `docs/original-spec.md` (byte-identical to `release/thunderstream-original-spec.md`). Prior audits and rulings were treated as hypotheses.

## 0. Environment and provenance (evidence produced here unless marked "provided")

| Item | Value |
|---|---|
| macOS | 27.0.1 (26A434) |
| Thunderbird | 157.0.1, `/Applications/Thunderbird.app`, Developer ID Mozilla Corporation (43AQ936H96), notarized; `codesign --verify --deep --strict` still passes after all testing |
| Node / Python / git | 26.8.2 / 3.14.7 / 2.54.0 |
| Release checksums | `shasum -a 256 -c SHA256SUMS.txt`: all 11 OK |
| Public repo | `icarusrex/Thunderstream`: public, 2 commits (`7cac39e5ed34`, `965442d42fa4`), author `19888336+icarusrex@users.noreply.github.com`, committer `noreply@github.com`; all 12 blobs byte-identical to local release files (`git hash-object`); no licence; 0 workflows |
| Source | `thunderstream-source.zip` (85 files); spec copy identical |
| Clean bundle | **Not opened.** The vault's PreToolUse guard matches the substring `clean` in `thunderstream-clean-history.bundle` (and `-b publish-clean`) as `git clean`. Its SHA-256 matches the release list and the public blob. Commit `666769c…` is therefore *provided*, not reverified. Fix: rename the asset in a future release, or adjust the guard by hand. |
| Baseline tests | 81/81 Node, 8/8 Python, validator OK, `git diff --check` clean |
| Rebuild | All four XPIs **byte-identical** to the release hashes under Python 3.14.7 (stronger than the handoff's same-toolchain claim) |
| Privacy | No personal email address in any XPI, source zip or handoff markdown (only `noreply`, `.invalid`, `.test`). No `fetch`, XHR, WebSocket, `eval`, remote URLs or third-party dependencies in any package |
| Exact-version API check | Schemas extracted from 157.0.1 `omni.ja` and compared with every API the code calls (§5) |

## 1. Verdicts

| Question | Verdict | Basis |
|---|---|---|
| **Safe to install and test in an isolated profile** | **Yes.** | Installs unsigned on stock 157 without changing any security setting. The permission prompt matches the manifest. Native Send/receive work with the extension enabled, disabled and absent. Disabling restores vanilla UI. No permanent delete path. Send & Archive is off by default and never archives after an unconfirmed send (proven with an SMTP 550). |
| **Real-mail use** | **Not yet.** | Nothing found that destroys mail. But Gmail/IMAP semantics (archive target, label/Trash model), multi-window targeting, VoiceOver and the 0.1.2 fixes are not natively verified. Allow it only after one pass on a dedicated Gmail/IMAP test account (§7). Even then keep Send & Archive off for production mail until conversation scope is decided. |
| **Full MVP 0.1 readiness** | **No.** | 3 of 14 MVP items are natively verified, 7 partial, 4 missing (§4). The original spec's layout, sidebar, compact list, one-key triage and simplified compose are absent. |

## 2. Findings from this audit (by actual severity)

States: **Fixed-N** = fixed and proven natively; **Fixed-U** = fixed on `fix/claude-audit` with regression tests, native re-run pending; **Open**.

| ID | Severity | Finding | File | Trigger → observed | Impact | Repro / test | State |
|---|---|---|---|---|---|---|---|
| N1 | Important | Palette actions fail in standalone message tabs/windows | `selection.js:2` (0.1.1) | Open a message in a tab, then palette → Archive. Shows "Action unavailable: no-selection" | Palette useless outside the 3-pane tab (P4) | Evidence 03; `tests/native-audit.test.js` (4 tests) | Fixed-U: falls back to `messageDisplay.getDisplayedMessages` and revalidates against the same source; `message_display_action` added for message windows |
| N2 | Important (spec) | Palette Reply/Forward/Compose bypass Thunderbird's identity defaults | `identities.js:2-13` | Reply to mail addressed to an alias. Chooser lists all identities alphabetically with no native default | Violates TS-602 "Reply defaults remain controlled by Thunderbird". Wrong-sender risk on the palette path | Evidence 06; `identities.test.js` | Fixed-U: "Thunderbird default" is first and focused, and passes no `identityId` |
| N3 | Minor | Forward forces `forwardInline` | `identities.js:12` | Palette Forward ignores the user's inline/attachment preference | Deviation from native behaviour | `identities.test.js` | Fixed-U |
| N4 | Minor | Deprecated `messages.listTags` logs a red error on 157 on every tag-picker open/apply | `mail-adapter.js:6` | Console: "Deprecated since Thunderbird 121…" ×2 | Noise; removed in MV3 | Evidence 05; `native-audit.test.js` | Fixed-U: `messages.tags.list` with fallback. **Adds read-only `messagesTagsList` permission** (upgrade prompt "List message tags") |
| N5 | Minor (was "deferred Minor") | Locked compose popup offers an enabled Send & Archive button, then "No result is available." | `background.js:63-70`, `send-results.js` | After a failed send, reopen the popup and click | Invites a retry that does nothing; user can't tell why. Duplicate send correctly blocked | Evidence 10; `native-audit.test.js` | Fixed-U: `compose:init` returns `locked`, button disabled with explanation |
| N6 | Minor | Raw error codes shown to users | `ui/palette.js:28` | "Action unavailable: no-selection", "already-in-trash" | Poor comprehension | Evidence 03; `native-audit.test.js` | Fixed-U (`codeText`) |
| N7 | Minor | Unavailable palette commands look identical to available ones | `ui/base.css` | "Apply recommended layout" appears normal but never runs | Confusing | Evidence 02 | Fixed-U (CSS on `aria-disabled`) |
| N8 | Minor (docs) | Settings say density "needs a verified UI companion" | `ui/settings.html` | 157 has native Density (☰ → Density: compact/normal/relaxed) | False statement; TS-103 is partly met natively | Native observation | Fixed-U: points to the native control |
| N9 | Info, load-bearing | On SMTP 550, `compose.sendMessage` **resolved** rather than throwing (contradicts the 157 schema description) | `send-and-archive.js:14` | Fixture reject mode → result `not-confirmed-sent` | The `headerMessageId` guard is what prevented archiving after a failed send. Any refactor relying on exceptions would archive unsent replies | Evidence 09, 11, fixture log; regression test added | Behaviour correct; guard pinned by test |
| N10 | Minor (UX) | Tag picker: one "Leave unchanged" button per tag doubles the height and causes a horizontal scrollbar | `ui/tags.js`, `base.css` | Native screenshot | Cramped | Native | Fixed-U (compact inline reset) |
| N11 | Spec contradiction | TS-301 says ⌘K opens the palette; on 157 ⌘K is native Search (shown in the search field) | spec vs. native | — | Hijacking ⌘K would break TS-501 and native behaviour | Native observation | Decision needed. Current: user-assignable chord (verified working natively, Ctrl+Alt+K), no default. Recommend keeping it that way |
| N12 | Low | Test named "orders source message account first" asserted alphabetical order | `tests/identities.test.js` | — | Misleading test | — | Fixed |
| N13 | Low | Themes have no preview image in Add-ons Manager | `themes/*/manifest.json` | — | Cosmetic | Native | Open |

No Critical or High defects found. Nothing observed can delete mail, alter credentials or block native send/receive.

## 3. Disposition of prior findings and fresh-review defects

| ID | Disposition | Evidence |
|---|---|---|
| H1 shortcut collisions | **Fixed-N (fresh install):** both commands unassigned. Upgrade with retained 0.1.0 assignments: **not tested** (no 0.1.0 artifact supplied) | Evidence 12 |
| M1 mixed stars | **Fixed-N:** one starred + one unstarred → both starred. Thunderbird's own mixed-selection star not compared | Native run |
| M2 partial bulk results | Fixed (unit). Native partial failure cannot be injected without a faulty server; deferred | Unit tests |
| M3 restart pane restore | Fixed but **unverified**: layout writes are gated, no legacy baselines exist to test | — |
| M4 palette a11y | ARIA wiring present. **VoiceOver not run** | — |
| M5 ineffective settings | Fixed, but the density text was wrong (N8) | N8 |
| M6 reply identity | **Still reproducible natively in 0.1.1** (N2) → Fixed-U in 0.1.2 | Evidence 06 |
| M7 conversation archive | **Still present:** archives only `relatedMessageId`; TS-203 "archive the conversation" unmet. Deferred, needs a design (§6) | Code + native single-message run |
| M8 disable restore | Layout writes blocked (verified: Apply disabled). Legacy cleanup unverified | Native |
| L1 concurrent tags | Residual race acknowledged; no atomic delta in the API. Deferred (accepted risk) | — |
| L2 lock lifecycle | **Fixed-N:** an attempted send stays locked; native Send still usable. Tab-ID reuse not tested. Lock now surfaced to UI (N5) | Native |
| L3 send results | **Fixed-N:** per-operation result page opened on failure. Overlap/eviction unit-only | Evidence 11 |
| L4 reset text | Present | Native |
| L5 picker interaction | Unit-verified; Enter on "Leave unchanged" not exercised natively | — |
| L6 dormant mappings | Valid; still dormant | — |
| L7 build/CI | **Reproducible build Fixed-N** (byte-identical on Py 3.14). CI still inactive (repo holds archives) | §0 |
| L8 docs/licence | Licence undecided. Doc contradiction found (N8) | — |
| P1 permission popup | **Fixed-N:** prompt raised from the settings gesture; Deny reverts the checkbox, Allow keeps it | Evidence 08 |
| P2 ambiguous send | **Partially proven:** SMTP 550 → no archive, no retry, lock retained, native Send from the same compose delivers exactly once. Cancelled prompts, offline/queued, Sent-copy failure, close-during-send: **not run** | Evidence 09–11, fixture log |
| P3/P4 source context | P4 **confirmed defect** (N1) → Fixed-U. P3 two mail windows: not run | Evidence 03 |
| P5/P6 Gmail, lifecycle | Unified-toolbar placement **verified**. Restart: extension reloads cleanly, console clean. Gmail and companion lifecycle not run | Native |
| Fresh: overlapping send-results writes | Unit-verified; not natively reproducible without concurrency tooling | — |
| Fresh: Enter on "Leave unchanged" submitted tags | Unit-verified | — |
| Deferred Minor: locked popup text | **Reproduced natively** → Fixed-U (N5) | Evidence 10 |

## 4. Acceptance matrix

Legend: **NV** natively verified on 157.0.1 · **IU** implemented, unit-tested, not native · **P** partial · **N** satisfied by stock Thunderbird, nothing from Thunderstream · **S** scaffold · **M** missing · **X** spec contradiction. "(0.1.2)" = delivered on `fix/claude-audit`.

### Epics

| ID | Status | Notes |
|---|---|---|
| TS-001 stock | NV | Installs as add-on/theme; binary untouched (codesign OK); disable without reinstall; profile intact. Update path not exercised |
| TS-002 graceful failure | NV / P | Start, POP sync and SMTP send verified enabled, disabled and absent. Extension crash not injected; IMAP/Gmail not run |
| TS-003 public APIs | IU | Core uses only WebExtension APIs; experiment isolated in a separate add-on; companion not installed |
| TS-004 compatibility | P | Version and per-feature API detection shown in settings; no startup warning |
| TS-101 3-pane layout | M | Gated (no safe disable cleanup). Stock 3-pane only |
| TS-102 macOS visual | P | Light theme NV (colours only); dark not run; no spacing/typography work |
| TS-103 compact list | N / M | 157 native Density covers it; card-view rows untouched by Thunderstream |
| TS-104 hide low-value UI | M | |
| TS-201 archive-first | P (NV) | Archive NV and honours account Archives config. No dedicated archive shortcut (palette + chord). Gmail not run |
| TS-202 one-key actions | M / S | Companion has no enabled profiles; documented cheat sheet exists |
| TS-203 Send & Archive | P (NV) | In compose ✓, success archives ✓, failure doesn't ✓, disableable ✓, assignable shortcut ✓; **conversation not archived** (M7) |
| TS-204 list triage | P | Multi-select NV; no hover/row actions |
| TS-301 palette | P (NV) | Filter/arrows/Enter/Escape NV; toolbar + assignable chord NV; ⌘K is X (N11). Go to Inbox/Sent/Switch account/Search (0.1.2) IU; "Move message…" M |
| TS-302 account switching | P | 0.1.1 inbox list NV; current-account marker (0.1.2) IU |
| TS-303 label navigation | IU (0.1.2) | Tag folders or tag Quick Filter; not frequency-ranked |
| TS-401 Gmail labels | M | Thunderstream works with Thunderbird tags only; Gmail labels (IMAP folders in Thunderbird) are not presented as labels. This is a scope substitution, not completion |
| TS-402 label picker | P (NV for tags) | Opens over message, multi-select, Enter applies, recent first. No "L" key; tags ≠ labels |
| TS-403 favourite labels | M (P2) | |
| TS-501 search entry | P | Native ⌘K search exists; palette Quick Filter (0.1.2) IU, current folder only |
| TS-502 search syntax | P / IU (0.1.2) | from/to/subject/body/tag/is:/has:attachment; dates and multiple text terms flagged unsupported; inline help in footer |
| TS-503 Gmail API search | M (P2) | |
| TS-601 simplified compose | M | |
| TS-602 sender identity | P → IU | From visible in popup NV; native default (0.1.2) IU; no silent override NV |
| TS-603/604 templates/snippets | M (P2) | |
| TS-701 unified inbox | P | Cross-account selection unit-tested; Go to Unified Inbox (0.1.2) IU when Thunderbird has unified folders |
| TS-702/703 profiles/accent | M (P2) | |
| TS-801 sidebar | M | Starred-in-folder (0.1.2) IU only |
| TS-802 collapsible accounts | N | |
| TS-803 unread counts | N | No parallel state ✓ |
| TS-901/902 thread UX | M | |
| TS-1001/1002 notifications | M (P2) | |
| TS-1101 minimal settings | P | Appearance/Keyboard/Compose/Status/Reset; no Sidebar/Accounts/Search/Advanced |
| TS-1102 reset | IU | Not exercised natively |
| TS-1103 export | M (P2) | |
| TS-1201 feature isolation | IU | Capability gating per feature |
| TS-1202 automated smoke test | M | Native tests here were manual; the fixture makes automation feasible (§6) |
| TS-1203 minimal deps | NV (static) | Zero runtime/dev dependencies |
| TS-1301 local-first | NV (static) | No network code, backend or analytics |
| TS-1302 minimal permissions | NV | Prompt matches manifest; send optional; one new read-only permission in 0.1.2 |
| TS-1303 no credentials | NV (static) | |

### MVP 0.1 (14 items)

| # | Item | Status |
|---|---|---|
| 1 | Stock compatibility | **NV** (POP/SMTP fixture; IMAP/Gmail pending) |
| 2 | Theme | **NV** light; dark not run |
| 3 | Simplified three-pane | M |
| 4 | Clean sidebar | M |
| 5 | Compact message list | M (native density exists) |
| 6 | Keyboard triage | P (palette + assignable chord; no single-key) |
| 7 | Command palette | P (core NV; navigation/search IU) |
| 8 | Archive-first | P (NV archive; no direct shortcut) |
| 9 | Send & Archive | P (NV single message; no conversation scope) |
| 10 | Quick label/tag picker | P (NV for TB tags; not Gmail labels) |
| 11 | Simplified compose | M |
| 12 | Unified inbox compatibility | P |
| 13 | Sender/account visibility | P |
| 14 | Safe disable/reset | **NV** disable; reset IU |

Count: NV 3 (1, 2, 14), P 7 (6–10, 12, 13), M 4 (3, 4, 5, 11). The missing items are the UI-reshaping core of the product goal, so effort remaining is larger than the count suggests.

## 5. API assumptions checked against 157.0.1 schemas

`messages.archive/update/move(isUserAction)/continueList/get`, `mailTabs.getSelectedMessages/update(displayedFolder: MailFolderId)/get/query/setQuickFilter`, `compose.beginReply/beginForward(forwardType optional)/beginNew/getComposeDetails(type, relatedMessageId, identityId)/sendMessage(mode sendNow → {mode, headerMessageId})`, `folders.query(specialUse, isUnified, isTag)`, `accounts.list`, `messageDisplay.getDisplayedMessages` (array in MV2, MessageList in MV3), `messages.tags.list` (needs `messagesTagsList`). All present for MV2. `messages.listTags` deprecated (N4). `messages.move` with a full `MailFolder` is deprecated; code passes an ID ✓.

## 6. Native tests not run, and why

- **Gmail and IMAP:** no owner-approved test account. Needs a dedicated Gmail account in this test profile. Checks: archive target (Thunderbird defaults Gmail archive to an "Archives" label unless set to All Mail), Trash vs delete model, tag/label interplay.
- **VoiceOver, dark theme contrast, fullscreen/resizing:** not run in this pass.
- **Offline/queued send, cancelled subject/attachment/spellcheck prompts, Sent-copy failure, close-during-send, double-click:** the fixture supports `tempfail` and `hang` modes, but these runs were not done.
- **Two mail windows (P3), upgrade from 0.1.0 shortcuts, companion lifecycle:** not run (companion deliberately not installed).
- **0.1.2 native re-verification:** started, then interrupted because macOS kept bringing Terminal to the front during GUI automation. The XPI is built; native re-run pending.

## 7. Next implementation plan (prioritised)

1. **Native re-run of 0.1.2** on the fixture profile (N1, N2, N4, N5, navigation, search). Then one pass on a Gmail test account.
2. **TS-203 conversation scope (M7).** Use `messages.query({headerMessageId})` with the original's References chain to collect thread members in the *same folder*; archive those only after confirmed send; show the count in the popup before sending; never match by subject. Needs native verification on Gmail, where All Mail duplicates exist.
3. **TS-1202 automated smoke test.** Drive the test profile through Thunderbird's remote protocol, gated to the test profile only, and reuse `docs/audit/native-fixture/`. Scope: start, load, inbox, message, compose, send UI, archive, palette, disable.
4. **TS-204 row actions** via `menus` (`message_list` context): Archive/Star/Tag/Trash. Public API, no layout risk.
5. **Disable-safe layout (TS-101/801/104).** Prove `management.onDisabled`-time restoration is impossible in MV2, then decide: either ship layout/folder-mode changes as an explicit "apply/undo" pair with persistent baselines, or leave layout to the user. Needs an owner decision because the spec requires both "hidden by default" and "safe disable".
6. **Single-key triage (TS-202).** Only via the companion with an exact-version profile and native evidence. High maintenance cost; consider dropping it for the palette plus assignable chords.
7. **Publication:** open a PR on `icarusrex/Thunderstream` that moves the source tree in, keeps the release archives under `releases/0.1.1/`, enables CI, and renames the `clean` bundle asset. Licence decision is the owner's.

## 8. Native re-run of 0.1.2 (same day, same profile and fixture)

Build: `fix/claude-audit`, final core XPI rebuilt after the fixes below. It installed over the disabled 0.1.1. Thunderbird kept the user's disabled state (correct) and the prompt listed "List message tags". One install attempt was rejected as "appears to be corrupt". `unzip -t` was clean and an immediate retry with the same file succeeded, so it is logged as transient and not reproduced.

| Item | Result | Evidence |
|---|---|---|
| N1 archive from a standalone message tab | **Fixed-N.** Message archived; Thunderbird advanced the tab natively | 21 + Archives file |
| Message-header palette button (message tabs/windows) | **NV.** Opens the palette; Star works | 22 |
| N2 palette reply identity | First 0.1.2 build **regressed**. Passing no identity made `compose.beginReply` use the default identity (**TS Primary**), while native Reply used **TS Alias** (N16). Rebuilt: the suggestion is computed from the message recipients (message account first, then account default) and passed explicitly, and the chooser shows the concrete address. **Fixed-N:** reply opens From TS Alias, matching native Reply | 23, 24, 25, 26 |
| N4 `listTags` deprecation | **Fixed-N.** No deprecation errors in the console | 34 |
| N5 locked compose popup | **Fixed-N.** Button disabled with explanation after an SMTP 550 | 27 |
| N10 tag picker layout | **Fixed-N.** Compact, no horizontal scroll | 33 |
| Search (TS-502) | **NV.** `subject:triage is:unread` → Quick Filter Subject-only text + unread, 1 match. `newer_than:30d` flagged and the entry disabled | 28, 29 |
| Go to Sent / account (TS-301/302) | **NV** | — |
| Unified Inbox and tag folders | First build **failed natively** (N17): `folders.query` returns virtual folders, but a mail tab cannot display them unless that folder-pane mode is on. Rebuilt: Unified Inbox shows unavailable with how to enable it; tags filter the current folder unless the tags mode is on; a failed tag-folder open falls back to filtering. **Fixed-N:** tag filter applied; Unified entry shown disabled with hint | 30, 31, 32 |
| Mail-tab-only commands in message tabs (N20) | Showed as runnable in a message tab. **Fixed** (shown unavailable). Unit-tested; message-tab view not re-screenshotted after the rebuild | — |

New items from the re-run:

| ID | Severity | Finding | State |
|---|---|---|---|
| N16 | Important | `compose.beginReply/beginForward/beginNew` without `identityId` do **not** apply Thunderbird's reply identity rules on 157.0.1 (alias-addressed mail → default identity) | Fixed-N by explicit computed suggestion. The suggestion mirrors the core native rule only, not catch-all or other advanced heuristics; the chooser says so |
| N17 | Minor | Virtual (unified/tag) folders are not displayable unless their folder-pane mode is enabled | Fixed-N |
| N18 | Low | "Promise rejected after context unloaded" from `identities.js`/`compose.js` when the popup closes before the background replies | Open; console noise only, action completes |
| N19 | Unknown | Escape did not close the palette or tag picker under automation, while Enter, arrows and Cancel worked. May be automation key delivery rather than the add-on | Open; needs one manual keypress check |
| N20 | Minor | Mail-tab-only commands looked runnable in message tabs | Fixed (unit) |
| — | Info | Thunderbird warns that Ctrl+Alt+K (test chord) "is not available on some keyboard layouts"; shortcut guidance should recommend layout-safe chords | Docs |

Updated matrix entries after this run: TS-602 **NV** (core rule), TS-301 palette navigation **NV**, TS-302 **NV**, TS-303 **NV** (tag filter path), TS-502 **NV** (subset), TS-701 **P** (unified needs the user-enabled mode), MVP 7 (palette) **NV for implemented scope**, MVP 13 sender visibility **NV** (chooser and popup show concrete From).

Verdict changes: none. Real-mail use still needs a Gmail/IMAP pass; full MVP is still not ready.

## 9. Conversation-scope Send & Archive (TS-203), native

Owner decision: archive the conversation. Scope: the replied-to message plus ancestors named in its own References/In-Reply-To, in the same folder; no subject matching; newer replies excluded; set fixed before sending.

Native run on 157.0.1: the inbox held the synthetic thread twice (thread-1/2/3, same Message-IDs from two seed runs). Reply to a thread-3 copy → the popup said "archives 5 messages" before sending → one delivery to the sink (In-Reply-To `<thread-3>`, References thread-1/thread-2) → Archives received both copies of thread-1 and thread-2 plus the replied-to thread-3. The other thread-3 copy stayed in the inbox. Evidence 40–42, fixture log.

TS-203 is now **NV** for POP/local folders. Gmail remains unverified: in Gmail, All Mail and label copies make "same folder" the right boundary, but that has to be confirmed on a real Gmail test account.

Install note: twice, the first install of a rebuilt XPI at the same path and version was rejected as "appears to be corrupt", and an immediate retry succeeded. `unzip -t` was clean both times. This is consistent with Gecko caching a zip reader for a changed file. It is a development-loop artifact and does not affect release installs. Bump the version or rename the file between local builds to avoid it.

Escape (N19) is still unverified; a manual keypress check is needed.
