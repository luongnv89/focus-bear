/**
 * Notification System for FocusBear
 * Handles motivational notifications, limit warnings, and achievement celebrations
 */

import { getLimits, normalizeLimitConfig } from './storage.js';
import { ACHIEVEMENTS } from './achievements.js';

// Notification types
export const NOTIFICATION_TYPES = {
  LIMIT_WARNING: 'limit_warning',
  LIMIT_EXCEEDED: 'limit_exceeded',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  INSIGHT: 'insight',
  ENCOURAGEMENT: 'encouragement',
  STREAK_MILESTONE: 'streak_milestone',
};

// Default notification preferences
const DEFAULT_PREFERENCES = {
  enabled: true,
  types: {
    [NOTIFICATION_TYPES.LIMIT_WARNING]: true,
    [NOTIFICATION_TYPES.LIMIT_EXCEEDED]: true,
    [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: true,
    [NOTIFICATION_TYPES.INSIGHT]: true,
    [NOTIFICATION_TYPES.ENCOURAGEMENT]: true,
    [NOTIFICATION_TYPES.STREAK_MILESTONE]: true,
  },
  quietHours: {
    enabled: false,
    start: 22, // 10 PM
    end: 8, // 8 AM
  },
  maxPerDay: 5,
};

/**
 * Get notification preferences
 */
export async function getNotificationPreferences() {
  const { notificationPreferences } = await chrome.storage.local.get('notificationPreferences');
  return notificationPreferences || DEFAULT_PREFERENCES;
}

/**
 * Set notification preferences
 */
export async function setNotificationPreferences(preferences) {
  await chrome.storage.local.set({ notificationPreferences: preferences });
}

/**
 * Check if notifications are allowed at the current time
 */
async function canSendNotification(type) {
  const preferences = await getNotificationPreferences();

  // Check if notifications are globally enabled
  if (!preferences.enabled) return false;

  // Check if this notification type is enabled
  if (!preferences.types[type]) return false;

  // Check quiet hours
  if (preferences.quietHours.enabled) {
    const now = new Date();
    const currentHour = now.getHours();
    const { start } = preferences.quietHours;
    const { end } = preferences.quietHours;

    // Handle quiet hours that span midnight
    if (start > end) {
      if (currentHour >= start || currentHour < end) {
        return false;
      }
    } else if (currentHour >= start && currentHour < end) {
      return false;
    }
  }

  // Check daily limit
  const { notificationHistory = [] } = await chrome.storage.local.get('notificationHistory');
  const today = new Date().toISOString().split('T')[0];
  const todayNotifications = notificationHistory.filter((n) => n.date === today);

  if (todayNotifications.length >= preferences.maxPerDay) {
    return false;
  }

  return true;
}

/**
 * Record a notification in history
 */
async function recordNotification(type, message) {
  const { notificationHistory = [] } = await chrome.storage.local.get('notificationHistory');

  const notification = {
    type,
    message,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
  };

  notificationHistory.push(notification);

  // Keep only last 50 notifications
  if (notificationHistory.length > 50) {
    notificationHistory.splice(0, notificationHistory.length - 50);
  }

  await chrome.storage.local.set({ notificationHistory });
}

/**
 * Show a Chrome notification
 */
async function showChromeNotification(title, message, type, iconUrl = '../../assets/icon.svg') {
  const canSend = await canSendNotification(type);
  if (!canSend) return;

  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl,
      title,
      message,
      priority: 2,
    });

    await recordNotification(type, `${title}: ${message}`);
  } catch (error) {
    console.error('[Notifications] Failed to show notification:', error);
  }
}

/**
 * Show limit warning notification
 */
export async function showLimitWarning(domain, remaining, limit) {
  const title = '⚠️ Limit Warning';
  const message = `${remaining} visits left on ${domain} today (limit: ${limit})`;

  await showChromeNotification(title, message, NOTIFICATION_TYPES.LIMIT_WARNING);
}

/**
 * Show limit exceeded notification
 */
export async function showLimitExceeded(domain, count, limit) {
  const title = '🚫 Limit Exceeded';
  const message = `You've exceeded your ${domain} limit (${count}/${limit} visits today)`;

  await showChromeNotification(title, message, NOTIFICATION_TYPES.LIMIT_EXCEEDED);
}

