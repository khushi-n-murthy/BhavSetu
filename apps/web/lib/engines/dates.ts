// Date helpers on plain ISO dates (YYYY-MM-DD), computed in UTC so results
// never shift with the viewer's time zone.

const DAY_MS = 86_400_000;

export function parseISODate(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Invalid date: ${iso}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function toISODate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return toISODate(parseISODate(iso) + days * DAY_MS);
}

/** Whole days from `a` to `b` (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseISODate(b) - parseISODate(a)) / DAY_MS);
}

export function isISODate(s: string): boolean {
  try {
    parseISODate(s);
    return true;
  } catch {
    return false;
  }
}
