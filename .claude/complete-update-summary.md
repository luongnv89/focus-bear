# Complete Update Summary: Badge & Time Filter Changes

## Overview

Both the badge counter and time filter have been updated to use a **rolling 24-hour window** instead of calendar day boundaries, providing a more accurate and consistent view of browsing activity.

---

## Part 1: Badge Counter Update

### What Changed
The extension badge now shows the **total number of visits for all websites in the last 24 hours** instead of the number of unique domains visited today.

### Implementation
- **New function**: `getTotalVisitsLast24Hours()` in `storage.js`
- **Updated**: `badge.js` to use the new function
- **Updated**: All tests in `badge.test.js`

### Example
**Before**: Badge showed `3` (3 unique domains visited today)
**After**: Badge shows `15` (15 total visits across all domains in last 24h)

---

## Part 2: Time Filter Update

### What Changed
The time filter's "Today" option has been replaced with **"Last 24h"** to match the badge behavior.

### Filter Options
1. **Last 24h** (default) ← Changed from "Today"
2. **Week** (unchanged)
3. **Month** (unchanged)

### Implementation
- **Updated HTML**: Both `dashboard/index.html` and `popup/popup.html`
- **Updated JS**: `storage.js` and `visualization-page.js`
- **Added support**: For `'last24h'` range in all aggregation functions

---

## Key Benefits

### 1. **Consistency**
Both badge and filter now use the same rolling 24-hour window, eliminating confusion.

### 2. **Accuracy**
Rolling window provides a true 24-hour view, not limited by calendar day boundaries.

### 3. **Real-time**
The 24-hour window moves with current time, always showing the most recent 24 hours.

---

## Visual Comparison

### Scenario: Current time is 2:00 PM on Tuesday

```
OLD BEHAVIOR ("Today"):
├─ Badge: Shows unique domains from Tue 12:00 AM - Tue 2:00 PM (14 hours)
└─ Filter: Shows visits from Tue 12:00 AM - Tue 2:00 PM (14 hours)

NEW BEHAVIOR ("Last 24h"):
├─ Badge: Shows total visits from Mon 2:00 PM - Tue 2:00 PM (24 hours)
└─ Filter: Shows visits from Mon 2:00 PM - Tue 2:00 PM (24 hours)
```

### Example Data

**Visits:**
- Monday 3:00 PM: example.com (5 visits)
- Monday 8:00 PM: twitter.com (3 visits)
- Tuesday 10:00 AM: github.com (7 visits)

**OLD (Today at 2:00 PM Tuesday):**
- Badge: `1` (only github.com)
- Filter shows: 7 visits (only github.com)

**NEW (Last 24h at 2:00 PM Tuesday):**
- Badge: `15` (5 + 3 + 7 = 15 total visits)
- Filter shows: 15 visits across 3 domains

---

## Technical Details

### Data Flow

```
User visits website
    ↓
Timestamp recorded in storage
    ↓
Badge/Filter queries last 24h
    ↓
Filters timestamps: now - 24h to now
    ↓
Returns total count
```

### Rolling Window Calculation

```javascript
const now = Date.now();
const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

// Filter timestamps
const recentVisits = timestamps.filter(
  timestamp => timestamp >= twentyFourHoursAgo && timestamp <= now
);
```

---

## Files Modified

### Badge Update (Part 1)
- `src/background/storage.js` - Added `getTotalVisitsLast24Hours()`
- `src/background/badge.js` - Updated to use new function
- `tests/badge.test.js` - Rewrote all tests

### Filter Update (Part 2)
- `src/dashboard/index.html` - Changed button to "Last 24h"
- `src/popup/popup.html` - Changed button to "Last 24h"
- `src/background/storage.js` - Added `'last24h'` case
- `src/common/visualization-page.js` - Added `'last24h'` support

---

## Backward Compatibility

- The `'today'` range option still works in code but is not exposed in UI
- Old data without timestamps is handled gracefully
- Default range changed from `'today'` to `'last24h'`

---

## Testing

All changes have been tested with:
- Empty data (no visits)
- Single domain visits
- Multiple domain visits
- Cross-day scenarios (visits spanning midnight)
- Old data without timestamps

---

## User Impact

### Positive Changes
✅ More accurate representation of activity
✅ Consistent behavior across badge and filter
✅ True 24-hour window, not limited by calendar
✅ Better for users in different timezones

### What Users Will Notice
- Badge number may be higher (shows all visits, not just domains)
- "Today" button replaced with "Last 24h"
- Data shown includes visits from yesterday if within 24h window
