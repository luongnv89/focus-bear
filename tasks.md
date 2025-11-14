# tasks.md

Development plan for **FocusBear** as a **pure Chrome Extension (MV3, local-only)**, based on `prd.md`, `tad.md`, `ux_design.md`, and `brand_kit.md`.

Phases: **POC → MVP → Full Features & Polish**

---

## Phase 0: Proof of Concept (POC) – Core Focus Tracking

Goal: Prove the unique value metric — **focus-switch tracking per domain** — works reliably in MV3 and can be surfaced in a basic UI.

### Task 0.1 – Initialize Chrome Extension Project (MV3 Skeleton)

**Description**
Set up the base Chrome extension structure using Manifest V3 with a background service worker, popup, and basic file layout.

**Acceptance Criteria**
- `manifest.json` (MV3) exists with:
  - `background.service_worker`
  - `action` (browser action)
  - Required permissions: `tabs`, `storage`
- Basic folder structure:
  - `/src/background/`, `/src/popup/`, `/assets/`
- Extension can be loaded in Chrome as “Unpacked” without errors.

**Dependencies**
- None.

---

### Task 0.2 – Define Local Data Model for Focus Visits

**Description**
Design the minimal data schema for storing focus-switch events locally in `chrome.storage.local` as described in PRD.

**Acceptance Criteria**
- Data model defined (in code and docs) that includes:
  - Domain
  - URL or subpath
  - Timestamp
  - Count per domain per day
- JSON schema documented in comments or a `docs/data-model.md`.
- Storage read/write helpers implemented (get, set, merge counts).

**Dependencies**
- Task 0.1.

---

### Task 0.3 – Implement Focus-Switch Tracking (POC)

**Description**
Use `chrome.tabs.onActivated` and `chrome.tabs.onUpdated` to capture **user-initiated tab focus** events and store them using the defined model.

**Acceptance Criteria**
- Background service worker listens to:
  - `tabs.onActivated`
  - `tabs.onUpdated` (where relevant for focus)
- On each focus event:
  - Extract active tab’s domain and path.
  - Increment count for that domain for the current day.
  - Data persisted via `chrome.storage.local`.
- Console logging showing counts updating as user switches tabs.
- No blocking or noticeable slowdown when switching tabs.

**Dependencies**
- Task 0.2.

---

### Task 0.4 – Simple Popup UI for Domain Visit Counts (POC)

**Description**
Create a minimal popup that lists the top domains and their focus visit counts for “today” in a simple list, to verify tracking works end-to-end.

**Acceptance Criteria**
- Popup loads in < 300ms.
- UI displays:
  - Top N domains (e.g., 5–10).
  - Visit count per domain for current day.
- Refresh button or auto-refresh when popup is opened.
- No graph yet; simple text/list view.

**Dependencies**
- Task 0.3.

---

### Task 0.5 – Basic POC Testing & Bugfixing

**Description**
Test POC tracking and popup display, fix critical bugs, and ensure it aligns with PRD core behavior.

**Acceptance Criteria**
- Manual test scenarios:
  - Switch between 3–5 different domains; counts increase as expected.
  - Closing/reopening Chrome preserves counts for today.
  - No JavaScript runtime errors in background or popup.
- Known issues logged in a `POC_issues.md`.

**Dependencies**
- Tasks 0.3, 0.4.

---

## Sprint 1: MVP Core – “The Guilt Bear” (Core Functionality)

Goal: Deliver the **MVP** as defined in `prd.md`: core focus tracking, basic radial visualization (domains only), per-site limits, block page, settings, and privacy messaging.

### Task 1.1 – Finalize MVP Scope & Feature Flags

**Description**
Document the exact MVP feature set from `prd.md` and enable feature flags where helpful (e.g., for streaks/export which may come later).

**Acceptance Criteria**
- Written list of MVP features:
  - Focus visit tracking
  - Domain-level radial graph
  - Local storage
  - Time filters
  - Search
  - Per-site daily limits
  - Countdown bubble (basic)
  - Block page (humorous)
