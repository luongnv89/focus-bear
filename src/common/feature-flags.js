/**
 * Feature Flags for FocusBear
 * Controls which features are enabled/disabled
 */

export const FEATURES = {
  // Phase 0 - POC (Completed)
  BASIC_TRACKING: true,
  BASIC_POPUP: true,

  // Phase 1 - MVP Core (In Progress)
  RADIAL_GRAPH: true,
  TIME_FILTERS: true,
  SEARCH: true,
  LIMITS: true,
  BLOCK_PAGE: true,
  COUNTDOWN_BUBBLE: true,
  SETTINGS_PANEL: true,
  HIGH_CONTRAST: true,

  // Phase 2 - Polish & UX (Future)
  ONBOARDING: false,
  STREAKS: false,
  AVERAGES: false,

  // Phase 3 - Advanced Features (Future)
  SUBPATH_DRILLDOWN: false,
  EXPORT_PNG: false,
  EXPORT_DATA: false,
  BADGES: false,

  // Phase 4+ - Future Enhancements
  FOCUS_MODE: false,
  DARK_MODE: false,
  EVOLVING_BEAR: false,
  BLOCK_PAGE_GAMES: false,
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - Feature flag name
 * @returns {boolean} True if enabled
 */
export function isFeatureEnabled(featureName) {
  return FEATURES[featureName] === true;
}

/**
 * Get all enabled features
 * @returns {string[]} Array of enabled feature names
 */
export function getEnabledFeatures() {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}

/**
 * Get feature flag status for debugging
 * @returns {Object} All feature flags
 */
export function getAllFeatures() {
  return { ...FEATURES };
}
