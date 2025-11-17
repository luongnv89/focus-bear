/**
 * FocusBear Background Service Worker
 * Entry point for the MV3 service worker
 */

import { initializeTracking, trackCurrentTab } from './tracking.js';
import { initializeLimitEnforcement } from './limits.js';
import { initializeBadge } from './badge.js';

async function openDashboardTab() {
  const dashboardUrl = chrome.runtime.getURL('src/dashboard/index.html');
  try {
    const existingTabs = await chrome.tabs.query({ url: `${dashboardUrl}*` });
    if (existingTabs.length > 0) {
      await chrome.tabs.update(existingTabs[0].id, { active: true });
      return;
    }
    await chrome.tabs.create({ url: dashboardUrl });
  } catch (error) {
    console.error('Error opening FocusBear dashboard:', error);
  }
}

console.log('FocusBear service worker initialized');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('FocusBear installed - welcome!');

    // Initialize storage with empty data
    await chrome.storage.local.set({
      visits: {},
      limits: {},
      settings: {
        onboardingComplete: false,
        defaultTimeRange: 'today',
      },
    });

    console.log('Initial data structure created');
  } else if (details.reason === 'update') {
    console.log('FocusBear updated to version', chrome.runtime.getManifest().version);
  }

  // Initialize tracking after installation/update
  initializeTracking();
  await trackCurrentTab();

  // Initialize limit enforcement
  initializeLimitEnforcement();

  // Initialize domain counter badge
  await initializeBadge();
});

// Initialize tracking when service worker starts
// (important for when Chrome restarts the service worker)
initializeTracking();

// Initialize limit enforcement
initializeLimitEnforcement();

// Initialize domain counter badge
initializeBadge().catch((error) => {
  console.error('Error initializing badge on startup:', error);
});

// Track current tab on startup
trackCurrentTab().catch((error) => {
  console.error('Error tracking current tab on startup:', error);
});

chrome.action.onClicked.addListener(() => {
  openDashboardTab();
});

console.log('FocusBear background service worker ready');
