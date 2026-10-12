import { humanize } from '../../utils/format';

const COLORS: Record<string, string> = {
  // movies
  NOW_SHOWING: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  UPCOMING: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  ENDED: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
  // theatres
  ACTIVE: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  INACTIVE: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',
  // shows
  SCHEDULED: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  CANCELLED: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  // bookings / payments
  PENDING: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  FAILED: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  REFUNDED: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  // roles
  ADMIN: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  CUSTOMER: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30',
};

export default function StatusBadge({ status, prefix }: { status: string | null | undefined; prefix?: string }) {
  if (!status) return <span className="text-xs text-zinc-500">—</span>;
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${COLORS[status] ?? COLORS.ENDED}`}>
      {prefix && <span className="mr-1 opacity-70">{prefix}</span>}
      {humanize(status)}
    </span>
  );
}
