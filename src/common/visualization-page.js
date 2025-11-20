/**
 * Shared visualization controller used by both the popup and dashboard views
 */

import { renderRadialGraph } from '../popup/graph.js';
import { isFeatureEnabled } from './feature-flags.js';
import {
  updateSettings,
  getLimits,
  setLimitForDomain,
  clearAllData,
  calculateFocusHeroBadges,
  normalizeLimitConfig,
  createDefaultLimitConfig,
} from '../background/storage.js';
import { updateBlockingRules } from '../background/limits.js';

/**
 * Load aggregated stats for a given time range
 * Recreates the getAggregatedStats function from storage.js for use in the UI
 * @param {string} range
 * @returns {Promise<Object>}
 */
async function loadAggregatedStats(range = 'today') {
  const now = new Date();
  let startDate;

  switch (range) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'today': {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      startDate = today;
      break;
    }
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default: {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      startDate = today;
      break;
    }
  }

  const data = await chrome.storage.local.get(['visits']);
  const visits = data.visits || {};
  const aggregated = {};

  Object.entries(visits).forEach(([dateKey, dateVisits]) => {
    // Parse date string as local date to avoid timezone issues
    // dateKey format: "YYYY-MM-DD"
    const [year, month, day] = dateKey.split('-').map(Number);
    const visitDate = new Date(year, month - 1, day); // month is 0-indexed

    if (visitDate >= startDate && visitDate <= now) {
      Object.entries(dateVisits).forEach(([domain, domainData]) => {
        if (!aggregated[domain]) {
          aggregated[domain] = {
            count: 0,
            lastVisit: domainData.lastVisit,
            subpaths: {},
          };
        }
        aggregated[domain].count += domainData.count;
        if (domainData.lastVisit > aggregated[domain].lastVisit) {
          aggregated[domain].lastVisit = domainData.lastVisit;
        }

        Object.entries(domainData.subpaths || {}).forEach(([subpath, subpathData]) => {
          if (!aggregated[domain].subpaths[subpath]) {
            aggregated[domain].subpaths[subpath] = {
              count: 0,
              lastVisit: subpathData.lastVisit,
            };
          }
          aggregated[domain].subpaths[subpath].count += subpathData.count;
          if (subpathData.lastVisit > aggregated[domain].subpaths[subpath].lastVisit) {
            aggregated[domain].subpaths[subpath].lastVisit = subpathData.lastVisit;
          }
        });
      });
    }
  });

  return aggregated;
}

function getTitleForRange(range) {
  const titles = {
    hour: "Last Hour's Focus Switches",
    today: "Today's Focus Switches",
    week: "This Week's Focus Switches",
    month: "This Month's Focus Switches",
  };
  return titles[range] || "Today's Focus Switches";
}

/**
 * Load previous period data for comparison
 * @param {string} range - Current time range
 * @returns {Promise<Object>} - Previous period aggregated data
 */
