/**
 * FocusBear Data Storage Module
 * Handles all interactions with chrome.storage.local
 *
 * Data Schema:
 * {
 *   visits: {
 *     "2025-11-14": {
 *       "example.com": {
 *         count: 5,
 *         lastVisit: 1700000000000,
 *         timestamps: [1700000000000, 1700000001000, ...],
 *         subpaths: {
 *           "/path1": { count: 2, lastVisit: 1700000000000 },
 *           "/path2": { count: 3, lastVisit: 1700000000000 }
 *         }
 *       },
 *       "twitter.com": {
 *         count: 12,
 *         lastVisit: 1700000000000,
 *         timestamps: [...],
 *         subpaths: {}
 *       }
 *     }
 *   },
 *   limits: {
 *     "example.com": {
 *       enabled: true,
 *       fiveHour: { enabled: true, limit: 10 },
 *       daily: { enabled: true, limit: 20 }
 *     },
 *     "twitter.com": {
 *       enabled: true,
 *       fiveHour: { enabled: true, limit: 10 },
 *       daily: { enabled: true, limit: 20 }
 *     }
 *   },
 *   settings: {
 *     highContrastMode: false,
 *     onboardingComplete: false
 *   }
 * }
 */

const defaultSettings = {
  highContrastMode: false,
  onboardingComplete: false,
};

const limitDefaults = {
  enabled: true,
  fiveHour: { enabled: true, limit: 10 },
  daily: { enabled: true, limit: 20 },
};

/**
 * Create a normalized limit config merged with defaults
 * @param {Object} overrides - Partial configuration to override defaults
 * @returns {Object} Normalized limit configuration
 */
export function createDefaultLimitConfig(overrides = {}) {
  return {
    enabled: overrides.enabled ?? limitDefaults.enabled,
    fiveHour: {
      enabled: overrides.fiveHour?.enabled ?? limitDefaults.fiveHour.enabled,
      limit: overrides.fiveHour?.limit ?? limitDefaults.fiveHour.limit,
    },
    daily: {
      enabled: overrides.daily?.enabled ?? limitDefaults.daily.enabled,
      limit: overrides.daily?.limit ?? limitDefaults.daily.limit,
    },
  };
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Date string
 */
export function getTodayKey() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get all stored data
 * @returns {Promise<Object>} All storage data
 */
export async function getAllData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (data) => {
      resolve(data);
    });
  });
}

/**
 * Get visits data
 * @returns {Promise<Object>} Visits object
 */
export async function getVisits() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['visits'], (data) => {
      resolve(data.visits || {});
    });
  });
}

/**
 * Get visits for a specific date
 * @param {string} dateKey - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Visits for that date
 */
export async function getVisitsForDate(dateKey) {
  const visits = await getVisits();
  return visits[dateKey] || {};
}

/**
 * Get visits for today
 * @returns {Promise<Object>} Today's visits
 */
export async function getTodayVisits() {
  return getVisitsForDate(getTodayKey());
}

/**
 * Get count of unique domains visited today
 * @returns {Promise<number>} Number of unique domains
 */
export async function getTodayDomainCount() {
  const todayVisits = await getTodayVisits();
  return Object.keys(todayVisits).length;
}

/**
 * Increment visit count for a domain
 * @param {string} domain - Domain name (e.g., "example.com")
 * @param {string} [subpath] - Optional subpath (e.g., "/page1")
 * @returns {Promise<number>} New count for domain
 */
