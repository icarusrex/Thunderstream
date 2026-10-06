# Quick Open Account Groups Implementation Plan

> For agentic workers: use superpowers:executing-plans inline. Keep one final independent reviewer after the complete tested feature.

**Goal:** Save named account groups and scope the existing Quick Open folder destinations, with All accounts and explicit restoration/error behavior.

**Architecture:** Separate validated group storage from existing preferences. Bind a scope snapshot to each palette session and revalidate it before commands. Add a small native-control manager and palette selector, keeping native mail context intact.

**Tech Stack:** Existing ES modules, MailExtension public APIs, local extension storage, Node tests and Python package validation.

**Spec:** ../specs/2026-10-06-account-groups-design.md

## Constraints

Thunderbird minimum 140; no new permissions, dependencies, native layout writes or mail mutations. Groups scope Quick Open folders only. Names max 80, groups max 20, account IDs max 100. All accounts reserved/default. No em dashes in authored text. Canonical queue remains the vault BUILD.md.

## Ledger

- [x] Service/backend/select-key regressions fail before product changes.
- [x] Implement storage validation, serialized writes, scoped tokens and command validation; focused tests pass.
- [x] Test and implement palette selector/group manager, preserving query and keyboard behavior.
- [x] Full suite and reproducible rendered fixture pass; one final independent review.
- [ ] Source/package/install/startup evidence, draft PR, exact-head CI and vault/domain summaries updated.
- [ ] Native installed group manager/palette interaction remains explicitly open if the disposable test window cannot be selected.
