// Calendar-only dates use UTC arithmetic, independent of daylight-saving changes.
const DAY = 86400000;
export function parseDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso ?? '')) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === iso ? d : null;
}
export const isoDate = d => d.toISOString().slice(0, 10);
export const addDays = (iso, days) => isoDate(new Date(+parseDate(iso) + days * DAY));
export const monthStart = iso => `${iso.slice(0, 7)}-01`;
export function addMonths(iso, count) {
  const d = parseDate(iso), date = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + count);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(date, last));
  return isoDate(d);
}
export const nights = (start, end) => (parseDate(end) - parseDate(start)) / DAY;
export const validRange = (start, end, today) => Boolean(parseDate(start) && parseDate(end) && start >= today && end > start);
export function chooseDate(range, date, part) {
  if (part === 'in') return { in: date, out: '', part: 'out' };
  if (date <= range.in) return { in: date, out: '', part: 'out' };
  return { in: range.in, out: date, part: 'done' };
}
