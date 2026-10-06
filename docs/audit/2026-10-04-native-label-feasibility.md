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

## MailExtension identity check, 2026-10-05

The supported API documentation confirms that Thunderbird's `MessageId` is an internal tracking number, not the RFC `Message-ID` header. It does not survive a restart and does not follow a message moved to another folder. `MessageHeader.headerMessageId` is the RFC header value, so it cannot replace the internal ID as a unique cross-folder key. `MessageHeader.tags` reports Thunderbird tag keys, while `folders.query({isTag: true})` can enumerate virtual tag folders. Folder IDs are valid for a session and are invalidated if the folder is renamed or moved. See the [messages API](https://webextension-api.thunderbird.net/en/mv2/messages.html) and [folders API](https://webextension-api.thunderbird.net/en/mv2/folders.html).

This rules out persisting a Thunderbird message ID across a label move or restart, and rules out treating RFC `Message-ID` as a guaranteed unique join key. The native UI probe remains useful, but it does not prove that `messages.copy`, `messages.move`, `messages.get`, and virtual tag-folder queries expose the same mapping to an extension.

### Next safe probe

Use only the disposable Gmail profile and its unique synthetic message. Record the selected message's account ID, current folder ID, Thunderbird message ID, RFC `Message-ID`, and visible label memberships. Through a temporary diagnostic using only supported MailExtension APIs, inspect `messages.get`, `messages.query({folderId})`, `folders.query({isTag: true})`, and `messages.tags.list()` before and after one add and one remove. Observe `messages.onCopied` and `messages.onMoved` to correlate any replacement IDs within that operation. Confirm through Gmail that the synthetic message keeps Inbox and unrelated labels, and check for duplicate server messages. Do not infer success from matching subject or RFC `Message-ID` alone.

The currently open Thunderbird window is not the disposable Gmail test profile, so no live API mutation was performed for this identity check.

## Test profile availability follow-up, 2026-10-05

The existing disposable profile is registered in Thunderbird Profile Manager as `Thunderstream Gmail Test`; the regular `default-release` profile remains the default. The test profile directory is already configured with the Gmail account and `thunderstream@local.invalid` add-on. Activity Monitor confirmed Thunderbird had the test profile's Gmail Inbox index and add-on package open. No mailbox action was performed during this availability check.

The computer-control surface continued to expose only the regular profile's `About Profiles` window, even while the test profile files were open in another Thunderbird process. The supported MailExtension API probe for `messages.get`, tag-folder queries and copy/move ID changes therefore remains unperformed. No account needs to be added again; resume by bringing the registered test profile window into view, then use only its unique synthetic message.

## Supported-API continuation, 2026-10-06

The earlier UI evidence is now extended by a [live supported-API probe](2026-10-06-label-api-contract.md). Copy addition and label-to-Inbox removal passed on a synthetic fixture, but moving the label reference to All Mail reported native success without removing its server label. The full picker remains unimplemented: the tested route cannot promise archived-preserving removal or complete membership/mapping. Fixtures were restored and no permission changed.
