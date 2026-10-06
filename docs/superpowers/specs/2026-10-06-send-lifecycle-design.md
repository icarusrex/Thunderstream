# Send & Archive compose lifecycle

## Intent and contract

Continue R02 with a bounded reliability correction. A removed compose tab cancels preparation before the native send request starts. Report compose-closed and do not send or archive. Check after each asynchronous preparation stage, including rejected work. Release the unused lock after cancellation.

Once sendMessage has been invoked, closing its window cannot prove cancellation or unsend mail. Preserve the captured archive set and wait for the native result. A confirmed sendNow plus headerMessageId can archive; ambiguous, queued and rejected sends never archive or retry. Keep the in-flight lock until settlement even after tab removal, then clean it up. Other compose tabs remain independent.

No additional permission, delivery retry, persistent schedule, new renderer or scope expansion. Existing archive membership and native result contracts remain unchanged. Tests use production service and synthetic native API boundaries; they cannot qualify SMTP, Sent-copy failures or Thunderbird close-event timing.

## Acceptance

Reproduce closure during details, original-message lookup and reference lookup, and closure followed by rejected preparation. Verify zero sends/archives and an unlocked cancelled operation. Verify closure while sending blocks a duplicate until confirmation, then preserves captured archiving; rejected and archive-failed outcomes clean the removed-tab lock and never resend. Verify user-facing cancellation text says no send was attempted. Run complete suites and validators; review, package and install only in the existing disposable profile. Record exact source/package/startup/CI identities and remaining native gap.