- Non-MVP features marked for later (subpage drilldown, export PNG, evolving bear, etc.).
- Optional feature flag mechanism (e.g., simple config object) implemented.

**Dependencies**
- Phase 0 completed.

---

### Task 1.2 – Implement Time-Bucketed Storage (Day / 24h / Week / Month)

**Description**
Extend the data model to support queries by time range as described in PRD and UX docs.

**Acceptance Criteria**
- Focus visits stored with date keys (e.g., `YYYY-MM-DD`) and optionally epoch timestamps.
- Helper functions:
  - `getVisitsForRange(range: "today" | "24h" | "week" | "month")`
- Unit tests or simple test harness confirming correct aggregation across days.

**Dependencies**
- Task 0.2, 0.3.

---

### Task 1.3 – Build Domain-Level Radial Graph in Popup (D3.js)

**Description**
Render an interactive radial graph visualizing the user node and domains as orbiting nodes with size based on visit counts.

**Acceptance Criteria**
- Graph implemented with D3.js in popup:
  - Center node labeled “You”.
  - Domains rendered as orbiting nodes sized by visit count.
- Hover on node shows:
  - Domain name
  - Current period visit count
- Performance:
  - Renders in under 1 second for up to 100 domain nodes.
- Empty state (“No data yet”) when no visits.

**Dependencies**
- Task 1.2, Task 0.4.

---

### Task 1.4 – Add Time Range Filter Controls in Popup

**Description**
Implement dropdown or segmented control for selecting time range: Last hour, Today (24h), Week, Month.

**Acceptance Criteria**
- UI element (dropdown or buttons) in popup: `Last hour`, `Today`, `Week`, `Month`.
- Changing selection:
  - Re-queries data via helper functions.
  - Updates radial graph and/or list view.
- Default selection: `Today`.
- Selection persisted in `chrome.storage.local` or in-memory during popup session.

**Dependencies**
- Task 1.2, 1.3.

---

### Task 1.5 – Domain Search & Highlight in Graph

**Description**
Implement a search bar to find and highlight a domain node in the radial graph.

**Acceptance Criteria**
- Input field labeled “Search sites…” in popup.
- As user types:
  - Fuzzy match domains.
  - Highlight matching node(s) (e.g., larger stroke, color).
- If no match:
  - Show “No matching site” message.
- Works across current time filter.

**Dependencies**
- Task 1.3.

---

### Task 1.6 – Settings Panel UI (Popup → Settings View)

**Description**
Create a settings panel accessible via a gear icon as per UX design. This panel will house per-site limit settings and basic options.

**Acceptance Criteria**
- Gear icon in popup header navigates to settings view (within popup).
- Settings sections:
  - Per-site limits management.
  - Data management (reset all data).
  - Appearance (high contrast toggle placeholder).
  - Privacy blurb (“Data never leaves your device.”).
- Back navigation to main graph view.

**Dependencies**
- Task 1.3, brand guidelines from `brand_kit.md`.

---

### Task 1.7 – Per-Site Daily Limit Configuration

**Description**
Allow the user to set per-site daily focus visit limits from the Settings panel.

**Acceptance Criteria**
- In settings:
  - List of top N domains with input fields or sliders for “Max visits/day”.
  - Ability to add a custom domain by typing its name/URL.
- Limits stored in `chrome.storage.local`.
- Default behavior:
  - Sites with no limit are “unlimited”.
- Basic validation (e.g., positive integer, max reasonable number).

**Dependencies**
- Task 1.6, Task 1.2 (for domain list).

---

### Task 1.8 – Enforce Limits via Block Page (Blocked.html + webRequest)

**Description**
Implement the over-limit behavior that redirects the user to the **local block page** once they exceed the per-site limit for the day.

**Acceptance Criteria**
- `blocked.html` page created with:
  - Bear illustration or placeholder.
  - Message indicating limit reached.
  - CTA “Back to work” (closes tab or redirects to about:blank / configurable URL).
- Background/service worker:
  - Uses `webRequest.onBeforeRequest` with `blocking` permission to intercept navigation to limited domains.
  - Checks stored counts + limit per domain.
  - If over limit, cancel navigation and redirect to `blocked.html`.
