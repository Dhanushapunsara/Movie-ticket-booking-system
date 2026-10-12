import { Link } from 'react-router-dom';
import type { Show } from '../../types';
import { formatCurrency, formatDate, formatTime } from '../../utils/format';
import StatusBadge from '../common/StatusBadge';

interface Props {
  show: Show;
  showMovie?: boolean;
}

export default function ShowCard({ show, showMovie = true }: Props) {
  const fillPct = Math.round((show.bookedSeats / Math.max(show.capacity, 1)) * 100);
  const almostFull = show.availableSeats > 0 && show.availableSeats <= 10;

  return (
    <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-zinc-800/80 px-4 py-2 text-center sm:w-28">
        <span className="font-display text-3xl leading-none text-amber-400">{formatTime(show.showTime)}</span>
        <span className="mt-1 text-xs text-zinc-400">{formatDate(show.showDate)}</span>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        {showMovie && (
          <Link to={`/movies/${show.movieId}`} className="block truncate font-semibold text-white hover:text-amber-300">
            {show.movieTitle}
          </Link>
        )}
        <p className="text-sm text-zinc-300">
          {show.theatreName} <span className="text-zinc-500">· {show.theatreLocation}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span>Ends {formatTime(show.endTime)}</span>
          <span>·</span>
          <span className={almostFull ? 'font-semibold text-amber-300' : ''}>
            {show.availableSeats} of {show.capacity} seats left
          </span>
          {show.status !== 'SCHEDULED' && <StatusBadge status={show.status} />}
        </div>
        <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-zinc-800" aria-hidden>
          <div className="h-full rounded-full bg-amber-400/70" style={{ width: `${fillPct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <span className="text-lg font-semibold text-white">{formatCurrency(show.ticketPrice)}</span>
        {show.bookable ? (
          <Link to={`/shows/${show.id}/book`} className="btn-primary">Select seats</Link>
        ) : (
          <span className="btn-secondary pointer-events-none opacity-60">
            {show.status === 'CANCELLED' ? 'Cancelled' : show.availableSeats === 0 ? 'Sold out' : 'Closed'}
          </span>
        )}
      </div>
    </div>
  );
}
