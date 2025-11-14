# Brand Kit: FocusBear

## Brand Overview

**Brand Mission:**
Help people reclaim their focus from digital distractions with a playful, privacy-first companion that makes self-awareness fun instead of shameful.

**Brand Personality:**
- Playful
- Honest
- Supportive
- Clever
- Minimalist

**Target Audience:**
Knowledge workers, students, freelancers, and productivity enthusiasts who struggle with social media distractions, care about their privacy, and enjoy tools that feel light-hearted rather than clinical.

**Brand Positioning:**
FocusBear is the **fun, local-only focus tracker** that turns your tab-switching habits into a visual, humorous experience. Unlike heavy, cloud-based productivity tools, FocusBear requires no account, stores everything on-device, and uses humor (not guilt) to nudge you into better habits.

---

## Color Palette

### Primary Colors

**Primary Color – Bear Blue**
- **Hex:** `#0E75B6`
- **RGB:** `rgb(14, 117, 182)`
- **HSL:** `hsl(203, 86%, 38%)`
- **Usage:** Primary buttons, key CTAs, headers, active graph nodes, focus rings
- **Rationale:**
  - Blue is widely associated with trust, calm, and focus.
  - The slightly saturated tone feels energetic but not aggressive.
  - Differentiates from typical productivity apps that lean into very dark blues or harsh neons.

**Primary Variants**
- **Primary Lighter:** `#E0F2FF` – Very subtle backgrounds, info highlights, empty states
- **Primary Light:** `#4FA6DF` – Hover states for buttons and graph hover states
- **Primary Dark:** `#0A5584` – Pressed states, emphasis outlines, high-contrast headers

---

### Secondary Colors

**Secondary Color – Focus Purple**
- **Hex:** `#6C5CE7`
- **RGB:** `rgb(108, 92, 231)`
- **HSL:** `hsl(247, 74%, 63%)`
- **Usage:** Secondary actions, highlights in graphs, badges (e.g., “Focus Hero”), accent elements on landing pages
- **Rationale:**
  - Purple conveys creativity and “magic” – a good fit for an app that transforms messy habits into clear insights.
  - Pairs well with Bear Blue for a memorable, modern palette.

**Secondary Variants**
- **Secondary Light:** `#A29BFF` – Badges, subtle accents
- **Secondary Dark:** `#4B3AC9` – Secondary button hover state, emphasis labels

---

### Neutral Palette

- **Black:** `#050816` – High-emphasis text on very light backgrounds
- **Gray 900:** `#111827` – Primary text, titles in the extension and site
- **Gray 700:** `#4B5563` – Body text, labels, supporting copy
- **Gray 500:** `#9CA3AF` – Secondary text, placeholders, metadata
- **Gray 300:** `#D1D5DB` – Borders, dividers, input outlines
- **Gray 100:** `#F3F4F6` – Subtle backgrounds, cards, panels
- **White:** `#FFFFFF` – Primary background for cards, popup, and landing pages

---

### Semantic Colors

- **Success – Calm Green**
  - Hex: `#55EFC4`
  - RGB: `rgb(85, 239, 196)`
  - Usage: Success toasts, streak achievements, “limit set” confirmations

- **Error – Alert Red**
  - Hex: `#D63031`
  - RGB: `rgb(214, 48, 49)`
  - Usage: Fatal errors, destructive actions (reset data), error banners

- **Warning – Focus Orange**
  - Hex: `#FF9F43`
  - RGB: `rgb(255, 159, 67)`
  - Usage: “Visits remaining” warnings, soft alerts before hitting limits

- **Info – Sunshine Yellow**
  - Hex: `#FFDD57`
  - RGB: `rgb(255, 221, 87)`
  - Usage: Informational messages, onboarding callouts, tooltips

> Note: Info is intentionally warm (yellow) to feel friendly and less “corporate security warning”.

---

### Accessibility Guidelines

- **Text on Primary (`#0E75B6`):**
  - Use white text (`#FFFFFF`) for buttons and high-emphasis labels.
  - This pairing meets WCAG 2.1 AA contrast for normal text.

- **Text on Secondary (`#6C5CE7`):**
  - Use white text (`#FFFFFF`) for buttons and badges.

- **Text on Light Backgrounds (`#FFFFFF` / `#F3F4F6`):**
  - Use Gray 900 (`#111827`) for primary text.
  - Use Gray 700 (`#4B5563`) for secondary text.