- Works for:
  - Normal browsing (not incognito by default).
- Respect local-only design (no external calls).

**Dependencies**
- Task 1.7, Manifest permissions update (webRequest, host permissions).

---

### Task 1.9 – Basic Countdown Bubble (Toast Notification)

**Description**
Show a small toast near the top of the page/browser UI indicating remaining visits for a limited site.

**Acceptance Criteria**
- On each visit to a limited domain:
  - Show toast: “[Domain]: X visits left today.”
- Toast auto-hides after ~3 seconds.
- Toast styling aligned with `brand_kit.md` colors and typography.
- Implemented either via:
  - `chrome.notifications` API, or
  - Injected content script rendering the toast.
- Does not produce sound or block interactions.

**Dependencies**
- Task 1.7, content script setup if used.

---

### Task 1.10 – MVP Accessibility & Performance Pass

**Description**
Implement basic WCAG 2.1 AA checklist items and verify popup performance targets in PRD.

**Acceptance Criteria**
- Keyboard navigation:
  - All interactive elements in popup can be focused via Tab/Shift+Tab.
- ARIA:
  - Key elements (graph region, settings, toasts) have ARIA roles/labels.
- Contrast:
  - Text vs background meets AA using brand palette.
- Performance:
  - Popup initial render <300ms under typical usage.
  - Graph render <1s for 100 nodes.

**Dependencies**
- Tasks 1.3–1.9.

---

## Sprint 2: Visualization, UX Polish & Delight

Goal: Improve the **visual experience** and align more deeply with UX + Brand Kit: better onboarding, more playful block page, initial streaks, and high-contrast mode.

### Task 2.1 – Onboarding & Empty State UX

**Description**
Design and implement the first-time experience inside the popup, including permission prompts and education.

**Acceptance Criteria**
- When no data:
  - Show an illustration or mascot.
  - Message like “Start browsing—FocusBear will track your attention.”
- If tabs permission missing:
  - Clear explanation + button to open Chrome permissions dialog.
- Onboarding appears only until first data is recorded, then replaced by regular graph.

**Dependencies**
- Task 1.3, 1.8.

---

### Task 2.2 – Improve Block Page Visual & Copy (Brand Kit Alignment)

**Description**
Upgrade `blocked.html` to match brand guidelines and bear persona from `brand_kit.md`.

**Acceptance Criteria**
- Block page uses:
  - Bear Blue and Focus Purple.
  - Inter font.
  - Bear mascot illustration (placeholder or simple SVG).
- Tone: playful, not shaming.
- Layout responsive and keyboard navigable.
- Variation support (e.g., rotate messages) prepared for future “random meme” enhancements.

**Dependencies**
- Task 1.8, brand kit.

---

### Task 2.3 – Streaks & Averages (Basic Implementation)

**Description**
Compute and display streaks and average daily visits for top domains, as per PRD.

**Acceptance Criteria**
- For each domain:
  - 7-day rolling average visits/day computed.
  - “Streak” defined as consecutive days under limit OR with non-zero visits (specify in code comments).
- Display:
  - In domain detail section (or popup side panel).
- Computations are efficient and do not noticeably slow the popup.

**Dependencies**
- Task 1.2, 1.7.

---

### Task 2.4 – High Contrast Mode Toggle

**Description**
Add a “High contrast mode” toggle in settings and update popup/block page styling accordingly.

**Acceptance Criteria**
- Toggle in Settings.
- When enabled:
  - Backgrounds and text colors shift to higher-contrast combinations using neutral palette.
  - Radial graph nodes use accessible color sets.
- Preference stored locally and applied on popup load & block page load.

**Dependencies**
- Task 1.6, 1.10, brand kit.

---

### Task 2.5 – Graph Interaction Enhancements (Zoom & Hover Details)

**Description**
Improve radial graph usability with better hover tooltips and optional zoom/focus on a single domain.

**Acceptance Criteria**
- Hover tooltip with:
  - Domain
  - Visit count (current range)
  - Optionally last visit time.
