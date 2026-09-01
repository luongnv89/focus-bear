# Quick Start: FocusBear Landing Page

**Date**: 2025-12-01
**Feature**: Landing Page
**Branch**: `001-landing-page`

## Overview

This guide provides step-by-step instructions for setting up, developing, and deploying the FocusBear landing page.

---

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher (LTS recommended)
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: v2.30.0 or higher

### Verify Installation

```bash
node --version    # Should output v18.x.x or higher
npm --version     # Should output v9.x.x or higher
git --version     # Should output v2.30.x or higher
```

### Recommended Tools

- **VS Code**: With ESLint, Prettier, Tailwind CSS IntelliSense extensions
- **Chrome**: For testing and Lighthouse audits
- **Git GUI** (optional): GitHub Desktop, GitKraken, or SourceTree

---

## Installation

### 1. Clone Repository

```bash
# Navigate to project root
cd /Users/montimage/buildspace/focus-bear

# Ensure you're on the landing page feature branch
git checkout 001-landing-page
```

### 2. Navigate to Landing Page Directory

```bash
cd landing-page
```

### 3. Install Dependencies

```bash
# Install all npm packages
npm install

# Expected output:
# added XXX packages in XXs
```

### 4. Create Environment Variables

Create a `.env` file in the `landing-page/` directory:

```bash
# Create .env file
touch .env
```

Add the following variables:

```bash
# .env
VITE_CHROME_STORE_URL=https://chrome.google.com/webstore/detail/focusbear/PLACEHOLDER
VITE_APP_VERSION=1.0.0
VITE_GITHUB_URL=https://github.com/yourusername/focus-bear
VITE_HELP_URL=/help
```

**Note**: Replace `PLACEHOLDER` with the actual Chrome Web Store ID once the extension is published.

### 5. Verify Installation

```bash
# Run development server
npm run dev

# Expected output:
#   VITE v5.x.x  ready in XXX ms
#
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
```

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the landing page.

---

## Development

### Development Server

Start the Vite development server with hot module replacement (HMR):

```bash
npm run dev
```

- **URL**: http://localhost:5173
- **Hot Reload**: Changes to `.jsx`, `.css`, or `.js` files automatically reload
- **Error Overlay**: Compilation errors displayed in browser

### Project Structure

```
landing-page/
├── public/                  # Static assets (copied to dist/)
│   ├── fonts/               # Self-hosted Inter font
│   ├── screenshots/         # Extension screenshots (symlink)
│   ├── og-image.jpg         # Open Graph preview image
│   └── favicon.ico          # Favicon
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # Sticky header with nav
│   │   ├── Footer.jsx       # Footer with links
│   │   ├── Hero.jsx         # Hero section with CTA
│   │   ├── Features.jsx     # Feature cards
│   │   ├── Screenshots.jsx  # Screenshot gallery
│   │   └── Lightbox.jsx     # Lightbox modal
│   ├── pages/               # Route pages
│   │   ├── Landing.jsx      # Main landing page (/)
│   │   └── Privacy.jsx      # Privacy policy (/privacy)
│   ├── data/                # Static content
│   │   ├── hero.js          # Hero section content
│   │   ├── features.js      # Features content
│   │   ├── screenshots.js   # Screenshot metadata
│   │   ├── navigation.js    # Nav links
│   │   ├── footer.js        # Footer links
│   │   └── privacy.js       # Privacy policy content
│   ├── styles/
│   │   └── index.css        # Global styles + Tailwind imports
│   ├── App.jsx              # React Router setup
│   └── main.jsx             # Vite entry point
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # TailwindCSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (local)
├── .env.example             # Example env vars (committed)
└── netlify.toml             # Netlify deployment config
```

### Key Files

- **`src/App.jsx`**: React Router configuration for routes
- **`src/main.jsx`**: Vite entry point, mounts React app
- **`vite.config.js`**: Build configuration, plugins, optimization
- **`tailwind.config.js`**: TailwindCSS theme, colors, fonts
- **`netlify.toml`**: Deployment configuration for Netlify

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:5173) |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

### Making Changes

**1. Edit Content**:

```bash
# Modify hero section
vim src/data/hero.js

# Modify features
vim src/data/features.js
```

**2. Edit Styles**:

