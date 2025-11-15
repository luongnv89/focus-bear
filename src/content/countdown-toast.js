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
    } else {
      // Retry when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(toastContainer);
        });
      }
    }
  };

  injectToast();

  /**
   * Show a toast notification
   * @param {string} domain - The domain name
   * @param {number} remaining - Number of visits remaining
   * @param {number} limit - Total daily limit
   */
  function showToast(domain, remaining, limit) {
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

    // Build message
    let message;
    if (remaining === 0) {
      message = `<strong>${domain}</strong><br/>Limit reached for today`;
    } else if (remaining === 1) {
      message = `<strong>${domain}</strong><br/>1 visit left today`;
    } else {
      message = `<strong>${domain}</strong><br/>${remaining} visits left today`;
    }

    // Icon based on severity
    const icon = severity === 'danger' ? '🛑' : severity === 'warning' ? '⚠️' : '🐻';

    toast.innerHTML = `
      <div class="focusbear-toast-icon">${icon}</div>
      <div class="focusbear-toast-content">${message}</div>
    `;

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
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SHOW_COUNTDOWN_TOAST') {
      const { domain, remaining, limit } = message;
      showToast(domain, remaining, limit);
      sendResponse({ success: true });
    }
    return false; // No async response needed
  });
}
