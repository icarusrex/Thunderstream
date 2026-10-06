# I01 bounded sender context correction

## Scope

Use the supported native mailbox parser for To/Cc/Bcc identity matching, flatten groups and compare only parsed nonempty email values. Preserve message-account priority, account-default fallback, fresh selection/identity validation and explicit native compose identity. If the parser fails or is absent, retain explicit choices and suggest the known account default. Do not infer an address from a display name.

Present inert address, account and suggestion reason on separate lines. Keep standard native button keyboard behavior and compose request/disconnect handling. Retain the native editor, signatures and sending. No new permissions, identity/account settings or mail mutations. Actual configured alias/signature switching remains a native qualification task after the test window can be selected.

## Ledger

- [x] Seven new regressions failed on the original code, including wrong identity suggestions from quoted names/groups, parser fallback and clearer context.
- [x] Minimal parser/UI correction; 162 Node +21 Python tests and package/resource/whitespace checks pass.
- [x] Production chooser browser fixture passes keyboard, inert account names, duplicate addresses, long wrapping and empty state. Independent review found no actionable defects.
- [ ] Source/package/install/startup identity, draft PR and CI evidence.
- [ ] Actual native aliases and per-identity signatures: requires reliable disposable-window selection.
