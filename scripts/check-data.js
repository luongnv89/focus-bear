/**
 * Check FocusBear Data
 * Run this in the browser console to see what data exists
 */

async function checkData() {
  console.log('🔍 Checking FocusBear data...\n');

  const data = await chrome.storage.local.get(['visits', 'limits']);
  const visits = data.visits || {};
  const limits = data.limits || {};

  console.log('📅 Visit Data by Date:');
  console.log('=====================');

  if (Object.keys(visits).length === 0) {
    console.log('❌ No visit data found');
    return;
  }

  let totalDomains = new Set();
  let totalVisits = 0;

  Object.entries(visits).forEach(([date, dateVisits]) => {
    console.log(`\n📆 ${date}:`);
    Object.entries(dateVisits).forEach(([domain, domainData]) => {
      totalDomains.add(domain);
      totalVisits += domainData.count;

      const subpathCount = Object.keys(domainData.subpaths || {}).length;
      console.log(`  • ${domain}: ${domainData.count} visits, ${subpathCount} subpaths`);

      if (domainData.subpaths && Object.keys(domainData.subpaths).length > 0) {
        Object.entries(domainData.subpaths).forEach(([path, pathData]) => {
          console.log(`    ↳ ${path}: ${pathData.count} visits`);
        });
      }
    });
  });

  console.log('\n📊 Summary:');
  console.log('============');
  console.log(`Total dates: ${Object.keys(visits).length}`);
  console.log(`Total unique domains: ${totalDomains.size}`);
  console.log(`Total visits: ${totalVisits}`);

  console.log('\n⚙️  Limits:');
  console.log('===========');
  if (Object.keys(limits).length === 0) {
    console.log('❌ No limits configured');
  } else {
    Object.entries(limits).forEach(([domain, limitConfig]) => {
      const status = limitConfig.enabled ? '✅ Enabled' : '❌ Disabled';
      console.log(`  • ${domain}: ${status}`);
      if (limitConfig.fiveHour?.enabled) {
        console.log(`    ↳ 5-hour: ${limitConfig.fiveHour.limit} visits`);
      }
      if (limitConfig.daily?.enabled) {
        console.log(`    ↳ Daily: ${limitConfig.daily.limit} visits`);
      }
    });
  }

  console.log('\n✅ Data check complete!');
  console.log('\nTo view in dashboard:');
  console.log('1. Open the FocusBear dashboard (click extension icon)');
  console.log('2. You should see domains in the radial graph');
  console.log('3. Double-click on a domain to see the drilldown view');

  return { visits, limits, totalDomains: totalDomains.size, totalVisits };
}

// Auto-run
if (typeof chrome !== 'undefined' && chrome.storage) {
  console.log('🐻 FocusBear Data Checker\n');
  checkData();
}
