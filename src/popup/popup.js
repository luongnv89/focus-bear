import { setupVisualizationPage } from '../common/visualization-page.js';
import { getSettings, updateSettings } from '../background/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const hcToggle = document.getElementById('high-contrast-toggle');
  if (hcToggle) {
    try {
      const settings = await getSettings();
      if (settings.highContrastMode) {
        hcToggle.checked = true;
        document.body.classList.add('high-contrast');
      }
    } catch (err) {
      console.warn('Unable to load high-contrast setting', err);
    }
    hcToggle.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      try {
        await updateSettings({ highContrastMode: enabled });
      } catch (err) {
        console.warn('Unable to save high-contrast setting', err);
      }
      document.body.classList.toggle('high-contrast', enabled);
      const toast = document.getElementById('settings-toast');
      if (toast) {
        toast.textContent = enabled ? 'High contrast enabled' : 'High contrast disabled';
        toast.classList.add('visible');
        toast.style.display = 'block';
        toast.style.opacity = '1';
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            toast.classList.remove('visible');
            toast.style.display = 'none';
          }, 300);
        }, 2000);
      }
    });
  }
  // Apply high-contrast on load even if toggle not present (for dashboard reuse)
  try {
    const s = await getSettings();
    if (s.highContrastMode) document.body.classList.add('high-contrast');
  } catch (err) {
    console.warn('High-contrast init failed', err);
  }
  setupVisualizationPage();
});
