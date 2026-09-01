/**
 * Debug Visualization Data Loading
 * Run this in the dashboard console to see why data isn't showing
 */

async function debugVisualization() {
  console.log('🔍 Debugging FocusPaw Visualization\n');

  const data = await chrome.storage.local.get(['visits']);
  const visits = data.visits || {};

  console.log('📦 Raw Storage Data:');
  console.log('Dates in storage:', Object.keys(visits));

  // Simulate loadAggregatedStats for 'today'
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  console.log('\n📅 Date Filtering (for "today" range):');
  console.log('Now:', now.toISOString());
  console.log('Today start:', today.toISOString());

  const aggregated = {};

  Object.entries(visits).forEach(([dateKey, dateVisits]) => {
    const visitDate = new Date(dateKey);
    console.log(`\nChecking ${dateKey}:`);
    console.log(`  Parsed as: ${visitDate.toISOString()}`);
    console.log(`  >= startDate? ${visitDate >= today}`);
    console.log(`  <= now? ${visitDate <= now}`);
    console.log(`  Included? ${visitDate >= today && visitDate <= now}`);

    if (visitDate >= today && visitDate <= now) {
      Object.entries(dateVisits).forEach(([domain, domainData]) => {
        if (!aggregated[domain]) {
          aggregated[domain] = {
            count: 0,
            lastVisit: domainData.lastVisit,
            subpaths: {},
          };
        }
        aggregated[domain].count += domainData.count;
        if (domainData.lastVisit > aggregated[domain].lastVisit) {
          aggregated[domain].lastVisit = domainData.lastVisit;
        }

        Object.entries(domainData.subpaths || {}).forEach(([subpath, subpathData]) => {
          if (!aggregated[domain].subpaths[subpath]) {
            aggregated[domain].subpaths[subpath] = {
              count: 0,
              lastVisit: subpathData.lastVisit,
            };
          }
          aggregated[domain].subpaths[subpath].count += subpathData.count;
          if (subpathData.lastVisit > aggregated[domain].subpaths[subpath].lastVisit) {
            aggregated[domain].subpaths[subpath].lastVisit = subpathData.lastVisit;
          }
        });
      });
    }
  });

  console.log('\n📊 Aggregated Result:');
  console.log('Domains found:', Object.keys(aggregated));
  console.log('Total domains:', Object.keys(aggregated).length);

  if (Object.keys(aggregated).length > 0) {
    console.log('\n✅ Data aggregated successfully!');
    console.log('Sample domains:');
    Object.keys(aggregated).slice(0, 5).forEach(domain => {
      const subpathCount = Object.keys(aggregated[domain].subpaths).length;
      console.log(`  • ${domain}: ${aggregated[domain].count} visits, ${subpathCount} subpaths`);
    });
  } else {
    console.log('\n❌ No data after aggregation!');
    console.log('\nPossible issues:');
    console.log('1. Date format mismatch in storage');
    console.log('2. Date comparison logic issue');
    console.log('3. Time zone differences');

    console.log('\n🔧 Try viewing data with "Week" or "Month" filter instead');
  }

  return aggregated;
}

// Auto-run
if (typeof chrome !== 'undefined' && chrome.storage) {
  debugVisualization();
}
