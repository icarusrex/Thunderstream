# Independent audit remediation — 2026-10-03

This records verification and decisions against the external audit. No native Thunderbird or VoiceOver runtime was available. Original requirements are in original-spec.md; this report does not redefine them.

| Finding | Disposition |
|---|---|
| H1 shortcut collisions | Default chords removed. Earlier installs must clear retained assignments manually; native shortcut verification pending. |
| M1 mixed star selection | One selection-wide target: star all if any are unstarred, otherwise unstar all. |
| M2 partial mutations | Per-message completed/uncertain/failed outcomes with counts. Rejected native batch calls are uncertain, not assumed rolled back. UI blocks automatic retry. |
| M3 restart restoration | Retain prior-session pane baselines, expose them for manual recovery, report partial restore. Never apply them to recycled tab IDs. |
| M4 palette accessibility | Combobox/listbox with active descendant and selected state. VoiceOver remains pending. |
| M5 inactive settings | Density, native keyboard and new persistent layout application are disabled with explanations. |
| M6 reply identity | Explicit chooser remains, alphabetical with no default or preferred identity. Warning directs users to native Reply/Forward for native identity rules. Removing identityId is rejected: official compose API docs say it uses the default identity, not the referenced message identity. TS-602 native-default compatibility remains incomplete. |
| M7 conversation archive | Open MVP blocker. Foundation archives only the replied-to message. No subject-based or unverified references-based thread inference introduced. |
| M8 disable presentation | New persistent changes gated. Earlier preview changes require explicit restore/manual pane recovery; automatic disable cleanup is unresolved. |
| L1 concurrent tag writes | Read each header immediately before its update. Public API still has no atomic delta; the final read/write race remains. |
| L2 send locks | Tab removal forgets completed locks; active work is retained until it settles. Uncertain sends remain locked while compose exists. |
| L3 send results | Serialized per-operation records, compose tab ID and timestamp; failure tabs bind to a result ID. Last 20 records retained; expired results say unavailable. No subjects/bodies persisted. |
| L4 reset wording | Instruct user to press Restore previous layout explicitly; no automatic restore is promised. |
| L5 interaction gaps | Arrow keys skip unavailable commands. Tag rows have an explicit Leave unchanged control. |
| L6 dormant mappings | Next/previous allowlist aligned; Alt-produced # supported by guard. Companion still inactive. |
| L7 build/validator/CI | Fixed ZIP metadata; validate JS imports, resource boundaries and explicit experiment opt-in. Workflow remains inactive until normal source-tree publication. |
| L8 stale documentation | Historical design status corrected, current limitations and publication state disclosed. No licence chosen on the owner's behalf. |
| P1 permission popup | Optional compose.send requested directly in settings when enabling. Native prompt behavior pending. |
| P2 ambiguous send rejection | After any attempted send, never automatically enable retry; direct user to Sent/Outbox. Native pre-send checks remain unverified. |
| P3/P4 invoking windows and standalone messages | Still require native source-window and messageDisplay integration. No global/standalone-message support claimed. |
| P5/P6 Gmail destinations and lifecycle | Native disposable-profile tests still required. |

## Privacy and publication

The original remote contained personal email in its root commit author metadata. It was made private and renamed Thunderstream-history-backup. Email privacy is enabled for future GitHub web operations; prepared local commits use noreply addresses. Public exposure from prior downloaded copies or caches cannot be recalled by changing visibility.

The GitHub connector has no repository installation and rejects writes. A fresh replacement at the same repository address is prepared through the signed-in browser, retaining the original as a private backup. The browser web-commit privacy setting provides noreply metadata; verify both new remote commits after publication and return to private immediately if metadata is wrong. Private commit API inspection is blocked by the connector. No remote deletion is required.

## Sources verified

- https://webextension-api.thunderbird.net/en/mv2/compose.html — API default identity caveat.
- https://support.mozilla.org/en-US/kb/keyboard-shortcuts-thunderbird — native search/filter/send-later shortcuts.
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository — rewriting history does not erase external clones or caches.

## Fresh remediation review

The fresh reviewer found two Important defects: concurrent result-record replacement and Enter on Leave unchanged submitting tags. Both reproduced and were corrected with regression tests, including focused-control interaction. The suite now has 81 Node tests and 8 Python tests. Minor deferred: reopening a locked compose action shows an unhelpful result-unavailable message; the lock still prevents sending again. This is foundation review evidence, not native compatibility evidence.
