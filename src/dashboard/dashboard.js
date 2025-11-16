import { setupVisualizationPage } from '../common/visualization-page.js';
import { getLimits, calculateFocusHeroBadges } from '../background/storage.js';

let currentTableData = [];
let currentLimits = {};
let currentBadges = {};
let currentPage = 1;
let pageSize = 25;
let filteredData = [];

document.addEventListener('DOMContentLoaded', () => {
  // Setup view mode toggle
  setupViewModeToggle();

  // Setup table controls early
  setupTableControls();

  // Setup pagination controls
  setupPagination();

  // Setup footer
  setupFooter();

  // Handle window resize
  window.addEventListener('resize', handleResize);

  // Wait for layout to settle before getting dimensions
  setTimeout(() => {
    const graphDimensions = getGraphDimensions();
    console.log('[Dashboard] Initializing with dimensions:', graphDimensions);

    // Setup visualization page
    setupVisualizationPage({
      fullPage: true,
      graphDimensions,
      listLimit: 50,
      onDataLoaded: handleDataLoaded,
    });
  }, 100);
});

function setupViewModeToggle() {
  const viewButtons = document.querySelectorAll('.view-mode-btn');
  const viewContainer = document.getElementById('view-container');

  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.view;

      // Update button states
      viewButtons.forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });

      // Update container class
      viewContainer.className = 'view-container';
      if (mode === 'topology') {
        viewContainer.classList.add('topology-only');
      } else if (mode === 'table') {
        viewContainer.classList.add('table-only');
      }

      // Trigger resize event to recalculate graph dimensions
      if (mode === 'topology' || mode === 'split') {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
    });
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

async function handleDataLoaded(aggregatedData) {
  console.log('[Dashboard] Data loaded:', aggregatedData);

  // Update stats summary
  updateStatsSummary(aggregatedData);

  // Load limits and badges
  currentLimits = await getLimits();
  currentBadges = await calculateFocusHeroBadges();

  // Prepare table data
  currentTableData = prepareTableData(aggregatedData);

  // Render table
  renderTable(currentTableData);
}

function updateStatsSummary(data) {
  const domains = Object.keys(data).length;
  const totalVisits = Object.values(data).reduce((sum, d) => sum + (d.count || 0), 0);

  const domainsEl = document.getElementById('total-domains');
  const visitsEl = document.getElementById('total-visits');

  if (domainsEl) domainsEl.textContent = domains;
  if (visitsEl) visitsEl.textContent = totalVisits;
}

function prepareTableData(aggregatedData) {
  return Object.entries(aggregatedData).map(([domain, data]) => ({
    domain,
    count: data.count || 0,
    subpaths: Object.keys(data.subpaths || {}).length,
    lastVisit: data.lastVisit || 0,
    limit: currentLimits[domain] || null,
    badge: currentBadges[domain] || null,
  }));
}

function renderTable(data) {
  const tbody = document.getElementById('table-body');
  const emptyState = document.getElementById('table-empty');

  if (!tbody) return;

  tbody.innerHTML = '';

  // Store filtered data for pagination
  filteredData = data;

  if (data.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    updatePaginationInfo(0, 0, 0);
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Calculate pagination
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageData = data.slice(startIndex, endIndex);

  // Render paginated data
  pageData.forEach((row) => {
    const tr = document.createElement('tr');

    // Domain cell
    const domainTd = document.createElement('td');
    domainTd.className = 'domain-cell';
    domainTd.textContent = row.domain;
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
    visitsTd.textContent = row.count;
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
    limitTd.textContent = row.limit ? `${row.limit} visits/day` : '—';
    tr.appendChild(limitTd);

    // Status cell
    const statusTd = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge';

    if (!row.limit) {
      statusBadge.classList.add('no-limit');
      statusBadge.textContent = 'No Limit';
    } else if (row.count > row.limit) {
      statusBadge.classList.add('over-limit');
      statusBadge.textContent = 'Over Limit';
    } else if (row.count >= row.limit * 0.8) {
      statusBadge.classList.add('near-limit');
      statusBadge.textContent = 'Near Limit';
    } else {
      statusBadge.classList.add('under-limit');
      statusBadge.textContent = 'Under Limit';
    }

    statusTd.appendChild(statusBadge);
    tr.appendChild(statusTd);

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
      const query = e.target.value.toLowerCase();
      const filtered = currentTableData.filter((row) => row.domain.toLowerCase().includes(query));
      currentPage = 1; // Reset to first page on search
      renderTable(filtered);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const [field, order] = e.target.value.split('-');
      const sorted = sortTableData([...currentTableData], field, order);
      currentPage = 1; // Reset to first page on sort
      renderTable(sorted);
    });
  }

  // Setup sortable table headers
  const headers = document.querySelectorAll('.data-table th.sortable');
  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const field = header.dataset.sort;
      const currentOrder = header.classList.contains('sorted-asc') ? 'desc' : 'asc';

      // Remove sorted class from all headers
      headers.forEach((h) => h.classList.remove('sorted-asc', 'sorted-desc'));

      // Add sorted class to clicked header
      header.classList.add(currentOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');

      // Sort and render
      const sorted = sortTableData([...currentTableData], field, currentOrder);
      currentPage = 1; // Reset to first page on sort
      renderTable(sorted);

      // Update select to match
      if (sortSelect) {
        sortSelect.value = `${field}-${currentOrder}`;
      }
    });
  });
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

function setupPagination() {
  const prevBtn = document.getElementById('pagination-prev');
  const nextBtn = document.getElementById('pagination-next');
  const sizeSelect = document.getElementById('pagination-size');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable(filteredData);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredData.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable(filteredData);
      }
    });
  }

  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10);
      currentPage = 1; // Reset to first page
      renderTable(filteredData);
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