- **Text on Dark Backgrounds (e.g., block page or hero sections):**
  - Use White (`#FFFFFF`) for primary text.
  - Use Gray 100 (`#F3F4F6`) for secondary text.

- **Contrast Ratios:**
  - Primary text vs. backgrounds must maintain at least **4.5:1** for normal text and **3:1** for large text.
  - Buttons and CTAs must meet **3:1** contrast between text and button background.
  - Ensure graph node colors always have sufficient contrast with labels or provide hover tooltips with high-contrast text.

---

## Typography

### Font Families

**Primary Font (Headings & UI)**
- **Font Name:** Inter
- **Fallback:** system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Source:** Google Fonts / System
- **Weights Used:** 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)

**Secondary Font (Body Text)**
- **Font Name:** Inter (same as primary, to keep dev simple and performance-friendly)
- **Fallback:** same as above
- **Weights Used:** 400 (Regular), 500 (Medium)

**Monospace Font (Code / Technical snippets on site)**
- **Font Name:** JetBrains Mono or Fira Code
- **Fallback:** "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
- **Usage:** Code examples in documentation, developer-focused sections on landing pages

---

### Typography Scale

| Element        | Font  | Size        | Weight | Line Height | Letter Spacing |
|----------------|-------|------------|--------|-------------|----------------|
| **H1**         | Inter | 32px (2rem) | 700    | 1.2         | -0.02em        |
| **H2**         | Inter | 24px (1.5rem) | 600  | 1.25        | -0.01em        |
| **H3**         | Inter | 20px (1.25rem) | 600 | 1.3         | 0              |
| **H4**         | Inter | 18px (1.125rem) | 500 | 1.4         | 0              |
| **H5**         | Inter | 16px (1rem) | 500    | 1.4         | 0              |
| **Body Large** | Inter | 16px (1rem) | 400    | 1.6         | 0              |
| **Body**       | Inter | 14px (0.875rem) | 400 | 1.6         | 0              |
| **Body Small** | Inter | 12px (0.75rem) | 400 | 1.5         | 0              |
| **Caption**    | Inter | 11px        | 400    | 1.4         | 0              |

> In the Chrome popup, default body size is 13–14px for clarity in compact layouts.

---

### Typography Guidelines

- Use **H1/H2 sparingly** in the popup; most headings will be H3/H4 for spatial economy.
- Maintain **line length of 40–60 characters** in the popup and 50–75 on landing pages.
- Use **weight and color, not just size**, to express hierarchy (e.g., H4 bold vs. Body regular).
- On mobile/very small layouts (landing page), reduce H1 to 24–28px.

---

## Logo Guidelines

### Logo Variations

- **Primary Logo:**
  - Wordmark “FocusBear” with a simple bear head icon to the left.
  - Colors: Bear Blue (`#0E75B6`) for icon, Gray 900 (`#111827`) for wordmark.

- **Secondary Logo:**
  - Horizontal lockup with bear icon + wordmark in single color (White or Gray 900) for small headers or narrow spaces.

- **Icon / Symbol:**
  - Simplified bear head in a circle using Bear Blue background and White icon.
  - Used for Chrome extension icon, favicon, avatars.

### Logo Usage

- **Clear Space:**
  - Minimum clear space = height of the bear icon on all sides.
- **Minimum Size:**
  - Digital: 24px height for icon-only, 32px height for logo + wordmark.

- **Color Variations:**
  - Full-color logo on white / light backgrounds.
  - White logo on Bear Blue or dark backgrounds.
  - Do not use gradients in the logo.

### Logo Don’ts

- Do not stretch, squish, or rotate the logo.
- Do not change logo colors outside the defined palette.
- Do not apply outlines, drop shadows, or glows.
- Do not place logo on low-contrast or overly busy backgrounds.
- Do not pair logo with off-brand typefaces.

---

## Iconography

**Icon Style:**
- Rounded, outlined icons with a 2px stroke, gentle corners.
- Minimal detail, easy to parse at small sizes (16px).

**Icon Set:**
- Base: Lucide, Heroicons, or similar open-source outline icon set.
- Customized bear-related icons can be drawn in the same style.

**Icon Sizes:**
- **Small (16px):** Inline with text (labels, tags)
- **Medium (20–24px):** Buttons, navigation, settings icon
- **Large (32px):** Empty states, feature highlights
- **XL (48px+):** Hero illustrations, block page bear icon