/**
 * Show achievement unlocked notification
 */
export async function showAchievementUnlocked(achievementId) {
  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return;

  const title = '🏆 Achievement Unlocked!';
  const message = `${achievement.icon} ${achievement.name}: ${achievement.description}`;

  await showChromeNotification(title, message, NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED);
}

/**
 * Show streak milestone notification
 */
export async function showStreakMilestone(days) {
  const title = '🔥 Streak Milestone!';
  const message = `Amazing! You've maintained a ${days}-day streak staying under all limits!`;

  await showChromeNotification(title, message, NOTIFICATION_TYPES.STREAK_MILESTONE);
}

/**
 * Show encouragement notification
 */
export async function showEncouragement() {
  const encouragements = [
    'Great focus today! Keep it up! 🎯',
    "You're doing amazing! Stay focused! 💪",
    'Excellent progress! Your focus is improving! ✨',
    "Way to go! You're building great habits! 🌟",
    'Fantastic! Your discipline is paying off! 🚀',
    "Keep going! You're on the right track! 🎉",
  ];

  const message = encouragements[Math.floor(Math.random() * encouragements.length)];
  const title = 'FocusBear';

  await showChromeNotification(title, message, NOTIFICATION_TYPES.ENCOURAGEMENT);
}

/**
 * Show insight notification
 */
export async function showInsight(insight) {
  const title = '💡 Focus Insight';
  await showChromeNotification(title, insight, NOTIFICATION_TYPES.INSIGHT);
}

/**
 * Get notification history
 */
export async function getNotificationHistory() {
  const { notificationHistory = [] } = await chrome.storage.local.get('notificationHistory');
  return notificationHistory.reverse(); // Most recent first
}

/**
 * Clear notification history
 */
export async function clearNotificationHistory() {
  await chrome.storage.local.set({ notificationHistory: [] });
}

/**
 * Initialize notification system
 */
export async function initializeNotifications() {
  // Ensure preferences exist
  const preferences = await getNotificationPreferences();
  if (!preferences.enabled && preferences.enabled !== false) {
    await setNotificationPreferences(DEFAULT_PREFERENCES);
  }

  // Request notification permission if not already granted
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.error('[Notifications] Failed to request permission:', error);
    }
  }
}

/**
 * Check if limit warning should be shown (when user is close to limit)
 */
export async function checkLimitWarnings(domain, currentCount) {
  const limits = await getLimits();
  const limitConfig = limits[domain];

  if (!limitConfig || !limitConfig.enabled) return;

  const dailyLimit = limitConfig.daily.limit;
  const remaining = dailyLimit - currentCount;

  // Show warning when 2 visits remaining
  if (remaining === 2) {
    await showLimitWarning(domain, remaining, dailyLimit);
  }
}

/**
 * Show daily encouragement (once per day if user is doing well)
 */
export async function showDailyEncouragement() {
  const { lastEncouragementDate } = await chrome.storage.local.get('lastEncouragementDate');
  const today = new Date().toISOString().split('T')[0];

  // Only show once per day
  if (lastEncouragementDate === today) return;

  // Check if user is doing well (no limits exceeded today)
  const { visits = {}, limits: rawLimits = {} } = await chrome.storage.local.get([
    'visits',
    'limits',
  ]);
  const todayVisits = visits[today] || {};
  const limits = Object.fromEntries(
    Object.entries(rawLimits).map(([d, cfg]) => [d, normalizeLimitConfig(cfg)]),
  );

  const activeLimits = Object.entries(limits).filter(
    ([, limitConfig]) => limitConfig?.enabled && limitConfig.daily?.limit,
  );
  const exceededAny = activeLimits.some(([domain, limitConfig]) => {
    const visitCount = todayVisits[domain]?.count || 0;
    return visitCount > limitConfig.daily.limit;
  });

  // Only show encouragement if user hasn't exceeded any limits
  if (!exceededAny && Object.keys(limits).length > 0) {
    await showEncouragement();
    await chrome.storage.local.set({ lastEncouragementDate: today });
  }
}
