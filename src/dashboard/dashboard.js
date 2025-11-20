import { setupVisualizationPage } from '../common/visualization-page.js';
import {
  getLimits,
  setLimitForDomain,
  calculateFocusHeroBadges,
  normalizeLimitConfig,
  createDefaultLimitConfig,
  calculateOverallStreak,
} from '../background/storage.js';
import { updateBlockingRules } from '../background/limits.js';
import { getTodayFocusScore } from '../background/focus-score.js';

let currentTableData = [];
let currentLimits = {};
let currentBadges = {};
let currentPage = 1;
let pageSize = 25;
let filteredData = [];
let currentAggregatedData = {};
let todayAggregatedData = {}; // Separate storage for today's data for status badge
const tableFilters = {
  query: '',
  sortField: 'count',
  sortOrder: 'desc',
};

document.addEventListener('DOMContentLoaded', async () => {
  // Show insights popup on dashboard open (if not dismissed today)
  await showInsightsPopup();

  // Setup table controls early
  setupTableControls();

  // Setup pagination controls
  setupPagination();

  // Setup footer
  setupFooter();
  setupBrandReset();

  // Handle window resize
  window.addEventListener('resize', handleResize);

  // Listen for domain drilldown events from graph
  window.addEventListener('domainDrilldown', handleDomainDrilldown);
  window.addEventListener('domainDrilldownExit', handleDrilldownExit);

  // Wait for layout to settle before getting dimensions
  setTimeout(() => {
    const graphDimensions = getGraphDimensions();
    console.log('[Dashboard] Initializing with dimensions:', graphDimensions);

    // Setup visualization page
    setupVisualizationPage({
      defaultRange: 'today', // Default to today view for accurate status
      fullPage: true,
      graphDimensions,
      listLimit: 50,
      onDataLoaded: handleDataLoaded,
    });
  }, 100);
});

/**
 * Show insights popup on dashboard open
 * Checks if insights have been dismissed today and shows popup if not
 */
async function showInsightsPopup() {
  const popup = document.getElementById('insights-popup');
  const overlay = document.getElementById('insights-popup-overlay');
  const closeBtn = document.getElementById('insights-close');

  if (!popup || !overlay || !closeBtn) return;

  // Check if insights were dismissed today
  const today = new Date().toISOString().split('T')[0];
  const { insightsDismissedDate } = await chrome.storage.local.get('insightsDismissedDate');

  if (insightsDismissedDate === today) {
    // Already dismissed today, don't show
    return;
  }

  // Load and display insights content (will be populated by visualization-page.js)
  // Show popup after a short delay to let the page load
  setTimeout(() => {
    popup.style.display = 'flex';
  }, 1000);

  // Close handlers
  const closePopup = async () => {
    popup.style.display = 'none';
    // Save dismissal date
    await chrome.storage.local.set({ insightsDismissedDate: today });
  };

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);

  // Also close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.style.display === 'flex') {
      closePopup();
    }
  });
}

function setupFooter() {
  // Load and display version from manifest
  const manifest = chrome.runtime.getManifest();
  const footerVersion = document.getElementById('footer-version');
  if (footerVersion) {
    footerVersion.textContent = `v${manifest.version_name || manifest.version}`;
  }
}

function getGraphDimensions() {
  const topologyPanel = document.getElementById('topology-panel');
  const viewContainer = document.getElementById('view-container');

  if (!topologyPanel || !viewContainer) {
    console.warn('[Dashboard] Topology panel not found, using default dimensions');
    return { width: 900, height: 600 };
  }

  // Wait for layout to settle
  const rect = topologyPanel.getBoundingClientRect();
  const padding = 48; // Account for panel padding

  const width = Math.max(600, rect.width - padding);
  const height = Math.max(400, rect.height - 120); // Account for panel header

  console.log('[Dashboard] Calculated graph dimensions:', {
    width,
    height,
    panelWidth: rect.width,
    panelHeight: rect.height,
  });

  // Ensure dimensions are valid
  if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
    console.warn('[Dashboard] Invalid dimensions calculated, using defaults');
    return { width: 900, height: 600 };
  }

  return { width, height };
}

