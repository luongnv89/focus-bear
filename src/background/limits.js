/**
 * FocusBear Limits Enforcement Module
 * Handles per-site daily limits and blocking
 */

import { getTodayKey } from './storage.js';

/**
 * Check if domain has exceeded its daily limit
 * @param {string} domain - Domain name
 * @returns {Promise<{exceeded: boolean, count: number, limit: number|null}>}
 */
export async function checkLimit(domain) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['visits', 'limits'], (data) => {
      const visits = data.visits || {};
      const limits = data.limits || {};

      const todayKey = getTodayKey();
      const todayVisits = visits[todayKey] || {};
      const domainVisits = todayVisits[domain];
      const count = domainVisits ? domainVisits.count : 0;
      const limit = limits[domain];

      // No limit set = unlimited
      if (!limit) {
        resolve({ exceeded: false, count, limit: null });
        return;
      }

      // Check if exceeded
      const exceeded = count >= limit;
      resolve({ exceeded, count, limit });
    });
  });
}

/**
 * Get blocked page URL with params
 * @param {string} domain - Domain name
 * @param {number} count - Current visit count
 * @param {number} limit - Visit limit
 * @returns {string} Blocked page URL
 */
export function getBlockedPageUrl(domain, count, limit) {
  const blockedPageUrl = chrome.runtime.getURL('src/blocked/blocked.html');
  const params = new URLSearchParams({
    domain,
    count: count.toString(),
    limit: limit.toString(),
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
    for (const domain in limits) {
      const limit = limits[domain];
      const domainVisits = todayVisits[domain];
      const count = domainVisits ? domainVisits.count : 0;

      if (count >= limit) {
        blockedDomains.push({ domain, count, limit });
      }
    }

    // Get existing rule IDs to remove them
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map(rule => rule.id);

    // Create new rules for blocked domains
    const newRules = blockedDomains.map((item, index) => {
      const blockedPageUrl = getBlockedPageUrl(item.domain, item.count, item.limit);

      return {
        id: index + 1, // Rule IDs must be positive integers
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockedPageUrl }
        },
        condition: {
          urlFilter: `*://${item.domain}/*`,
          resourceTypes: ['main_frame'],
          // Exclude our blocked page from being blocked
          excludedInitiatorDomains: [chrome.runtime.id]
        }
      };
    });

    // Also add rules for www. versions
    const wwwRules = blockedDomains.map((item, index) => {
      const blockedPageUrl = getBlockedPageUrl(item.domain, item.count, item.limit);

      return {
        id: index + 1 + 1000, // Offset to avoid ID collision
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockedPageUrl }
        },
        condition: {
          urlFilter: `*://www.${item.domain}/*`,
          resourceTypes: ['main_frame'],
          excludedInitiatorDomains: [chrome.runtime.id]
        }
      };
    });

    const allNewRules = [...newRules, ...wwwRules];

    // Update dynamic rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove,
      addRules: allNewRules
    });

    console.log(`Updated blocking rules: ${blockedDomains.length} domains blocked`);
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
