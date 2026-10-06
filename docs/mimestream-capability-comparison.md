# Mimestream capability comparison

Compared 2026-10-06 with Thunderstream source `c1c22af`. Input: the owner's vault file `Mimestream Release notes - to inform Thunderstream.md`. The file is a ranked capability catalogue, not the raw release history. Its ratings/P0 labels are reference opinions; this comparison decides build order from current implementation, dependencies, maintenance and action safety.

The recommendation is native frontend/Quick Open first, genuine Gmail label semantics next, then search convenience and account/compose context. Account workspaces and conversation presentation receive separate feasibility/design slices. Undo Send and Snooze remain deferred stateful work. Native conveniences are reused where verified; 100 rows do not become 100 active tasks.

## Interpretation

Implemented means product code exists within the described scope. Partial means material scope is still absent. Native documented means official Thunderbird documentation establishes a capability, not that this test profile has qualified it. Native candidate means no Thunderstream subsystem exists and native support needs inspection/qualification. Absent means no implementation was found in the inspected product tree. Proposed/deferred routes are planning decisions, not consent for new access or runtime enablement.

Overlap examples: profiles 1/21/93, identity 6/57, templates 13/55, labels 11/59/60, account colors 24/78 and notifications 19/23/38/86. Some related entries are not exact duplicates: native remote-content blocking is not a maintained tracker-domain list, and native threaded lists are not an aggregated conversation reader.

## Complete disposition

