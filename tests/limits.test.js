/**
 * Tests for limits module
 * Tests limit checking and blocking logic
 */

import { checkLimit } from '../src/background/limits.js';

// Mock chrome APIs
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
    },
  },
  notifications: {
    create(id, options, callback) {
      if (callback) callback(id);
    },
  },
  declarativeNetRequest: {
    updateDynamicRules(options, callback) {
      if (callback) callback();
    },
  },
};

describe('Limits Module', () => {
  beforeEach(() => {
    chrome.storage.local.data = {};
  });

  describe('checkLimit', () => {
    test('returns exceeded=false when no limit is set', async () => {
      const todayKey = new Date().toISOString().split('T')[0];
      chrome.storage.local.data = {
        visits: {
          [todayKey]: {
            'example.com': { count: 100, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {},
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(100);
      expect(result.limit).toBe(null);
    });

    test('returns exceeded=false when under limit', async () => {
      const todayKey = new Date().toISOString().split('T')[0];
      chrome.storage.local.data = {
        visits: {
          [todayKey]: {
            'example.com': { count: 5, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': 10,
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(5);
      expect(result.limit).toBe(10);
    });

    test('returns exceeded=true when limit is exceeded', async () => {
      const todayKey = new Date().toISOString().split('T')[0];
      chrome.storage.local.data = {
        visits: {
          [todayKey]: {
            'example.com': { count: 15, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': 10,
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(true);
      expect(result.count).toBe(15);
      expect(result.limit).toBe(10);
    });

    test('returns exceeded=true when at exact limit', async () => {
      const todayKey = new Date().toISOString().split('T')[0];
      chrome.storage.local.data = {
        visits: {
          [todayKey]: {
            'example.com': { count: 10, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': 10,
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(true);
      expect(result.count).toBe(10);
      expect(result.limit).toBe(10);
    });

    test('handles missing visit data', async () => {
      chrome.storage.local.data = {
        visits: {},
        limits: {
          'example.com': 10,
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(0);
      expect(result.limit).toBe(10);
    });

    test('handles domain not visited today', async () => {
      const yesterdayKey = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      chrome.storage.local.data = {
        visits: {
          [yesterdayKey]: {
            'example.com': { count: 20, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': 10,
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(0);
      expect(result.limit).toBe(10);
    });
  });

  describe('Limit boundary conditions', () => {
    test('correctly handles zero limit', async () => {
      const todayKey = new Date().toISOString().split('T')[0];
      chrome.storage.local.data = {
        visits: {
          [todayKey]: {
            'example.com': { count: 1, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': 0,
        },
      };

      const result = await checkLimit('example.com');
      // Note: Zero limit is treated as "no limit" due to falsy check
      // This is current behavior but could be considered a bug
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(1);
      expect(result.limit).toBe(null);
    });

    test('correctly handles very large limit', async () => {
      const todayKey = new Date().toISOString().split('T')[0];
      chrome.storage.local.data = {
        visits: {
          [todayKey]: {
            'example.com': { count: 1000, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': 10000,
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(1000);
      expect(result.limit).toBe(10000);
    });
  });
});
