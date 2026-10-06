# Thunderstream product and build brief

Revised 2026-10-06 from the owner's Mimestream capability notes and the source at `c1c22af`. This is a planning refactor, not a claim that the expanded catalogue has shipped.

## Task specification

Use the 100-entry Mimestream reference catalogue to choose a maintainable sequence toward a calmer Mac mail workflow on stock Thunderbird. Compare each entry with inspected code, native Thunderbird capabilities, and recorded native evidence. Preserve the useful shipped workflows and the current optional read-only Gmail search. Add a traceable build process that identifies source, package, installed component, verification and release state separately.

Deliver a complete capability comparison, one current roadmap, a concrete next development slice, and a build baseline. App task status lives in the vault's `04-personal/Thunderstream/BUILD.md`; repo Markdown contains designs and evidence, and GitHub contains code review/CI/release history. Todoist is reserved for Aron's own actions; assistant development work stays in Markdown or GitHub.

## Intended use and assumptions

The owner-confirmed target is the useful Mimestream experience without another recurring mail-app subscription. Thunderbird remains an acceptable foundation and keeps its ordinary IMAP workflows. The Gmail search helper remains optional; Gmail-only conveniences cannot break non-Gmail accounts or native compose identities.

Assumption: the ranking in the attached notes expresses interests and perceived value, not authorization to implement 100 separate stories. The decimals do not establish build effort, feasibility or ordering. The previous six approved areas remain the committed product direction: labels, search, sidebar/favorites, rows, identity, keyboard. Newly emphasized workspaces and conversation presentation become explicit candidates with bounded feasibility work. They are not silently enabled by the reference document.

Assumption: prioritize daily navigation, message scanning, correct account context and reliable explicit actions over decorative parity. Native feature availability must be qualified on the actual installed build; a documentation entry is not a native test pass.

## Existing implementation

The 0.1.4 core has the palette, Thunderbird tag picker, explicit identity chooser, native triage, guarded Send & Archive, and a one-account Gmail server-search page. The 0.1.3 themes supply colors. The separate UI companion is an inactive 0.1.2 scaffold: `PROFILES=[]`, its experiment returns `nativeHooks:false`, density tokens are not mapped to native widgets, and layout capability is deliberately disabled.

The broader frontend is incomplete. `conversation.js` computes archive ancestry; it does not render a conversation. `navigation.js` offers special-use folders and Thunderbird tags; it is not a complete Quick Open of every folder/label. A tested keyboard guard is not an attached native listener. Local tags are not Gmail label membership. The Gmail result opens a fetched server copy with mailbox actions unavailable, not an integrated search-and-triage result.

## Product boundary

Keep Thunderbird's synchronization, MIME/HTML rendering, remote-content controls, contacts, calendar, attachments, native compose, signatures and send transport. Prefer public APIs and existing settings before a separately qualified compatibility companion. No fork, replacement mail engine, shadow full-message store, hosted push, remote scripts, AI service or persistent userChrome installation is proposed.

Current read-only Gmail access permits server search/read only. Full label mutation, server filters, responder administration and send access are separate designs and consent boundaries. Preserve existing permissions; do not broaden them just to simplify a plan.

Persistent native layout writes remain gated. A user-selected native layout is a user preference; an add-on applying preferences automatically needs a distinct Apply/Undo contract. Unknown native versions must fall back to stock behavior. Native From, security indicators, warnings, complete folder access and editor focus remain visible.

## What success means

The next delivery makes native destinations easier to find, establishes a readable native message-list baseline, and accurately labels missing UI capabilities. Search's remaining live authentication qualification can proceed independently of frontend development, while everyday-use claims remain gated.

Each completed slice has a source revision, exact package/helper hashes, meaningful automated evidence, native acceptance evidence when required, a visible limitation, and an updated build-board entry. Packaging, installation, local tests and CI are different states. No new build or test pass is inferred from a version number alone.

## Principal failure modes

1. Wrong account or stale message/folder mapping directs an action at unrelated mail.
2. A native hook consumes editor/IME input or survives disable/shutdown.
3. A layout or row enhancement hides sender addresses, security indicators or recovery/navigation controls.
4. A delayed send or snooze operation is lost or duplicated after restart/offline/clock changes.
5. Testing an older installed package or helper is reported as evidence for newer source.

The roadmap assigns these to the owning slice. No time estimate is asserted for an unqualified native hook or a new conversation subsystem.

## Design choices after stress testing

Recommend native UI plus public API navigation first. It provides useful improvement without making a new mail renderer a dependency. A narrow companion can follow only where source inspection and real lifecycle evidence justify it. A separate custom conversation reader is an architectural option if native capabilities fail the reading goals, requiring a new design rather than an assumed continuation.

Workspaces deserve a defined account-grouping contract, but their place above all other work in the notes is not supported by a measured current pain point. They follow the native frontend and identity baseline. Undo Send and Snooze are deferred because their names conceal delivery/scheduling state machines. Native signatures, filtering, remote-content controls and attachment conveniences should be audited for reuse instead of rebuilt.

Sources and the full 100-entry disposition are in [the capability comparison](../../mimestream-capability-comparison.md). The current delivery sequence is in [the roadmap](../plans/2026-10-06-mimestream-roadmap.md).