| Reference rank | Capability | Observed Thunderstream state | Plan route | Decision and gap | Evidence |
|---|---|---|---|---|---|
| M001 | Profiles / separate Work + Personal spaces | Absent | Workspace candidate | Group accounts inside one app; preserve an All view. Separate Thunderbird processes are not an equivalent UX. | C7,M1 |
| M002 | Excellent conversation/thread view | Absent enhancement | Conversation feasibility | Native message display is retained. conversation.js plans archive ancestors; it is not a conversation renderer. | C5,C7 |
| M003 | Fast keyboard-first triage | Partial core | Frontend pilot | Palette triage works; unmodified native key listeners are disabled. Qualify focus and actual visible ordering first. | C1,C2,C7 |
| M004 | Quick Open / keyboard navigation palette | Partial core | Quick Open slice | Current destinations cover special-use folders and tags, not arbitrary native folders or favorites; matching is substring-based. | C1 |
| M005 | Search suggestions + Gmail-like advanced search | Partial core | Search polish | Literal server queries, scope and pagination exist; query tokens and suggestions do not. Resolve qualification and then add convenience. | C3 |
| M006 | Identity / From-address intelligence | Partial, native evidence | Preserve and qualify | Recipient-match and account-default suggestions exist; automatic alias discovery and learning do not. | C4 |
| M007 | Multiple signatures + per-account/reply signatures | Native documented; extra library absent | Native baseline / compose candidate | Qualify native per-identity signatures first. A multiple-signature picker and reply-only policy need their own contract. | N3,C4 |
| M008 | Send & Archive | Implemented, limited qualification | Reliability lane | Keep the captured same-folder ancestor scope. Finish same-compose reconnect and ambiguous-send cases before wider use. | C5 |
| M009 | Undo Send | Absent | Deferred send subsystem | Undo means delaying delivery, not recalling sent mail. Requires durable pending state and integration with Send & Archive. | M2,C5 |
| M010 | Message Snooze | Absent | Deferred scheduler | Mimestream snooze is local and lacks Gmail snooze parity. Requires restart, offline, clock and multi-device semantics. | M3 |
| M011 | Excellent Move To / Label UX | Absent Gmail picker; tags implemented | Label contract | Separate ordinary Move To from Gmail membership edits. Native UI copy/move evidence does not qualify an extension picker. | C6,L1 |
| M012 | Per-folder message-list filters | Partial native filter reuse | Native baseline / later persistence | Quick Filter exists. Pinning applies filters across folders; that is not proof of per-folder saved state. | C1,N2 |
| M013 | Templates / frequent replies | Absent extension library | Compose candidate | Qualify native templates before adding a maintained library, variables or recipient fields. | C4,N5 |
| M014 | Deep links to email | Absent | Durable-link candidate | Never persist Thunderbird message IDs. Account-qualified durable resolution and missing/duplicate cases are prerequisites. | L1,C3 |
| M015 | Server-side Gmail filters UI | Absent | Deferred Gmail administration | Real server filters require separate permissions and error contracts; outside the current read-only helper. | C3 |
| M016 | Address autocomplete that actually learns | Native candidate; learning absent | Native baseline | Keep native address completion. Directory, learned ranking and blocking are separate work. | N5 |
| M017 | Configurable swipe actions | Absent extension behavior | Deferred chrome work | Trackpad gestures add native hook and accidental-action risks; keyboard workflow goes first. | C7 |
| M018 | Customizable mark-read delay | Native candidate | Native baseline | Inspect native mark-read settings and qualify selection timing before adding a custom preference. | N5 |
| M019 | Account/profile notification controls | Native candidate; workspace schedules absent | Workspace candidate | Account grouping does not automatically control OS notifications or badge counts. | C7,M1 |
| M020 | Gmail categories as native UI | Absent dedicated integration | Deferred Gmail integration | Do not claim Gmail categories from a cosmetic folder grouping. Read visibility and mutation rules need a contract. | C3,C6 |
| M021 | Optional All profile + normal profiles simultaneously | Absent; overlaps 1 | Workspace candidate | Specify All plus named account groups together, not as two implementations. | M1,C7 |
| M022 | Private / instant push | Thunderbird sync retained | Excluded infrastructure | Keep native synchronization. A private hosted push service would add operating cost and a new architecture. | N5,C3 |
| M023 | Configurable notification action | Native candidate; custom actions absent | Deferred notifications | Qualify OS and Thunderbird capabilities before promising arbitrary notification actions. | N5 |
| M024 | Account color coding | Absent extension message-row colors | Frontend / workspace candidate | Account names are visible in navigation; row color coding is not implemented. | C1,C7 |
| M025 | Message-list density / row-style controls | Theme only; row changes absent | Frontend pilot | Native cards/table and density are the baseline. Theme colors do not implement row spacing or preview text. | N1,C7,C8 |
| M026 | Favorites section | Native favorites available; integration absent | Quick Open slice | Read native favorites through folders.query. Do not add accountsFolders just to read them. | N6,C1 |
| M027 | Search scoped to label / current folder / All Mail | Implemented search scope | Preserve / polish | All Mail or explicit label scope is visible and bound to pagination; current native folder inference is not automatic. | C3 |
| M028 | Smart recipient/address tokens | Native candidate | Native baseline | Keep native recipient fields and address inspection. Add only a demonstrated gap. | N5 |
| M029 | Keyboard pane navigation | Native candidate; custom traversal absent | Frontend pilot | Qualify keyboard movement across native panes and edits. Do not implement J/K from guessed row order. | C2,C7 |
| M030 | Quote trimming / collapsing | Absent extension enhancement | Conversation feasibility | Collapsing quotes must preserve full text, signatures and encrypted/remote-content handling. Body rewriting is outside current design. | C7 |
| M031 | Inline Find in conversation | Native find candidate; conversation-wide find absent | Conversation feasibility | Message Find does not establish cross-message search. Qualify native behavior before designing a wider index. | N5,C7 |
| M032 | Conversation expand/collapse all | Native thread expansion candidate | Conversation feasibility | List thread expansion is distinct from expanding message bodies in a conversation reader. | N1,C7 |
| M033 | Per-message actions inside a conversation | Partial native message actions | Conversation feasibility | The displayed native message has contextual actions; a multi-message reader with per-message action targeting is absent. | C1,C4,C7 |
| M034 | Rich message list metadata | Native metadata documented; extension rows absent | Frontend pilot | Use available native columns/cards for attachment, star, tags and thread metadata. Confirm actual label and account coverage. | N1,C7 |
| M035 | Copy/Open Gmail URL | Absent | Durable-link candidate | Expose a Gmail URL only after exact account/message resolution is proven; do not guess from a subject or header. | C3,L1 |
| M036 | Calendar invite banner | Native calendar candidate | Native baseline / later invite polish | Thunderbird needs a configured calendar. Preserve native invite security and attendee confirmation. | N5 |
| M037 | One-click meeting join | Native candidate | Later reading polish | Only expose recognized meeting links from the displayed message; arbitrary external links remain visible and explicit. | N5 |
| M038 | Configurable notification schedules / working hours | Absent extension schedules | Deferred workspace notifications | OS Focus is a possible baseline, not proof of per-account badge and notification parity. | M1,C7 |
| M039 | Tracking prevention | Native privacy baseline | Native baseline | Preserve blocked remote content. A tracker-domain list and tracking-test parity are separate claims. | N4 |
| M040 | Forgotten-attachment warning | Native candidate | Native baseline | Check the native attachment reminder before duplicating it. The note's tiny-effort claim is not accepted as evidence. | N5 |
| M041 | Full addresses for unknown senders | Native candidate | Frontend pilot | Qualify full sender-address visibility and spoofing cues without hiding native warnings. | C7,N5 |
| M042 | Standalone message windows | Native retained and core supported | Preserve / qualification | Palette and action support includes native message tabs/windows; broader multi-window targeting remains open. | C1,C2 |
| M043 | Window/session restoration | Native restoration candidate | Frontend qualification | Qualify restart restoration for each custom surface, account group and source window; no extension session restorer exists. | C7,N5 |
| M044 | Inline image resizing | Native candidate | Later compose polish | Verify native image handling and attachment integrity before adding resize behavior. | N5 |
| M045 | Print / export individual message or conversation to PDF | Native candidate | Native baseline | Qualify native print/PDF export; individual-message output is not automatically whole-conversation export. | N5 |
| M046 | Forward as attachment | Native candidate | Native baseline | Reuse native Forward as Attachment when qualified; no separate Thunderstream command exists. | N5 |
| M047 | Include original attachments on reply | Native candidate | Later compose polish | Qualify native attachment preservation on reply; do not silently change attachment behavior. | N5 |
| M048 | Drag/drop attachments everywhere | Native candidate | Native baseline | Test native drag/drop and attachment integrity on the exact build before adding hooks. | N5 |
| M049 | Quick Look attachments | Absent Thunderstream integration | Deferred macOS work | Quick Look integration is separate platform work, not part of the core extension baseline. | C7 |
| M050 | Paste attachment directly into compose | Native candidate | Native baseline | Qualify native paste and attachment identity; only add an adapter for a demonstrated gap. | N5 |
| M051 | Markdown substitutions | Absent extension substitutions | Deferred compose enhancement | Keep the native editor. A substitution engine needs formatting, IME and undo rules. | C7,N5 |
| M052 | Inline / block code formatting | Native formatting candidate | Later compose polish | Qualify native formatting first; semantic code blocks and Markdown shortcuts are separate features. | N5 |
| M053 | Paste URL over text to create link | Native candidate | Native baseline | Check native paste/link behavior and undo handling before adding editor interception. | N5 |
| M054 | @mentions that add recipients | Absent | Deferred compose enhancement | Recipient additions from mentions need explicit To/Cc/Bcc semantics and undo; outside current editor scope. | C7 |
| M055 | Custom template variables | Absent; overlaps 13 | Compose candidate | Variables belong to one templates design, not a separate backlog implementation. | N5 |
| M056 | Automatic image HEIC conversion | Absent Thunderstream integration | Deferred macOS work | Format conversion needs attachment-quality and original-preservation rules; low priority. | N5 |
| M057 | Automatic best reply/from alias | Overlaps 6 | Preserve and qualify | Use the same identity workstream and acceptance evidence as rank 6. | C4 |
| M058 | Menu-bar unread viewer | Absent | Deferred notifications | A second unread surface adds platform work and interruption cost; no current delivery reason. | C7 |
| M059 | Create labels directly from picker | Absent; overlaps 11 | Later label management | Start with existing labels. Creation needs accountsFolders or a separately authorized Gmail mutation route. | N6,C6 |
| M060 | Drag labels to create hierarchy | Absent | Deferred label management | Hierarchy edits change server state and invalidate folder references; exclude from the first picker. | N6,L1 |
| M061 | Configurable conversation mode | Native threading documented | Native baseline | Keep native threaded/unthreaded options. This is not a custom conversation renderer. | N1 |
| M062 | Apple Intelligence Writing Tools | Absent | Excluded integration | Keep external writing tools available without embedding an AI service or product dependency. | C7 |
| M063 | System predictive text | Native candidate | Native baseline | OS predictive-text availability is not established by this code review. | N5 |
| M064 | Send Again | Native candidate | Later compose polish | Qualify native Edit as New behavior rather than inventing a resend path. | N5 |
| M065 | Reply ↔ Reply All switching while composing | Native candidate | Later compose polish | Changing Reply/Reply All must preserve edited body, identity and recipient intent; inspect native support first. | C4,N5 |
| M066 | Full address display preference in compose | Native candidate | Native baseline | Qualify actual address display preferences on the test build; do not infer parity from Mimestream settings. | N5 |
| M067 | Address suggestion blocklist | Absent extension blocklist | Deferred contacts work | Address-blocking UX requires a supported native route and removal/recovery semantics. | N5 |
| M068 | Remove Formatting / Paste & Match Style | Native candidate | Native baseline | Qualify native paste-as-text and formatting-removal shortcuts; leave editor ownership native. | N5 |
| M069 | Automatic smart-link detection | Native candidate | Native baseline | Retain native link handling; no new detection engine is justified by the notes alone. | N5 |
| M070 | Open links in background | Native candidate | Later reading polish | Qualify OS/browser link behavior before introducing a global preference. | N5 |
| M071 | Drag messages/files into other apps | Native candidate | Native baseline / link candidate | Test native export/drag interoperability first. Durable app links are covered by ranks 14/35. | N5,L1 |
| M072 | Attachment-opening destination setting | Native candidate | Native baseline | Inspect native attachment destination settings and file lifetime; no extension setting exists. | N5 |
| M073 | Add detected itinerary/reservation event to calendar | Native candidate | Deferred calendar extraction | Detected reservations are a separate parser, timezone and calendar-write feature. | N5 |
| M074 | Google Contacts / Workspace Directory integration | Native candidate; directory parity unknown | Deferred contacts work | Native address books do not establish Workspace Directory synchronization or permissions. | N5,C3 |
| M075 | Google Contact Group addressing | Native candidate | Deferred contacts work | Qualify group expansion and visible recipient addresses before adding integrations. | N5 |
| M076 | Vacation responder management | Absent | Deferred Gmail administration | Vacation responder needs settings permissions and external writes beyond the current helper. | C3 |
| M077 | Importance markers | Native folder candidate; dedicated feature absent | Deferred Gmail integration | Importance markers need an explicit Gmail concept and membership contract. | C3,C6 |
| M078 | Account names/colors in Unified Inbox | Overlaps 24 | Frontend / workspace candidate | Track account colors and names together, including mixed-account message rows. | C1,C7 |
| M079 | Adjustable text size / zoom | Native candidate | Frontend qualification | Qualify native text size/zoom at larger sizes before adding chrome overrides. | N1,N5 |
| M080 | Configurable Delete-key semantics | Native semantics retained; remap absent | Keyboard candidate | Define Archive/Trash and modifier behavior visibly; preserve typing and selection safety. | C2,C7 |
| M081 | Next-row selection behaviour after action | Native behavior retained; custom policy absent | Keyboard qualification | Measure actual next-selection behavior after mutations before creating a configurable policy. | C2 |
| M082 | Remote image loading control | Native privacy documented | Native baseline | Preserve native remote-content blocking and exceptions; overlaps the privacy baseline in rank 39. | N4 |
| M083 | Raw source viewer | Native source viewer exercised | Preserve / qualification | Keep native source access; prior automation/window-selection problems do not prove a product defect. | L2 |
| M084 | Save `.eml` | Native candidate | Native baseline | Qualify native Save as .eml. A fetched temporary server copy is not a durable exported reference. | N5,C3 |
| M085 | Message/account contact photos | Native candidate | Deferred visual polish | Photos are lower value than account/address visibility and working navigation. | N5 |
| M086 | Account-specific notification types | Native candidate; overlaps 19 | Deferred notifications | Account-specific Inbox/Primary/None policy needs real provider and OS behavior qualification. | M1,N5 |
| M087 | Image markup | Absent Thunderstream integration | Excluded platform polish | No current workflow requirement justifies a markup subsystem. | C7 |
| M088 | Continuity Camera | Absent Thunderstream integration | Excluded platform polish | No current requirement justifies camera/continuity integration. | C7 |
| M089 | Message size display | Native column candidate | Native baseline | Qualify native table metadata before adding a message-size UI. | N1 |
| M090 | Save all attachments | Native candidate | Native baseline | Qualify native Save All Attachments and filenames on the supported build. | N5 |
| M091 | Attachment ordering / drag rearrangement | Native candidate | Deferred compose polish | Reordering must preserve bytes and send order; no extension implementation exists. | N5 |
| M092 | Compose warning for missing subject | Native warning observed | Preserve / qualification | The cancelled blank-subject prompt caused no delivery/archive in existing synthetic tests. | L3,C5 |
| M093 | Profile Focus Filters | Absent; overlaps 1/19 | Deferred workspace notifications | Focus Filters require OS integration beyond simple account groups. | M1,C7 |
| M094 | Print full email addresses | Native candidate | Native baseline | Qualify native print address output rather than claiming Mimestream parity. | N5 |
| M095 | Automatic dark-mode message reformatting | Native dark reading retained | Frontend qualification | The native viewer supports dark mode; complex HTML and contrast remain qualification work. | L2,C8 |
| M096 | Inbox Zero animation/confetti | Absent | Excluded decoration | No functional gain warrants an Inbox Zero animation. | C7 |
| M097 | Colored contact monograms | Native candidate | Deferred visual polish | Monograms are optional polish after readable metadata and account context. | N5 |
| M098 | Liquid Glass / OS design adoption | Absent | Excluded OS restyling | Do not chase an OS material effect as a substitute for working reading/navigation. | C7 |
| M099 | Menu icons / visual spacing refinements | Theme only; broader refinements absent | Frontend pilot when functional | Spacing that improves scanning and focus belongs with frontend work; purely decorative icons wait. | C7,C8 |
| M100 | Newsletter/onboarding/purchase UI | Absent | Excluded commercial machinery | No subscription or purchase/onboarding system is needed for this personal build. | C7 |

