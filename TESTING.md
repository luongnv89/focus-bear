# Testing FocusBear Features

## Adding Sample Data for Testing

The extension starts with no tracking data. To test features like the domain drilldown view, you need data. Here are three ways to get it:

### Option 1: Browse Naturally (Recommended for Production Testing)
1. Load the extension in Chrome (`chrome://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project root directory
4. Browse different websites and switch tabs
5. Data will be automatically tracked
6. Open the popup or dashboard to see your data

### Option 2: Use Sample Data Script (Recommended for Development)

**Quick Method:**
1. Load the extension in Chrome
2. Click the extension icon to open the popup/dashboard
3. Open DevTools (F12)
4. Go to the Console tab
5. Paste and run this command:

```javascript
// Copy the entire addSampleData function from scripts/add-sample-data.js
// Then run:
addSampleData();
```

**Alternative - From Background Page:**
1. Go to `chrome://extensions/`
2. Find "FocusBear" and click "Inspect views: service worker"
3. In the console that opens, paste the contents of `scripts/add-sample-data.js`
4. Run `addSampleData()`
5. Refresh your popup/dashboard

### Option 3: Manual Storage Access

You can also add data directly via DevTools:

```javascript
chrome.storage.local.set({
  visits: {
    '2025-11-16': {
      'github.com': {
        count: 45,
        lastVisit: Date.now(),
        timestamps: [Date.now()],
        subpaths: {
          '/luongnv89/focus-bear': { count: 15, lastVisit: Date.now() },
          '/pulls': { count: 12, lastVisit: Date.now() },
          '/issues': { count: 8, lastVisit: Date.now() },
          '/notifications': { count: 5, lastVisit: Date.now() },
          '/settings': { count: 3, lastVisit: Date.now() },
          '/explore': { count: 2, lastVisit: Date.now() }
        }
      },
      'stackoverflow.com': {
        count: 32,
        lastVisit: Date.now(),
        timestamps: [Date.now()],
        subpaths: {
          '/questions/tagged/javascript': { count: 12, lastVisit: Date.now() },
          '/questions/tagged/chrome-extension': { count: 8, lastVisit: Date.now() },
          '/questions/tagged/d3.js': { count: 7, lastVisit: Date.now() }
        }
      }
    }
  },
  limits: {
    'twitter.com': {
      enabled: true,
      fiveHour: { enabled: true, limit: 15 },
      daily: { enabled: true, limit: 30 }
    }
  }
}, () => {
  console.log('Sample data added! Refresh the popup/dashboard.');
});
```

## Testing the Domain Drilldown Feature

Once you have data:

1. Open the FocusBear popup or dashboard
2. You should see a radial graph with domain nodes
3. **Double-click** on any domain node that has subpaths (e.g., github.com)
4. You should see:
   - Header with domain name and statistics
   - Limitation status badge (green if limits active, gray if not)
   - "Edit Limitation Settings" button
   - Detailed table showing all subpaths with:
     - Subpath URL
     - Visit count
     - Last visit time
     - Percentage bar showing distribution
   - Topology graph view below the table
5. Click "← Back" to return to the main view
6. Click "Edit Limitation Settings" to open the settings panel pre-populated with that domain

## Verifying Data is Loaded

Check if data exists:

```javascript
chrome.storage.local.get(['visits', 'limits'], (data) => {
  console.log('Visits:', data.visits);
  console.log('Limits:', data.limits);
});
```

## Clearing Test Data

To reset and start fresh:

```javascript
chrome.storage.local.set({
  visits: {},
  limits: {},
  settings: {
    highContrastMode: false,
    onboardingComplete: false,
    defaultTimeRange: 'today'
  }
}, () => {
  console.log('Data cleared! Refresh the popup/dashboard.');
});
```

## Common Issues

**Issue: "No data to visualize yet" message appears**
- Solution: You don't have any tracked visits. Use Option 2 above to add sample data.

**Issue: Graph shows domains but double-click doesn't work**
- Solution: The domain may not have any subpaths. Only domains with subpaths can be drilled down into. Try double-clicking "github.com" or "stackoverflow.com" from the sample data.

**Issue: Changes don't appear after adding data**
- Solution: Close and reopen the popup, or refresh the dashboard page.

**Issue: Can't access chrome.storage**
- Solution: Make sure you're running the commands in the extension context (popup DevTools or background service worker console), not on a regular web page.
