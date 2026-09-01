/**
 * Content script for displaying countdown toast notifications
 * Shows remaining visits for limited sites
 */

// Only run once per page
if (!window.focusBearToastInjected) {
  window.focusBearToastInjected = true;

  // Create and inject toast container
  const toastContainer = document.createElement('div');
  toastContainer.id = 'focusbear-toast-container';
  toastContainer.setAttribute('role', 'status');
  toastContainer.setAttribute('aria-live', 'polite');
  toastContainer.setAttribute('aria-atomic', 'true');

  // Inject at document start or when DOM is ready
  const injectToast = () => {
    if (document.body) {
      document.body.appendChild(toastContainer);
      return;
    }

    // Retry when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(toastContainer);
      });
    }
  };

  injectToast();

  /**
   * Show a toast notification
   * @param {string} domain - The domain name
   * @param {number} remaining - Number of visits remaining
   * @param {number} limit - Total daily limit
   */
  const showToast = (domain, remaining, limit, limitType = 'daily') => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'focusbear-toast';
    toast.setAttribute('role', 'alert');

    // Determine severity
    let severity = 'info';
    const percentRemaining = (remaining / limit) * 100;
    if (remaining === 0) {
      severity = 'danger';
    } else if (percentRemaining <= 20) {
      severity = 'warning';
    }

    toast.classList.add(`focusbear-toast-${severity}`);

    // Build message text
    const limitLabel = limitType === 'fiveHour' ? '5-hour window' : 'day';
    const timeframeLabel = limitType === 'fiveHour' ? 'window' : 'day';
    let messageText;
    if (remaining === 0) {
      messageText = `Limit reached for this ${limitLabel}`;
    } else if (remaining === 1) {
      messageText = `1 visit left this ${timeframeLabel}`;
    } else {
      messageText = `${remaining} visits left this ${limitLabel}`;
    }

    // Icon based on severity
    let icon = '🐻';
    if (severity === 'danger') {
      icon = '🛑';
    } else if (severity === 'warning') {
      icon = '⚠️';
    }

    const iconEl = document.createElement('div');
    iconEl.className = 'focusbear-toast-icon';
    iconEl.textContent = icon;

    const contentEl = document.createElement('div');
    contentEl.className = 'focusbear-toast-content';
    const domainStrong = document.createElement('strong');
    domainStrong.textContent = domain;
    contentEl.appendChild(domainStrong);
    contentEl.appendChild(document.createElement('br'));
    contentEl.appendChild(document.createTextNode(messageText));

    toast.append(iconEl, contentEl);

    // Add to container
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('focusbear-toast-visible');
    }, 10);

    // Auto-hide after 3.5 seconds
    setTimeout(() => {
      toast.classList.remove('focusbear-toast-visible');
      // Remove from DOM after fade out
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3500);
  };

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SHOW_COUNTDOWN_TOAST') {
      // prettier-ignore
      const {
        domain,
        remaining,
        limit,
        limitType,
      } = message;
      showToast(domain, remaining, limit, limitType);
      sendResponse({ success: true });
    }
    return false; // No async response needed
  });
}
