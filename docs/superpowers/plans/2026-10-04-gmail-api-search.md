# Gmail API Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide one-account Gmail server search and exact native viewing through a separate read-only connection.

**Architecture:** An optional native-messaging helper owns desktop OAuth PKCE, Keychain storage and fixed Google API requests. The extension owns an explicit search page, paginated results and native opening of a server-fetched RFC822 File. Tokens never enter extension storage or UI.

**Tech Stack:** Existing dependency-free JavaScript, Python standard library, macOS Keychain, Thunderbird MailExtensions.

**Spec:** `docs/gmail-search-first-slice.md`, owner approved API approach and implementation on 2026-10-04.

## Global Constraints

- Read-only `gmail.readonly`; one connected account; no backend, mail mutations or automatic retries.
- Preserve existing mail workflows and optional send permission; PR #3 has since merged to `main`.
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

- [x] Write tests for literal Gmail query encoding, label/page preservation, metadata failure, identity checks, framing bounds, PKCE/callback state and no stored token in results.
- [x] Run Python tests; expect missing feature failures.
- [x] Implement OAuth with fixed endpoints and read-only scope; store refresh credentials only in Keychain. Helper reads only fixed Gmail endpoints; metadata first, raw content on selection, maximum 25 MiB.
- [x] Run Python tests; expect all pass. Commit native helper.

### Task 2: Extension integration

Files: `extension/gmail-search.js`, `extension/gmail-native.js`, `extension/ui/gmail-search.html`, `extension/ui/gmail-search.js`, background/manifest/validator, `tests/gmail-search.test.js`.
Interfaces: `createNativeClient(api).request(op,args)`; `createGmailSearch(client,api).handle(message,sender)` returns typed outcomes. Sessions bind query/account/page/result IDs; native display uses only server-fetched bytes.

- [x] Write tests: stale sessions, disconnect, duplicate Message-ID exact fetch, pagination binding, malformed/large chunks and untrusted requests.
- [x] Run Node tests; expect missing feature failures.
- [x] Implement optional nativeMessaging, palette entry and explicit Gmail search page. Connect needs a configured desktop client; setup copy clearly reports missing helper/client. External native viewer is labeled server copy.
- [x] Run full Node/Python suite and validator/packager; all pass. Commit integration.

### Task 3: Qualification and setup

Files: Google setup/privacy docs, release status, CI and user artifacts.

- [x] Exercise live helper protocol with owner-authorized OAuth against a single synthetic Gmail label; verify one search result and exact RFC822 retrieval.
- [x] Fresh whole-change review; reproduce and fix findings with regression tests.
- [x] Package test artifacts, open dependent PR and verify CI; PR #3 merged before PR #4 was retargeted to `main`.
- [x] Configure the owner-provided Google project and Desktop client for testing with the owner-approved account. Public verification and distribution remain out of scope.
- [x] Verify Thunderbird native display of the fetched File, including archived mail. Exact synthetic message opened on Thunderbird 157.0.1; scoped no-result search and local disconnect/reconnect also passed.
- [x] Verify opening when a duplicate RFC Message-ID exists in local account mail. Copied the synthetic Gmail result into a Local Folders probe with the same RFC ID; the API search still returned one result and opened a fresh exact server copy with mailbox actions disabled.
- [x] Verify uncached-message opening: a fresh label-scoped search opened the exact synthetic result as a newly fetched native server copy.
- [ ] Verify live Keychain token refresh and revoked-access recovery before everyday-use qualification.

Qualification note: live OAuth, Keychain reconnect, synthetic-label API search, archived search, no-result behavior, local disconnect/reconnect and native display of the exact message passed. An earlier isolated-profile launch attempt exited before display and was superseded by the successful native test. See the [live test record](../audit/2026-10-04-gmail-search-live.md) and [native-open record](../audit/2026-10-05-gmail-search-native-open.md). No API key, service-account key or hosted backend was created.
