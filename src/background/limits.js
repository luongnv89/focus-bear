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
 * Initialize limit enforcement via webRequest
 */
export function initializeLimitEnforcement() {
  // Listen for navigation requests
  chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
      // Only intercept main frame navigations (not iframes, images, etc.)
      if (details.type !== 'main_frame') {
        return {};
      }

      // Don't block our own blocked page
      if (details.url.includes('blocked.html')) {
        return {};
      }

      // Parse URL to get domain
      try {
        const url = new URL(details.url);
        let domain = url.hostname;

        // Remove www. prefix
        if (domain.startsWith('www.')) {
          domain = domain.substring(4);
        }

        // Check limit
        const { exceeded, count, limit } = await checkLimit(domain);

        if (exceeded) {
          console.log(`Blocking ${domain} - limit exceeded (${count}/${limit})`);

          // Redirect to blocked page
          return {
            redirectUrl: getBlockedPageUrl(domain, count, limit),
          };
        }
      } catch (error) {
        console.error('Error checking limit:', error);
      }

      return {};
    },
    { urls: ['<all_urls>'] },
    ['blocking'],
  );

  console.log('Limit enforcement initialized');
}
