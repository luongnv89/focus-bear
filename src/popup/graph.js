/**
 * FocusPaw D3.js Bubble Graph
 * Interactive visualization of focus visit data
 */

import { categorizeDomain } from '../common/categories.js';

// Note: getNodeOutlineColor removed - using inline styling instead

/**
 * Render bubble graph visualization
 * @param {HTMLElement} container - Container element for graph
 * @param {Object} data - Domain visit data
 * @param {Object} options - Visualization options
 */
export function renderRadialGraph(container, data, options = {}) {
  // Calculate responsive dimensions based on container
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width || options.width || 400;
  const containerHeight = containerRect.height || options.height || 450;

  const { badges = {} } = options;
  const width = Math.max(containerWidth - 16, 300);
  const height = Math.max(containerHeight - 16, 300);

  // Performance monitoring
  const graphPerfStart = performance.now();

  // Clear existing content
  container.innerHTML = '';

  // No data state
  if (!data || Object.keys(data).length === 0) {
    container.innerHTML = '<div class="graph-empty">No data to visualize yet</div>';
    return;
  }

  // D3 is vendored locally (loaded via vendor/d3.min.js in popup.html / dashboard.html)
  const { d3 } = window;
  if (!d3) {
    console.error('D3.js not loaded');
    container.innerHTML = '<div class="graph-error">Visualization library not loaded</div>';
    return;
  }

  // Create SVG
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Topology graph showing website activity');

  // Create a group for zoom/pan transformations
  const gZoom = svg.append('g').attr('class', 'zoom-group');

  // Tooltip
  const tooltip = d3
    .select(container)
    .append('div')
    .attr('class', 'graph-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.85)')
    .style('color', '#fff')
    .style('padding', '8px 12px')
    .style('border-radius', '8px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('backdrop-filter', 'blur(4px)');

  // Back Button
  const backBtn = document.createElement('button');
  backBtn.className = 'graph-back-btn';
  backBtn.textContent = '← Back to Universe';
  backBtn.style.position = 'absolute';
  backBtn.style.top = '10px';
  backBtn.style.left = '10px';
  backBtn.style.zIndex = '100';
  backBtn.style.padding = '8px 12px';
  backBtn.style.background = 'rgba(255, 255, 255, 0.9)';
  backBtn.style.border = '1px solid #ddd';
  backBtn.style.borderRadius = '20px';
  backBtn.style.cursor = 'pointer';
  backBtn.style.fontSize = '12px';
  backBtn.style.fontWeight = '600';
  backBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  backBtn.style.display = 'none'; // Hidden by default
  backBtn.style.transition = 'all 0.2s ease';

  backBtn.onmouseenter = () => {
    backBtn.style.background = '#fff';
    backBtn.style.transform = 'translateY(-1px)';
    backBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  };
  backBtn.onmouseleave = () => {
    backBtn.style.background = 'rgba(255, 255, 255, 0.9)';
    backBtn.style.transform = 'translateY(0)';
    backBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  };

  backBtn.onclick = () => {
    render({ type: 'domains' });
    window.dispatchEvent(new CustomEvent('domainDrilldownExit'));
  };

  container.style.position = 'relative'; // Ensure container is relative for absolute positioning
  container.appendChild(backBtn);

  let simulation = null;

  // Internal function to render the graph based on state
  function render(viewState) {
    // Clear previous graph elements
    gZoom.selectAll('*').remove();
    if (simulation) simulation.stop();

    // Handle Back Button visibility
    if (viewState.type === 'subpaths') {
      backBtn.style.display = 'block';
    } else {
      backBtn.style.display = 'none';
    }

    const nodes = [];
    const links = [];

    if (viewState.type === 'domains') {
      // --- DOMAINS VIEW ---
      // Center node: You
      nodes.push({
        id: 'You',
        group: 'center',
        r: 40,
        fx: width / 2,
        fy: height / 2,
      });

      // Domain nodes
      const domainNodes = Object.entries(data)
        .filter(([domain]) => domain !== 'localhost' && domain !== '127.0.0.1')
        .map(([domain, domainData]) => {
          const category = categorizeDomain(domain);
          return {
            id: domain,
            group: 'domain',
            count: domainData.count,
            lastVisit: domainData.lastVisit,
            subpaths: domainData.subpaths || {},
            category: category.key,
            categoryName: category.name,
            categoryColor: category.color,
            sentiment: category.sentiment,
          };
        });

      // Sort and limit
      domainNodes.sort((a, b) => b.count - a.count);
      const topDomains = domainNodes.slice(0, 40);

      // Scale for domain nodes
      const maxCount = Math.max(...topDomains.map((d) => d.count), 1);
      const sizeScale = d3.scaleSqrt().domain([0, maxCount]).range([10, 35]);

      topDomains.forEach((d) => {
        d.r = sizeScale(d.count);
        nodes.push(d);
        links.push({ source: 'You', target: d.id });
      });
    } else if (viewState.type === 'subpaths') {
      // --- SUBPATHS VIEW ---
      const { domain } = viewState;
      const domainData = data[domain];
      const category = categorizeDomain(domain);

      // Center node: The Domain
      nodes.push({
        id: domain,
        group: 'center-domain',
        r: 45,
        fx: width / 2,
        fy: height / 2,
        categoryColor: category.color,
        count: domainData.count,
      });

      // Subpath nodes
      const subpaths = Object.entries(domainData.subpaths || {}).map(([path, pathData]) => ({
        id: path,
        group: 'subpath',
        count: pathData.count,
        lastVisit: pathData.lastVisit,
        domain,
      }));

      // Sort and limit subpaths
      subpaths.sort((a, b) => b.count - a.count);
      const topSubpaths = subpaths.slice(0, 30);

      const maxCount = Math.max(...topSubpaths.map((d) => d.count), 1);
      const sizeScale = d3.scaleSqrt().domain([0, maxCount]).range([8, 25]);

      topSubpaths.forEach((d) => {
        d.r = sizeScale(d.count);
        nodes.push(d);
        links.push({ source: domain, target: d.id });
      });
    }

    // --- SIMULATION ---
    simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(viewState.type === 'domains' ? 120 : 100),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force(
        'collide',
        d3.forceCollide().radius((d) => d.r + 5),
      )
      .force('center', d3.forceCenter(width / 2, height / 2));

    // --- DRAW LINKS ---
    const link = gZoom
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.6);

    // --- DRAW NODES ---
    const node = gZoom
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    // Circle
    node
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => {
        if (d.group === 'center') return '#333';
        if (d.group === 'center-domain') return d.categoryColor;
        if (d.group === 'domain') return d.categoryColor;
        return '#888'; // subpath default
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');

    // Count Label (inside circle)
    node
      .filter((d) => d.group !== 'center') // Don't show count for "You" node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', 'white')
      .attr('font-size', (d) => `${Math.min(d.r / 1.5, 12)}px`)
      .attr('font-weight', 700)
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.3)')
      .style('display', (d) => (d.r > 12 ? 'block' : 'none'))
      .text((d) => d.count);

    // Labels
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.r + 15)
      .attr('fill', '#555')
      .attr('font-size', '11px')
      .attr('font-weight', 600)
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.group === 'center') return 'You';
        if (d.id.length > 15) return `${d.id.substring(0, 13)}...`;
        return d.id;
      });

    // Badges
    node
      .filter((d) => badges[d.id])
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => -d.r - 5)
      .attr('font-size', '14px')
      .text('🏆');

    // --- INTERACTIONS ---
    node
      .on('mouseenter', function (event, d) {
        // eslint-disable-next-line newline-per-chained-call
        d3.select(this).select('circle').transition().duration(200).attr('transform', 'scale(1.1)');

        tooltip.selectAll('*').remove();
        if (d.group === 'center') {
          tooltip.append('strong').text('You');
          tooltip.append('br');
          tooltip.append('span').text('Center of your digital universe');
        } else if (d.group === 'domain' || d.group === 'center-domain') {
          tooltip.append('strong').text(d.id);
          tooltip.append('br');
          tooltip
            .append('span')
            .style('opacity', '0.8')
            .text(d.categoryName || 'Website');
          tooltip.append('br');
          tooltip.append('strong').text(String(d.count));
          tooltip.append('span').text(' visits');
          if (badges[d.id]) {
            tooltip.append('br');
            tooltip.append('span').text(`\u{1F3C6} Focus Hero (${badges[d.id].streak} days!)`);
          }
        } else if (d.group === 'subpath') {
          tooltip.append('strong').text(d.id);
          tooltip.append('br');
          tooltip.append('span').text(`Path on ${d.domain}`);
          tooltip.append('br');
          tooltip.append('strong').text(String(d.count));
          tooltip.append('span').text(' visits');
        }
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', (event) => {
        tooltip.style('top', `${event.pageY - 40}px`).style('left', `${event.pageX + 10}px`);
      })
      .on('mouseleave', function () {
        // eslint-disable-next-line newline-per-chained-call
        d3.select(this).select('circle').transition().duration(200).attr('transform', 'scale(1)');
        tooltip.style('visibility', 'hidden');
      })
      .on('click', (event, d) => {
        if (d.group === 'domain') {
          // Drilldown to domain
          render({ type: 'subpaths', domain: d.id });

          // Dispatch event for dashboard table
          window.dispatchEvent(
            new CustomEvent('domainDrilldown', {
              detail: {
                domain: d.id,
                domainData: data[d.id],
              },
            }),
          );
        } else if (d.group === 'center-domain') {
          // Go back to main view
          render({ type: 'domains' });

          // Dispatch event for dashboard table reset
          window.dispatchEvent(new CustomEvent('domainDrilldownExit'));
        }
      });

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
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
      if (d.group !== 'center' && d.group !== 'center-domain') {
        d.fx = null;
        d.fy = null;
      }
    }
  }

  // Initial render
  render({ type: 'domains' });

  // Zoom behavior
  const zoomBehavior = d3
    .zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      gZoom.attr('transform', event.transform);
    });

  svg.call(zoomBehavior);

  // Log performance metrics
  const graphPerfEnd = performance.now();
  const graphRenderTime = Math.round(graphPerfEnd - graphPerfStart);
  console.log(`[FocusPaw Performance] Graph init time: ${graphRenderTime}ms`);

  // Return cleanup function
  return () => {
    if (simulation) simulation.stop();
    tooltip.remove();
    backBtn.remove();
  };
}
