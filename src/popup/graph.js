/**
 * FocusBear D3.js Radial Graph
 * Interactive visualization of focus visit data
 */

/**
 * Categorize domain into a group for visual clustering
 * @param {string} domain - Domain name
 * @returns {Object} - Category info {name, color}
 */
function categorizeDomain(domain) {
  const categories = {
    social: {
      keywords: [
        'facebook',
        'twitter',
        'instagram',
        'linkedin',
        'reddit',
        'tiktok',
        'snapchat',
        'pinterest',
      ],
      name: 'Social Media',
      color: '#ec4899', // Pink
    },
    productivity: {
      keywords: ['gmail', 'outlook', 'slack', 'notion', 'trello', 'asana', 'jira', 'confluence'],
      name: 'Productivity',
      color: '#10b981', // Green
    },
    development: {
      keywords: [
        'github',
        'gitlab',
        'stackoverflow',
        'dev.to',
        'codepen',
        'codesandbox',
        'repl.it',
      ],
      name: 'Development',
      color: '#8b5cf6', // Purple
    },
    entertainment: {
      keywords: ['youtube', 'netflix', 'twitch', 'spotify', 'soundcloud', 'hulu', 'disney'],
      name: 'Entertainment',
      color: '#f59e0b', // Orange
    },
    news: {
      keywords: ['news', 'cnn', 'bbc', 'nytimes', 'guardian', 'medium', 'substack'],
      name: 'News & Media',
      color: '#06b6d4', // Cyan
    },
    shopping: {
      keywords: ['amazon', 'ebay', 'etsy', 'shopify', 'walmart', 'target', 'alibaba'],
      name: 'Shopping',
      color: '#f43f5e', // Rose
    },
  };

  const domainLower = domain.toLowerCase();

  for (const [key, category] of Object.entries(categories)) {
    if (category.keywords.some((keyword) => domainLower.includes(keyword))) {
      return { name: category.name, color: category.color, key };
    }
  }

  return { name: 'Other', color: '#94a3b8', key: 'other' }; // Gray
}

/**
 * Helper function to get node outline color based on limit status
 * @param {string} domain - Domain name
 * @param {Object} aggregatedData - Domain visit data
 * @param {Object} limits - User-configured limits
 * @returns {string} - Color hex code
 */
function getNodeOutlineColor(domain, aggregatedData, limits) {
  const limitConfig = limits[domain];
  if (!limitConfig || !limitConfig.enabled) {
    return '#1e40af'; // Default blue for no limit
  }

  const domainData = aggregatedData[domain];
  if (!domainData) return '#1e40af';

  const count = domainData.count || 0;
  const dailyLimit = limitConfig.daily?.limit;

  if (!dailyLimit || !limitConfig.daily?.enabled) {
    return '#1e40af'; // Default blue if no daily limit configured
  }

  const ratio = count / dailyLimit;

  if (ratio >= 1) return '#ef4444'; // Red - over limit
  if (ratio >= 0.8) return '#f59e0b'; // Orange - near limit
  return '#10b981'; // Green - under limit
}

/**
 * Render radial graph visualization
 * @param {HTMLElement} container - Container element for graph
 * @param {Object} data - Domain visit data
 * @param {Object} options - Visualization options
 */
