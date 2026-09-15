/**
 * Health entries were historically saved via
 * `new Date().toLocaleDateString("en-GB")`, which produces an
 * ambiguous "DD/MM/YYYY" string. Native `new Date(string)` parsing
 * doesn't reliably treat that as DD/MM/YYYY - some JS engines read
 * it as MM/DD/YYYY instead, silently producing the wrong date (e.g.
 * misreading "14/09/2026" as month 14, which overflows into a
 * completely different month/year).
 *
 * This parses that legacy DD/MM/YYYY format explicitly, and falls
 * back to standard Date parsing for anything else (which correctly
 * handles ISO strings, the format new entries are saved in now).
 */
export function parseHealthDate(dateValue: string): Date {
  const ddmmyyyy = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    const year = Number(ddmmyyyy[3]);
    return new Date(year, month - 1, day);
  }

  return new Date(dateValue);
}