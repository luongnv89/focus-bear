# Tasks: FocusBear Landing Page

**Input**: Design documents from `/specs/001-landing-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md, contracts/

**Tests**: Tests are NOT explicitly requested in the feature specification. Testing is manual via checklist (see quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to the landing page project:
- **Source**: `landing-page/src/`
- **Public assets**: `landing-page/public/`
- **Config**: `landing-page/` (root)

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Initialize the landing page project with React, Vite, TailwindCSS, and core configuration.

- [x] T001 Create `landing-page/` directory structure per plan.md project structure
- [x] T002 Initialize Vite project with React template in `landing-page/package.json`
- [x] T003 [P] Install dependencies: react, react-dom, react-router-dom, lucide-react, yet-another-react-lightbox, focus-trap-react
- [x] T004 [P] Configure Vite in `landing-page/vite.config.js` with manual chunk splitting per research.md
- [x] T005 [P] Configure TailwindCSS in `landing-page/tailwind.config.js` with FocusBear dark theme colors (#060606, #1bff6e)
- [x] T006 [P] Configure PostCSS in `landing-page/postcss.config.js` with TailwindCSS and autoprefixer
- [x] T007 [P] Configure ESLint and Prettier in `landing-page/.eslintrc.cjs` and `landing-page/.prettierrc`
- [x] T008 Create `landing-page/.env.example` with required environment variables (VITE_CHROME_STORE_URL, VITE_APP_VERSION, VITE_GITHUB_URL)
- [x] T009 [P] Create `landing-page/index.html` entry point with Open Graph meta tags per research.md
- [x] T010 [P] Create `landing-page/netlify.toml` deployment configuration with SPA redirects and cache headers per research.md
- [x] T011 Copy screenshots from root `/screenshots/` directory to `landing-page/public/screenshots/`
- [ ] T012 [P] Add self-hosted Inter font to `landing-page/public/fonts/Inter-Variable.woff2` with preload configuration

**Checkpoint**: Project initialized, development server runs with `npm run dev`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create `landing-page/src/main.jsx` Vite entry point with React 18 createRoot
- [x] T014 Create `landing-page/src/App.jsx` with React Router setup (routes: `/`, `/privacy`)
- [x] T015 Create `landing-page/src/styles/index.css` with TailwindCSS imports, global styles, and CSS custom properties for FocusBear theme
- [x] T016 [P] Create `landing-page/src/data/navigation.js` with header navigation links and CTA button data per data-model.md
- [x] T017 [P] Create `landing-page/src/data/footer.js` with footer links and copyright data per data-model.md

**Checkpoint**: Foundation ready - App renders with React Router, basic styles applied, navigation data available

---

## Phase 3: User Story 1 - Discover and Install (Priority: P1)

**Goal**: Visitors can discover FocusBear, understand its value proposition, and click to install from Chrome Web Store.

**Independent Test**: Visit landing page, scroll through hero and features sections, click "Add to Chrome" CTA to verify it links to Chrome Web Store.

### Implementation for User Story 1

- [x] T018 [P] [US1] Create `landing-page/src/data/hero.js` with headline, tagline, and CTA content per data-model.md
- [x] T019 [P] [US1] Create `landing-page/src/data/features.js` with 4 feature cards (privacy-first, visual dashboard, site limits, focus score) per data-model.md
- [x] T020 [US1] Create `landing-page/src/components/Hero.jsx` with headline, tagline, primary CTA button, and hero image
- [x] T021 [US1] Create `landing-page/src/components/Features.jsx` with card-based feature highlights and Lucide icons
- [x] T022 [US1] Create `landing-page/src/pages/Landing.jsx` composing Hero and Features sections with smooth scroll targets
- [x] T023 [US1] Style Hero and Features components with TailwindCSS matching FocusBear dark theme (dark background #060606, green accent #1bff6e)
- [x] T024 [US1] Implement responsive design for Hero and Features sections (mobile 320px+, tablet 768px+, desktop 1024px+)
- [x] T025 [US1] Add CTA button linking to Chrome Web Store via environment variable `VITE_CHROME_STORE_URL`
- [x] T026 [US1] Add keyboard accessibility to Hero CTA button with proper focus states and aria-label

**Checkpoint**: User Story 1 complete - Hero and Features sections render with working CTA, responsive design verified

---

## Phase 4: User Story 2 - Privacy Policy Page (Priority: P2)

**Goal**: Privacy-conscious users can review comprehensive privacy policy on a dedicated page.

**Independent Test**: Click privacy link from landing page, verify dedicated /privacy route loads with all PRIVACY.md content.

### Implementation for User Story 2

- [x] T027 [P] [US2] Create `landing-page/src/data/privacy.js` with parsed content from `/PRIVACY.md` per data-model.md
- [x] T028 [US2] Create `landing-page/src/pages/Privacy.jsx` displaying all privacy policy sections
- [x] T029 [US2] Style Privacy page with TailwindCSS matching dark theme, proper typography hierarchy
- [x] T030 [US2] Add back-to-home navigation link on Privacy page
- [x] T031 [US2] Ensure Privacy page is keyboard navigable with proper focus management

**Checkpoint**: User Story 2 complete - Privacy page accessible at /privacy route with full PRIVACY.md content

---

## Phase 5: User Story 3 - Screenshot Gallery (Priority: P3)

**Goal**: Visitors can view extension screenshots with lightbox functionality to see details.

**Independent Test**: View screenshots section, click on any screenshot to open lightbox, use keyboard arrows to navigate, press Escape to close.

### Implementation for User Story 3

- [x] T032 [P] [US3] Create `landing-page/src/data/screenshots.js` with metadata for all 6 screenshots per data-model.md
- [x] T033 [US3] Create `landing-page/src/components/Screenshots.jsx` with integrated yet-another-react-lightbox
- [x] T034 [US3] Create `landing-page/src/components/Screenshots.jsx` gallery grid with clickable thumbnails
- [x] T035 [US3] Integrate Screenshots component into Landing page with smooth scroll section anchor
- [x] T036 [US3] Style screenshot gallery with TailwindCSS grid layout (responsive columns), hover effects
- [x] T037 [US3] Implement lightbox keyboard navigation (arrow keys, Escape to close) per research.md
- [x] T038 [US3] Add lazy loading for screenshot images with native `loading="lazy"` attribute
- [x] T039 [US3] Add descriptive captions and alt text for all screenshots per data-model.md

**Checkpoint**: User Story 3 complete - All 6 screenshots displayed with working lightbox, keyboard accessible

---

## Phase 6: User Story 4 - Navigation (Priority: P4)

**Goal**: Visitors can navigate between sections and pages using header and footer.

**Independent Test**: Tab through header navigation, click links to scroll to sections, verify footer links work, test mobile menu on narrow viewports.

### Implementation for User Story 4

- [x] T040 [US4] Create `landing-page/src/components/Header.jsx` with sticky header, logo, navigation links, and CTA
- [x] T041 [US4] Implement header auto-hide on scroll down (mobile) per spec clarification, using scroll event listener
- [x] T042 [US4] Create `landing-page/src/components/Footer.jsx` with GitHub link, privacy link, copyright
- [x] T043 [US4] Implement smooth scroll navigation for internal section links (#features, #screenshots)
- [x] T044 [US4] Style Header with TailwindCSS - sticky positioning, dark theme, responsive design
- [x] T045 [US4] Style Footer with TailwindCSS - dark theme, responsive layout
- [x] T046 [US4] Add mobile hamburger menu for small viewports with accessible toggle button
- [x] T047 [US4] Add CSS `scroll-padding-top` to prevent header from covering scroll targets per research.md
- [x] T048 [US4] Integrate Header and Footer into App.jsx layout wrapper

**Checkpoint**: User Story 4 complete - Full navigation working, header auto-hides on mobile scroll, all links functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, accessibility compliance, deployment preparation

- [ ] T049 [P] Add `landing-page/public/og-image.jpg` (1200x630px) for Open Graph social sharing preview
- [ ] T050 [P] Add `landing-page/public/favicon.ico` (FocusBear logo)
- [x] T051 Implement code splitting with React.lazy for Privacy page per research.md
- [ ] T052 [P] Add preload link for hero image in index.html for LCP optimization
- [ ] T053 Verify color contrast ratios meet WCAG 2.1 AA (4.5:1 for text) using browser DevTools
- [ ] T054 Test keyboard navigation for all interactive elements: Header nav links, Footer links, Hero CTA, Screenshot thumbnails, Lightbox controls, mobile hamburger menu (Tab order, Enter activation, Escape close, visible focus rings)
- [ ] T055 Run Lighthouse audit on production build targeting 90+ accessibility score
- [ ] T056 Run Lighthouse audit on production build targeting TTI ≤ 3s
- [x] T057 [P] Create `landing-page/README.md` with setup and deployment instructions
- [x] T058 Verify Netlify deployment with `npm run build` and preview with `npm run preview`
- [ ] T059 Test all user stories on mobile viewport (320px width) and desktop (1920px width)
- [ ] T060 Validate all 6 screenshots render correctly with proper captions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3 → P4)
  - OR in parallel if team capacity allows (different components)
- **Polish (Phase 7)**: Depends on User Stories 1-4 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Integrates with Landing page from US1

### Within Each User Story

- Data files before components
- Components before page integration
- Core implementation before styling
- Styling before accessibility/responsive refinements

### Parallel Opportunities

**Phase 1 (Setup):**
```bash
# Launch in parallel:
Task T003: Install dependencies
Task T004: Configure Vite
Task T005: Configure TailwindCSS
Task T006: Configure PostCSS
Task T007: Configure ESLint/Prettier
Task T009: Create index.html
Task T010: Create netlify.toml
Task T012: Add Inter font
```

**Phase 2 (Foundational):**
```bash
# Launch in parallel:
Task T016: Create navigation data
Task T017: Create footer data
```

**Phase 3 (User Story 1):**
```bash
# Launch in parallel:
Task T018: Create hero data
Task T019: Create features data
```

**Phase 5 (User Story 3):**
```bash
# After T033 (Lightbox):
Task T032: Create screenshots data (parallel)
```

---

## Parallel Example: User Story 1

```bash
# Launch data files together:
Task: "Create landing-page/src/data/hero.js with headline, tagline, CTA"
Task: "Create landing-page/src/data/features.js with 4 feature cards"