function handleResize() {
  // Debounce resize handler
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    const newDimensions = getGraphDimensions();
    // Graph will auto-resize via D3, but we can trigger a refresh if needed
    console.log('[Dashboard] Resize:', newDimensions);
  }, 250);
}

function setupBrandReset() {
  const brandTrigger = document.getElementById('dashboard-home-trigger');
  if (!brandTrigger) return;

  const activateReset = () => {
    resetDashboardView();
  };

  brandTrigger.addEventListener('click', activateReset);
  brandTrigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateReset();
    }
  });
}

function resetDashboardView() {
  // Exit settings view if open
  const mainView = document.getElementById('main-view');
  const settingsView = document.getElementById('settings-view');
  if (settingsView && mainView) {
    settingsView.hidden = true;
    settingsView.setAttribute('aria-hidden', 'true');
    mainView.style.display = 'block';
  }

  // Reset table header/content state from any drilldown
  handleDrilldownExit();

  // Restore default table filters and pagination
  tableFilters.query = '';
  tableFilters.sortField = 'count';
  tableFilters.sortOrder = 'desc';
  currentPage = 1;
  pageSize = 25;

  const searchInput = document.getElementById('table-search');
  if (searchInput) {
    searchInput.value = '';
  }

  const sortSelect = document.getElementById('table-sort');
  if (sortSelect) {
    sortSelect.value = `${tableFilters.sortField}-${tableFilters.sortOrder}`;
  }

  const paginationSize = document.getElementById('pagination-size');
  const sizeSelect = paginationSize || document.getElementById('table-page-size');
  if (sizeSelect) {
    sizeSelect.value = pageSize.toString();
  }

  updateSortHeaderState(tableFilters.sortField, tableFilters.sortOrder);

  // Ensure comparison toggle is off
  const comparisonToggle = document.getElementById('comparison-toggle-input');
  if (comparisonToggle && comparisonToggle.checked) {
    comparisonToggle.checked = false;
    comparisonToggle.dispatchEvent(new Event('change'));
  }

  // Re-render table with defaults applied
  currentTableData = prepareTableData(currentAggregatedData);
  renderTable();

  // Reset visualization to default time range
  const todayBtn = document.querySelector('.time-filter-btn[data-range="today"]');
  if (todayBtn) {
    todayBtn.click();
  }
}

async function handleDataLoaded(aggregatedData) {
  console.log('[Dashboard] Data loaded:', aggregatedData);

  // Update stats summary
  updateStatsSummary(aggregatedData);

  // Load limits and badges
  currentLimits = await getLimits();
  currentBadges = await calculateFocusHeroBadges();
  currentAggregatedData = aggregatedData;

  // Update streak display
  await updateStreakDisplay();

  // Update focus score display
  await updateFocusScoreDisplay();

  // Load today's aggregated data separately for status badge calculation
  todayAggregatedData = await loadTodayAggregatedStats();

  // Prepare table data
  currentTableData = prepareTableData(aggregatedData);

  // Render table
  renderTable();
}

function updateStatsSummary(data) {
  const domains = Object.keys(data).length;
  const totalVisits = Object.values(data).reduce((sum, d) => sum + (d.count || 0), 0);

  const domainsEl = document.getElementById('total-domains');
  const visitsEl = document.getElementById('total-visits');

  if (domainsEl) domainsEl.textContent = domains;
  if (visitsEl) visitsEl.textContent = totalVisits;
}

/**
 * Load aggregated stats for today only
 * Used to calculate status badge independently from the displayed time range
 */
