# Automatic Google Meet invitations

Owner approved on 2026-10-08: fresh Meet link for new invitations, hosted by the configured Google account, OpenADR retained as organizer/sender, edits retain link, generation failures visible before sending. Owner's earlier instruction authorizes sensible implementation decisions and execution.

## Architecture

Separate calendar add-on and native helper. The existing core, inactive UI companion and read-only Gmail connection stay unchanged. On exact Mac Thunderbird 157.0.1 / 20261001134409, intercept native openEventDialog only for new event drafts. Create a Meet space before opening the native editor, add URL to description and an extension property; preserve calendar, organizer, attendees, location and all other fields. Existing Meet URLs and edit/task/view paths are retained. This creates a space for new event drafts before attendees are added, including drafts later cancelled; it does not create a second calendar event.

The native helper uses the existing Desktop OAuth client configuration in a separate installation directory. Request meetings.space.created plus OpenID email identity verification. The chosen account is stored in private local configuration; only that verified account is accepted. Store credentials separately in macOS Keychain. POST an empty JSON body to Google's fixed Meet spaces endpoint, receiving meetingUri. No event title, description, time or attendees are sent to Google. No automatic creation retries after uncertain responses.

The add-on requires Thunderbird experiment access to wrap the native calendar entry point. This is broad application access even though the implementation is narrowly scoped. Installation and live Google consent must be explicit, reviewable steps. Automatic mode is off until signed in and enabled. Other builds refuse native hooks.

## Behavior

Show a progress notice before the editor opens. On failure, alert with a concrete recovery message and open the original draft without a link. User chooses whether to proceed. Keep the native Save/Send pipeline, organizer and invitation updates unchanged. A new editor created from an existing Meet-bearing template keeps that supplied link. Cancelled drafts can leave unused Meet spaces; no invitations or duplicate calendar entries are created.

Restore original native functions when disabled. Ignore pending results for closed windows or disabled integration. Cap requests and reject malformed returned URLs. Disconnect turns automatic mode off and clears only the separate Meet credential. It does not revoke Gmail search.

## Delivery evidence

Source review and packaging are permitted. No new tests or test runs were requested. Do not claim installed or working until actual installation, Google consent and native draft link behavior have been observed. Do not send real invitations during development.
