# Gmail-backed search: proposed first slice, 2026-10-04

Status: proposed design, not implemented or approved access. The owner identified native Google search as the likely highest-value feature. Recommend prioritizing this over sidebar/row polish and the label picker once the current reliability correction is reviewed.

## Product contract

Search one explicitly selected Gmail/Workspace account using Gmail query syntax. Default to All Mail; offer the current label as an explicit scope. Results should work for mail not fully downloaded locally. Keep local Thunderbird search separately identified. Offline, failed and incomplete requests must not masquerade as zero matches.

First prototype: a search field and a paginated, read-only results list showing sender, subject and date. No label changes, send, delete, AI, multi-account merging, background full-mail cache or new subscription service. Query suggestions and tokens can follow after correct plain-text search.

Native opening is a separate acceptance gate before calling the feature usable: prove a result opens the exact message in Thunderbird, including archived mail and duplicate Message-ID cases. Never map by subject or blindly select the first RFC Message-ID match. Until mapping is proven, the prototype is a search demonstration, not a complete native workflow.

## Recommended route and alternative

Recommend direct Gmail API calls from the local application through a separately authorized, read-only Google connection. `users.messages.list(q=...)` performs the search; `messages.get` supplies result metadata. Preserve page tokens, bind results to their account and Gmail message ID, and ignore stale replies after a newer query. Fetch only the information needed for this prototype even though the required read-only scope permits broader reading. No hosted mail relay is proposed.

This changes the foundation's current no-network-code architecture. It needs a registered OAuth client, a supported desktop authorization flow, safe local token storage/refresh/disconnect and explicit owner approval before connecting. Do not extract Thunderbird's existing credentials or assume they are available to ordinary add-ons. `gmail.metadata` is insufficient because Google disallows `q` with that scope; `gmail.readonly` is the proposed minimum search scope. No send or modification scope is proposed. Personal testing and broader distribution have different verification obligations to resolve before setup.

Alternative: Gmail supports full query syntax through IMAP `X-GM-RAW`, potentially using Thunderbird's existing connection. However, the installed Thunderbird 157.0.1 public `messages.query` interface does not expose raw Gmail search; its online query route is limited to NNTP Message-ID retrieval. An internal bridge would require a separately qualified privileged companion and stable IMAP/result mapping. That route's runtime feasibility remains unproven. It is not a drop-in extension of Quick Filter.

## Acceptance checks

- Compare exact returned server-message identities against a marked synthetic corpus: sender, phrase, exclusion, dates, label, attachment and combinations with OR.
- Include an archived message with body not cached locally; confirm it is found.
- Exercise more than one page, no matches, cancellation, offline, revoked authorization and throttling. Never present estimated counts as exact totals.
- Keep query account and scope visible; prevent late results from replacing the active query.
- Verify opening the exact native message before promoting the prototype to everyday use. Account-local duplicate Message-ID and missing local-copy cases are mandatory.
- Check documented Gmail API differences, particularly Workspace alias expansion and thread-wide matching. Avoid a claim of exact Gmail website parity.

## Evidence

- [Mimestream search behavior](https://mimestream.com/help/user-guide/searching): Gmail operators, default All Mail and full-word matching.
- [Gmail message list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list): query, paging, result IDs and scope limitation.
- [Gmail API search differences](https://developers.google.com/workspace/gmail/api/guides/filtering): alias and thread-wide differences from the website.
- [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes): read-only scope and distribution obligations.
- [Gmail IMAP extensions](https://developers.google.com/workspace/gmail/imap/imap-extensions): raw search and stable Gmail IDs.
- [Thunderbird messages API](https://webextension-api.thunderbird.net/en/mv3/messages.html): public query limitations; the installed 157.0.1 schema and ExtensionMessages module independently confirm the NNTP-only online path.

Decision to verify explicitly: accept a separate read-only Google connection for the API prototype, or first spend a bounded feasibility pass on the privileged IMAP route. Recommendation: the API prototype, with no connection or permission grant until its authorization design is reviewed.
