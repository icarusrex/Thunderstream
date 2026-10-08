# Automatic Meet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Steps use checkbox syntax for tracking.

**Goal:** Automatically add a Gmail-hosted Meet link to a native Thunderbird event draft while preserving OpenADR identity.

**Architecture:** Separate scoped calendar experiment, options UI, native messaging helper and separate Keychain authorization. Generate before the native editor opens; preserve native saving/sending.

**Tech Stack:** Thunderbird 157.0.1 / 20261001134409 on macOS; JavaScript and Python standard library; Google Meet REST/OAuth.

**Spec:** ../specs/2026-10-08-automatic-meet-design.md

## Global constraints

- Do not change existing core, UI companion or Gmail search authorization.
- Exact Mac build gate. Automatic mode off until connected/enabled.
- No new tests or test runs unless owner requests them; higher-priority developer instruction overrides skill TDD.
- No real invitation sends. Google and broad calendar add-on permissions require explicit installation/consent.

## Review focus

Wrong Google account, disabled/closed windows receiving late results, malformed meeting URLs, partial helper installation, preserving organizer and native Send behavior.

## Tasks

- [x] Native Meet helper: bounded protocol, separate OAuth/Keychain, exact account check, fixed endpoint, no retry.
- [x] Calendar add-on: native entry-point wrapper, request settlement, disable cleanup, connection/options flow.
- [x] Package and independent source review. Preserve clear qualification limits.
- [x] Install and consent after owner authorization: Meet 0.1.1 installed; owner completed Google sign-in; settings reports automatic mode on.
- [ ] Actual new-draft link and save/organizer qualification remains unexercised; no tests requested.
