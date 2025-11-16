/**
 * Tests for limits module
 * Tests limit checking and blocking logic
 */

import { checkLimit } from '../src/background/limits.js';
import { createDefaultLimitConfig } from '../src/background/storage.js';

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

const todayKey = () => new Date().toISOString().split('T')[0];

const buildDailyLimit = (limit = 10) =>
  createDefaultLimitConfig({
    fiveHour: { enabled: false, limit: 10 },
    daily: { enabled: true, limit },
  });

describe('Limits Module', () => {
  beforeEach(() => {
    chrome.storage.local.data = {};
  });

  describe('checkLimit', () => {
    test('returns exceeded=false when no limit is set', async () => {
      chrome.storage.local.data = {
        visits: {
          [todayKey()]: {
            'example.com': { count: 100, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {},
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(100);
      expect(result.limit).toBe(null);
      expect(result.limitType).toBe(null);
    });

    test('returns countdown info when under daily limit', async () => {
      chrome.storage.local.data = {
        visits: {
          [todayKey()]: {
            'example.com': {
              count: 5,
              lastVisit: Date.now(),
              subpaths: {},
              timestamps: [Date.now() - 60 * 60 * 1000],
            },
          },
        },
        limits: {
          'example.com': buildDailyLimit(10),
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(5);
      expect(result.limit).toBe(10);
      expect(result.limitType).toBe('daily');
    });

    test('returns exceeded=true when daily limit is exceeded', async () => {
      chrome.storage.local.data = {
        visits: {
          [todayKey()]: {
            'example.com': { count: 15, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': buildDailyLimit(10),
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(true);
      expect(result.count).toBe(15);
      expect(result.limit).toBe(10);
      expect(result.limitType).toBe('daily');
    });

    test('returns exceeded=true when at exact daily limit', async () => {
      chrome.storage.local.data = {
        visits: {
          [todayKey()]: {
            'example.com': { count: 10, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': buildDailyLimit(10),
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(true);
      expect(result.count).toBe(10);
      expect(result.limit).toBe(10);
      expect(result.limitType).toBe('daily');
    });

    test('handles missing visit data', async () => {
      chrome.storage.local.data = {
        visits: {},
        limits: {
          'example.com': buildDailyLimit(12),
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(0);
      expect(result.limit).toBe(12);
      expect(result.limitType).toBe('daily');
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
          'example.com': buildDailyLimit(10),
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.count).toBe(0);
      expect(result.limit).toBe(10);
      expect(result.limitType).toBe('daily');
    });

    test('detects five-hour limit breaches before daily limit', async () => {
      const now = Date.now();
      chrome.storage.local.data = {
        visits: {
          [todayKey()]: {
            'example.com': {
              count: 50,
              lastVisit: now,
              subpaths: {},
              timestamps: [now - 60 * 60 * 1000, now - 30 * 60 * 1000],
            },
          },
        },
        limits: {
          'example.com': createDefaultLimitConfig({
            fiveHour: { enabled: true, limit: 2 },
            daily: { enabled: true, limit: 100 },
          }),
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(true);
      expect(result.limitType).toBe('fiveHour');
      expect(result.limit).toBe(2);
      expect(result.count).toBe(2);
    });

    test('returns countdown info for five-hour limit when under threshold', async () => {
      const now = Date.now();
      chrome.storage.local.data = {
        visits: {
          [todayKey()]: {
            'example.com': {
              count: 3,
              lastVisit: now,
              subpaths: {},
              timestamps: [now - 30 * 60 * 1000, now - 4 * 60 * 60 * 1000, now - 7 * 60 * 60 * 1000],
            },
          },
        },
        limits: {
          'example.com': createDefaultLimitConfig({
            fiveHour: { enabled: true, limit: 5 },
            daily: { enabled: false, limit: 20 },
          }),
        },
      };

      const result = await checkLimit('example.com');
      expect(result.exceeded).toBe(false);
      expect(result.limitType).toBe('fiveHour');
      expect(result.limit).toBe(5);
      expect(result.count).toBe(2); // Only timestamps inside last 5 hours
    });

    test('supports legacy numeric limits', async () => {
      chrome.storage.local.data = {
        visits: {
          [todayKey()]: {
            'example.com': { count: 4, lastVisit: Date.now(), subpaths: {} },
          },
        },
        limits: {
          'example.com': 7,
        },
      };

      const result = await checkLimit('example.com');
      expect(result.limit).toBe(7);
      expect(result.limitType).toBe('daily');
    });
  });
});
