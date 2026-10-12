const currency = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number | string | null | undefined) =>
  currency.format(Number(value ?? 0));

/** "2026-10-14" -> "Wed, 14 Oct 2026" (parsed as a local date, no timezone shift) */
export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** "18:30" -> "6:30 PM" */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '—';
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

/** "NOW_SHOWING" -> "Now Showing" */
export const humanize = (value: string) =>
  value.toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/** Today's date as yyyy-MM-dd in local time */
export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
