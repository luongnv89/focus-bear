# Feature Specification: FocusBear Landing Page

**Feature Branch**: `001-landing-page`
**Created**: 2025-12-01
**Status**: Draft
**Input**: User description: "Create an elegant, clean focus landing page for FocusBear Chrome extension with React, Vite, TailwindCSS, and Lucide icons. Single page with dashboard-style design, dedicated privacy policy page, CTA buttons. Screenshots in screenshots/ folder. Source code in landing-page/ folder. Hosted on Netlify."

## Clarifications

### Session 2025-12-01

- Q: The spec mentions "dashboard-style design" but doesn't specify what visual patterns or layout structure this means for the landing page. → A: Multiple sections with card-based feature highlights and metrics-style presentation
- Q: User Story 3 mentions "view screenshots at larger sizes for detail" but doesn't specify the interaction mechanism. → A: Click opens lightbox/modal overlay with full-size image and navigation arrows
- Q: The spec states "sticky/fixed header" but doesn't clarify the behavior on mobile devices where screen real estate is limited. → A: Sticky on desktop, auto-hides on scroll down (mobile) and reappears on scroll up
- Q: The spec mentions "appropriate Open Graph meta tags" but doesn't define which specific tags or what content should be used for social sharing previews. → A: Standard set: og:title, og:description, og:image, og:url, og:type (website), twitter:card (summary_large_image)
- Q: Success Criteria SC-001 specifies "3 seconds on 4G connection" but doesn't define what "fully loads and becomes interactive" means technically. → A: Time to Interactive (TTI) ≤ 3s - all content visible and main thread available for user input

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover FocusBear and Install Extension (Priority: P1)

A potential user visits the landing page to learn about FocusBear. They want to quickly understand what the extension does, see it in action through screenshots, and install it from the Chrome Web Store.

**Why this priority**: This is the primary conversion goal - getting users to understand the product value and install the extension. Without this, the landing page fails its core purpose.

**Independent Test**: Can be fully tested by visiting the landing page, scrolling through content, and clicking the CTA to reach the Chrome Web Store. Delivers immediate value by converting visitors to users.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the homepage, **When** the page loads, **Then** they see a hero section with a clear headline, tagline, and primary CTA button to install the extension
2. **Given** a visitor is on the homepage, **When** they scroll down, **Then** they see feature highlights, screenshots, and supporting content that explains the extension's benefits
3. **Given** a visitor clicks the "Add to Chrome" CTA button, **When** the click occurs, **Then** they are redirected to the Chrome Web Store listing for FocusBear

---

### User Story 2 - Review Privacy Policy (Priority: P2)

A privacy-conscious user wants to understand how FocusBear handles their data before installing. They navigate to a dedicated privacy policy page to review the extension's data practices.

**Why this priority**: Privacy is a core selling point of FocusBear ("privacy-first, local-only"). Users need easy access to understand data handling, and this is required for Chrome Web Store compliance.

**Independent Test**: Can be fully tested by clicking the privacy policy link from the landing page and reading the complete privacy information on a dedicated page.

**Acceptance Scenarios**:

1. **Given** a visitor is on the landing page, **When** they look for privacy information, **Then** they find a clear link to the privacy policy page
2. **Given** a visitor clicks the privacy policy link, **When** navigation occurs, **Then** they are taken to a dedicated privacy page (not just a modal or popup)
3. **Given** a visitor is on the privacy policy page, **When** they read the content, **Then** they see comprehensive privacy information matching the existing PRIVACY.md content

---

### User Story 3 - View Extension Screenshots (Priority: P3)

A potential user wants to see what the extension looks like before installing. They browse through screenshots showing the dashboard, settings, and other features.

**Why this priority**: Visual proof helps users understand the product and builds trust. Screenshots reduce uncertainty and increase conversion likelihood.

**Independent Test**: Can be fully tested by viewing all screenshots displayed on the landing page with appropriate captions/context.

**Acceptance Scenarios**:

1. **Given** a visitor is on the landing page, **When** they scroll to the screenshots section, **Then** they see extension screenshots displayed prominently
2. **Given** screenshots are displayed, **When** the visitor views them, **Then** each screenshot has descriptive context explaining what it shows
3. **Given** screenshots are displayed, **When** the visitor clicks on a screenshot, **Then** it opens in a lightbox/modal overlay with full-size image and navigation arrows to browse other screenshots

---

