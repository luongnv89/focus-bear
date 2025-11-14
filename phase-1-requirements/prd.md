# Product Requirements Document: FocusBear

## Product Overview

**Product Vision**
FocusBear is a playful, privacy-first Chrome extension that helps users *see, understand, and regulate* their attention on distracting websites. It tracks every “focus switch” (return to a tab), visualizes attention patterns through an interactive radial graph, and gently nudges users with limits, streaks, and humorous block pages—turning awareness into sustainable digital discipline.

**Target Users**
- Knowledge workers, students, freelancers, productivity enthusiasts
- Users seeking behavioral awareness without losing privacy
- People who prefer lighthearted, fun habit tools

**Business Objectives**
- Help users reclaim focus through zero-tracking, local-only design
- Build a memorable, shareable product with viral potential
- Establish FocusBear as the leading “fun guilt + visualization” attention tool

**Success Metrics**
- **Acquisition:** 10k installs within 3 months
- **Engagement:** ≥ 60% DAU/MAU
- **Retention:** ≥ 40% 30-day retention
- **Behavior Change:** 25% average reduction in return-visits to top distracting sites
- **Delight Score:** ≥ 4.5/5 average extension rating

---

## User Personas

### Persona 1: Alex — The Distracted Freelancer
- **Demographics:** 28, freelance designer, intermediate tech, remote worker
- **Goals:** Stay focused, avoid social media spirals
- **Pain Points:** “I open Facebook ‘just for 2 min’—then it’s suddenly 1 hour.”
- **User Journey:** Installs → sees 27 Facebook visits → sets 15 limit → hits 16 → funny block page → returns to work

### Persona 2: Sam — The Procrastinating Student
- **Demographics:** 21, CS major, high tech proficiency
- **Goals:** Study effectively, avoid Twitter/Reddit loops
- **Pain Points:** “I refresh Twitter constantly.”
- **User Journey:** Sees streak of 40+ daily Twitter visits → sets 10 limit → countdown bubbles help → earns “Focus Hero” badge

### Persona 3: Taylor — The Data-Driven Self-Tracker
- **Demographics:** 35, product manager, privacy-first, data lover
- **Goals:** Understand attention patterns, track productivity habits
- **Pain Points:** “I want insights without giving away my data.”
- **User Journey:** Explores radial map → drills down to `/r/all` → exports PNG → shares with team

---

## Feature Requirements

| Feature | Description | User Stories | Priority | Acceptance Criteria | Dependencies |
|--------|-------------|--------------|----------|---------------------|--------------|
| **Focus Visit Tracking** | Count each user-initiated return to a tab per domain/subpath | As Alex, I want every Facebook return counted | **Must** | Uses tabs APIs; stores (domain, subpath, timestamp); no double counting | Chrome Tabs API |
| **Radial Graph Visualization** | D3.js interactive domain → subpage map | As Taylor, I want a beautiful attention map | **Must** | Center node=User; domain nodes sized by frequency; zoom; hover metadata | D3.js v7 |
| **Local Data Storage** | All data stored locally, exportable | As Sam, I want zero privacy risk | **Must** | Uses chrome.storage.local; no network calls; JSON/CSV export | Chrome Storage API |
| **Time Range Filters** | Filter by hour/day/week/month | As Taylor, I want comparisons | **Must** | Instant updates; maintains zoom | None |
| **Search Bar** | Typeahead search for domains/subpaths | As Alex, I want to find Twitter quickly | **Should** | Fuzzy search; highlights matches | None |
| **Daily Visit Limits** | Per-site visit caps | As Sam, I want to cap Reddit | **Must** | Per-site toggle; presets; unlimited default | None |
| **Countdown Bubbles** | Toast notifications showing remaining visits | As Alex, I want gentle nudges | **Should** | Silent toast near tab bar; fades after 3s | Notifications API |
| **Over-Limit Redirect** | Block page when limit exceeded | As Sam, I want fun blocks | **Must** | webRequest blocking; redirect to local blocked.html with random memes | webRequest API |
| **Streaks & Averages** | 7-day rolling stats | As Taylor, I want habit tracking | **Should** | Streak counter & averages in detail view | None |
| **Export Graph** | Save PNG of radial map | As Taylor, I want to share insights | **Could** | Button saves view to PNG | html2canvas |
| **Settings Panel** | Manage limits, reset data, preferences | As Alex, I want easy configuration | **Must** | Gear menu → toggles → reset confirmation | None |

---

## User Flows

### 1. First-Time User Experience (FTUE)
1. User clicks extension icon
2. Popup shows onboarding: “Start browsing—FocusBear will track your attention.”
3. Visits Facebook → node appears
4. Switches away then back → count increments
5. Graph updates in real-time