async function loadTodayAggregatedStats() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const data = await chrome.storage.local.get(['visits']);
  const visits = data.visits || {};
  const aggregated = {};

  Object.entries(visits).forEach(([dateKey, dateVisits]) => {
    // Parse date string as local date to avoid timezone issues
    // dateKey format: "YYYY-MM-DD"
    const [year, month, day] = dateKey.split('-').map(Number);
    const visitDate = new Date(year, month - 1, day); // month is 0-indexed

    // Only include today's visits
    if (visitDate.getTime() === today.getTime()) {
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

function prepareTableData(aggregatedData) {
  return Object.entries(aggregatedData).map(([domain, data]) => ({
    domain,
    count: data.count || 0,
    todayCount: todayAggregatedData[domain]?.count || 0, // Add today's count for status badge
    subpaths: Object.keys(data.subpaths || {}).length,
    lastVisit: data.lastVisit || 0,
    limit: currentLimits[domain] ? normalizeLimitConfig(currentLimits[domain]) : null,
    badge: currentBadges[domain] || null,
  }));
}

function applyTableFilters(data) {
  let result = [...data];
  if (tableFilters.query) {
    result = result.filter((row) => row.domain.toLowerCase().includes(tableFilters.query));
  }
  result = sortTableData(result, tableFilters.sortField, tableFilters.sortOrder);
  return result;
}

function renderTable() {
  const tbody = document.getElementById('table-body');
  const emptyState = document.getElementById('table-empty');

  if (!tbody) return;

  tbody.innerHTML = '';

  filteredData = applyTableFilters(currentTableData);

  if (filteredData.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    updatePaginationInfo(0, 0, 0);
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Calculate pagination
  const totalItems = filteredData.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageData = filteredData.slice(startIndex, endIndex);

  // Render paginated data
  pageData.forEach((row) => {
    const tr = document.createElement('tr');

    // Domain cell
    const domainTd = document.createElement('td');
    domainTd.className = 'domain-cell';
    const domainBtn = document.createElement('button');
    domainBtn.type = 'button';
    domainBtn.className = 'domain-link';
    domainBtn.textContent = row.domain;
    domainBtn.addEventListener('click', () => openDomainDetail(row.domain));
    domainTd.appendChild(domainBtn);
    if (row.badge) {
      const badge = document.createElement('span');
      badge.className = 'badge-icon-table';
      badge.textContent = '🏆';
      badge.title = `Focus Hero (${row.badge.streak} days!)`;
      domainTd.appendChild(badge);
    }
    tr.appendChild(domainTd);

    // Visits cell
    const visitsTd = document.createElement('td');
    visitsTd.className = 'visits-cell';
    visitsTd.textContent = row.todayCount;
    tr.appendChild(visitsTd);

    // Subpaths cell
    const subpathsTd = document.createElement('td');
    subpathsTd.className = 'subpaths-cell';
    subpathsTd.textContent = row.subpaths;
    tr.appendChild(subpathsTd);

    // Last visit cell
    const lastVisitTd = document.createElement('td');
    if (row.lastVisit) {
      const date = new Date(row.lastVisit);
      lastVisitTd.textContent = formatRelativeTime(date);
      lastVisitTd.title = date.toLocaleString();
    } else {
      lastVisitTd.textContent = 'Never';
    }
    tr.appendChild(lastVisitTd);

    // Limit cell
    const limitTd = document.createElement('td');
    if (row.limit) {
      const limitParts = [];
      if (row.limit.fiveHour?.enabled && row.limit.fiveHour?.limit) {
        limitParts.push(`${row.limit.fiveHour.limit}/5h`);
      }
      if (row.limit.daily?.enabled && row.limit.daily?.limit) {
        limitParts.push(`${row.limit.daily.limit}/day`);
      }
      limitTd.textContent = limitParts.length > 0 ? limitParts.join(', ') : '—';
    } else {
      limitTd.textContent = '—';
    }
    tr.appendChild(limitTd);

    // Status cell with icons and numeric progress
    const statusTd = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge';

    if (!row.limit || !row.limit.enabled) {
      statusBadge.classList.add('no-limit');
      statusBadge.innerHTML = '∞ No Limit';
      statusBadge.title = 'No limits configured for this domain';
    } else {
      // Check against daily limit for status using TODAY's count only
      // This ensures status resets each day regardless of displayed time range
      const dailyLimit = row.limit.daily?.limit;
      const todayCount = row.todayCount || 0;

      if (dailyLimit && todayCount >= dailyLimit) {
        statusBadge.classList.add('over-limit');
        statusBadge.innerHTML = `✗ Over Limit (${todayCount}/${dailyLimit})`;
        statusBadge.title = `Daily limit exceeded (${todayCount}/${dailyLimit} visits today).`;
      } else if (dailyLimit && todayCount >= dailyLimit * 0.8) {
        statusBadge.classList.add('near-limit');
        statusBadge.innerHTML = `⚠️ Near Limit (${todayCount}/${dailyLimit})`;
        statusBadge.title = `Approaching daily limit (${todayCount}/${dailyLimit} visits today).`;
      } else if (dailyLimit) {
        statusBadge.classList.add('under-limit');
        statusBadge.innerHTML = `✓ Under Limit (${todayCount}/${dailyLimit})`;
        statusBadge.title = `Within daily limit (${todayCount}/${dailyLimit} visits today).`;
      } else {
        // Limit is enabled but no daily limit configured
        statusBadge.classList.add('no-limit');
        statusBadge.innerHTML = '∞ No Limit';
        statusBadge.title = 'Limits are enabled but no daily limit is configured';
      }
    }

    statusTd.appendChild(statusBadge);
    tr.appendChild(statusTd);

    // Actions cell
    const actionsTd = document.createElement('td');
    actionsTd.className = 'actions-cell';

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'table-toggle';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = row.limit ? row.limit.enabled !== false : false;
    toggleInput.dataset.domain = row.domain;

    // Add descriptive tooltip
    const currentState = toggleInput.checked ? 'Enabled' : 'Disabled';
    const toggleAction = toggleInput.checked ? 'disable' : 'enable';
    toggleLabel.title = `${currentState} - Click to ${toggleAction} limit for ${row.domain}`;

    toggleInput.addEventListener('change', async (e) => {
      toggleInput.disabled = true;
      toggleLabel.classList.add('toggle-loading');

      const success = await handleInlineLimitToggle(row.domain, e.target.checked);

      if (success) {
        // Update tooltip to reflect new state
        const newState = e.target.checked ? 'Enabled' : 'Disabled';
        const newAction = e.target.checked ? 'disable' : 'enable';
        toggleLabel.title = `${newState} - Click to ${newAction} limit for ${row.domain}`;

        // Show success feedback
        toggleLabel.classList.add('toggle-success');
        setTimeout(() => {
          toggleLabel.classList.remove('toggle-success');
        }, 600);
      } else {
        toggleInput.checked = !e.target.checked;
        // Show error feedback
        toggleLabel.classList.add('toggle-error');
        setTimeout(() => {
          toggleLabel.classList.remove('toggle-error');
        }, 600);
      }

      toggleLabel.classList.remove('toggle-loading');
      toggleInput.disabled = false;
    });

    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'toggle-slider';

    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleSlider);
    actionsTd.appendChild(toggleLabel);

    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });

  // Update pagination info
  updatePaginationInfo(startIndex + 1, endIndex, totalItems);
}

function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function setupTableControls() {
  const searchInput = document.getElementById('table-search');
  const sortSelect = document.getElementById('table-sort');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      tableFilters.query = e.target.value.toLowerCase();
      currentPage = 1;
      renderTable();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const [field, order] = e.target.value.split('-');
      setSort(field, order);
      currentPage = 1;
      renderTable();
      updateSortHeaderState(field, order);
    });
  }

  // Setup sortable table headers
  const headers = document.querySelectorAll('.data-table th.sortable');
  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const field = header.dataset.sort;
      const isAscending = tableFilters.sortField === field && tableFilters.sortOrder === 'asc';
      const currentOrder = isAscending ? 'desc' : 'asc';
      setSort(field, currentOrder);
      currentPage = 1;
      renderTable();
      updateSortHeaderState(field, currentOrder);
      if (sortSelect) {
        sortSelect.value = `${field}-${currentOrder}`;
      }
    });
  });

  updateSortHeaderState(tableFilters.sortField, tableFilters.sortOrder);
}