export async function incrementVisit(domain, subpath = null) {
  const dateKey = getTodayKey();
  const timestamp = Date.now();

  return new Promise((resolve) => {
    chrome.storage.local.get(['visits'], (data) => {
      const visits = data.visits || {};

      // Initialize date if not exists
      if (!visits[dateKey]) {
        visits[dateKey] = {};
      }

      // Initialize domain if not exists
      if (!visits[dateKey][domain]) {
        visits[dateKey][domain] = {
          count: 0,
          lastVisit: timestamp,
          timestamps: [],
          subpaths: {},
        };
      }

      // Increment domain count
      visits[dateKey][domain].count += 1;
      visits[dateKey][domain].lastVisit = timestamp;

      // Store timestamp for time-window calculations
      if (!visits[dateKey][domain].timestamps) {
        visits[dateKey][domain].timestamps = [];
      }
      visits[dateKey][domain].timestamps.push(timestamp);

      // Handle subpath if provided
      if (subpath) {
        if (!visits[dateKey][domain].subpaths[subpath]) {
          visits[dateKey][domain].subpaths[subpath] = {
            count: 0,
            lastVisit: timestamp,
          };
        }
        visits[dateKey][domain].subpaths[subpath].count += 1;
        visits[dateKey][domain].subpaths[subpath].lastVisit = timestamp;
      }

      // Save to storage
      chrome.storage.local.set({ visits }, () => {
        resolve(visits[dateKey][domain].count);
      });
    });
  });
}

/**
 * Get limits configuration
 * @returns {Promise<Object>} Limits object
 */
export async function getLimits() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['limits'], (data) => {
      resolve(data.limits || {});
    });
  });
}

/**
 * Get limit for a specific domain
 * @param {string} domain - Domain name
 * @returns {Promise<number|null>} Limit or null if unlimited
 */
export async function getLimitForDomain(domain) {
  const limits = await getLimits();
  return limits[domain] || null;
}

/**
 * Set limit for a domain
 * @param {string} domain - Domain name
 * @param {Object|null} limitConfig - Limit configuration object or null for unlimited
 * @param {boolean} limitConfig.enabled - Whether limits are enabled for this domain
 * @param {Object} limitConfig.fiveHour - 5-hour window limit config
 * @param {boolean} limitConfig.fiveHour.enabled - Whether 5-hour limit is enabled
 * @param {number} limitConfig.fiveHour.limit - Number of visits allowed in 5 hours
 * @param {Object} limitConfig.daily - Daily limit config
 * @param {boolean} limitConfig.daily.enabled - Whether daily limit is enabled
 * @param {number} limitConfig.daily.limit - Number of visits allowed per day
 * @returns {Promise<void>}
 */
export async function setLimitForDomain(domain, limitConfig) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['limits'], (data) => {
      const limits = data.limits || {};

      if (limitConfig === null) {
        delete limits[domain];
      } else {
        limits[domain] = createDefaultLimitConfig(limitConfig);
      }

      chrome.storage.local.set({ limits }, resolve);
    });
  });
}

/**
 * Normalize legacy limit format to new format
 * Converts old number-based limits to new object-based format
 * @param {number|Object} limit - Legacy number or new object format
 * @returns {Object} Normalized limit configuration
 */
export function normalizeLimitConfig(limit) {
  // If already in new format, return as-is
  if (typeof limit === 'object' && limit !== null && limit.enabled !== undefined) {
    return createDefaultLimitConfig(limit);
  }

  // If legacy number format, convert to new format
  if (typeof limit === 'number') {
    return createDefaultLimitConfig({
      daily: { enabled: true, limit },
    });
  }

  // Default config
  return createDefaultLimitConfig();
}

/**
 * Delete all visit data and limits for a specific domain
 * @param {string} domain - Domain name to delete
 * @returns {Promise<void>}
 */
export async function deleteDomainData(domain) {
  if (!domain) return;

  return new Promise((resolve) => {
    chrome.storage.local.get(['visits', 'limits'], (data) => {
      const visits = data.visits || {};
      const limits = data.limits || {};

      Object.keys(visits).forEach((dateKey) => {
        if (visits[dateKey]?.[domain]) {
          delete visits[dateKey][domain];
          if (Object.keys(visits[dateKey]).length === 0) {
            delete visits[dateKey];
          }
        }
      });

      if (limits[domain]) {
        delete limits[domain];
      }

      chrome.storage.local.set({ visits, limits }, resolve);
    });
  });
}

/**
 * Get settings
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], (data) => {
      resolve(data.settings || defaultSettings);
    });
  });
}

/**
 * Update settings
 * @param {Object} newSettings - Settings to update
 * @returns {Promise<void>}
 */
