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

    // Build rule badges safely (numeric limits only, domain handled via textContent)
    const badgeInfos = [];
    const mutedStyle = 'border-color: var(--color-text-muted); color: var(--color-text-muted);';
    const successStyle = 'border-color: var(--color-success); color: var(--color-success);';
    if (!normalized.enabled) {
      badgeInfos.push({ text: 'Disabled', style: mutedStyle });
    } else {
      badgeInfos.push({ text: 'Active', style: successStyle });
      if (normalized.fiveHour.enabled) {
        badgeInfos.push({ text: `${normalized.fiveHour.limit} / 5h`, style: '' });
      }
      if (normalized.daily.enabled) {
        badgeInfos.push({ text: `${normalized.daily.limit} / day`, style: '' });
      }
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    const toggleTitle = normalized.enabled ? 'Disable' : 'Enable';
    const toggleIcon = normalized.enabled ? '⏸️' : '▶️';

    const ruleInfo = document.createElement('div');
    ruleInfo.className = 'rule-info';

    const ruleIcon = document.createElement('div');
    ruleIcon.className = 'rule-icon';
    const iconImg = document.createElement('img');
    iconImg.src = faviconUrl;
    iconImg.alt = '';
    iconImg.style.width = '20px';
    iconImg.style.height = '20px';
    iconImg.style.opacity = '0.8';
    iconImg.onerror = function () {
      this.style.display = 'none';
    };
    ruleIcon.appendChild(iconImg);

    const ruleDetails = document.createElement('div');
    ruleDetails.className = 'rule-details';
    const domainHeading = document.createElement('h3');
    domainHeading.textContent = domain;
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'rule-badges';
    badgeInfos.forEach((b) => {
      const badge = document.createElement('span');
      badge.className = 'rule-badge';
      if (b.style) badge.setAttribute('style', b.style);
      badge.textContent = b.text;
      badgesContainer.appendChild(badge);
    });
    ruleDetails.append(domainHeading, badgesContainer);

    ruleInfo.append(ruleIcon, ruleDetails);

    const ruleActions = document.createElement('div');
    ruleActions.className = 'rule-actions';

    const toggleBtnEl = document.createElement('button');
    toggleBtnEl.className = 'btn-icon toggle-btn';
    toggleBtnEl.title = toggleTitle;
    toggleBtnEl.dataset.domain = domain;
    toggleBtnEl.textContent = toggleIcon;

    const editBtnEl = document.createElement('button');
    editBtnEl.className = 'btn-icon edit-btn';
    editBtnEl.title = 'Edit';
    editBtnEl.dataset.domain = domain;
    editBtnEl.textContent = '✏️';

    const deleteBtnEl = document.createElement('button');
    deleteBtnEl.className = 'btn-icon delete-btn';
    deleteBtnEl.title = 'Delete';
    deleteBtnEl.dataset.domain = domain;
    deleteBtnEl.textContent = '🗑️';

    ruleActions.append(toggleBtnEl, editBtnEl, deleteBtnEl);

    item.append(ruleInfo, ruleActions);

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
    // To delete, we effectively set it to null or remove it from storage
    // The storage.js doesn't have a removeLimit function exposed directly,
    // but setLimitForDomain(domain, null) might work if implemented,
    // or we get all limits, delete the key, and save back.
    // Let's check storage.js implementation.

    // Re-implementing delete logic here as it's safer
    const limits = await getLimits();
    delete limits[domain];
    await chrome.storage.local.set({ limits });
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
