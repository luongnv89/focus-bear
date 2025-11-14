# FocusBear Data Model

## Overview

FocusBear stores all data locally using `chrome.storage.local`. No data ever leaves the user's device.

## Storage Schema

### Complete Schema

```javascript
{
  // Visit tracking data organized by date
  visits: {
    "2025-11-14": {
      "example.com": {
        count: 5,                    // Number of focus switches today
        lastVisit: 1700000000000,    // Unix timestamp of last visit
        subpaths: {
          "/path1": {
            count: 2,
            lastVisit: 1700000000000
          },
          "/path2": {
            count: 3,
            lastVisit: 1700000000000
          }
        }
      },
      "twitter.com": {
        count: 12,
        lastVisit: 1700000000000,
        subpaths: {
          "/home": { count: 8, lastVisit: 1700000000000 },
          "/notifications": { count: 4, lastVisit: 1700000000000 }
        }
      }
    },
    "2025-11-13": {
      // Previous day's data...
    }
  },

  // Per-site daily visit limits
  limits: {
    "example.com": 10,   // Max 10 visits per day
    "twitter.com": 5,    // Max 5 visits per day
    // Domains not in this object have no limit
  },

  // User preferences and settings
  settings: {
    highContrastMode: false,
    onboardingComplete: false,
    defaultTimeRange: "today"
  }
}
```

## Data Types

### Visit Entry

```javascript
{
  count: number,          // Total focus switches
  lastVisit: number,      // Unix timestamp (milliseconds)
  subpaths: {
    [path: string]: {
      count: number,
      lastVisit: number
    }
  }
}
```

### Limits

```javascript
{
  [domain: string]: number  // Daily visit limit (null/undefined = unlimited)
}
```

### Settings

```javascript
{
  highContrastMode: boolean,        // Accessibility mode
  onboardingComplete: boolean,      // Has user completed FTUE
  defaultTimeRange: string          // "hour" | "today" | "week" | "month"
}
```

## Key Concepts

### Focus Switch

A **focus switch** is recorded when:
1. User activates a tab (switches to it)
2. User navigates to a new URL in the current tab
3. Event is user-initiated (not automatic redirects)

### Domain Extraction

- Full URL: `https://www.example.com/path/to/page?query=1`
- Domain: `example.com` (without www)
- Subpath: `/path/to/page`

### Date Keys

- Format: `YYYY-MM-DD` (ISO 8601 date)
- Timezone: User's local timezone
- Example: `"2025-11-14"`

### Timestamps

- Unix timestamps in milliseconds
- Used for "last visit" tracking
- Allows time-based filtering (e.g., "last hour")

## Data Retention

- **Default**: Unlimited retention
- **Recommendation**: Keep 30-90 days for performance
- **User Control**: Settings panel provides "Clear all data" option
- **Privacy**: All data deleted when extension is uninstalled

## Storage Limits

Chrome storage limits:
- `chrome.storage.local`: 10 MB total
- Estimated capacity: ~100k visits before hitting limit
- Typical user: ~100-500 visits/day = months of data

## Migration Strategy

For future schema changes:

1. Check `schemaVersion` in settings
2. If version mismatch, run migration function
3. Update `schemaVersion` after successful migration
4. Log migration for debugging

Example:
```javascript
async function migrateData(oldVersion, newVersion) {
  // Migration logic here
}
```

## Example Usage

See `src/background/storage.js` for API functions:

- `incrementVisit(domain, subpath)` - Record a focus switch
- `getAggregatedStats(range)` - Get stats for time range
- `setLimitForDomain(domain, limit)` - Configure limit
- `clearAllData()` - Reset everything

## Security Considerations

1. **No PII**: Only domains/paths stored, no user identifiers
2. **Local-only**: Never transmitted over network
3. **User control**: Full data export and deletion available
4. **XSS protection**: Always sanitize domain strings before display
