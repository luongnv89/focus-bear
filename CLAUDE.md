# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FocusBear** is a Chrome extension (Manifest V3) that helps users track focus-switching habits through an interactive D3.js visualization. The extension is privacy-first and local-only with no external API calls or cloud synchronization.

**Current Status:** Planning/specification phase. Documentation complete; implementation beginning with Phase 0 (POC).

**Tech Stack:** Vanilla JavaScript (ES modules), D3.js v7, Chrome APIs (tabs, storage, webRequest, notifications), HTML5/CSS3

## Development Roadmap

The project is organized into 4 phases (see `tasks.md` for detailed breakdown):

1. **Phase 0:** Core tracking + basic list UI (1 week) - POC validation
2. **Phase 1:** MVP core features - D3 graph, limits, block page, settings (2 weeks)
3. **Phase 2:** Polish - onboarding, streaks, animations, high-contrast mode (1 week)
4. **Phase 3:** Advanced features - subpath drilldown, export formats, testing (2 weeks)
5. **Phase 4:** Launch - store assets, accessibility audit, Chrome Web Store submission (1 week)

**MVP Feature Set:**
- Per-domain focus visit tracking
- Interactive radial graph visualization with time-range filtering
- Per-site daily limits with countdown bubbles
- Humorous block page when limits exceeded
- Settings panel for limit configuration
- WCAG 2.1 AA accessibility compliance

## Architecture

### High-Level System Design

```
Service Worker (Background)
├─ Monitors tabs.onActivated/onUpdated events
├─ Extracts domain/path from active tab URL
├─ Stores visit counts in chrome.storage.local
├─ Enforces limits via webRequest.onBeforeRequest interception
└─ Sends toast notifications for countdown

Popup UI
├─ Renders D3.js radial graph (user at center, domains as orbiting nodes)
├─ Filters data by time range (hour/day/week/month)
├─ Allows domain search and highlighting
├─ Provides settings panel for per-site daily limits
└─ Displays stats and achievements

Block Page
├─ Static HTML shown when domain limit exceeded
├─ Humorous, brand-aligned messaging
├─ "Back to Work" button to bypass (with cooldown)
└─ Future: rotating themes and mini-games
```

### Data Storage Schema

```javascript
{
  "visits": {
    "2025-11-14": {
      "example.com": 5,
      "twitter.com": 12,
      "reddit.com/r/programming": 3
    }
  },
  "limits": {
    "example.com": 10,
    "twitter.com": 5
  }
}
```

### Core Modules (to be created in `/src/`)

- **`background/tracking.js`** - tabs.onActivated/onUpdated handlers, domain extraction, visit counting
- **`background/storage.js`** - Data model helpers, chrome.storage.local queries
- **`background/limits.js`** - Limit checking, enforcement, webRequest interception
- **`background/index.js`** - Service worker entry point
- **`popup/popup.html`** - Popup UI structure
- **`popup/popup.js`** - Popup initialization and event handlers
- **`popup/graph.js`** - D3.js radial graph rendering and interaction
- **`popup/settings.js`** - Settings panel UI and persistence
- **`content/countdown-bubble.js`** - Toast notification rendering
- **`blocked/blocked.html`** - Block page template

## Development Guidelines

### Code Style & Quality

- **Module Format:** ES modules (`import`/`export`)
- **JavaScript Version:** Modern JS (const/let, arrow functions, template literals, destructuring)
- **Conventions:** Airbnb/StandardJS style guide
- **Linting:** ESLint configuration required
- **Formatting:** Prettier for consistent code formatting

### Key Architectural Principles

1. **Privacy-First:** No external APIs, no telemetry, no cloud sync - all data stays local
2. **Single Responsibility:** Clear separation between tracking, storage, display, and enforcement
3. **Minimal Dependencies:** Vanilla JS for popup (size), D3.js only for visualization
4. **Chrome MV3 Compliance:** Use Service Worker (not background page), respect permission model
5. **Performance:** Popup load < 300ms, graph render < 1s for 100 domains

