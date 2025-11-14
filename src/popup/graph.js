/**
 * FocusBear D3.js Radial Graph
 * Interactive visualization of focus visit data
 */

/**
 * Render radial graph visualization
 * @param {HTMLElement} container - Container element for graph
 * @param {Object} data - Domain visit data
 * @param {Object} options - Visualization options
 */
export function renderRadialGraph(container, data, options = {}) {
  const { width = 400, height = 450, highlightedDomain = null } = options;

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

  // Prepare nodes data
  const domains = Object.entries(data).map(([domain, domainData]) => ({
    id: domain,
    count: domainData.count,
    lastVisit: domainData.lastVisit,
    subpaths: domainData.subpaths || {},
  }));

  // Sort by count and limit to top domains
  domains.sort((a, b) => b.count - a.count);
  const maxNodes = 50;
  const topDomains = domains.slice(0, maxNodes);

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

  // Create force simulation
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(100)
        .strength(0.5)
    )
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3.forceCollide().radius((d) => (d.isCenter ? 40 : sizeScale(d.count) + 5))
    );

  // Create link elements
  const link = svg
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#e1e8ed')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.6);

  // Create node group
  const nodeGroup = svg
    .append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

  // Add circles for nodes
  nodeGroup
    .append('circle')
    .attr('r', (d) => (d.isCenter ? 35 : sizeScale(d.count)))
    .attr('fill', (d) => {
      if (d.isCenter) return '#6C5CE7'; // Focus Purple for center
      if (highlightedDomain && d.id === highlightedDomain) return '#FF9F43'; // Warning Orange
      return '#0E75B6'; // Bear Blue
    })
    .attr('stroke', (d) => {
      if (highlightedDomain && d.id === highlightedDomain) return '#D63031';
      return 'white';
    })
    .attr('stroke-width', 2)
    .attr('opacity', 0.9);

  // Add labels
  nodeGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => (d.isCenter ? 5 : 4))
    .attr('fill', 'white')
    .attr('font-size', (d) => (d.isCenter ? '14px' : '10px'))
    .attr('font-weight', 600)
    .attr('pointer-events', 'none')
    .text((d) => {
      if (d.isCenter) return 'You';
      // Show domain name or count based on node size
      if (sizeScale(d.count) > 15) {
        // Truncate long domains
        return d.id.length > 12 ? `${d.id.substring(0, 10)}...` : d.id;
      }
      return d.count;
    });

  // Add tooltips
  const tooltip = d3
    .select(container)
    .append('div')
    .attr('class', 'graph-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(47, 54, 64, 0.95)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '6px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.2)');

  nodeGroup
    .on('mouseenter', function (event, d) {
      if (d.isCenter) return;

      // Highlight node
      d3.select(this).select('circle').attr('opacity', 1).attr('stroke-width', 3);

      // Show tooltip
      const subpathCount = Object.keys(d.subpaths).length;
      const lastVisitDate = new Date(d.lastVisit).toLocaleString();

      tooltip.html(`
        <strong>${d.id}</strong><br/>
        Visits: ${d.count}<br/>
        Subpaths: ${subpathCount}<br/>
        Last visit: ${lastVisitDate}
      `);
      tooltip.style('visibility', 'visible');
    })
    .on('mousemove', (event) => {
      tooltip.style('top', `${event.pageY - 60}px`).style('left', `${event.pageX + 10}px`);
    })
    .on('mouseleave', function () {
      d3.select(this).select('circle').attr('opacity', 0.9).attr('stroke-width', 2);
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

  // Return cleanup function
  return () => {
    simulation.stop();
    tooltip.remove();
  };
}