export function renderRadialGraph(container, data, options = {}) {
  // Calculate responsive dimensions based on container
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width || options.width || 400;
  const containerHeight = containerRect.height || options.height || 450;

  const { highlightedDomain = null, badges = {}, limits = {} } = options;
  const width = Math.max(containerWidth - 16, 300); // Subtract 8px padding on each side
  const height = Math.max(containerHeight - 16, 300);

  // Performance monitoring
  const graphPerfStart = performance.now();

  // Drilldown state (reserved for future enhancement)
  let drilledDownDomain = null; // eslint-disable-line no-unused-vars
  let currentView = 'domains'; // eslint-disable-line no-unused-vars
  // 'domains' or 'subpaths'

  // Clear existing content
  container.innerHTML = '';

  // No data state
  if (!data || Object.keys(data).length === 0) {
    container.innerHTML = '<div class="graph-empty">No data to visualize yet</div>';
    return;
  }

  // Import D3 from CDN (loaded in popup.html)
  const { d3 } = window;
  if (!d3) {
    console.error('D3.js not loaded');
    container.innerHTML = '<div class="graph-error">Visualization library not loaded</div>';
    return;
  }

  // Prepare nodes data with category information
  const domains = Object.entries(data).map(([domain, domainData]) => {
    const category = categorizeDomain(domain);
    return {
      id: domain,
      count: domainData.count,
      lastVisit: domainData.lastVisit,
      subpaths: domainData.subpaths || {},
      category: category.key,
      categoryName: category.name,
      categoryColor: category.color,
    };
  });

  // Sort by count and limit to top domains
  domains.sort((a, b) => b.count - a.count);
  const maxNodes = 50;
  const topDomains = domains.slice(0, maxNodes).map((d, index) => ({
    ...d,
    rank: index + 1, // Add rank for label visibility logic
  }));

  // Calculate node sizes based on visit count
  const maxCount = Math.max(...topDomains.map((d) => d.count));
  const minCount = Math.min(...topDomains.map((d) => d.count));

  const sizeScale = d3.scaleLinear().domain([minCount, maxCount]).range([8, 30]);

  // Create center node (user)
  const centerNode = {
    id: 'you',
    count: 0,
    isCenter: true,
    fx: width / 2,
    fy: height / 2,
  };

  // Combine center and domain nodes
  const nodes = [centerNode, ...topDomains.map((d) => ({ ...d, isCenter: false }))];

  // Create links from center to all domains
  const links = topDomains.map((d) => ({
    source: 'you',
    target: d.id,
  }));

  // Create SVG
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Radial graph showing focus visit distribution');

  // Create a group for zoom/pan transformations
  const gZoom = svg.append('g').attr('class', 'zoom-group');

  // Create category-based grouping force
  // Position nodes in a circular layout based on category
  const categoryAngles = {
    social: 0,
    productivity: Math.PI / 3,
    development: (2 * Math.PI) / 3,
    entertainment: Math.PI,
    news: (4 * Math.PI) / 3,
    shopping: (5 * Math.PI) / 3,
    other: Math.PI / 2,
  };

  const categoryForce = (alpha) => {
    nodes.forEach((node) => {
      if (node.isCenter) return;

      const angle = categoryAngles[node.category] || 0;
      const radius = 150; // Distance from center for category clustering
      const targetX = width / 2 + radius * Math.cos(angle);
      const targetY = height / 2 + radius * Math.sin(angle);

      node.vx += (targetX - node.x) * alpha * 0.1;
      node.vy += (targetY - node.y) * alpha * 0.1;
    });
  };

  // Create force simulation with improved collision detection and category grouping
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(120) // Increased from 100 for more spacing
        .strength(0.5),
    )
    .force('charge', d3.forceManyBody().strength(-250)) // Increased from -200 for more repulsion
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3
        .forceCollide()
        .radius((d) => (d.isCenter ? 45 : sizeScale(d.count) + 15)) // Increased padding for labels
        .strength(0.8), // Increased from default 0.7
    )
    .force('category', categoryForce); // Add category grouping force

  // Create link elements
  const link = gZoom
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#d1d5db')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.6);

  // Create node group
  const nodeGroup = gZoom
    .append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .style('cursor', 'pointer')
    .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

  // Add circles for nodes with color-coding by limit status
  nodeGroup
    .append('circle')
    .attr('r', (d) => (d.isCenter ? 35 : sizeScale(d.count)))
    .attr('fill', (d) => {
      if (d.isCenter) return '#3b82f6'; // Primary blue for center
      if (highlightedDomain && d.id === highlightedDomain) return '#f59e0b'; // Warning amber
      return '#60a5fa'; // Primary light blue for nodes
    })
    .attr('stroke', (d) => {
      if (d.isCenter) return '#1e40af';
      if (highlightedDomain && d.id === highlightedDomain) return '#ef4444';
      // Color-code by limit status
      return getNodeOutlineColor(d.id, data, limits);
    })
    .attr('stroke-width', 3) // Increased from 2 for better visibility
    .attr('opacity', 0.9)
    .attr('class', (d) => {
      if (d.isCenter) return '';
      // Add CSS class for potential pulsing animation
      const limitConfig = limits[d.id];
      if (limitConfig && limitConfig.enabled && limitConfig.daily?.enabled) {
        const count = d.count || 0;
        const dailyLimit = limitConfig.daily.limit;
        if (count >= dailyLimit) return 'node-over-limit';
      }
      return '';
    });

  // Add count labels (weight in center of circle)
  nodeGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => (d.isCenter ? 5 : 4))
    .attr('fill', 'white')
    .attr('font-size', (d) => (d.isCenter ? '14px' : '11px'))
    .attr('font-weight', 600)
    .attr('pointer-events', 'none')
    .style('text-shadow', '0 1px 3px rgba(0,0,0,0.5)')
    .text((d) => {
      if (d.isCenter) return 'You';
      return d.count;
    });

  // Dark mode only - optimized for dark blue theme - improved for readability
  const domainTextColor = '#f8fafc'; // Brighter text (was #e2e8f0)
  const domainTextShadow = '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)'; // Enhanced shadow

  // Track current zoom level for label visibility
  let currentZoomLevel = 1;

  // Helper function to determine label visibility
  function shouldShowLabel(node, zoomLevel) {
    if (node.isCenter) return true;
    // Show top 5 domains by default, reveal all when zoomed in > 150%
    if (zoomLevel > 1.5) return true;
    return node.rank <= 5;
  }

  // Add domain name labels (below the circle) with dynamic visibility
  const domainLabels = nodeGroup
    .filter((d) => !d.isCenter)
    .append('text')
    .attr('class', 'domain-label')
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => sizeScale(d.count) + 16) // Slightly lower for better spacing
    .attr('fill', domainTextColor)
    .attr('font-size', (d) => (d.rank <= 5 ? '13px' : '11px')) // Larger for top 5
    .attr('font-weight', 700) // Heavier weight (was 600)
    .attr('pointer-events', 'none')
    .style('text-shadow', domainTextShadow)
    .style('opacity', (d) => (shouldShowLabel(d, currentZoomLevel) ? 1 : 0))
    .text((d) => (d.id.length > 15 ? `${d.id.substring(0, 13)}...` : d.id));

  // Add Focus Hero badges
  nodeGroup
    .filter((d) => !d.isCenter && badges[d.id])
    .append('text')
    .attr('class', 'badge-icon')
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => -sizeScale(d.count) - 8)
    .attr('font-size', '16px')
    .attr('pointer-events', 'none')
    .text('🏆')
    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
    .style('animation', 'badge-pulse 2s ease-in-out infinite');

  // Add tooltips
  const tooltip = d3
    .select(container)
    .append('div')
    .attr('class', 'graph-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', '#111827')
    .style('color', '#f9fafb')
    .style('padding', '8px 12px')
    .style('border-radius', '6px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('box-shadow', '0 8px 30px rgba(15,23,42,0.25)');

  // Track focused node
  let focusedNode = null;

  nodeGroup
    .on('click', (event, d) => {
      if (d.isCenter) {
        // Clicking center resets focus
        focusedNode = null;
        nodeGroup.selectAll('circle').attr('opacity', 0.9);
        link.attr('stroke-opacity', 0.6);
        return;
      }

      // Toggle focus on clicked node
      if (focusedNode === d.id) {
        // Unfocus if clicking the same node
        focusedNode = null;
        nodeGroup.selectAll('circle').attr('opacity', 0.9);
        link.attr('stroke-opacity', 0.6);
      } else {
        // Focus on the clicked node
        focusedNode = d.id;

        // Dim all nodes
        nodeGroup.selectAll('circle').attr('opacity', (n) => {
          if (n.isCenter) return 0.9;
          return n.id === focusedNode ? 1 : 0.3;
        });

        // Dim unrelated links
        link.attr('stroke-opacity', (l) => (l.target.id === focusedNode ? 1 : 0.15));
      }
    })
    .on('dblclick', (event, d) => {
      if (d.isCenter) return;

      // Double-click triggers subpath drilldown
      const hasSubpaths = d.subpaths && Object.keys(d.subpaths).length > 0;
      if (hasSubpaths) {
        drilledDownDomain = d.id;
        currentView = 'subpaths';

        // Dispatch event for dashboard to show subpath table
        window.dispatchEvent(
          new CustomEvent('domainDrilldown', {
            detail: {
              domain: d.id,
              domainData: d,
            },
          }),
        );

        renderSubpathView(d.id);
      } else {
        // Show message if no subpaths
        tooltip.html(`
          <strong>${d.id}</strong><br/>
          No subpaths tracked yet
        `);
        tooltip.style('visibility', 'visible');
        setTimeout(() => {
          tooltip.style('visibility', 'hidden');
        }, 2000);
      }
    })
    .on('mouseenter', function (event, d) {
      if (d.isCenter) return;

      // Highlight node (unless focused on a different node)
      if (!focusedNode || focusedNode === d.id) {
        d3.select(this).select('circle').attr('opacity', 1).attr('stroke-width', 3);
      }

      // Always show label on hover for better readability
      d3.select(this).select('.domain-label').style('opacity', 1);

      // Show tooltip with enhanced information
      const subpathCount = Object.keys(d.subpaths).length;
      const lastVisitDate = new Date(d.lastVisit).toLocaleString();

      const drilldownHint = subpathCount > 0
        ? '<br/><em style="color: #93c5fd;">💡 Double-click to explore subpaths</em>'
        : '';
      const badgeInfo = badges[d.id]
        ? `<br/><strong style="color: #FFD700;">🏆 Focus Hero (${badges[d.id].streak} days!)</strong>`
        : '';

      // Enhanced tooltip with full domain name (no truncation)
      tooltip.html(`
        <div style="max-width: 300px;">
          <strong style="font-size: 13px; color: #60a5fa;">${d.id}</strong><br/>
          <span style="color: #d1d5db;">Visits: <strong style="color: #fff;">${d.count}</strong></span><br/>
          <span style="color: #d1d5db;">Subpaths: <strong style="color: #fff;">${subpathCount}</strong></span><br/>
          <span style="color: #d1d5db; font-size: 11px;">Last: ${lastVisitDate}</span>${badgeInfo}${drilldownHint}
        </div>
      `);
      tooltip.style('visibility', 'visible');
    })
    .on('mousemove', (event) => {
      tooltip.style('top', `${event.pageY - 60}px`).style('left', `${event.pageX + 10}px`);
    })
    .on('mouseleave', function (event, d) {
      // Only reset opacity if not focused on this node
      if (!focusedNode || focusedNode === d.id) {
        const targetOpacity = focusedNode === d.id ? 1 : 0.9;
        d3.select(this).select('circle').attr('opacity', targetOpacity).attr('stroke-width', 2);
      }

      // Reset label opacity based on zoom level and rank
      d3.select(this)
        .select('.domain-label')
        .style('opacity', shouldShowLabel(d, currentZoomLevel) ? 1 : 0);

      tooltip.style('visibility', 'hidden');
    });

  // Update positions on simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
  });

  // Add zoom behavior with label visibility updates
  const zoomBehavior = d3.zoom().on('zoom', (event) => {
    gZoom.attr('transform', event.transform);

    // Update current zoom level
    currentZoomLevel = event.transform.k;

    // Update label visibility based on zoom level
    domainLabels.style('opacity', (d) => (shouldShowLabel(d, currentZoomLevel) ? 1 : 0));

    // Update legend zoom display
    const zoomLevelEl = document.getElementById('zoom-level');
    if (zoomLevelEl) {
      zoomLevelEl.textContent = `${Math.round(currentZoomLevel * 100)}%`;
    }
  });

  svg.call(zoomBehavior);

  // Add zoom controls (+ and - buttons)
  const zoomControls = d3
    .select(container)
    .append('div')
    .attr('class', 'graph-zoom-controls')
    .style('position', 'absolute')
    .style('top', '8px')
    .style('right', '8px')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('gap', '6px')
    .style('z-index', '10');

  // Zoom in button
  zoomControls
    .append('button')
    .attr('class', 'zoom-btn zoom-in-btn')
    .attr('aria-label', 'Zoom in')
    .attr('title', 'Zoom in (+)')
    .style('width', '32px')
    .style('height', '32px')
    .style('padding', '0')
    .style('border', '1px solid #d1d5db')
    .style('background', 'white')
    .style('border-radius', '4px')
    .style('cursor', 'pointer')
    .style('font-size', '16px')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('justify-content', 'center')
    .style('transition', 'all 0.2s')
    .text('+')
    .on('mouseover', function () {
      d3.select(this).style('background', '#f3f4f6').style('border-color', '#0e75b6');
    })
    .on('mouseout', function () {
      d3.select(this).style('background', 'white').style('border-color', '#d1d5db');
    })
    .on('click', () => {
      const newScale = svg.property('__zoom').k * 1.2;
      svg.transition().duration(300).call(zoomBehavior.scaleTo, newScale);
    });

  // Zoom out button
  zoomControls
    .append('button')
    .attr('class', 'zoom-btn zoom-out-btn')
    .attr('aria-label', 'Zoom out')
    .attr('title', 'Zoom out (−)')
    .style('width', '32px')
    .style('height', '32px')
    .style('padding', '0')
    .style('border', '1px solid #d1d5db')
    .style('background', 'white')
    .style('border-radius', '4px')
    .style('cursor', 'pointer')
    .style('font-size', '16px')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('justify-content', 'center')
    .style('transition', 'all 0.2s')
    .text('−')
    .on('mouseover', function () {
      d3.select(this).style('background', '#f3f4f6').style('border-color', '#0e75b6');
    })
    .on('mouseout', function () {
      d3.select(this).style('background', 'white').style('border-color', '#d1d5db');
    })
    .on('click', () => {
      const newScale = svg.property('__zoom').k / 1.2;
      svg.transition().duration(300).call(zoomBehavior.scaleTo, newScale);
    });

  // Reset zoom button
  zoomControls
    .append('button')
    .attr('class', 'zoom-btn zoom-reset-btn')
    .attr('aria-label', 'Reset zoom')
    .attr('title', 'Reset zoom (R)')
    .style('width', '32px')
    .style('height', '32px')
    .style('padding', '0')
    .style('border', '1px solid #d1d5db')
    .style('background', 'white')
    .style('border-radius', '4px')
    .style('cursor', 'pointer')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('justify-content', 'center')
    .style('transition', 'all 0.2s')
    .text('R')
    .on('mouseover', function () {
      d3.select(this).style('background', '#f3f4f6').style('border-color', '#0e75b6');
    })
    .on('mouseout', function () {
      d3.select(this).style('background', 'white').style('border-color', '#d1d5db');
    })
    .on('click', () => {
      svg.transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity);
    });

  // Add keyboard shortcuts for zoom
  document.addEventListener('keydown', (event) => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      const newScale = svg.property('__zoom').k * 1.2;
      svg.transition().duration(300).call(zoomBehavior.scaleTo, newScale);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      const newScale = svg.property('__zoom').k / 1.2;
      svg.transition().duration(300).call(zoomBehavior.scaleTo, newScale);
    } else if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      svg.transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity);
    }
  });

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    if (!d.isCenter) {
      // Allow non-center nodes to float after drag
      d.fx = null;
      d.fy = null;
    }
  }

  // Function to render subpath drilldown view
  function renderSubpathView(domainId) {
    const domainData = topDomains.find((d) => d.id === domainId);
    if (!domainData || !domainData.subpaths) return;

    const subpaths = Object.entries(domainData.subpaths).map(([path, pathData]) => ({
      id: `${domainId}${path}`,
      domain: domainId,
      subpath: path,
      count: pathData.count,
      lastVisit: pathData.lastVisit,
      isSubpath: true,
    }));

    // Sort by count and limit
    subpaths.sort((a, b) => b.count - a.count);
    const topSubpaths = subpaths.slice(0, 20);

    if (topSubpaths.length === 0) {
      return; // No subpaths to show
    }

    // Clear existing visualization
    simulation.stop();
    svg.selectAll('*').remove();

    // Create center node (domain)
    const domainCenterNode = {
      id: domainId,
      count: domainData.count,
      isCenter: true,
      isDomain: true,
      fx: width / 2,
      fy: height / 2,
    };

    // Calculate node sizes for subpaths
    const maxSubpathCount = Math.max(...topSubpaths.map((s) => s.count));
    const minSubpathCount = Math.min(...topSubpaths.map((s) => s.count));
    const subpathSizeScale = d3
      .scaleLinear()
      .domain([minSubpathCount, maxSubpathCount])
      .range([6, 20]);

    // Combine center and subpath nodes
    const subpathNodes = [domainCenterNode, ...topSubpaths.map((s) => ({ ...s, isCenter: false }))];

    // Create links from domain to all subpaths
    const subpathLinks = topSubpaths.map((s) => ({
      source: domainId,
      target: s.id,
    }));

    // Create new simulation for subpaths
    const subpathSimulation = d3
      .forceSimulation(subpathNodes)
      .force(
        'link',
        d3
          .forceLink(subpathLinks)
          .id((d) => d.id)
          .distance(80)
          .strength(0.6),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide().radius((d) => (d.isCenter ? 45 : subpathSizeScale(d.count) + 5)),
      );

    // Create link elements
    const subpathLinkEl = svg
      .append('g')
      .selectAll('line')
      .data(subpathLinks)
      .enter()
      .append('line')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.5);

    // Create node group
    const subpathNodeGroup = svg
      .append('g')
      .selectAll('g')
      .data(subpathNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Add circles for nodes
    subpathNodeGroup
      .append('circle')
      .attr('r', (d) => (d.isCenter ? 40 : subpathSizeScale(d.count)))
      .attr('fill', (d) => {
        if (d.isCenter) return '#6C5CE7'; // Focus Purple for domain
        return '#55EFC4'; // Success Green for subpaths
      })
      .attr('stroke', '#E0F4FF')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    // Add count labels (weight in center of circle)
    subpathNodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.isCenter ? 5 : 4))
      .attr('fill', 'white')
      .attr('font-size', (d) => (d.isCenter ? '12px' : '10px'))
      .attr('font-weight', 600)
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.5)')
      .text((d) => {
        if (d.isCenter) {
          return d.id.length > 15 ? `${d.id.substring(0, 13)}...` : d.id;
        }
        return d.count;
      });

    // Add subpath name labels (below the circle)
    subpathNodeGroup
      .filter((d) => !d.isCenter)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => subpathSizeScale(d.count) + 13)
      .attr('fill', '#e5e7eb')
      .attr('font-size', '9px')
      .attr('font-weight', 500)
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)')
      .text((d) => {
        const shortPath = d.subpath.length > 12 ? `${d.subpath.substring(0, 10)}...` : d.subpath;
        return shortPath;
      });

    // Add "Back" button
    const backBtn = svg
      .append('g')
      .attr('class', 'back-button')
      .attr('transform', 'translate(20, 20)')
      .style('cursor', 'pointer')
      .on('click', () => {
        drilledDownDomain = null;
        currentView = 'domains';

        // Dispatch event to reset table
        window.dispatchEvent(new CustomEvent('domainDrilldownExit'));

        renderRadialGraph(container, data, options);
      });

    backBtn
      .append('rect')
      .attr('width', 60)
      .attr('height', 28)
      .attr('rx', 14)
      .attr('fill', '#0E75B6')
      .attr('opacity', 0.9);

    backBtn
      .append('text')
      .attr('x', 30)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 600)
      .text('← Back');

    // Tooltips for subpaths
    subpathNodeGroup
      .on('mouseenter', function (event, d) {
        d3.select(this).select('circle').attr('opacity', 1).attr('stroke-width', 3);

        if (d.isCenter) {
          tooltip.html(`
            <strong>${d.id}</strong><br/>
            Total visits: ${d.count}<br/>
            Click to return to domains
          `);
        } else {
          const lastVisitDate = new Date(d.lastVisit).toLocaleString();
          tooltip.html(`
            <strong>${d.domain}</strong><br/>
            Path: ${d.subpath}<br/>
            Visits: ${d.count}<br/>
            Last visit: ${lastVisitDate}
          `);
        }
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', (event) => {
        tooltip.style('top', `${event.pageY - 60}px`).style('left', `${event.pageX + 10}px`);
      })
      .on('mouseleave', function () {
        d3.select(this).select('circle').attr('opacity', 0.9).attr('stroke-width', 2);
        tooltip.style('visibility', 'hidden');
      })
      .on('click', (event, d) => {
        if (d.isCenter) {
          // Exit drilldown
          drilledDownDomain = null;
          currentView = 'domains';

          // Dispatch event to reset table
          window.dispatchEvent(new CustomEvent('domainDrilldownExit'));

          renderRadialGraph(container, data, options);
        }
      });

    // Update positions on simulation tick
    subpathSimulation.on('tick', () => {
      subpathLinkEl
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      subpathNodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Update cleanup to stop subpath simulation
    simulation.stop = () => subpathSimulation.stop();
  }

  // Log performance metrics
  const graphPerfEnd = performance.now();
  const graphRenderTime = Math.round(graphPerfEnd - graphPerfStart);
  const nodeCount = nodes.length;
  console.log(
    `[FocusBear Performance] Graph render time: ${graphRenderTime}ms for ${nodeCount} nodes`,
  );
  if (graphRenderTime > 1000) {
    console.warn('[FocusBear Performance] Graph render time exceeds target of 1000ms');
  }

  // Return cleanup function
  return () => {
    simulation.stop();
    tooltip.remove();
  };
}
