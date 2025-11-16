/**
 * Test Date Parsing for Today Filter
 * Run this in dashboard console to see what's happening
 */

async function testDateParsing() {
  console.log('🧪 Testing Date Parsing\n');

  const data = await chrome.storage.local.get(['visits']);
  const visits = data.visits || {};

  console.log('📦 Storage contains dates:', Object.keys(visits));

  // Simulate "today" filter logic
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  console.log('\n📅 Current Time:');
  console.log('Now:', now);
  console.log('Today (local midnight):', today);

  console.log('\n🔍 Testing date comparisons:\n');

  Object.keys(visits).forEach(dateKey => {
    console.log(`Testing "${dateKey}":`);

    // OLD WAY (broken)
    const oldParse = new Date(dateKey);
    console.log(`  Old: new Date("${dateKey}") =`, oldParse);
    console.log(`  Old result: >= today? ${oldParse >= today}, <= now? ${oldParse <= now}`);
    console.log(`  Old INCLUDED? ${oldParse >= today && oldParse <= now}`);

    // NEW WAY (fixed)
    const [year, month, day] = dateKey.split('-').map(Number);
    const newParse = new Date(year, month - 1, day);
    console.log(`  New: new Date(${year}, ${month - 1}, ${day}) =`, newParse);
    console.log(`  New result: >= today? ${newParse >= today}, <= now? ${newParse <= now}`);
    console.log(`  New INCLUDED? ${newParse >= today && newParse <= now}`);
    console.log('');
  });

  console.log('\n💡 If OLD shows "INCLUDED? false" but NEW shows "INCLUDED? true",');
  console.log('   then the fix works but the extension needs to be reloaded!\n');
}

// Auto-run
if (typeof chrome !== 'undefined' && chrome.storage) {
  testDateParsing();
}
