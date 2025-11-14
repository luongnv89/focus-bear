# FocusBear

A playful, privacy-first Chrome extension that helps you track your focus-switching habits through an interactive D3.js visualization.

## Current Status

**Phase 0 (POC)** - In Development

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser (version 100+)

### Installation

```bash
# Install dependencies
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
│   ├── popup/          # Popup UI (HTML, CSS, JS)
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

## Privacy

FocusBear is **100% local-only**. No data ever leaves your device. No analytics, no tracking, no cloud sync.

## License

MIT
