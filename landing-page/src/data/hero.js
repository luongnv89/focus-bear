export const heroContent = {
  headline: 'Track Your Focus, Master Your Time',
  tagline:
    'Privacy-first Chrome extension that helps you understand your browsing habits through beautiful visualizations. All data stays on your device.',
  ctaButton: {
    text: "Add to Chrome — It's Free",
    url:
      import.meta.env.VITE_CHROME_STORE_URL ||
      'https://chrome.google.com/webstore',
    ariaLabel: 'Install FocusBear extension from Chrome Web Store',
  },
  heroImage: {
    src: '/screenshots/dashboard.png',
    alt: 'FocusBear dashboard showing focus tracking graph with interactive visualization',
    width: 1920,
    height: 1080,
  },
};
