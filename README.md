# Thunderstream — audit-remediated foundation 0.1.1

A local-first productivity layer for stock Thunderbird. **Not complete MVP 0.1; not tested in Thunderbird; not ready for real mail.**

Download and extract `thunderstream-source.zip` for source, tests, design, plans and native smoke checklist. The source remains archived because the GitHub connector cannot write this repository. The CI workflow inside the archive is not an active repository workflow.

The original requirements and audit-remediation report are provided separately for independent comparison. Four XPI packages are independently installable candidates, not verified releases. The UI companion is privileged, inactive and optional. No licence has been assigned.

## Audit corrections

No default command shortcuts; optional send permission requested from settings; uncertain sends stay locked; uniform multi-message stars; per-message bulk outcomes; immediate tag re-reads; accessible palette state; leave-unchanged tag controls; restart recovery baselines retained; inactive settings disabled; deterministic packaging and import/resource validation.

## Outstanding requirements

Conversation-wide archiving, Gmail labels, native reply-identity defaults in the palette, global palette/search, native keyboard triage, compact rows, rebuilt sidebar, compose styling, and native install/lifecycle/VoiceOver/Gmail tests remain open. New persistent layout changes are blocked until disable cleanup is verified. Existing 0.1.0 shortcut assignments must be cleared manually; existing layout changes may require explicit/manual recovery.

Thunderbird continues to own mail transport, storage, accounts, credentials, rendering and updates. No backend, analytics, replacement mail engine or automatic retry.

## Build from extracted source

Node 24 and Python 3.12, with no npm dependencies:

```sh
npm test
python3 tests/package_validation_test.py
python3 scripts/validate.py
python3 scripts/package.py
```

Test only in a disposable profile with test accounts. Read `docs/release-status.md`, `docs/audit-remediation.md`, `docs/permissions.md` and `docs/smoke-test.md` first.

## Publication privacy

This repository has fresh history using GitHub noreply metadata. The earlier history is retained in a private backup. Existing third-party copies and caches cannot be recalled by this replacement.
