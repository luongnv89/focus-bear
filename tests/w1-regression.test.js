/**
 * Task 1.5: Regression + edge tests for the patched surface (W1)
 * Covers storage quota/lastError, legacy numeric limit normalization, and parseUrl boundaries.
 * Verifies the W1 advisory fixes do not regress.
 */

import {
  incrementVisit,
  normalizeLimitConfig,
  getLimits,
  setLimitForDomain,
} from '../src/background/storage.js';
import { parseUrl } from '../src/background/tracking.js';

function makeStorageMock(initial = {}) {
  const data = { ...initial };
  return {
    data,
    get(keys, cb) {
      const result = (() => {
        if (keys === null || keys === undefined) return data;
        if (Array.isArray(keys)) {
          const res = {};
          keys.forEach((k) => {
            if (data[k] !== undefined) res[k] = data[k];
          });
          return res;
        }
        if (typeof keys === 'string') return { [keys]: data[keys] };
        const res = {};
        Object.keys(keys || {}).forEach((k) => {
          if (data[k] !== undefined) res[k] = data[k];
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
      // Simulate quota error if chrome.runtime.lastError is set by test
      if (global.chrome?.runtime?.lastError) {
        if (typeof cb === 'function') cb();
        return Promise.resolve();
      }
      Object.assign(data, items);
      if (typeof cb === 'function') cb();
      else return Promise.resolve();
    },
    clear(cb) {
      Object.keys(data).forEach((k) => delete data[k]);
      if (typeof cb === 'function') cb();
      else return Promise.resolve();
    },
    onChanged: { addListener: jest.fn() },
  };
}

describe('W1 regression: storage quota/lastError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
    if (global.chrome?.runtime?.lastError) delete global.chrome.runtime.lastError;
  });

  test('incrementVisit rejects with lastError instead of silently resolving (quota path)', async () => {
    const storage = makeStorageMock({ visits: {} });
    global.chrome = {
      storage: { local: storage, onChanged: { addListener: jest.fn() } },
      runtime: {
        lastError: null,
        getURL: (p) => p,
        getManifest: () => ({ version: '0.1.0' }),
        onInstalled: { addListener: jest.fn() },
        id: 'test',
      },
      tabs: {
        onActivated: { addListener: jest.fn() },
        onUpdated: { addListener: jest.fn() },
        query: jest.fn(),
        get: jest.fn(),
      },
      action: {
        onClicked: { addListener: jest.fn() },
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
      },
      declarativeNetRequest: { updateDynamicRules: jest.fn(), getDynamicRules: jest.fn() },
      notifications: { create: jest.fn() },
    };

    // First call succeeds
    await expect(incrementVisit('example.com')).resolves.toBe(1);

    // Simulate quota exceeded — next set should reject via lastError
    global.chrome.runtime.lastError = { message: 'QUOTA_BYTES quota exceeded' };
    // Mock set to trigger lastError path: incrementVisit checks lastError after get and after set
    // We need to make get also see lastError to reject immediately
    await expect(incrementVisit('example.com')).rejects.toThrow('QUOTA_BYTES');

    delete global.chrome.runtime.lastError;
  });

  test('get path also surfaces lastError if set before get', async () => {
    const storage = makeStorageMock({ visits: {} });
    global.chrome = {
      storage: { local: storage, onChanged: { addListener: jest.fn() } },
      runtime: {
        lastError: { message: 'storage error' },
        getURL: (p) => p,
        getManifest: () => ({ version: '0.1.0' }),
        onInstalled: { addListener: jest.fn() },
        id: 'test',
      },
      tabs: {
        onActivated: { addListener: jest.fn() },
        onUpdated: { addListener: jest.fn() },
        query: jest.fn(),
        get: jest.fn(),
      },
      action: {
        onClicked: { addListener: jest.fn() },
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
      },
      declarativeNetRequest: { updateDynamicRules: jest.fn(), getDynamicRules: jest.fn() },
      notifications: { create: jest.fn() },
    };
    await expect(incrementVisit('example.com')).rejects.toThrow('storage error');
    delete global.chrome.runtime.lastError;
  });
});

describe('W1 regression: legacy numeric limits via storage getter', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  test('getLimits normalizes legacy numeric limits', async () => {
    const storage = makeStorageMock({
      limits: {
        'a.com': 10,
        'b.com': {
          enabled: true,
          daily: { enabled: true, limit: 5 },
          fiveHour: { enabled: false, limit: 10 },
        },
      },
    });
    global.chrome = {
      storage: { local: storage, onChanged: { addListener: jest.fn() } },
      runtime: {
        lastError: null,
        getURL: (p) => p,
        getManifest: () => ({ version: '0.1.0' }),
        onInstalled: { addListener: jest.fn() },
        id: 'test',
      },
      tabs: {
        onActivated: { addListener: jest.fn() },
        onUpdated: { addListener: jest.fn() },
        query: jest.fn(),
        get: jest.fn(),
      },
      action: {
        onClicked: { addListener: jest.fn() },
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
      },
      declarativeNetRequest: { updateDynamicRules: jest.fn(), getDynamicRules: jest.fn() },
      notifications: { create: jest.fn() },
    };
    const limits = await getLimits();
    expect(limits['a.com'].daily.limit).toBe(10);
    expect(limits['a.com'].enabled).toBe(true);
  });

  test('setLimitForDomain + getLimits round-trips normalized config', async () => {
    const storage = makeStorageMock({ limits: {} });
    global.chrome = {
      storage: { local: storage, onChanged: { addListener: jest.fn() } },
      runtime: {
        lastError: null,
        getURL: (p) => p,
        getManifest: () => ({ version: '0.1.0' }),
        onInstalled: { addListener: jest.fn() },
        id: 'test',
      },
      tabs: {
        onActivated: { addListener: jest.fn() },
        onUpdated: { addListener: jest.fn() },
        query: jest.fn(),
        get: jest.fn(),
      },
      action: {
        onClicked: { addListener: jest.fn() },
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
      },
      declarativeNetRequest: { updateDynamicRules: jest.fn(), getDynamicRules: jest.fn() },
      notifications: { create: jest.fn() },
    };
    await setLimitForDomain('example.com', { daily: { enabled: true, limit: 7 } });
    const limits = await getLimits();
    expect(limits['example.com'].daily.limit).toBe(7);
  });

  test('normalizeLimitConfig handles number, object, and fallback', () => {
    expect(normalizeLimitConfig(10).daily.limit).toBe(10);
    expect(
      normalizeLimitConfig({
        enabled: true,
        daily: { enabled: true, limit: 5 },
        fiveHour: { enabled: false, limit: 10 },
      }).daily.limit,
    ).toBe(5);
    expect(normalizeLimitConfig(null).enabled).toBe(true);
    expect(normalizeLimitConfig(undefined).daily.limit).toBe(20);
  });
});

