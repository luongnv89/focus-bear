/**
 * FocusBear UX Copy & Localization Module
 * All user-facing strings in one place for easy management and future i18n
 *
 * Future: Replace with proper i18n library when adding multiple languages
 */

export const COPY = {
  // General
  appName: 'FocusBear',
  tagline: 'Your attention, mapped with empathy.',

  // Empty State
  emptyState: {
    heading: 'Hey there, focus explorer!',
    message: 'FocusBear is ready to map your browsing habits—but first, you need to browse a bit!',
    howItWorks: 'How it works:',
    steps: [
      '📍 Every time you switch tabs, we track which site gets your attention',
      '📊 Your data becomes a beautiful radial graph (like planets orbiting you!)',
      '🎯 Set limits on distracting sites to stay focused',
      '🔒 Everything stays private—on your device, forever',
    ],
    cta: "Go ahead, open some tabs! We'll be here when you get back.",
  },

  // Time Ranges
  timeRanges: {
    today: 'Today',
    week: 'Week',
    month: 'Month',
    hour: 'Last Hour',
  },

  titles: {
    today: "Today's Focus Switches",
    week: "This Week's Focus Switches",
    month: "This Month's Focus Switches",
    hour: "Last Hour's Focus Switches",
  },

  // Settings
  settings: {
    title: 'FocusBear Settings',
    eyebrow: 'Control center',
    backButton: '← Back',

    // Limits Section
    limits: {
      title: 'Per-site daily limits',
      subtitle:
        "Cap visits to distracting sites. We'll redirect you to the bear wall when you hit the limit.",
      domainLabel: 'Domain',
      domainPlaceholder: 'example.com',
      limitLabel: 'Daily visits allowed',
      limitPlaceholder: '15',
      saveButton: 'Save limit',
      activeLimitsLabel: 'Active limits',
      noLimitsYet: 'No limits yet. Add one above.',
      removeButton: 'Remove',
      visitsPerDay: (limit) => `${limit} visits/day`,
      errorInvalidDomain: 'Enter a valid domain like example.com',
      errorInvalidLimit: 'Enter a positive visit limit.',
    },

    // Accessibility Section
    accessibility: {
      title: 'Accessibility',
      subtitle: 'Make FocusBear friendlier for sensitive eyes.',
      highContrastLabel: 'High contrast mode',
      highContrastDescription: 'Boost contrast for text and cards.',
    },

    // Data Management Section
    dataManagement: {
      title: 'Data management',
      subtitle: 'FocusBear stores everything locally. You can reset anytime.',
      resetButton: 'Reset all focus data',
      confirmReset: 'Tap again to confirm reset',
    },

    // Toast Messages
    toasts: {
      limitSaved: (domain) => `Limit saved for ${domain}`,
      limitRemoved: (domain) => `Removed limit for ${domain}`,
      highContrastEnabled: 'High contrast mode enabled',
      highContrastDisabled: 'High contrast mode disabled',
      dataCleared: 'All focus data cleared.',
      errorSavingLimit: 'Unable to save that limit.',
      errorRemovingLimit: 'Unable to remove that limit.',
      errorUpdatingSettings: 'Unable to update accessibility setting.',
      errorResettingData: 'Unable to reset data. Try again.',
      confirmResetPrompt: 'Tap again to confirm reset.',
    },
  },

  // Blocked Page
  blockedPage: {
    messages: [
      {
        heading: 'Whoa there, friend!',
        subtext: "Maybe it's time for a breather? Your focus bear thinks so.",
      },
      {
        heading: 'Hold up! 🐾',
        subtext: 'Your brain deserves a break from this rabbit hole. How about a walk?',
      },
      {
        heading: 'Limit reached! 🎯',
        subtext: "You set this limit for a reason. Future you says 'thank you!'",
      },
      {
        heading: 'Nope, not today! 🚫',
        subtext: 'This site has had enough of your time today. Go do something awesome!',
      },
      {
        heading: 'Bear wall activated! 🐻',
        subtext: "Time to redirect that focus energy elsewhere. You've got this!",
      },
      {
        heading: 'Your limit, your rules! 📏',
        subtext: "You decided this boundary. Stick with it - you'll thank yourself later.",
      },
    ],
    limitReached: (domain) => `You've hit your daily limit for <strong>${domain}</strong>.`,
    stats: {
      visitsLabel: 'Visits today:',
      limitLabel: 'Limit:',
    },
    buttons: {
      backToWork: 'Back to work',
      adjustLimits: 'Adjust limits',
    },
    footer: 'Reset happens at midnight. You got this! 💪',
    settingsHelp: {
      title: 'To adjust limits:',
      steps: [
        'Click the FocusBear icon in your toolbar',
        'Click the ⚙️ settings button',
        'Configure your limits',
      ],
      alt: 'Or right-click the FocusBear icon and select "Options".',
    },
  },

  // Toast Notifications (Content Script)
  countdownToast: {
    limitReached: (domain) => `<strong>${domain}</strong><br/>Limit reached for today`,
    oneVisitLeft: (domain) => `<strong>${domain}</strong><br/>1 visit left today`,
    visitsLeft: (domain, remaining) => {
      const visitsText = `${remaining} visits left today`;
      return `<strong>${domain}</strong><br/>${visitsText}`;
    },
  },

  // Graph
  graph: {
    centerNode: 'You',
    noData: 'No data to visualize yet',
    errorLoading: 'Visualization library not loaded',
    errorGeneral: 'Error loading visualization',
  },

  // Privacy
  privacy: {
    localOnly: 'Data never leaves your device.',
  },

  // Aria Labels
  aria: {
    settings: 'Settings',
    refreshData: 'Refresh data',
    backToDashboard: 'Back to dashboard',
    bearMascot: 'Bear mascot',
    bearMascotWaving: 'Bear mascot waving',
    visitStatistics: 'Visit statistics',
    visitCount: 'Visit count',
    limitValue: 'Limit value',
    goBackToPreviousPage: 'Go back to previous page',
    openSettingsToAdjustLimits: 'Open settings to adjust limits',
    removeLimit: (domain) => `Remove limit for ${domain}`,
    timeRangeFilter: 'Time range filter',
  },
};

/**
 * Get a random blocked page message
 * @returns {Object} Message with heading and subtext
 */
export function getRandomBlockedMessage() {
  const { messages } = COPY.blockedPage;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get countdown toast message based on remaining visits
 * @param {string} domain - Domain name
 * @param {number} remaining - Visits remaining
 * @returns {string} Formatted HTML message
 */
export function getCountdownToastMessage(domain, remaining) {
  if (remaining === 0) {
    return COPY.countdownToast.limitReached(domain);
  }
  if (remaining === 1) {
    return COPY.countdownToast.oneVisitLeft(domain);
  }
  return COPY.countdownToast.visitsLeft(domain, remaining);
}

/**
 * Get title for time range
 * @param {string} range - Time range key
 * @returns {string} Title
 */
export function getTitleForRange(range) {
  return COPY.titles[range] || COPY.titles.today;
}
