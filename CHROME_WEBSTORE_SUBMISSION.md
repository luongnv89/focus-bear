# FocusBear - Chrome Web Store Submission Checklist

**Last Updated:** November 17, 2025
**Current Version:** 0.1.0
**Target Status:** Ready for Chrome Web Store submission

---

## Executive Summary

This document provides a comprehensive checklist for preparing FocusBear for submission to the Google Chrome Web Store. The project is approximately 90% complete with core features implemented. Final preparation requires completing marketing assets, privacy documentation, accessibility audits, and submission procedures.

**Estimated Timeline:** 2-3 weeks (pending review by Google)

---

## Phase 4: Launch Preparation Checklist

### 1. Prerequisites & Accounts

- [ ] **Chrome Developer Account**
  - [ ] Create Google account (if not already existing)
  - [ ] Register Chrome Web Store Developer Account (https://chrome.google.com/webstore/devconsole/)
  - [ ] Verify email address
  - [ ] Complete developer profile with contact information
  - [ ] Set up payment information (one-time $5 USD registration fee)
  - [ ] Accept Chrome Web Store Terms of Service

- [ ] **Project Access**
  - [ ] Clone/access FocusBear repository
  - [ ] Install dependencies: `npm install`
  - [ ] Verify build works: `npm run build`
  - [ ] Test extension loads in Chrome

---

### 2. Code Quality & Final Build

- [ ] **Code Review & Linting**
  - [ ] Run `npm run lint` - ensure no ESLint errors
  - [ ] Run `npm run format:check` - ensure code formatting compliance
  - [ ] Review any warnings or issues

- [ ] **Production Build**
  - [ ] Run `npm run build` to generate production bundle
  - [ ] Verify `dist/` directory contains:
    - `manifest.json` (with updated version)
    - Minified JavaScript files
    - CSS files
    - Icon assets (16x16, 32x32, 48x48, 128x128 PNG)
    - All required HTML files

- [ ] **Version Management**
  - [ ] Update `version` field in manifest.json (e.g., "0.1.0")
  - [ ] `version_name` auto-updates with git hash via build process
  - [ ] Verify build includes git commit hash in version_name

---

### 3. Security & Permissions Review

#### 3.1 Manifest Security

- [ ] **Review manifest.json for compliance:**
  ```json
  {
    "manifest_version": 3,
    "name": "FocusBear",
    "version": "0.1.0",
    "permissions": [
      "tabs",
      "storage",
      "notifications",
      "declarativeNetRequest",
      "declarativeNetRequestWithHostAccess"
    ],
    "host_permissions": ["<all_urls>"]
  }
  ```

- [ ] **Justify each permission:**
  - `tabs` - Required to detect when user switches between tabs
  - `storage` - Required to store focus visit data locally
  - `notifications` - Required for countdown bubble alerts
  - `declarativeNetRequest` - Required to block requests when limits exceeded
  - `<all_urls>` - Required to monitor all websites for focus tracking

#### 3.2 Security Best Practices

- [ ] **Code Security Review**
  - [ ] Verify no hardcoded API keys or secrets
  - [ ] Verify no external API calls (privacy-first requirement)
  - [ ] Check for proper XSS protection (textContent vs innerHTML)
  - [ ] Verify input validation and sanitization
  - [ ] No obfuscated or minified code intentionally hiding functionality

- [ ] **Data Handling**
  - [ ] All data stored in `chrome.storage.local` (local-only)
  - [ ] No data synced to cloud or external servers
  - [ ] User can export all data via dashboard export feature
  - [ ] User can delete all data via settings panel

- [ ] **Content Security Policy (CSP)**
  - [ ] Review CSP in manifest: `"script-src 'self'; object-src 'self'"`
  - [ ] Verify inline scripts are avoided
  - [ ] Verify no unsafe eval() or dynamic script generation

---

### 4. Privacy Policy & Documentation

#### 4.1 Privacy Policy Document

Create a `PRIVACY_POLICY.md` file with:

```markdown
# Privacy Policy for FocusBear

## Overview
FocusBear is a privacy-first Chrome extension that tracks your focus-switching
habits entirely locally on your device.

## Data Collection
- FocusBear collects information about which websites/domains you visit and
  when you switch between them
- All data is stored locally on your device using Chrome's storage API
- No data is transmitted to external servers or third parties

## Data Storage & Deletion
- All data is stored in Chrome's local storage (chrome.storage.local)
- Users can clear data via the extension settings panel
- Data is automatically deleted when the extension is uninstalled
- Users can export their data at any time as JSON or CSV

## Permissions
- **tabs**: To detect when you switch between browser tabs
- **storage**: To store focus data locally
- **notifications**: To show countdown alerts
- **declarativeNetRequest**: To enforce per-site visit limits
- **<all_urls>**: To monitor all websites you visit

## Data Sharing
- FocusBear does not share data with anyone
- No analytics, tracking services, or cloud synchronization
- No third-party integrations

## Security
- All data remains on your device
- No authentication or account creation required
- No user tracking or identification

## Changes to This Policy
We may update this privacy policy. When we do, we will update the revision
date and notify users through the extension.

Contact: [Your Email]
```

#### 4.2 Store Listing Details

Prepare the following for the Chrome Web Store listing:

- [ ] **Extension Name:** "FocusBear"

- [ ] **Short Description (132 characters max):**
  ```
  Track your focus-switching habits with a playful, privacy-first D3.js
  visualization. 100% local, no tracking.
  ```

- [ ] **Full Description:**
  ```
  FocusBear helps you understand your browsing patterns with an interactive
  radial graph visualization. See which websites consume your attention, set
  daily visit limits, and get gentle reminders to stay focused.

  Features:
  • Real-time focus tracking across all websites
  • Interactive D3.js radial graph visualization
  • Time-range filters (hourly, daily, weekly, monthly views)
  • Per-site daily visit limits with countdown notifications
  • Humorous block page when limits exceeded
  • High contrast mode for accessibility
  • Export data as PNG, JSON, or CSV
  • 100% privacy-first — all data stays on your device
  • WCAG 2.1 AA accessible
  • No external APIs, analytics, or cloud sync

  Perfect for productivity enthusiasts, digital minimalists, and anyone
  curious about their digital habits.
  ```

- [ ] **Category:** "Productivity" (or alternate: "Developer Tools")

---

### 5. Marketing Assets

#### 5.1 Required Assets

All assets should be submitted as PNG files.

**Extension Icon** ✅ (Already exists)
- File: `assets/icon-128.png`
- Dimensions: 128×128 pixels
- Format: PNG
- Content: FocusBear panda logo
- Status: Ready

**Small Promotional Tile** ❌ (Needs creation)
- Dimensions: 440×280 pixels
- Format: PNG
- Content: Eye-catching promotional image for store listing
- Recommended: Show the radial graph visualization + bear mascot
- Guidelines:
  - Use brand colors (Bear Blue #0E75B6, Focus Purple #6C5CE7)
  - Include clear product name
  - Highlight key feature (visualization/tracking)
  - Should be easily readable when scaled down

**Screenshots** ❌ (Need creation: 1-5 recommended)

Minimum 1 required, preferably 5:

1. **Main Dashboard Screenshot** (1280×800 px recommended)
   - Show the D3.js radial graph
   - Include several domain nodes
   - Capture the "You" center node with surrounding domains
   - Title: "Interactive Focus Visualization"

2. **Time Filtering Screenshot** (1280×800 px)
   - Show time range filter controls (hour/day/week/month)
   - Demonstrate different graph layouts for different timeframes
   - Title: "View Your Habits by Time Range"

3. **Settings & Limits Screenshot** (1280×800 px)
   - Show settings panel with per-domain limit configuration
   - Display limit controls and configuration options
   - Title: "Set Personal Daily Limits"

4. **Block Page Screenshot** (1280×800 px)
   - Show the humorous block page when limit exceeded
   - Title: "Gentle Reminders to Stay Focused"

5. **Dark Mode / High Contrast Screenshot** (1280×800 px)
   - Show dark mode or high contrast mode enabled
   - Demonstrate accessibility features
   - Title: "Accessible for All"

**Screenshot Guidelines:**
- Dimensions: 1280×800 pixels (downscaled to 640×400 in store)
- Format: PNG or JPG
- Content: Clear, uncluttered dashboard screenshots
- Text: Add captions/titles for each screenshot
- Branding: Include FocusBear logo where appropriate

#### 5.2 Asset Creation Steps

```bash
# Option 1: Manual screenshots
# 1. Open extension dashboard in Chrome
# 2. Right-click → Inspect → DevTools
# 3. Ctrl+Shift+P → Capture full page screenshot
# 4. Resize to 1280×800 using image editor
# 5. Add title/captions if desired

# Option 2: Automated screenshot (if build script exists)
# npm run screenshots:generate  # (if implemented)
```

---

### 6. Accessibility Compliance (WCAG 2.1 AA)

#### 6.1 Automated Testing

- [ ] **Run Lighthouse Audit**
  - [ ] Open extension dashboard in Chrome
  - [ ] Open DevTools (F12)
  - [ ] Click "Lighthouse" tab
  - [ ] Run accessibility audit
  - [ ] Address any accessibility violations (target score: 90+)

- [ ] **Run axe DevTools**
  - [ ] Install axe DevTools extension
  - [ ] Open FocusBear dashboard
  - [ ] Run axe scan
  - [ ] Fix critical and serious issues

#### 6.2 Manual Testing Checklist

- [ ] **Keyboard Navigation**
  - [ ] Can navigate all buttons/controls with Tab key
  - [ ] Can activate buttons with Enter/Space
  - [ ] Can select/interact with all interactive elements
  - [ ] No keyboard traps (Tab key gets stuck)
  - [ ] Logical tab order through interface

- [ ] **Focus Indicators**
  - [ ] All interactive elements show visible focus ring
  - [ ] Focus indicators have sufficient contrast
  - [ ] Focus ring clearly visible on all buttons, inputs, links

- [ ] **Color Contrast**
  - [ ] Text contrast ratio ≥ 4.5:1 for normal text
  - [ ] Text contrast ratio ≥ 3:1 for large text
  - [ ] UI component borders contrast ≥ 3:1
  - [ ] No info conveyed by color alone

- [ ] **Screen Reader Testing**
  - [ ] Test with built-in screen reader (Windows Narrator, macOS VoiceOver)
  - [ ] All interactive elements have accessible names
  - [ ] ARIA labels are descriptive and non-redundant
  - [ ] Form inputs have associated labels
  - [ ] Error messages are announced

- [ ] **Motion & Animations**
  - [ ] Respect `prefers-reduced-motion` media query
  - [ ] Animations can be disabled
  - [ ] No seizure-inducing content (flashing > 3x/sec)

- [ ] **Responsive Design**
  - [ ] Dashboard works on screens 400px wide and up
  - [ ] Text readable without horizontal scrolling
  - [ ] Touch targets ≥ 44×44 pixels (mobile consideration)
  - [ ] No content lost on small screens

#### 6.3 Known Accessibility Issues to Fix

(Run WCAG audit and document findings here)

---

### 7. Testing & Quality Assurance

#### 7.1 Functional Testing

- [ ] **Core Features**
  - [ ] Extension icon appears in toolbar
  - [ ] Clicking icon opens dashboard in new tab
  - [ ] Dashboard loads without errors
  - [ ] D3.js radial graph renders
  - [ ] Domain nodes appear and respond to hover
  - [ ] Time range filters work correctly

- [ ] **Focus Tracking**
  - [ ] Switching between tabs is tracked
  - [ ] Correct domains are recorded
  - [ ] Visit counts increment properly
  - [ ] Data persists after browser restart

- [ ] **Limits & Block Page**
  - [ ] Setting per-domain limits works
  - [ ] Exceeding limits triggers block page
  - [ ] Block page displays correct message
  - [ ] "Back to Work" button allows bypass
  - [ ] Countdown notifications appear

- [ ] **Data Export**
  - [ ] Export as PNG works
  - [ ] Export as JSON works
  - [ ] Export as CSV works
  - [ ] Exported files are readable/valid

- [ ] **Settings**
  - [ ] High contrast mode toggle works
  - [ ] Reset data button functions
  - [ ] Confirmation dialog appears
  - [ ] Data cleared after reset

#### 7.2 Cross-Browser Testing

Test on multiple Chrome versions (target: Chrome 100+):

- [ ] **Chrome Stable (Latest)**
  - Platform: Windows, macOS, Linux
  - Load extension
  - Run through feature checklist
  - Check DevTools console for errors

- [ ] **Chrome Canary/Beta** (if available)
  - Ensure compatibility with upcoming changes

#### 7.3 Performance Testing

- [ ] **Popup/Dashboard Load Time**
  - Dashboard loads in < 300ms
  - D3.js graph renders in < 1s
  - No noticeable lag when interacting

- [ ] **Memory Usage**
  - Service worker doesn't consume excessive memory
  - No memory leaks over extended use
  - Check Chrome Task Manager for memory trends

- [ ] **Background Activity**
  - Service worker responds immediately to tab switches
  - No performance impact on regular browsing

#### 7.4 Edge Case Testing

- [ ] **Large Datasets**
  - Test with 100+ domains tracked
  - Verify graph remains responsive
  - Storage quota handling

- [ ] **Special Characters**
  - Test URLs with special characters, unicode
  - Subdomains and subpaths handled correctly

- [ ] **Error Handling**
  - Storage quota exceeded handled gracefully
  - Corrupt data handled without crashes
  - Missing manifest fields handled appropriately

#### 7.5 Test Results Documentation

Create a `TESTING_RESULTS.md` file documenting:
- Test environment (Chrome version, OS)
- All tests executed and results
- Any issues found and resolved
- Performance benchmarks
- Accessibility audit scores

---

### 8. Manifest & Store Metadata Updates

#### 8.1 manifest.json Final Review

Ensure manifest.json contains:

```json
{
  "manifest_version": 3,
  "name": "FocusBear",
  "version": "0.1.0",
  "version_name": "0.1.0-[git-hash]",
  "description": "Track your focus-switching habits with playful, privacy-first visualizations",
  "permissions": [
    "tabs",
    "storage",
    "notifications",
    "declarativeNetRequest",
    "declarativeNetRequestWithHostAccess"
  ],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "src/background/index.js",
    "type": "module"
  },
  "action": {
    "default_icon": {
      "16": "assets/icon-16.png",
      "32": "assets/icon-32.png",
      "48": "assets/icon-48.png",
      "128": "assets/icon-128.png"
    }
  },
  "icons": {
    "16": "assets/icon-16.png",
    "32": "assets/icon-32.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["src/content/countdown-toast.js"],
    "css": ["src/content/countdown-toast.css"],
    "run_at": "document_start"
  }],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

- [ ] Version number updated (semantic versioning)
- [ ] version_name includes git commit hash
- [ ] All permissions justified and necessary
- [ ] Icon paths are correct
- [ ] Service worker path is correct
- [ ] No deprecated manifest fields

#### 8.2 Additional Metadata Files

- [ ] Create `PRIVACY_POLICY.md` (required for Chrome Web Store)
- [ ] Create `TESTING_RESULTS.md` (recommended for review team)
- [ ] Verify `README.md` is up-to-date
- [ ] Create `CHROME_WEBSTORE_FAQ.md` (optional, for support)

---

### 9. Build & Package for Submission

#### 9.1 Clean Build

```bash
# Clean existing build
rm -rf dist/

# Fresh install (if needed)
npm install

# Run tests
npm run test

# Run linting
npm run lint

# Build production
npm run build
```

- [ ] Build completes without errors
- [ ] All tests pass
- [ ] No linting warnings

#### 9.2 Create Submission ZIP

```bash
# Create ZIP file for Chrome Web Store
# Include ONLY necessary files, exclude node_modules
cd dist/
zip -r focusbear-0.1.0.zip .
```

**ZIP contents should include:**
- ✅ manifest.json
- ✅ src/ directory (all JavaScript, HTML, CSS)
- ✅ assets/ directory (icons)
- ❌ node_modules/ (exclude)
- ❌ .git/ (exclude)
- ❌ tests/ (exclude)
- ❌ scripts/ (exclude)
- ❌ docs/ (exclude)

#### 9.3 ZIP Verification

- [ ] ZIP file size < 2GB (Chrome Web Store limit)
- [ ] ZIP file integrity verified
- [ ] Can extract and load extension from ZIP contents
- [ ] manifest.json is valid JSON
- [ ] All referenced files exist in ZIP

---

### 10. Chrome Web Store Submission

#### 10.1 Developer Dashboard Setup

1. [ ] Log in to Chrome Developer Dashboard
   - https://chrome.google.com/webstore/devconsole/

2. [ ] Click "Add new item"

3. [ ] Upload ZIP file
   - Select `focusbear-0.1.0.zip`
   - Wait for processing (may take 1-2 minutes)

#### 10.2 Store Listing Tab

Complete all required fields:

- [ ] **Extension Name:** "FocusBear"

- [ ] **Short Description (132 char limit):**
  ```
  Track focus-switching habits with a playful, privacy-first D3.js
  visualization. 100% local, no tracking.
  ```

- [ ] **Detailed Description:**
  (Use full description from section 4.2)

- [ ] **Screenshots** (upload 1-5)
  - Dashboard screenshot (1280×800)
  - Time filtering screenshot
  - Settings screenshot
  - Block page screenshot
  - Dark mode/accessibility screenshot

- [ ] **Promo Images**
  - Small promotional tile (440×280)

- [ ] **Category:** "Productivity" (or "Developer Tools")

- [ ] **Language:** English

- [ ] **Websites:**
  - Leave blank (no external website required)

#### 10.3 Privacy Tab

- [ ] **Requested Permissions Justification:**
  ```
  • tabs: To detect when you switch between browser tabs
  • storage: To store focus data locally on your device
  • notifications: To show countdown alert notifications
  • declarativeNetRequest: To enforce per-site visit limits
  • <all_urls>: To monitor all websites you visit
  ```

- [ ] **Single Purpose Statement:**
  ```
  FocusBear is a productivity extension that helps you track your
  focus-switching habits through an interactive visualization. It
  monitors which websites you visit and shows this data in a D3.js
  radial graph. All data is stored locally on your device and never
  transmitted to external servers.
  ```

- [ ] **Privacy Policy URL:**
  - (Can be GitHub privacy policy or external URL)
  - Or attach `PRIVACY_POLICY.md`

- [ ] **Requires Payment Processing:** No

- [ ] **Uses User Account:** No

- [ ] **Collects User Data:** Yes
  - Type: Browsing history (websites visited)
  - Usage: To visualize focus patterns
  - Stored: Locally in Chrome storage only

- [ ] **Third-party Sharing:** No
  ```
  FocusBear does not share any user data with third parties.
  All data remains on the user's device.
  ```

#### 10.4 Distribution Tab

- [ ] **Visibility:** Public (visible in Chrome Web Store)

- [ ] **Countries/Regions:** Select all (global availability)

- [ ] **Content Rating:** Not required for productivity apps

- [ ] **Pricing & Distribution:** Free

- [ ] **Google Play Store:** No (not applicable)

- [ ] **Accessibility:** Complies with WCAG 2.1 AA
  - [ ] Checkbox enabled if accessibility compliant

#### 10.5 Test Instructions Tab

(Optional but recommended)

Provide instructions for reviewing team:

```
Testing Instructions for FocusBear

1. Load the extension in Chrome (chrome://extensions/)
2. Click the FocusBear icon to open the dashboard
3. Dashboard should load with a radial graph in center
4. Open several websites (example.com, twitter.com, github.com, etc.)
5. Switch between tabs to trigger tracking
6. Verify domains appear as nodes in the radial graph
7. Test time range filters (hour/day/week/month)
8. Access settings via gear icon
9. Set a low visit limit (2-3) for a domain
10. Visit that domain multiple times to trigger limit
11. Verify block page appears when limit exceeded
12. Test "Back to Work" button to bypass block
13. Export data as PNG/JSON/CSV from dashboard

The extension is 100% local and requires no login or external connection.
All tracking is transparent and visible in the dashboard visualization.
```

---

### 11. Post-Submission Monitoring

After clicking "Submit for Review":

- [ ] **Review Status Notification**
  - Google sends email when review starts (usually within hours)
  - Review typically takes 1-3 days for simple productivity apps

- [ ] **Monitor Dashboard**
  - Check https://chrome.google.com/webstore/devconsole/
  - Monitor review progress
  - Watch for any policy violation messages

- [ ] **Issue Resolution**
  - If policy violations found:
    - [ ] Read violation details carefully
    - [ ] Fix identified issues in code/manifest
    - [ ] Resubmit for review
    - [ ] (Allow 1-3 days per resubmission)

- [ ] **Approval Notification**
  - When approved, receive confirmation email
  - Extension automatically published to Chrome Web Store
  - Store listing goes live within hours
  - URL format: https://chrome.google.com/webstore/detail/focusbear/[EXTENSION_ID]

- [ ] **Post-Launch Monitoring**
  - Monitor user reviews and ratings
  - Respond to user feedback
  - Track install statistics
  - Plan updates for phase 4+ features

---

## Deferred/Future Features (Phase 4+)

The following features are not required for initial launch but planned for future releases:

- [ ] Domain search & typeahead
- [ ] Streak tracking & statistics
- [ ] Focus Hero badges & gamification
- [ ] Multiple language support (i18n)
- [ ] Export in additional formats (PDF, Excel)
- [ ] Cloud backup/sync (optional, would compromise privacy)
- [ ] Mobile extension support
- [ ] Firefox extension port
- [ ] Advanced analytics & heatmaps

---

## Checklist Summary

**Total Items:** 200+ tasks
**Estimated Time:** 2-3 weeks (including Google review)

**Quick Status Check:**
- [ ] Code complete and tested
- [ ] All assets created (screenshots, promotional image)
- [ ] Privacy policy written
- [ ] Accessibility audit passed
- [ ] Security review completed
- [ ] Manifest final version set
- [ ] ZIP package created and verified
- [ ] Store listing information ready
- [ ] Submitted to Chrome Web Store
- [ ] Monitoring review process
- [ ] Extension published and live

---

## Support & Contact

For questions or issues during submission:

- **Chrome Web Store Support:** https://support.google.com/chrome/answer/3296214
- **Extension Developer Docs:** https://developer.chrome.com/docs/extensions/
- **Project Repository:** [Your GitHub URL]
- **Bug Reports:** [Your GitHub Issues URL]

---

## References

- **Chrome Web Store Publishing:** https://developer.chrome.com/docs/webstore/publish
- **Extension Manifest V3:** https://developer.chrome.com/docs/extensions/mv3/
- **Privacy Policy Guidelines:** https://developer.chrome.com/docs/webstore/program-policies/#privacy
- **Image Requirements:** https://developer.chrome.com/docs/webstore/images
- **Best Practices:** https://developer.chrome.com/docs/webstore/best-listing
- **WCAG 2.1 AA:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Document Status:** Final (Ready for Submission)
**Last Updated:** November 17, 2025
**Next Review:** After Google approval
