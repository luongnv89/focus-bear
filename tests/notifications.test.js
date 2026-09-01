import {
  getNotificationPreferences,
  setNotificationPreferences,
  getNotificationHistory,
  clearNotificationHistory,
  showLimitWarning,
  showLimitExceeded,
  showAchievementUnlocked,
  showStreakMilestone,
  showEncouragement,
  showInsight,
  checkLimitWarnings,
  showDailyEncouragement,
  NOTIFICATION_TYPES,
} from '../src/background/notifications.js';
import { createDefaultLimitConfig } from '../src/background/storage.js';
import { getTodayKey } from '../src/common/date-utils.js';

function makeChrome(data = {}) {
  global.chrome = {
    storage: {
      local: {
        data: { ...data },
        get(keys, cb) {
          let res = {};
          if (keys === null || keys === undefined) {
            res = this.data;
          } else if (Array.isArray(keys)) {
            res = {};
            keys.forEach((k) => {
              if (this.data[k] !== undefined) res[k] = this.data[k];
            });
          } else if (typeof keys === 'string') {
            res = { [keys]: this.data[keys] };
          } else {
            res = {};
          }
          if (typeof cb === 'function') {
            cb(res);
            return undefined;
          }
          return Promise.resolve(res);
        },
        set(items, cb) {
          Object.assign(this.data, items);
          if (typeof cb === 'function') {
            cb();
            return undefined;
          }
          return Promise.resolve();
        },
      },
    },
    notifications: {
      create: jest.fn((...args) => {
        const cb = args.find((a) => typeof a === 'function');
        if (cb) cb('id');
        return Promise.resolve('id');
      }),
    },
    runtime: {},
  };
}

