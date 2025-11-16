/**
 * Shared visualization controller used by both the popup and dashboard views
 */

import { renderRadialGraph } from '../popup/graph.js';
import { isFeatureEnabled } from './feature-flags.js';
import {
  getSettings,
  updateSettings,
  getLimits,
  setLimitForDomain,
  clearAllData,
  calculateFocusHeroBadges,
  normalizeLimitConfig,
  createDefaultLimitConfig,
} from '../background/storage.js';

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
  const highContrastToggle = document.getElementById('high-contrast-toggle');
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

  const applyHighContrast = (enabled) => {
    document.body.classList.toggle('high-contrast', enabled);
    if (highContrastToggle) {
      highContrastToggle.checked = enabled;
    }
  };

  const loadHighContrastPreference = async () => {
    try {
      const settings = await getSettings();
      applyHighContrast(Boolean(settings.highContrastMode));
    } catch (error) {
      console.error('Unable to load settings:', error);
    }
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
        limitText =
          parts.length > 0
            ? parts.join(', ')
            : '<span style="color: #999;">No limits active</span>';
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

        // Calculate Focus Hero badges
        const badges = await calculateFocusHeroBadges();

        cleanupGraph = renderRadialGraph(graphContainer, aggregatedVisits, {
          width: graphWidth,
          height: graphHeight,
          badges,
        });
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

  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await renderVisualization(currentRange);
    });
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

  if (highContrastToggle) {
    highContrastToggle.addEventListener('change', async (event) => {
      const enabled = event.target.checked;
      try {
        await updateSettings({ highContrastMode: enabled });
        applyHighContrast(enabled);
        showSettingsToast(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
      } catch (error) {
        console.error('Unable to update settings:', error);
        event.target.checked = !enabled;
        showSettingsToast('Unable to update accessibility setting.');
      }
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
          await updateSettings({
            highContrastMode: false,
            onboardingComplete: false,
            defaultTimeRange: 'today',
          });
          await loadHighContrastPreference();
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

  // Performance monitoring
  const perfStart = performance.now();

  try {
    await loadHighContrastPreference();
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
