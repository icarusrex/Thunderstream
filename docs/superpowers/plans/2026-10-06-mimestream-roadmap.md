# Thunderstream Mimestream roadmap

Live task status belongs to the vault's `04-personal/Thunderstream/BUILD.md`. This roadmap defines the delivery sequence and acceptance criteria.

**Goal:** Make stock Thunderbird easier to navigate and read, preserving the existing mail workflows and optional Gmail server search.

**Architecture:** Keep the public API core and native mail engine. Qualify built-in appearance and favorites first, then add narrow reversible native hooks only where needed and proven. Keep new Gmail mutation, conversation rendering and delivery scheduling behind separate contracts.

**Tech stack:** Existing JavaScript ES modules and native Thunderbird UI, independent theme manifests, optional Python/macOS Keychain search helper, Node and Python verification.

**Spec:** [Product and build brief](../specs/2026-10-06-product-roadmap-design.md). [Full comparison](../../mimestream-capability-comparison.md).

## Global constraints

- Stock Thunderbird remains the synchronization, rendering and sending engine; ordinary IMAP workflows continue to work.
- Current helper access is `gmail.readonly`, one connected account, no automatic mutation retries and no hosted backend.
- Preserve explicit account context, native From, security warnings, remote-content controls and full folder access.
- Do not map a Gmail result to mailbox mutations by subject or the first RFC Message-ID match.
- Thunderbird message IDs are session/operation references, not durable link or cross-folder identifiers.
- Themes change colors; rows, typography, pane behavior and conversations require distinct capability evidence.
- Unknown native builds attach no hooks. New persistent layout writes remain disabled until their restore contract is proven.
- Mailbox mutation qualification uses synthetic data in the disposable profile; external account-access changes remain separate actions.
- App tasks and blockers live in the vault Markdown build board. GitHub PRs, checks and release assets are evidence, not proof of a local revision's status.

## Priority order

| Order | Slice | Value and deliverable | Dependency and exit criterion |
|---|---|---|---|
| 0 | Build provenance and qualification lanes | One source/package/install/evidence baseline, one app task board | Exact component hashes and honest state, including outstanding live authentication and send reliability |
| 1 | Native frontend pilot and complete Quick Open | Readable native list/sidebar baseline; all native folders and existing favorites reachable by palette | Public API route first; actual display-mode checks, no hidden navigation; hooks remain inactive unless independently qualified |
| 2 | Genuine Gmail label contract | Resolve message identity and membership, then a searchable existing-label picker if safe | Synthetic API probe must prove preserved Inbox/unrelated labels and mapping around copy/move; otherwise redesign mutation route |
| 3 | Gmail search convenience | Suggestions and tokens over the correct literal query engine; clear account/scope and errors | Existing read-only connection and generation/session contracts; no claimed Gmail-web parity or native triage mapping |
| 4 | Account and compose context | Qualify actual aliases/native signatures, improve account/address visibility | Keep native editor and explicit sender; demonstrate gaps before adding signature/template machinery |
| 5 | Workspaces and conversation feasibility | Account groups with an All view; a defined reading contract for native vs custom conversation UI | Separate small specs and source probes; no promised notification isolation, new renderer or body rewriting |
| 6 | Durable links and selective compose extras | Exact account-qualified references; reuse native conveniences | Durable resolution, missing account/message and duplicate-header rules; defer custom OS URL schemes until designed |
| Later | Deferred stateful/platform work | Undo Send, Snooze, templates, advanced notifications, server administration | Independent durable state/security designs and demonstrated need |

The live search refresh/revocation check and Send & Archive reliability lane stay visible, but they do not block an unrelated read-only frontend/navigation slice. They do block claims of everyday-ready search or reliable delayed sending.

## Slice 0: Build and source baseline

Files: `docs/build-process.md`, `docs/builds/2026-10-06-baseline.json`, `docs/release-status.md`, `docs/compatibility.md`; the vault `BUILD.md`.

The baseline names source `c1c22af`, remote main `e20dd1e`, core 0.1.4, themes 0.1.3 and inactive companion 0.1.2. It records source equality for package contents and the installed core/dark/helper files. Retain the earlier local suite results without rerunning unchanged product code for every documentation edit. Local follow-up commits after merged PR #4 are not covered by that PR's green CI.

