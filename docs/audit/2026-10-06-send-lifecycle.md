# Send & Archive lifecycle correction

## Result

Core 0.1.10 cancels preparation when compose-tab removal has been observed before sendMessage is invoked. It returns compose-closed, performs no send/archive and releases the unused lock. Checks follow compose details, original-message lookup and ancestor preparation; rejected preparation follows the same cancellation outcome. User-facing text explicitly says no send was attempted.

After invocation, removal is not evidence of cancellation. The pending operation remains locked until its native result settles. Confirmed sendNow plus outgoing header ID retains captured-original archiving. Rejected/ambiguous/queued outcomes never archive or automatically retry. Removed-tab locks are cleaned after settlement. This does not qualify actual server acceptance or Sent-copy failures.

## Verification

Eight added regressions: three closure positions, rejected closed preparation, pending-close successful send, pending-close rejected send, pending-close archive failure, and cancellation result text. Targeted baseline: 19 pass, 5 fail, with three incorrectly completed sends and two incorrect result messages. After correction all 24 targeted tests pass. Full suites: 243 Node, 11 helper Python and 10 package Python, total 264. Validator and whitespace checks pass. The 24 targeted tests also execute successfully from the packaged core payload.

One independent fresh-context review found no actionable defects. Installed Thunderbird source confirms outgoing headerMessageId is present for actually sent messages and native promises may reject when sending fails. The existing conservative no-retry rule remains appropriate. No permission, helper, archive-membership contract or UI layout change was introduced.

All four deterministic package payloads equal source. Only core was replaced in the stopped named disposable profile, with 0.1.9 retained for rollback. After restart core 0.1.10 is active, not disabled, and installed bytes match package/source. Regular-profile process was left running. Product commit b21098d has both GitHub checks passing on draft PR #5. See [build record](../builds/2026-10-06-send-lifecycle.json) for hashes, native schema/source fingerprints and logs.

## Remaining work

Native close-event ordering, actual same-compose reconnect, SMTP/Sent-copy and archive-failure qualification remain open. Current computer control selects the regular-profile Thunderbird window; no regular mailbox testing or deployment was performed. The separate [durable-reference contract audit](2026-10-06-durable-reference-contract.md) leaves D01 design-gated rather than exposing a guessed Copy Link action.
