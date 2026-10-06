# Native Quick Open delivery plan

Spec: [Product brief](../specs/2026-10-06-product-roadmap-design.md). This executes the public-API navigation portion of F01 in [the roadmap](2026-10-06-mimestream-roadmap.md). Native card/table/vertical-layout options are qualified on the disposable profile; the broader native styling matrix remains a separate F01 follow-up.

Keep existing permissions, native message rendering, account boundaries and current-tab targeting. Query names, paths and Favorite state only. Do not create, move or delete mail/folders or write layout preferences. Do not guess native selectors. The source starts from `d01e0bb`, which reconciles the squash-merged public main with newer local authentication/theme/evidence work.

## Task 1: Discover ordinary folders and native Favorites

Files: `extension/navigation.js`, `tests/accounts.test.js`.

Interfaces: `listDestinations(api, tab)` returns the existing destination shape plus account identity for concrete folders. `background.js` consumes rank <=1 before settings and rank >1 after other actions; retain that behavior.

1. Add failing cases for nested ordinary folders, duplicate folder names across accounts, Favorite deduplication/ranking, root/virtual-mode exclusion, empty Favorites, and unavailable broad/Favorite discovery with preserved existing special-use navigation.
2. Run `node --test tests/accounts.test.js`. Expected: the new discovery cases fail because ordinary/Favorite destinations are absent; existing cases pass.
3. Implement fresh public-API discovery using `folders.query` with explicit non-root constraints. Include account and full returned path in ordinary folder titles/keywords. Favorite folders appear once and are searchable with favorite/favourite keywords. Do not reconstruct IDs from paths.
4. Run the targeted tests and whole Node suite. Expected: all pass. Commit the tested navigation discovery.

## Task 2: Revalidate destinations when opened

Files: `extension/navigation.js`, `tests/accounts.test.js`.

Interfaces: `openDestination(api, tabId, destination)` keeps `{ok,code}` outcomes. Re-read the original mail tab and use `folders.get(folderId,false)` before display; never substitute another account or guess a renamed folder path.

1. Add failing cases for a deleted/renamed destination, a mismatched/root folder, a mode changed since palette opening and an explicitly unavailable destination. Validate no mail-tab update when resolution fails and preserve tag-filter fallback when its virtual folder is no longer displayable.
2. Run the targeted tests. Expected: new stale/mode cases fail on the current implementation.
3. Implement fresh resolution and account/root/mode checks. Preserve originating tab, existing non-folder filters and honest failure codes.
4. Run the targeted tests and whole Node suite. Expected: all pass. Commit.

## Task 3: Build, review, deploy and qualify

Files: core/package version metadata, user help/status, a native navigation audit, a structured delivery record and the vault build board.

1. Bump the core to 0.1.5, keeping theme/helper components unchanged. Run the complete Node suite, both Python suites, resource validation, deterministic packaging and whitespace checks; save logs. Expected: all checks pass and package contents equal tested source.
2. Dispatch one fresh whole-branch review of product changes and carried local source differences from public main. Resolve meaningful findings with failing regression tests then rerun the suite. Expected: no unresolved critical/important defect.
3. Update the installed core in the existing disposable profile. Verify installed bytes equal the recorded build and native UI shows ordinary folder paths and Favorite destinations. Test typing/filtering, keyboard selection/Enter/Escape, current-account targeting, native Cards/Table preservation, enabled/disabled behavior and restart. Exercise only synthetic/local fixture folders for native navigation. Expected: navigation changes the source mail tab without message/folder mutation.
4. Record exact source revision, core version/package hash, installed identity, commands and native acceptance scope. Mark the navigation sub-slice Verified, keep unfinished frontend qualification visible, and link the next action. Retain prior baseline evidence.

## Review focus

Review account/path ambiguity, duplicate Favorite entries, discovery failures, stale/moved/deleted folder resolution, virtual-mode availability changes and originating-tab preservation. Confirm no mail/folder mutation, new permissions, persistent layout writes or native hooks. Distinguish tests and package/install evidence from broader frontend completion.
