/**
 * FocusBear Limits Enforcement Module
 * Handles per-site time-based limits (5-hour and daily) and blocking
 */

import { getTodayKey, normalizeLimitConfig } from './storage.js';

function getNextActiveLimit(normalizedConfig, fiveHourCount, dailyCount) {
  const candidates = [];
  if (normalizedConfig.fiveHour.enabled) {
    candidates.push({
      type: 'fiveHour',
      limit: normalizedConfig.fiveHour.limit,
      count: fiveHourCount,
      remaining: normalizedConfig.fiveHour.limit - fiveHourCount,
    });
  }
  if (normalizedConfig.daily.enabled) {
    candidates.push({
      type: 'daily',
      limit: normalizedConfig.daily.limit,
      count: dailyCount,
      remaining: normalizedConfig.daily.limit - dailyCount,
    });
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => a.remaining - b.remaining);
  return candidates[0];
}

/**
 * Count visits within a time window
 * @param {Array<number>} timestamps - Array of visit timestamps
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} Number of visits within the window
 */
function countVisitsInWindow(timestamps, windowMs) {
  if (!timestamps || !Array.isArray(timestamps)) {
    return 0;
  }

  const now = Date.now();
  const windowStart = now - windowMs;

  return timestamps.filter((ts) => ts >= windowStart).length;
}

/**
 * Check if domain has exceeded its limits (5-hour or daily)
 * @param {string} domain - Domain name
 * @returns {Promise<{
 *   exceeded: boolean,
 *   count: number,
 *   limit: number|null,
 *   limitType: string|null,
 *   fiveHourCount: number,
 *   dailyCount: number,
 * }>}
 */
export async function checkLimit(domain) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['visits', 'limits'], (data) => {
      const visits = data.visits || {};
      const limits = data.limits || {};

      const todayKey = getTodayKey();
      const todayVisits = visits[todayKey] || {};
      const domainVisits = todayVisits[domain];
      const dailyCount = domainVisits ? domainVisits.count : 0;
      const timestamps = domainVisits ? domainVisits.timestamps || [] : [];

      let limitConfig = limits[domain];

      // No limit set = unlimited
      if (!limitConfig) {
        resolve({
          exceeded: false,
          count: dailyCount,
          limit: null,
          limitType: null,
          fiveHourCount: 0,
          dailyCount,
        });
        return;
      }

      // Normalize legacy format
      limitConfig = normalizeLimitConfig(limitConfig);

      // If limits are globally disabled for this domain
      if (!limitConfig.enabled) {
        resolve({
          exceeded: false,
          count: dailyCount,
          limit: null,
          limitType: null,
          fiveHourCount: 0,
          dailyCount,
        });
        return;
      }

      // Check 5-hour window limit
      const fiveHourMs = 5 * 60 * 60 * 1000;
      const fiveHourCount = countVisitsInWindow(timestamps, fiveHourMs);

      if (limitConfig.fiveHour.enabled && fiveHourCount >= limitConfig.fiveHour.limit) {
        resolve({
          exceeded: true,
          count: fiveHourCount,
          limit: limitConfig.fiveHour.limit,
          limitType: 'fiveHour',
          fiveHourCount,
          dailyCount,
        });
        return;
      }

      // Check daily limit
      if (limitConfig.daily.enabled && dailyCount >= limitConfig.daily.limit) {
        resolve({
          exceeded: true,
          count: dailyCount,
          limit: limitConfig.daily.limit,
          limitType: 'daily',
          fiveHourCount,
          dailyCount,
        });
        return;
      }

      const nextLimit = getNextActiveLimit(limitConfig, fiveHourCount, dailyCount);

      // No limits exceeded
      resolve({
        exceeded: false,
        count: nextLimit ? nextLimit.count : dailyCount,
        limit: nextLimit ? nextLimit.limit : null,
        limitType: nextLimit ? nextLimit.type : null,
        fiveHourCount,
        dailyCount,
      });
    });
  });
}

/**
 * Get blocked page URL with params
 * @param {string} domain - Domain name
 * @param {number} count - Current visit count
 * @param {number} limit - Visit limit
 * @param {string} limitType - Type of limit exceeded ('fiveHour' or 'daily')
 * @returns {string} Blocked page URL
 */
