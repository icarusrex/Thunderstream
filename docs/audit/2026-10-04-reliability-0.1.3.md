# Reliability and lifecycle continuation, 2026-10-04

Tested code: `197b3c2f0855c92315d166f51ae1b96b6e0dd4c5`, using the same installed 0.1.3 core artifact as the earlier local/Gmail runs. Thunderbird 157.0.1 on macOS 27.0.1. No extension code changed for this run. Local send tests used marked `.test` messages and the loopback-only POP/SMTP fixture. Gmail lifecycle checks opened only the existing marked synthetic messages in the owner-authorized account.

## Results

| Scenario | Native observation and independent outcome check |
|---|---|
| SMTP 451 temporary failure | One SMTP DATA attempt; Thunderbird displayed the temporary failure. No accepted delivery or folder membership change. Reopening the action showed the already-attempted lock. No automatic retry occurred. |
| Cancelled blank-subject prompt | Cancel Sending produced no SMTP DATA attempt, no accepted delivery and no folder membership change. The add-on action remained locked. The synthetic draft was discarded. |
| Double-click | Two clicks on the popup send control produced one SMTP DATA attempt, one accepted delivery, one Sent copy and exactly the intended original moved to Archives. Other Inbox members, Trash and Outbox remained unchanged. |
| Offline/queued archive guard | The add-on Send & Archive action remained pending while offline. Native Send Later queued one local reply and produced a failure/uncertainty result. There was no SMTP DATA attempt or archive. On reconnection, native Send Now delivered that sole queued reply to the local sink, emptied Outbox and left the original in Inbox. This sequence verifies the archive guard; it also exposes N25 below. |
| Gmail disable/re-enable | Disabling the core removed the Thunderstream action controls. Native display of the marked IMAP message and its Work tag still worked. Re-enabling restored the palette and recognized Gmail as the current account. No Gmail message mutation was performed. |
| Full restart | The test process exited and the same disposable profile was relaunched. The core remained enabled and Send & Archive remained off. Gmail displayed the marked message from IMAP, retained its Work tag and restored the palette. Get Messages completed without a Gmail credential prompt. The local fixture requested its intentionally unsaved dummy password; that prompt was cancelled. |
| Gmail server state after lifecycle checks | Exactly the five known synthetic messages remained. Messages 1/2 were outside Inbox, 3/4/5 were in Inbox, all retained Sent, the custom label remained on 1, and none were in Trash. |

The native Quick Filter text was not restored across restart. It was reapplied before opening a message. This filter belongs to Thunderbird; Thunderstream does not promise to persist it.

## N25: offline Send & Archive remains pending

Historical finding: the later [offline preflight correction and native result](2026-10-04-n25-offline-guard.md) supersedes this behavior for the tested explicitly offline entry path. The observations below describe the earlier artifact.

Reproduction: go offline without downloading messages, reply to a locally stored synthetic message, then activate Send & Archive. The compose window remains open with the popup action disabled. No immediate explanation or result appears in the observed sequence. Clicking native Send Later queues the reply and settles the pending operation as a send failure/uncertainty. The original is not archived, including after the later native delivery.

This is a usability/recovery defect observed on this Thunderbird build. It does not establish what happens on every supported version or after an arbitrary timeout. Diagnose the native offline send behavior and design an explicit guard or recovery path before calling the optional feature ready for everyday use. Do not replace this observation with a unit-test-only success claim.

## Remaining work

Sent-copy failure, archive failure after successful delivery, closing compose during a pending send, missing-attachment cancellation, multiple windows/accounts, VoiceOver, dark theme and a separate official ESR build remain unverified. Native outcome checks in this run were performed with local scratch scripts; the proposed reusable fixture verifier has not been implemented. Full unattended native UI testing also remains absent.

Send & Archive was disabled after testing. The test Gmail filter was restored. PR #3 remains open; no release, merge or marketplace submission was performed.

Development checks were rerun after the documentation updates: 121 Node tests, 8 Python tests, package validation and whitespace checks passed. These checks do not cover the newly observed native offline behavior.