describe('W1 regression: parseUrl boundary cases', () => {
  test('non-http schemes return null', () => {
    expect(parseUrl('chrome://extensions/')).toBeNull();
    expect(parseUrl('about:blank')).toBeNull();
    expect(parseUrl('file:///tmp/x.html')).toBeNull();
    expect(parseUrl('ftp://example.com')).toBeNull();
    expect(parseUrl('data:text/plain,hello')).toBeNull();
  });

  test('localhost and 127.0.0.1 return null', () => {
    expect(parseUrl('http://localhost:3000/')).toBeNull();
    expect(parseUrl('https://localhost/')).toBeNull();
    expect(parseUrl('http://127.0.0.1:8080/test')).toBeNull();
  });

  test('malformed URLs return null without throwing', () => {
    expect(parseUrl('not a url')).toBeNull();
    expect(parseUrl('http://')).toBeNull();
    expect(parseUrl('')).toBeNull();
    expect(parseUrl(null)).toBeNull();
    expect(parseUrl(undefined)).toBeNull();
    expect(parseUrl('https://')).toBeNull();
    expect(parseUrl('http://[invalid]')).toBeNull();
  });

  test('valid https with port, auth, subpath parsed correctly', () => {
    expect(parseUrl('https://user:pass@example.com:8080/secure/page?q=1#h')).toEqual({
      domain: 'example.com',
      subpath: '/secure/page',
    });
    expect(parseUrl('https://www.example.com/')).toEqual({ domain: 'example.com', subpath: '/' });
  });

  test('intl domains and IP handling', () => {
    expect(parseUrl('https://münchen.de/page')).toEqual({
      domain: 'xn--mnchen-3ya.de',
      subpath: '/page',
    });
    expect(parseUrl('https://192.168.1.1/admin')).toEqual({
      domain: '192.168.1.1',
      subpath: '/admin',
    });
  });
});
