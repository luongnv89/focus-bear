/**
 * Achievement System for FocusPaw
 * Tracks and unlocks achievements based on user behavior
 */

import { calculateOverallStreak } from './storage.js';
import { getTodayKey } from '../common/date-utils.js';

function getTotalVisitCount(visits) {
  return Object.values(visits).reduce((total, dayData) => {
    const dayTotal = Object.values(dayData).reduce(
      (acc, visitData) => acc + (visitData.count || 0),
      0,
    );
    return total + dayTotal;
  }, 0);
}

function calculateConsecutiveDays(dates) {
  if (dates.length === 0) return 0;

  let maxConsecutive = 1;
  let currentConsecutive = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      currentConsecutive += 1;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
  }

  return Math.max(maxConsecutive, currentConsecutive);
}

// Achievement definitions
export const ACHIEVEMENTS = {
  // Streak-based achievements
  'first-step': {
    id: 'first-step',
    name: 'First Step',
    description: 'Set your first domain limit',
    icon: '🎯',
    category: 'milestone',
    check: async () => {
      const { limits = {} } = await chrome.storage.local.get('limits');
      return Object.keys(limits).length >= 1;
    },
  },

  'three-day-streak': {
    id: 'three-day-streak',
    name: 'Building Momentum',
    description: 'Stay under all limits for 3 days in a row',
    icon: '🔥',
    category: 'streak',
    check: async () => {
      const overallStreak = await calculateOverallStreak();
      return overallStreak.current >= 3;
    },
  },

  'week-streak': {
    id: 'week-streak',
    name: 'On Fire',
    description: 'Stay under all limits for 7 days in a row',
    icon: '🔥',
    category: 'streak',
    check: async () => {
      const overallStreak = await calculateOverallStreak();
      return overallStreak.current >= 7;
    },
  },

  'month-streak': {
    id: 'month-streak',
    name: 'Master of Focus',
    description: 'Stay under all limits for 30 days in a row',
    icon: '🏆',
    category: 'streak',
    check: async () => {
      const overallStreak = await calculateOverallStreak();
      return overallStreak.current >= 30;
    },
  },

  // Goal-based achievements
  'five-limits': {
    id: 'five-limits',
    name: 'Getting Serious',
    description: 'Set limits on 5 different domains',
    icon: '📊',
    category: 'goal',
    check: async () => {
      const { limits = {} } = await chrome.storage.local.get('limits');
      return Object.keys(limits).length >= 5;
    },
  },

  'ten-limits': {
    id: 'ten-limits',
    name: 'Power User',
    description: 'Set limits on 10 different domains',
    icon: '⚡',
    category: 'goal',
    check: async () => {
      const { limits = {} } = await chrome.storage.local.get('limits');
      return Object.keys(limits).length >= 10;
    },
  },

  // Challenge-based achievements
  'zero-violations': {
    id: 'zero-violations',
    name: 'Perfect Day',
    description: 'Zero limit violations for a whole day',
    icon: '✨',
    category: 'challenge',
    check: async () => {
      const { visits = {}, limits = {} } = await chrome.storage.local.get(['visits', 'limits']);
      const today = getTodayKey();
      const todayVisits = visits[today] || {};

      const enabledLimits = Object.entries(limits).filter(
        ([, limitConfig]) => limitConfig?.enabled && limitConfig.daily?.limit,
      );

      const hasViolation = enabledLimits.some(([domain, limitConfig]) => {
        const visitCount = todayVisits[domain]?.count || 0;
        return visitCount > limitConfig.daily.limit;
      });

      return enabledLimits.length > 0 && !hasViolation;
    },
  },

  'lightning-focus': {
    id: 'lightning-focus',
    name: 'Lightning Focus',
    description: 'Visit only 5 or fewer domains in a day',
    icon: '⚡',
    category: 'challenge',
    check: async () => {
      const { visits = {} } = await chrome.storage.local.get('visits');
      const today = getTodayKey();
      const todayVisits = visits[today] || {};
      const domainCount = Object.keys(todayVisits).length;
      return domainCount > 0 && domainCount <= 5;
    },
  },

  // Milestone-based achievements
  'hundred-visits': {
    id: 'hundred-visits',
    name: 'Self-Aware',
    description: 'Track 100 focus switches',
    icon: '👁️',
    category: 'milestone',
    check: async () => {
      const { visits = {} } = await chrome.storage.local.get('visits');
      return getTotalVisitCount(visits) >= 100;
    },
  },

  'thousand-visits': {
    id: 'thousand-visits',
    name: 'Data Collector',
    description: 'Track 1000 focus switches',
    icon: '📈',
    category: 'milestone',
    check: async () => {
      const { visits = {} } = await chrome.storage.local.get('visits');
      return getTotalVisitCount(visits) >= 1000;
    },
  },

  'week-warrior': {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Use FocusPaw for 7 consecutive days',
    icon: '🗓️',
    category: 'milestone',
    check: async () => {
      const { visits = {} } = await chrome.storage.local.get('visits');
      const dates = Object.keys(visits).sort();

      if (dates.length < 7) return false;

      // Check for 7 consecutive days
      const consecutiveDays = calculateConsecutiveDays(dates);
      return consecutiveDays >= 7;
    },
  },
};

