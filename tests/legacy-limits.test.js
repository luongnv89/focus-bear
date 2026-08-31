/**
 * Regression tests for legacy numeric limit handling (Task 0.2)
 * Ensures numeric limits like { "example.com": 10 } normalize correctly
 * and do not throw in checkLimitWarnings or focus-score paths.
 */

import { normalizeLimitConfig, getLimits } from '../src/background/storage.js';
import { checkLimitWarnings } from '../src/background/notifications.js';
import { calculateDailyFocusScore, getFocusScoreBreakdown } from '../src/background/focus-score.js';

// Mock chrome.storage.local for all tests
function mockStorage(data) {
  global.chrome = {
    storage: {
      local: {
        data: { ...data },
        get(keys, cb) {
          const result = (() => {
            if (keys === null || keys === undefined) return this.data;
            if (Array.isArray(keys)) {
              const res = {};
              keys.forEach((k) => {
                if (this.data[k] !== undefined) res[k] = this.data[k];
              });
              return res;
            }
            if (typeof keys === 'string') return { [keys]: this.data[keys] };
            const res = {};
            Object.keys(keys || {}).forEach((k) => {
              if (this.data[k] !== undefined) res[k] = this.data[k];
            });
            return res;
          })();
          if (typeof cb === 'function') {
            cb(result);
            return;
          }
          return Promise.resolve(result);
        },
        set(items, cb) {
          Object.assign(this.data, items);
          if (typeof cb === 'function') cb();
          else return Promise.resolve();
        },
        clear(cb) {
          this.data = {};
          if (typeof cb === 'function') cb();
          else return Promise.resolve();
        },
      },
      onChanged: { addListener: jest.fn() },
    },
    tabs: {
      onActivated: { addListener: jest.fn() },
      onUpdated: { addListener: jest.fn() },
    },
    runtime: {
      onInstalled: { addListener: jest.fn() },
      getURL: (p) => `chrome-extension://test/${p}`,
      getManifest: () => ({ version: '0.2.0' }),
      id: 'test-id',
    },
    action: {
      onClicked: { addListener: jest.fn() },
      setBadgeText: jest.fn().mockResolvedValue(),
      setBadgeBackgroundColor: jest.fn().mockResolvedValue(),
    },
    declarativeNetRequest: {
      updateDynamicRules: jest.fn().mockResolvedValue(),
      getDynamicRules: jest.fn().mockResolvedValue([]),
    },
    notifications: { create: jest.fn().mockResolvedValue() },
  };
}

describe('Legacy numeric limit normalization', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('normalizeLimitConfig converts number to daily limit config', () => {
    const cfg = normalizeLimitConfig(10);
    expect(cfg.enabled).toBe(true);
    expect(cfg.daily.enabled).toBe(true);
    expect(cfg.daily.limit).toBe(10);
    expect(cfg.fiveHour.enabled).toBe(true); // default from createDefaultLimitConfig
  });

  test('getLimits normalizes legacy numeric limits at getter boundary', async () => {
    mockStorage({ limits: { 'example.com': 10, 'other.com': { enabled: true, daily: { enabled: true, limit: 5 }, fiveHour: { enabled: false, limit: 10 } } } });
    const limits = await getLimits();
    expect(limits['example.com'].daily.limit).toBe(10);
    expect(limits['example.com'].enabled).toBe(true);
    expect(limits['other.com'].daily.limit).toBe(5);
  });

  test('checkLimitWarnings does not throw for legacy numeric limit', async () => {
    mockStorage({
      limits: { 'example.com': 10 },
      visits: {},
      notificationPreferences: { enabled: false, types: {}, quietHours: { enabled: false }, maxPerDay: 5 },
    });
    await expect(checkLimitWarnings('example.com', 8)).resolves.not.toThrow();
    await expect(checkLimitWarnings('example.com', 10)).resolves.not.toThrow();
  });

  test('calculateDailyFocusScore does not throw for legacy numeric limit', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockStorage({
      visits: { [today]: { 'example.com': { count: 5, lastVisit: Date.now(), timestamps: [], subpaths: {} } } },
      limits: { 'example.com': 10 },
      overallStreak: { current: 1, best: 1 },
    });
    await expect(calculateDailyFocusScore(today)).resolves.not.toThrow();
    const score = await calculateDailyFocusScore(today);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('getFocusScoreBreakdown does not throw for legacy numeric limit', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockStorage({
      visits: { [today]: { 'example.com': { count: 12, lastVisit: Date.now(), timestamps: [], subpaths: {} } } },
      limits: { 'example.com': 10 },
      overallStreak: { current: 0, best: 0 },
    });
    await expect(getFocusScoreBreakdown(today)).resolves.not.toThrow();
  });

  test('storage streak helpers handle legacy numeric limit without throw', async () => {
    const { calculateLimitStreak, calculateOverallStreak } = await import('../src/background/storage.js');
    const today = new Date().toISOString().split('T')[0];
    mockStorage({
      visits: { [today]: { 'example.com': { count: 5, lastVisit: Date.now(), timestamps: [], subpaths: {} } } },
      limits: { 'example.com': 10 },
      streaks: {},
      overallStreak: { current: 0, best: 0 },
    });
    await expect(calculateLimitStreak('example.com')).resolves.not.toThrow();
    await expect(calculateOverallStreak()).resolves.not.toThrow();
  });
});

describe('Service worker listener single registration (Task 0.2)', () => {
  test('initializeTracking appears exactly once statically in background/index.js', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.join(process.cwd(), 'src/background/index.js'), 'utf8');
    const matches = content.match(/initializeTracking\(\)/g) || [];
    // Should be exactly one top-level call (not inside onInstalled)
    expect(matches.length).toBe(1);
    // Ensure not inside onInstalled handler
    const onInstalledSection = content.split('chrome.runtime.onInstalled.addListener')[1]?.split('});')[0] || '';
    expect(onInstalledSection).not.toMatch(/initializeTracking/);
  });
});