export async function updateSettings(newSettings) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], (data) => {
      const settings = { ...(data.settings || {}), ...newSettings };
      chrome.storage.local.set({ settings }, resolve);
    });
  });
}

/**
 * Clear all data
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  return new Promise((resolve) => {
    chrome.storage.local.clear(resolve);
  });
}

/**
 * Get visits within a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Aggregated visits
 */
export async function getVisitsInRange(startDate, endDate) {
  const visits = await getVisits();
  const result = {};

  // Generate all date keys in range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    if (visits[dateKey]) {
      result[dateKey] = visits[dateKey];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

/**
 * Calculate "Focus Hero" badges for domains
 * A domain earns a badge if user stayed under limit for 3+ consecutive days
 * @returns {Promise<Object>} Object with domain names as keys and badge status
 */
export async function calculateFocusHeroBadges() {
  const visits = await getVisits();
  const limits = await getLimits();
  const badges = {};

  // Check last 7 days for each domain with a limit
  const today = new Date();
  const dateKeys = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    return date.toISOString().split('T')[0];
  });

  Object.keys(limits).forEach((domain) => {
    const normalizedLimit = normalizeLimitConfig(limits[domain]);

    if (!normalizedLimit.enabled || !normalizedLimit.daily.enabled) {
      return;
    }

    const dailyLimit = normalizedLimit.daily.limit;
    let consecutiveDaysUnderLimit = 0;

    // Check days in reverse chronological order
    dateKeys.some((dateKey) => {
      const dayVisits = visits[dateKey]?.[domain];
      const count = dayVisits ? dayVisits.count : 0;

      if (count <= dailyLimit) {
        consecutiveDaysUnderLimit += 1;
        return false;
      }

      return true; // streak broken
    });

    // Award badge if 3+ consecutive days under limit
    if (consecutiveDaysUnderLimit >= 3) {
      badges[domain] = {
        earned: true,
        streak: consecutiveDaysUnderLimit,
        earnedDate: getTodayKey(),
      };
    }
  });

  return badges;
}

/**
 * Get aggregated domain stats for a time range
 * @param {string} range - "hour" | "today" | "week" | "month"
 * @returns {Promise<Object>} Aggregated domain counts
 */
export async function getAggregatedStats(range = 'today') {
  const now = new Date();
  let startDate;

  switch (range) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'today': {
      const todayKey = getTodayKey();
      startDate = new Date(`${todayKey}T00:00:00.000Z`);
      break;
    }
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default: {
      const todayKey = getTodayKey();
      startDate = new Date(`${todayKey}T00:00:00.000Z`);
      break;
    }
  }

  const visits = await getVisits();
  const aggregated = {};

  // Aggregate visits across all dates in range
  Object.entries(visits).forEach(([dateKey, dateVisits]) => {
    const visitDate = new Date(dateKey);
    if (visitDate >= startDate && visitDate <= now) {
      Object.entries(dateVisits).forEach(([domain, domainData]) => {
        if (!aggregated[domain]) {
          aggregated[domain] = {
            count: 0,
            lastVisit: domainData.lastVisit,
            subpaths: {},
          };
        }
        aggregated[domain].count += domainData.count;
        if (domainData.lastVisit > aggregated[domain].lastVisit) {
          aggregated[domain].lastVisit = domainData.lastVisit;
        }

        // Aggregate subpaths
        Object.entries(domainData.subpaths || {}).forEach(([subpath, subpathData]) => {
          if (!aggregated[domain].subpaths[subpath]) {
            aggregated[domain].subpaths[subpath] = {
              count: 0,
              lastVisit: subpathData.lastVisit,
            };
          }
          aggregated[domain].subpaths[subpath].count += subpathData.count;
          if (subpathData.lastVisit > aggregated[domain].subpaths[subpath].lastVisit) {
            aggregated[domain].subpaths[subpath].lastVisit = subpathData.lastVisit;
          }
        });
      });
    }
  });

  return aggregated;
}
