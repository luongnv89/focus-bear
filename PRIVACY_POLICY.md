# Privacy Policy for FocusBear

**Effective Date:** November 17, 2025
**Last Updated:** November 17, 2025

## 1. Overview

FocusBear is a privacy-first Chrome extension that helps you understand your browsing habits through an interactive visualization. We are committed to your privacy and transparency about how the extension operates.

**Key Principle:** All data is stored locally on your device. We do not collect, store, or share any of your personal information with external parties.

---

## 2. What Data We Collect

FocusBear collects the following information **only on your device**:

### 2.1 Website/Domain Information
- **What:** The domain names and subpaths of websites you visit
- **Example:** "example.com", "reddit.com/r/programming", "github.com/user/repo"
- **Why:** To track which sites consume your attention and create your personalized focus visualization
- **Storage:** Chrome's local storage (`chrome.storage.local`)

### 2.2 Visit Timing Information
- **What:** Timestamp of when you switch between tabs and which domain was active
- **Format:** YYYY-MM-DD date buckets with hourly/minute-level accuracy
- **Why:** To show your focus patterns across different time ranges (hourly, daily, weekly, monthly)
- **Storage:** Chrome's local storage, organized by date

### 2.3 User Preferences
- **What:** Your settings (daily visit limits, high contrast mode toggle, onboarding status)
- **Why:** To remember your preferences across sessions
- **Storage:** Chrome's local storage

### 2.4 What We DO NOT Collect
- ❌ Page content or titles
- ❌ Search terms you typed
- ❌ Form inputs or passwords
- ❌ Email content or messages
- ❌ Video/audio content from websites
- ❌ Any personally identifiable information (names, emails, phone numbers)
- ❌ Your IP address or location
- ❌ Any analytics or tracking data

---

## 3. How We Store Data

### 3.1 Storage Location
- **Storage API:** Chrome's built-in `chrome.storage.local` API
- **Location:** Your device's local storage
- **Scope:** Data is isolated to your browser profile
- **Encryption:** Chrome handles encryption of stored data

### 3.2 Data Organization
```javascript
{
  "visits": {
    "2025-11-17": {
      "example.com": 5,
      "reddit.com": 12,
      "github.com/user/repo": 3
    }
  },
  "limits": {
    "example.com": 10,
    "twitter.com": 5
  },
  "settings": {
    "highContrastMode": false,
    "onboardingComplete": true
  }
}
```

### 3.3 Storage Limits
- **Chrome Storage Quota:** ~10 MB per extension
- **FocusBear Usage:** Approximately 100 KB for typical usage (handles 100+ domains)
- **Scalability:** Can store 1+ years of browsing history before reaching limits

---

## 4. How We Use Your Data

Your data is used **exclusively** to:

1. **Display Your Focus Visualization**
   - Create the interactive D3.js radial graph in your dashboard
   - Show which domains consume your attention

2. **Enforce Your Limit Settings**
   - Track visit counts against your configured limits
   - Block access to sites when you exceed your daily limits
   - Show countdown notifications as you approach limits

3. **Time-Range Filtering**
   - Allow you to view your habits by hour, day, week, or month
   - Calculate statistics across different time periods

4. **Data Export**
   - Enable you to export your data as PNG, JSON, or CSV
   - Allows you to analyze or back up your own data

---

## 5. Data Sharing & Third Parties

**FocusBear does not share any data with third parties.**

### 5.1 What This Means
- No data is sent to our servers (we have no servers)
- No data is shared with Google, advertisers, or analytics services
- No data is shared with other extensions or applications
- No data is sold or licensed to any third party

### 5.2 Limited Exceptions
- **Chrome Sync:** If you have Chrome Sync enabled, Chrome may sync extension storage. You control this in Chrome settings.
- **Data Export:** When you click "Export Data," the data goes to your Downloads folder as a file you control.

---

## 6. Permissions & Why We Need Them

FocusBear requests the following Chrome permissions:

### 6.1 Required Permissions