async function loadPreviousPeriodData(range) {
  const now = new Date();
  let startDate;
  let endDate;

  switch (range) {
    case 'hour': {
      endDate = new Date(now.getTime() - 60 * 60 * 1000);
      startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
      break;
    }
    case 'today': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      startDate = yesterday;
      endDate = new Date(yesterday);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case 'week': {
      endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case 'month': {
      endDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    }
    default: {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      startDate = yesterday;
      endDate = new Date(yesterday);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
  }

  const data = await chrome.storage.local.get(['visits']);
  const visits = data.visits || {};
  const aggregated = {};

  Object.entries(visits).forEach(([dateKey, dateVisits]) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const visitDate = new Date(year, month - 1, day);

    if (visitDate >= startDate && visitDate <= endDate) {
      Object.entries(dateVisits).forEach(([domain, domainData]) => {
        if (!aggregated[domain]) {
          aggregated[domain] = { count: 0, lastVisit: domainData.lastVisit, subpaths: {} };
        }
        aggregated[domain].count += domainData.count;
        if (domainData.lastVisit > aggregated[domain].lastVisit) {
          aggregated[domain].lastVisit = domainData.lastVisit;
        }
      });
    }
  });

  return aggregated;
}

/**
 * Generate insights summary text from aggregated data
 * @param {Object} aggregatedData - Domain visit data
 * @param {Object} limits - User-configured limits
 * @param {string} range - Time range (today/week/month)
 * @param {Object} previousData - Previous period data for comparison
 * @returns {string} - Natural language summary
 */
function generateInsightsSummary(aggregatedData, limits, range, previousData = null) {
  const domains = Object.entries(aggregatedData);

  if (domains.length === 0) {
    return 'No data to analyze yet. Start browsing to see insights!';
  }

  // Sort by visit count
  const sorted = domains
    .map(([domain, data]) => ({ domain, count: data.count }))
    .sort((a, b) => b.count - a.count);

  // Get top 3 domains
  const top3 = sorted.slice(0, 3);

  // Count domains over limit (only considering enabled limits)
  let overLimitCount = 0;
  let nearLimitCount = 0;

  Object.entries(limits).forEach(([domain, limitConfig]) => {
    if (!limitConfig || !limitConfig.enabled) return;

    const domainData = aggregatedData[domain];
    if (!domainData) return;

    const { count } = domainData;
    const dailyLimit = limitConfig.daily?.limit;

    if (!dailyLimit || !limitConfig.daily.enabled) return;

    const ratio = count / dailyLimit;
    if (ratio >= 1) {
      overLimitCount += 1;
    } else if (ratio >= 0.8) {
      nearLimitCount += 1;
    }
  });

  // Build summary text
  const parts = [];

  // Range prefix
  const rangeLabels = {
    hour: 'in the last hour',
    today: 'today',
    week: 'this week',
    month: 'this month',
  };
  const rangeText = rangeLabels[range] || 'today';

  // Top distractions
  if (top3.length > 0) {
    const topList = top3
      .map((d) => `<strong class="summary-highlight">${d.domain}</strong> (${d.count} visits)`)
      .join(', ');
    const distractionsLabel = top3.length === 1 ? 'distraction' : 'distractions';
    parts.push(`Your top ${distractionsLabel} ${rangeText}: ${topList}`);
  }

  // Limit status
  if (overLimitCount > 0) {
    const domainLabel = overLimitCount === 1 ? 'domain' : 'domains';
    parts.push(
      `<span class="summary-warning">⚠️ You exceeded limits on ${overLimitCount} ${domainLabel}</span>`,
    );
  } else if (nearLimitCount > 0) {
    const domainLabel = nearLimitCount === 1 ? 'domain' : 'domains';
    parts.push(
      `<span class="summary-warning">You're approaching limits on ${nearLimitCount} ${domainLabel}</span>`,
    );
  } else if (Object.keys(limits).length > 0) {
    parts.push('<span class="summary-success">✓ All limits under control</span>');
  }

  // Total domains
  const totalDomains = domains.length;
  const totalVisits = sorted.reduce((sum, d) => sum + d.count, 0);

  // Add comparison insights if previous data available
  if (previousData) {
    const previousTotalVisits = Object.values(previousData).reduce(
      (sum, d) => sum + (d.count || 0),
      0,
    );
    const visitChange = totalVisits - previousTotalVisits;
    const hasPreviousVisits = previousTotalVisits > 0;
    const changePercent = hasPreviousVisits
      ? Math.round((visitChange / previousTotalVisits) * 100)
      : 0;

    if (visitChange > 0) {
      const prefix = changePercent > 0 ? '+' : '';
      const warningText = [
        `📈 ${visitChange} more visits (${prefix}${changePercent}%)`,
        'than previous period',
      ].join(' ');
      parts.push(`<span class="summary-warning">${warningText}</span>`);
    } else if (visitChange < 0) {
      const successText = [
        `📉 ${Math.abs(visitChange)} fewer visits (${changePercent}%)`,
        'than previous period',
      ].join(' ');
      parts.push(`<span class="summary-success">${successText}</span>`);
    } else {
      parts.push('No change from previous period');
    }
  }

  const totalDomainLabel = totalDomains === 1 ? 'domain' : 'domains';
  parts.push(
    `Tracked <strong>${totalDomains}</strong> ${totalDomainLabel} with <strong>${totalVisits}</strong> total visits`,
  );

  return `${parts.join('. ')}.`;
}

/**
 * Generate weekly insights from aggregated data
 * @param {Object} weekData - Week's visit data
 * @param {Object} limits - User-configured limits
 * @returns {Array} - Array of insight objects
 */
function generateWeeklyInsights(weekData, limits) {
  const insights = [];
  const domains = Object.entries(weekData);

  if (domains.length === 0) return insights;

  // Sort by count
  const sorted = domains
    .map(([domain, data]) => ({ domain, count: data.count }))
    .sort((a, b) => b.count - a.count);

  // Insight 1: Most visited domain
  const topDomain = sorted[0];
  const mostVisitedText = [
    `You visited <span class="insight-stat">${topDomain.domain}</span> the most this week`,
    `with <span class="insight-stat">${topDomain.count} visits</span>.`,
  ].join(' ');
  insights.push({
    type: 'info',
    title: '🎯 Most Visited',
    text: mostVisitedText,
  });

  // Insight 2: Limit violations
  const overLimitDomains = Object.entries(limits).filter(([domain, limitConfig]) => {
    if (!limitConfig || !limitConfig.enabled || !limitConfig.daily?.enabled) return false;
    const domainData = weekData[domain];
    if (!domainData) return false;
    return domainData.count / 7 > limitConfig.daily.limit; // Average per day
  });

  if (overLimitDomains.length > 0) {
    const limitTextParts = [
      `You exceeded daily limits on <span class="insight-stat">${overLimitDomains.length} ${
        overLimitDomains.length === 1 ? 'domain' : 'domains'
      }</span> this week.`,
      'Consider adjusting your limits or reducing usage.',
    ];
    insights.push({
      type: 'warning',
      title: '⚠️ Limits Exceeded',
      text: limitTextParts.join(' '),
    });
  } else if (Object.keys(limits).length > 0) {
    insights.push({
      type: 'success',
      title: '✅ Great Self-Control',
      text: 'You stayed within all your limits this week. Keep up the good work!',
    });
  }

  // Insight 3: Total focus switches
  const totalVisits = sorted.reduce((sum, d) => sum + d.count, 0);
  const avgPerDay = Math.round(totalVisits / 7);
  const activityText = [
    `You switched focus <span class="insight-stat">${totalVisits} times</span> this week,`,
    `averaging <span class="insight-stat">${avgPerDay} switches/day</span>.`,
  ].join(' ');
  insights.push({
    type: 'info',
    title: '📊 Activity Summary',
    text: activityText,
  });

  // Insight 4: Recommendations
  if (sorted.length >= 3) {
    const top3Total = sorted.slice(0, 3).reduce((sum, d) => sum + d.count, 0);
    const percentageOfTotal = Math.round((top3Total / totalVisits) * 100);

    if (percentageOfTotal > 60) {
      const recommendationText = [
        `Your top 3 sites account for <span class="insight-stat">${percentageOfTotal}%</span>`,
        'of your focus switches. Consider setting limits to improve focus distribution.',
      ].join(' ');
      insights.push({
        type: 'warning',
        title: '💡 Recommendation',
        text: recommendationText,
      });
    }
  }

  return insights;
}

/**
 * Wire up the visualization UI
 * @param {Object} options
 */
export async function setupVisualizationPage(options = {}) {
  const {
    defaultRange = 'today',
    graphDimensions = {},
    listLimit = 10,
    fullPage = false,
    onDataLoaded = null,
  } = options;

  const graphWidth = graphDimensions.width || 400;
  const graphHeight = graphDimensions.height || 450;

  if (fullPage) {
    document.body.classList.add('dashboard-view');
  }

  let currentRange = defaultRange;
  let cleanupGraph = null;
  let toastTimeout = null;

  const loading = document.getElementById('loading');
  const mainView = document.getElementById('main-view');
  const settingsView = document.getElementById('settings-view');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsBackBtn = document.getElementById('settings-back-btn');
  const limitForm = document.getElementById('limit-form');
  const limitErrorEl = document.getElementById('limit-error');
  const limitList = document.getElementById('limit-list');
  const limitsEmpty = document.getElementById('limits-empty');
  const settingsToast = document.getElementById('settings-toast');
  const resetDataBtn = document.getElementById('reset-data-btn');

  const applyLimitConfigToForm = (domainValue, config) => {
    if (!limitForm) return;
    const resolvedConfig = config ? normalizeLimitConfig(config) : createDefaultLimitConfig();
    limitForm.elements.domain.value = domainValue || '';
    limitForm.elements.enabled.checked = resolvedConfig.enabled;
    limitForm.elements.fiveHourEnabled.checked = resolvedConfig.fiveHour.enabled;
    limitForm.elements.fiveHourLimit.value = resolvedConfig.fiveHour.limit;
    limitForm.elements.dailyEnabled.checked = resolvedConfig.daily.enabled;
    limitForm.elements.dailyLimit.value = resolvedConfig.daily.limit;
  };

  const resetLimitFormToDefaults = () => {
    applyLimitConfigToForm('', createDefaultLimitConfig());
  };

  const showSettingsToast = (message) => {
    if (!settingsToast) return;
    settingsToast.textContent = message;
    settingsToast.classList.add('visible');
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastTimeout = setTimeout(() => {
      settingsToast.classList.remove('visible');
    }, 3500);
  };

  const refreshLimitList = async () => {
    if (!limitList) return;
    const limits = await getLimits();
    const entries = Object.entries(limits);
    limitList.innerHTML = '';
    if (limitsEmpty) {
      limitsEmpty.hidden = entries.length > 0;
    }
    if (entries.length === 0) {
      return;
    }

    entries.forEach(([domain, limitConfig]) => {
      const normalized = normalizeLimitConfig(limitConfig);
      const item = document.createElement('li');
      const info = document.createElement('div');
      info.className = 'limit-item-info';

      let limitText = '';
      if (!normalized.enabled) {
        limitText = '<span style="color: #999;">Disabled</span>';
      } else {
        const parts = [];
        if (normalized.fiveHour.enabled) {
          parts.push(`${normalized.fiveHour.limit} per 5h`);
        }
        if (normalized.daily.enabled) {
          parts.push(`${normalized.daily.limit} per day`);
        }
        if (parts.length === 0) {
          limitText = '<span style="color: #999;">No limits active</span>';
        } else {
          limitText = parts.join(', ');
        }
      }

      info.innerHTML = `<strong>${domain}</strong><br/><span>${limitText}</span>`;

      // Quick toggle switch
      const toggleWrapper = document.createElement('label');
      toggleWrapper.className = 'limit-item-toggle';
      toggleWrapper.setAttribute('aria-label', `Toggle limit for ${domain}`);

      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.checked = normalized.enabled;
      toggleInput.dataset.domain = domain;
      toggleInput.dataset.action = 'toggle';

      toggleWrapper.appendChild(toggleInput);

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'pill-button pill-button-secondary pill-button-small';
      editBtn.dataset.domain = domain;
      editBtn.dataset.action = 'edit';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit limit for ${domain}`);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'pill-button pill-button-secondary pill-button-small';
      removeBtn.dataset.domain = domain;
      removeBtn.dataset.action = 'remove';
      removeBtn.textContent = 'Remove';
      removeBtn.setAttribute('aria-label', `Remove limit for ${domain}`);

      const btnGroup = document.createElement('div');
      btnGroup.className = 'limit-item-actions';
      btnGroup.append(toggleWrapper, editBtn, removeBtn);

      item.append(info, btnGroup);
      limitList.appendChild(item);
    });
  };

  const showSettingsView = async () => {
    if (!settingsView || !mainView) return;
    mainView.style.display = 'none';
    settingsView.hidden = false;
    settingsView.setAttribute('aria-hidden', 'false');
    settingsView.focus();
    await refreshLimitList();
  };

  const showMainView = () => {
    if (!settingsView || !mainView) return;
    settingsView.hidden = true;
    settingsView.setAttribute('aria-hidden', 'true');
    mainView.style.display = 'block';
  };

  const renderSimpleList = (aggregatedVisits, domainListEl) => {
    const sortedDomains = Object.keys(aggregatedVisits).sort(
      (a, b) => aggregatedVisits[b].count - aggregatedVisits[a].count,
    );

    domainListEl.innerHTML = '';

    const topDomains = sortedDomains.slice(0, listLimit);
    topDomains.forEach((domain) => {
      const domainData = aggregatedVisits[domain];

      const item = document.createElement('div');
      item.className = 'domain-item';

      const info = document.createElement('div');
      info.className = 'domain-info';

      const name = document.createElement('div');
      name.className = 'domain-name';
      name.textContent = domain;
      info.appendChild(name);

      if (domainData.subpaths && Object.keys(domainData.subpaths).length > 0) {
        const subpaths = Object.entries(domainData.subpaths);
        const topSubpath = subpaths.sort((a, b) => b[1].count - a[1].count)[0];

        const subpathEl = document.createElement('div');
        subpathEl.className = 'domain-subpath';
        subpathEl.textContent = `Top: ${topSubpath[0]} (${topSubpath[1].count})`;
        info.appendChild(subpathEl);
      }

      const count = document.createElement('div');
      count.className = 'domain-count';
      count.textContent = domainData.count;
      count.setAttribute('aria-label', `${domainData.count} visits`);

      item.append(info, count);
      domainListEl.appendChild(item);
    });
  };

  const renderQuickLimits = async (aggregatedVisits) => {
    const quickLimitsPanel = document.getElementById('quick-limits-panel');
    const quickLimitsList = document.getElementById('quick-limits-list');

    if (!quickLimitsPanel || !quickLimitsList) return;

    // Get top 5 domains by visit count
    const sortedDomains = Object.entries(aggregatedVisits)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([domain]) => domain);

    if (sortedDomains.length === 0) {
      quickLimitsPanel.style.display = 'none';
      return;
    }

    quickLimitsPanel.style.display = 'block';
    quickLimitsList.innerHTML = '';

    const limits = await getLimits();

    sortedDomains.forEach((domain) => {
      const visitCount = aggregatedVisits[domain].count;
      const limitConfig = limits[domain] ? normalizeLimitConfig(limits[domain]) : null;
      const defaultConfig = createDefaultLimitConfig();
      const hasLimit = limitConfig !== null;
      const isEnabled = hasLimit && limitConfig.enabled;

      const item = document.createElement('li');
      item.className = 'quick-limit-item';

      const info = document.createElement('div');
      info.className = 'quick-limit-info';

      let statusText = '';
      if (!hasLimit) {
        statusText = `
          <span class="limit-status no-limit">
            Default ${defaultConfig.fiveHour.limit}/5h · ${defaultConfig.daily.limit}/day
          </span>
        `.trim();
      } else if (!isEnabled) {
        statusText = '<span class="limit-status disabled">Disabled</span>';
      } else {
        const parts = [];
        if (limitConfig.fiveHour.enabled) {
          parts.push(`${limitConfig.fiveHour.limit}/5h`);
        }
        if (limitConfig.daily.enabled) {
          parts.push(`${limitConfig.daily.limit}/day`);
        }
        statusText = `<span class="limit-status active">${parts.join(', ')}</span>`;
      }

      info.innerHTML = `
        <div class="quick-limit-domain">${domain}</div>
        <div class="quick-limit-stats">
          <span class="visit-count">${visitCount} visits</span>
          ${statusText}
        </div>
      `;

      const actions = document.createElement('div');
      actions.className = 'quick-limit-actions';

      // Toggle switch
      const toggleWrapper = document.createElement('label');
      toggleWrapper.className = 'quick-limit-toggle';
      toggleWrapper.setAttribute('aria-label', `Toggle limit for ${domain}`);

      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.checked = isEnabled;
      toggleInput.dataset.domain = domain;
      toggleInput.dataset.action = 'quick-toggle';
      toggleInput.dataset.state = hasLimit ? 'configured' : 'default';

      toggleWrapper.appendChild(toggleInput);
      actions.appendChild(toggleWrapper);

      const customizeBtn = document.createElement('button');
      customizeBtn.type = 'button';
      customizeBtn.className = 'pill-button pill-button-secondary pill-button-small';
      customizeBtn.dataset.domain = domain;
      customizeBtn.dataset.action = 'quick-customize';
      customizeBtn.textContent = 'Customize';
      customizeBtn.setAttribute('aria-label', `Customize limit for ${domain}`);
      actions.appendChild(customizeBtn);

      item.append(info, actions);
      quickLimitsList.appendChild(item);
    });
  };

  const renderVisualization = async (range = currentRange) => {
    const graphContainer = document.getElementById('graph-container');
    const domainListEl = document.getElementById('domain-list');
    const emptyState = document.getElementById('empty-state');
    const content = document.getElementById('content');
    const title = document.getElementById('stats-title');

    try {
      if (title) {
        title.textContent = getTitleForRange(range);
      }

      const aggregatedVisits = await loadAggregatedStats(range);

      const domains = Object.keys(aggregatedVisits);
      if (domains.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (content) content.style.display = 'none';
        // Call callback with empty data
        if (onDataLoaded) {
          onDataLoaded({});
        }
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      if (content) content.style.display = 'block';

      // Call data loaded callback
      if (onDataLoaded) {
        onDataLoaded(aggregatedVisits);
      }

      // Render quick limits panel
      await renderQuickLimits(aggregatedVisits);

      if (cleanupGraph) {
        cleanupGraph();
        cleanupGraph = null;
      }

      if (isFeatureEnabled('RADIAL_GRAPH')) {
        if (graphContainer) {
          graphContainer.style.display = 'block';
        }
        if (domainListEl) {
          domainListEl.style.display = 'none';
        }

        // Calculate Focus Hero badges and get limits for color-coding
        const badges = await calculateFocusHeroBadges();
        const limits = await getLimits();

        cleanupGraph = renderRadialGraph(graphContainer, aggregatedVisits, {
          width: graphWidth,
          height: graphHeight,
          badges,
          limits,
        });

        // Update graph summary (if element exists - dashboard only)
        const summaryElement = document.getElementById('summary-content');
        if (summaryElement) {
          // Load comparison data if toggle is enabled
          const comparisonToggle = document.getElementById('comparison-toggle-input');
          const isComparisonEnabled = comparisonToggle && comparisonToggle.checked;
          const previousData = isComparisonEnabled
            ? await loadPreviousPeriodData(currentRange)
            : null;

          const summaryText = generateInsightsSummary(
            aggregatedVisits,
            limits,
            currentRange,
            previousData,
          );
          summaryElement.classList.add('updating');
          summaryElement.innerHTML = summaryText;
          // Remove animation class after animation completes
          setTimeout(() => {
            summaryElement.classList.remove('updating');
          }, 300);
        }
      } else {
        if (graphContainer) {
          graphContainer.style.display = 'none';
        }
        if (domainListEl) {
          domainListEl.style.display = 'block';
          renderSimpleList(aggregatedVisits, domainListEl);
        }
      }
    } catch (error) {
      console.error('Error rendering visualization:', error);
      console.error('Error stack:', error.stack);
      if (graphContainer) {
        const errorHtml = `
          <div class="graph-error">
            Error loading visualization<br/>
            <small style="font-size: 11px; opacity: 0.7;">${error.message}</small>
          </div>
        `;
        graphContainer.innerHTML = errorHtml;
      }
    }
  };

  const timeFilterBtns = document.querySelectorAll('.time-filter-btn');
  timeFilterBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { range } = btn.dataset;
      currentRange = range;

      timeFilterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      await renderVisualization(range);
    });
  });

  // Comparison toggle handler
  const comparisonToggle = document.getElementById('comparison-toggle-input');
  if (comparisonToggle) {
    comparisonToggle.addEventListener('change', async () => {
      const comparisonColumns = document.querySelectorAll('.comparison-column');
      comparisonColumns.forEach((col) => {
        col.style.display = comparisonToggle.checked ? '' : 'none';
      });

      // Refresh visualization to include comparison data
      await renderVisualization(currentRange);
    });
  }

  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await renderVisualization(currentRange);
    });
  }

  // Insights button handler
  const insightsBtn = document.getElementById('insights-btn');
  const insightsReport = document.getElementById('insights-report');
  const insightsClose = document.getElementById('insights-close');
  const insightsContent = document.getElementById('insights-content');

  if (insightsBtn && insightsReport) {
    insightsBtn.addEventListener('click', async () => {
      // Load week data for insights
      const weekData = await loadAggregatedStats('week');
      const limits = await getLimits();
      const insights = generateWeeklyInsights(weekData, limits);

      // Render insights
      insightsContent.innerHTML = insights
        .map(
          (insight) => `
        <div class="insight-card ${insight.type}">
          <div class="insight-card-title">${insight.title}</div>
          <div class="insight-card-text">${insight.text}</div>
        </div>
      `,
        )
        .join('');

      insightsReport.style.display = 'block';
    });

    if (insightsClose) {
      insightsClose.addEventListener('click', () => {
        insightsReport.style.display = 'none';
      });
    }
  }

  // Achievements button handler
  const achievementsBtn = document.getElementById('achievements-btn');
  const achievementsPanel = document.getElementById('achievements-panel');
  const achievementsClose = document.getElementById('achievements-close');
  const achievementsGrid = document.getElementById('achievements-grid');
  const unlockedCount = document.getElementById('unlocked-count');
  const totalCount = document.getElementById('total-count');

  if (achievementsBtn && achievementsPanel) {
    achievementsBtn.addEventListener('click', async () => {
      // Load achievements
      const achievements = await window.getAllAchievements();

      const unlocked = achievements.filter((a) => a.unlocked).length;
      const total = achievements.length;

      unlockedCount.textContent = unlocked;
      totalCount.textContent = total;

      // Render achievements grid
      const achievementCards = achievements
        .map((achievement) => {
          const progress = achievement.progress || { current: 0, target: 1 };
          const progressPercent = Math.min(100, (progress.current / progress.target) * 100);
          const unlockedClass = achievement.unlocked ? 'unlocked' : '';
          const unlockedDate = achievement.unlockedAt
            ? new Date(achievement.unlockedAt).toLocaleDateString()
            : '';

          const progressMarkup = achievement.unlocked
            ? `<div class="achievement-unlocked-date">Unlocked ${unlockedDate}</div>`
            : `<div class="achievement-progress">
                <div class="achievement-progress-bar">
                  <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="achievement-progress-text">${progress.current} / ${progress.target}</div>
              </div>`;

          return `
<div class="achievement-card ${unlockedClass}">
  <div class="achievement-card-header">
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-info">
      <h5 class="achievement-name">${achievement.name}</h5>
      <div class="achievement-category">${achievement.category}</div>
    </div>
  </div>
  <p class="achievement-description">${achievement.description}</p>
  ${progressMarkup}
</div>`;
        })
        .join('');

      achievementsGrid.innerHTML = achievementCards;

      achievementsPanel.style.display = 'block';
    });

    if (achievementsClose) {
      achievementsClose.addEventListener('click', () => {
        achievementsPanel.style.display = 'none';
      });
    }
  }

  // Goals button handler
  const goalsBtn = document.getElementById('goals-btn');
  const goalsPanel = document.getElementById('goals-panel');
  const goalsClose = document.getElementById('goals-close');
  const goalsList = document.getElementById('goals-list');
  const suggestionsGrid = document.getElementById('suggestions-grid');
  const completedGoalsCount = document.getElementById('completed-goals-count');
  const totalGoalsCount = document.getElementById('total-goals-count');

  if (goalsBtn && goalsPanel) {
    goalsBtn.addEventListener('click', async () => {
      // Load goals
      const goals = await window.checkGoalProgress();
      const suggestions = await window.suggestGoals();

      const completed = goals.filter((g) => g.completed).length;
      const total = goals.length;

      completedGoalsCount.textContent = completed;
      totalGoalsCount.textContent = total;

      // Render goals list
      if (goals.length === 0) {
        const emptyGoalsMessage = [
          '<p style="text-align: center; color: var(--color-text-muted); padding: 20px;">',
          'No goals set for today. Add one from suggestions below!',
          '</p>',
        ].join('');
        goalsList.innerHTML = emptyGoalsMessage;
      } else {
        goalsList.innerHTML = goals
          .map((goal) => {
            let progressPercent = 0;
            if (goal.type === 'total_visits' || goal.type === 'domains_visited') {
              progressPercent = Math.min(100, (goal.progress / goal.target) * 100);
            } else if (goal.type === 'focus_score') {
              progressPercent = goal.progress;
            } else {
              progressPercent = goal.completed ? 100 : 0;
            }

            const completedClass = goal.completed ? 'completed' : '';
            const statusClass = goal.completed ? 'completed' : 'in-progress';
            const statusText = goal.completed ? 'Completed' : 'In Progress';

            let progressText = '';
            if (goal.type === 'total_visits') {
              progressText = `${goal.progress} / ${goal.target} visits`;
            } else if (goal.type === 'domains_visited') {
              progressText = `${goal.progress} / ${goal.target} domains`;
            } else if (goal.type === 'focus_score') {
              progressText = `Score: ${goal.progress}`;
            } else if (goal.type === 'no_violations') {
              progressText = goal.progress === 0 ? 'No violations' : `${goal.progress} violations`;
            } else if (goal.type === 'streak') {
              progressText = `${goal.progress} days`;
            }

            return `
            <div class="goal-card ${completedClass}">
              <div class="goal-card-header">
                <div class="goal-icon">${goal.icon}</div>
                <div class="goal-info">
                  <h5 class="goal-title">${goal.title}</h5>
                  <p class="goal-description">${goal.description}</p>
                </div>
                <div class="goal-actions">
                  <button class="goal-remove-btn" data-goal-id="${goal.id}">Remove</button>
                </div>
              </div>
              <div class="goal-progress-section">
                <div class="goal-progress-bar">
                  <div class="goal-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="goal-progress-text">
                  <span>${progressText}</span>
                  <span class="goal-status ${statusClass}">${statusText}</span>
                </div>
              </div>
            </div>
          `;
          })
          .join('');

        // Add event listeners for remove buttons
        goalsList.querySelectorAll('.goal-remove-btn').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const { goalId } = btn.dataset;
            await window.removeGoalFromToday(goalId);
            goalsBtn.click(); // Refresh panel
          });
        });
      }

      // Render suggestions
      suggestionsGrid.innerHTML = suggestions
        .map(
          (suggestion) => `
        <div class="suggestion-card" data-suggestion-id="${suggestion.id}">
          <div class="suggestion-header">
            <div class="suggestion-icon">${suggestion.icon}</div>
            <div class="suggestion-title">${suggestion.title}</div>
          </div>
          <p class="suggestion-description">${suggestion.description}</p>
        </div>
      `,
        )
        .join('');

      // Add event listeners for suggestions
      suggestionsGrid.querySelectorAll('.suggestion-card').forEach((card) => {
        card.addEventListener('click', async () => {
          const { suggestionId } = card.dataset;
          const suggestion = suggestions.find((s) => s.id === suggestionId);
          await window.addGoalToday(suggestion);
          goalsBtn.click(); // Refresh panel
        });
      });

      goalsPanel.style.display = 'block';
    });

    if (goalsClose) {
      goalsClose.addEventListener('click', () => {
        goalsPanel.style.display = 'none';
      });
    }
  }

  if (settingsBtn && settingsView && mainView) {
    settingsBtn.addEventListener('click', async () => {
      await showSettingsView();
    });
  }

  if (settingsBackBtn) {
    settingsBackBtn.addEventListener('click', () => {
      showMainView();
    });
  }

  if (limitList) {
    limitList.addEventListener('click', async (event) => {
      const { domain, action } = event.target.dataset || {};
      if (!domain || !action) return;

      if (action === 'toggle') {
        // Quick toggle to enable/disable limits
        try {
          const limits = await getLimits();
          const limitConfig = normalizeLimitConfig(limits[domain]);

          // Toggle the enabled state
          const newEnabled = event.target.checked;
          limitConfig.enabled = newEnabled;

          await setLimitForDomain(domain, limitConfig);

          // Update blocking rules to reflect the limit change
          await updateBlockingRules();

          await refreshLimitList();
          showSettingsToast(`${domain} limits ${newEnabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
          console.error('Unable to toggle limit:', error);
          // Revert checkbox state
          event.target.checked = !event.target.checked;
          showSettingsToast('Unable to toggle that limit.');
        }
      } else if (action === 'remove') {
        try {
          await setLimitForDomain(domain, null);

          // Update blocking rules to reflect the limit removal
          await updateBlockingRules();

          await refreshLimitList();
          showSettingsToast(`Removed limit for ${domain}`);
        } catch (error) {
          console.error('Unable to remove limit:', error);
          showSettingsToast('Unable to remove that limit.');
        }
      } else if (action === 'edit') {
        // Populate form with existing limit data
        const limits = await getLimits();
        const limitConfig = normalizeLimitConfig(limits[domain]);

        if (limitForm) {
          applyLimitConfigToForm(domain, limitConfig);

          // Scroll to form
          limitForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
          limitForm.elements.domain.focus();
        }
      }
    });
  }

  // Quick limits panel event handlers
  const quickLimitsList = document.getElementById('quick-limits-list');
  if (quickLimitsList) {
    quickLimitsList.addEventListener('click', async (event) => {
      const { domain, action } = event.target.dataset || {};
      if (!domain || !action) return;

      if (action === 'quick-toggle') {
        // Quick toggle to enable/disable limits
        const desiredState = event.target.checked;
        try {
          const limits = await getLimits();
          let limitConfig = limits[domain] ? normalizeLimitConfig(limits[domain]) : null;

          // Toggle the enabled state
          const newEnabled = desiredState;

          if (!limitConfig && newEnabled) {
            limitConfig = createDefaultLimitConfig();
          }

          if (!limitConfig) {
            event.target.checked = false;
            return;
          }

          limitConfig.enabled = newEnabled;

          await setLimitForDomain(domain, limitConfig);

          // Update blocking rules to reflect the limit change
          await updateBlockingRules();

          await renderVisualization(currentRange);
        } catch (error) {
          console.error('Unable to toggle limit:', error);
          // Revert checkbox state
          event.target.checked = !desiredState;
        }
      } else if (action === 'quick-customize') {
        // Open settings and populate form with this domain
        await showSettingsView();

        if (limitForm) {
          const limits = await getLimits();
          const limitConfig = limits[domain]
            ? normalizeLimitConfig(limits[domain])
            : createDefaultLimitConfig();
          applyLimitConfigToForm(domain, limitConfig);

          // Scroll to form
          limitForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
          limitForm.elements.domain.focus();
        }
      }
    });
  }

  if (limitForm) {
    resetLimitFormToDefaults();
    // Toggle visibility of limit config sections
    const limitEnabledToggle = limitForm.elements.enabled;
    const fiveHourEnabledToggle = limitForm.elements.fiveHourEnabled;
    const dailyEnabledToggle = limitForm.elements.dailyEnabled;
    const limitConfigSection = document.getElementById('limit-config-section');
    const fiveHourConfig = document.getElementById('five-hour-config');
    const dailyConfig = document.getElementById('daily-config');

    if (limitEnabledToggle && limitConfigSection) {
      limitEnabledToggle.addEventListener('change', () => {
        limitConfigSection.style.opacity = limitEnabledToggle.checked ? '1' : '0.5';
      });
    }

    if (fiveHourEnabledToggle && fiveHourConfig) {
      fiveHourEnabledToggle.addEventListener('change', () => {
        fiveHourConfig.style.opacity = fiveHourEnabledToggle.checked ? '1' : '0.5';
      });
    }

    if (dailyEnabledToggle && dailyConfig) {
      dailyEnabledToggle.addEventListener('change', () => {
        dailyConfig.style.opacity = dailyEnabledToggle.checked ? '1' : '0.5';
      });
    }

    limitForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const domainInput = limitForm.elements.domain;
      const rawDomain = domainInput.value.trim();
      const normalizedDomain = rawDomain
        .replace(/^https?:\/\//i, '')
        .split('/')[0]
        .toLowerCase();

      if (!normalizedDomain || !/^[a-z0-9.-]+$/.test(normalizedDomain)) {
        if (limitErrorEl) {
          limitErrorEl.textContent = 'Enter a valid domain like example.com';
        }
        return;
      }

      const enabled = limitForm.elements.enabled.checked;
      const fiveHourEnabled = limitForm.elements.fiveHourEnabled.checked;
      const fiveHourLimit = Number(limitForm.elements.fiveHourLimit.value);
      const dailyEnabled = limitForm.elements.dailyEnabled.checked;
      const dailyLimit = Number(limitForm.elements.dailyLimit.value);

      if (fiveHourEnabled && (!Number.isInteger(fiveHourLimit) || fiveHourLimit <= 0)) {
        if (limitErrorEl) {
          limitErrorEl.textContent = 'Enter a positive 5-hour limit.';
        }
        return;
      }

      if (dailyEnabled && (!Number.isInteger(dailyLimit) || dailyLimit <= 0)) {
        if (limitErrorEl) {
          limitErrorEl.textContent = 'Enter a positive daily limit.';
        }
        return;
      }

      if (limitErrorEl) {
        limitErrorEl.textContent = '';
      }

      try {
        const limitConfig = {
          enabled,
          fiveHour: {
            enabled: fiveHourEnabled,
            limit: fiveHourLimit,
          },
          daily: {
            enabled: dailyEnabled,
            limit: dailyLimit,
          },
        };

        await setLimitForDomain(normalizedDomain, limitConfig);

        // Update blocking rules to reflect the limit change
        await updateBlockingRules();

        limitForm.reset();
        // Restore default values after reset
        resetLimitFormToDefaults();

        await refreshLimitList();
        showSettingsToast(`Limit saved for ${normalizedDomain}`);
      } catch (error) {
        console.error('Unable to save limit:', error);
        showSettingsToast('Unable to save that limit.');
      }
    });
  }

  if (resetDataBtn) {
    const defaultResetLabel = resetDataBtn.textContent;
    let resetConfirmTimeout = null;
    resetDataBtn.addEventListener('click', async () => {
      if (resetDataBtn.dataset.confirming === 'true') {
        resetDataBtn.dataset.confirming = 'false';
        resetDataBtn.textContent = defaultResetLabel;
        if (resetConfirmTimeout) {
          clearTimeout(resetConfirmTimeout);
        }
        try {
          await clearAllData();

          // Clear all blocking rules since limits no longer exist
          await updateBlockingRules();

          await updateSettings({
            onboardingComplete: false,
            defaultTimeRange: 'today',
          });
          await refreshLimitList();
          await renderVisualization(currentRange);
          showSettingsToast('All focus data cleared.');
        } catch (error) {
          console.error('Unable to reset data:', error);
          showSettingsToast('Unable to reset data. Try again.');
        }
        return;
      }

      resetDataBtn.dataset.confirming = 'true';
      resetDataBtn.textContent = 'Tap again to confirm reset';
      showSettingsToast('Tap again to confirm reset.');
      resetConfirmTimeout = setTimeout(() => {
        resetDataBtn.dataset.confirming = 'false';
        resetDataBtn.textContent = defaultResetLabel;
      }, 4000);
    });
  }

  // Export graph as PNG
  const exportGraphBtn = document.getElementById('export-graph-btn');

  if (exportGraphBtn) {
    exportGraphBtn.addEventListener('click', async () => {
      try {
        const graphContainer = document.getElementById('graph-container');
        const svg = graphContainer.querySelector('svg');

        if (!svg) {
          showSettingsToast('No graph to export. Generate a graph first.');
          return;
        }

        // Get SVG dimensions
        const svgRect = svg.getBoundingClientRect();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;

        // Serialize SVG to string
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svg);

        // Add XML namespace if not present
        if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
          svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        // Create a blob from SVG string
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Create an image element
        const img = new Image();
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = svgWidth * 2; // 2x for better quality
          canvas.height = svgHeight * 2;

          const ctx = canvas.getContext('2d');
          // Scale for higher quality
          ctx.scale(2, 2);

          // Fill white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, svgWidth, svgHeight);

          // Draw image
          ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

          // Convert to PNG blob
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().split('T')[0];
            const timeRange = currentRange || 'today';
            const filename = `focusbear-graph-${timeRange}-${timestamp}.png`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();

            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);
            showSettingsToast(`Exported graph as ${filename}`);
          }, 'image/png');
        };

        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          console.error('Failed to load SVG image');
          showSettingsToast('Unable to export graph. Try again.');
        };

        img.src = svgUrl;
      } catch (error) {
        console.error('Export PNG error:', error);
        showSettingsToast('Unable to export PNG. Try again.');
      }
    });
  }

  // Export data handlers
  const exportJsonBtn = document.getElementById('export-json-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', async () => {
      try {
        const data = await chrome.storage.local.get(['visits', 'limits', 'settings']);
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `focusbear-data-${timestamp}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
        showSettingsToast(`Exported data as ${filename}`);
      } catch (error) {
        console.error('Export JSON error:', error);
        showSettingsToast('Unable to export JSON. Try again.');
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', async () => {
      try {
        const data = await chrome.storage.local.get(['visits', 'limits']);
        const visits = data.visits || {};
        const limits = data.limits || {};

        // Build CSV content
        let csv = 'Date,Domain,Path,Visit Count,Daily Limit\n';

        Object.entries(visits).forEach(([date, dateVisits]) => {
          Object.entries(dateVisits).forEach(([domain, domainData]) => {
            const limit = limits[domain] || 'No limit';
            const count = domainData.count || 0;

            // Main domain row
            csv += `"${date}","${domain}","/",${count},"${limit}"\n`;

            // Subpath rows
            if (domainData.subpaths) {
              Object.entries(domainData.subpaths).forEach(([subpath, subpathData]) => {
                csv += `"${date}","${domain}","${subpath}",${subpathData.count},"${limit}"\n`;
              });
            }
          });
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `focusbear-data-${timestamp}.csv`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
        showSettingsToast(`Exported data as ${filename}`);
      } catch (error) {
        console.error('Export CSV error:', error);
        showSettingsToast('Unable to export CSV. Try again.');
      }
    });
  }

  // Listen for custom event to open domain settings from graph drilldown
  window.addEventListener('openDomainSettings', async (event) => {
    const { domain } = event.detail || {};
    if (!domain) return;

    try {
      await showSettingsView();

      if (limitForm) {
        const limits = await getLimits();
        const limitConfig = limits[domain]
          ? normalizeLimitConfig(limits[domain])
          : createDefaultLimitConfig();
        applyLimitConfigToForm(domain, limitConfig);

        // Scroll to form
        limitForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        limitForm.querySelector('input[name="domain"]')?.focus();
      }
    } catch (error) {
      console.error('Failed to open domain settings:', error);
    }
  });

  // Performance monitoring
  const perfStart = performance.now();

  try {
    await renderVisualization(currentRange);
    if (loading) {
      loading.style.display = 'none';
    }

    // Log performance metrics
    const perfEnd = performance.now();
    const loadTime = Math.round(perfEnd - perfStart);
    console.log(`[FocusBear Performance] Page load time: ${loadTime}ms`);
    if (loadTime > 300) {
      console.warn('[FocusBear Performance] Load time exceeds target of 300ms');
    }
  } catch (error) {
    console.error('Error initializing visualization page:', error);
    if (loading) {
      loading.textContent = 'Error loading FocusBear';
    }
  }
}
