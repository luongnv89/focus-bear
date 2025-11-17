# FocusBear Chrome Web Store - Quick Start Guide

**TL;DR:** 5 main things to do before submission. ~2-3 weeks total.

---

## The 5 Critical Tasks

### 1. 📸 Create Marketing Assets (3-5 days)

**What:** 6 images needed for Chrome Web Store

**Assets Required:**
| Asset | Dimensions | File | Time |
|-------|-----------|------|------|
| Icon | 128×128 | ✓ exists | - |
| Promo Tile | 440×280 | ⚠️ create | 2 hrs |
| Screenshot 1 | 1280×800 | ⚠️ create | 1 hr |
| Screenshot 2 | 1280×800 | ⚠️ create | 1 hr |
| Screenshot 3 | 1280×800 | ⚠️ create | 1 hr |
| Screenshot 4 | 1280×800 | ⚠️ create | 1 hr |
| Screenshot 5 | 1280×800 | ⚠️ create | 1 hr |

**How to Create Screenshots:**
```bash
# 1. Load extension in Chrome
Open Chrome → chrome://extensions/
→ Load unpacked → select project folder

# 2. Open dashboard
Click FocusBear icon in toolbar
Right-click → Inspect to use DevTools

# 3. Take screenshot
DevTools → Ctrl+Shift+P → "Capture full page screenshot"

# 4. Edit in image editor
Resize to 1280×800 (export as PNG)
Add title/caption if desired
Save to assets/

# 5. Repeat for each view:
- Main dashboard (radial graph)
- Time filtering (controls shown)
- Settings panel (limits config)
- Block page (limit exceeded view)
- Dark mode (accessibility)
```

**Promo Tile Tips:**
- Use brand colors: Bear Blue #0E75B6, Focus Purple #6C5CE7
- Show the radial graph prominently
- Include product name: "FocusBear"
- Should look good when shrunk down
- Bright, eye-catching, professional

---

### 2. ✅ Code Review & Build (1-2 days)

**Run These Commands:**
```bash
# Check everything
npm run lint        # Should be 0 errors ✓
npm run format:check  # Should be 0 issues ✓
npm run test        # All tests pass ✓
npm run build       # Build succeeds ✓

# If any failures, fix them before proceeding!
```

**Do This Manual Check:**
- [ ] No hardcoded API keys or secrets in code
- [ ] No external API calls (should be local-only)
- [ ] Manifest.json looks right
- [ ] All permissions make sense
- [ ] Works in Chrome (test locally first!)

---

### 3. 🧪 Testing (2-3 days)

**Minimum Testing:**
```
□ Extension loads without errors
□ Click icon → dashboard opens
□ Radial graph displays
□ Switch tabs → domains tracked
□ Time filters work (hour/day/week/month)
□ Settings work (set a limit)
□ Exceeding limit → block page appears
□ Data export works (PNG, JSON, CSV)
□ Reset data button works
□ No JavaScript errors in console
```

**Accessibility Check:**
```bash
# In Chrome DevTools:
1. Open extension dashboard
2. Lighthouse tab → Accessibility audit
3. Aim for score ≥ 90
4. Fix any critical issues
```

**Test on Multiple Browsers (if possible):**
- [ ] Chrome Stable (latest)
- [ ] Chrome Beta
- [ ] Different OS if available (Windows, Mac, Linux)

---

### 4. 📋 Create Store Listing (1 day)

**Copy-Paste Ready Texts:**

**Name:**
```
FocusBear
```

**Short Description (132 characters):**
```
Track your focus-switching habits with a playful, privacy-first D3.js
visualization. 100% local, no tracking.
```

**Full Description:**
```
FocusBear helps you understand your browsing patterns with an interactive
radial graph visualization. See which websites consume your attention, set
daily visit limits, and get gentle reminders to stay focused.

Key Features:
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

All your data stays on your device. We don't sync to the cloud, track you,
or share your information.
```

**Category:** "Productivity"

**Privacy Policy Statement:**
```
FocusBear collects only the websites you visit and when you switch between
them. All data is stored locally on your device using Chrome's storage API.
We do not send data to any external servers, track you, or share your
information with third parties.
```

**Permissions Justification:**
```
We request these permissions only for:
• tabs: To detect when you switch between websites
• storage: To store your data locally on your device
• notifications: To show you countdown alerts
• declarativeNetRequest: To enforce your daily limits
• <all_urls>: To monitor which websites you visit
```

---

