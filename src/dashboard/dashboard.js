import { setupVisualizationPage } from '../common/visualization-page.js';

document.addEventListener('DOMContentLoaded', () => {
  setupVisualizationPage({
    fullPage: true,
    graphDimensions: {
      width: 900,
      height: 600,
    },
    listLimit: 20,
  });
});
