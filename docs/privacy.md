# Thunderstream development privacy disclosure

This describes the unreleased 0.1.4 Gmail search preview. Public OAuth verification and distribution are not complete.

Thunderstream has no hosted mail backend, analytics or advertising. Existing Thunderbird accounts continue using Thunderbird's own storage, credentials and mail services.

The optional Gmail search helper connects directly to Google using a separate `gmail.readonly` authorization. It sends your search query, selected label and page token to Google. It retrieves label names, the connected account address and search-result sender, subject and date. Opening a result retrieves that exact message's full RFC822 content, including attachments, and passes it locally to Thunderbird for display. The permission allows reading mail, but this helper exposes no send, delete or label mutation operations.

Refresh credentials are stored in the current user's macOS Keychain. Access tokens remain in helper memory and never enter extension storage or UI. The local Desktop OAuth client configuration stays outside the public repository and add-on packages. No API key is used. A client ID is an application identifier, not an account credential.

Search results are held in the page and background session while in use. Raw message bytes are held temporarily for transfer to Thunderbird; Thunderbird may retain displayed message data under its own storage behavior. This preview does not maintain a background mail cache or log queries, message content or tokens. The project does not receive your mail or credentials.

Disconnect locally deletes this helper's saved Keychain credentials and invalidates its search sessions. It does not revoke Google's authorization grant; you can remove that grant in your Google Account settings. Disabling or uninstalling the add-on alone does not delete the helper, its configuration or saved Keychain credentials. Disconnect first if you want local credentials removed.

Thunderstream's use and transfer of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including its Limited Use requirements. See [setup and preview limits](gmail-search-setup.md) for what remains unverified.