Exit: a reader can answer which revision is in source, which bytes are built/installed, which revision a check covers, what is public, and what remains unqualified.

## Slice 1: Native frontend pilot and Quick Open

**Relevant files:** `extension/navigation.js`, `extension/commands.js`, `extension/ui/palette.js`, `extension/ui/settings.html`, `extension/ui/settings.js`, `extension/ui/help.html`, `tests/accounts.test.js`, `tests/commands.test.js`, `docs/ui-selectors.md`, `docs/compatibility.md`. Later native hooks belong in `ui-compat/api/implementation.js`, `ui-compat/profiles.js` and `ui-compat/appearance.js`, not hidden inside the public core.

**Existing interfaces to preserve:** `listDestinations(api, tab) -> Destination[]`, `openDestination(api, tabId, destination) -> ActionResult`, `filterCommands(commands, query) -> Command[]`. Existing Destination fields include `id`, `title`, `keywords`, `folderId`, `rank`, `available` and optional `tagKey`.

1. Establish the native baseline on Thunderbird 157.0.1/macOS 27.0.1 using native Appearance options: vertical panes if the owner selects them, Card/Table view, available row metadata, density, full addresses, native Favorites/Unified folders and pane focus. Record actual coverage with before/after screenshots. A native preference recipe does not enable extension layout writes or imply body preview text is available.
2. Extend destination discovery to native folders and existing favorites, keeping current-account names visible, account boundaries intact, roots excluded and virtual folder modes respected. Use `folders.query({isFavorite:true})` for discovery with existing `accountsRead`; creating or changing favorite state is not part of this first slice. Folder references are refreshed rather than blindly persisted across rename/move.
3. Preserve substring search as a predictable baseline or define a small ranking contract before adding fuzzy matching. Do not make fuzzy search a prerequisite for all-folder coverage.
4. Verify `tests/accounts.test.js` for duplicate folder names across accounts, deleted/renamed destinations, unavailable virtual modes, empty favorites, ordinary IMAP folders and originating mail-tab preservation. Verify palette keyboard focus/Enter/Escape and readable disabled reasons. No message mutation occurs when navigating.
5. Package from the exact tested source and record artifact hashes. Qualify native navigation and readable rows at narrow/wide sizes, large text, dark/light and after restart. The new Light palette currently has source/package evidence only, so do not mark it natively qualified by comparison with Dark.
6. Only if native settings fail a specific frontend requirement, inspect the exact Thunderbird source and design one bounded hook. Native source/selector verification, apply/remove lifecycle, multiple-window targeting and cleanup after disable/partial attach are acceptance gates. Do not fill `PROFILES` with guessed selectors.

Exit: a useful navigation improvement and an evidenced native interface baseline. A reconstructed sidebar, a preview line and a custom conversation renderer are not required to declare this narrow slice done.

## Slice 2: Gmail label membership and picker

Files: `docs/audit/2026-10-04-native-label-feasibility.md`, new label-contract spec, then a focused label adapter/picker and regression tests if the route is proven. Existing `extension/tags.js` continues to mean Thunderbird tags.

Use the disposable profile's uniquely labeled synthetic corpus to observe supported `messages.get/query`, `messages.copy/move`, `messages.onCopied/onMoved` and folder discovery before and after one add/remove. Record account, folder, transient message IDs and per-message server membership; do not use Gmail's conversation-level row badges as per-message proof. Verify archived and Inbox cases, unrelated labels, duplicate RFC headers, concurrent changes and partial bulk outcomes.

Native UI Copy To/Move To evidence alone is insufficient. If public APIs cannot supply a correct membership/read/mutation contract, keep the picker unimplemented and document a separately authorized Gmail mutation alternative. Initial picker handles existing user labels only; create/rename/nest/system-label operations are excluded. Search server copies remain outside mailbox triage until exact mapping is designed.

Exit: a justified action route plus an independently reviewable picker spec, or a documented technical stop with an alternate route. No decorative multi-select UI is presented as complete membership control.

## Slice 3: Search convenience

