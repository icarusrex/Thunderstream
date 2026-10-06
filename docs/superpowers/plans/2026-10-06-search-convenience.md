# S01: read-only Gmail search convenience

## Contract

Append explicit Attachments, Unread, From and Subject suggestions. Use a native date input with After date and Before date buttons. Preserve all existing query bytes and append one separator only when required. Do not automatically submit, infer label names into Gmail syntax, rewrite queries, change account access or alter server-copy opening. Keep the label selector tied to returned label IDs.

Show account, label scope, Spam/Trash setting and literal query before submission. Render every field as inert text. Edits and accepted suggestions clear current results, invalidate pagination and cancel pending search/open generations. Suggestions remain unavailable while disconnected or composing and reject changes exceeding the existing 4096-character limit. Standard browser keyboard behavior remains native.

## Execution ledger

- [x] Page regression tests fail for missing convenience behavior.
- [x] Implement page controls/preview and bump only core to 0.1.6.
- [x] Focused and full tests, resource/package validation and whitespace checks pass.
- [x] Production page browser fixture verifies rendering, keyboard, dates and stale results.
- [x] Independent final code review, address evidenced findings.
- [x] Package/install equality and active 0.1.6 startup metadata verified.
- [ ] Native page interaction: computer surface selects regular profile; test window selection must be resolved.
- [x] Delivery evidence and vault board updated; final publication/CI outcome is recorded in the canonical BUILD.md after pushing draft PR #5.

## Qualification limits

Synthetic fixture browser tests do not qualify live OAuth/Keychain recovery or Gmail message mutation. Native installation remains limited to the disposable profile. Themes/helper stay at their existing revisions.
