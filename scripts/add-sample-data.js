/**
 * Add sample data to test FocusPaw drilldown feature
 * Run this from the browser console on the extension's background page
 */

async function addSampleData() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const sampleVisits = {
    [today]: {
      'github.com': {
        count: 45,
        lastVisit: Date.now() - 1000 * 60 * 5,
        timestamps: Array(45).fill(0).map((_, i) => Date.now() - i * 60000),
        subpaths: {
          '/luongnv89/focus-bear': { count: 15, lastVisit: Date.now() - 1000 * 60 * 5 },
          '/pulls': { count: 12, lastVisit: Date.now() - 1000 * 60 * 15 },
          '/issues': { count: 8, lastVisit: Date.now() - 1000 * 60 * 30 },
          '/notifications': { count: 5, lastVisit: Date.now() - 1000 * 60 * 45 },
          '/settings': { count: 3, lastVisit: Date.now() - 1000 * 60 * 60 },
          '/explore': { count: 2, lastVisit: Date.now() - 1000 * 60 * 90 }
        }
      },
      'stackoverflow.com': {
        count: 32,
        lastVisit: Date.now() - 1000 * 60 * 10,
        timestamps: Array(32).fill(0).map((_, i) => Date.now() - i * 120000),
        subpaths: {
          '/questions/tagged/javascript': { count: 12, lastVisit: Date.now() - 1000 * 60 * 10 },
          '/questions/tagged/chrome-extension': { count: 8, lastVisit: Date.now() - 1000 * 60 * 20 },
          '/questions/tagged/d3.js': { count: 7, lastVisit: Date.now() - 1000 * 60 * 35 },
          '/users/1234567': { count: 3, lastVisit: Date.now() - 1000 * 60 * 50 },
          '/questions': { count: 2, lastVisit: Date.now() - 1000 * 60 * 70 }
        }
      },
      'reddit.com': {
        count: 28,
        lastVisit: Date.now() - 1000 * 60 * 3,
        timestamps: Array(28).fill(0).map((_, i) => Date.now() - i * 180000),
        subpaths: {
          '/r/programming': { count: 10, lastVisit: Date.now() - 1000 * 60 * 3 },
          '/r/webdev': { count: 8, lastVisit: Date.now() - 1000 * 60 * 25 },
          '/r/javascript': { count: 6, lastVisit: Date.now() - 1000 * 60 * 40 },
          '/r/coding': { count: 4, lastVisit: Date.now() - 1000 * 60 * 55 }
        }
      },
      'twitter.com': {
        count: 24,
        lastVisit: Date.now() - 1000 * 60 * 2,
        timestamps: Array(24).fill(0).map((_, i) => Date.now() - i * 150000),
        subpaths: {
          '/home': { count: 15, lastVisit: Date.now() - 1000 * 60 * 2 },
          '/notifications': { count: 5, lastVisit: Date.now() - 1000 * 60 * 18 },
          '/messages': { count: 3, lastVisit: Date.now() - 1000 * 60 * 42 },
          '/explore': { count: 1, lastVisit: Date.now() - 1000 * 60 * 65 }
        }
      },
      'youtube.com': {
        count: 18,
        lastVisit: Date.now() - 1000 * 60 * 8,
        timestamps: Array(18).fill(0).map((_, i) => Date.now() - i * 200000),
        subpaths: {
          '/watch': { count: 12, lastVisit: Date.now() - 1000 * 60 * 8 },
          '/subscriptions': { count: 4, lastVisit: Date.now() - 1000 * 60 * 28 },
          '/trending': { count: 2, lastVisit: Date.now() - 1000 * 60 * 48 }
        }
      },
      'docs.google.com': {
        count: 15,
        lastVisit: Date.now() - 1000 * 60 * 12,
        timestamps: Array(15).fill(0).map((_, i) => Date.now() - i * 240000),
        subpaths: {
          '/document/d/abc123': { count: 8, lastVisit: Date.now() - 1000 * 60 * 12 },
          '/spreadsheets/d/xyz789': { count: 5, lastVisit: Date.now() - 1000 * 60 * 32 },
          '/presentation/d/pqr456': { count: 2, lastVisit: Date.now() - 1000 * 60 * 52 }
        }
      },
      'medium.com': {
        count: 12,
        lastVisit: Date.now() - 1000 * 60 * 22,
        timestamps: Array(12).fill(0).map((_, i) => Date.now() - i * 300000),
        subpaths: {
          '/@author1/article-1': { count: 5, lastVisit: Date.now() - 1000 * 60 * 22 },
          '/@author2/article-2': { count: 4, lastVisit: Date.now() - 1000 * 60 * 42 },
          '/topic/programming': { count: 3, lastVisit: Date.now() - 1000 * 60 * 62 }
        }
      },
      'mail.google.com': {
        count: 10,
        lastVisit: Date.now() - 1000 * 60 * 6,
        timestamps: Array(10).fill(0).map((_, i) => Date.now() - i * 360000),
        subpaths: {
          '/mail/u/0/#inbox': { count: 7, lastVisit: Date.now() - 1000 * 60 * 6 },
          '/mail/u/0/#sent': { count: 2, lastVisit: Date.now() - 1000 * 60 * 36 },
          '/mail/u/0/#drafts': { count: 1, lastVisit: Date.now() - 1000 * 60 * 66 }
        }
      }
    },
    [yesterday]: {
      'github.com': {
        count: 38,
        lastVisit: Date.now() - 24 * 60 * 60 * 1000,
        timestamps: Array(38).fill(0).map((_, i) => Date.now() - 24 * 60 * 60 * 1000 - i * 60000),
        subpaths: {
          '/luongnv89/focus-bear': { count: 20, lastVisit: Date.now() - 24 * 60 * 60 * 1000 },
          '/pulls': { count: 10, lastVisit: Date.now() - 24 * 60 * 60 * 1000 - 1000 * 60 * 15 },
          '/issues': { count: 8, lastVisit: Date.now() - 24 * 60 * 60 * 1000 - 1000 * 60 * 30 }
        }
      },
      'stackoverflow.com': {
        count: 25,
        lastVisit: Date.now() - 24 * 60 * 60 * 1000,
        timestamps: Array(25).fill(0).map((_, i) => Date.now() - 24 * 60 * 60 * 1000 - i * 120000),
        subpaths: {
          '/questions/tagged/javascript': { count: 15, lastVisit: Date.now() - 24 * 60 * 60 * 1000 },
          '/questions/tagged/react': { count: 10, lastVisit: Date.now() - 24 * 60 * 60 * 1000 - 1000 * 60 * 20 }
        }
      }
    }
  };

  const sampleLimits = {
    'twitter.com': {
      enabled: true,
      fiveHour: { enabled: true, limit: 15 },
      daily: { enabled: true, limit: 30 }
    },
    'reddit.com': {
      enabled: true,
      fiveHour: { enabled: false, limit: 10 },
      daily: { enabled: true, limit: 40 }
    },
    'youtube.com': {
      enabled: true,
      fiveHour: { enabled: true, limit: 10 },
      daily: { enabled: true, limit: 25 }
    }
  };

  try {
    await chrome.storage.local.set({
      visits: sampleVisits,
      limits: sampleLimits
    });

    console.log('✅ Sample data added successfully!');
    console.log('📊 Added visits for:', Object.keys(sampleVisits[today]).length, 'domains today');
    console.log('⚙️  Added limits for:', Object.keys(sampleLimits).length, 'domains');
    console.log('🎯 Refresh your popup or dashboard to see the data!');

    return true;
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    return false;
  }
}

// Auto-run when loaded in browser console
if (typeof chrome !== 'undefined' && chrome.storage) {
  console.log('🐾 FocusPaw Sample Data Generator');
  console.log('Run: addSampleData()');
} else {
  console.error('This script must be run in the Chrome extension context');
}
