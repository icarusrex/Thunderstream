# Quick Open account groups

## Intent and scope

Make the existing palette easier to use with several mail accounts by saving named account groups and selecting a group or All accounts. This is the first bounded part of W01, with UI grouping and restoration only. The group filters concrete account folder destinations in Quick Open. Native current-folder filtering, mail actions, sender choices, Gmail search connection, native account visibility and alerts retain their own explicit context.

## Contract

Groups are local to the extension profile, at most 20 groups, with unique non-reserved names up to 80 characters and one or more currently available account IDs (up to 100). All accounts is always present. A manager lists current account names, offers create/edit/delete, and shows unavailable membership. Existing settings remain separate from groups. Reset Thunderstream settings clears both groups and selection.

The palette restores the last successfully selected group for future palette openings. Each open palette keeps its own captured scope and original mail tab/selection. Changing a group obtains a new token and revokes the old token after success. A failed selection preserves the old preference and token. Cross-window changes to the selected preference do not retarget open palettes. Membership changes or account disappearance invalidate stale grouped navigation requests with a visible reopen message.

Concrete folders are filtered by returned account IDs. Native Unified Inbox and virtual tag folders span accounts and are excluded from grouped destinations. Tag and starred filters retain explicit current-folder wording. No native sidebar modes/preferences are written. Missing/empty saved groups fall back to All with a warning; partial groups expose unavailable membership. An account-list failure keeps ordinary palette actions usable and reports the group limitation.

## State and files

`extension/account-groups.js` owns validated storage and serialized mutations. Storage keys are `accountGroups` and `quickOpenGroupId`, separate from existing settings to preserve concurrent tag/settings saves. `background.js` owns scope snapshots/tokens and validates group scope before command execution. Palette selector and a small group manager use inert text and standard native controls. No new dependencies or permissions.

## Acceptance

Test group CRUD/validation, persistence, All, account deletion, stale scope/token, two simultaneous palette sessions, original tab/returned folder IDs, serialized creates, preference reset, API failure and native select keyboard behavior. A production-page fixture must exercise manager create/edit/delete, account membership, palette selection/filtering and visible warnings before deployment. Record package/source/install/startup identity, final review and exact-head CI. Native interaction remains a separate qualification until the test window is selectable.