### 5. 📤 Submit (1 day)

**Step-by-Step:**

1. **Create Developer Account** (if not already done)
   - Go to: https://chrome.google.com/webstore/devconsole/
   - Sign in with Google account
   - Pay $5 USD registration fee
   - Verify email

2. **Upload Extension**
   ```bash
   # Build final ZIP
   rm -rf dist/
   npm install
   npm run build
   cd dist/
   zip -r focusbear-0.1.0.zip .
   ```
   - Go to: https://chrome.google.com/webstore/devconsole/
   - Click: "Add new item"
   - Upload: `focusbear-0.1.0.zip`
   - Wait for processing

3. **Fill Store Listing Tab**
   - Name: "FocusBear"
   - Short description: (copy from section 4)
   - Full description: (copy from section 4)
   - Category: "Productivity"
   - Language: "English"

4. **Upload Images**
   - Icon (128×128): `assets/icon-128.png` ✓
   - Promo tile (440×280): (your promo image)
   - Screenshots (1280×800 each): (your 5 screenshots)

5. **Fill Privacy Tab**
   - Permissions: (copy from section 4)
   - Single purpose: (copy from section 4)
   - Privacy policy: (copy from PRIVACY_POLICY.md)
   - Data sharing: "We do not share data with third parties"

6. **Submit**
   - Click: "Submit for Review"
   - Google will review (typically 1-3 days)
   - You'll get email when approved
   - Extension goes live automatically

---

## Timeline Estimate

| Week | What | Effort |
|------|------|--------|
| Week 1 | Marketing assets + testing | 40 hours |
| Week 2 | Store listing + final QA | 20 hours |
| Week 3 | Submit + monitor review | 10 hours |
| **Total** | **Complete preparation** | **70 hours** |

**Can You Speed This Up?**
- Yes! If you have design skills or can hire designer for screenshots: -3-5 days
- Yes! If you do testing in parallel with assets: -2-3 days
- Yes! If you already have accessibility audit passing: -1 day

---

## Detailed Guides

For more information, see:

1. **SUBMISSION_CHECKLIST.md** - Full checklist with all details
2. **CHROME_WEBSTORE_SUBMISSION.md** - Comprehensive guide (200+ items)
3. **PRIVACY_POLICY.md** - Complete privacy policy document
4. **WEBSTORE_PREP_SUMMARY.md** - Executive summary with insights

---

## Red Flags to Avoid

❌ **Don't submit without:**
- Marketing assets (screenshots, promo image)
- Passing linting/tests
- Privacy policy
- Working build

❌ **Common rejection reasons:**
- Poor/missing screenshots
- Misleading description vs. actual functionality
- Privacy policy missing or unclear
- Suspicious permissions not justified
- Code quality issues

---

## Important Links

- **Developer Dashboard:** https://chrome.google.com/webstore/devconsole/
- **Chrome Web Store:** https://chrome.google.com/webstore/
- **Extension Docs:** https://developer.chrome.com/docs/extensions/mv3/
- **Publication Guide:** https://developer.chrome.com/docs/webstore/publish
- **Privacy Policy Reqs:** https://developer.chrome.com/docs/webstore/program-policies

---

## Success Checklist (Copy & Paste)

```
BEFORE SUBMISSION:
□ Screenshots created (5 × 1280×800)
□ Promo tile created (1 × 440×280)
□ npm run lint = 0 errors
□ npm run test = all pass
□ Accessibility audit ≥ 90
□ Privacy policy written
□ Code security reviewed
□ Extension tested in Chrome
□ Manifest.json verified

DURING SUBMISSION:
□ Chrome Developer Account created
□ ZIP file built and tested
□ Store listing filled (name, description)
□ Images uploaded (icon, promo, screenshots)
□ Privacy tab completed
□ Permissions justified
□ Submit for review clicked
□ Confirmation received

AFTER SUBMISSION:
□ Waiting for Google review (1-3 days)
□ Email received with result
□ If approved: extension now live! 🎉
□ If rejected: fix issues and resubmit
□ Monitor user reviews and ratings
□ Respond to feedback
```

---

## Questions?

**If you get stuck, refer to:**
1. SUBMISSION_CHECKLIST.md (most detailed)
2. Chrome Web Store docs: https://developer.chrome.com/docs/webstore/
3. Common issues in POC_issues.md

---

**Status:** Ready to Execute
**Estimated Time:** 2-3 weeks
**Next Step:** Create marketing assets

Good luck! 🚀
