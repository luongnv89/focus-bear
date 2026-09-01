/**
 * FocusBear Badge Module
 * Updates extension badge with visit count
 */

import { getTodayVisitCount } from './storage.js';

// Bright green accent used as the badge background.
const FOCUS_BEAR_BADGE_COLOR = '#1BFF6E';

/**
 * Update extension badge with current visit count
 */
export async function updateVisitBadge() {
  try {
    const count = await getTodayVisitCount();
    const badgeText = count > 0 ? count.toString() : '';

    // Set badge text
    await chrome.action.setBadgeText({ text: badgeText });

    // Set badge background color using bright green accent
    await chrome.action.setBadgeBackgroundColor({ color: FOCUS_BEAR_BADGE_COLOR });

    console.log(`Badge updated: ${count} visits tracked today`);
  } catch (error) {
    console.error('Error updating visit badge:', error);
  }
}

/**
 * Initialize badge on extension startup
 */
export async function initializeBadge() {
  console.log('Initializing visit counter badge...');
  await updateVisitBadge();
  console.log('Visit counter badge initialized');
}
