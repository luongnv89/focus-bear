/**
 * Focus Score Algorithm for FocusBear
 * Calculates a daily/weekly focus score based on user behavior
 */

import { getLimits, calculateOverallStreak } from './storage.js';

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
  const { visits = {}, limits = {} } = await chrome.storage.local.get(['visits', 'limits']);
  const dayVisits = visits[date] || {};

  // Factor 1: Limits Compliance (40 points)
  let complianceScore = 0;
  const enabledLimits = Object.entries(limits).filter(([_, config]) => config.enabled);

  if (enabledLimits.length > 0) {
    let compliantDomains = 0;

    for (const [domain, limitConfig] of enabledLimits) {
      const visitData = dayVisits[domain];
      const visitCount = visitData?.count || 0;
      const dailyLimit = limitConfig.daily.limit;

      if (visitCount <= dailyLimit) {
        compliantDomains++;
      }
    }

    complianceScore = (compliantDomains / enabledLimits.length) * 40;
  } else {
    // If no limits set, give partial credit for having data
    complianceScore = Object.keys(dayVisits).length > 0 ? 20 : 0;
  }

  // Factor 2: Total Visits Reduction (30 points)
  // Compare against average of previous 7 days
  const previousDates = getPreviousDates(date, 7);
  let previousAverage = 0;

  for (const prevDate of previousDates) {
    const prevDayVisits = visits[prevDate] || {};
    const prevTotal = Object.values(prevDayVisits).reduce((sum, v) => sum + (v.count || 0), 0);
    previousAverage += prevTotal;
  }

  previousAverage = previousDates.length > 0 ? previousAverage / previousDates.length : 0;

  const todayTotal = Object.values(dayVisits).reduce((sum, v) => sum + (v.count || 0), 0);

  let reductionScore = 0;
  if (previousAverage > 0) {
    const reduction = (previousAverage - todayTotal) / previousAverage;
    // Score increases if visits decreased, decreases if increased
    // Cap at -50% to +50% change for scoring
    const cappedReduction = Math.max(-0.5, Math.min(0.5, reduction));
    reductionScore = (cappedReduction + 0.5) * 30; // Map -0.5:0.5 to 0:30
  } else {
    // First week of use, give neutral score
    reductionScore = 15;
  }

  // Factor 3: Streak Length (20 points)
  const overallStreak = await calculateOverallStreak();
  const streakDays = overallStreak.current || 0;

  // Logarithmic scaling: 1 day = 5 pts, 7 days = 15 pts, 30 days = 20 pts
  let streakScore = 0;
  if (streakDays > 0) {
    streakScore = Math.min(20, Math.log(streakDays + 1) * 8);
  }

  // Factor 4: Focus (Fewer Domains = Better) (10 points)
  const domainsVisited = Object.keys(dayVisits).length;
  let focusScore = 0;

  if (domainsVisited === 0) {
    focusScore = 0; // No activity
  } else if (domainsVisited <= 5) {
    focusScore = 10; // Excellent focus
  } else if (domainsVisited <= 10) {
    focusScore = 7; // Good focus
  } else if (domainsVisited <= 20) {
    focusScore = 5; // Moderate focus
  } else {
    focusScore = 2; // Poor focus
  }

  // Calculate total score
  const totalScore = Math.round(complianceScore + reductionScore + streakScore + focusScore);

  return Math.max(0, Math.min(100, totalScore));
}

/**
 * Calculate average focus score over a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<number>} Average focus score
 */
export async function calculateAverageFocusScore(startDate, endDate) {
  const dates = getDateRange(startDate, endDate);
  let totalScore = 0;

  for (const date of dates) {
    const score = await calculateDailyFocusScore(date);
    totalScore += score;
  }

  return dates.length > 0 ? Math.round(totalScore / dates.length) : 0;
}

/**
 * Get focus score for today
 * @returns {Promise<number>}
 */
export async function getTodayFocusScore() {
  const today = new Date().toISOString().split('T')[0];
  return await calculateDailyFocusScore(today);
}

/**
 * Get weekly focus score (last 7 days average)
 * @returns {Promise<number>}
 */
export async function getWeeklyFocusScore() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return await calculateAverageFocusScore(weekAgo, today);
}

/**
 * Get focus score history for a date range
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Array of {date, score} objects
 */
export async function getFocusScoreHistory(days = 30) {
  const history = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const score = await calculateDailyFocusScore(dateStr);
    history.push({ date: dateStr, score });
  }

  return history;
}

/**
 * Get focus score breakdown showing contribution of each factor
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Breakdown of score components
 */
export async function getFocusScoreBreakdown(date) {
  const { visits = {}, limits = {} } = await chrome.storage.local.get(['visits', 'limits']);
  const dayVisits = visits[date] || {};

  // Calculate each component
  let complianceScore = 0;
  const enabledLimits = Object.entries(limits).filter(([_, config]) => config.enabled);

  if (enabledLimits.length > 0) {
    let compliantDomains = 0;
    for (const [domain, limitConfig] of enabledLimits) {
      const visitData = dayVisits[domain];
      const visitCount = visitData?.count || 0;
      if (visitCount <= limitConfig.daily.limit) {
        compliantDomains++;
      }
    }
    complianceScore = (compliantDomains / enabledLimits.length) * 40;
  } else {
    complianceScore = Object.keys(dayVisits).length > 0 ? 20 : 0;
  }

  // Visits reduction
  const previousDates = getPreviousDates(date, 7);
  let previousAverage = 0;
  for (const prevDate of previousDates) {
    const prevDayVisits = visits[prevDate] || {};
    const prevTotal = Object.values(prevDayVisits).reduce((sum, v) => sum + (v.count || 0), 0);
    previousAverage += prevTotal;
  }
  previousAverage = previousDates.length > 0 ? previousAverage / previousDates.length : 0;

  const todayTotal = Object.values(dayVisits).reduce((sum, v) => sum + (v.count || 0), 0);
  let reductionScore = 15;
  if (previousAverage > 0) {
    const reduction = (previousAverage - todayTotal) / previousAverage;
    const cappedReduction = Math.max(-0.5, Math.min(0.5, reduction));
    reductionScore = (cappedReduction + 0.5) * 30;
  }

  // Streak
  const overallStreak = await calculateOverallStreak();
  const streakDays = overallStreak.current || 0;
  let streakScore = 0;
  if (streakDays > 0) {
    streakScore = Math.min(20, Math.log(streakDays + 1) * 8);
  }

  // Focus
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

/**
 * Helper: Get previous N dates before a given date
 */
function getPreviousDates(dateStr, count) {
  const dates = [];
  const date = new Date(dateStr);

  for (let i = 1; i <= count; i++) {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - i);
    dates.push(prevDate.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Helper: Get all dates in a range (inclusive)
 */
function getDateRange(startDateStr, endDateStr) {
  const dates = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

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
