/**
 * Daily Goal Setting for FocusBear
 * Allows users to set and track daily focus goals
 */

/**
 * Goal types
 */
export const GOAL_TYPES = {
  TOTAL_VISITS: 'total_visits', // Limit total visits across all domains
  FOCUS_SCORE: 'focus_score', // Achieve a minimum focus score
  STREAK: 'streak', // Maintain streak
  DOMAINS_VISITED: 'domains_visited', // Visit fewer than X domains
  NO_VIOLATIONS: 'no_violations', // Don't exceed any limits
  CUSTOM: 'custom', // Custom goal text
};

/**
 * Default daily goals templates
 */
const GOAL_TEMPLATES = [
  {
    id: 'total_visits_50',
    type: GOAL_TYPES.TOTAL_VISITS,
    title: 'Stay Under 50 Visits',
    description: 'Keep total focus switches under 50 today',
    target: 50,
    icon: '🎯',
  },
  {
    id: 'focus_score_80',
    type: GOAL_TYPES.FOCUS_SCORE,
    title: 'Achieve 80+ Focus Score',
    description: 'Reach a focus score of 80 or higher today',
    target: 80,
    icon: '⭐',
  },
  {
    id: 'domains_5',
    type: GOAL_TYPES.DOMAINS_VISITED,
    title: 'Visit Only 5 Domains',
    description: 'Stay focused by visiting 5 or fewer domains',
    target: 5,
    icon: '🎪',
  },
  {
    id: 'no_violations',
    type: GOAL_TYPES.NO_VIOLATIONS,
    title: 'Zero Limit Violations',
    description: 'Stay under all your limits today',
    target: 0,
    icon: '✨',
  },
  {
    id: 'maintain_streak',
    type: GOAL_TYPES.STREAK,
    title: 'Maintain Your Streak',
    description: 'Keep your focus streak alive',
    target: 1,
    icon: '🔥',
  },
];

/**
 * Get today's date key
 */
function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get all available goal templates
 */
export function getGoalTemplates() {
  return GOAL_TEMPLATES;
}

/**
 * Get today's goals
 */
export async function getTodayGoals() {
  const { dailyGoals = {} } = await chrome.storage.local.get('dailyGoals');
  const today = getTodayKey();
  return dailyGoals[today] || [];
}

/**
 * Set goals for today
 * @param {Array} goals - Array of goal objects
 */
export async function setTodayGoals(goals) {
  const { dailyGoals = {} } = await chrome.storage.local.get('dailyGoals');
  const today = getTodayKey();

  // Add metadata to each goal
  const goalsWithMetadata = goals.map((goal) => ({
    ...goal,
    setAt: new Date().toISOString(),
    completed: false,
    progress: 0,
  }));

  dailyGoals[today] = goalsWithMetadata;

  await chrome.storage.local.set({ dailyGoals });

  return goalsWithMetadata;
}

/**
 * Add a goal to today
 * @param {Object} goal - Goal object
 */
export async function addGoalToday(goal) {
  const currentGoals = await getTodayGoals();

  // Check if goal already exists
  const existingGoal = currentGoals.find((g) => g.id === goal.id);
  if (existingGoal) {
    return currentGoals;
  }

  const newGoal = {
    ...goal,
    setAt: new Date().toISOString(),
    completed: false,
    progress: 0,
  };

  currentGoals.push(newGoal);

  const { dailyGoals = {} } = await chrome.storage.local.get('dailyGoals');
  const today = getTodayKey();
  dailyGoals[today] = currentGoals;

  await chrome.storage.local.set({ dailyGoals });

  return currentGoals;
}

/**
 * Remove a goal from today
 * @param {string} goalId - Goal ID to remove
 */
export async function removeGoalFromToday(goalId) {
  const currentGoals = await getTodayGoals();
  const updatedGoals = currentGoals.filter((g) => g.id !== goalId);

  const { dailyGoals = {} } = await chrome.storage.local.get('dailyGoals');
  const today = getTodayKey();
  dailyGoals[today] = updatedGoals;

  await chrome.storage.local.set({ dailyGoals });

  return updatedGoals;
}

/**
 * Check progress on today's goals
 * @returns {Promise<Array>} Goals with updated progress
 */
