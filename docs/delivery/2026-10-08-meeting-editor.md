# Meeting editor preview 0.2.4

Requested outcome: an Outlook-inspired meeting creation interface on the existing Thunderbird calendar engine.

## Implementation

The separate Meet add-on now presents a prominent title, attendees near the top, a dedicated Google Meet row, roomier scheduling controls, and a larger native rich-text notes area. Calendar choice, organizer, recurrence, reminders, attachments, notification options, native date/time controls, and native save/send commands remain available.

Adding or editing attendees still opens Thunderbird's native attendee scheduling dialog. Attendees and organizer are shown in the main form afterwards. The presentation applies even when automatic Meet is turned off, on the supported Mac Thunderbird 157.0.1 build 20261001134409. Task fields retain their native layout; the shared event/task window toolbar also receives the presentation styling. Unsupported builds retain the native presentation. Disabling the add-on restores moved nodes and removes its styling.

The native third tabpanel remains in place and native attendee-tab selection is redirected to the visible description tab. Closed event iframe documents release their presentation state.

## Review and qualification

Source review identified native tab selection and closed-document retention problems; both were addressed before packaging. No tests were added or run. Installed 0.2.4 in the everyday profile through native Add-ons Manager. The native editor visibly shows the redesigned title, attendee section, calendar, Meet row, scheduling fields, and notes/attachments tabs. The notes editor was observed after the window finished painting. Initial script-loading and viewport sizing errors were corrected during delivery. Calendar send/save behavior has not been exercised by this change. Blank drafts used to display the delivered interface were closed without saving or sending. Scroll wheel behavior through computer control was inconclusive; the native document reports an overflowing scrollable viewport.

## Google Meet blocker

The current OAuth client's Google project is unavailable in the signed-in Cloud console. The visible project named Thunderstream is a different project. Enabling its Meet API alone would not repair the current connection. A correct desktop OAuth client and a new connection are required unless the current client's project becomes accessible.

The installed helper now distinguishes disabled Meet API and missing OAuth scope. The real reported failure is SERVICE_DISABLED. The configured project was not found in the Cloud project picker; no unrelated project API was enabled. Owner approval is pending for a new Desktop OAuth client in their accessible project.
