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

  // Performance monitoring
  const graphPerfStart = performance.now();

  // Drilldown state
  let drilledDownDomain = null;
  let currentView = 'domains'; // 'domains' or 'subpaths'

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
        .strength(0.5),
    )
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3.forceCollide().radius((d) => (d.isCenter ? 40 : sizeScale(d.count) + 5)),
    );

  // Create link elements
  const link = svg
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#d1d5db')
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
    .style('cursor', 'pointer')
    .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

  // Add circles for nodes
  nodeGroup
    .append('circle')
    .attr('r', (d) => (d.isCenter ? 35 : sizeScale(d.count)))
    .attr('fill', (d) => {
      if (d.isCenter) return '#6C5CE7'; // Focus Purple for center
      if (highlightedDomain && d.id === highlightedDomain) return '#FF9F43'; // Warning Orange
      return '#5DADE2'; // Brand Primary dark
    })
    .attr('stroke', (d) => {
      if (highlightedDomain && d.id === highlightedDomain) return '#D63031';
      return '#E0F4FF';
    })
    .attr('stroke-width', 2)
    .attr('opacity', 0.9);

  // Add labels
  nodeGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => (d.isCenter ? 5 : 4))
    .attr('fill', (d) => (d.isCenter ? 'white' : '#111827'))
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
    .on('click', function (event, d) {
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
        link.attr('stroke-opacity', (l) => {
          return l.target.id === focusedNode ? 1 : 0.15;
        });
      }
    })
    .on('dblclick', function (event, d) {
      if (d.isCenter) return;

      // Double-click triggers subpath drilldown
      const hasSubpaths = d.subpaths && Object.keys(d.subpaths).length > 0;
      if (hasSubpaths) {
        drilledDownDomain = d.id;
        currentView = 'subpaths';
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

      // Show tooltip
      const subpathCount = Object.keys(d.subpaths).length;
      const lastVisitDate = new Date(d.lastVisit).toLocaleString();

      const drilldownHint = subpathCount > 0 ? '<br/><em>Double-click to explore subpaths</em>' : '';

      tooltip.html(`
        <strong>${d.id}</strong><br/>
        Visits: ${d.count}<br/>
        Subpaths: ${subpathCount}<br/>
        Last visit: ${lastVisitDate}${drilldownHint}
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
    const centerNode = {
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
    const subpathNodes = [centerNode, ...topSubpaths.map((s) => ({ ...s, isCenter: false }))];

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

    // Add labels
    subpathNodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.isCenter ? 5 : 4))
      .attr('fill', (d) => (d.isCenter ? 'white' : '#111827'))
      .attr('font-size', (d) => (d.isCenter ? '12px' : '9px'))
      .attr('font-weight', 600)
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.isCenter) {
          return d.id.length > 15 ? `${d.id.substring(0, 13)}...` : d.id;
        }
        // Show subpath or count
        if (subpathSizeScale(d.count) > 12) {
          const shortPath = d.subpath.length > 10 ? `${d.subpath.substring(0, 8)}...` : d.subpath;
          return shortPath;
        }
        return d.count;
      });

    // Add "Back" button
    const backBtn = svg
      .append('g')
      .attr('class', 'back-button')
      .attr('transform', `translate(20, 20)`)
      .style('cursor', 'pointer')
      .on('click', () => {
        drilledDownDomain = null;
        currentView = 'domains';
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
      .on('click', function (event, d) {
        if (d.isCenter) {
          // Exit drilldown
          drilledDownDomain = null;
          currentView = 'domains';
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
  console.log(`[FocusBear Performance] Graph render time: ${graphRenderTime}ms for ${nodeCount} nodes`);
  if (graphRenderTime > 1000) {
    console.warn(`[FocusBear Performance] Graph render time exceeds target of 1000ms`);
  }

  // Return cleanup function
  return () => {
    simulation.stop();
    tooltip.remove();
  };
}