```bash
# Global styles
vim src/styles/index.css

# Component styles (use Tailwind utility classes in JSX)
vim src/components/Hero.jsx
```

**3. Edit Components**:

```bash
# Modify Hero component
vim src/components/Hero.jsx

# Add new component
touch src/components/NewComponent.jsx
```

**4. Test Changes**:

```bash
# Development server auto-reloads
# Open http://localhost:5173 and verify changes
```

### Code Quality Checks

```bash
# Run linter
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format code
npm run format

# Check formatting (CI)
npm run format:check
```

---

## Building for Production

### Build Command

```bash
npm run build
```

**Output**:
- **Directory**: `dist/`
- **Assets**: Minified JS, CSS, images with hash-based filenames
- **Index**: `dist/index.html` with inlined critical CSS

### Verify Build

```bash
# Preview production build
npm run preview

# Expected output:
#   ➜  Local:   http://localhost:4173/
#   ➜  Network: use --host to expose
```

Open [http://localhost:4173](http://localhost:4173) to test production build.

### Build Artifacts

```bash
# Inspect build output
ls -lh dist/

# Expected structure:
# dist/
# ├── index.html
# ├── assets/
# │   ├── js/
# │   │   ├── index-[hash].js
# │   │   ├── react-vendor-[hash].js
# │   │   └── vendor-[hash].js
# │   └── css/
# │       └── index-[hash].css
# ├── fonts/
# │   └── Inter-Variable.woff2
# ├── screenshots/
# │   └── *.png
# └── og-image.jpg
```

### Bundle Analysis

```bash
# Install visualizer plugin (already in package.json)
npm install -D rollup-plugin-visualizer

# Build with visualizer
npm run build

# Open bundle analysis
open stats.html
```

**Target Metrics**:
- Main bundle: < 80KB gzipped
- Vendor bundle (React): < 50KB gzipped
- Total JS: < 150KB gzipped
- CSS: < 15KB gzipped

---

## Testing

### Manual Testing Checklist

- [ ] Hero section displays correctly with CTA button
- [ ] Features section shows 4 feature cards
- [ ] Screenshot gallery displays 6 images
- [ ] Clicking screenshot opens lightbox
- [ ] Lightbox keyboard navigation works (arrows, Escape)
- [ ] Header sticky on desktop, auto-hides on mobile scroll
- [ ] Footer links open correctly
- [ ] Privacy policy page loads at `/privacy`
- [ ] All CTAs link to Chrome Web Store
- [ ] Responsive design works on mobile (320px) and desktop (1920px)

### Accessibility Testing

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Run accessibility audit
lhci autorun --collect.url=http://localhost:4173

# Expected scores:
# - Performance: ≥ 90
# - Accessibility: ≥ 90
# - Best Practices: ≥ 90
# - SEO: ≥ 90
```

### Keyboard Navigation Test

1. **Tab through page**: Ensure all interactive elements focusable
2. **Open lightbox**: Click screenshot, verify modal opens
3. **Tab within modal**: Ensure focus trapped within lightbox
4. **Escape key**: Closes lightbox, returns focus to trigger element
5. **Arrow keys**: Navigate between screenshots in lightbox

### Screen Reader Test

**macOS (VoiceOver)**:
```bash
# Enable VoiceOver
Cmd + F5

# Navigate page
# - Hero section should be announced
# - Feature cards should be announced
# - Screenshot gallery should be announced
# - Lightbox should be announced as dialog
```

**Windows (NVDA)**:
1. Download NVDA: https://www.nvaccess.org/download/
2. Install and launch
3. Navigate page with arrow keys
4. Verify all content announced correctly

### Performance Testing

```bash
# Build and preview
npm run build
npm run preview

# Run Lighthouse
lhci autorun --collect.url=http://localhost:4173 \
  --collect.settings.preset=desktop \
  --collect.settings.throttlingMethod=simulate \
  --collect.settings.throttling.cpuSlowdownMultiplier=4

# Expected TTI: ≤ 3000ms
```

---

## Deployment

### Prerequisites

1. **Netlify Account**: Sign up at https://app.netlify.com/signup
2. **GitHub Repository**: Push code to GitHub
3. **Environment Variables**: Configure in Netlify dashboard

### Deploy to Netlify

#### Option 1: Automatic Deploy (Recommended)

**1. Connect GitHub Repository**:

```bash
# Push code to GitHub
git add .
git commit -m "feat: add landing page"
git push origin 001-landing-page
```

**2. Create Netlify Site**:

1. Go to https://app.netlify.com/start
2. Click "Import from Git"
3. Select GitHub, authorize Netlify
4. Choose `focus-bear` repository
5. Configure build settings:
   - **Base directory**: `landing-page`
   - **Build command**: `npm run build`
   - **Publish directory**: `landing-page/dist`
6. Click "Deploy site"

**3. Configure Environment Variables**:

1. Go to Site Settings → Environment Variables
2. Add variables:
   ```
   VITE_CHROME_STORE_URL = https://chrome.google.com/webstore/detail/...
   VITE_APP_VERSION = 1.0.0
   VITE_GITHUB_URL = https://github.com/yourusername/focus-bear
   ```
3. Save and redeploy

**4. Custom Domain** (optional):

1. Go to Domain Settings → Add custom domain
2. Enter `focusbear.io` (or your domain)
3. Follow DNS configuration instructions
4. Wait for SSL certificate to provision (~24 hours)

#### Option 2: Manual Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build project
cd landing-page
npm run build

# Deploy manually
netlify deploy --prod --dir=dist

# Follow prompts to create or select site
```

### Verify Deployment

1. **Visit Site**: Open Netlify-provided URL (e.g., `https://your-site.netlify.app`)
2. **Check Functionality**:
   - Hero section loads
   - Images load correctly
   - Lightbox works
   - Privacy policy page accessible
   - CTAs link to Chrome Web Store
3. **Run Lighthouse**: Test production URL
4. **Test on Mobile**: Verify responsive design

### Continuous Deployment

Once connected to GitHub, Netlify automatically deploys:

- **Push to `main`**: Deploys to production
- **Pull Request**: Creates deploy preview with unique URL

**Deploy Preview Example**:
```
https://deploy-preview-123--your-site.netlify.app
```

---

## Troubleshooting

### Issue: `npm install` fails

**Symptoms**:
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Issue: Development server won't start

**Symptoms**:
```bash
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution**:
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

---

### Issue: Images not loading

**Symptoms**: Broken image icons in screenshot gallery

**Solution**:
```bash
# Verify screenshots directory exists
ls -lh public/screenshots/

# If missing, create symlink
ln -s ../../screenshots public/screenshots

# Verify symlink
ls -lh public/screenshots/
```

---

### Issue: Environment variables not working

**Symptoms**: CTA button links to `undefined`

**Solution**:
```bash
# Check .env file exists
cat .env

# Restart dev server (env vars loaded on startup)
# Ctrl+C to stop, then:
npm run dev

# Verify in browser console
console.log(import.meta.env.VITE_CHROME_STORE_URL)
```

---

### Issue: Build fails with "out of memory"

**Symptoms**:
```bash
FATAL ERROR: Reached heap limit Allocation failed
```

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or add to package.json:
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
```

---

### Issue: Lighthouse accessibility score low

**Symptoms**: Accessibility score < 90

**Common Causes**:
1. Missing `alt` text on images
2. Low color contrast
3. Missing ARIA labels
4. Broken focus management

**Solution**:
```bash
# Run axe DevTools in browser
# Install: https://www.deque.com/axe/devtools/

# Or use jest-axe for automated checks
npm test
```

---

## Next Steps

1. **Implement Features**: Follow `/speckit.tasks` to generate implementation tasks
2. **Add Content**: Update `src/data/*` files with actual copy
3. **Create OG Image**: Design custom 1200x630px Open Graph image
4. **Optimize Images**: Compress screenshots to < 500KB each
5. **Test Thoroughly**: Complete manual testing checklist
6. **Deploy**: Push to production once extension is published

---

## Additional Resources

- **Vite Documentation**: https://vite.dev/
- **React Documentation**: https://react.dev/
- **TailwindCSS Documentation**: https://tailwindcss.com/docs
- **Netlify Documentation**: https://docs.netlify.com/
- **Lighthouse Documentation**: https://developer.chrome.com/docs/lighthouse/
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Support

For questions or issues:
1. Check [troubleshooting section](#troubleshooting)
2. Review [research.md](research.md) for technical decisions
3. Consult [plan.md](plan.md) for architecture overview
4. Open an issue on GitHub repository
