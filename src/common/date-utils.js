/**
 * Single local-timezone-aware date utility for FocusBear.
 * Replaces all inline date-key usages.
 */

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Format a Date to YYYY-MM-DD in local timezone.
 * @param {Date} date
 * @returns {string}
 */
export function getDateKey(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

/**
 * Get today's date key in local timezone.
 * @returns {string}
 */
export function getTodayKey() {
  return getDateKey(new Date());
}

/**
 * Parse a YYYY-MM-DD key as a local Date at midnight.
 * @param {string} dateKey
 * @returns {Date}
 */
export function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Get the start of the given date (local midnight).
 * @param {Date} date
 * @returns {Date}
 */
export function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get start of tomorrow (local midnight next day) — exact reset time for daily limits.
 * @param {Date} [from=new Date()]
 * @returns {Date}
 */
export function getNextMidnight(from = new Date()) {
  const t = new Date(from);
  t.setDate(t.getDate() + 1);
  t.setHours(0, 0, 0, 0);
  return t;
}

/**
 * Milliseconds until next local midnight.
 * @param {Date} [from=new Date()]
 * @returns {number}
 */
export function getTimeUntilMidnight(from = new Date()) {
  return getNextMidnight(from).getTime() - from.getTime();
}

/**
 * Get all date keys in an inclusive range (local).
 * @param {string} startKey - YYYY-MM-DD
 * @param {string} endKey - YYYY-MM-DD
 * @returns {string[]}
 */
export function getDateRange(startKey, endKey) {
  const dates = [];
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(getDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/**
 * Get N previous dates before a given date (exclusive).
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} count
 * @returns {string[]}
 */
export function getPreviousDates(dateStr, count) {
  const dates = [];
  const date = parseDateKey(dateStr);
  for (let i = 1; i <= count; i += 1) {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - i);
    dates.push(getDateKey(prev));
  }
  return dates;
}

/**
 * Generate all date keys in a Date object range (inclusive).
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {string[]}
 */
export function getDateKeysInRange(startDate, endDate) {
  const keys = [];
  const cur = new Date(startDate);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    keys.push(getDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return keys;
}

/**
 * Single time-range aggregator: aggregate visits across an inclusive date range.
 * Uses local date comparison to avoid UTC off-by-one.
 * @param {Object} visits - storage visits object keyed by dateKey
 * @param {Date} startDate - inclusive start (local)
 * @param {Date} endDate - inclusive end (local)
 * @returns {Object} aggregated by domain {count, lastVisit, subpaths}
 */
export function aggregateVisitsInRange(visits, startDate, endDate) {
  const aggregated = {};
  const start = getStartOfDay(startDate);
  const end = new Date(endDate);
  // include full end day
  const endDay = getStartOfDay(end);
  Object.entries(visits).forEach(([dateKey, dateVisits]) => {
    const visitDate = parseDateKey(dateKey);
    if (visitDate >= start && visitDate <= endDay) {
      Object.entries(dateVisits).forEach(([domain, domainData]) => {
        if (!aggregated[domain]) {
          aggregated[domain] = { count: 0, lastVisit: domainData.lastVisit, subpaths: {} };
        }
        aggregated[domain].count += domainData.count || 0;
        if (domainData.lastVisit > aggregated[domain].lastVisit) {
          aggregated[domain].lastVisit = domainData.lastVisit;
        }
        Object.entries(domainData.subpaths || {}).forEach(([sp, spData]) => {
          if (!aggregated[domain].subpaths[sp]) {
            aggregated[domain].subpaths[sp] = { count: 0, lastVisit: spData.lastVisit };
          }
          aggregated[domain].subpaths[sp].count += spData.count || 0;
          if (spData.lastVisit > aggregated[domain].subpaths[sp].lastVisit) {
            aggregated[domain].subpaths[sp].lastVisit = spData.lastVisit;
          }
        });
      });
    }
  });
  return aggregated;
}

/**
 * Retention cutoff key (local).
 * @param {number} retentionDays
 * @returns {string}
 */
export function getRetentionCutoffKey(retentionDays = 30) {
  const d = new Date();
  d.setDate(d.getDate() - retentionDays);
  return getDateKey(d);
}

export const FIVE_HOUR_MS = 5 * 60 * 60 * 1000;
export const ONE_HOUR_MS = 60 * 60 * 1000;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