function sortTableData(data, field, order = 'desc') {
  return data.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle string comparisons
    if (field === 'domain') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    // Handle numeric comparisons
    if (order === 'asc') {
      return aVal - bVal;
    }
    return bVal - aVal;
  });
}

function setSort(field, order) {
  tableFilters.sortField = field;
  tableFilters.sortOrder = order;
}

function updateSortHeaderState(field, order) {
  const headers = document.querySelectorAll('.data-table th.sortable');
  headers.forEach((header) => {
    header.classList.remove('sorted-asc', 'sorted-desc');
    if (header.dataset.sort === field) {
      header.classList.add(order === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

function setupPagination() {
  const prevBtn = document.getElementById('pagination-prev');
  const nextBtn = document.getElementById('pagination-next');
  const sizeSelect = document.getElementById('pagination-size');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredData.length / pageSize);
      if (currentPage < totalPages) {
        currentPage += 1;
        renderTable();
      }
    });
  }

  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10);
      currentPage = 1; // Reset to first page
      renderTable();
    });
  }
}

function updatePaginationInfo(start, end, total) {
  const startEl = document.getElementById('pagination-start');
  const endEl = document.getElementById('pagination-end');
  const totalEl = document.getElementById('pagination-total');
  const pageEl = document.getElementById('pagination-page');
  const prevBtn = document.getElementById('pagination-prev');
  const nextBtn = document.getElementById('pagination-next');

  if (startEl) startEl.textContent = start;
  if (endEl) endEl.textContent = end;
  if (totalEl) totalEl.textContent = total;

  const totalPages = Math.ceil(total / pageSize);
  if (pageEl) pageEl.textContent = total > 0 ? `Page ${currentPage} of ${totalPages}` : 'Page 0';

  // Update button states
  if (prevBtn) prevBtn.disabled = currentPage === 1 || total === 0;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages || total === 0;
}

