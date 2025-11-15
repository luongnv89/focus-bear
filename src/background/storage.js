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
 *         subpaths: {
 *           "/path1": { count: 2, lastVisit: 1700000000000 },
 *           "/path2": { count: 3, lastVisit: 1700000000000 }
 *         }
 *       },
 *       "twitter.com": {
 *         count: 12,
 *         lastVisit: 1700000000000,
 *         subpaths: {}
 *       }
 *     }
 *   },
 *   limits: {
 *     "example.com": 10,
 *     "twitter.com": 5
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
          subpaths: {},
        };
      }

      // Increment domain count
      visits[dateKey][domain].count += 1;
      visits[dateKey][domain].lastVisit = timestamp;

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
 * @param {number|null} limit - Limit value (null for unlimited)
 * @returns {Promise<void>}
 */
export async function setLimitForDomain(domain, limit) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['limits'], (data) => {
      const limits = data.limits || {};

      if (limit === null) {
        delete limits[domain];
      } else {
        limits[domain] = limit;
      }

      chrome.storage.local.set({ limits }, resolve);
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
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      startDate = today;
      break;
    }
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default: {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      startDate = today;
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
