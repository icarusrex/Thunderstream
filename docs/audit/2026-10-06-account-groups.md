# Quick Open account groups delivery

## Implemented boundary

Core 0.1.8 saves local named account groups and restores the selected group in Quick Open. The manager supports create, edit and delete using current native account IDs/names. The palette offers All accounts, preserves its query during group changes, filters concrete account folder destinations and reports unavailable membership. Unified and cross-account virtual tag destinations are omitted for a group; tag/starred filters retain current-folder wording. Native sidebar visibility, mail selection, senders, signatures, privacy and alerts are not configured by groups.

Storage is separate from ordinary settings/tag recency. Validation reserves All accounts, enforces unique trimmed names up to 80 characters, 20 groups and 100 valid account IDs per group, and strips unsupported fields. Mutations are serialized. Each palette captures its original tab/selection and group membership, receives a new token after a successful scope switch, and retains its prior token/preference on failure. Grouped concrete navigation holds the mutation queue through native folder lookup/update. Other actions continue to use their original native context.

## Verification and review

New backend, UI and keyboard regressions cover CRUD, names/membership, serialized creates, All/restoration, account deletion/API failure, stale scopes, distinct palette sessions, original native tab/exact returned folder ID, current-folder tags, failed switch recovery, reset and native select arrow handling. Saved failure/pass logs establish the implementation and review corrections. Total: 195 Node tests plus 11 helper Python and 10 package Python tests, all passing. Resource validation and whitespace checks pass.

One independent reviewer reproduced two P2 defects: group invalidation blocked unrelated mail actions, and a membership edit could complete during an awaited native navigation. Both were fixed with new failing-then-passing regressions and confirmed resolved by the reviewer. No remaining actionable findings.

The reproducible browser fixture copies production pages, background and group storage/routing. Only the native APIs and profile storage persistence boundary are synthetic. Through visible controls it passed create with Enter, edit with Space, delete, reserved-name feedback/form retention, query preservation, account-scoped destinations, All/Unified restoration, saved group restoration, missing-account fallback, inert account-name markup and account-list failure. The manager at 375px had no horizontal overflow. Selector arrow noninterception is covered by unit tests; browser ArrowUp on the closed macOS selector did not change it and is not claimed as native keyboard qualification.

Reproduce with `python3 scripts/groups-page-fixture.py /private/tmp/thunderstream-groups-fixture`, serve that directory locally, and open `ui/account-groups.html` or `ui/palette.html`. `?missing` supplies a removed-account group and `?offline` simulates a native account-list outage. Fixture actions cannot access real mail/accounts or send messages. Screenshots/DOM snapshots are in [rendered evidence](evidence-2026-10-06-groups/manager.txt); test logs in [build logs](../builds/2026-10-06-groups-logs/final-node.log).

## Package and deployment evidence

Tested product source: `a30c885c06782895cbc888f39790c0da8e9db872`. All four deterministic XPI packages exactly equal their source directories. Core SHA-256: `f5e8cfbfdd61c92748a60802f1e69d0d8d0c2279b7bd8d6b046ab688fb4738ab`.

Stopped only the process whose arguments identified the existing Thunderstream Gmail Test disposable profile. The regular-profile process remained running. Retained core 0.1.7 in a temporary rollback XPI, atomically installed 0.1.8 and restarted the exact profile. Installed bytes equal dist; sanitized startup metadata reports 0.1.8 active, userDisabled false and appDisabled false. [Build record](../builds/2026-10-06-groups.json) contains versions/hashes, installed identity and verification scope.

Installed native manager/palette interaction remains open because the computer tool selects the regular-profile window. Startup identity and browser fixtures do not qualify native runtime behavior. Existing actual alias/signature and installed search-page checks remain open. Public prerelease remains v0.1.2, development continues in [draft PR #5](https://github.com/icarusrex/Thunderstream/pull/5), and no regular-profile deployment occurred.