async function handleInlineLimitToggle(domain, enabled) {
  try {
    const limits = await getLimits();
    const existing = limits[domain] ? normalizeLimitConfig(limits[domain]) : null;
    if (!existing && !enabled) {
      return true;
    }

    let updatedConfig = existing;
    if (!existing && enabled) {
      updatedConfig = createDefaultLimitConfig();
    }

    if (!updatedConfig) {
      return false;
    }

    updatedConfig.enabled = enabled;
    await setLimitForDomain(domain, updatedConfig);

    // Update blocking rules to reflect the limit change
    await updateBlockingRules();

    currentLimits = await getLimits();
    currentTableData = prepareTableData(currentAggregatedData);
    renderTable();
    return true;
  } catch (error) {
    console.error('Error toggling inline limit:', error);
    return false;
  }
}

function openDomainDetail(domain) {
  const detailUrl = new URL(chrome.runtime.getURL('src/dashboard/domain.html'));
  detailUrl.searchParams.set('domain', domain);
  window.location.href = detailUrl.toString();
}

// Handle domain drilldown from graph
async function handleDomainDrilldown(event) {
  const { domain, domainData } = event.detail;

  // Update table panel header
  const panelHeader = document.querySelector('.table-panel .panel-header');
  if (!panelHeader) return;

  // Get limit config for this domain
  let limitConfig = null;
  if (currentLimits[domain]) {
    limitConfig = normalizeLimitConfig(currentLimits[domain]);
  }

  const subpathCount = Object.keys(domainData.subpaths || {}).length;

  let limitBadges = '<span class="limit-status-badge limit-disabled">No limits</span>';
  if (limitConfig && limitConfig.enabled) {
    limitBadges = `<span class="limit-status-badge limit-enabled">✓ Limits Active</span>
      <span class="limit-details">
        ${limitConfig.fiveHour?.enabled ? `${limitConfig.fiveHour.limit}/5hr` : ''}
        ${limitConfig.fiveHour?.enabled && limitConfig.daily?.enabled ? ' • ' : ''}
        ${limitConfig.daily?.enabled ? `${limitConfig.daily.limit}/day` : ''}
      </span>`;
  }

  // Create header with domain info and limitation status
  panelHeader.innerHTML = `
  <div class="drilldown-table-header">
    <div class="drilldown-info">
      <h3>Path Statistics for ${domain}</h3>
      <p class="panel-subtitle">${domainData.count} total visits • ${subpathCount} subpaths</p>
    </div>
    <div class="drilldown-status">
      ${limitBadges}
      <button class="drilldown-edit-btn" data-domain="${domain}">
        Edit Limitation Settings
      </button>
    </div>
  </div>
`;

  // Add click handler for edit button
  const editBtn = panelHeader.querySelector('.drilldown-edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('openDomainSettings', {
          detail: { domain },
        }),
      );
    });
  }

  // Render subpath table
  renderSubpathTable(domain, domainData);
}