**Error State:** Missing permissions → prompts to grant tab access

### 2. Setting a Daily Limit
1. Open popup → gear icon → settings
2. Enable Facebook limit: 15/day
3. Node shows “15 max”
4. At 14 visits → bubble: “1 visit left”
5. At 15 → redirect to block page

**Alternative:** User disables limit mid-day

### 3. Exploring Browsing Data
1. User searches for “reddit”
2. Selects domain → zoom into subpaths
3. Hover shows metadata
4. “Last 24h” filter re-renders graph dynamically

---

## Non-Functional Requirements

### Performance
- Popup load: < 300ms
- Graph render: < 1s for 100 nodes
- Instant update on tab switch

### Security
- No authentication needed
- No external servers
- All data deletable by user

### Compatibility
- Desktop only (Chrome 100+)
- Popup optimized for ~400×600

### Accessibility (WCAG 2.1 AA)
- Keyboard navigation
- ARIA labels
- Color-safe palette
- High-contrast option

---

## Technical Specifications

### Frontend
- Vanilla JS, D3.js v7, CSS3, HTML5
- Bear-themed playful UI
- Popup fixed layout; internal graph responsive

### Backend
- 100% client-side
- Chrome APIs: tabs, storage, webRequest, notifications
- Storage: chrome.storage.local (key-value schema)

### Infrastructure
- Chrome Web Store distribution
- GitHub Actions for lint/build/zip
- Manual store upload

```mermaid
graph TD
    A[Manifest V3] --> B[Service Worker]
    A --> C[Popup UI - D3 Graph]
    A --> D[Optional Content Script]

    B --> E[tabs.onActivated]
    B --> F[tabs.onUpdated]
    B --> G[storage.local]
    B --> H[webRequest.onBeforeRequest]

    C --> G
    H --> I[blocked.html]


⸻

Analytics & Monitoring (Local Only)

Key Metrics (shown to user only):
	•	Daily focus visits
	•	Limit usage
	•	Limit breaches
	•	Graph interactions

Local Events:
	•	focus_visit_recorded
	•	limit_set
	•	limit_breached
	•	graph_drilldown

Dashboard:
	•	In-extension statistics page

⸻

Release Planning

MVP (v1.0) — “The Guilt Bear”

Contains:
	•	Focus visit tracking
	•	Domain-level graph
	•	Filters
	•	Local storage
	•	Search
	•	Daily limits
	•	Countdown bubbles
	•	Block page

Timeline: 4 weeks
Success Criteria:
	•	100 installs
	•	1 GitHub star
	•	1 viral tweet/post demonstrating delight

Future Releases
	•	v1.1: Subpages, streaks, averages
	•	v1.2: PNG export, dark/high-contrast mode
	•	v2.0: Focus Mode, mini-games, evolving bear avatar

⸻

Open Questions & Assumptions

Open Questions
	1.	Add time-spent tracking?
	2.	Sync across devices while remaining private?

Assumptions
	•	Focus-switch metric drives stronger behavior change
	•	Accidental switches are acceptable edge cases
	•	Humor > shame for motivation
	•	Local-only is a core brand differentiator

⸻

Appendix

Competitive Analysis

Competitor	Strengths	Weaknesses	FocusBear Advantage
Webtime Tracker	Time tracking	No return-visit logic	Focus-switch insights
Website Visit Counter	Simple	Counts loads only	Rich visualization
RescueTime	Detailed analytics	Cloud-based, privacy concern	Local-only
Freedom / StayFocusd	Strong blocking	No insights	Combination of insights + humor


⸻

User Research Findings
	•	87% prefer local-only behavior tracking
	•	Humor motivates better than shame
“I’d use it if it roasted me.” — User Test Quote

⸻

AI Research Insights

Round 1 — Market/User Needs
	•	Time trackers dominate, but no return-visit tools
	•	High interest in privacy-preserving productivity tools

Round 2 — Prioritization/Competitive Review
	•	Focus-switch tracking = clear differentiation
	•	D3 radial visualization rare → high delight

Round 3 — Feasibility
	•	Manifest V3 supports all needed APIs
	•	D3 graph performant <100 nodes

Round 4 — Edge Cases
	•	50 open tabs → cap to 100 nodes + “+X more” cluster
	•	Incognito mode untracked
	•	Uninstall clears all data

AI-Suggested Improvements
	•	“Focus Hero” badge for streaks
	•	Daily rotating block-page themes
	•	Evolving bear as user progresses

⸻

Glossary
	•	Focus Visit: User return to a tab
	•	Subpath: URL path after domain
	•	Streak: Consecutive days staying under limits or engaging with data
