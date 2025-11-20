# Table Visits Column Fix

## Issue

The "Visits" column in the Domain Statistics table was showing `todayCount` (today's visits) regardless of which time filter was selected (Last 24h, Week, or Month).

## Expected Behavior

The "Visits" column should show the visit count for the **selected time range**:
- When "Last 24h" is selected → show visits from last 24 hours
- When "Week" is selected → show visits from last 7 days
- When "Month" is selected → show visits from last 30 days

## Solution

Changed the Visits column to display `row.count` instead of `row.todayCount`.

### File: `src/dashboard/dashboard.js` (line 450)

```javascript
// BEFORE
const visitsTd = document.createElement('td');
visitsTd.className = 'visits-cell';
visitsTd.textContent = row.todayCount; // ❌ Always showed today's count
tr.appendChild(visitsTd);

// AFTER
const visitsTd = document.createElement('td');
visitsTd.className = 'visits-cell';
visitsTd.textContent = row.count; // ✅ Shows count for selected time range
tr.appendChild(visitsTd);
```

## Data Flow

The table data is prepared in `prepareTableData()` function:

```javascript
{
  domain: 'example.com',
  count: 15,        // ← Visits in selected time range (last 24h/week/month)
  todayCount: 5,    // ← Visits today only (used for Status badge)
  subpaths: 3,
  lastVisit: timestamp,
  limit: {...},
  badge: {...}
}
```

### Where Each Count is Used

1. **`count`** (selected time range):
   - ✅ Visits column in table
   - ✅ Graph visualization
   - ✅ Summary statistics

2. **`todayCount`** (today only):
   - ✅ Status badge (Over Limit / Near Limit / Under Limit)
   - This ensures status resets daily regardless of selected time range

## Why This Matters

### Example Scenario

**Current time**: Tuesday 1:00 PM
**Selected filter**: Last 24h
**Domain**: example.com

**Visits**:
- Monday 2:00 PM - 10:00 PM: 20 visits
- Tuesday 12:00 AM - 1:00 PM: 5 visits

**Before fix**:
- Visits column showed: **5** (only today)
- Graph showed: **25** (last 24h)
- ❌ Inconsistent!

**After fix**:
- Visits column shows: **25** (last 24h)
- Graph shows: **25** (last 24h)
- ✅ Consistent!

## Testing

1. **Rebuild**: `npm run build`
2. **Reload** extension in Chrome
3. **Open dashboard**
4. **Verify**:
   - Visits column shows correct counts for selected time range
   - When switching filters (Last 24h → Week → Month), visit counts update
   - Status badges still work correctly (based on today's count)

## Related Changes

This fix is part of the larger update to support "Last 24h" rolling window:
- Badge counter shows total visits in last 24h
- Time filter changed from "Today" to "Last 24h"
- Dashboard defaults to "Last 24h" view
- Table now shows visits for selected time range
