# POC Testing & Known Issues

## Manual Testing Checklist

### Basic Functionality
- [x] Extension loads without errors in Chrome
- [ ] Switch between 3-5 different domains - counts should increase
- [ ] Close/reopen Chrome - today's counts should persist
- [ ] Popup opens in < 300ms
- [ ] Domain list displays correctly
- [ ] Refresh button updates the list

### Test Scenarios

#### Scenario 1: Fresh Install
1. Load unpacked extension
2. Open popup - should see empty state ("Welcome to FocusBear!")
3. Navigate to example.com
4. Open popup - should see "example.com" with count 1
5. Navigate to different sites (twitter.com, reddit.com, github.com)
6. Return to example.com - count should be 2
7. Open popup - should see all visited domains

#### Scenario 2: Multiple Tab Switches
1. Open 3 tabs: twitter.com, reddit.com, github.com
2. Switch between tabs multiple times
3. Open popup - verify counts match number of switches
4. Check console logs for tracking events

#### Scenario 3: Data Persistence
1. Record some visits
2. Close Chrome completely
3. Reopen Chrome
4. Load extension popup
5. Verify today's data is still present

#### Scenario 4: Subpath Tracking
1. Visit reddit.com/r/programming
2. Visit reddit.com/r/javascript
3. Visit reddit.com/r/webdev
4. Open popup - should show reddit.com total and top subpath

### Expected Console Output

**Background Service Worker:**
```
FocusBear service worker initialized
FocusBear installed - welcome!
Initial data structure created
Initializing focus-switch tracking...
Focus-switch tracking initialized
Tab activated: 123
Focus switch recorded: example.com/ (count: 1)
```

**Popup:**
```
(Should be clean, no errors)
```

## Known Issues

### Priority: Low
- None identified yet

### Priority: Medium
- [ ] Very long domain names might overflow in popup
- [ ] No error handling for storage quota exceeded

### Priority: High
- None identified yet

## Notes for Testing

1. **Chrome Version**: Requires Chrome 100+
2. **Permissions**: Extension requests tabs and storage permissions
3. **Data Location**: Chrome DevTools → Application → Storage → Local Storage → chrome-extension://[ID]
4. **Service Worker**: Inspect via chrome://extensions/ → FocusBear → "Inspect views: service worker"

## Future Testing Needs

- Unit tests for storage.js functions
- Unit tests for URL parsing in tracking.js
- Performance testing with 100+ domains
- Memory leak testing with extended use
- Edge cases: special characters in URLs, very long URLs, data:// URLs