/**
 * Check all achievements and return newly unlocked ones
 * @returns {Promise<Array>} Array of newly unlocked achievement IDs
 */
export async function checkAchievements() {
  const stored = await chrome.storage.local.get('achievements');
  const achievements = stored.achievements || { unlocked: [], progress: {} };

  const entries = Object.entries(ACHIEVEMENTS);
  const unlockedResults = await Promise.all(
    entries.map(async ([achievementId, achievementDef]) => {
      if (achievements.unlocked.includes(achievementId)) {
        return null;
      }

      const isUnlocked = await achievementDef.check();
      if (!isUnlocked) return null;

      const progress = achievements.progress[achievementId] || {};
      progress.unlockedAt = new Date().toISOString();
      achievements.progress[achievementId] = progress;
      achievements.unlocked.push(achievementId);

      return achievementId;
    }),
  );

  const newlyUnlocked = unlockedResults.filter(Boolean);

  if (newlyUnlocked.length > 0) {
    await chrome.storage.local.set({ achievements });
  }

  return newlyUnlocked;
}

/**
 * Get progress towards an achievement
 * @param {string} achievementId - The achievement ID
 * @returns {Promise<Object>} Progress object with current/target values
 */
export async function getAchievementProgress(achievementId) {
  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return null;

  // Different progress calculations based on achievement type
  switch (achievementId) {
    case 'first-step':
    case 'five-limits':
    case 'ten-limits': {
      const { limits = {} } = await chrome.storage.local.get('limits');
      const current = Object.keys(limits).length;
      const targets = { 'first-step': 1, 'five-limits': 5, 'ten-limits': 10 };
      return { current, target: targets[achievementId] };
    }

    case 'three-day-streak':
    case 'week-streak':
    case 'month-streak': {
      const overallStreak = await calculateOverallStreak();
      const targets = { 'three-day-streak': 3, 'week-streak': 7, 'month-streak': 30 };
      return { current: overallStreak.current, target: targets[achievementId] };
    }

    case 'hundred-visits':
    case 'thousand-visits': {
      const { visits = {} } = await chrome.storage.local.get('visits');
      const totalVisits = getTotalVisitCount(visits);
      const targets = { 'hundred-visits': 100, 'thousand-visits': 1000 };
      return { current: totalVisits, target: targets[achievementId] };
    }

    case 'week-warrior': {
      const { visits = {} } = await chrome.storage.local.get('visits');
      const dates = Object.keys(visits).sort();

      return { current: calculateConsecutiveDays(dates), target: 7 };
    }

    default: {
      // For challenge-based achievements, just return 0/1
      const isComplete = await achievement.check();
      return { current: isComplete ? 1 : 0, target: 1 };
    }
  }
}

/**
 * Get all achievements with their unlock status
 * @returns {Promise<Array>} Array of achievement objects with unlock status
 */
export async function getAllAchievements() {
  const stored = await chrome.storage.local.get('achievements');
  const achievements = stored.achievements || { unlocked: [], progress: {} };

  const achievementsList = await Promise.all(
    Object.entries(ACHIEVEMENTS).map(async ([achievementId, achievementDef]) => {
      const isUnlocked = achievements.unlocked.includes(achievementId);
      const progress = await getAchievementProgress(achievementId);

      return {
        ...achievementDef,
        unlocked: isUnlocked,
        progress,
        unlockedAt: achievements.progress[achievementId]?.unlockedAt || null,
      };
    }),
  );

  // Sort: unlocked first (by unlock date), then by category
  achievementsList.sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    if (a.unlocked && b.unlocked) {
      return new Date(b.unlockedAt) - new Date(a.unlockedAt);
    }
    return a.category.localeCompare(b.category);
  });

  return achievementsList;
}

/**
 * Initialize achievement system (call when extension loads)
 */
export async function initializeAchievements() {
  const { achievements } = await chrome.storage.local.get('achievements');

  if (!achievements) {
    await chrome.storage.local.set({
      achievements: {
        unlocked: [],
        progress: {},
      },
    });
  }
}
