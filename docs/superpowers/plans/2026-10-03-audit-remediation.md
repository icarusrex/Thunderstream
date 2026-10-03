# Audit remediation implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Correct verified audit defects, preserve mail safety and prepare sanitized publication.
**Architecture:** Public API core, independent themes and inactive companion. Failed/partial actions produce explicit outcomes. Unknown native behavior stays gated.
**Tech Stack:** JavaScript, Node built-in tests, Python zipfile.
**Spec:** docs/original-spec.md; external audit supplied 2026-10-03.

## Global Constraints
- No Thunderbird fork, backend, credentials or mail database replacement.
- No native compatibility claims without native evidence.
- No automatic resend or bulk retry.
- No personal email in generated commit history or release files.

## Review Focus
- Send API rejects after server acceptance: never enable retry automatically.
- Mixed-account partial mutations: report completed, failed and uncertain IDs.
- Restart/recycled tabs: preserve unresolved restore baselines; never restore another tab.
- Similar subjects are not conversation identity: do not archive by subject.
- Publication history and archives: privacy includes author/committer metadata.

### Task 1: Prevent shortcut and sending hazards
Files: extension/manifest.json, send-and-archive.js, background.js, UI compose/settings/identities; tests/send-and-archive.test.js, background.test.js, audit.test.js.
Interfaces: send service run(tabId) returns explicit status, forget(tabId) clears only closed-tab locks. Settings permission request occurs directly from user gesture before enabling.
- [ ] Add tests: no suggested command defaults; rejected/ambiguous sends stay locked; tab removal forgets lock; no preferred reply identity.
- [ ] Run tests and inspect expected assertion failures.
- [ ] Remove command defaults, default Send & Archive off, request send permission from settings, avoid automatic retry, scope result records per operation, disclose API identity limitation.
- [ ] Run targeted tests and full suite; commit.

### Task 2: Accurate bulk outcomes and accessible picker interaction
Files: triage.js, tags.js, ui/palette.html/js, ui/tags.js, new outcome/picker helpers; tests/triage.test.js, tags.test.js, audit.test.js.
Interfaces: mutations return outcomes[{id,state,accountId?}], counts and partial code. UI displays counts without retry. Picker uses combobox/listbox active descendant, skips disabled commands and permits leave-unchanged tags.
- [ ] Add mixed-star, mid-batch failures, fresh-tag read and picker navigation tests; observe failures.
- [ ] Implement uniform star target, per-item outcomes and immediate tag reads; wire accessible active command and tag reset controls.
- [ ] Run targeted tests and full suite; commit.

### Task 3: Honest restoration and inactive controls
Files: layout.js, capabilities.js, background.js, ui/settings.html/js; tests/layout.test.js, background.test.js.
Interfaces: restoreLayout retains unresolved prior-session panes and returns partial/pending. New persistent layout writes are blocked until disable cleanup is verified.
- [ ] Re-import layout module to reproduce lost baselines; test layout apply is unavailable.
- [ ] Keep unresolved records and truthful status. Disable density/keyboard/layout controls with preview explanation. Explicit restore instruction on reset.
- [ ] Run targeted tests and full suite; commit.

### Task 4: Deterministic packaging and validation
Files: scripts/package.py, validate.py; tests/package_validation_test.py; docs keyboard/compatibility/release-status/review decisions/design.
Interfaces: build_package(root,target) fixes ZIP metadata; validator resolves JS imports and requires explicit allow_experiments for companion.
- [ ] Add missing imports, unexpected experiments and differing mtime reproduction tests; observe failures.
- [ ] Implement deterministic packaging and validated import/resource boundaries. Update all completion/scope/docs claims.
- [ ] Run Node/Python/validation/build checks; commit.

### Task 5: Privacy and publication
Files: docs/audit-remediation.md, scripts/publication guidance and generated source/packages.
Interfaces: sanitized root commit with noreply author/committer, exact expected remote SHA for force-with-lease.
- [ ] Scan tracked source and git metadata for personal email; build sanitized publish checkout and bundles.
- [ ] Keep remote private until history can be rewritten; prevent future web commit email exposure.
- [ ] Publish if authorization/transport exists; otherwise deliver concrete artifacts and exact access blocker. No claim that cached/copied public metadata has been purged.