Files: `extension/ui/gmail-search.html`, `extension/ui/gmail-search.js`, `extension/gmail-search.js`, `tests/gmail-search.test.js`, setup/privacy docs and a page-level fixture.

Preserve literal Gmail queries, explicit account/All Mail/label scope, captured pagination, generation/session invalidation, inert result text and exact Gmail-ID retrieval. Add initial label/operator/date suggestions without silently rewriting typed syntax. The UI displays the complete final query and scope before running it. Qualify IME, edited query while paging/opening, revoked/offline/throttled errors, empty results and changed account.

A browser fixture may verify page rendering and controls; service tests alone do not verify the frontend. Native search qualification remains bound to exact core/helper hashes. A Keychain reconnect/status check is not token refresh after expiry; opening a fresh temporary file does not prove native mailbox association. Do not revoke an external grant merely to close a task without the required account action authorization.

Exit: search convenience improves finding mail while retaining honest read-only server-copy behavior and explicit authentication limitations.

## Slice 4: Identity and native compose leverage

Files: `extension/identities.js`, `extension/ui/identities.js`, identity tests and a compose qualification record.

Preserve recipient-match/account-default suggestions and concrete From selection. Qualify actual configured Workspace aliases, forwarded/replied mail, native per-identity signatures and signature changes on identity switch with synthetic fixtures. Signature libraries, reply-only custom rules, templates and autocomplete learning are candidates, not gaps to rebuild automatically. Native subject/attachment warnings, formatting, paste behavior and recipient tokens get a qualification checklist before product code is added.

Exit: correct identity/signature behavior in the tested cases with native From retained and gaps precisely named.

## Slice 5: Workspaces and conversation presentation

These are two separate specs, not one frontend rewrite.

Workspaces: define named sets of accounts plus All, selection/scope restoration, mixed-account action boundaries and an obvious switcher. Grouping does not change Google permissions, provide a security boundary, or promise OS notification isolation. No replacement Thunderbird profile/process model is selected.

Conversations: define thread membership, selected message, per-message Reply/Reply All/Forward and read/star behavior, old-message expansion, quote/signature boundaries, attachment handling and missing/offline bodies. Start by qualifying native threading and reading. A new renderer, cross-folder body aggregate or quote rewriting exceeds the existing architecture and requires a separately reviewed design preserving native MIME/HTML/remote-content/encryption behavior.

Exit: feasibility and a small delivery contract for each. Keep a useful native message reader if the desired custom route is not maintainable.

## Slice 6: Durable links and later features

Durable links must resolve an exact message in an explicit account after restart, move and account removal, with duplicate-header handling. Thunderbird tracking IDs and temporary `.eml` URLs are not durable. Qualify an account-qualified Gmail link first where supported; do not invent a cross-provider URI contract.

Undo Send means a cancellable delay before delivery. Its design owns pending draft storage, restart/offline behavior, timeout, edits, duplicate sends and when Send & Archive can archive. Snooze owns a durable local schedule, original membership, timezone/DST changes, sleep/offline catch-up, cancellation and multi-device expectations. Neither belongs in a cosmetic frontend task.

Use the complete comparison to retain deferred native conveniences and excluded product machinery without creating 100 active tasks.

## Review focus and validation

| Condition | Owning slice | Required evidence |
|---|---|---|
| Stale folder/message or wrong-account context | 1, 2, 6 | Fresh resolution, explicit account labels, duplicate/missing cases, no unintended mutation |
| Native editor/IME/focus and hook cleanup | 1, 3 | Real native focus matrix plus lifecycle tests for any enabled hook |
| Security/sender/privacy controls hidden by UI | 1, 4, 5 | Large-text/narrow/dark/light screenshots; actual controls retained |
| Lost or repeated delayed actions | Deferred send/snooze specs | Durable state and restart/offline/clock fault cases before implementation |
| Older installed code tested as a new revision | Every slice | Build ledger with source/component hashes and installed identity |

Self-review: all 100 reference ranks have a disposition; duplicate features share workstreams; previous owner-approved scope is preserved; permission and renderer decisions remain explicit; native availability is distinguished from observed qualification; current code tests are not misreported as full frontend support. This plan intentionally decomposes subsystems instead of supplying speculative implementation detail for unqualified routes.
