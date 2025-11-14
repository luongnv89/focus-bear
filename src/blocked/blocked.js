/**
 * FocusBear Blocked Page Script
 */

// Get domain from URL params
const urlParams = new URLSearchParams(window.location.search);
const domain = urlParams.get('domain') || 'this site';
const count = urlParams.get('count') || '?';
const limit = urlParams.get('limit') || '?';

// Update page content
document.getElementById('domain-name').textContent = domain;
document.getElementById('visit-count').textContent = count;
document.getElementById('limit-value').textContent = limit;

// Back button - close tab or go to new tab page
document.getElementById('back-btn').addEventListener('click', () => {
  window.close();
  // If window.close() doesn't work (not opened by script), redirect
  setTimeout(() => {
    window.location.href = 'about:blank';
  }, 100);
});

// Settings button - open extension popup (if possible) or show message
document.getElementById('settings-btn').addEventListener('click', () => {
  // Open extension popup in new tab isn't directly possible
  // Instead, we can provide instructions or open the extension page
  alert(
    'To adjust limits:\n\n'
      + '1. Click the FocusBear icon in your toolbar\n'
      + '2. Click the ⚙️ settings button\n'
      + '3. Configure your limits\n\n'
      + 'Or right-click the FocusBear icon and select "Options"',
  );
});
