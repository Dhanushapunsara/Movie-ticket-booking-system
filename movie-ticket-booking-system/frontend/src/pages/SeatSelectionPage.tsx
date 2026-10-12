import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage, getStatusCode } from '../api/client';
import { bookingApi, showApi } from '../api/services';
import SeatMap from '../components/booking/SeatMap';
import { ErrorMessage, Spinner } from '../components/common/Feedback';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

const MAX_SEATS = 10;

export default function SeatSelectionPage() {
  const showId = Number(useParams().id);
  const navigate = useNavigate();
  const toast = useToast();

  const show = useAsync(() => showApi.get(showId), [showId]);
  const seats = useAsync(() => showApi.seats(showId), [showId]);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const booked = useMemo(() => new Set(seats.data?.bookedSeats ?? []), [seats.data]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  if (show.loading || seats.loading) return <Spinner label="Loading seat map…" />;
  if (show.error || seats.error || !show.data || !seats.data) {
    return <ErrorMessage message={show.error ?? seats.error ?? 'Show not found'} onRetry={() => { show.reload(); seats.reload(); }} />;
  }

  const s = show.data;
  const price = Number(seats.data.ticketPrice);
  const total = price * selected.length;

  const toggle = (seat: string) => {
    setError(null);
    setSelected((cur) => cur.includes(seat) ? cur.filter((x) => x !== seat) : [...cur, seat]);
  };

  const confirmBooking = async () => {
    if (selected.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const booking = await bookingApi.create({ showId, seatNumbers: selected, numberOfTickets: selected.length });
      toast.success(`Booking #${booking.id} created - complete payment to confirm it.`);
      navigate(`/bookings/${booking.id}/pay`);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      // Someone else took a seat in the meantime: refresh the map and drop seats that are gone.
      if (getStatusCode(err) === 409) {
        await seats.reload();
        const latest = new Set((await showApi.seats(showId)).bookedSeats);
        setSelected((cur) => cur.filter((x) => !latest.has(x)));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link to={`/movies/${s.movieId}`} className="text-sm text-zinc-400 hover:text-white">← {s.movieTitle}</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Select your seats</h1>
          <p className="mt-1 text-sm text-zinc-300">
            <span className="font-semibold text-white">{s.movieTitle}</span> · {s.theatreName}, {s.theatreLocation} ·{' '}
            {formatDate(s.showDate)} at {formatTime(s.showTime)}
          </p>
        </div>
        <p className="text-sm text-zinc-400">{seats.data.availableSeats} of {seats.data.capacity} seats available</p>
      </div>

      {!seats.data.bookable && (
        <ErrorMessage message={s.status === 'CANCELLED' ? 'This show has been cancelled.' :
          seats.data.availableSeats === 0 ? 'This show is sold out.' : 'This show is no longer accepting bookings.'} />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-4 sm:p-6">
          <SeatMap
            rows={seats.data.rows}
            booked={booked}
            selected={selectedSet}
            maxReached={selected.length >= MAX_SEATS}
            disabled={!seats.data.bookable || submitting}
            onToggle={toggle}
          />
          {selected.length >= MAX_SEATS && (
            <p className="mt-4 text-center text-xs text-amber-300">You can book up to {MAX_SEATS} seats at a time.</p>
          )}
        </div>

        {/* Booking summary */}
        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl tracking-wide text-white">Your booking</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-zinc-400">Selected seats</dt>
              <dd className="mt-1 flex min-h-7 flex-wrap gap-1.5">
                {selected.length === 0 ? <span className="text-zinc-500">None yet - tap a seat</span> :
                  [...selected].sort(seatSort).map((x) => (
                    <button key={x} onClick={() => toggle(x)} title="Remove"
                      className="rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/40 hover:bg-amber-400/25">
                      {x} ✕
                    </button>
                  ))}
              </dd>
            </div>
            <Row label="Number of tickets" value={String(selected.length)} />
            <Row label="Ticket price" value={formatCurrency(price)} />
            <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
              <dt className="font-semibold text-white">Total</dt>
              <dd className="font-display text-3xl text-amber-400">{formatCurrency(total)}</dd>
            </div>
          </dl>

          {error && <p className="mt-4 rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p>}

          <button className="btn-primary mt-5 w-full py-3" onClick={confirmBooking}
            disabled={submitting || selected.length === 0 || !seats.data.bookable}>
            {submitting ? 'Booking…' : `Book ${selected.length || ''} ticket${selected.length === 1 ? '' : 's'}`}
          </button>
          {selected.length > 0 && (
            <button className="btn-ghost mt-2 w-full" onClick={() => setSelected([])} disabled={submitting}>Clear selection</button>
          )}
          <p className="mt-3 text-center text-xs text-zinc-500">Seats are held once booked. Pay to confirm.</p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="font-semibold text-white">{value}</dd>
    </div>
  );
}

/** A2 < A10 < B1 */
function seatSort(a: string, b: string) {
  const [, ra, na] = a.match(/^([A-Z]+)(\d+)$/) ?? [];
  const [, rb, nb] = b.match(/^([A-Z]+)(\d+)$/) ?? [];
  return ra === rb ? Number(na) - Number(nb) : (ra.length - rb.length) || ra.localeCompare(rb);
}
