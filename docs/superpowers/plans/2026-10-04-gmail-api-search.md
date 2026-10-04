# Gmail API Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide one-account Gmail server search and exact native viewing through a separate read-only connection.

**Architecture:** An optional native-messaging helper owns desktop OAuth PKCE, Keychain storage and fixed Google API requests. The extension owns an explicit search page, paginated results and native opening of a server-fetched RFC822 File. Tokens never enter extension storage or UI.

**Tech Stack:** Existing dependency-free JavaScript, Python standard library, macOS Keychain, Thunderbird MailExtensions.

**Spec:** `docs/gmail-search-first-slice.md`, owner approved API approach and implementation on 2026-10-04.

## Global Constraints

- Read-only `gmail.readonly`; one connected account; no backend, mail mutations or automatic retries.
- Preserve existing mail workflows, optional send permission and PR #3.
- Explicit All Mail or Gmail label scope; failures never become zero results.
- Plain text rendering; no credential, query or message logging.
- Native server-copy viewing has no mailbox association; do not imply native archive/reply identity parity.
- No helper installation or Google permission grant until code and tests are reviewable.

## Review Focus

- Duplicate RFC Message-ID: fetch by Gmail ID and verify returned ID before native display.
- Sign-in callbacks: state, PKCE, loopback-only binding, timeout and no token disclosure.
- Late requests or disconnect: stale results cannot replace new query/account state.
- Partial page/expired credentials: show failure, never an empty successful result.
- Native frame limits and oversized email: bounded chunks, clear size errors and no arbitrary host commands.

### Task 1: Native helper

Files: `native/gmail_host.py`, `native/google_auth.py`, `native/install.py`, `tests/gmail_helper_test.py`.
Interfaces: helper receives `{id,op,...}`, returns `{id,ok,...}`; operations status, connect, disconnect, search, read, chunk. Search returns account email, items, nextPageToken; read returns an opaque chunk handle.

- [ ] Write tests for literal Gmail query encoding, label/page preservation, metadata failure, identity checks, framing bounds, PKCE/callback state and no stored token in results.
- [ ] Run Python tests; expect missing feature failures.
- [ ] Implement OAuth with fixed endpoints and read-only scope; store refresh credentials only in Keychain. Helper reads only fixed Gmail endpoints; metadata first, raw content on selection, maximum 25 MiB.
- [ ] Run Python tests; expect all pass. Commit native helper.

### Task 2: Extension integration

Files: `extension/gmail-search.js`, `extension/gmail-native.js`, `extension/ui/gmail-search.html`, `extension/ui/gmail-search.js`, background/manifest/validator, `tests/gmail-search.test.js`.
Interfaces: `createNativeClient(api).request(op,args)`; `createGmailSearch(client,api).handle(message,sender)` returns typed outcomes. Sessions bind query/account/page/result IDs; native display uses only server-fetched bytes.

- [ ] Write tests: stale sessions, disconnect, duplicate Message-ID exact fetch, pagination binding, malformed/large chunks and untrusted requests.
- [ ] Run Node tests; expect missing feature failures.
- [ ] Implement optional nativeMessaging, palette entry and explicit Gmail search page. Connect needs a configured desktop client; setup copy clearly reports missing helper/client. External native viewer is labeled server copy.
- [ ] Run full Node/Python suite and validator/packager; expect all pass. Commit integration.

### Task 3: Qualification and setup

Files: Google setup/privacy docs, release status, CI and user artifacts.

- [ ] Exercise real helper protocol against synthetic fixture, inspect rendered UI and native file opening where accessible.
- [ ] Fresh whole-change review; fix important findings with reproducing tests.
- [ ] Package test artifacts, draft dependent PR and verify CI. Preserve PR #3 open.
- [ ] Prepare new Cloud project/client setup. Hand off any terms, credential creation or new sensitive-access grant at the final action. Report live Google tests as pending until actually exercised.
