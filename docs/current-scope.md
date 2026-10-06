# Current product scope, 2026-10-06

The owner-confirmed goal is a useful Mimestream-style Mac mail workflow without another recurring mail-app subscription, on stock Thunderbird with ordinary IMAP preserved. The current planning authority is the [Mimestream roadmap](superpowers/plans/2026-10-06-mimestream-roadmap.md), backed by the [product brief](superpowers/specs/2026-10-06-product-roadmap-design.md) and [100-capability comparison](mimestream-capability-comparison.md). The vault's Thunderstream `BUILD.md` is the app task tracker; Todoist is not used for this build.

The new reference catalogue changes planning priorities and exposes gaps. Its feature scores are proposed preferences, not implementation evidence, effort estimates or consent for new Google access. The previous six approved areas remain committed direction. Workspaces and conversation presentation are now explicit feasibility candidates, rather than silently assumed shipped features.

## Source, package and deployment baseline

Local source is `c1c22af`, on the existing `feat/gmail-api-search` branch. GitHub main was checked as `e20dd1e`, the merge of PR #4. Public prerelease remains v0.1.2. Current core 0.1.4 and Dark theme 0.1.3 are installed only in the disposable-profile evidence baseline; Light 0.1.3 is packaged but its revised palette has not been qualified natively. UI companion 0.1.2 is inactive.

All four dist packages match their current source directories. Installed core/dark XPI hashes match dist, and installed helper code files match source on disk. [Build baseline](builds/2026-10-06-baseline.json) and [build process](build-process.md) bind these facts to the local source and separate them from older GitHub CI evidence.

## Reconciliation

| Area | Actual current state | Next requirement |
|---|---|---|
| Native frontend and rows | Theme colors exist; row preview/spacing, typography and reconstructed sidebar do not. `PROFILES=[]`; native experiment reports hooks off; layout writes remain gated | Qualify native Appearance/Card/Table/Favorites and pane focus first. Implement public-API navigation; prove one native hook only for a demonstrated remaining gap |
| Quick Open and favorites | Palette navigates special-use folders and Thunderbird tags; arbitrary folder discovery, favorites integration and fuzzy matching are absent | Complete ordinary folder/favorite destinations with account labels and valid native modes, preserving originating tab and full navigation |
| Gmail labels | Thunderbird tags work; one native UI Copy To/Move To synthetic probe passed. No extension membership reader, stable mapping or Gmail picker exists | Qualify supported APIs and mapping around copy/move, including archived membership and duplicate headers; select a safe mutation route before picker implementation |
| Gmail search | One-account literal queries, All Mail/label scope, paging and exact server-copy retrieval exist. Synthetic archived/no-result/fresh-open/local-duplicate cases pass. Suggestions and triage integration are absent | Keep live Keychain refresh/revoked-access qualification visible; add suggestions only after preserving query/account/session contracts |
| Sender identity and compose | Explicit chooser plus recipient-match/account-default suggestions are tested. Native From/compose retained; automatic Gmail alias discovery, learned selection and signature library are absent | Qualify actual configured aliases and native signature switching before adding custom compose machinery |
| Keyboard triage | Native actions through palette and user-assigned modifier chord exist. Tested typing guards have no enabled unmodified-key profile | Qualify pane focus/editor/IME and native visible ordering; enable only a verified exact-build profile if justified |
| Conversations | Native reading retained. `conversation.js` plans same-folder archive ancestors; no custom conversation reader or quote-collapsing UI exists | Separate native reading feasibility from any new renderer design, preserving per-message action identity and rendering/privacy controls |
| Workspaces | No account-group switcher exists. Real Thunderbird profiles are separate profile/process contexts | Define account groups plus All, explicit scope and restoration; avoid promising notification or privacy isolation from grouping alone |
| Build tracking | Previously scattered state, tests and installed-package evidence | Vault Markdown board plus source/package/helper/install/CI records; every completion names its evidence |

## Existing safety and reliability evidence

Send & Archive fixes the archive set before send to the replied-to message plus referenced ancestors in the same folder. Successful synthetic POP/Gmail paths, local 550/451 failures, cancellation/double-click cases, queued-mail archive prevention and explicit-offline no-op have native evidence. Same-compose reconnect/retry, Sent-copy/archive failure after delivery and closing during send remain open. Keep its optional behavior tied to its qualification evidence.

Search opens an exact fetched server copy. It does not establish native mailbox association, archive/reply identity parity, multi-account search or Gmail-website equivalence. Local recovery tests cover controlled token behavior and `invalid_grant`; they do not close live expiry/revocation checks.

The core local suite last passed 133 Node and 21 Python checks plus source/package validation on unchanged product source in this chat. No later native or CI coverage is invented for these records.

## Boundaries and sequence

Build provenance is established first. Native frontend/Quick Open is the next development slice; genuine label semantics follow their identity/membership probe, then search convenience and compose context. Workspaces, conversation presentation and durable links are separate feasibility/spec candidates. Search's authentication qualification runs as an independent lane rather than consuming every frontend session.

Reuse native filtering, signatures, privacy, attachments, printing, calendar and contacts where their behavior is sufficient and qualified. Defer Undo Send, Snooze, templates, advanced notifications and Gmail administration until their own delivery/persistence/access contracts exist. Hosted push, AI integration, a mobile client, purchase UI and decorative OS effects remain outside this plan.

Preserve original TS stories and completed implementation history. The older foundation plan includes now-superseded privacy/licensing/search deferrals; it is historical evidence, not permission to undo later owner-approved architecture decisions. New Google permissions, automatic native preference writes and a replacement conversation renderer require their own concrete design and action consent where applicable.