// Handle exit from drilldown
function handleDrilldownExit() {
  // Restore original table header
  const panelHeader = document.querySelector('.table-panel .panel-header');
  if (!panelHeader) return;

  panelHeader.innerHTML = `
    <h3>Domain Statistics</h3>
    <p class="panel-subtitle">All tracked domains and visit counts</p>
    <div class="table-controls">
      <input
        type="text"
        id="table-search"
        placeholder="Search domains..."
        aria-label="Search domains"
      />
      <select id="table-page-size" aria-label="Items per page">
        <option value="10">10 per page</option>
        <option value="25" selected>25 per page</option>
        <option value="50">50 per page</option>
        <option value="100">100 per page</option>
      </select>
    </div>
  `;

  // Restore original table column headers
  const thead = document.querySelector('.data-table thead');
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th class="sortable" data-sort="domain">
          Domain
          <span class="sort-indicator"></span>
        </th>
        <th class="sortable" data-sort="count">
          Visits
          <span class="sort-indicator"></span>
        </th>
        <th class="sortable" data-sort="subpaths">
          Subpaths
          <span class="sort-indicator"></span>
        </th>
        <th class="sortable" data-sort="lastVisit">
          Last Visit
          <span class="sort-indicator"></span>
        </th>
        <th>Limit</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    `;
  }

  // Re-setup table controls
  setupTableControls();

  // Restore domain table
  renderTable();
}

// Render subpath table
function renderSubpathTable(domain, domainData) {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  // Prepare subpath data
  const subpaths = Object.entries(domainData.subpaths || {})
    .map(([path, pathData]) => ({
      subpath: path,
      count: pathData.count,
      lastVisit: pathData.lastVisit,
    }))
    .sort((a, b) => b.count - a.count);

  const totalVisits = subpaths.reduce((sum, sp) => sum + sp.count, 0);

  // Render subpath rows
  subpaths.forEach((subpath) => {
    const percentage = ((subpath.count / totalVisits) * 100).toFixed(1);
    const lastVisitDate = new Date(subpath.lastVisit).toLocaleString();

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="subpath-cell">
        <span class="subpath-domain">${domain}</span>
        <span class="subpath-path">${subpath.subpath}</span>
      </td>
      <td class="visits-cell">${subpath.count}</td>
      <td class="date-cell">${lastVisitDate}</td>
      <td class="percentage-cell">
        <div class="percentage-bar-container">
          <div class="percentage-bar" style="width: ${percentage}%"></div>
          <span class="percentage-text">${percentage}%</span>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });

  // Update table header for subpaths
  const thead = tbody.parentElement.querySelector('thead');
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th>Subpath</th>
        <th>Visits</th>
        <th>Last Visit</th>
        <th>% of Total</th>
      </tr>
    `;
  }
}

/**
 * Update streak display in header
 */
async function updateStreakDisplay() {
  const streakElement = document.getElementById('current-streak');
  if (!streakElement) return;

  try {
    const overallStreak = await calculateOverallStreak();
    const currentStreak = overallStreak.current || 0;

    streakElement.textContent = currentStreak;

    // Update tooltip with best streak info
    const streakStat = document.getElementById('streak-stat');
    if (streakStat) {
      const bestStreak = overallStreak.best || 0;
      const currentLabel = `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`;
      const bestLabel = `${bestStreak} day${bestStreak !== 1 ? 's' : ''}`;
      streakStat.title = `Current: ${currentLabel} | Personal Best: ${bestLabel}`;
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

/**
 * Update focus score display in header
 */
async function updateFocusScoreDisplay() {
  const focusScoreElement = document.getElementById('focus-score');
  if (!focusScoreElement) return;

  try {
    const todayScore = await getTodayFocusScore();

    focusScoreElement.textContent = todayScore;

    // Update tooltip and color based on score
    const focusScoreStat = document.getElementById('focus-score-stat');
    if (focusScoreStat) {
      let rating = 'Good';
      if (todayScore >= 80) {
        rating = 'Excellent';
      } else if (todayScore >= 60) {
        rating = 'Good';
      } else if (todayScore >= 40) {
        rating = 'Fair';
      } else {
        rating = 'Needs Improvement';
      }

      focusScoreStat.title = `Today's Focus Score: ${todayScore}/100 (${rating})`;
    }
  } catch (error) {
    console.error('Error updating focus score:', error);
  }
}
