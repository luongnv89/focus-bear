# External Dependencies: FocusBear Landing Page

**Date**: 2025-12-01
**Feature**: Landing Page
**Branch**: `001-landing-page`

## Overview

The FocusBear landing page is a **static site** with no backend APIs. However, it depends on external services for deployment and user navigation. This document defines all external dependencies, their contracts, and failure modes.

---

## 1. Chrome Web Store (External Redirect)

### Description

The primary CTA button redirects users to the Chrome Web Store listing for the FocusBear extension.

### Contract

**URL Format**:
```
https://chrome.google.com/webstore/detail/[extension-name]/[extension-id]
```

**Environment Variable**:
```bash
VITE_CHROME_STORE_URL=https://chrome.google.com/webstore/detail/focusbear/abc123xyz789
```

**Usage**:
```jsx
<a
  href={import.meta.env.VITE_CHROME_STORE_URL}
  target="_blank"
  rel="noopener noreferrer"
  className="cta-button"
>
  Add to Chrome
</a>
```

### Expected Behavior

- **Click action**: Opens Chrome Web Store in new tab
- **Browser compatibility**: Works in all browsers (not Chrome-only)
- **Response**: 200 OK (Chrome Web Store page loads)

### Failure Modes

| Failure | Cause | User Impact | Mitigation |
|---------|-------|-------------|------------|
| **404 Not Found** | Extension not yet published | Broken link | Use placeholder URL during development; update before production launch |
| **Extension removed** | Removed from store | Broken link | Monitor extension status; display maintenance message if removed |
| **Rate limiting** | Excessive traffic | Slow load | No mitigation needed (Chrome's responsibility) |
| **Missing env var** | Build configuration error | Button has no href | Build-time validation (fail build if missing) |

### Testing

```bash
# Verify URL is accessible
curl -I "$VITE_CHROME_STORE_URL"
# Expected: HTTP/2 200

# Manual test
1. Click "Add to Chrome" button
2. Verify Chrome Web Store page opens in new tab
3. Verify correct extension is displayed
```

### Monitoring

- **Manual check**: Monthly verification that Chrome Store URL is active
- **No automated monitoring**: Static link, not critical to site operation

---

## 2. Netlify (Hosting Platform)

### Description

Netlify provides static site hosting, CI/CD, and CDN distribution.

### Contract

**Build Command**:
```bash
npm run build
```

**Publish Directory**:
```
dist/
```

**Deploy Trigger**:
- Git push to `main` branch (production)
- Git push to feature branches (deploy previews)

**Environment Variables** (configured in Netlify dashboard):
```bash
VITE_CHROME_STORE_URL=https://chrome.google.com/webstore/detail/...
VITE_APP_VERSION=1.0.0
VITE_GITHUB_URL=https://github.com/yourusername/focus-bear
```

### Expected Behavior

- **Build time**: < 3 minutes
- **Deploy time**: < 1 minute
- **CDN propagation**: < 5 minutes globally
- **Uptime**: 99.9% SLA

### Failure Modes

| Failure | Cause | User Impact | Mitigation |
|---------|-------|-------------|------------|
| **Build failure** | Dependency errors, linting errors | No deploy | CI checks before merge; fix errors promptly |
| **Deploy timeout** | Large assets, slow build | Delayed deploy | Optimize asset sizes; use build cache |
| **CDN outage** | Netlify infrastructure issue | Site unavailable | No mitigation (rely on Netlify SLA); status page monitoring |
| **SSL cert expired** | Auto-renewal failure | HTTPS warnings | Netlify auto-renews; manual renewal if needed |
| **Rate limit exceeded** | Too many builds | Blocked deploys | Upgrade Netlify plan if needed; avoid unnecessary builds |

### Testing

```bash
# Local build test
npm run build
npm run preview

# Verify Lighthouse scores
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:4173

# Deploy preview test
git push origin feature-branch
# Check Netlify deploy preview link
```

### Monitoring

- **Netlify Dashboard**: Check build status, deploy logs
- **Uptime monitoring**: Use external service (e.g., UptimeRobot) to ping landing page every 5 minutes
- **Performance monitoring**: Weekly Lighthouse CI runs (automated via GitHub Actions)

---

## 3. GitHub Repository (Source Control & CI/CD)

### Description

GitHub hosts the landing page source code and triggers Netlify deployments.

### Contract

**Repository Structure**:
```
landing-page/
├── src/
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── netlify.toml
```

**CI/CD Integration**:
- **Push to `main`**: Triggers Netlify production build
- **Pull Request**: Triggers Netlify deploy preview
- **GitHub Actions** (optional): Lint, test, Lighthouse CI

### Expected Behavior

- **Push latency**: Netlify webhook triggered within 10 seconds
- **Webhook delivery**: 99.9% reliability

### Failure Modes

| Failure | Cause | User Impact | Mitigation |
|---------|-------|-------------|------------|
| **Webhook failure** | GitHub/Netlify connectivity issue | No auto-deploy | Manual deploy via Netlify dashboard; retry webhook |
| **GitHub downtime** | GitHub infrastructure outage | Cannot push code | Wait for GitHub recovery; no immediate workaround |
| **Branch protection** | Required checks fail | Cannot merge PR | Fix failing checks (lint, tests) |

### Testing

```bash
# Verify webhook setup
git commit --allow-empty -m "Test webhook"
git push origin main
# Check Netlify dashboard for triggered build
```

### Monitoring

- **GitHub Status**: https://www.githubstatus.com/
- **Netlify Build Notifications**: Email alerts for failed builds

---

## 4. CDN Assets (Fonts, Icons)

### Description

Self-hosted fonts and icons (no external CDN dependencies for privacy-first design).

### Contract

**Fonts**:
- **Location**: `/public/fonts/Inter-Variable.woff2`
- **Format**: WOFF2 (variable font)
- **Size**: ~329 KB

**Icons**:
- **Library**: Lucide React (npm package, bundled)
- **No external CDN**: Icons imported directly in components

### Expected Behavior

- **Font loading**: Preloaded via `<link rel="preload">`
- **Icon rendering**: Inline SVG from React components

### Failure Modes

| Failure | Cause | User Impact | Mitigation |
|---------|-------|-------------|------------|
| **Font file missing** | Build error, file not copied | System font fallback | Verify font file exists in `public/fonts/` before build |
| **Icon import error** | Incorrect import path | Broken icon component | TypeScript/ESLint catches at build time |

### Testing

```bash
# Verify font preload
curl -I https://yourdomain.com/fonts/Inter-Variable.woff2
# Expected: HTTP/2 200, Content-Type: font/woff2

# Verify icons render
npm run build
npm run preview
# Open browser, inspect icons (should be inline SVG)
```

### Monitoring

- **Build-time validation**: Vite build fails if font file missing
- **Visual regression testing**: Screenshot comparison (optional, future enhancement)

---

## 5. Browser APIs

### Description

The landing page uses standard Web APIs for functionality.

### Contract

**Required APIs**:
- **IntersectionObserver**: Image lazy loading (progressive enhancement)
- **Fetch API**: Not used (static site)
- **localStorage**: Not used (no user data)
- **Service Worker**: Not used (future enhancement)

**Browser Support**:
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari (iOS): Latest 2 versions
- Chrome Mobile (Android): Latest 2 versions

### Expected Behavior

- **IntersectionObserver**: Supported in all modern browsers (95%+ coverage)
- **Fallback**: Native `loading="lazy"` attribute for images (99%+ coverage)

### Failure Modes

| Failure | Cause | User Impact | Mitigation |
|---------|-------|-------------|------------|
| **IntersectionObserver unavailable** | Very old browser (< 2019) | Images load immediately (no lazy load) | Acceptable degradation; native `loading="lazy"` works |
| **JavaScript disabled** | User preference | No interactive features | Core content still visible (progressive enhancement) |

### Testing

```bash
# Test with JS disabled
1. Open Chrome DevTools
2. Settings → Debugger → Disable JavaScript
3. Reload page
4. Verify text content and images still visible
```

### Monitoring

- **Browser compatibility**: No active monitoring (standard Web APIs)
- **Analytics** (optional, privacy-respecting): Track browser versions (future)

---

## 6. Privacy.md File (Content Source)

### Description

The privacy policy page content is sourced from `/PRIVACY.md` in the extension repository.

### Contract

**File Location**:
```
/PRIVACY.md (repository root)
```

**Content Format**: Markdown

**Access Pattern**:
- **Option 1**: Copy-paste content into `landing-page/src/data/privacy.js` during build
- **Option 2**: Use Vite plugin to import Markdown file directly

### Expected Behavior

- **Content update**: Manual sync from `/PRIVACY.md` to landing page
- **Frequency**: Updated whenever privacy policy changes (rare)

### Failure Modes

| Failure | Cause | User Impact | Mitigation |
|---------|-------|-------------|------------|
| **Outdated content** | PRIVACY.md updated but landing page not synced | Incorrect privacy info displayed | Add reminder in PR template to update landing page when PRIVACY.md changes |
| **Missing file** | PRIVACY.md deleted | Privacy page broken | Build-time check to verify PRIVACY.md exists |

### Testing

```bash
# Verify PRIVACY.md content matches landing page
diff <(cat PRIVACY.md) <(cat landing-page/src/data/privacy.js)
# Expect minimal differences (formatting only)
```

### Monitoring

- **Manual review**: Check privacy page quarterly
- **Automated check** (future): Script to compare PRIVACY.md with landing page content

---

## 7. Screenshot Assets

### Description

Extension screenshots displayed in the gallery.

### Contract

**File Location**:
```
/screenshots/ (repository root)
```

**Expected Files**:
- `dashboard-dark.png`
- `dashboard-light.png`
- `settings.png`
- `blocking-rules.png`
- `help-page.png`
- `graph-visualization.png`

**Symlink** (for landing page access):
```bash
# Create symlink from landing-page/public/screenshots to /screenshots
ln -s ../../screenshots landing-page/public/screenshots
```

### Expected Behavior

- **File format**: PNG or WebP
- **Max size**: 500 KB per image (compressed)
- **Dimensions**: Variable (optimized for display)

### Failure Modes

| Failure | Cause | User Impact | Mitigation |
|---------|-------|-------------|------------|
| **Missing screenshot** | File deleted, symlink broken | Broken image on gallery | Build-time check to verify all 6 screenshots exist |
| **Large file size** | Unoptimized image | Slow page load | Image compression during build (vite-plugin-imagemin) |

### Testing

```bash
# Verify all screenshots exist
ls -lh landing-page/public/screenshots/
# Expect 6 files

# Verify file sizes
du -sh landing-page/public/screenshots/*.png
# Each file should be < 500 KB
```

### Monitoring

- **Build-time validation**: Fail build if any screenshot missing
- **Performance testing**: Lighthouse audit for image optimization

---

## Summary

| Dependency | Type | Failure Impact | Mitigation Strategy |
|------------|------|----------------|---------------------|
| **Chrome Web Store** | External link | High (primary CTA) | Build-time URL validation, monthly manual check |
| **Netlify** | Hosting | Critical (site unavailable) | Uptime monitoring, build cache, optimized assets |
| **GitHub** | CI/CD trigger | Medium (delayed deploy) | Manual deploy fallback, webhook retry |
| **Fonts/Icons** | Self-hosted | Low (graceful fallback) | Build-time validation, system font fallback |
| **Browser APIs** | Web standards | Low (progressive enhancement) | Feature detection, native fallbacks |
| **PRIVACY.md** | Content source | Medium (incorrect info) | Manual sync, build-time check (future) |
| **Screenshots** | Static assets | Medium (broken images) | Build-time validation, symlink verification |

**Key Principle**: **Privacy-first** = No external API calls, no analytics, no tracking. All dependencies are for deployment infrastructure only, not runtime functionality.
