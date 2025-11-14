# User Experience (UX) Design Document: FocusBear

## UX Overview
- **Purpose:**
  Deliver a playful, intuitive, and privacy-first UX that helps users understand and regulate their attention across websites—without friction or cognitive load. The design must emphasize clarity, delight, and instant value within the constraints of a Chrome extension popup and MV3 architecture.

- **Scope:**
  - Popup UI (Home/Graph View)
  - Settings Panel
  - Countdown Bubbles
  - Humorous Block Page
  - Permission Prompts
  - Export Modal (future release)
  - Accessibility & Interaction Patterns

- **Alignment with PRD and GTM Strategy:**
  - **PRD:** Adheres to requirements for speed (<300ms load), WCAG 2.1 AA compliance, playful tone, and local-only privacy.
  - **GTM:** Designed for instant “wow” moments to encourage sharing (graph, block pages).
  - **Lean Canvas:** Supports the UVP: *“Fun, private, visual focus tracking—zero setup.”*

---

## User Personas

### Persona 1: Alex – The Distracted Freelancer
- **Demographics:** 28, freelance designer, intermediate tech skills
- **Goals:** Reduce Facebook/Twitter distractions and complete work on time
- **Pain Points:** Loses 30–90 minutes daily to unconscious tab switching
- **UX Needs:**
  - Clear immediate feedback (toast bubble, graph updates)
  - Minimal settings complexity
  - Design that sparks delight, not guilt

### Persona 2: Sam – The Procrastinating Student
- **Demographics:** 21, CS student, high proficiency
- **Goals:** Stay focused during study cycles
- **Pain Points:** Constant social media tab refreshing
- **UX Needs:**
  - Easy limit-setting
  - Strong, humorous interruptions
  - Motivational streak visualizations

### Persona 3: Taylor – The Data-Oriented Manager
- **Demographics:** 35, PM, data-savvy and privacy-conscious
- **Goals:** Understand browsing patterns; optimize deep work
- **Pain Points:** Overly complex tools that require cloud accounts
- **UX Needs:**
  - Drillable visualizations
  - Time-range filters
  - Secure, local-only storage messaging

---

## Design Principles

1. **Simplicity:**
   - Minimize required actions. No unnecessary controls.
   - Present only what’s essential in a 400×600 popup.

2. **Delightful Micro-interactions:**
   - Friendly animations
   - Humorous block screens
   - “Bear personality” throughout UI

3. **Clarity & Visual Hierarchy:**
   - Clear domain nodes, color-coded categories
   - Intuitive labels, universal icons

4. **Privacy Before Everything:**
   - Explicit messaging: “Data never leaves your device.”
   - No login, no tracking pixels, no analytics.

5. **Accessibility:**
   - WCAG 2.1 AA
   - High-contrast theme
   - Fully keyboard navigable

---

## Wireframes and Mockups
*(Text descriptions; visuals created separately)*

### Screen 1: **Popup – Home / Radial Graph View**
- **Description:**
  - Header: FocusBear logo + Settings (gear icon)
  - Sub-header: Time-filter dropdown (“Today / 24h / Week / Month”)
  - Main Area: Interactive radial graph
    - User node at center
    - Domains orbit at radius level 1
    - Subpaths orbit at level 2 (if zoomed)
  - Search bar at top for domain filtering
  - Footer: “Data stored locally · No cloud”

- **Purpose:**
  Provide instant insight into browsing habits with minimal friction.

---

### Screen 2: **Settings Panel**
- **Description:**
  - Limit Toggles section (Facebook, Twitter, Reddit, etc.)
  - Custom domain limit entry
  - Data management: Export JSON / Reset All Data
  - Appearance: High Contrast mode toggle
  - About: Privacy statement + version number

- **Purpose:**
  Allow users to configure behavior with minimal cognitive load.

---

### Screen 3: **Countdown Bubble**
- **Description:**
  - Small pill-shaped toast near top-right of browser window
  - Message example: “Facebook: 3 visits left today”
  - Mild animation fade
  - Auto-dismiss after 3 seconds

- **Purpose:**
  Provide lightweight, non-intrusive feedback.

---

### Screen 4: **Block Page (“You’re Over the Limit”)**
- **Description:**
  - Large bear illustration (playful or stern depending on streak)
  - Message example: “You’ve had enough today. Be strong, human.”
  - Button: “Return to Work”
  - Random rotating meme: panda, cat typing, “tap to escape” mini-game

- **Purpose:**
  Enforce limits while adding humor and motivation.

---

## Interaction Flows

### Flow 1: **First-Time Experience**
1. User clicks extension icon
2. Popup shows onboarding message: “Start browsing—FocusBear will track your focus.”
3. Permissions prompt (“Allow access to tabs?”)
4. Graph loads (empty state)
5. User visits distracting site → graph updates
   - **Alternative Path:** User denies permission → show retry prompt
   - **Error State:** Chrome API restricted → show fallback error

---

