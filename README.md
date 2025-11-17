<div align="center">
  <img src="assets/icon.svg" alt="FocusBear Logo" width="128" height="128">

  # FocusBear

  ### Your attention, mapped with empathy

  A playful, privacy-first Chrome extension that helps you track your focus-switching habits through an interactive D3.js visualization.

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow.svg)](https://www.google.com/chrome/)
  [![Privacy First](https://img.shields.io/badge/Privacy-First-green.svg)](#privacy)
</div>

---

## Current Status

**Phase 0 (POC)** - In Development

## Using FocusBear

- Click the FocusBear toolbar icon to open the full FocusBear Dashboard in a new tab.
- Interact with the radial graph, switch the time filters, and refresh data directly from that page—no cramped popup required.
- The extension still runs entirely locally; the dashboard is just another extension page with more breathing room for D3.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser (version 100+)

### Installation

```bash
# Install dependencies (also sets up pre-commit hooks)
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

### Code Quality & CI/CD

This project uses automated quality checks to maintain code standards:

**Pre-commit Hooks** (via Husky + lint-staged):
- Automatically runs on `git commit`
- Lints and formats staged files
- Runs tests for changed files
- Validates build succeeds

**GitHub Actions CI**:
- Runs on every push and pull request
- Tests on Node.js 18.x and 20.x
- Checks: ESLint, Prettier, Jest tests, build validation
- Generates code coverage reports

See [.github/README.md](.github/README.md) for detailed CI/CD documentation.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the project root directory (or `dist/` after building)

### Project Structure

```
focus-bear/
├── src/
│   ├── background/     # Service worker scripts
│   ├── popup/          # Shared popup styles/components (still used by dashboard)
│   ├── dashboard/      # Full-page dashboard UI
│   ├── blocked/        # Block page
│   └── content/        # Content scripts
├── assets/             # Icons and images
├── scripts/            # Build scripts
├── phase-1-requirements/  # Product requirements
├── manifest.json       # Chrome extension manifest (MV3)
└── package.json        # Node dependencies
```

## Documentation

- [Product Requirements](./phase-1-requirements/prd.md)
- [UX Design](./phase-1-requirements/ux_design.md)
- [Brand Kit](./phase-1-requirements/brand_kit.md)
- [Tasks](./tasks.md)
- [Todo List](./todo-list.md)
- [Claude Instructions](./CLAUDE.md)

## Features (Planned)

### Phase 0 - POC
- [x] Chrome Extension MV3 skeleton
- [ ] Focus-switch tracking
- [ ] Basic popup UI with domain list

### Phase 1 - MVP
- [ ] D3.js radial graph visualization
- [ ] Time range filters
- [ ] Per-site daily limits
- [ ] Block page with humor
- [ ] Settings panel
- [ ] Accessibility compliance (WCAG 2.1 AA)

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES modules), D3.js v7, HTML5, CSS3
- **Backend:** Chrome Extension APIs (tabs, storage, webRequest, notifications)
- **Build:** Node.js scripts, ESLint, Prettier
- **Testing:** Jest
- **CI/CD:** GitHub Actions, Husky, lint-staged

## Privacy

FocusBear is **100% local-only**. No data ever leaves your device. No analytics, no tracking, no cloud sync.

## License

MIT
