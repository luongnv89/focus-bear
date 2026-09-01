# Data Model: FocusBear Landing Page

**Date**: 2025-12-01
**Feature**: Landing Page
**Branch**: `001-landing-page`

## Overview

The landing page is a **static site** with no backend database or user authentication. All content is hardcoded in React components or configured via environment variables. This document defines the data structures used in the codebase.

---

## 1. Page Content Schema

### 1.1 Hero Section

```typescript
interface HeroContent {
  headline: string;           // Main heading (e.g., "Track Your Focus, Master Your Time")
  tagline: string;            // Supporting text (e.g., "Privacy-first Chrome extension...")
  ctaButton: {
    text: string;             // Button label (e.g., "Add to Chrome")
    url: string;              // Chrome Web Store URL (from env var)
    ariaLabel: string;        // Accessibility label
  };
  heroImage: {
    src: string;              // Path to hero image
    alt: string;              // Alternative text
    width: number;            // Image width in pixels
    height: number;           // Image height in pixels
  };
}

// Example
const heroContent: HeroContent = {
  headline: "Track Your Focus, Master Your Time",
  tagline: "Privacy-first Chrome extension that helps you understand your browsing habits through beautiful visualizations",
  ctaButton: {
    text: "Add to Chrome",
    url: import.meta.env.VITE_CHROME_STORE_URL,
    ariaLabel: "Install FocusBear extension from Chrome Web Store",
  },
  heroImage: {
    src: "/hero-dashboard.png",
    alt: "FocusBear dashboard showing focus tracking graph",
    width: 1200,
    height: 800,
  },
};
```

---

### 1.2 Features Section

```typescript
interface Feature {
  id: string;                 // Unique identifier (e.g., "privacy-first")
  icon: string;               // Lucide icon name (e.g., "Shield", "BarChart")
  title: string;              // Feature name
  description: string;        // Feature description (1-2 sentences)
}

interface FeaturesContent {
  sectionTitle: string;       // Section heading
  sectionDescription: string; // Section intro text
  features: Feature[];        // Array of feature cards
}

// Example
const featuresContent: FeaturesContent = {
  sectionTitle: "Everything You Need to Stay Focused",
  sectionDescription: "Powerful features designed to help you understand and improve your focus habits.",
  features: [
    {
      id: "privacy-first",
      icon: "Shield",
      title: "Privacy-First, Local-Only Data",
      description: "All your data stays on your device. No cloud sync, no tracking, no external API calls.",
    },
    {
      id: "visual-dashboard",
      icon: "BarChart",
      title: "Visual Graph Dashboard",
      description: "Interactive D3.js visualization shows your focus patterns over time with beautiful, intuitive graphs.",
    },
    {
      id: "site-limits",
      icon: "Timer",
      title: "Customizable Site Limits",
      description: "Set daily limits for distracting websites and get notified when you approach them.",
    },
    {
      id: "focus-score",
      icon: "TrendingUp",
      title: "Focus Score & Streaks",
      description: "Track your productivity with daily focus scores and build streaks to stay motivated.",
    },
  ],
};
```

---

### 1.3 Screenshot Gallery

```typescript
interface Screenshot {
  id: string;                 // Unique identifier
  thumbnail: string;          // Path to thumbnail image
  fullSize: string;           // Path to full-size image
  alt: string;                // Alternative text
  caption: string;            // Descriptive caption
  width: number;              // Full-size width
  height: number;             // Full-size height
}

interface ScreenshotGalleryContent {
  sectionTitle: string;
  screenshots: Screenshot[];
}

// Example (using actual screenshot filenames from /screenshots/)
const screenshotGalleryContent: ScreenshotGalleryContent = {
  sectionTitle: "See FocusBear in Action",
  screenshots: [
    {
      id: "dashboard",
      thumbnail: "/screenshots/dashboard.png",
      fullSize: "/screenshots/dashboard.png",
      alt: "FocusBear dashboard showing focus tracking visualization",
      caption: "Dashboard with interactive focus graph",
      width: 1920,
      height: 1080,
    },
    {
      id: "dashboard-reddit",
      thumbnail: "/screenshots/dashboard-reddit.png",
      fullSize: "/screenshots/dashboard-reddit.png",
      alt: "FocusBear dashboard showing Reddit usage tracking",
      caption: "Track time spent on specific sites",
      width: 1920,
      height: 1080,
    },
    {
      id: "settings",
      thumbnail: "/screenshots/settings.png",
      fullSize: "/screenshots/settings.png",
      alt: "Settings page for configuring preferences",
      caption: "Customize your focus tracking preferences",
      width: 1920,
      height: 1080,
    },
    {
      id: "set-block",
      thumbnail: "/screenshots/set-block.png",
      fullSize: "/screenshots/set-block.png",
      alt: "Block page configuration interface",
      caption: "Set up blocking for distracting sites",
      width: 1920,
      height: 1080,
    },
    {
      id: "set-block-rules",
      thumbnail: "/screenshots/set-block-rules.png",
      fullSize: "/screenshots/set-block-rules.png",
      alt: "Blocking rules management page",
      caption: "Manage your site blocking rules",
      width: 1920,
      height: 1080,
    },
    {
      id: "help-faq",
      thumbnail: "/screenshots/Help-FAQ.png",
      fullSize: "/screenshots/Help-FAQ.png",
      alt: "Help and FAQ page explaining FocusBear features",
      caption: "Comprehensive help documentation",
      width: 1920,
      height: 1080,
    },
  ],
};
```