export function getBlockedPageUrl(domain, count, limit, limitType = 'daily') {
  const blockedPageUrl = chrome.runtime.getURL('src/blocked/blocked.html');
  const params = new URLSearchParams({
    domain,
    count: count.toString(),
    limit: limit.toString(),
    limitType,
  });
  return `${blockedPageUrl}?${params.toString()}`;
}

/**
 * Update declarativeNetRequest rules based on current limits and visit counts
 * This replaces the blocking webRequest API which is deprecated in MV3
 */
export async function updateBlockingRules() {
  try {
    const data = await chrome.storage.local.get(['visits', 'limits']);
    const visits = data.visits || {};
    const limits = data.limits || {};
    const todayKey = getTodayKey();
    const todayVisits = visits[todayKey] || {};

    // Get all currently blocked domains
    const blockedDomains = [];

    Object.entries(limits).forEach(([domain, limitConfig]) => {
      const domainVisits = todayVisits[domain];
      const dailyCount = domainVisits ? domainVisits.count : 0;
      const timestamps = domainVisits ? domainVisits.timestamps || [] : [];

      // Normalize legacy format
      const normalizedConfig = normalizeLimitConfig(limitConfig);

      // Skip if limits are disabled
      if (!normalizedConfig.enabled) {
        return;
      }

      // Check 5-hour window
      const fiveHourMs = 5 * 60 * 60 * 1000;
      const fiveHourCount = countVisitsInWindow(timestamps, fiveHourMs);

      if (normalizedConfig.fiveHour.enabled && fiveHourCount >= normalizedConfig.fiveHour.limit) {
        blockedDomains.push({
          domain,
          count: fiveHourCount,
          limit: normalizedConfig.fiveHour.limit,
          limitType: 'fiveHour',
        });
        return;
      }

      // Check daily limit
      if (normalizedConfig.daily.enabled && dailyCount >= normalizedConfig.daily.limit) {
        blockedDomains.push({
          domain,
          count: dailyCount,
          limit: normalizedConfig.daily.limit,
          limitType: 'daily',
        });
      }
    });

    // Store blocked domains info in storage for the blocked page to access
    // This is a fallback in case URL parameters don't work properly
    const blockedDomainsMap = {};
    blockedDomains.forEach((item) => {
      blockedDomainsMap[item.domain] = {
        count: item.count,
        limit: item.limit,
        limitType: item.limitType,
        blockedAt: Date.now(),
      };
    });
    await chrome.storage.local.set({ blockedDomains: blockedDomainsMap });

    // Get existing rule IDs to remove them
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map((rule) => rule.id);

    // Create new rules for blocked domains
    const newRules = blockedDomains.map((item, index) => {
      const blockedPageUrl = getBlockedPageUrl(item.domain, item.count, item.limit, item.limitType);

      return {
        id: index + 1, // Rule IDs must be positive integers
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockedPageUrl },
        },
        condition: {
          urlFilter: `*://${item.domain}/*`,
          resourceTypes: ['main_frame'],
          // Exclude our blocked page from being blocked
          excludedInitiatorDomains: [chrome.runtime.id],
        },
      };
    });

    // Also add rules for www. versions
    const wwwRules = blockedDomains.map((item, index) => {
      const blockedPageUrl = getBlockedPageUrl(item.domain, item.count, item.limit, item.limitType);

      return {
        id: index + 1 + 1000, // Offset to avoid ID collision
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockedPageUrl },
        },
        condition: {
          urlFilter: `*://www.${item.domain}/*`,
          resourceTypes: ['main_frame'],
          excludedInitiatorDomains: [chrome.runtime.id],
        },
      };
    });

    const allNewRules = [...newRules, ...wwwRules];

    // Update dynamic rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove,
      addRules: allNewRules,
    });

    console.log(`Updated blocking rules: ${blockedDomains.length} domains blocked`);
    console.log('Blocked domains stored:', Object.keys(blockedDomainsMap));
  } catch (error) {
    console.error('Error updating blocking rules:', error);
  }
}

/**
 * Initialize limit enforcement via declarativeNetRequest
 */
export function initializeLimitEnforcement() {
  // Update blocking rules on startup
  updateBlockingRules();

  console.log('Limit enforcement initialized (using declarativeNetRequest)');
}
