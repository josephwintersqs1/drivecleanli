const DATE_OPTS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
};

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

export function formatBookingDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', DATE_OPTS);
}

export function formatBookingTimeRange(startIso: string, endIso: string): string {
  if (!startIso) return '—';
  const start = new Date(startIso).toLocaleTimeString('en-US', TIME_OPTS);
  if (!endIso) return start;
  const end = new Date(endIso).toLocaleTimeString('en-US', TIME_OPTS);
  return `${start} – ${end}`;
}