---

### 1.4 Navigation

```typescript
interface NavLink {
  id: string;                 // Unique identifier
  label: string;              // Link text
  href: string;               // Link destination (route or anchor)
  external: boolean;          // Whether link opens in new tab
}

interface NavigationContent {
  logo: {
    src: string;              // Logo image path
    alt: string;              // Logo alt text
    width: number;
    height: number;
  };
  links: NavLink[];
  ctaButton: {
    text: string;
    url: string;
    ariaLabel: string;
  };
}

// Example
const navigationContent: NavigationContent = {
  logo: {
    src: "/logo.svg",
    alt: "FocusBear logo",
    width: 40,
    height: 40,
  },
  links: [
    { id: "features", label: "Features", href: "#features", external: false },
    { id: "screenshots", label: "Screenshots", href: "#screenshots", external: false },
    { id: "privacy", label: "Privacy", href: "/privacy", external: false },
  ],
  ctaButton: {
    text: "Add to Chrome",
    url: import.meta.env.VITE_CHROME_STORE_URL,
    ariaLabel: "Install FocusBear extension from Chrome Web Store",
  },
};
```

---

### 1.5 Footer

```typescript
interface FooterLink {
  id: string;
  label: string;
  href: string;
  external: boolean;
  ariaLabel?: string;
}

interface FooterContent {
  links: FooterLink[];
  copyright: string;
  version: string;            // From env var
}

// Example
const footerContent: FooterContent = {
  links: [
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/yourusername/focus-bear",
      external: true,
      ariaLabel: "View FocusBear source code on GitHub",
    },
    {
      id: "privacy",
      label: "Privacy Policy",
      href: "/privacy",
      external: false,
    },
    {
      id: "help",
      label: "Help & FAQ",
      href: "https://yourdomain.com/help",
      external: true,
    },
  ],
  copyright: `© ${new Date().getFullYear()} FocusBear. All rights reserved.`,
  version: import.meta.env.VITE_APP_VERSION,
};
```

---

## 2. Open Graph Meta Tags

```typescript
interface OpenGraphMetadata {
  title: string;
  type: string;
  image: string;              // Absolute URL
  url: string;                // Canonical URL
  description: string;
  siteName: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  locale: string;
}

// Example
const ogMetadata: OpenGraphMetadata = {
  title: "FocusBear - Track Your Focus-Switching Habits",
  type: "website",
  image: "https://focusbear.io/og-image.jpg",
  url: "https://focusbear.io/",
  description: "Privacy-first Chrome extension that helps you track focus-switching habits through interactive visualizations. Stay focused, achieve more.",
  siteName: "FocusBear",
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: "FocusBear extension dashboard showing focus tracking visualization",
  locale: "en_US",
};

interface TwitterCardMetadata {
  card: "summary_large_image";
  title: string;
  description: string;
  image: string;              // Absolute URL
}

// Example
const twitterMetadata: TwitterCardMetadata = {
  card: "summary_large_image",
  title: "FocusBear - Track Your Focus-Switching Habits",
  description: "Privacy-first Chrome extension that helps you track focus-switching habits through interactive visualizations.",
  image: "https://focusbear.io/og-image.jpg",
};
```

---

## 3. Environment Variables

```typescript
interface EnvironmentVariables {
  VITE_CHROME_STORE_URL: string;  // Chrome Web Store listing URL
  VITE_APP_VERSION: string;       // Current version (e.g., "1.0.0")
  VITE_GITHUB_URL: string;        // GitHub repository URL
  VITE_HELP_URL: string;          // Help/FAQ page URL
}

// Access pattern
const env: EnvironmentVariables = {
  VITE_CHROME_STORE_URL: import.meta.env.VITE_CHROME_STORE_URL || 'https://chrome.google.com/webstore',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '0.0.0',
  VITE_GITHUB_URL: import.meta.env.VITE_GITHUB_URL || 'https://github.com/yourusername/focus-bear',
  VITE_HELP_URL: import.meta.env.VITE_HELP_URL || '/help',
};
```

---

## 4. Privacy Policy Content