- Click on domain:
  - Focuses/centers it or increases node size, dimming others.
- No significant performance regression.

**Dependencies**
- Task 1.3, 1.4.

---

### Task 2.6 – UX Copy, Microcopy & Localization Hooks

**Description**
Align all messages (toasts, errors, onboarding, block page) with brand voice and prepare for future localization.

**Acceptance Criteria**
- All user-facing text extracted into a `copy` module / JSON structure.
- Tone matches UX + Brand kit:
  - Friendly, clever, non-judgmental.
- Simple structure for future language keys (e.g., `en`, `fr`) without full i18n engine yet.

**Dependencies**
- Tasks 1.9, 2.1, 2.2.

---

### Task 2.7 – Automated Build & Linting Setup

**Description**
Set up tooling to keep code quality high and builds reproducible.

**Acceptance Criteria**
- ESLint (or equivalent) configured.
- Basic TypeScript support (optional but recommended) or JSDoc types.
- Build script for bundling/minifying JS/CSS for the extension.
- `npm run build` produces an artifact suitable for Chrome Web Store upload.

**Dependencies**
- Task 0.1.

---

## Sprint 3: Advanced Features & Export

Goal: Add advanced insights and sharing features from PRD (subpath drilldown, export PNG), plus testing & QA.

### Task 3.1 – Subpath Drilldown for Radial Graph

**Description**
Extend radial graph to show subpages (subpaths) orbiting around domain nodes.

**Acceptance Criteria**
- For a selected domain:
  - Second ring of nodes for top subpaths (e.g., `/r/programming`, `/feed`).
- Tooltip includes:
  - Subpath
  - Count
  - Last visit time (from stored timestamps).
- Toggle to go back to domain-only view.

**Dependencies**
- Task 1.3, 2.5, data model containing URL paths (ensure from Task 0.3/1.2).

---

### Task 3.2 – Export Graph View as PNG

**Description**
Allow users to export the current radial graph view as PNG for sharing.

**Acceptance Criteria**
- Button (“Export as PNG”) in popup.
- Clicking exports the current graph view (current time filter and focus state) to a PNG file.
- Implemented via html2canvas or D3 export approach.
- Works in Chrome with minimal visual artifacts.

**Dependencies**
- Task 1.3, 3.1.

---

### Task 3.3 – Data Export (JSON / CSV)

**Description**
Enable export of underlying visit data for power users.

**Acceptance Criteria**
- In Settings → “Export Data” section:
  - Export JSON.
  - Export CSV (e.g., domain, path, date, count).
- Files downloaded via Chrome download API.
- Clear privacy message: “This file stays on your device unless you share it.”

**Dependencies**
- Task 1.2.

---

### Task 3.4 – “Focus Hero” Badge & Gamification Hooks

**Description**
Add a minimal gamification layer consistent with PRD and Brand Kit (e.g., “Focus Hero” badge for streaks).

**Acceptance Criteria**
- Simple badge system:
  - Example: 3 days under limit on a site → “Focus Hero” for that site.
- Visual indication in popup (small badge icon).
- Optional simple celebration animation (within performance limits).

**Dependencies**
- Task 2.3.

---

### Task 3.5 – Automated Tests (Unit + Integration Smoke)

**Description**
Set up basic test harness and write core tests for logic (not UI-heavy).

**Acceptance Criteria**
- Test framework (Jest or similar) configured.
- Tests for:
  - Focus tracking & aggregation.
  - Per-site limit logic.
  - Streak computation.
- CI workflow (optional) to run tests on push/PR.

**Dependencies**
- Tasks 1.2, 1.7, 2.3.

---

### Task 3.6 – Performance & Memory Profiling

**Description**
Profile the extension to ensure it meets performance targets and does not leak memory.

**Acceptance Criteria**
- Use Chrome DevTools:
  - Measure CPU usage of service worker under typical browsing.
  - Ensure no runaway listeners.
- For large browsing histories (many domains, days):
  - Popup remains responsive.
