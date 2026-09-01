export const navigationContent = {
  logo: {
    text: 'FocusPaw',
    href: '/',
  },
  links: [
    { id: 'features', label: 'Features', href: '#features', external: false },
    {
      id: 'screenshots',
      label: 'Screenshots',
      href: '#screenshots',
      external: false,
    },
    { id: 'privacy', label: 'Privacy', href: '/privacy', external: false },
  ],
  ctaButton: {
    text: 'Add to Chrome',
    url:
      import.meta.env.VITE_CHROME_STORE_URL ||
      'https://chrome.google.com/webstore',
    ariaLabel: 'Install FocusPaw extension from Chrome Web Store',
  },
};
