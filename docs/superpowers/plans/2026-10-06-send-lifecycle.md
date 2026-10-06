# Send lifecycle implementation plan

Spec: ../specs/2026-10-06-send-lifecycle-design.md

## Task 1: Cancel removed compose tabs before sending

Produces: compose-closed result in createSendAndArchive and sendResultText.
Consumes: existing tabs.onRemoved -> forget, native compose/message APIs.

1. Add controlled promise tests for four pre-send closure positions and three post-attempt outcomes. Expected: pre-send tests fail because code continues to send or reports compose-check-failed; existing post-attempt guards pass.
2. Add lifecycle checks after asynchronous preparation and in pre-attempt error handling. Add explicit cancellation text. Expected: new and existing send tests pass.
3. Run npm test, Python suites, resource/whitespace validation. Bump core/package version to 0.1.10 and package all components.
4. One fresh-context final code review, address material findings with failing regressions. Keep native SMTP/Sent-copy/close timing unqualified.
5. Commit, install into stopped exact disposable profile, verify source/package/startup equality, push existing draft PR and verify exact-head CI. Update vault board and summaries.

## Review focus

No automated test proves actual Thunderbird close-event delivery timing, server acceptance or Sent-copy failure. Review native source and preserve conservative no-retry behavior after any attempted send. Existing archive identity/duplicate ancestry contracts are outside this bounded lifecycle correction and remain independently auditable.

## Execution ledger

Pre-flight: one service result code and its shared UI formatter; no API or permission changes. Inline execution under standing continue/develop/deploy/test authorization. Worktree codex/native-navigation is clean at baseline 192ac00.

Task 1: RED: targeted 24 tests, 19 pass and 5 fail. Three closed-preparation operations continued through send, rejected closed preparation reported the wrong result, and cancellation text was missing. GREEN: all 24 targeted tests pass. Full npm test: 243/243; Python suites: 21/21; validator and git diff --check pass. Exact packaged core also passes the 24 targeted tests.

Final review: fresh-context gpt-6-astra reviewer found no actionable defects. Reviewed pre-attempt cancellation and post-attempt lock/confirmation semantics against installed native source. Native close-event ordering, SMTP acceptance and Sent-copy outcomes are not qualified by this run and remain open; existing archive identity/ancestry contracts are unchanged. No review findings deferred and no implementation deviations.
