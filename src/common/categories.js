/**
 * Domain Categorization Logic
 * Shared between dashboard and popup
 */

export const CATEGORY_PALETTE = {
  social: '#ff6b6b', // Red/Orange for distractions
  entertainment: '#ffa500', // Orange
  productivity: '#4cc9f0', // Blue
  development: '#4895ef', // Darker Blue
  news: '#b5179e', // Purple
  shopping: '#f72585', // Pink
  other: '#a0a0a0', // Gray
};

export const CATEGORY_CONFIG = {
  social: {
    keywords: [
      'facebook',
      'twitter',
      'x.com',
      'instagram',
      'linkedin',
      'reddit',
      'tiktok',
      'snapchat',
      'pinterest',
      'discord',
      'whatsapp',
      'telegram',
    ],
    name: 'Social Media',
    color: CATEGORY_PALETTE.social,
    sentiment: 'distraction',
  },
  entertainment: {
    keywords: [
      'youtube',
      'netflix',
      'twitch',
      'spotify',
      'soundcloud',
      'hulu',
      'disney',
      'hbo',
      'primevideo',
      '9gag',
      'buzzfeed',
    ],
    name: 'Entertainment',
    color: CATEGORY_PALETTE.entertainment,
    sentiment: 'distraction',
  },
  productivity: {
    keywords: [
      'gmail',
      'outlook',
      'slack',
      'notion',
      'trello',
      'asana',
      'jira',
      'confluence',
      'linear',
      'zoom',
      'meet.google',
      'docs.google',
      'drive.google',
      'dropbox',
      'figma',
    ],
    name: 'Productivity',
    color: CATEGORY_PALETTE.productivity,
    sentiment: 'productive',
  },
  development: {
    keywords: [
      'github',
      'gitlab',
      'stackoverflow',
      'dev.to',
      'codepen',
      'codesandbox',
      'repl.it',
      'localhost',
      '127.0.0.1',
      'w3schools',
      'mdn',
      'mozilla',
    ],
    name: 'Development',
    color: CATEGORY_PALETTE.development,
    sentiment: 'productive',
  },
  news: {
    keywords: [
      'news',
      'cnn',
      'bbc',
      'nytimes',
      'guardian',
      'medium',
      'substack',
      'forbes',
      'bloomberg',
      'wsj',
      'reuters',
    ],
    name: 'News & Media',
    color: CATEGORY_PALETTE.news,
    sentiment: 'neutral',
  },
  shopping: {
    keywords: ['amazon', 'ebay', 'etsy', 'shopify', 'walmart', 'target', 'alibaba', 'bestbuy'],
    name: 'Shopping',
    color: CATEGORY_PALETTE.shopping,
    sentiment: 'neutral',
  },
};

/**
 * Categorize domain into a group
 * @param {string} domain - Domain name
 * @returns {Object} - Category info {name, color, key, sentiment}
 */
export function categorizeDomain(domain) {
  const domainLower = domain.toLowerCase();

  /* eslint-disable implicit-arrow-linebreak, function-paren-newline */
  const match = Object.entries(CATEGORY_CONFIG).find(([, config]) =>
    config.keywords.some((k) => domainLower.includes(k)),
  );
  /* eslint-enable implicit-arrow-linebreak, function-paren-newline */

  if (match) {
    const [key, config] = match;
    return {
      name: config.name,
      color: config.color,
      key,
      sentiment: config.sentiment,
    };
  }

  return {
    name: 'Other',
    color: CATEGORY_PALETTE.other,
    key: 'other',
    sentiment: 'neutral',
  };
}
