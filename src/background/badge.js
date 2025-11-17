/**
 * FocusBear Badge Module
 * Updates extension badge with domain count
 */

import { getTodayDomainCount } from './storage.js';

/**
 * Update extension badge with current domain count
 */
export async function updateDomainBadge() {
  try {
    const count = await getTodayDomainCount();
    const badgeText = count > 0 ? count.toString() : '';

    // Set badge text
    await chrome.action.setBadgeText({ text: badgeText });

    // Set badge background color (Bear Blue from brand guidelines)
    await chrome.action.setBadgeBackgroundColor({ color: '#0E75B6' });

    console.log(`Badge updated: ${count} domains tracked today`);
  } catch (error) {
    console.error('Error updating domain badge:', error);
  }
}

/**
 * Initialize badge on extension startup
 */
export async function initializeBadge() {
  console.log('Initializing domain counter badge...');
  await updateDomainBadge();
  console.log('Domain counter badge initialized');
}
