# Referenced Messages Implementation Plan

> For agentic workers: use superpowers:executing-plans inline; one final fresh-context independent reviewer. Keep the existing isolated branch and test-first workflow.

**Goal:** List explicit same-folder message references and open exact selected items in Thunderbird's native reader.
**Architecture:** A separate ephemeral reference-view service owns metadata/snapshots/tab-bound sessions and fresh lookup. Background adds a capability-gated palette command and trusted routes. The page renders plain metadata and native controls.
**Tech Stack:** Existing ES modules, public MailExtension APIs, Node/Python tests and production browser fixture.
**Spec:** ../specs/2026-10-06-referenced-messages-design.md

## Review focus

Duplicate RFC IDs, paginated lookup failures, moved/reused native IDs, tab ownership/close/expiry, concurrent native opens, and lack of getHeaders must fail safely. No body retrieval or decrypted-content fallback.

## Task 1: Service and palette routing

Create extension/referenced-messages.js exporting createReferenceView(api, {now=Date.now}={}) with open(context), handle(message,sender) and forget(tabId). Open returns a result after creating ui/references.html?token=... in the original window. Handle supports references:init and references:open only for its owner tab/window/token. Responses contain whitelisted display metadata, scope and issue counts. Add background service and routes before palette-token validation; gate a references command on native headers/query/get/open APIs. Test in tests/referenced-messages.test.js plus background routes.

- [x] Write service and integration regressions, confirm meaningful failures before implementation.
- [x] Implement bounded header/reference lookup, owner/session validation and exact native opening; focused tests pass.

## Task 2: Page and delivery

Create extension/ui/references.html/js/css and tests/references-ui.test.js. Page preserves native buttons, inert metadata, scope/count notices, selected-item labeling and retry/refresh. Add scripts/references-page-fixture.py and tests/fixtures/references/boundary.js using the real service with synthetic native APIs. Version only the core/package manifest to 0.1.9 after review.

- [x] Write UI regressions, confirm failure, implement and pass.
- [x] Full suite, resource/whitespace checks and rendered browser qualification pass.
- [x] Independent final review and evidence-backed regression fixes complete.
- [x] Commit product, package and deploy only to the existing stopped disposable profile; retain rollback and record active startup identity.
- [x] Delivery evidence and draft PR summary prepared; final exact-head CI and vault/domain/portfolio status recorded after push.

## Rulings

Use getHeaders capability gating rather than a getFull fallback because the installed native header parser has bodyFormat none and newer API availability must not introduce a body/decryption path on older supported Thunderbird builds. Other core features remain available on Thunderbird 140.

Rendered audit correction: unreadable source headers use an unknown-list warning, distinct from counted failures for known individual references. Tests failed before the correction and passed after; reviewer confirmed the bounded change.
