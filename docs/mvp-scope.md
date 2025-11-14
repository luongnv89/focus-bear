# MVP Scope - FocusBear v1.0 "The Guilt Bear"

## MVP Features (Must Have)

### ✅ Core Tracking
- [x] Focus visit tracking (tabs.onActivated, tabs.onUpdated)
- [x] Domain-level tracking
- [x] Subpath tracking
- [x] Local storage only (chrome.storage.local)
- [x] Date-based organization (YYYY-MM-DD)

### 🎯 Visualization
- [ ] D3.js radial graph
  - Center node: "You"
  - Domain nodes: sized by visit count
  - Interactive hover tooltips
  - Performance: <1s render for 100 nodes
- [ ] Time range filters: Hour | Today | Week | Month
- [ ] Search bar with fuzzy matching
- [ ] Domain highlighting

### 🎚️ Limits & Enforcement
- [ ] Per-site daily visit limits
- [ ] Settings panel for limit configuration
- [ ] Block page (humorous, on-brand)
- [ ] Countdown bubble (toast notification)
- [ ] webRequest-based enforcement

### ⚙️ Settings & Controls
- [ ] Settings panel UI (gear icon → settings view)
- [ ] Per-site limit management
- [ ] Reset all data button
- [ ] Privacy messaging ("Data never leaves your device")

### ♿ Accessibility
- [ ] Keyboard navigation (Tab, Enter, Space, Arrow keys)
- [ ] ARIA labels on interactive elements
- [ ] Color contrast: 4.5:1 (text), 3:1 (UI)
- [ ] Focus indicators
- [ ] High contrast mode toggle

### ⚡ Performance Targets
- [ ] Popup load: <300ms
- [ ] Graph render: <1s for 100 domains
- [ ] Tab switch detection: instant (no lag)
- [ ] Extension size: <500KB

## Non-MVP Features (Future Releases)

### v1.1 - Enhanced Insights
- [ ] Subpath drilldown in radial graph (zoom into domain → see subpaths)
- [ ] 7-day rolling averages
- [ ] Streak tracking (consecutive days under limit)
- [ ] "Focus Hero" badges

### v1.2 - Export & Customization
- [ ] Export graph as PNG (html2canvas)
- [ ] Export data as JSON/CSV
- [ ] Dark mode
- [ ] Custom themes

### v2.0 - Advanced Features
- [ ] Focus Mode (Pomodoro-style sessions)
- [ ] Evolving bear avatar (changes based on behavior)
- [ ] Mini-games on block page
- [ ] Rotating block page memes
- [ ] Browser history integration

## Feature Flags

Feature flags allow gradual rollout and A/B testing. Disabled features are hidden from UI.

### Implementation

```javascript
// src/common/feature-flags.js
export const FEATURES = {
  // Phase 0 - POC
  BASIC_TRACKING: true,
  BASIC_POPUP: true,

  // Phase 1 - MVP
  RADIAL_GRAPH: true,
  TIME_FILTERS: true,
  SEARCH: true,
  LIMITS: true,
  BLOCK_PAGE: true,
  COUNTDOWN_BUBBLE: true,
  SETTINGS_PANEL: true,
  HIGH_CONTRAST: true,

  // Phase 2+ - Future
  SUBPATH_DRILLDOWN: false,
  STREAKS: false,
  AVERAGES: false,
  EXPORT_PNG: false,
  EXPORT_DATA: false,
  BADGES: false,
  FOCUS_MODE: false,
  DARK_MODE: false,
};

export function isFeatureEnabled(featureName) {
  return FEATURES[featureName] === true;
}
```

### Usage Example

```javascript
import { isFeatureEnabled } from '../common/feature-flags.js';

if (isFeatureEnabled('RADIAL_GRAPH')) {
  renderRadialGraph();
} else {
  renderSimpleList();
}
```

## Success Criteria for MVP Launch

### Acquisition
- 100 installs within first week
- 1 GitHub star
- 1 viral social media post demonstrating delight

### Functionality
- All MVP features working without critical bugs
- Passes manual QA checklist
- No JavaScript errors in console
- Loads successfully in Chrome 100+

### Quality
- WCAG 2.1 AA compliance
- Popup load <300ms (tested)
- No memory leaks (Chrome DevTools profiling)
- Extension size <500KB

### User Experience
- Onboarding clear and welcoming
- Block page is playful, not frustrating
- Settings are intuitive
- Privacy messaging prominent

## Timeline

- **Week 1-2**: MVP core features (Tasks 1.1-1.10)
- **Week 3**: Testing, bugfixing, polish
- **Week 4**: Soft launch, gather feedback

## Dependencies

### External
- D3.js v7.8.5
- Chrome APIs: tabs, storage, webRequest, notifications

### Internal
- All Phase 0 tasks completed ✅
- Brand kit assets (colors, typography) documented ✅
- UX wireframes available ✅
