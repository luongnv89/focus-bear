/**
 * Tests for storage module
 * Tests focus tracking, aggregation, and badge calculation logic
 */

import {
  getTodayKey,
  incrementVisit,
  getAggregatedStats,
  calculateFocusHeroBadges,
  createDefaultLimitConfig,
  deleteDomainData,
} from '../src/background/storage.js';

// Mock chrome.storage.local
global.chrome = {
  storage: {
    local: {
      data: {},
      get(keys, callback) {
        if (keys === null || keys === undefined) {
          callback(this.data);
        } else if (Array.isArray(keys)) {
          const result = {};
          keys.forEach((key) => {
            if (this.data[key] !== undefined) {
              result[key] = this.data[key];
            }
          });
          callback(result);
        } else {
          callback({ [keys]: this.data[keys] });
        }
      },
      set(items, callback) {
        Object.assign(this.data, items);
        if (callback) callback();
      },
      clear(callback) {
        this.data = {};
        if (callback) callback();
      },
    },
  },
};

describe('Storage Module', () => {
  beforeEach(() => {
    // Clear storage before each test
    chrome.storage.local.data = {};
  });

  describe('getTodayKey', () => {
    test('returns date in YYYY-MM-DD format', () => {
      const dateKey = getTodayKey();
      expect(dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('returns today\'s date', () => {
      const today = new Date();
      const expected = today.toISOString().split('T')[0];
      expect(getTodayKey()).toBe(expected);
    });
  });

  describe('incrementVisit', () => {
    test('creates new visit entry for domain', async () => {
      const count = await incrementVisit('example.com');
      expect(count).toBe(1);

      const visits = chrome.storage.local.data.visits;
      const todayKey = getTodayKey();
      expect(visits[todayKey]['example.com'].count).toBe(1);
    });

    test('increments existing domain count', async () => {
      await incrementVisit('example.com');
      await incrementVisit('example.com');
      const count = await incrementVisit('example.com');

      expect(count).toBe(3);
    });

    test('tracks subpath visits separately', async () => {
      await incrementVisit('reddit.com', '/r/programming');
      await incrementVisit('reddit.com', '/r/programming');
      await incrementVisit('reddit.com', '/r/javascript');

      const visits = chrome.storage.local.data.visits;
      const todayKey = getTodayKey();
      const redditData = visits[todayKey]['reddit.com'];

      expect(redditData.count).toBe(3);
      expect(redditData.subpaths['/r/programming'].count).toBe(2);
      expect(redditData.subpaths['/r/javascript'].count).toBe(1);
    });

    test('stores lastVisit timestamp', async () => {
      const before = Date.now();
      await incrementVisit('example.com');
      const after = Date.now();

      const visits = chrome.storage.local.data.visits;
      const todayKey = getTodayKey();
      const lastVisit = visits[todayKey]['example.com'].lastVisit;

      expect(lastVisit).toBeGreaterThanOrEqual(before);
      expect(lastVisit).toBeLessThanOrEqual(after);
    });
  });

  describe('getAggregatedStats', () => {
    beforeEach(async () => {
      // Set up test data for multiple days
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const todayKey = today.toISOString().split('T')[0];
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      const twoDaysAgoKey = twoDaysAgo.toISOString().split('T')[0];

      chrome.storage.local.data.visits = {
        [todayKey]: {
          'example.com': { count: 5, lastVisit: Date.now(), subpaths: {} },
          'twitter.com': { count: 10, lastVisit: Date.now(), subpaths: {} },
        },
        [yesterdayKey]: {
          'example.com': { count: 3, lastVisit: Date.now() - 86400000, subpaths: {} },
          'facebook.com': { count: 7, lastVisit: Date.now() - 86400000, subpaths: {} },
        },
        [twoDaysAgoKey]: {
          'example.com': { count: 2, lastVisit: Date.now() - 172800000, subpaths: {} },
        },
      };
    });

    test('aggregates today\'s visits', async () => {
      const stats = await getAggregatedStats('today');
      expect(stats['example.com'].count).toBe(5);
      expect(stats['twitter.com'].count).toBe(10);
      expect(stats['facebook.com']).toBeUndefined();
    });

    test('aggregates week\'s visits', async () => {
      const stats = await getAggregatedStats('week');
      expect(stats['example.com'].count).toBe(10); // 5 + 3 + 2
      expect(stats['twitter.com'].count).toBe(10);
      expect(stats['facebook.com'].count).toBe(7);
    });

    test('handles empty visits gracefully', async () => {
      chrome.storage.local.data.visits = {};
      const stats = await getAggregatedStats('today');
      expect(Object.keys(stats).length).toBe(0);
    });

    test('aggregates subpaths correctly', async () => {
      const todayKey = getTodayKey();
      chrome.storage.local.data.visits = {
        [todayKey]: {
          'reddit.com': {
            count: 5,
            lastVisit: Date.now(),
            subpaths: {
              '/r/programming': { count: 3, lastVisit: Date.now() },
              '/r/javascript': { count: 2, lastVisit: Date.now() },
            },
          },
        },
      };

      const stats = await getAggregatedStats('today');
      expect(stats['reddit.com'].subpaths['/r/programming'].count).toBe(3);
      expect(stats['reddit.com'].subpaths['/r/javascript'].count).toBe(2);
    });
  });

  describe('calculateFocusHeroBadges', () => {
    beforeEach(() => {
      // Set up test data with limits
      const buildDailyLimit = (limit) =>
        createDefaultLimitConfig({
          fiveHour: { enabled: false, limit: 10 },
          daily: { enabled: true, limit },
        });

      chrome.storage.local.data.limits = {
        'example.com': buildDailyLimit(10),
        'twitter.com': buildDailyLimit(5),
      };
    });

    test('awards badge for 3+ consecutive days under limit', async () => {
      const today = new Date();
      const visits = {};

      // Create 3 days of data under limit (function checks 7 days, missing days count as 0)
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        visits[dateKey] = {
          'example.com': { count: 8, lastVisit: Date.now(), subpaths: {} }, // Under limit of 10
        };
      }

      chrome.storage.local.data.visits = visits;

      const badges = await calculateFocusHeroBadges();
      expect(badges['example.com']).toBeDefined();
      expect(badges['example.com'].earned).toBe(true);
      // Function checks 7 days, missing days count as 0 (under limit), so streak is 7
      expect(badges['example.com'].streak).toBe(7);
    });

    test('still awards badge when some days have no data (treated as 0 visits)', async () => {
      const today = new Date();
      const visits = {};

      // Create only 2 days of data under limit, other 5 days missing (counted as 0)
      for (let i = 0; i < 2; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        visits[dateKey] = {
          'example.com': { count: 8, lastVisit: Date.now(), subpaths: {} },
        };
      }

      chrome.storage.local.data.visits = visits;

      const badges = await calculateFocusHeroBadges();
      // Missing days count as 0 visits (under limit), so 7 consecutive days under limit
      expect(badges['example.com']).toBeDefined();
      expect(badges['example.com'].streak).toBe(7);
    });

    test('breaks streak when limit is exceeded', async () => {
      const today = new Date();
      const visits = {};

      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const count = i === 2 ? 15 : 8; // Exceed limit on day 2
        visits[dateKey] = {
          'example.com': { count, lastVisit: Date.now(), subpaths: {} },
        };
      }

      chrome.storage.local.data.visits = visits;

      const badges = await calculateFocusHeroBadges();
      // Should only count days 0 and 1 (2 days), not enough for badge
      expect(badges['example.com']).toBeUndefined();
    });

    test('calculates correct streak length', async () => {
      const today = new Date();
      const visits = {};

      // Create 5 days of data under limit (+ 2 missing days = 7 total)
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        visits[dateKey] = {
          'twitter.com': { count: 4, lastVisit: Date.now(), subpaths: {} }, // Under limit of 5
        };
      }

      chrome.storage.local.data.visits = visits;

      const badges = await calculateFocusHeroBadges();
      // 5 days with data + 2 missing days (counted as 0) = 7 days streak
      expect(badges['twitter.com'].streak).toBe(7);
    });

    test('handles missing visit data gracefully', async () => {
      chrome.storage.local.data.visits = {};

      const badges = await calculateFocusHeroBadges();
      // Should still award badge if no visits (under limit by default)
      expect(badges['example.com']).toBeDefined();
      expect(badges['twitter.com']).toBeDefined();
    });

    test('only checks domains with limits', async () => {
      const todayKey = getTodayKey();
      chrome.storage.local.data.visits = {
        [todayKey]: {
          'no-limit-site.com': { count: 100, lastVisit: Date.now(), subpaths: {} },
        },
      };

      const badges = await calculateFocusHeroBadges();
      expect(badges['no-limit-site.com']).toBeUndefined();
    });
  });

  describe('deleteDomainData', () => {
    test('removes visits and limits for the specified domain', async () => {
      const today = getTodayKey();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      chrome.storage.local.data = {
        visits: {
          [today]: {
            'example.com': { count: 5, lastVisit: Date.now(), subpaths: {} },
            'other.com': { count: 2, lastVisit: Date.now(), subpaths: {} },
          },
          [yesterday]: {
            'example.com': { count: 3, lastVisit: Date.now() - 86400000, subpaths: {} },
          },
        },
        limits: {
          'example.com': createDefaultLimitConfig(),
          'other.com': createDefaultLimitConfig({ daily: { enabled: true, limit: 5 } }),
        },
      };

      await deleteDomainData('example.com');

      expect(chrome.storage.local.data.limits['example.com']).toBeUndefined();
      expect(chrome.storage.local.data.limits['other.com']).toBeDefined();
      expect(chrome.storage.local.data.visits[today]['example.com']).toBeUndefined();
      expect(chrome.storage.local.data.visits[today]['other.com']).toBeDefined();
      expect(chrome.storage.local.data.visits[yesterday]).toBeUndefined();
    });
  });
});
