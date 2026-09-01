/**
 * Focus Score Algorithm for FocusBear
 * Calculates a daily/weekly focus score based on user behavior
 * Optimized for single-pass history (3.2): one storage read + memoized streak
 */

import { computeOverallStreakFromData, normalizeLimitConfig } from './storage.js';
// eslint-disable-next-line object-curly-newline
import { getDateKey, getTodayKey, getDateRange, getPreviousDates } from '../common/date-utils.js';

function getDayTotalVisits(dayData = {}) {
  return Object.values(dayData).reduce((sum, visitData) => sum + (visitData.count || 0), 0);
}

function getAverageVisitsForDates(visits, dates) {
  if (dates.length === 0) return 0;

  const totalVisits = dates.reduce((sum, dateKey) => {
    const dayVisits = visits[dateKey] || {};
    return sum + getDayTotalVisits(dayVisits);
  }, 0);

  return totalVisits / dates.length;
}

function getCompliantDomainCount(enabledLimits, dayVisits) {
  return enabledLimits.reduce((count, [domain, limitConfig]) => {
    const visitCount = dayVisits[domain]?.count || 0;
    return visitCount <= limitConfig.daily.limit ? count + 1 : count;
  }, 0);
}

/**
 * Pure helper: compute daily focus score from preloaded data
 * @param {string} date - YYYY-MM-DD
 * @param {Object} visits - all visits keyed by date
 * @param {Object} limits - normalized limits keyed by domain
 * @param {number} streakDays - current streak length
 * @returns {number} score 0-100
 */
export function calculateDailyFocusScoreWithData(date, visits, limits, streakDays) {
  const dayVisits = visits[date] || {};
  const enabledLimits = Object.entries(limits).filter(([, config]) => config.enabled);

  // Factor 1: Limits Compliance (40 points)
  let complianceScore = 0;
  if (enabledLimits.length > 0) {
    const compliantDomains = getCompliantDomainCount(enabledLimits, dayVisits);
    complianceScore = (compliantDomains / enabledLimits.length) * 40;
  } else {
    complianceScore = Object.keys(dayVisits).length > 0 ? 20 : 0;
  }

  // Factor 2: Total Visits Reduction (30 points)
  const previousDates = getPreviousDates(date, 7);
  const previousAverage = getAverageVisitsForDates(visits, previousDates);
  const todayTotal = getDayTotalVisits(dayVisits);

  let reductionScore = 0;
  if (previousAverage > 0) {
    const reduction = (previousAverage - todayTotal) / previousAverage;
    const cappedReduction = Math.max(-0.5, Math.min(0.5, reduction));
    reductionScore = (cappedReduction + 0.5) * 30;
  } else {
    reductionScore = 15;
  }

  // Factor 3: Streak Length (20 points)
  let streakScore = 0;
  if (streakDays > 0) {
    streakScore = Math.min(20, Math.log(streakDays + 1) * 8);
  }

  // Factor 4: Focus (Fewer Domains = Better) (10 points)
  const domainsVisited = Object.keys(dayVisits).length;
  let focusScore = 0;
  if (domainsVisited === 0) {
    focusScore = 0;
  } else if (domainsVisited <= 5) {
    focusScore = 10;
  } else if (domainsVisited <= 10) {
    focusScore = 7;
  } else if (domainsVisited <= 20) {
    focusScore = 5;
  } else {
    focusScore = 2;
  }

  const totalScore = Math.round(complianceScore + reductionScore + streakScore + focusScore);
  return Math.max(0, Math.min(100, totalScore));
}

/**
 * Internal: fetch visits/limits/overallStreak once and compute memoized streak.
 * Returns { visits, limits, streakDays, computedStreak, existingStreak }
 */
async function getStorageSnapshot() {
  /* eslint-disable implicit-arrow-linebreak, function-paren-newline */
  const data = await new Promise((resolve) => {
    chrome.storage.local.get(['visits', 'limits', 'overallStreak'], (result) =>
      resolve(result || {}),
    );
  });
  /* eslint-enable implicit-arrow-linebreak, function-paren-newline */
  const visits = data.visits || {};
  const rawLimits = data.limits || {};
  const limits = Object.fromEntries(
    Object.entries(rawLimits).map(([d, cfg]) => [d, normalizeLimitConfig(cfg)]),
  );
  const existingStreak = data.overallStreak || { current: 0, best: 0 };
  const computedStreak = computeOverallStreakFromData(visits, rawLimits, existingStreak);
  const streakDays = computedStreak.current || 0;

  // Memoized write: only persist when current/best actually changed
  // prettier-ignore
  if (computedStreak.current !== existingStreak.current || computedStreak.best !== existingStreak.best) {
    await new Promise((resolve) => {
      chrome.storage.local.set({ overallStreak: computedStreak }, () => resolve());
    });
  }

  return {
    visits,
    limits,
    streakDays,
    computedStreak,
    existingStreak,
  };
}

/**
 * Calculate focus score for a specific date
 * Score is 0-100 based on multiple factors:
 * - Limits compliance (40%)
 * - Total visits reduction (30%)
 * - Streak length (20%)
 * - Domains visited (10%)
 *
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number>} Focus score (0-100)
 */
