# Thunderstream build process

The authoritative app task board is the vault's `04-personal/Thunderstream/BUILD.md`. Todoist is reserved for Aron's own tasks; assistant development work belongs in project Markdown or GitHub. GitHub issues/PRs may represent implementation work when used; this Markdown board identifies the current next slice and links to them. Repo plans define designs and acceptance criteria. Avoid keeping conflicting live task lists in several places.

## Current delivery

Core 0.1.5 is tested and installed in the disposable profile. [Navigation delivery record](builds/2026-10-06-navigation.json) identifies source `935d472`, the installed package hash, saved logs, independent review and native acceptance. The original inventory below is retained as historical provenance.

## Initial baseline

See [2026-10-06 baseline](builds/2026-10-06-baseline.json). It is an inventory of existing artifacts, not a claim that packaging was rerun on that date.

Local source: `c1c22af6dbe90ca7997b24f55bf79306458f497e`, branch `feat/gmail-api-search`. GitHub main: `e20dd1e21bd7a52d2fc8fd9fb1eaa7eea48b30eb`. PR #4 is merged; the later local helper/theme/evidence work is not published on main. Do not attribute PR #4's CI to the later local revision.

Existing core/dark packages match the installed disposable-profile packages. All four dist packages match their corresponding current source directories. The installed helper's three code files match source on disk; its active process revision is not independently established. Component versions differ intentionally: core 0.1.4, Light/Dark 0.1.3, inactive UI companion 0.1.2.

## A delivery record answers five questions

1. Source: exact commit, branch, dirty state and the scope of any uncommitted changes.
2. Built: component version, package SHA-256, payload equality to source and helper code-file hashes. Native helper code is not bundled in the core XPI.
3. Checked: exact command, source revision/component state, result, useful counts, output path and material limitations.
4. Installed: exact profile, OS/Thunderbird version, component hash, install confirmation evidence, helper revision and any process-restart uncertainty.
5. Delivered: GitHub PR/CI head revision and public release assets separately from local development.

Never label a task Done because it was attempted, unit-tested, packaged or installed. A native UI feature needs the acceptance evidence required by its slice. Scaffold tests are not proof of native UI behavior. A theme is not the frontend. A Google error-mapper test is not live revoked-access recovery.

## Task state and decision log

Use Planned, Ready, In progress, Blocked, Verified or Deferred on the vault board. Each active item has one next action, its owning repo files/spec, acceptance evidence and a concrete blocker when applicable. Record decisions that change architecture, permission, persistence or delivery scope. Keep candidate features out of the active queue until their slice is selected.

At session start read the board, source status and relevant acceptance record. Resume the earliest unfinished step. Do not re-run already passed unchanged checks merely because the chat changed. At session end update changed state, evidence links and the exact next step. Record interrupted work as interrupted, not finished.

## Verification commands

The repository's relevant verification entry points are:

```text
npm test
python3 tests/gmail_helper_test.py
python3 tests/package_validation_test.py
python3 scripts/validate.py
python3 scripts/package.py
git diff --check
```

Run targeted meaningful checks for a product change, then the appropriate broader suite. Packaging writes `dist/`; inspect its four packages and hash them. Documentation-only changes need link/record consistency checks, not another full application suite unless a substantive concern justifies it. Record the new source state if code changes after testing. Python default discovery does not match this repository's helper filename, so use the explicit helper test command.

Before native qualification compare installed XPI hashes with the build record and compare installed helper code hashes. The shared macOS helper is a user-level component, not inherently isolated by a Thunderbird test profile. Do not copy, log or bundle the Google client configuration, Keychain entries, tokens, queries, real message content or profile mail files into a build record.

Record successful scenarios once against their exact package/source baseline. Extend testing for new changes, failures or remaining concerns. Live account changes and software installation follow their existing authorization requirements at the relevant action; preparing a package or a plan does not establish that installation or access has occurred.

## New record convention

Name a record `docs/builds/YYYY-MM-DD-<short-name>.json` and give it a stable `record_id`. Retain prior records; do not overwrite historical test results. Use separate evidence entries for automated, native, CI, package and installed-source checks. Null/Not verified means unknown, not success. If source equality is established after earlier native evidence, record equality explicitly rather than inventing that earlier run's commit hash.

## Resuming code development

The former search branch was squash-merged through PR #4. The current `codex/native-navigation` branch reconciles the later local follow-ups with remote main and contains the tested navigation delivery. Before subsequent work, inspect current branch/PR state and preserve that source history. Preserve local changes and commit history. Do not assume the public main contains this checkout's newer helper/theme behavior. Preparing a reviewable branch/PR is distinct from merging or releasing it.
