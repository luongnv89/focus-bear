import { getLimits, setLimitForDomain, normalizeLimitConfig } from '../background/storage.js';
import { updateBlockingRules } from '../background/limits.js';

document.addEventListener('DOMContentLoaded', async () => {
  await renderRulesList();
  setupForm();
});

async function renderRulesList() {
  const rulesList = document.getElementById('rules-list');
  const emptyState = document.getElementById('rules-empty');
  const limits = await getLimits();
  const entries = Object.entries(limits);

  rulesList.innerHTML = '';

  if (entries.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  entries.forEach(([domain, config]) => {
    const normalized = normalizeLimitConfig(config);
    const item = document.createElement('div');
    item.className = 'rule-item';

    // Determine status text
    const badges = [];
    const mutedStyle = 'border-color: var(--color-text-muted); color: var(--color-text-muted);';
    const successStyle = 'border-color: var(--color-success); color: var(--color-success);';
    if (!normalized.enabled) {
      badges.push(`<span class="rule-badge" style="${mutedStyle}">Disabled</span>`);
    } else {
      badges.push(`<span class="rule-badge" style="${successStyle}">Active</span>`);
      if (normalized.fiveHour.enabled) {
        badges.push(`<span class="rule-badge">${normalized.fiveHour.limit} / 5h</span>`);
      }
      if (normalized.daily.enabled) {
        badges.push(`<span class="rule-badge">${normalized.daily.limit} / day</span>`);
      }
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    const toggleTitle = normalized.enabled ? 'Disable' : 'Enable';
    const toggleIcon = normalized.enabled ? '⏸️' : '▶️';

    item.innerHTML = `
      <div class="rule-info">
        <div class="rule-icon">
          <img src="${faviconUrl}" alt=""
            style="width: 20px; height: 20px; opacity: 0.8;"
            onerror="this.style.display='none'">
        </div>
        <div class="rule-details">
          <h3>${domain}</h3>
          <div class="rule-badges">
            ${badges.join('')}
          </div>
        </div>
      </div>
      <div class="rule-actions">
        <button class="btn-icon toggle-btn" title="${toggleTitle}"
          data-domain="${domain}">${toggleIcon}</button>
        <button class="btn-icon edit-btn" title="Edit"
          data-domain="${domain}">✏️</button>
        <button class="btn-icon delete-btn" title="Delete"
          data-domain="${domain}">🗑️</button>
      </div>
    `;

    // Add event listeners
    const toggleBtn = item.querySelector('.toggle-btn');
    toggleBtn.addEventListener('click', () => toggleRule(domain, normalized));

    const editBtn = item.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => editRule(domain, normalized));

    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteRule(domain));

    rulesList.appendChild(item);
  });
}

function setupForm() {
  const form = document.getElementById('limit-form');
  const errorEl = document.getElementById('limit-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const formData = new FormData(form);
    const domain = formData.get('domain').trim().toLowerCase();

    if (!domain) {
      errorEl.textContent = 'Please enter a valid domain';
      return;
    }

    try {
      // Validate domain format (simple check)
      if (!domain.includes('.') || domain.includes(' ')) {
        errorEl.textContent = 'Please enter a valid domain (e.g., example.com)';
        return;
      }

      const config = {
        enabled: formData.get('enabled') === 'on',
        fiveHour: {
          enabled: formData.get('fiveHourEnabled') === 'on',
          limit: parseInt(formData.get('fiveHourLimit'), 10) || 10,
        },
        daily: {
          enabled: formData.get('dailyEnabled') === 'on',
          limit: parseInt(formData.get('dailyLimit'), 10) || 20,
        },
      };

      await setLimitForDomain(domain, config);
      await updateBlockingRules();

      form.reset();
      // Restore default checked states
      document.getElementById('five-hour-enabled').checked = true;
      document.getElementById('daily-enabled').checked = true;
      document.getElementById('limit-enabled').checked = true;

      await renderRulesList();

      // Scroll to list
      document.getElementById('rules-list').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error saving rule:', error);
      errorEl.textContent = 'Failed to save rule. Please try again.';
    }
  });
}

async function toggleRule(domain, currentConfig) {
  const newConfig = { ...currentConfig, enabled: !currentConfig.enabled };
  await setLimitForDomain(domain, newConfig);
  await updateBlockingRules();
  await renderRulesList();
}

async function deleteRule(domain) {
  // eslint-disable-next-line no-restricted-globals, no-alert
  if (confirm(`Are you sure you want to remove the limits for ${domain}?`)) {
    await setLimitForDomain(domain, null);
    await updateBlockingRules();
    await renderRulesList();
  }
}

function editRule(domain, config) {
  const form = document.getElementById('limit-form');
  form.elements.domain.value = domain;
  form.elements.enabled.checked = config.enabled;

  form.elements.fiveHourEnabled.checked = config.fiveHour?.enabled ?? true;
  form.elements.fiveHourLimit.value = config.fiveHour?.limit ?? 10;

  form.elements.dailyEnabled.checked = config.daily?.enabled ?? true;
  form.elements.dailyLimit.value = config.daily?.limit ?? 20;

  // Scroll to form
  form.scrollIntoView({ behavior: 'smooth' });
  form.elements.domain.focus();
}
