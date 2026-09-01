import {
  escapeCsvCell,
  csvRow,
  isFormulaPrefix,
  FORMULA_PREFIXES,
} from '../src/common/csv-escape.js';

describe('csv-escape', () => {
  describe('isFormulaPrefix', () => {
    test.each(FORMULA_PREFIXES)('detects %p as a formula prefix', (ch) => {
      expect(isFormulaPrefix(ch)).toBe(true);
      expect(isFormulaPrefix(`${ch}cmd|'/c calc'!A0`)).toBe(true);
    });

    test('returns false for empty / non-string / safe cells', () => {
      expect(isFormulaPrefix('')).toBe(false);
      expect(isFormulaPrefix(null)).toBe(false);
      expect(isFormulaPrefix(undefined)).toBe(false);
      expect(isFormulaPrefix(42)).toBe(false);
      expect(isFormulaPrefix('example.com/path')).toBe(false);
      expect(isFormulaPrefix(' normal text')).toBe(false);
      expect(isFormulaPrefix('=')).toBe(true);
    });
  });

  describe('escapeCsvCell', () => {
    test('returns empty string for null / undefined', () => {
      expect(escapeCsvCell(null)).toBe('');
      expect(escapeCsvCell(undefined)).toBe('');
    });

    test('coerces numbers to their decimal form', () => {
      expect(escapeCsvCell(0)).toBe('0');
      expect(escapeCsvCell(7)).toBe('7');
    });

    test('quotes cells containing commas, quotes, CR or LF', () => {
      expect(escapeCsvCell('a,b')).toBe('"a,b"');
      expect(escapeCsvCell('he said "hi"')).toBe('"he said ""hi"""');
      expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
      expect(escapeCsvCell('carriage\rreturn')).toBe('"carriage\rreturn"');
    });

    test('prefixes formula-injection starters with an apostrophe', () => {
      // Embedded quote forces RFC 4180 quoting; we also prefix the cell with
      // an apostrophe so a spreadsheet refuses to evaluate `=cmd…`.
      expect(escapeCsvCell('=cmd|"/c calc"!A0')).toBe('"\'=cmd|""/c calc""!A0"');
      // Cells without comma / quote / newline need only the apostrophe prefix.
      expect(escapeCsvCell('+1+1')).toBe("'+1+1");
      expect(escapeCsvCell('-2+3')).toBe("'-2+3");
      expect(escapeCsvCell('@SUM(A1:A2)')).toBe("'@SUM(A1:A2)");
      // TAB is also a formula starter; still gets the apostrophe prefix.
      expect(escapeCsvCell('\tinjected')).toBe("'\tinjected");
    });

    test('does not touch a leading apostrophe that was not added by us', () => {
      // A cell that already starts with an apostrophe is safe: the spreadsheet
      // treats the rest as text. We don't double-prefix.
      expect(escapeCsvCell("'=2+2")).toBe("'=2+2");
    });

    test('leaves a plain, safe cell unchanged', () => {
      expect(escapeCsvCell('example.com')).toBe('example.com');
      expect(escapeCsvCell('/api/v1/users')).toBe('/api/v1/users');
    });
  });

  describe('csvRow', () => {
    test('joins cells with commas and terminates with newline', () => {
      expect(csvRow(['a', 'b', 'c'])).toBe('a,b,c\n');
    });

    test('round-trips a malicious subpath through the CSV layer', () => {
      // Acceptance: a subpath beginning with `=` round-trips through the CSV
      // and opens as text in a spreadsheet. The export handler must emit an
      // apostrophe-prefixed cell so a parser sees the literal text and a
      // spreadsheet refuses to evaluate it.
      const subpath = '=cmd|"/c calc"!A0';
      const row = csvRow(['2026-01-01', 'evil.test', subpath, 1, 'No limit']);
      // Only the malicious cell needs both prefixing and quoting (because of
      // its embedded `"` and `,`-adjacent content). The date / domain / count
      // / limit cells are unquoted RFC 4180.
      expect(row).toBe('2026-01-01,evil.test,"\'=cmd|""/c calc""!A0",1,No limit\n');

      // The malicious cell starts with a single apostrophe — that is the
      // spreadsheet signal that the rest is text, not a formula. (We use a
      // string-contains check rather than split-on-comma because the cell
      // itself contains commas, which a naive split would mangle.)
      expect(row).toContain("'=");
      expect(row).not.toMatch(/(^|,)=/);
    });

    test('escapes every prefix character across all four trigger chars', () => {
      // Every formula-injection starter is apostrophe-prefixed; otherwise the
      // cell passes through unchanged (no structural quoting needed for safe
      // values without commas / quotes / newlines).
      expect(escapeCsvCell('=foo')).toBe("'=foo");
      expect(escapeCsvCell('+foo')).toBe("'+foo");
      expect(escapeCsvCell('-foo')).toBe("'-foo");
      expect(escapeCsvCell('@foo')).toBe("'@foo");
    });
  });
});