```typescript
interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string;            // Markdown or plain text
}

interface PrivacyPolicyContent {
  title: string;
  lastUpdated: string;
  sections: PrivacyPolicySection[];
}

// Example structure (actual content from PRIVACY.md)
const privacyPolicyContent: PrivacyPolicyContent = {
  title: "Privacy Policy",
  lastUpdated: "2025-12-01",
  sections: [
    {
      id: "overview",
      title: "Overview",
      content: "FocusBear is a privacy-first Chrome extension...",
    },
    {
      id: "data-collection",
      title: "Data Collection",
      content: "FocusBear stores all data locally on your device...",
    },
    // Additional sections from PRIVACY.md
  ],
};
```

---

## 5. Component State

### 5.1 Lightbox State

```typescript
interface LightboxState {
  isOpen: boolean;
  currentIndex: number;
  slides: Screenshot[];
}

// Example usage in React component
const [lightbox, setLightbox] = useState<LightboxState>({
  isOpen: false,
  currentIndex: 0,
  slides: screenshotGalleryContent.screenshots,
});
```

### 5.2 Header State

```typescript
interface HeaderState {
  isVisible: boolean;         // Auto-hide on mobile scroll
  lastScrollY: number;        // Track scroll position
  isMobileMenuOpen: boolean;  // Mobile hamburger menu state
}

// Example usage
const [header, setHeader] = useState<HeaderState>({
  isVisible: true,
  lastScrollY: 0,
  isMobileMenuOpen: false,
});
```

---

## 6. Validation Rules

Since this is a static site with no user input forms, validation is minimal. However, environment variables should be validated at build time:

```typescript
// vite.config.js or separate validation file
function validateEnvironmentVariables() {
  const required = ['VITE_CHROME_STORE_URL', 'VITE_APP_VERSION'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate Chrome Store URL format
  const chromeStoreUrl = process.env.VITE_CHROME_STORE_URL;
  if (!chromeStoreUrl.startsWith('https://chrome.google.com/webstore')) {
    console.warn('VITE_CHROME_STORE_URL does not appear to be a valid Chrome Web Store URL');
  }
}
```

---

## 7. Data Flow Diagram

```
Environment Variables (.env, Netlify)
    ↓
Vite Build Process
    ↓
React Components (App.jsx, pages/*, components/*)
    ↓
    ├─→ Hero Component (heroContent)
    ├─→ Features Component (featuresContent)
    ├─→ Screenshot Gallery (screenshotGalleryContent) → Lightbox Modal
    ├─→ Header Component (navigationContent, headerState)
    ├─→ Footer Component (footerContent)
    └─→ Privacy Page (privacyPolicyContent from PRIVACY.md)
    ↓
HTML Output (index.html with OG meta tags)
    ↓
Netlify CDN (static hosting)
```

---

## 8. File Organization

```
landing-page/src/
├── data/
│   ├── hero.js              # HeroContent export
│   ├── features.js          # FeaturesContent export
│   ├── screenshots.js       # ScreenshotGalleryContent export
│   ├── navigation.js        # NavigationContent export
│   ├── footer.js            # FooterContent export
│   └── privacy.js           # PrivacyPolicyContent export (parsed from PRIVACY.md)
├── components/
│   ├── Hero.jsx             # Uses data/hero.js
│   ├── Features.jsx         # Uses data/features.js
│   ├── Screenshots.jsx      # Uses data/screenshots.js
│   └── Lightbox.jsx         # Receives Screenshot[]
└── pages/
    ├── Landing.jsx          # Composes Hero, Features, Screenshots
    └── Privacy.jsx          # Uses data/privacy.js
```

---

## 9. Type Definitions

For TypeScript support (optional but recommended):

```typescript
// src/types/index.ts
export interface HeroContent { /* ... */ }
export interface Feature { /* ... */ }
export interface FeaturesContent { /* ... */ }
export interface Screenshot { /* ... */ }
export interface ScreenshotGalleryContent { /* ... */ }
export interface NavLink { /* ... */ }
export interface NavigationContent { /* ... */ }
export interface FooterLink { /* ... */ }
export interface FooterContent { /* ... */ }
export interface OpenGraphMetadata { /* ... */ }
export interface TwitterCardMetadata { /* ... */ }
export interface PrivacyPolicySection { /* ... */ }
export interface PrivacyPolicyContent { /* ... */ }
export interface LightboxState { /* ... */ }
export interface HeaderState { /* ... */ }
```

---

## Summary

- **No backend database**: All content is static
- **No user data**: Privacy-first design
- **Environment variables**: Chrome Store URL, version, GitHub URL
- **Content structure**: Defined interfaces for hero, features, screenshots, navigation, footer
- **State management**: Minimal React state for lightbox and header auto-hide
- **Validation**: Build-time check for required env vars

**Next Steps**: Generate contracts (external dependencies) and quickstart guide.
