# Badge Counter Implementation Details

## How the Badge Counter Works

### Data Flow

```
User visits a website
    ↓
trackTabFocus() in tracking.js
    ↓
incrementVisit() in storage.js
    ├─ Increments count for domain
    ├─ Updates lastVisit timestamp
    └─ Adds timestamp to timestamps array ← KEY for 24h calculation
    ↓
updateDomainBadge() in badge.js
    ↓
getTotalVisitsLast24Hours() in storage.js
    ├─ Gets all visits from storage
    ├─ Filters timestamps within last 24 hours
    └─ Returns total count
    ↓
Badge displays total count
```

### Before vs After

**BEFORE:**
- Badge showed: Number of unique domains visited today
- Calculation: `Object.keys(todayVisits).length`
- Example: If you visited example.com 10 times and twitter.com 5 times today, badge showed: **2**

**AFTER:**
- Badge shows: Total number of visits for all websites in last 24 hours
- Calculation: Count all timestamps within last 24 hours across all domains
- Example: If you visited example.com 10 times and twitter.com 5 times in last 24h, badge shows: **15**

### Key Implementation Details

1. **Rolling 24-hour Window**: The badge uses `Date.now() - (24 * 60 * 60 * 1000)` to calculate the cutoff time, not a calendar day boundary.

2. **Timestamp Array**: Each domain's visit data includes a `timestamps` array that stores the exact time of each visit:
   ```javascript
   {
     "2025-11-19": {
       "example.com": {
         count: 5,
         lastVisit: 1700000000000,
         timestamps: [1700000000000, 1700000001000, ...], // ← Used for 24h calculation
         subpaths: {}
       }
     }
   }
   ```

3. **Cross-Day Support**: The function iterates through all stored dates, not just today, to capture visits that fall within the 24-hour window but might be stored under yesterday's date key.

4. **Graceful Degradation**: If a domain doesn't have a `timestamps` array (e.g., old data), those visits won't be counted. This ensures backward compatibility.

### Performance Considerations

- The function iterates through all stored visits and filters timestamps
- For typical usage (dozens of domains, hundreds of visits), this is very fast
- The calculation happens:
  - On extension startup (initializeBadge)
  - After each new visit (updateDomainBadge)
  - Not on a timer (to save resources)

### Testing

All tests have been updated to:
1. Include `timestamps` arrays in test data
2. Verify total visit counts instead of domain counts
3. Test the 24-hour window filtering
4. Test cross-day scenarios
5. Test graceful handling of missing timestamps