**Icon Guidelines:**

- Use icons to **support text, not replace it**.
- Always provide text or tooltips for critical actions.
- Maintain consistent stroke width and corner radius.
- Ensure all icon buttons have `aria-label` or visible text for accessibility.

---

## Imagery Style

### Photography Style (for landing & marketing)

- **Look & Feel:** Bright, clean, modern work/study environments.
- Natural lighting, real people, authentic setups (laptops, home offices, campuses).
- Focus on **individuals working and smiling**, showing relief from distraction.

- **Color Treatment:**
  - Slightly warm tones, moderate saturation.
  - Avoid overly stylized filters that clash with the brand palette.

### Illustration Style (for product & marketing)

- Soft, round shapes mirroring the bear icon.
- Minimalist, flat or semi-flat style with subtle shadows.
- Use brand colors as primary fills; avoid introducing a large new palette.
- Illustrations of bears doing human tasks: working at a desk, blocking distractions, celebrating streaks.

### Image Guidelines

- Use WebP or optimized PNG/JPEG for performance.
- Avoid generic stock imagery that feels staged or cliché.
- Strive for diversity and inclusivity in human subjects.
- For the block page, prioritize **funny but kind** memes and illustrations (no shaming).

---

## Spacing & Layout

### Spacing System (8px base)

- 4px – Tight / micro spacing
- 8px – Small spacing between related elements
- 16px – Default spacing between sections
- 24px – Space around cards or components
- 32px – Large gaps between major layout groups
- 48–64px – Section spacing on landing pages

### Grid System (for website / docs)

- **Max Width:** 1200–1280px centered container
- **Columns:** 12-column grid
- **Gutter:** 24px
- **Breakpoints:**
  - Mobile: 0–640px
  - Tablet: 641–1024px
  - Desktop: 1025px+

### Layout Principles

- Popup UI: Simple, single-column layout with stacked sections (search, filters, graph, legend).
- Landing page:
  - Hero with left-aligned text and right-aligned illustration.
  - Below: benefit sections in 2–3 column layouts.
- Use whitespace aggressively to avoid feeling cramped in the popup.

---

## Component Styles

### Buttons

**Primary Button**
- Background: `#0E75B6` (Bear Blue)
- Text: `#FFFFFF`
- Border Radius: 9999px or 8px (pill-like)
- Padding: 10px 20px
- Font: Inter, 14px, 500
- Hover: `#0A5584`
- Active: Slight scale-down + darker shade
- Disabled: Background `#D1D5DB`, text `#9CA3AF`

**Secondary Button**
- Background: Transparent
- Border: 1px solid `#0E75B6`
- Text: `#0E75B6`
- Hover: Light background `#E0F2FF`
- Active: Border `#0A5584`

**Text Button**
- Background: Transparent
- Text: `#0E75B6`
- Hover: Underline or slight color change
- Used for lightweight actions like “Learn more”.

---

### Input Fields

- Background: `#FFFFFF`
- Border: 1px solid `#D1D5DB` (Gray 300)
- Border Radius: 6px
- Padding: 8px 12px
- Placeholder: `#9CA3AF` (Gray 500)
- Focus: Border `#0E75B6`, outer focus ring with slight glow

**Error State:**
- Border: `#D63031`
- Helper text in Error red, small caption text.

---

### Cards

- Background: `#FFFFFF`
- Border: 1px solid `#E5E7EB` (very light gray) or subtle shadow
- Radius: 12px
- Shadow: `0 2px 10px rgba(15, 23, 42, 0.10)`
- Padding: 16–24px

Cards are used for:
- Settings blocks
- Landing page feature highlights
- “Today’s Focus Summary” summaries.

---

### Modals / Dialogs

- Background: `#FFFFFF`
- Overlay: `rgba(15, 23, 42, 0.5)`
- Radius: 16px
- Max Width: 480–600px
- Padding: 24–32px
- Close Icon: top-right, 24px hit area.

---

## Brand Voice

**Tone:**
- Friendly, clever, and slightly teasing—but never mean.
- Calm and reassuring about privacy: “We’re on your side.”
- Encouraging rather than authoritarian.

**Writing Style:**

- Use **second person** (“you”) and active voice.
- Short, punchy sentences.
- Simple language; no jargon in user-facing copy.
- Use humor in low-risk areas (block page, toasts), be neutral in critical UX (errors, permissions).

