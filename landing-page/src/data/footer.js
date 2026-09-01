export const footerContent = {
  links: [
    {
      id: 'github',
      label: 'GitHub',
      href:
        import.meta.env.VITE_GITHUB_URL ||
        'https://github.com/luongnv89/focus-bear',
      external: true,
      ariaLabel: 'View FocusPaw source code on GitHub',
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      href: '/privacy',
      external: false,
    },
  ],
  copyright: `© ${new Date().getFullYear()} FocusPaw. All rights reserved.`,
  tagline: 'Track your focus, privacy-first.',
};