### Security Considerations

- **XSS Protection:** Use `textContent` or safe DOM APIs; never use `innerHTML` with untrusted data
- **Minimal Permissions:** Request only necessary Chrome permissions
- **No Secrets:** Never hardcode API keys or sensitive data
- **Fail Gracefully:** Handle errors without exposing stack traces

### Testing Strategy

- **Unit Tests:** Jest for core logic (data aggregation, limit checks, streak calculations)
- **Integration Tests:** Manual testing of popup UI and background event handlers
- **Performance:** Chrome DevTools profiling for popup/graph responsiveness
- **Accessibility:** Lighthouse audit, manual WCAG 2.1 AA checks, keyboard navigation testing

## Common Development Commands

> Note: Commands below are to be implemented as the project adds build tooling

### Build & Development

```bash
# Install dependencies
npm install

# Build/bundle extension (minify JS/CSS)
npm run build

# Development mode (watch for changes)
npm run dev

# Lint code with ESLint
npm run lint

# Format code with Prettier
npm run format

# Run tests
npm run test

# Run single test file
npm run test -- tests/background/limits.test.js

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select project root directory
```

### Local Testing & Debugging

```bash
# View extension logs
# 1. Open chrome://extensions/
# 2. Find "FocusBear"
# 3. Click "Inspect views" > "service_worker"

# Debug popup
# 1. Click extension icon (FocusBear in toolbar)
# 2. Right-click popup → "Inspect"

# Check storage
# In DevTools Console:
chrome.storage.local.get(null, (data) => console.log(data))
```

## Important Files & References

- **`tasks.md`** - Detailed task breakdown by sprint and phase
- **`todo-list.md`** - Checklist of all tasks
- **`phase-1-requirements/prd.md`** - Complete product requirements
- **`phase-1-requirements/ux_design.md`** - UI/UX wireframes and user flows
- **`phase-1-requirements/brand_kit.md`** - Brand guidelines, colors, typography
- **`AGENTS.md`** - Detailed coding guidelines and AI agent instructions

## Brand & Design System

**Primary Colors:**
- Bear Blue: `#0E75B6` (primary actions, focus)
- Focus Purple: `#6C5CE7` (secondary, creativity)
- Alert Red: `#D63031` (limit exceeded)
- Warning Orange: `#FF9F43` (nearing limit)
- Success Green: `#55EFC4` (achievements)

**Typography:**
- Font: Inter (primary), Roboto (fallback)
- Popup sizes: H1=20px, H2=16px, Body=13-14px

**UI Components:** Buttons, toasts, pills/tags, graph nodes, toggles, inputs
- Use Material Icons + custom SVGs for consistency
- Include bear mascot illustrations where appropriate

**Personality:** Playful, honest, supportive, clever, minimalist - no guilt-tripping, only encouragement

## Accessibility Requirements

- **Target:** WCAG 2.1 AA compliance
- **Keyboard Navigation:** All features usable via keyboard (Tab, Enter, Space, Arrow keys)
- **Color Contrast:** Minimum 4.5:1 for text, 3:1 for UI components
- **ARIA Labels:** Descriptive labels for all interactive elements
- **Reduced Motion:** Respect `prefers-reduced-motion` media query
- **Focus Indicators:** Visible focus rings on interactive elements

## Performance Targets

- Popup load: < 300ms
- D3.js radial graph render: < 1s for 100 domain nodes
- Tab switch detection: Instant (no perceptible lag)
- Chrome extension size: < 500KB

## Additional Notes

- **No external dependencies beyond D3.js** - Keep bundle minimal for faster load times
- **Extension-only distribution** - Chrome Web Store release planned for Phase 4
- **Desktop only** - Initial release targets desktop browsers; mobile extension support may be added later
- **Data deletion** - Users can clear all tracking data via Chrome's extension settings
- **Testing environments** - Use test suites and manual testing with multiple tab/domain scenarios

