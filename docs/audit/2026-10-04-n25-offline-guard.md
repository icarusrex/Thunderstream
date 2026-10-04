# N25 offline preflight correction, 2026-10-04

This supersedes the pending-offline behavior for the explicitly offline entry path in the [historical reliability run](2026-10-04-reliability-0.1.3.md). It does not supersede that run's other findings.

## Change and development verification

Send & Archive checks the background's `navigator.onLine` before preparing a send and again after asynchronous archive planning. An explicit false value returns an offline explanation without calling send or archive. Because no send was attempted, the lock is released and a later deliberate retry is allowed. Existing locks after actual send attempts, confirmed-send archive requirements and the fixed conversation scope remain unchanged. There is no automatic retry or new permission.

Three regression tests failed before the correction and passed afterward: offline no-op/unlocked result, explicit retry after going online, and going offline during preparation. Full verification passed: 124 Node tests, 8 Python tests, resource/import validation, packaging and whitespace checks.

## Native evidence and artifact

Thunderbird 157.0.1 on macOS 27.0.1, previously authorized disposable profile and synthetic loopback account. The updated development XPI has version 0.1.3 and SHA-256 `7d0854a3bf60f89d31fe262cb5b1df2708ee1ea85736841232a011e0fea50e99`. The installed XPI matched this hash after the update. The earlier artifact remains separately preserved for historical tests.

While explicitly offline, replying to the marked local reliability message and activating Send & Archive immediately displayed: "Thunderbird is offline. Go online and try Send & Archive again, or use Thunderbird’s Send Later. Nothing was sent or archived."

Independent comparison against a pre-action baseline verified zero new SMTP DATA attempts, zero accepted deliveries, zero queued messages and unchanged membership in Inbox, Archives, Sent, Trash and Outbox. This is native evidence for the original offline entry defect, rather than a unit-test-only result.

## Limits and current disposition

N25 is Fixed-N for the exercised explicitly offline preflight on this build. The test session subsequently closed before a same-compose native reconnect/retry could be completed. That native recovery check remains unverified; the deliberate retry service behavior is covered by the regression test. No post-interruption setting restoration is claimed. Send & Archive should remain off outside deliberate tests while ambiguous-send qualification is incomplete.

An online flag does not establish SMTP reachability or guarantee a send will finish. Losing connectivity after the final preflight still uses the existing attempted-send guard. Sent-copy failure, archive failure after delivery, closing during send, missing-attachment cancellation, multiple windows/accounts and other supported Thunderbird builds remain unverified. PR #3 remains open; no release, merge or marketplace submission occurred.
