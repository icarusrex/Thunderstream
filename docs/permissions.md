# Permissions and data

| Permission | Implemented reason |
|---|---|
| storage | Local settings and reversible-layout metadata |
| accountsRead | Inbox/Trash discovery and sender identity display |
| messagesRead | Selected-message metadata, pagination, existing tags and reply origin |
| messagesUpdate | Read/star state and tag changes |
| messagesTagsList | List existing Thunderbird tags through messages.tags.list (read-only; replaces the deprecated messages.listTags, which Thunderbird 157 logs as an error) |
| messagesMove | Native archive and explicit moves to Trash |
| compose | Open native compose/reply/forward and read compose identity/origin |
| compose.send (optional) | Explicit Send & Archive; requested in settings when enabling (off by default) |
| nativeMessaging (optional, 0.1.4 preview) | Explicit connection to the Mac Gmail search helper; requested on Connect Google account |

No messagesDelete, messagesTags (tag creation/deletion), message-source modification, arbitrary host access or analytics. The optional 0.1.4 helper requests Google's separate `gmail.readonly` scope and owns local Google credentials. No Gmail API key or token is bundled. Tags are listed with messages.tags.list (messagesTagsList, added in 0.1.2; Thunderbird shows it as "List message tags" on upgrade). messages.listTags remains only as a fallback for builds without messages.tags.list. Thunderstream does not create tags. Trash moves into the account's unique Trash folder instead of inheriting a potentially permanent deletion preference. Already-trashed messages cannot be deleted by this command.

messagesRead and compose are broad permissions. Their names allow more access than this implementation uses. Existing foundation workflows stay local. The separate Gmail search connection sends queries to Google and downloads metadata and selected raw message content, including any attachments, for native viewing. Google tokens remain in helper memory/Keychain, outside the extension. See [setup and limits](gmail-search-setup.md).

The optional UI experiment has broader application access than normal permissions imply. It is a separate add-on, has no verified native profiles, and must never be described as sandboxed by these core permissions. Independent packaging lets users disable it without disabling the core.
