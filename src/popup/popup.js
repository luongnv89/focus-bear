/**
 * FocusBear Popup Script
 * Main entry point for popup UI
 */

import { renderRadialGraph } from './graph.js';
import { isFeatureEnabled } from '../common/feature-flags.js';

/**
 * Load aggregated stats for a given time range
 * Recreates the getAggregatedStats function from storage.js for use in popup
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

  // Aggregate visits across all dates in range
  Object.entries(visits).forEach(([dateKey, dateVisits]) => {
    const visitDate = new Date(dateKey);
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

        // Aggregate subpaths
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

/**
 * Current time range
 */
let currentRange = 'today';

/**
 * Current graph cleanup function
 */
let cleanupGraph = null;

/**
 * Get title for time range
 */
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
 * Render visualization (graph or list based on feature flags)
 */
async function renderVisualization(range = 'today') {
  const graphContainer = document.getElementById('graph-container');
  const domainListEl = document.getElementById('domain-list');
  const emptyState = document.getElementById('empty-state');
  const content = document.getElementById('content');
  const title = document.getElementById('stats-title');

  try {
    // Update title
    if (title) {
      title.textContent = getTitleForRange(range);
    }

    // Get aggregated visits for the selected range
    const aggregatedVisits = await loadAggregatedStats(range);

    // Check if there's any data
    const domains = Object.keys(aggregatedVisits);
    if (domains.length === 0) {
      emptyState.style.display = 'block';
      content.style.display = 'none';
      return;
    }

    // Show content, hide empty state
    emptyState.style.display = 'none';
    content.style.display = 'block';

    // Cleanup previous graph if exists
    if (cleanupGraph) {
      cleanupGraph();
      cleanupGraph = null;
    }

    // Render graph if feature is enabled
    if (isFeatureEnabled('RADIAL_GRAPH')) {
      graphContainer.style.display = 'block';
      domainListEl.style.display = 'none';

      cleanupGraph = renderRadialGraph(graphContainer, aggregatedVisits, {
        width: 400,
        height: 450,
      });
    } else {
      // Fallback to simple list
      graphContainer.style.display = 'none';
      domainListEl.style.display = 'block';
      renderSimpleList(aggregatedVisits, domainListEl);
    }
  } catch (error) {
    console.error('Error rendering visualization:', error);
    if (graphContainer) {
      graphContainer.innerHTML = '<div class="graph-error">Error loading visualization</div>';
    }
  }
}

/**
 * Render simple domain list (fallback)
 */
function renderSimpleList(todayVisits, domainListEl) {
  // Sort domains by count (descending)
  const sortedDomains = Object.keys(todayVisits).sort(
    (a, b) => todayVisits[b].count - todayVisits[a].count
  );

  // Clear existing list
  domainListEl.innerHTML = '';

  // Render top 10 domains (or all if fewer than 10)
  const topDomains = sortedDomains.slice(0, 10);
  topDomains.forEach((domain) => {
    const domainData = todayVisits[domain];

    const item = document.createElement('div');
    item.className = 'domain-item';

    const info = document.createElement('div');
    info.className = 'domain-info';

    const name = document.createElement('div');
    name.className = 'domain-name';
    name.textContent = domain;

    info.appendChild(name);

    // Show most visited subpath if available
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

    item.appendChild(info);
    item.appendChild(count);
    domainListEl.appendChild(item);
  });
}

/**
 * Initialize popup
 */
document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading');

  try {
    // Load and render data
    await renderVisualization();

    // Hide loading
    loading.style.display = 'none';

    // Setup time filter buttons
    const timeFilterBtns = document.querySelectorAll('.time-filter-btn');
    timeFilterBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const { range } = btn.dataset;
        currentRange = range;

        // Update active state
        timeFilterBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Re-render with new range
        await renderVisualization(range);
      });
    });

    // Setup refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await renderVisualization(currentRange);
      });
    }

    // Setup settings button
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn.addEventListener('click', () => {
      console.log('Settings clicked - to be implemented');
    });
  } catch (error) {
    console.error('Error initializing popup:', error);
    loading.textContent = 'Error loading FocusBear';
  }
});
