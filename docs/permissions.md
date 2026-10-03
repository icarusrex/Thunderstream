# Permissions and data

| Permission | Implemented reason |
|---|---|
| storage | Local settings and reversible-layout metadata |
| accountsRead | Inbox/Trash discovery and sender identity display |
| messagesRead | Selected-message metadata, pagination, existing tags and reply origin |
| messagesUpdate | Read/star state and tag changes |
| messagesMove | Native archive and explicit moves to Trash |
| compose | Open native compose/reply/forward and read compose identity/origin |
| compose.send (optional) | Explicit Send & Archive; requested in settings when enabling (off by default) |

No messagesDelete, tag-creation, message-source modification, host access, Google API scopes, analytics or credentials. The current MV2 implementation uses messages.listTags, which requires messagesRead; it does not create tags. Trash moves into the account's unique Trash folder instead of inheriting a potentially permanent deletion preference. Already-trashed messages cannot be deleted by this command.

messagesRead and compose are broad permissions. Their names allow more access than this implementation uses. Core code does not fetch message bodies, attachments or credentials and sends no data to an external service.

The optional UI experiment has broader application access than normal permissions imply. It is a separate add-on, has no verified native profiles, and must never be described as sandboxed by these core permissions. Independent packaging lets users disable it without disabling the core.