### Flow 2: **Setting a Daily Limit**
1. User opens popup
2. Clicks gear → Settings panel
3. Toggles “Limit Facebook” → enters number (15 visits)
4. Confirmation micro-animation
5. On visit #14 → toast warning
6. On visit #15 → Block page
   - **Alternative Path:** User disables limit during the day
   - **Error State:** Invalid number input → inline error

---

### Flow 3: **Exploring the Radial Graph**
1. User types “reddit” in search
2. Node highlights
3. User clicks node → zooms into subpages
4. User selects “Last 7 days” filter
5. Graph animates to updated state
   - **Alternative Path:** No matching node → display “No results”
   - **Error State:** Graph render timeout (rare) → fallback text list

---

### Flow 4: **Exporting Data (Future Release)**
1. User opens settings
2. Clicks “Export Graph”
3. Modal: “Save as PNG / CSV / JSON”
4. UI triggers export library
   - **Alternative Path:** Cancel export
   - **Error State:** Browser download fail → retry prompt

---

## Visual Design

### Color Scheme
- **Primary Colors:**
  - Bear Blue: `#0e75b6`
  - Calm White: `#ffffff`
  - Focus Purple: `#6c5ce7`

- **Secondary Colors:**
  - Alert Yellow: `#ffdd57`
  - Success Green: `#55efc4`
  - Warning Orange: `#ff9f43`

- **State Colors:**
  - Limit nearing: `#ff9f43`
  - Limit exceeded: `#d63031`

### Typography
- **Primary Font:** Inter (lightweight, readable)
- **Backup:** Roboto / system fonts
- **Sizes:**
  - H1: 20px
  - H2: 16px
  - Body: 13–14px

### Icons & Imagery
- Bear mascot: playful, friendly
- Graph nodes: soft-round shapes
- Icons: Material Icons / custom SVGs

### Design System Components
- Buttons (primary, secondary, ghost)
- Toasts
- Pills / Tags
- Graph nodes
- Toggle switches
- Input fields

---

## Accessibility

- **Compliance:** WCAG 2.1 AA
- **Requirements:**
  - Full keyboard navigation in popup
  - ARIA labels for graph elements
  - Minimum 4.5:1 contrast ratio
  - Reduced motion mode (OS preference detection)
  - Accessible block-page messaging

---

## Content Strategy

- **Tone:** Playful, empathetic, humorous
- **Voice:** Friendly bear companion
- **Key Messages:**
  - “Stay focused, human.”
  - “Your data never leaves your device.”
  - “You’re stronger than the scroll.”

- **Content Types:**
  - Microcopy (toasts, tooltips)
  - Error messages
  - Empty states (“No distractions detected—nice!”)
  - Block pages (humor + motivation)

---

## Responsive Design

- **Supported Devices:** Desktop only
- **Popup Fixed Size:** 400×600px
- **Block Page:** Responsive to browser window
- **Adaptations:**
  - Graph nodes reflow based on available space
  - Settings panel scrolls on smaller screens

---

## Testing and Validation

### Usability Testing Plan
- 5 rapid tests with real users
- Focus on:
  - Graph clarity
  - Limit-setting discoverability
  - Block-page delight

### A/B Tests
- Test block page variants (humor intensity)
- Test color for countdown bubble
- Test graph animation speed

### Tools
- Chrome DevTools Lighthouse
- Figma for prototypes
- User feedback via GitHub Issues

### Validation Metrics
- Time-to-first-insight (<5 seconds)
- Limit-setting completion rate (>80%)
- User comprehension (“What does this graph mean?”)

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Graph too complex | Confuses users | Provide simplified “List View” fallback |
| Block page annoyance | High uninstall rate | Add “Disable humor” toggle |
| Accessibility gaps | Excludes users | Conduct manual WCAG audits |
| Popup too dense | Cognitive load | Progressive disclosure controls |

---

## Appendix

### AI Research Insights

**Round 1 – Persona Validation (2025-11-14)**
- Chrome extension reviews show users strongly prefer *instant insight* and minimal onboarding.
- Productivity extension users dislike nagging; humor increases feature adoption.

**Round 2 – Competitor UI Analysis**
- RescueTime dashboards too dense → FocusBear’s graph must stay simple.
- StayFocusd’s block pages are effective but unfriendly → humor provides differentiation.

**Round 3 – Accessibility & Responsive Standards**
- WCAG best practices emphasize keyboard navigation for extensions.
- Many Chrome popup UIs fail contrast → FocusBear must exceed minimums.

**Round 4 – UX Risk Assessment**
- Graph visualizations often overwhelm novices → include onboarding tooltip.
- Users complain when settings are deeply nested → keep 1-click access.

**Round 5 – Holistic UX Review**
- UX aligns with PRD, Lean Canvas, and brand strategy.
- Touchpoints optimized for delight, speed, and privacy messaging.

---

### Glossary
- **Radial Graph:** A circular hierarchical visualization of browsing activity
- **Focus Visit:** Each user-initiated return to a distracting tab
- **Countdown Bubble:** Toast showing remaining daily visits
- **Block Page:** Humorous screen shown when daily limit exceeds