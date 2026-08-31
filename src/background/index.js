/**
 * FocusBear Background Service Worker
 * Entry point for the MV3 service worker
 */

import { initializeTracking, trackCurrentTab } from './tracking.js';
import { initializeLimitEnforcement } from './limits.js';
import { initializeBadge } from './badge.js';
import { initializeNotifications, showDailyEncouragement } from './notifications.js';
import { initializeAchievements } from './achievements.js';

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

// Listen for extension installation — seed first-run data only; listeners are registered top-level
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('FocusBear installed - welcome!');

    // Initialize storage with empty data (first-run seeding only)
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
});

// Initialize tracking when service worker starts
// (important for when Chrome restarts the service worker)
initializeTracking();

// Initialize limit enforcement
initializeLimitEnforcement();

// Initialize visit counter badge
initializeBadge().catch((error) => {
  console.error('Error initializing badge on startup:', error);
});

// Initialize notifications
initializeNotifications().catch((error) => {
  console.error('Error initializing notifications on startup:', error);
});

// Initialize achievements
initializeAchievements().catch((error) => {
  console.error('Error initializing achievements on startup:', error);
});

// Check for daily encouragement once per day (run on startup)
showDailyEncouragement().catch((error) => {
  console.error('Error showing daily encouragement:', error);
});

// Track current tab on startup
trackCurrentTab().catch((error) => {
  console.error('Error tracking current tab on startup:', error);
});

chrome.action.onClicked.addListener(() => {
  openDashboardTab();
});

console.log('FocusBear background service worker ready');