describe('notifications', () => {
  beforeEach(() => {
    makeChrome();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getNotificationPreferences returns defaults when not set', async () => {
    makeChrome({});
    const prefs = await getNotificationPreferences();
    expect(prefs.enabled).toBe(true);
    expect(prefs.types[NOTIFICATION_TYPES.LIMIT_WARNING]).toBe(true);
  });

  test('set and get preferences round-trip', async () => {
    makeChrome({});
    const prefs = { enabled: false, types: {}, quietHours: { enabled: false, start: 22, end: 8 }, maxPerDay: 5 };
    await setNotificationPreferences(prefs);
    const got = await getNotificationPreferences();
    expect(got.enabled).toBe(false);
  });

  test('clearNotificationHistory empties history', async () => {
    makeChrome({ notificationHistory: [{ type: 'x', message: 'hi', date: getTodayKey(), timestamp: new Date().toISOString() }] });
    await clearNotificationHistory();
    const h = await getNotificationHistory();
    expect(h).toHaveLength(0);
  });

  test('getNotificationHistory returns reversed', async () => {
    const today = getTodayKey();
    makeChrome({
      notificationHistory: [
        { type: 'a', message: 'first', date: today, timestamp: '2025-01-01T00:00:00.000Z' },
        { type: 'b', message: 'second', date: today, timestamp: '2025-01-02T00:00:00.000Z' },
      ],
    });
    const h = await getNotificationHistory();
    expect(h[0].message).toBe('second');
    expect(h[1].message).toBe('first');
  });

  test('showLimitWarning and showLimitExceeded do not throw when disabled globally', async () => {
    makeChrome({ notificationPreferences: { enabled: false, types: { [NOTIFICATION_TYPES.LIMIT_WARNING]: true, [NOTIFICATION_TYPES.LIMIT_EXCEEDED]: true, [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: true, [NOTIFICATION_TYPES.INSIGHT]: true, [NOTIFICATION_TYPES.ENCOURAGEMENT]: true, [NOTIFICATION_TYPES.STREAK_MILESTONE]: true }, quietHours: { enabled: false, start: 22, end: 8 }, maxPerDay: 5 } });
    await expect(showLimitWarning('example.com', 2, 10)).resolves.toBeUndefined();
    await expect(showLimitExceeded('example.com', 12, 10)).resolves.toBeUndefined();
  });

  test('showAchievementUnlocked handles unknown id gracefully', async () => {
    makeChrome({});
    await expect(showAchievementUnlocked('unknown-achievement')).resolves.toBeUndefined();
  });

  test('showAchievementUnlocked shows notification for known id when allowed', async () => {
    makeChrome({ notificationPreferences: { enabled: true, types: { [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: true, [NOTIFICATION_TYPES.LIMIT_WARNING]: true, [NOTIFICATION_TYPES.LIMIT_EXCEEDED]: true, [NOTIFICATION_TYPES.INSIGHT]: true, [NOTIFICATION_TYPES.ENCOURAGEMENT]: true, [NOTIFICATION_TYPES.STREAK_MILESTONE]: true }, quietHours: { enabled: false, start: 22, end: 8 }, maxPerDay: 5 } });
    // Ensure visits not blocking daily limit check
    await showAchievementUnlocked('first-step');
    expect(global.chrome.notifications.create).toHaveBeenCalled();
  });

  test('showStreakMilestone and showInsight route through notifications', async () => {
    makeChrome({ notificationPreferences: { enabled: true, types: { [NOTIFICATION_TYPES.STREAK_MILESTONE]: true, [NOTIFICATION_TYPES.INSIGHT]: true, [NOTIFICATION_TYPES.LIMIT_WARNING]: true, [NOTIFICATION_TYPES.LIMIT_EXCEEDED]: true, [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: true, [NOTIFICATION_TYPES.ENCOURAGEMENT]: true }, quietHours: { enabled: false, start: 22, end: 8 }, maxPerDay: 5 } });
    await showStreakMilestone(7);
    await showInsight('You focus better in the morning');
    expect(global.chrome.notifications.create).toHaveBeenCalledTimes(2);
  });

  test('showEncouragement picks a message and notifies', async () => {
    makeChrome({ notificationPreferences: { enabled: true, types: { [NOTIFICATION_TYPES.ENCOURAGEMENT]: true, [NOTIFICATION_TYPES.LIMIT_WARNING]: true, [NOTIFICATION_TYPES.LIMIT_EXCEEDED]: true, [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: true, [NOTIFICATION_TYPES.INSIGHT]: true, [NOTIFICATION_TYPES.STREAK_MILESTONE]: true }, quietHours: { enabled: false, start: 22, end: 8 }, maxPerDay: 5 } });
    await showEncouragement();
    expect(global.chrome.notifications.create).toHaveBeenCalled();
  });

  test('checkLimitWarnings triggers at remaining 2', async () => {
    makeChrome({
      limits: { 'example.com': createDefaultLimitConfig({ daily: { enabled: true, limit: 10 } }) },
      notificationPreferences: { enabled: true, types: { [NOTIFICATION_TYPES.LIMIT_WARNING]: true, [NOTIFICATION_TYPES.LIMIT_EXCEEDED]: true, [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: true, [NOTIFICATION_TYPES.INSIGHT]: true, [NOTIFICATION_TYPES.ENCOURAGEMENT]: true, [NOTIFICATION_TYPES.STREAK_MILESTONE]: true }, quietHours: { enabled: false, start: 22, end: 8 }, maxPerDay: 5 },
    });
    await checkLimitWarnings('example.com', 8); // 10-8=2
    expect(global.chrome.notifications.create).toHaveBeenCalled();
  });

  test('checkLimitWarnings does not trigger when remaining !=2', async () => {
    makeChrome({
      limits: { 'example.com': createDefaultLimitConfig({ daily: { enabled: true, limit: 10 } }) },
      notificationPreferences: { enabled: true, types: { [NOTIFICATION_TYPES.LIMIT_WARNING]: true, [NOTIFICATION_TYPES.LIMIT_EXCEEDED]: true, [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: true, [NOTIFICATION_TYPES.INSIGHT]: true, [NOTIFICATION_TYPES.ENCOURAGEMENT]: true, [NOTIFICATION_TYPES.STREAK_MILESTONE]: true }, quietHours: { enabled: false, start: 22, end: 8 }, maxPerDay: 5 },
    });
    await checkLimitWarnings('example.com', 5);
    expect(global.chrome.notifications.create).not.toHaveBeenCalled();
  });

  test('showDailyEncouragement respects lastEncouragementDate', async () => {
    const today = getTodayKey();
    makeChrome({
      lastEncouragementDate: today,
      visits: { [today]: {} },
      limits: {},
      notificationPreferences: { enabled: true, types: { [NOTIFICATION_TYPES.ENCOURAGEMENT]: true, [NOTIFICATION_TYPES.LIMIT_WARNING]: true, [NOTIFICATION_TYPES.LIMIT_EXCEEDED]: true, [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: true, [NOTIFICATION_TYPES.INSIGHT]: true, [NOTIFICATION_TYPES.STREAK_MILESTONE]: true }, quietHours: { enabled: false, start: 22, end: 8 }, maxPerDay: 5 },
    });
    await showDailyEncouragement();
    expect(global.chrome.notifications.create).not.toHaveBeenCalled();
  });
});
