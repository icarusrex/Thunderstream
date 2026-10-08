# Meeting editor preview 0.2.5

Requested outcome: an Outlook-inspired meeting creation interface on the existing Thunderbird calendar engine.

## Implementation

The separate Meet add-on now presents a prominent title, attendees near the top, a dedicated Google Meet row, roomier scheduling controls, and a larger native rich-text notes area. Calendar choice, organizer, recurrence, reminders, attachments, notification options, native date/time controls, and native save/send commands remain available.

Adding or editing attendees still opens Thunderbird's native attendee scheduling dialog. Attendees and organizer are shown in the main form afterwards. The presentation applies even when automatic Meet is turned off, on the supported Mac Thunderbird 157.0.1 build 20261001134409. Task fields retain their native layout; the shared event/task window toolbar also receives the presentation styling. Unsupported builds retain the native presentation. Disabling the add-on restores moved nodes and removes its styling.

The native third tabpanel remains in place and native attendee-tab selection is redirected to the visible description tab. Closed event iframe documents release their presentation state.

## Review and qualification

Source review identified native tab selection and closed-document retention problems; both were addressed before packaging. No tests were added or run. Installed 0.2.4 in the everyday profile through native Add-ons Manager. The native editor visibly shows the redesigned title, attendee section, calendar, Meet row, scheduling fields, and notes/attachments tabs. The notes editor was observed after the window finished painting. Initial script-loading and viewport sizing errors were corrected during delivery. Calendar send/save behavior has not been exercised by this change. Blank drafts used to display the delivered interface were closed without saving or sending. Scroll wheel behavior through computer control was inconclusive; the native document reports an overflowing scrollable viewport.

## Google Meet connection and duplicate-draft fix

Owner approved a new Desktop OAuth client in the accessible Google project and accepted its API user-data policy. Enabled Meet API there, created a separate Desktop client, installed its private configuration in the Meet helper, and reconnected Google. The saved authorization matches the new client and contains a refresh token. Private credentials and account data remain outside this repository.

After the owner reported an error and two drafts, a native double-click on New Event reproduced the exact failure: the second request was rejected as already in progress and opened an unlinked fallback draft, while the first created a linked draft. The item WeakSet did not help because Thunderbird supplies a different event object for each activation. Version 0.2.5 uses a per-window opening guard until the operation finishes.

Owner explicitly requested testing. Added three regression checks: repeated activations yield one linked draft; a genuine failure opens one original draft and releases the guard; edits still pass through during creation. The duplicate check failed before the fix and all three passed afterwards. Built and installed 0.2.5 in the everyday profile. Native double-click checks for Home and OpenADR each opened one linked draft without an error. Closing each returned directly to Calendar. OpenADR remained selected in its draft. No draft was saved and no invitation was sent; native save/send behavior remains unqualified.
