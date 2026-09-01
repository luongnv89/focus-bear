<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial constitution)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (5 principles)
  - Technical Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no changes needed - generic Constitution Check)
  - .specify/templates/spec-template.md ✅ (no changes needed - generic template)
  - .specify/templates/tasks-template.md ✅ (no changes needed - generic template)
Follow-up TODOs: None
-->

# FocusBear Constitution

## Core Principles

### I. Privacy-First

All user data MUST remain local to the user's device. No external API calls,
telemetry, analytics, or cloud synchronization is permitted. This principle is
non-negotiable and applies to all features, including future enhancements.

**Requirements:**
- All data stored exclusively in `chrome.storage.local`
- No network requests to external servers
- No third-party analytics or tracking scripts
- No account/login requirements
- Users MUST be able to delete all data via standard Chrome mechanisms

**Rationale:** User trust is paramount. Focus tracking data is sensitive and
personal. Local-only architecture eliminates privacy concerns and data breach
risks entirely.

### II. Minimal Dependencies

The extension MUST minimize external dependencies to ensure fast load times,
small bundle size, and reduced attack surface. D3.js is the sole permitted
visualization library.

**Requirements:**
- Frontend MUST use vanilla JavaScript (ES modules)
- Only D3.js v7 permitted for visualization
- No frontend frameworks (React, Vue, Angular, etc.)
- Total extension size MUST remain under 500KB
- New dependencies require explicit justification and approval

**Rationale:** Chrome extensions load frequently. Every millisecond and kilobyte
matters. Minimal dependencies also reduce security vulnerabilities and
maintenance burden.

### III. Chrome MV3 Compliance

All implementation MUST strictly follow Chrome Extension Manifest V3
specifications. Legacy patterns from MV2 are not permitted.

**Requirements:**
- Use Service Worker for background processing (not background pages)
- Follow Chrome's permission model precisely
- Request only necessary permissions (principle of least privilege)
- No remote code execution
- Content Security Policy MUST be enforced

**Rationale:** MV3 is required for Chrome Web Store distribution. Compliance
ensures longevity and security of the extension.

### IV. Accessibility (WCAG 2.1 AA)

All user interfaces MUST meet WCAG 2.1 Level AA compliance. Accessibility is
not optional or a future enhancement—it is a core requirement.

**Requirements:**
- All features MUST be usable via keyboard alone (Tab, Enter, Space, Arrow keys)
- Color contrast MUST meet minimum 4.5:1 for text, 3:1 for UI components
- All interactive elements MUST have descriptive ARIA labels
- Animations MUST respect `prefers-reduced-motion` media query
- Focus indicators MUST be visible on all interactive elements
- Screen reader compatibility MUST be verified

**Rationale:** Software should be usable by everyone. Accessibility benefits
all users, not just those with disabilities, and is required for responsible
public distribution.

### V. Performance First

The extension MUST maintain responsive performance targets regardless of data
volume. User experience should never degrade as usage history grows.

**Requirements:**
- Popup load time MUST be under 300ms
- D3.js radial graph render MUST complete in under 1s for 100 domain nodes
- Tab switch detection MUST be instant (no perceptible lag)
- Background tracking MUST not impact browser performance
- Data queries MUST be optimized for common time ranges

**Rationale:** A productivity tool that slows down the browser defeats its
purpose. Performance is a feature, not an afterthought.

## Technical Constraints

**Language/Platform:**
- JavaScript ES2020+ (ES modules)
- Chrome Extension APIs (Manifest V3)
- HTML5, CSS3

**Permitted Libraries:**
- D3.js v7 (visualization only)
- No others without explicit approval

**Storage:**
- `chrome.storage.local` exclusively
- No IndexedDB, localStorage, or external databases

**Security Requirements:**
- XSS protection: Use `textContent` or safe DOM APIs; never `innerHTML` with
  untrusted data
- No secrets or API keys in codebase
- Fail gracefully without exposing stack traces to users
- Input validation at all user-facing boundaries

**Code Quality:**
- ESLint for linting
- Prettier for formatting
- Jest for unit testing
- All code MUST pass lint checks before merge

## Development Workflow

**Branching:**
- `main` branch is production-ready
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

**Code Review:**
- All changes require review before merging
- Reviewers MUST verify constitution compliance

**Testing:**
- Unit tests for core logic (storage, limits, focus score)
- Manual testing for UI interactions
- Lighthouse audits for accessibility and performance
- Keyboard navigation verification for all new features

**Commit Standards:**
- Clear, descriptive commit messages
- Reference related issues where applicable

## Governance

This constitution supersedes all other development practices and guidelines.
When conflicts arise between this constitution and other documentation, this
constitution takes precedence.

**Amendment Process:**
1. Propose amendment with rationale
2. Document impact on existing code and features
3. Obtain stakeholder approval
4. Update constitution with version increment
5. Propagate changes to dependent documentation

**Version Policy:**
- MAJOR: Backward-incompatible principle changes or removals
- MINOR: New principles added or significant guidance expansion
- PATCH: Clarifications, wording improvements, non-semantic refinements

**Compliance Review:**
- All pull requests MUST be verified against constitution principles
- Constitution violations block merge
- Exceptions require documented justification in Complexity Tracking

**Version**: 1.0.0 | **Ratified**: 2025-12-01 | **Last Amended**: 2025-12-01
