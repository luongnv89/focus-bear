# FocusBear Landing Page

Marketing landing page for the FocusBear Chrome extension.

## Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS framework
- **React Router 6** - Client-side routing
- **Lucide React** - Icon library
- **yet-another-react-lightbox** - Screenshot gallery lightbox

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

## Getting Started

### Installation

```bash
cd landing-page
npm install
```

### Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
VITE_CHROME_STORE_URL=https://chrome.google.com/webstore/detail/focusbear/your-extension-id
VITE_APP_VERSION=0.2.0
VITE_GITHUB_URL=https://github.com/luongnv89/focus-bear
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
landing-page/
├── public/
│   ├── fonts/              # Self-hosted Inter font
│   ├── screenshots/        # Extension screenshots
│   ├── favicon.ico         # Favicon
│   └── og-image.jpg        # Open Graph image
├── src/
│   ├── components/         # React components
│   │   ├── Header.jsx      # Sticky header with navigation
│   │   ├── Footer.jsx      # Footer with links
│   │   ├── Hero.jsx        # Hero section with CTA
│   │   ├── Features.jsx    # Feature cards
│   │   └── Screenshots.jsx # Screenshot gallery with lightbox
│   ├── data/               # Static content data
│   │   ├── navigation.js   # Header navigation links
│   │   ├── footer.js       # Footer links
│   │   ├── hero.js         # Hero section content
│   │   ├── features.js     # Feature cards content
│   │   ├── screenshots.js  # Screenshot metadata
│   │   └── privacy.js      # Privacy policy content
│   ├── pages/              # Page components
│   │   ├── Landing.jsx     # Main landing page
│   │   └── Privacy.jsx     # Privacy policy page
│   ├── styles/
│   │   └── index.css       # Global styles + Tailwind
│   ├── App.jsx             # App with React Router
│   └── main.jsx            # Entry point
├── index.html              # HTML template with OG tags
├── netlify.toml            # Netlify deployment config
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies and scripts
```

## Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

The `netlify.toml` file is already configured for SPA routing and caching.

### Manual Deployment

Any static hosting service works. Build the project and deploy the `dist/` directory.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |

## Features

- **Responsive Design** - Works on all screen sizes (320px to 2560px)
- **Dark Theme** - FocusBear brand colors with bright green accent
- **Accessibility** - WCAG 2.1 AA compliant, keyboard navigation
- **Performance** - Code splitting, lazy loading, optimized assets
- **SEO** - Open Graph and Twitter Card meta tags

## License

MIT License - See [LICENSE](../LICENSE) for details.