### Example Phrases

- **Success Message:**
  - “Nice! Your limit is set.”
  - “Focus streak upgraded. Keep going.”

- **Warning / Soft Nudge:**
  - “You’re close to today’s limit. Future you will be proud if you stop now.”

- **Error Message:**
  - “Hmm, something broke. Try again—FocusBear is still on your side.”

- **Empty State:**
  - “No distractions tracked… yet. Either you’re a focus ninja or it’s early in the day.”

- **Block Page Copy:**
  - “That’s enough scrolling for today. Your brain says ‘thank you’.”

---

## Usage Examples

### Example 1: Landing Page Hero Section

- **Background:** White or a subtle gradient from `#E0F2FF` to `#FFFFFF`.
- **Heading (H1):** “Tame your tabs with a friendly bear.” in Gray 900.
- **Subheading (Body Large):** “FocusBear tracks your tab hopping—locally—and nudges you back to deep work.”
- **Primary CTA:** “Add to Chrome” (primary button, Bear Blue).
- **Secondary CTA:** “View the graph demo” (secondary text button).
- **Illustration:** Bear sitting at a desk, radial graph behind them.

---

### Example 2: Extension Popup – Main State

- **Background:** White.
- **Header:**
  - Left: Bear icon + “FocusBear” in H4.
  - Right: gear icon (Settings).

- **Search Bar:** Standard input with placeholder “Search sites…”.

- **Filter Row:**
  - Dropdown (Today / 24h / Week / Month) styled as secondary button.

- **Graph:**
  - Central area with radial graph, nodes colored using primary and secondary palette.
  - Light Gray 100 background behind the graph.

- **Footer:** Small caption: “Data never leaves your browser.” in Gray 500.

---

### Example 3: Block Page

- **Background:** Light Primary (`#E0F2FF`).
- **Center Card:** White card with bear illustration.
- **Title (H2):** “You’ve hit your [Site] limit.”
- **Body:** “Let’s give your brain a break. Try again tomorrow or change your limit in FocusBear settings.”
- **Primary Button:** “Back to work” (Bear Blue).
- **Secondary Text:** Soft, playful line such as “We’ll be here if you need another nudge.”

---

## Appendix

### AI Research Insights

**Research Round 1 – Color Psychology & Industry Trends**
- Blues and purples dominate productivity and SaaS tools for trust + creativity.
- Many competitors use very sterile, corporate blues; FocusBear differentiates with a slightly more playful blue and warm supporting colors (orange and yellow).

**Research Round 2 – Typography**
- Inter is widely used in modern web apps; proven readable at small sizes and optimized for screen.
- Single-family usage (Inter for both headings and body) reduces complexity and improves performance—ideal for a solo founder.

**Research Round 3 – Brand Kits from Similar Products**
- Successful Chrome extensions use very compact type scales and strong contrast due to popup constraints.
- Playful mascots (e.g., owls, robots, bears) help make “productivity” feel less intimidating and more approachable.

**Research Round 4 – Accessibility Validation**
- Bright blues and purples need careful selection to pass AA contrast; Bear Blue and Focus Purple variants were chosen with adequate contrast in mind.
- Clear color roles (primary, semantics) reduce the risk of inconsistent or inaccessible combinations.

**Research Round 5 – Holistic Review**
- Brand language, visuals, and component styles are consistent with the privacy-first, fun-but-serious-about-focus mission.
- The kit is simple enough for a solo dev to implement (Tailwind, CSS variables, or design tokens) while being extensible for future products (web dashboard, pro features).

---

### Design System Resources (Suggested)

- **Design Tool:** Figma file: `/FocusBear/BrandSystem` (structure suggestion)
- **CSS / Tailwind Tokens:**
  - `--color-primary: #0E75B6;`
  - `--color-secondary: #6C5CE7;`
  - `--color-success: #55EFC4;`
  - `--color-warning: #FF9F43;`
  - `--color-error: #D63031;`
  - `--color-info: #FFDD57;`

---

### Glossary

- **Brand Identity:** Visual and verbal system that makes FocusBear recognizable and memorable.
- **Semantic Colors:** Colors that communicate meaning (success, error, warning, info).
- **WCAG:** Web Content Accessibility Guidelines – standards to ensure web content is accessible.
- **Mascot:** Character (the bear) representing the brand personality across UI and marketing.