**`tabs`** - Monitor active tabs
- **Why:** To detect when you switch between browser tabs
- **How:** Listens to `chrome.tabs.onActivated` and `chrome.tabs.onUpdated` events
- **Data Collected:** Only the domain/URL of the currently active tab

**`storage`** - Access local storage
- **Why:** To store your focus data locally on your device
- **How:** Reads and writes to `chrome.storage.local`
- **Data Stored:** Visit counts, limits, settings

**`notifications`** - Show browser notifications
- **Why:** To display countdown alerts when you're approaching daily limits
- **How:** Triggered when you're near your configured limit
- **Notification Content:** Domain name and remaining visits count

**`declarativeNetRequest`** - Block/modify requests
- **Why:** To enforce your daily visit limits by blocking requests to blocked sites
- **How:** Intercepts requests to domains where you've exceeded limits
- **Enforcement:** Redirects to a block page instead of the requested site

**`<all_urls>` (Host Permission)** - Monitor all websites
- **Why:** To track which websites you visit
- **How:** Content script monitors tab content
- **Data Collected:** Domain/subpath of visited sites

---

## 7. Data Retention & Deletion

### 7.1 How Long We Keep Data
- **No automatic deletion:** Your data is retained until you delete it
- **Persistent:** Data persists across browser sessions
- **Backup:** Data is not backed up to the cloud

### 7.2 How to Delete Your Data

**Method 1: Via FocusBear Dashboard**
1. Open FocusBear dashboard (click extension icon)
2. Click the settings gear icon
3. Click "Reset All Data"
4. Confirm the deletion
5. All data is immediately deleted from `chrome.storage.local`

**Method 2: Via Chrome Settings**
1. Go to `chrome://extensions/`
2. Find "FocusBear"
3. Click "Remove" or "Uninstall"
4. All FocusBear data is automatically deleted

**Method 3: Clear Chrome Data**
1. In Chrome, go to `chrome://settings/clearBrowserData`
2. Select "All time"
3. Check "Cookies and other site data"
4. This clears extension storage (not recommended as it may affect other extensions)

### 7.3 Data Deletion Guarantees
- ✅ Deleted data is **immediately removed** from your device
- ✅ No backup copies are retained
- ✅ Deletion is **permanent and irreversible**
- ✅ No traces of deleted data remain in Chrome storage

---

## 8. Security & Protection

### 8.1 How We Protect Your Data

**No External Transmission:**
- Your data never leaves your device
- No internet requests are made to sync or transmit data
- Your browsing habits remain private

**Local Storage Only:**
- Data stored in Chrome's encrypted local storage
- Your device OS handles encryption and security
- No passwords or authentication required (no account to compromise)

**No Third-Party Access:**
- Other extensions cannot access FocusBear's data
- Only FocusBear service worker can read/write your data
- Content Security Policy prevents inline script execution

**Open Source Transparency:**
- FocusBear code is available for review on GitHub
- Anyone can audit the code to verify privacy claims
- No hidden or obfuscated tracking code

### 8.2 What Could Go Wrong?
- **Device Theft:** If someone gets physical access to your device, they could access your FocusBear data (along with all your other data)
- **Malware:** If your device is compromised by malware, it could potentially access extension storage
- **Other Users:** If other people use your Chrome profile, they can see your data

**Mitigation:** Use strong device passwords, keep your OS/Chrome updated, and don't grant extension permissions to untrusted sources.

---

## 9. GDPR & Privacy Regulations

### 9.1 Your Privacy Rights

As a privacy-first extension, FocusBear supports your privacy rights:

**Data Portability:**
- You can export all your data in JSON format
- You can delete all your data at any time
- No account dependency means you own all your data

**Right to Access:**
- You can view all data FocusBear collects in the dashboard
- You can export this data to review it

**Right to Be Forgotten:**
- You can permanently delete all data in one click
- No backup or archive copies are maintained

**Right to Object:**
- You can disable the extension at any time
- Disabling or uninstalling immediately stops data collection
- No residual tracking continues after uninstall

