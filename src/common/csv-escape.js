/**
 * CSV cell escaping.
 *
 * Two threats are handled here:
 *   1. CSV structural escaping (RFC 4180): any cell containing `,`, `"`, `\n`, or `\r`
 *      is wrapped in double-quotes, and embedded `"` is doubled.
 *   2. Formula-injection escaping (OWASP): a cell whose first character is one of
 *      `=`, `+`, `-`, `@`, TAB (`\t`) or CR (`\r`) is prefixed with a single
 *      apostrophe (`'`) so spreadsheet apps (Excel, Google Sheets, LibreOffice)
 *      treat the value as text instead of executing it as a formula.
 *
 * Both passes are required: quoting alone does NOT stop formula injection in
 * Excel/Sheets — they evaluate the cell *after* unquoting.
 *
 * Numbers (visit counts) and booleans should not be passed through this helper;
 * it is intended for string cells. Numbers are emitted as their decimal form by
 * the caller.
 */

/** Characters that spreadsheet apps interpret as a formula starter. */
export const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Returns true when the given string cell would be interpreted as a formula by
 * a spreadsheet app and therefore needs a leading apostrophe.
 *
 * Exported for testing and for any future call-site that needs the check
 * without the full escape.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isFormulaPrefix(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  return FORMULA_PREFIXES.includes(value[0]);
}

/**
 * Escape a single CSV cell. Returns a plain string safe to interpolate into
 * a CSV row joined by `,` and terminated with `\n`.
 *
 * @param {unknown} value  Cell value; coerced to string. `null`/`undefined`
 *   become the empty string. Numbers are formatted via `String(n)`.
 * @returns {string}       Escaped cell (already RFC-4180 quoted when needed,
 *   and apostrophe-prefixed when the value would be a formula).
 */
export function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  let str = typeof value === 'string' ? value : String(value);

  // 1. Formula-injection guard: prefix with a single apostrophe so the
  //    spreadsheet treats the cell as text. We do this BEFORE quoting so the
  //    resulting `'"=cmd…'` is wrapped in quotes.
  if (isFormulaPrefix(str)) {
    str = `'${str}`;
  }

  // 2. RFC 4180 quoting: quote the cell when it contains a comma, double
  //    quote, CR, or LF; double any embedded double quotes.
  const needsQuoting = /[",\r\n]/.test(str);
  if (needsQuoting) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build a single CSV row from an array of cell values.
 *
 * @param {readonly unknown[]} cells
 * @returns {string}  Cells joined by `,` followed by `\n`.
 */
export function csvRow(cells) {
  return `${cells.map(escapeCsvCell).join(',')}\n`;
}
