# Implementation Plan: FocusBear Landing Page

**Branch**: `001-landing-page` | **Date**: 2025-12-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-landing-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create an elegant, standalone marketing landing page for the FocusBear Chrome extension with a dedicated privacy policy page. The site will be built with React, Vite, and TailwindCSS, featuring a dashboard-style design with card-based feature highlights, screenshot gallery with lightbox, and responsive mobile-first layout. The page will be deployed to Netlify and serves as the primary entry point for potential users to discover and install the extension.

## Technical Context

**Language/Version**: JavaScript ES2020+ (React 18.x, Vite 5.x)
**Primary Dependencies**: React 18, React Router 6, TailwindCSS 3, Lucide Icons, react-medium-image-zoom or similar lightbox library
**Storage**: N/A (static site, no backend storage)
**Testing**: Vitest for unit tests, React Testing Library for component tests, Playwright for E2E tests (optional)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge), responsive design (320px to 2560px width)
**Project Type**: Web frontend (single-page application with client-side routing)
**Performance Goals**: Time to Interactive (TTI) ≤ 3s on 4G, Lighthouse performance score 90+, bundle size < 200KB gzipped
**Constraints**: Must work without JavaScript for core content (progressive enhancement), sticky header with auto-hide on mobile, WCAG 2.1 AA accessibility compliance
**Scale/Scope**: 2 routes (landing + privacy policy), ~6 React components, ~6 screenshot images, single-tenant static deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Privacy-First** | ⚠️ **VIOLATION** | Landing page is a **separate project** from the Chrome extension. The extension follows privacy-first (local-only, no external calls). The landing page is a **static marketing site** with no user data collection, but it **does not fall under the extension's privacy constraints** because it is not the extension itself. |
| **II. Minimal Dependencies** | ⚠️ **VIOLATION** | Constitution prohibits frontend frameworks (React, Vue, Angular). Landing page spec explicitly requires **React, Vite, TailwindCSS** which conflicts with the "vanilla JavaScript only" constraint for the extension. |
| **III. Chrome MV3 Compliance** | ✅ **N/A** | Landing page is not a Chrome extension, so MV3 compliance does not apply. |
| **IV. Accessibility (WCAG 2.1 AA)** | ✅ **PASS** | Spec requires WCAG 2.1 AA compliance, keyboard navigation, color contrast ratios, and Lighthouse accessibility score 90+. Fully aligned. |
| **V. Performance First** | ✅ **PASS** | Spec requires TTI ≤ 3s on 4G, responsive across all viewports, lazy loading for images. Performance targets are explicit and measurable. |

### Justification for Violations

**Privacy-First & Minimal Dependencies Violations:**

The FocusBear project consists of TWO distinct codebases:

1. **Chrome Extension** (existing codebase in `/src/`, `/background/`, `/popup/`, etc.)
   - MUST follow all constitution principles (vanilla JS, local-only, D3.js only)
   - Subject to all privacy, security, and performance constraints
   - This is the core product

2. **Landing Page** (new codebase in `/landing-page/`)
   - **Standalone marketing site** with separate deployment (Netlify)
   - **No shared build configuration** with extension (per spec assumptions)
   - **Does not handle user data** (static content only)
   - Uses modern web stack (React, Vite, Tailwind) for **developer productivity and maintainability**
   - **Not subject to extension's technical constraints** because it is not loaded by Chrome as an extension

**Why React/Vite/Tailwind are justified for the landing page:**
- Landing page is a **separate deployment artifact** (Netlify static site, not Chrome extension bundle)
- No impact on extension size or performance (different build pipeline)
- React ecosystem provides accessibility patterns (React ARIA), testing tools, and component libraries that accelerate development
- TailwindCSS enables rapid responsive design with utility classes, reducing custom CSS burden
- Vite provides fast dev experience and optimized production builds
- Landing page performance goals (TTI ≤ 3s) are achievable with code-splitting and lazy loading

**Why simpler alternatives were rejected:**
- **Vanilla JS + HTML/CSS**: Would require significantly more development time for routing, state management, responsive design patterns, and accessibility implementation without framework support. Landing pages need rapid iteration.
- **Sharing extension's vanilla JS approach**: Landing page has different constraints (SEO, marketing content, visual design flexibility) that benefit from a component-based architecture. The extension's constraints (popup load time, bundle size) do not apply to a standalone website.

### Decision

**PROCEED** with React/Vite/TailwindCSS for landing page as a separate project with separate constitution rules:

**Landing Page Constitution (subset):**
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Performance (TTI ≤ 3s)
- ✅ No user data collection (static site)
- ✅ Security (CSP, XSS protection)
- ❌ Minimal Dependencies constraint **does not apply** (separate project)
- ❌ Chrome MV3 compliance **does not apply** (not an extension)

**Extension Constitution (unchanged):**
- All 5 principles remain enforced for extension codebase

## Project Structure

### Documentation (this feature)