### 9.2 Compliance
- ✅ GDPR compliant (no unnecessary data, transparent practices)
- ✅ CCPA compliant (all data on user's device, easily deletable)
- ✅ PIPEDA compliant (Canadian privacy law)
- ✅ LGPD compliant (Brazilian privacy law)

---

## 10. Children's Privacy

FocusBear is not designed for children under 13. We do not knowingly collect information from children under 13. If we become aware that we have collected information from a child under 13, we will delete this information immediately.

If you are a parent or guardian and believe FocusBear has collected data from a child under 13, please contact us at [Your Contact Email].

---

## 11. Changes to This Privacy Policy

We may update this privacy policy from time to time to reflect:
- Changes in how FocusBear operates
- New privacy regulations
- Improvements to our transparency

**How We Notify You:**
- Updated policy will be published in the GitHub repository
- Extension updates will include changelog notes
- Users will be notified via extension notification if major changes occur

**Changes That Require User Consent:**
- If we ever start collecting additional data types beyond website domains/timing
- If we ever transmit data to external servers
- If we ever share data with third parties

**No Retroactive Changes:**
- Changes to privacy practices only apply going forward
- Your existing data is not affected by privacy policy updates

---

## 12. Contact & Questions

### 12.1 Questions About This Privacy Policy?
- **GitHub Issues:** https://github.com/[username]/focus-bear/issues
- **Email:** [Your Email Address]
- **Discord/Slack:** [Community Channel if applicable]

### 12.2 Privacy Concerns
If you believe FocusBear violates your privacy:
1. Open an issue on GitHub with details
2. We will respond within 7 days
3. Provide a fix or explanation

### 12.3 Data Deletion Request
To request immediate deletion of all data:
1. Open FocusBear settings → "Reset All Data"
2. Or uninstall the extension via `chrome://extensions/`
3. All data is deleted immediately

---

## 13. Additional Information

### 13.1 Service Worker & Background Processing
- FocusBear uses a Chrome Service Worker to monitor tabs
- The service worker only runs when Chrome is open
- No background processing occurs when Chrome is closed
- Service worker memory is cleared when Chrome closes

### 13.2 Content Scripts
- FocusBear injects a small content script (`countdown-toast.js`) on all websites
- This script only:
  - Checks if you've exceeded your daily limit
  - Shows a countdown notification if you're approaching a limit
  - **Does not:** Collect page content, spy on your typing, or send data anywhere

### 13.3 Data Sync & Cloud
- **Cloud Storage:** None
- **Sync:** Only Chrome Sync (which you control)
- **Backup:** None
- **Offline:** FocusBear works 100% offline

---

## 14. Definitions

**Domain:** The website name (e.g., "example.com", "reddit.com")
**Subpath:** The specific part of a website (e.g., "/r/programming" in reddit.com/r/programming)
**Visit:** When you switch your active tab to a domain
**Limit:** Your configured maximum visits per day for a domain
**chrome.storage.local:** Chrome's built-in local storage API for extensions
**Service Worker:** Background script that monitors browser events

---

## Appendix: Technical Details for Privacy-Conscious Users

### Data Flow Diagram
```
You Click Extension Icon
        ↓
Dashboard Opens (local HTML/JS)
        ↓
Queries chrome.storage.local
        ↓
D3.js Renders Visualization
        ↓
Data Displayed in Graph (no external calls)
```

### No Network Calls
```
✅ No API calls
✅ No analytics tracking
✅ No beacon/ping requests
✅ No remote image loads
✅ No external font loading (fonts are local)
✅ No CDN resources
```

### Network Request Verification
To verify FocusBear makes no external network calls:
1. Open DevTools (F12)
2. Go to "Network" tab
3. Navigate to FocusBear dashboard
4. Observe: Network tab is empty (only local resources)

---

**Privacy Policy Version:** 1.0
**Last Updated:** November 17, 2025
**Effective Date:** November 17, 2025

---

*This privacy policy is committed to being updated to reflect changes in FocusBear or applicable laws. We are committed to maintaining the highest standards of transparency and privacy protection.*
