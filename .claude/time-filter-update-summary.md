# Time Filter Update Summary

## Changes Made

The time filter has been updated to replace "Today" with "Last 24h" to show a rolling 24-hour window instead of calendar day boundaries.

## Modified Files

### 1. **HTML Files** - Updated Filter Buttons

#### `src/dashboard/index.html`
- Changed button from `data-range="today"` to `data-range="last24h"`
- Changed button text from "Today" to "Last 24h"

#### `src/popup/popup.html`
- Changed button from `data-range="today"` to `data-range="last24h"`
- Changed button text from "Today" to "Last 24h"

### 2. **JavaScript Files** - Added "last24h" Support

#### `src/background/storage.js`
- **Updated `getAggregatedStats()` function**:
  - Changed default parameter from `'today'` to `'last24h'`
  - Added case for `'last24h'`: `startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)`
  - Updated default case to use last 24 hours instead of today
  - Updated JSDoc comment to reflect new range options

#### `src/common/visualization-page.js`
- **Updated `loadAggregatedStats()` function**:
  - Changed default parameter from `'today'` to `'last24h'`
  - Added case for `'last24h'`: rolling 24-hour window
  - Updated default case to use last 24 hours

- **Updated `getTitleForRange()` function**:
  - Added title for `'last24h'`: "Last 24 Hours' Focus Switches"
  - Updated default title to "Last 24 Hours' Focus Switches"

- **Updated `loadPreviousPeriodData()` function**:
  - Added case for `'last24h'`: previous 24-hour period (48h-24h ago)
  - Updated default case to use previous 24 hours

- **Updated `generateInsightsSummary()` function**:
  - Added range text for `'last24h'`: "in the last 24 hours"
  - Updated default range text to "in the last 24 hours"

- **Updated `setupVisualizationPage()` function**:
  - Changed default range from `'today'` to `'last24h'`

## Filter Options

The time filter now has three options:

1. **Last 24h** (default) - Rolling 24-hour window from current time
2. **Week** - Last 7 days
3. **Month** - Last 30 days

## Key Differences: "Today" vs "Last 24h"

### Before (Today):
- Showed visits from midnight (00:00) to current time
- Reset at midnight each day
- Calendar day boundary

### After (Last 24h):
- Shows visits from exactly 24 hours ago to current time
- Continuously rolling window
- No calendar day boundaries

## Example

**Current time: 2:00 PM on Tuesday**

- **"Today" (old)**: Shows visits from Tuesday 12:00 AM to Tuesday 2:00 PM (14 hours)
- **"Last 24h" (new)**: Shows visits from Monday 2:00 PM to Tuesday 2:00 PM (24 hours)

## Backward Compatibility

The code still supports the `'today'` range option for backward compatibility, but it's no longer exposed in the UI. The default has been changed to `'last24h'`.

## Consistency with Badge

This change aligns the time filter with the badge counter, which was previously updated to show total visits in the last 24 hours. Now both features use the same rolling 24-hour window.
