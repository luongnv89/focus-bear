/**
 * FocusBear Background Service Worker
 * Entry point for the MV3 service worker
 */

import { initializeTracking, trackCurrentTab } from './tracking.js';
import { initializeLimitEnforcement } from './limits.js';

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
        highContrastMode: false,
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
});

// Initialize tracking when service worker starts
// (important for when Chrome restarts the service worker)
initializeTracking();

// Initialize limit enforcement
initializeLimitEnforcement();

// Track current tab on startup
trackCurrentTab().catch((error) => {
  console.error('Error tracking current tab on startup:', error);
});

console.log('FocusBear background service worker ready');