## Source key

Local paths are relative to the repository. Product behavior findings come from source inspection, not feature-name inference.

| Key | Source and what it establishes |
|---|---|
| C1 | `extension/commands.js`, `navigation.js`, `ui/palette.js`: explicit command actions, special-use/tag destinations and substring filtering |
| C2 | `extension/selection.js`, `triage.js`, `ui-compat/keyboard.js`, `profiles.js`: native triage/selection guards; no enabled native key profile |
| C3 | `extension/gmail-search.js`, `ui/gmail-search.js`, `native/gmail_host.py`, `native/google_auth.py`: one-account read-only server search, exact ID/native-file opening and current UI boundaries |
| C4 | `extension/identities.js`, `ui/identities.js`, identity tests: configured identities, recipient-match/account-default suggestions and explicit native compose |
| C5 | `extension/conversation.js`, `send-and-archive.js`, send tests: fixed same-folder ancestor scope and confirmed-send archive gating, no conversation renderer |
| C6 | `extension/tags.js`, `ui/tags.js`: Thunderbird tag delta, not Gmail label membership |
| C7 | `extension/capabilities.js`, `settings.js`, `layout.js`, `ui-compat/api/implementation.js`, `appearance.js`, `profiles.js`, `docs/ui-selectors.md`: disabled layout, inactive native bridge and unfinished frontend |
| C8 | `themes/light/manifest.json`, `themes/dark/manifest.json`, `extension/ui/base.css`: independent color themes and extension-page styles |
| L1 | `docs/audit/2026-10-04-native-label-feasibility.md`: narrow synthetic native copy/move evidence and unproven extension identity/membership contract |
| L2 | `docs/audit/2026-10-05-gmail-search-native-open.md`: synthetic server-copy display, disabled mailbox actions, Dark theme and local duplicate-header evidence |
| L3 | `docs/audit/2026-10-04-reliability-0.1.3.md`: synthetic send failures, queued/cancel/double-click/lifecycle evidence and remaining cases |
| N1 | [Thunderbird Appearance](https://support.mozilla.org/en-US/kb/appearance-panel-layout-message-list-card-view-tab): native Card/Table layouts, row variants and threading defaults |
| N2 | [Thunderbird Quick Filter](https://support.mozilla.org/en-US/kb/quick-filter-toolbar): unread/star/contact/tag/attachment filters; Pin applies filters across folder switches |
| N3 | [Thunderbird signatures](https://support.mozilla.org/en-US/kb/signatures): native account signature configuration and positioning |
| N4 | [Thunderbird remote content](https://support.mozilla.org/en-US/kb/remote-content-in-messages): native remote-content controls/exceptions |
| N5 | `docs/original-spec.md`, `docs/superpowers/specs/2026-10-03-thunderstream-design.md`: deliberate native delegation. This key marks a native audit candidate; it does not independently prove parity for each convenience |
| N6 | [Thunderbird folders API](https://webextension-api.thunderbird.net/en/mv2/folders.html): `isFavorite` discovery through `accountsRead`; changing favorites needs `accountsFolders` |
| M1 | [Mimestream profiles](https://mimestream.com/help/user-guide/managing-profiles): account grouping plus a separate schedule/Focus surface |
| M2 | [Mimestream compose settings](https://mimestream.com/help/user-guide/composing-settings): Undo Send delays delivery; after its grace period the message cannot be unsent |
| M3 | [Mimestream Snooze](https://mimestream.com/help/user-guide/snoozing): app-local implementation, not Gmail snooze integration |

The [official Mimestream release history](https://mimestream.com/releases), checked 2026-10-06, corroborates Quick Navigation, search/profile/filter evolution and recurring focus, selection, identity, attachment and sync failures. Its most useful planning lesson is to budget for state correctness and regression coverage rather than treat each feature label as a small cosmetic task. It does not establish Thunderbird feasibility.

## Explicit corrections to the input assumptions

- Multiple P0 labels and 9.x scores do not produce an executable order. Feasible native navigation/rows come before unqualified conversation/scheduler subsystems.
- A signature/attachment/formatting convenience is not automatically an absent Thunderstream requirement when Thunderbird already owns that surface. Native reuse must be tested, not presumed.
- Profiles are account groups in Mimestream; separate Thunderbird profiles/processes provide a different workflow. Grouping itself does not isolate notifications or permissions.
- Undo Send is pre-delivery delay. Snooze has local state and cross-device limitations. Neither is a tiny frontend button feature.
- Menu spacing that improves scanning or focus belongs in frontend work. Pure decoration can wait; a color skin alone is not adequate frontend completion.
- Theme and core versions need not be equal, but their bytes and source provenance must be recorded. The inactive companion is not a shipped UI capability.

The current [roadmap](superpowers/plans/2026-10-06-mimestream-roadmap.md) translates these decisions into bounded slices. App task status is in the vault Markdown build board.