export async function checkGoalProgress() {
  const goals = await getTodayGoals();
  if (goals.length === 0) return [];

  const { visits = {}, limits = {} } = await chrome.storage.local.get(['visits', 'limits']);
  const today = getTodayKey();
  const todayVisits = visits[today] || {};

  // Import focus score function dynamically to avoid circular dependency
  const { getTodayFocusScore } = await import('./focus-score.js');

  const updatedGoals = await Promise.all(
    goals.map(async (goal) => {
      let progress = 0;
      let completed = false;

      switch (goal.type) {
        case GOAL_TYPES.TOTAL_VISITS: {
          const totalVisits = Object.values(todayVisits).reduce((sum, v) => sum + (v.count || 0), 0);
          progress = totalVisits;
          completed = totalVisits <= goal.target;
          break;
        }

        case GOAL_TYPES.FOCUS_SCORE: {
          const focusScore = await getTodayFocusScore();
          progress = focusScore;
          completed = focusScore >= goal.target;
          break;
        }

        case GOAL_TYPES.DOMAINS_VISITED: {
          const domainsCount = Object.keys(todayVisits).length;
          progress = domainsCount;
          completed = domainsCount <= goal.target;
          break;
        }

        case GOAL_TYPES.NO_VIOLATIONS: {
          let violations = 0;
          for (const [domain, limitConfig] of Object.entries(limits)) {
            if (!limitConfig.enabled) continue;
            const visitData = todayVisits[domain];
            const visitCount = visitData?.count || 0;
            if (visitCount > limitConfig.daily.limit) {
              violations++;
            }
          }
          progress = violations;
          completed = violations === 0 && Object.keys(limits).length > 0;
          break;
        }

        case GOAL_TYPES.STREAK: {
          const { calculateOverallStreak } = await import('./storage.js');
          const streakData = await calculateOverallStreak();
          progress = streakData.current;
          completed = streakData.current >= goal.target;
          break;
        }

        case GOAL_TYPES.CUSTOM: {
          // Custom goals need manual completion
          completed = goal.completed || false;
          progress = completed ? 100 : 0;
          break;
        }
      }

      return {
        ...goal,
        progress,
        completed,
      };
    }),
  );

  // Update storage with new progress
  const { dailyGoals = {} } = await chrome.storage.local.get('dailyGoals');
  dailyGoals[today] = updatedGoals;
  await chrome.storage.local.set({ dailyGoals });

  return updatedGoals;
}

/**
 * Mark a custom goal as completed
 * @param {string} goalId - Goal ID
 */
export async function markGoalCompleted(goalId) {
  const goals = await getTodayGoals();
  const updatedGoals = goals.map((g) => {
    if (g.id === goalId) {
      return { ...g, completed: true, progress: 100 };
    }
    return g;
  });

  const { dailyGoals = {} } = await chrome.storage.local.get('dailyGoals');
  const today = getTodayKey();
  dailyGoals[today] = updatedGoals;

  await chrome.storage.local.set({ dailyGoals });

  return updatedGoals;
}

/**
 * Get goal completion statistics
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} Statistics
 */
export async function getGoalStats(days = 7) {
  const { dailyGoals = {} } = await chrome.storage.local.get('dailyGoals');

  let totalGoals = 0;
  let completedGoals = 0;
  const goalTypeStats = {};

  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];

    const dayGoals = dailyGoals[dateKey] || [];

    for (const goal of dayGoals) {
      totalGoals++;
      if (goal.completed) {
        completedGoals++;
      }

      if (!goalTypeStats[goal.type]) {
        goalTypeStats[goal.type] = { total: 0, completed: 0 };
      }
      goalTypeStats[goal.type].total++;
      if (goal.completed) {
        goalTypeStats[goal.type].completed++;
      }
    }
  }

  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return {
    totalGoals,
    completedGoals,
    completionRate,
    goalTypeStats,
  };
}

/**
 * Create a custom goal
 * @param {string} title - Goal title
 * @param {string} description - Goal description
 * @returns {Object} Custom goal object
 */
export function createCustomGoal(title, description = '') {
  return {
    id: `custom_${Date.now()}`,
    type: GOAL_TYPES.CUSTOM,
    title,
    description,
    target: 1,
    icon: '📝',
  };
}

/**
 * Suggest goals based on user's history
 * @returns {Promise<Array>} Suggested goals
 */
export async function suggestGoals() {
  const { visits = {}, limits = {} } = await chrome.storage.local.get(['visits', 'limits']);
  const suggestions = [];

  // Calculate average visits over last 7 days
  const last7Days = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    last7Days.push(dateKey);
  }

  let totalVisits = 0;
  let totalDomains = 0;

  for (const dateKey of last7Days) {
    const dayVisits = visits[dateKey] || {};
    totalVisits += Object.values(dayVisits).reduce((sum, v) => sum + (v.count || 0), 0);
    totalDomains += Object.keys(dayVisits).length;
  }

  const avgVisits = Math.round(totalVisits / last7Days.length);
  const avgDomains = Math.round(totalDomains / last7Days.length);

  // Suggest visit reduction
  if (avgVisits > 20) {
    const target = Math.max(20, Math.round(avgVisits * 0.8)); // 20% reduction
    suggestions.push({
      id: `total_visits_${target}`,
      type: GOAL_TYPES.TOTAL_VISITS,
      title: `Reduce to ${target} Visits`,
      description: `You averaged ${avgVisits} visits/day. Try reducing by 20%!`,
      target,
      icon: '🎯',
    });
  }

  // Suggest domain focus
  if (avgDomains > 5) {
    const target = Math.max(5, Math.round(avgDomains * 0.7)); // 30% reduction
    suggestions.push({
      id: `domains_${target}`,
      type: GOAL_TYPES.DOMAINS_VISITED,
      title: `Visit Only ${target} Domains`,
      description: `You averaged ${avgDomains} domains/day. Improve your focus!`,
      target,
      icon: '🎪',
    });
  }

  // Always suggest no violations if user has limits
  if (Object.keys(limits).length > 0) {
    suggestions.push(GOAL_TEMPLATES.find((t) => t.id === 'no_violations'));
  }

  // Suggest focus score based on recent performance
  suggestions.push({
    id: 'focus_score_improve',
    type: GOAL_TYPES.FOCUS_SCORE,
    title: 'Improve Focus Score',
    description: 'Challenge yourself to reach 75+ today',
    target: 75,
    icon: '⭐',
  });

  return suggestions.filter(Boolean);
}