### User Story 4 - Navigate Using Header and Footer (Priority: P4)

A visitor uses the navigation elements to move between sections of the landing page and access key pages like the privacy policy.

**Why this priority**: Good navigation improves user experience and helps visitors find information quickly. Lower priority because the single-page design naturally guides users through content.

**Independent Test**: Can be fully tested by clicking navigation links and verifying smooth scrolling/routing to correct sections and pages.

**Acceptance Scenarios**:

1. **Given** a visitor is viewing any part of the landing page, **When** they look at the header, **Then** they see clear navigation options including links to sections and the privacy page
2. **Given** a visitor clicks a navigation link, **When** the navigation action occurs, **Then** the page smoothly scrolls to the relevant section or navigates to the appropriate page
3. **Given** a visitor scrolls to the footer, **When** they view the footer content, **Then** they see relevant links including GitHub, privacy policy, and other useful information

---

### Edge Cases

- What happens when a user visits on a mobile device? The page must be fully responsive and provide an optimized mobile experience with touch-friendly interactions
- How does the page handle slow image loading? Screenshots should use lazy loading with appropriate placeholder states
- What happens when the Chrome Web Store link is clicked on a non-Chrome browser? The link opens the Chrome Web Store web page (works in all browsers)
- What if JavaScript is disabled? Core content (text, images) should be visible; interactive features gracefully degrade

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a hero section with headline, tagline, and primary CTA button on page load
- **FR-002**: System MUST include a features section with card-based feature highlights and metrics-style presentation showcasing key benefits: privacy-first local-only data storage, visual graph dashboard, customizable site limits, focus score and streaks
- **FR-003**: System MUST display extension screenshots from the screenshots/ folder with descriptive captions and clickable lightbox/modal functionality for full-size viewing with keyboard-navigable arrows
- **FR-004**: System MUST provide a primary "Add to Chrome" CTA button linking to Chrome Web Store
- **FR-005**: System MUST have a dedicated privacy policy page at /privacy route
- **FR-006**: System MUST include a header with logo and navigation links that is sticky on desktop and auto-hides on scroll down (reappearing on scroll up) on mobile devices
- **FR-007**: System MUST include a footer with GitHub repository link, privacy policy link, and copyright
- **FR-008**: System MUST be responsive across mobile (320px+), tablet (768px+), and desktop (1024px+) viewports
- **FR-009**: System MUST use the FocusBear dark theme design: dark background (#060606), bright green accent (#1bff6e), monochrome neutrals
- **FR-010**: System MUST implement smooth scroll navigation for internal section links
- **FR-011**: System MUST support keyboard navigation for all interactive elements
- **FR-012**: System MUST include Open Graph meta tags for social sharing: og:title, og:description, og:image, og:url, og:type (website), and twitter:card (summary_large_image)
- **FR-013**: System MUST be deployable to Netlify with proper build configuration

### Key Entities

- **Landing Page**: Main marketing page with hero section, card-based feature highlights in metrics-style presentation, screenshots gallery, and call-to-action sections
- **Privacy Policy Page**: Dedicated page displaying complete privacy policy content from PRIVACY.md
- **Screenshot Gallery**: Collection of extension screenshots with captions showing dashboard, settings, blocking rules, help page
- **Navigation**: Header navigation (logo, section links, CTA) and footer navigation (links, copyright)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page Time to Interactive (TTI) ≤ 3 seconds on 4G connection (all content visible and main thread available for user input)
- **SC-002**: All 6 screenshots from screenshots/ folder are displayed with appropriate context
- **SC-003**: Privacy policy page contains all content from existing PRIVACY.md file
- **SC-004**: Page renders correctly on viewports from 320px to 2560px width
- **SC-005**: All interactive elements are accessible via Tab key navigation
- **SC-006**: Color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for normal text)
- **SC-007**: Site builds and deploys successfully to Netlify without errors
- **SC-008**: Lighthouse accessibility score of 90+ on both mobile and desktop

## Assumptions

- Chrome Web Store listing URL will be provided or uses a placeholder that can be updated later
- Screenshots in screenshots/ folder are production-ready and appropriately sized
- The landing page is a standalone project in landing-page/ and does not share build configuration with the extension
- Netlify's default build settings for Vite projects will be used (build command: npm run build, publish directory: dist)
- React Router will be used for client-side routing between landing page and privacy policy
- No backend or server-side rendering is required; this is a static site
