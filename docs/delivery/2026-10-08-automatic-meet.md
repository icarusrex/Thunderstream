# Automatic Meet integration, 2026-10-08

## Prepared behavior

Thunderstream Meet creates a Google Meet space using the configured Google account, then appends its URL to the native new-event draft description. OpenADR calendar/organizer, attendees, location, native Save/Send and invitation updates remain unchanged. Edits and existing supplied Meet links are retained. Failure opens an alert and the original draft without a generated link; check it before sending.

This is a separate exact-build preview for Mac Thunderbird 157.0.1 / 20261001134409. Automatic mode is off until connected and enabled. Creating any new event draft can create a Meet space before guests are added. Cancelling a draft can leave an unused space. It creates no additional Google Calendar event.

## Access and installation

The calendar add-on uses an experiment API. Thunderbird grants broad application privileges to experiment add-ons, even though the source only wraps the native event-editor entry point. Installation of this permission is a separate explicit user step. Core and the inactive UI companion are unchanged.

The native helper grants only meetings.space.created plus OpenID email identity verification. The existing Desktop OAuth client can be reused, but its Google Cloud project must have Google Meet API enabled. The account address is absent from public source and saved only in private helper configuration. Credentials are stored separately in macOS Keychain. Gmail search authorization is untouched.

From the source repository, prepare or install the helper with a Desktop OAuth client JSON. Do not commit the credential file:

```sh
python3 native/install_meet.py --credentials '/absolute/path/to/google-client.json' --account 'your-google-address'
```

Install thunderstream-meet.xpi via Add-ons Manager, open its settings, click Connect Google Meet, choose the configured Google account, grant the requested Meet access, then enable automatic Meet. Different Google accounts are rejected. A linked Gmail mail account is not required.

To turn it off, uncheck automatic Meet, disconnect the Google connection if desired, then disable/remove the separate add-on. Disabling restores wrapped native functions; it does not remove links already saved in calendar events.

## Qualification boundary

Implementation is packaged. Independent source review found a missing timer import in the privileged calendar script; it was fixed and the reviewer confirmed no remaining actionable findings. Live Google authorization, actual native event interception, calendar organizer preservation after saving and invitation delivery are not yet qualified. No automated tests were added or run because they were not requested. No real invitation was sent. This record must not be presented as a completed live installation.

Google API: https://developers.google.com/workspace/meet/api/reference/rest/v2/spaces/create
