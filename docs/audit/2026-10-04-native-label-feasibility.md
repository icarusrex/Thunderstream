# Native Gmail label feasibility, 2026-10-04

Environment: Thunderbird 157.0.1 on macOS 27.0.1, existing disposable profile and owner-authorized Gmail account. Installed core 0.1.3 SHA-256 `6cf9e4e2bcf1789ab34081a3b02bab5d9f1dd96dc3ff87902b3a856a20b480da`. No extension code or account configuration was changed for this probe. Only existing marked synthetic messages were selected; no additional Google access was requested.

## Native operation and server check

The unrelated same-subject synthetic message (message 4 in the earlier Gmail run) began in Inbox and Sent, without the custom test label. The same account's native Message menu Copy To action copied it to the existing test-label folder. Thunderbird reported one copied message. A matching Gmail connector read confirmed the original server message had gained the custom test label, remained in Inbox and Sent, and was not in Trash. Exactly five existing synthetic server messages remained; no sixth message was created.

The message was then selected from the test-label folder, with the synthetic Quick Filter still applied, and moved through the native Message menu Move To action back to the same account's Inbox. Thunderbird reported one moved message. Gmail confirmed that the custom test label was removed from that message, Inbox and Sent remained, and Trash was absent. The original labeled synthetic message retained its test label. Five synthetic server messages remained.

## What this proves

On this account/configuration/build, Thunderbird's native same-account Copy To and Move To workflows can supply basic Gmail label addition/removal without a separate mail engine, a new Google OAuth flow or a new recurring service. The selected message was already in Inbox before removal, so this probe also verifies that moving its test-label view to Inbox did not create an extra server message.

## What remains unproven

This is native UI evidence, not a shipped Gmail picker or a runtime test of the corresponding MailExtension calls. It does not establish complete label membership discovery, stable cross-folder identity mapping, arbitrary destination semantics, removing a label while preserving an archived state, nested/hidden labels, concurrent label edits, bulk outcomes, or multiple accounts.

Before implementation, inspect supported folder/message APIs and qualify the exact message mapping. Do not identify a server message by subject or infer Gmail labels from Thunderbird tags. Keep label creation, nesting, colors and system-label changes outside the first action slice. A narrow native route remains worth investigating; a complete Gmail API bridge is not yet justified by this probe alone.