# Then sequentially:
Task: "Create Hero.jsx component"
Task: "Create Features.jsx component"
Task: "Create Landing.jsx page composing components"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Project runs with `npm run dev`
2. Complete Phase 2: Foundational → App renders with Router
3. Complete Phase 3: User Story 1 → Hero + Features + CTA working
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy to Netlify preview

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Hero/Features/CTA) → Test independently → Deploy Preview (MVP!)
3. Add User Story 2 (Privacy Page) → Test independently → Deploy Preview
4. Add User Story 3 (Screenshots) → Test independently → Deploy Preview
5. Add User Story 4 (Navigation) → Test independently → Deploy Preview
6. Complete Polish → Final Lighthouse audit → Production Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Hero/Features)
   - Developer B: User Story 2 (Privacy) + User Story 3 (Screenshots - data)
3. After US1 complete:
   - Developer A: User Story 4 (Navigation - integrates into Landing)
   - Developer B: User Story 3 (Screenshots - components)
4. Together: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All screenshots symlinked from root `/screenshots/` - verify symlink works before US3
- Chrome Web Store URL uses placeholder until extension is published
- Inter font self-hosted for privacy-first design (no Google Fonts CDN)

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 60 |
| **Phase 1 (Setup)** | 12 tasks |
| **Phase 2 (Foundational)** | 5 tasks |
| **Phase 3 (User Story 1)** | 9 tasks |
| **Phase 4 (User Story 2)** | 5 tasks |
| **Phase 5 (User Story 3)** | 8 tasks |
| **Phase 6 (User Story 4)** | 9 tasks |
| **Phase 7 (Polish)** | 12 tasks |

| User Story | Task Count | Priority |
|------------|------------|----------|
| US1 - Discover and Install | 9 | P1 (MVP) |
| US2 - Privacy Policy | 5 | P2 |
| US3 - Screenshots Gallery | 8 | P3 |
| US4 - Navigation | 9 | P4 |

**Parallel Opportunities**: 23 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Complete Phases 1-3 (User Story 1) = 26 tasks for minimal viable landing page with hero, features, and working CTA
