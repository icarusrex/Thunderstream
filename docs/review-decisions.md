# Historical foundation review decisions

Superseded where noted by [audit remediation](audit-remediation.md). This records earlier decisions, not current release behavior.

Five important findings were reproduced and fixed: stable pagination identifiers, explicit sending identities, global/per-tab layout restoration and reset without a mailbox, IME-safe picker keys, and durable Send & Archive failure reporting. Regression tests cover these cases.

## Remaining decisions

- Ruling: Native macOS Thunderbird testing is unavailable. Ship a foundation pre-release with no enabled native UI profiles; complete the smoke checklist before real-mail use.
- Ruling: Trash uses the account's uniquely identified native Trash folder. Reject ambiguous destinations; no permanent delete permission.
- Ruling: Keyboard hooks and compatibility forwarding remain inactive scaffolds until exact-version native evidence exists.
- Ruling: Compact rows, rebuilt sidebar, compose styling, global overlay and native search entry remain unfinished; tokens are not claimed as those features.
- Ruling: Popup source-window focus needs native verification. No demonstrated wrong-tab reproduction supports changing the current capture path yet.
- Ruling: Nested editors and international delete keys require native tests before enabling any keyboard profile.
- Ruling: Future hook attachments must clean up partial mutations on exceptions. Current hooks are dormant and no fragile customization is enabled.
- Ruling: Ambiguous or queued sends never archive automatically. UI prevents immediate retries; native send-close behavior still needs verification. Do not add automatic retry.
- Ruling: Bulk actions use captured message IDs. A selection change after mutation starts may yield partial completion, but must never redirect work to newly selected mail.
- Ruling: Concurrent external tag updates can race the public read/update API, which has no atomic delta operation. Preserve observed unrelated tags and avoid automatic retries; native concurrency remains a limitation.
- Ruling: Superseded: Send & Archive IDs stay locked only while their compose tab exists; tab removal releases settled locks.
- Ruling: Native compatibility and unfinished UX are disclosed in release status; passing unit tests do not establish Thunderbird compatibility.
