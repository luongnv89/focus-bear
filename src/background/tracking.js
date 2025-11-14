/**
 * FocusBear Focus-Switch Tracking Module
 * Monitors tab activation and updates to track focus switches
 */

import { incrementVisit } from './storage.js';

/**
 * Extract domain and subpath from URL
 * @param {string} url - Full URL
 * @returns {{domain: string, subpath: string}|null} Parsed URL parts or null
 */
export function parseUrl(url) {
  try {
    // Skip non-http(s) URLs
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return null;
    }

    const urlObj = new URL(url);

    // Extract domain (remove www. prefix if present)
    let domain = urlObj.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }

    // Extract subpath (path without query string or hash)
    const subpath = urlObj.pathname;

    return { domain, subpath };
  } catch (error) {
    console.error('Error parsing URL:', url, error);
    return null;
  }
}

/**
 * Track that user focused on a specific tab
 * @param {number} tabId - Chrome tab ID
 */
async function trackTabFocus(tabId) {
  try {
    // Get tab details
    const tab = await chrome.tabs.get(tabId);

    // Parse URL
    const parsed = parseUrl(tab.url);
    if (!parsed) {
      return; // Skip non-trackable URLs
    }

    const { domain, subpath } = parsed;

    // Increment visit count
    const newCount = await incrementVisit(domain, subpath);

    console.log(`Focus switch recorded: ${domain}${subpath} (count: ${newCount})`);
  } catch (error) {
    // Tab might have been closed or URL inaccessible
    console.debug('Could not track tab:', error.message);
  }
}

/**
 * Initialize tab event listeners
 */
export function initializeTracking() {
  console.log('Initializing focus-switch tracking...');

  // Track when user switches to a different tab
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    console.log('Tab activated:', tabId);
    trackTabFocus(tabId);
  });

  // Track when tab URL changes (navigation within tab)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only track when URL actually changes and tab is active
    if (changeInfo.url && tab.active) {
      console.log('Tab updated with new URL:', tabId, changeInfo.url);
      trackTabFocus(tabId);
    }
  });

  console.log('Focus-switch tracking initialized');
}

/**
 * Get current active tab and track it
 * Useful for initial extension load
 */
export async function trackCurrentTab() {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (activeTab) {
      await trackTabFocus(activeTab.id);
    }
  } catch (error) {
    console.error('Error tracking current tab:', error);
  }
}