```text
specs/001-landing-page/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── checklists/          # Generated checklists for validation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
landing-page/                    # NEW: Standalone landing page project
├── public/                      # Static assets
│   ├── screenshots/             # Extension screenshots (symlink to /screenshots/)
│   ├── og-image.png             # Open Graph preview image
│   └── favicon.ico              # Favicon
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Sticky header with nav and logo
│   │   ├── Footer.jsx           # Footer with links
│   │   ├── Hero.jsx             # Hero section with CTA
│   │   ├── Features.jsx         # Card-based feature highlights
│   │   ├── Screenshots.jsx      # Screenshot gallery with lightbox
│   │   └── Lightbox.jsx         # Modal for full-size images
│   ├── pages/
│   │   ├── Landing.jsx          # Main landing page (/)
│   │   └── Privacy.jsx          # Privacy policy page (/privacy)
│   ├── styles/
│   │   └── index.css            # Global styles + Tailwind imports
│   ├── App.jsx                  # React Router setup
│   └── main.jsx                 # Vite entry point
├── tests/
│   ├── components/              # Component unit tests
│   └── e2e/                     # Playwright E2E tests (optional)
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # TailwindCSS configuration
├── postcss.config.js            # PostCSS for Tailwind
├── package.json                 # Dependencies and scripts
├── netlify.toml                 # Netlify deploy configuration
└── README.md                    # Landing page setup instructions

# Existing extension codebase (UNCHANGED)
src/                             # Extension source code
├── background/
├── popup/
├── dashboard/
├── blocked/
├── help/
├── content/
└── common/

screenshots/                     # Extension screenshots (shared with landing page)
├── dashboard.png
├── dashboard-reddit.png
├── settings.png
├── set-block.png
├── set-block-rules.png
└── Help-FAQ.png
```

**Structure Decision**:

This is a **web application** project (Option 2 adapted for frontend-only). The landing page is a **separate frontend project** in `/landing-page/` with no backend. It does not share build configuration with the existing Chrome extension codebase.

**Key points:**
- Landing page is isolated in `/landing-page/` directory
- Uses `public/screenshots/` symlink to reuse extension screenshots from `/screenshots/`
- Separate `package.json` and build pipeline from extension
- Deployed independently to Netlify (extension deploys to Chrome Web Store)
- No code sharing with extension to maintain separation of concerns

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Minimal Dependencies (React/Vite/Tailwind)** | Landing page is a **separate project** from the Chrome extension with different constraints. React ecosystem provides accessibility patterns, responsive design utilities, and developer productivity that accelerate marketing site development. | **Vanilla JS/HTML/CSS**: Would require significantly more development time for routing, component composition, responsive design, and accessibility patterns. Landing pages need rapid iteration and modern UX patterns that benefit from framework support. Extension's constraints (bundle size, popup load time) do not apply to standalone website. |
| **Privacy-First (static site vs extension)** | Landing page is a **marketing website** with no user data collection. Constitution's privacy-first principle applies to **extension data handling**, not to static marketing content. | **N/A**: Landing page does not collect, store, or transmit user data. It only serves static marketing content and links to Chrome Web Store. Privacy-first principle is satisfied for its scope (no data = no privacy risk). |

---

## Phase 0: Research (Next Steps)

**Purpose**: Resolve technical unknowns and establish best practices for implementation.

**Research Tasks** (to be executed by `/speckit.plan` command):

1. **React + Vite + TailwindCSS setup best practices**
   - Optimal Vite configuration for production builds (code splitting, tree shaking)
   - TailwindCSS purge configuration to minimize CSS bundle size
   - React 18 concurrent features and Suspense boundaries

2. **Lightbox library selection**
   - Compare: `react-medium-image-zoom`, `yet-another-react-lightbox`, `react-image-lightbox`
   - Criteria: accessibility (keyboard nav, focus management), bundle size, mobile touch support

3. **Open Graph image generation**
   - Recommended dimensions (1200x630px for og:image)
   - Design approach: auto-generate from hero section or custom branded image

4. **Netlify deployment configuration**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Redirect rules for SPA routing (/* → /index.html for client-side navigation)
   - Environment variable handling (if Chrome Web Store URL needs to be configurable)

5. **Accessibility patterns for React**
   - Focus management for lightbox modal (trap focus, return focus on close)
   - Keyboard navigation for header auto-hide on mobile (ensure sticky behavior doesn't break tab order)
   - ARIA live regions for dynamic content (if any)

6. **Performance optimization techniques**
   - Image lazy loading strategies (native `loading="lazy"` vs Intersection Observer)
   - Code splitting for privacy policy page (React.lazy + Suspense)
   - Font loading strategy (preload Inter font, fallback to system fonts)

**Output**: `research.md` with findings and decisions for each task.

---

## Phase 1: Design & Contracts (Next Steps)

**Prerequisites**: `research.md` complete

**Deliverables**:

1. **data-model.md**: Data structures for landing page
   - Page content schema (hero, features, screenshots metadata)
   - Open Graph meta tags structure
   - Screenshot gallery data model

2. **contracts/**: API contracts (if any)
   - **N/A for this feature** (static site, no backend APIs)
   - Document Chrome Web Store URL as external dependency

3. **quickstart.md**: Developer setup guide
   - Prerequisites (Node.js version, npm/pnpm)
   - Installation steps
   - Development server command
   - Build and preview commands
   - Deployment to Netlify

4. **Agent context update**: Run `.specify/scripts/bash/update-agent-context.sh claude`

---

## Phase 2: Task Generation (Separate Command)

**Not executed by `/speckit.plan`**. Run `/speckit.tasks` after this plan is complete.

**Output**: `tasks.md` with dependency-ordered implementation tasks.
