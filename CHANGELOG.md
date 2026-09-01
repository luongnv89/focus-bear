# Changelog

## v1.0.0 — 2026-09-01

> First official release of FocusBear. This version marks the completion of all P0–P4 development phases, including the core extension, landing page, and comprehensive security hardening.

### Breaking Changes
- **React Router 6 → 7** — API surface changed; upgrade guide in PR #67.
- **Lucide 0.x → 1.x** — Icon import paths changed; upgrade guide in PR #67.
- **React 18 → 19** — Peer dependency update; upgrade guide in PR #66.
- **ESLint 9 flat config** — `eslint.config.js` replaces `.eslintrc`; PR #64.
- **Node runtime policy** — Minimum Node bumped to 22 via `engines.node`; PR #63.
- **`<all_urls>` moved to `optional_host_permissions`** — Permission model changed for security; PR #55.

### Features
- **Focus Score** — Single-pass history computation with memoized streak tracking (PR #69).
- **Landing Page** — Dedicated marketing page for FocusBear Chrome extension (PR #13).
- **Help & FAQ Page** — Privacy information and feature explanations (PR #82).
- **Blocking Rules Page** — User-configurable domain blocking rules (PR #78).
- **Topography Graph Zoom** — Zoom in/out controls for the topology visualization (PR #67).
- **Node Policy + CI Lanes** — Runtime upgrade and CI matrix for Node 22/24 (PR #63).
- **P1 Secure & Patch** — Root + landing page security hardening with regression tests (PR #62).
- **P0 Stabilization** — Fixed SW duplicate listeners, deterministic builds, landing CI (PR #61).
- **Runnable Baseline** — Restored extension with smoke tests for P0 (PR #60).
- **Dev Setup** — Agent-runnable development environment with CLAUDE/AGENTS docs (PR #59).
- **Sharp 0.35.4** — Image processing library upgrade, removed focus-trap (PR #65).

### Bug Fixes
- **Category Matcher** — Label-aligned matcher drops substring false positives (PR #87).
- **Security: CSV Formula Injection** — Hardened CSV export against formula injection (PR #54).
- **Security: XSS** — Replaced HTML-string templating with safe DOM APIs (PR #76).
- **Privacy: Google S2** — Dropped Google S2 favicon fetches; reduced external calls (PR #82).
- **UX Cleanup** — Removed high-contrast, label counts, countdown, toolbar, insights (PR #78).
- **Storage Writer** — Serialized, bounded writer prevents race conditions (PR #68).
- **Netlify Builds** — Fixed base directory, npm ci, and install commands (PRs #52, #53, #54, #55).
- **Dark Mode** — Fixed domain label text visibility in topology graph (PR #67).
- **Label Readability** — Improved domain name label rendering in topology graph (PR #67).

### Performance
- **Dropped Redundant updateBlockingRules** — Removed unnecessary dynamic limits import (PR #81).
- **Single-Pass Focus Score** — Zero unnecessary `overallStreak` writes; one storage read per dashboard load (PR #69).

### Documentation
- **Node Runtime Policy** — Synced engines >=22 across all READMEs (PR #85).
- **Chrome Web Store** — Added permission justification and submission prep (PRs #12, #11).
- **Dev Setup** — Documented agent-runnable development workflow (PR #59).

### Dependencies
- **Dedupe Transitive Resolutions** — Nearest-parent upgrades eliminate duplicate resolution (PR #79).

### Other Changes
- **Visualization Refactor** — Split god function, introduced named constants, fixed comments (PR #80).
- **Date/Time Utils** — Unified date, time-range, and limit-form controller (PR #75).
- **Dead Code Removal** — Removed goals/achievements/insights/export-PNG subsystem (PR #70).
- **Dead Code Removal** — Removed remaining dead code paths (PR #74).
- **Coverage Program** — Added coverage program to enforce targets (PR #77).
- **CI Coverage Gate** — 60% line threshold with `fail_ci_if_error` (PR #86).
- **Pre-built Landing Dist** — Added pre-built landing page for Netlify hosting (PR #13).
- **Prettier Formatting** — Applied consistent formatting to dashboard files (PR #67).
- **Dashboard Height** — Content now uses full available height (PR #67).
- **Dashboard UI Simplify** — Simplified dashboard UI and fixed dark theme issues (PR #67).
- **Rebrand to Dark Mode** — Changed to dark-only mode with dark blue theme (PR #67).
- **Topology Responsive** — Graph now adapts to container size (PR #67).
- **Dashboard Typography** — Improved typography, colors, and visual hierarchy (PR #67).

### New Contributors
- None — all contributions by [@luongnv89](https://github.com/luongnv89).

**Full Changelog**: https://github.com/luongnv89/focus-bear/compare/v1.0.0...HEAD
