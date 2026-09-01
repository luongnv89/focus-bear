# Privacy Policy for FocusBear

**Last Updated:** November 29, 2024 (updated to reflect removal of the Google S2 favicon fetch — see issue #53)

## Overview

FocusBear is a privacy-first Chrome extension designed to help you track and improve your browsing focus habits. We are committed to protecting your privacy and being transparent about our data practices.

**The short version: All your data stays on your device. We don't collect, transmit, or store any of your personal information.**

## Data Collection

### What We Collect
FocusBear collects the following data **locally on your device only**:

- **Domain visit counts:** The number of times you switch to each website domain (e.g., "twitter.com: 5 visits")
- **Visit timestamps:** When you visited each domain (used for time-based filtering)
- **User preferences:** Your settings, limits, and configuration choices

### What We Do NOT Collect
- Page content or text you read
- Form inputs or passwords
- Personal identifying information
- URLs beyond the domain level
- Browsing history in Incognito/Private mode
- Data from Chrome internal pages (chrome://, chrome-extension://)
- Time spent on individual pages

## Data Storage

All data is stored **locally** using Chrome's built-in `chrome.storage.local` API. This means:

- Your data never leaves your device
- No data is transmitted to external servers
- No cloud sync or backup services are used
- No third-party analytics or tracking

## Data Usage

Your locally stored data is used exclusively to:

1. Display your browsing patterns in the dashboard
2. Calculate your focus score and streaks
3. Enforce daily visit limits you configure
4. Show statistics and insights about your habits

## Data Sharing

**We do not share your data with anyone.** Since all data is stored locally and never transmitted, there is no data to share.

## Data Retention

Your data is retained locally until you choose to delete it. You can:

- **Export your data:** Download your data in JSON or CSV format anytime
- **Delete specific domains:** Remove individual domain data from the dashboard
- **Delete all data:** Use the "Reset All Focus Data" option in Settings
- **Uninstall the extension:** This removes all extension data from your browser

## Permissions Explained

FocusBear requests the **minimum** Chrome permissions it needs. Each entry below records (1) what data the permission enables, (2) why it is required, and (3) whether the grant is automatic, optional, or removable.

### What data each permission touches

| Permission | What data it touches | Why it is required | Grant | Decision (4.5 review) |
|------------|---------------------|--------------------|-------|-----------------------|
| `tabs` | The URL of the active tab, the tab id, and the active-tab lifecycle events (`onActivated`, `onUpdated`, `onRemoved`) | Lets the background service worker observe *which* domain you switched to, so a visit can be recorded and the toast/block logic can run. We never read page content, form values, or browsing history beyond the current tab. | Required, auto | **Keep.** Removing it breaks visit tracking and toast delivery (there is no MV3 alternative for tab focus events). |
| `storage` | Nothing on the page — it grants access to `chrome.storage.local` only | Persists your visits, limits, streaks, settings, and notification history on this device. Without it, every Chrome restart would wipe your data. | Required, auto | **Keep.** The extension has no other persistence path. |
| `notifications` | Nothing on the page — it grants access to `chrome.notifications.create` | Sends OS-level warnings when you approach a limit, the encouragement message once a day, and achievement unlock alerts. The on-page toast UI does **not** use this permission. | Required, auto | **Keep.** All three notifications are user-facing; no equivalent in-page API exists. |
| `declarativeNetRequest` | Nothing on the page — it grants the `chrome.declarativeNetRequest` API | Replaces the deprecated MV2 `webRequest` blocking API. Required to install redirect rules that take you to the in-extension block page when a daily/5-hour limit is exceeded. | Required, auto | **Keep.** No MV3-compliant way to block/redirect without it. |
| `declarativeNetRequestWithHostAccess` | Same DNR API, but unlocks the `redirect` action (vs only `block`/`allow`) | Needed because the block page lives inside the extension; a `redirect` rule rewrites the request to a `chrome-extension://` URL. With only `declarativeNetRequest`, the extension could only show a blank error page, not the FocusBear block page. | Required, auto | **Keep.** Stripping it would regress the block page UX back to a generic error. |
| `host_permissions: <all_urls>` *(now `optional_host_permissions`)* | The origin of any page the extension acts on (only when blocking rules are installed) | DNR redirect rules must match against the origin they apply to. We need `<all_urls>` because the user can add a limit for *any* domain. | **Optional — requested at runtime the first time you add a limit** (no longer auto-granted at install) | **Replaced: `host_permissions` → `optional_host_permissions`.** The extension no longer asks for origin access at install time. Tracking and toasts work without it; only redirect-blocking is gated behind the runtime consent prompt. |
| `content_scripts: <all_urls>` | The DOM of any page a toast is shown on (only the injected `focusbear-toast-container` element) | The countdown toast must be injected into the user's page (it cannot live in the popup). The content script reads/writes only its own DOM nodes and does not call any page JS. | Implicit via `optional_host_permissions` once granted | **Keep** (downgraded from static to runtime-gated by the manifest change above). The toast container is the only DOM this content script touches. |

### Static vs. optional host access (and what changes for the user)

Before 4.5, `manifest.json` listed `<all_urls>` under `host_permissions`, so Chrome granted origin access to **every page** automatically at install time. After 4.5, the same entry lives under `optional_host_permissions`:

- On install, the extension asks for **zero** origin access.
- The first time you add a per-domain limit from the Blocking dashboard, Chrome shows a one-time consent prompt ("Allow FocusBear to read and change all your data on websites you visit?"). If you accept, redirect-blocking activates for every site you have a limit on. If you decline, the extension silently continues: visit tracking, streaks, the on-page countdown toast, and all visualizations still work — only the redirect-to-block-page is disabled.
- The grant is per-device and can be revoked from `chrome://extensions` at any time. Revocation is detected on the next `updateBlockingRules` call and the rules are simply not re-installed (see `hasHostAccess()` in `src/background/limits.js`).

### Other grant classes

| Class | Why no entry is needed |
|-------|------------------------|
| `webRequest`, `webRequestBlocking` | Removed in MV3; the extension uses `declarativeNetRequest` instead. |
| `cookies`, `history`, `bookmarks`, `geolocation`, `clipboardRead/Write`, `idle`, `topSites`, `contentSettings` | Not requested; the extension does not touch any of these surfaces. |
| `<all_urls>` in `content_security_policy` | The CSP is `script-src 'self'; object-src 'self'` — no remote origin is allowed; the `<all_urls>` here would only apply to a `connect-src`, which we do not set. |

## Third-Party Services

FocusBear does not use any third-party services, analytics, or tracking. The extension operates entirely offline once installed.

Specifically, no page in the extension (popup, dashboard, blocking pages, options) makes any request to a non-`chrome-extension://` origin. Earlier versions rendered a per-domain favicon image fetched from Google's public S2 favicon service; that fetch was removed so the privacy claims below hold against a fresh network capture. There is no remote logo, font, analytics, telemetry, error reporter, or favicon service used anywhere in the extension.

## Children's Privacy

FocusBear does not knowingly collect information from children under 13. The extension is intended for general audiences who want to improve their browsing habits.

## Open Source

FocusBear is open source. You can review our code at any time:
- **Repository:** [https://github.com/luongnv89/focus-bear](https://github.com/luongnv89/focus-bear)

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last Updated" date and notify users through the extension update notes.

## Contact

If you have questions about this privacy policy or FocusBear's data practices:

- **GitHub Issues:** [https://github.com/luongnv89/focus-bear/issues](https://github.com/luongnv89/focus-bear/issues)
- **Repository:** [https://github.com/luongnv89/focus-bear](https://github.com/luongnv89/focus-bear)

## Summary

| Question | Answer |
|----------|--------|
| Do you collect personal data? | No |
| Do you send data to servers? | No |
| Do you use analytics? | No |
| Do you use third-party favicons, fonts, or images? | No |
| Do you sell data? | No |
| Can I delete my data? | Yes, anytime |
| Can I export my data? | Yes, JSON or CSV |
| Is the code open source? | Yes |

---

**FocusBear** — Track your focus, privacy-first.
