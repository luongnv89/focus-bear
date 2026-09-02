# Privacy Policy

**Last updated:** November 29, 2024

## Overview

FocusPaw is a privacy-first Chrome extension designed to help you track and improve your browsing focus habits. We are committed to protecting your privacy and being transparent about our data practices.

**The short version: All your data stays on your device. We don't collect, transmit, or store any of your personal information.**

## What We Collect

FocusPaw collects the following data **locally on your device only**:

- **Domain visit counts:** The number of times you switch to each website domain (e.g., "twitter.com: 5 visits")
- **Visit timestamps:** When you visited each domain (used for time-based filtering)
- **User preferences:** Your settings, limits, and configuration choices

## What We Do NOT Collect

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

FocusPaw requests the following Chrome permissions:

| Permission | Why We Need It |
|------------|----------------|
| `tabs` | To detect when you switch between websites and track domain visits |
| `storage` | To save your visit data, settings, and limits locally |
| `notifications` | To show countdown alerts when approaching your limits |
| `declarativeNetRequest` | To block access to sites when daily limits are exceeded |
| `declarativeNetRequestWithHostAccess` | To dynamically add blocking rules for specific domains |
| `host_permissions (<all_urls>)` | Required to track visits across all websites you browse |

## Third-Party Services

FocusPaw does not use any third-party services, analytics, or tracking. The extension operates entirely offline once installed.

## Children's Privacy

FocusPaw does not knowingly collect information from children under 13. The extension is intended for general audiences who want to improve their browsing habits.

## Open Source

FocusPaw is open source. You can review our code at any time:

**Repository:** [https://github.com/luongnv89/focus-paw](https://github.com/luongnv89/focus-paw)

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last Updated" date and notify users through the extension update notes.

## Contact

If you have questions about this privacy policy or FocusPaw's data practices:

- **GitHub Issues:** [https://github.com/luongnv89/focus-paw/issues](https://github.com/luongnv89/focus-paw/issues)
- **Repository:** [https://github.com/luongnv89/focus-paw](https://github.com/luongnv89/focus-paw)