- Document findings and any optimizations applied.

**Dependencies**
- Tasks 1.3, 3.1.

---

## Sprint 4: Release Readiness & Chrome Web Store Launch

Goal: Final polishing, documentation, store assets, and submission.

### Task 4.1 – Chrome Web Store Listing Assets

**Description**
Create listing content and visuals aligned with Brand Kit and UX.

**Acceptance Criteria**
- Extension name, short and long description drafted.
- Icon set (16, 48, 128) created using bear mascot and brand colors.
- Screenshots:
  - Popup main graph.
  - Settings.
  - Block page.
- Promo images (if required by store).

**Dependencies**
- Brand kit, main UI complete (Sprint 2–3).

---

### Task 4.2 – Privacy & Permissions Review

**Description**
Ensure extension’s requested permissions and behavior match “local-only” promise and store policies.

**Acceptance Criteria**
- Permissions in `manifest.json`:
  - Only necessary ones (tabs, storage, webRequest, host permissions, notifications).
- Clear privacy policy drafted (even if “no data collected”).
- In-product privacy message matches Chrome Web Store privacy section.

**Dependencies**
- Task 1.8, 1.9.

---

### Task 4.3 – Accessibility Audit & Fixes

**Description**
Run a focused accessibility audit and fix remaining issues.

**Acceptance Criteria**
- Manual keyboard walkthrough of popup and block page.
- Ensure all images/icons with meaning have alt text or ARIA labels.
- Run an automated tool (e.g., Axe via DevTools) on popup and block page.
- Fix all critical AA failures.

**Dependencies**
- Task 1.10, 2.4, 2.6.

---

### Task 4.4 – Final QA Regression & Smoke Tests

**Description**
Perform a full test pass across major flows and typical configurations.

**Acceptance Criteria**
- Test scenarios:
  - Install/uninstall extension.
  - First-time onboarding.
  - Tracking across multiple domains.
  - Setting & hitting limits.
  - Block page behavior.
  - High contrast mode.
  - Export PNG/JSON.
- All blocking bugs resolved or documented with clear severity & workaround.

**Dependencies**
- All feature tasks up to Sprint 3.

---

### Task 4.5 – Prepare & Submit to Chrome Web Store

**Description**
Bundle the extension, upload to the Chrome Web Store, fill out forms, and submit for review.

**Acceptance Criteria**
- Build zipped and passes local load test.
- Store listing form completed:
  - Descriptions
  - Screenshots
  - Icons
  - Privacy info
- Submission completed and tracking ID documented.

**Dependencies**
- Task 4.1, 4.2, 4.4.

---

## Ambiguous Requirements / Clarifications Needed

These items surfaced from `prd.md`, `ux_design.md`, and `brand_kit.md` and may require product decisions before implementation:

1. **Definition of “Streak”**
   - Under-limit streak vs “any visit” streak for each domain.
   - Recommendation: Choose one and document (ideally “days staying under the limit”).

2. **Incognito Support**
   - Should FocusBear work in incognito windows?
   - Chrome requires explicit opt-in. If yes, tasks needed to handle separate data or explicitly *not* track incognito.

3. **Default Site Presets**
   - PRD mentions presets like Facebook/Twitter/Reddit/LinkedIn.
   - Clarify:
     - Exact default list.
     - Default limits (if any) or just suggestions.

4. **Block Page “Games/Memes”**
   - PRD suggests random memes / mini-games.
   - MVP likely uses static playful messaging; advanced interactivity can be deferred.

5. **History Retention Limits**
   - How long should data be stored locally?
     - 30 days? 90 days?
   - Important for storage size and performance.

6. **Localization Priorities**
   - UX & Brand Kit support future i18n.
   - Clarify initial languages (e.g., EN only for now, FR later).

7. **Telemetry / Usage Analytics**
   - PRD strongly emphasizes local-only and no tracking.
   - Confirm:
     - No remote analytics at all?
     - If some metrics are desired (e.g., install counts beyond store), specify constraints.

Once these are answered, they can be translated into additional micro-tasks or adjustments in the above sprints.