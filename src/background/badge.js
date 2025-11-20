/**
 * FocusBear Badge Module
 * Updates extension badge with visit count
 */

import { getTodayVisitCount } from './storage.js';

/**
 * Update extension badge with current visit count
 */
export async function updateVisitBadge() {
  try {
    const count = await getTodayVisitCount();
    const badgeText = count > 0 ? count.toString() : '';

    // Set badge text
    await chrome.action.setBadgeText({ text: badgeText });

    // Set badge background color (Bear Blue from brand guidelines)
    await chrome.action.setBadgeBackgroundColor({ color: '#0E75B6' });

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