export async function calculateDailyFocusScore(date) {
  const { visits, limits, streakDays } = await getStorageSnapshot();
  return calculateDailyFocusScoreWithData(date, visits, limits, streakDays);
}

/**
 * Calculate average focus score over a date range — single-pass
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<number>} Average focus score
 */
export async function calculateAverageFocusScore(startDate, endDate) {
  const dates = getDateRange(startDate, endDate);
  if (dates.length === 0) return 0;
  const { visits, limits, streakDays } = await getStorageSnapshot();
  const totalScore = dates.reduce(
    (sum, date) => sum + calculateDailyFocusScoreWithData(date, visits, limits, streakDays),
    0,
  );
  return Math.round(totalScore / dates.length);
}

/**
 * Get focus score for today — single storage read
 * @returns {Promise<number>}
 */
export async function getTodayFocusScore() {
  const today = getTodayKey();
  const { visits, limits, streakDays } = await getStorageSnapshot();
  return calculateDailyFocusScoreWithData(today, visits, limits, streakDays);
}

/**
 * Get weekly focus score (last 7 days average)
 * @returns {Promise<number>}
 */
export async function getWeeklyFocusScore() {
  const today = getTodayKey();
  const weekAgoDate = new Date();
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const weekAgo = getDateKey(weekAgoDate);
  return calculateAverageFocusScore(weekAgo, today);
}

/**
 * Get focus score history for a date range — single storage read
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Array of {date, score} objects
 */
export async function getFocusScoreHistory(days = 30) {
  const today = new Date();
  const dateStrings = Array.from({ length: days }, (_, index) => {
    const daysAgo = days - 1 - index;
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return getDateKey(date);
  });

  const { visits, limits, streakDays } = await getStorageSnapshot();

  return dateStrings.map((date) => ({
    date,
    score: calculateDailyFocusScoreWithData(date, visits, limits, streakDays),
  }));
}

/**
 * Get focus score breakdown showing contribution of each factor — single storage read
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Breakdown of score components
 */
export async function getFocusScoreBreakdown(date) {
  const { visits, limits, streakDays } = await getStorageSnapshot();
  const dayVisits = visits[date] || {};
  const enabledLimits = Object.entries(limits).filter(([, config]) => config.enabled);

  let complianceScore = 0;
  if (enabledLimits.length > 0) {
    const compliantDomains = getCompliantDomainCount(enabledLimits, dayVisits);
    complianceScore = (compliantDomains / enabledLimits.length) * 40;
  } else {
    complianceScore = Object.keys(dayVisits).length > 0 ? 20 : 0;
  }

  const previousDates = getPreviousDates(date, 7);
  const previousAverage = getAverageVisitsForDates(visits, previousDates);
  const todayTotal = getDayTotalVisits(dayVisits);
  let reductionScore = 15;
  if (previousAverage > 0) {
    const reduction = (previousAverage - todayTotal) / previousAverage;
    const cappedReduction = Math.max(-0.5, Math.min(0.5, reduction));
    reductionScore = (cappedReduction + 0.5) * 30;
  }

  let streakScore = 0;
  if (streakDays > 0) {
    streakScore = Math.min(20, Math.log(streakDays + 1) * 8);
  }

  const domainsVisited = Object.keys(dayVisits).length;
  let focusScore = 0;
  if (domainsVisited === 0) {
    focusScore = 0;
  } else if (domainsVisited <= 5) {
    focusScore = 10;
  } else if (domainsVisited <= 10) {
    focusScore = 7;
  } else if (domainsVisited <= 20) {
    focusScore = 5;
  } else {
    focusScore = 2;
  }

  const totalScore = Math.round(complianceScore + reductionScore + streakScore + focusScore);

  return {
    total: Math.max(0, Math.min(100, totalScore)),
    compliance: Math.round(complianceScore),
    reduction: Math.round(reductionScore),
    streak: Math.round(streakScore),
    focus: Math.round(focusScore),
    metadata: {
      enabledLimits: enabledLimits.length,
      domainsVisited,
      totalVisits: todayTotal,
      streakDays,
      previousAverage: Math.round(previousAverage),
    },
  };
}

// Re-export helpers for external use (keep import compatibility)
export { getPreviousDates, getDateRange };

/**
 * Get focus score trend (improving/declining/stable)
 * @returns {Promise<Object>} {trend: 'improving'|'declining'|'stable', change: number}
 */
export async function getFocusScoreTrend() {
  const history = await getFocusScoreHistory(14);

  if (history.length < 2) {
    return { trend: 'stable', change: 0 };
  }

  // Compare last 7 days vs previous 7 days
  const recentScores = history.slice(-7);
  const previousScores = history.slice(-14, -7);

  const recentAvg = recentScores.reduce((sum, h) => sum + h.score, 0) / recentScores.length;
  const previousAvg = previousScores.reduce((sum, h) => sum + h.score, 0) / previousScores.length;

  const change = Math.round(recentAvg - previousAvg);

  let trend = 'stable';
  if (change >= 5) {
    trend = 'improving';
  } else if (change <= -5) {
    trend = 'declining';
  }

  return { trend, change };
}
