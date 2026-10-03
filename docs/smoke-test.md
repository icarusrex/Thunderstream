# Native smoke test

Run this matrix on actual macOS with separate official ESR and release builds. Use disposable test profiles and test Gmail/Google Workspace and ordinary IMAP accounts only. The rows below are the template; results from the 2026-10-03 native run on Thunderbird 157.0.1 with a POP/SMTP fixture are recorded in the [independent audit](audit/2026-10-03-independent-audit.md). Gmail and IMAP rows remain untested.

Create a clean profile with Thunderbird's Profile Manager (`/Applications/Thunderbird.app/Contents/MacOS/thunderbird -ProfileManager` on a conventional installation). Preserve your real profile and do not copy production messages. Install packages through native Add-ons Manager. Record exact OS/build/commit for each result.

| Scenario | Expected behaviour | Result |
|---|---|---|
| Startup/install/load | Stock application starts; extension loads without startup errors | Not tested |
| Inbox synchronization | Gmail and IMAP continue normal sync | Not tested |
| Native message display | Opens without changed content or security indicators | Not tested |
| Palette | Toolbar opens; filter/arrows/Enter/Escape work; source selection retained | Not tested |
| Shortcut conflict | No defaults assigned; native search, Quick Filter and Send Later unchanged | Not tested |
| Triage | Archive respects native account destination; mixed selection stars uniformly; unread updates | Not tested |
| Trash | Account-specific Trash used; already-trashed mail is not permanently deleted | Not tested |
| Selection changes | Open palette, change selection, execute: mutations abort | Not tested |
| Tag picker | Existing tags searchable; partial selection shown; unrelated tags retained | Not tested |
| Account navigation | Non-English inbox names work; unified folders remain native | Not tested |
| Compose/identity | Native From visible; no silent identity changes | Not tested |
| Successful Send & Archive | Test reply sent once; original message archived | Not tested |
| Failed send | Test server failure leaves original unarchived; action stays locked; check Sent/Outbox | Not tested |
| Offline/queued send | Original remains unarchived unless immediate send confirmed | Not tested |
| Archive failure after send | Sent reply not resent; archive failure visible independently of closed compose | Not tested |
| Repeated compose action | Double click never sends twice | Not tested |
| Layout apply/restore | New apply unavailable; legacy restore retains unresolved pane baselines | Not tested |
| Themes | Light/dark contrast and focus inspected at normal/Retina scales | Not tested |
| Resize/fullscreen | Native panes remain usable | Not tested |
| Disable/re-enable | Mail still works; native account/profile valid | Not tested |
| Optional UI companion | No verified profile means no hooks/key changes | Not tested |
| Future native keyboard profile | Typing, IME, # layout, thread order and cleanup verified before enabling | Not tested |

CI/Node tests validate program logic and package contents, not these application behaviours. Add evidence rows with OS, exact Thunderbird version, commit, date, result and observed limitation. Enable no native compatibility profile based on unit tests alone.
