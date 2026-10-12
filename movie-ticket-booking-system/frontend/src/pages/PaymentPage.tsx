import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getErrorMessage, getStatusCode } from '../api/client';
import { bookingApi, paymentApi } from '../api/services';
import { ErrorMessage, Spinner } from '../components/common/Feedback';
import Poster from '../components/common/Poster';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { PAYMENT_METHODS, type Payment, type PaymentMethod } from '../types';
import { formatCurrency, formatDate, formatDateTime, formatTime, humanize } from '../utils/format';

const METHOD_ICONS: Record<PaymentMethod, string> = {
  CREDIT_CARD: '💳',
  DEBIT_CARD: '🏦',
  ONLINE_BANKING: '🌐',
  CASH: '💵',
};

/** Booking details + payment. Doubles as the "booking details" view. */
export default function PaymentPage() {
  const bookingId = Number(useParams().id);
  const toast = useToast();

  const booking = useAsync(() => bookingApi.get(bookingId), [bookingId]);
  const payment = useAsync<Payment | null>(async () => {
    try {
      return await paymentApi.byBooking(bookingId);
    } catch (e) {
      if (getStatusCode(e) === 404) return null; // no payment yet
      throw e;
    }
  }, [bookingId]);

  const [method, setMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (booking.loading || payment.loading) return <Spinner />;
  if (booking.error || !booking.data) return <ErrorMessage message={booking.error ?? 'Booking not found'} onRetry={booking.reload} />;

  const b = booking.data;
  const p = payment.data;

  const pay = async () => {
    setPaying(true);
    setError(null);
    try {
      // 1) create (or re-use) the payment record, 2) process it
      const created = await paymentApi.create({ bookingId, paymentMethod: method });
      const processed = await paymentApi.process(created.id, simulateFailure);
      payment.setData(processed);
      await booking.reload();
      if (processed.status === 'COMPLETED') {
        toast.success('Payment successful - your booking is confirmed!');
      } else {
        toast.error('Payment failed. Your booking is still pending - please try again.');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      payment.reload();
      booking.reload();
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <Link to="/my-bookings" className="text-sm text-zinc-400 hover:text-white">← My bookings</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="page-title">Booking #{b.id}</h1>
        <StatusBadge status={b.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Ticket */}
        <div className="card overflow-hidden">
          <div className="flex gap-4 p-5">
            <div className="w-24 shrink-0 overflow-hidden rounded-xl sm:w-28">
              <Poster id={b.movieId} title={b.movieTitle} url={b.moviePosterUrl} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-3xl leading-none tracking-wide text-white">{b.movieTitle}</h2>
              <p className="mt-2 text-sm text-zinc-300">{b.theatreName} · {b.theatreLocation}</p>
              <p className="text-sm text-zinc-300">{formatDate(b.showDate)} at {formatTime(b.showTime)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {b.seatNumbers.map((s) => (
                  <span key={s} className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-200">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative border-t border-dashed border-zinc-700">
            <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-zinc-950" />
            <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-zinc-950" />
          </div>
          <dl className="grid grid-cols-2 gap-4 p-5 text-sm sm:grid-cols-4">
            <Info label="Tickets" value={String(b.numberOfTickets)} />
            <Info label="Price each" value={formatCurrency(b.ticketPrice)} />
            <Info label="Total" value={formatCurrency(b.totalAmount)} highlight />
            <Info label="Booked on" value={formatDateTime(b.bookingDate)} />
          </dl>
        </div>

        {/* Payment */}
        <aside className="card h-fit p-5">
          <h2 className="font-display text-2xl tracking-wide text-white">Payment</h2>

          {p && (
            <dl className="mt-4 space-y-2 rounded-xl bg-zinc-950/60 p-4 text-sm">
              <div className="flex justify-between"><dt className="text-zinc-400">Status</dt><dd><StatusBadge status={p.status} /></dd></div>
              <div className="flex justify-between"><dt className="text-zinc-400">Payment ID</dt><dd className="text-white">#{p.id}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-400">Method</dt><dd className="text-white">{humanize(p.paymentMethod)}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-400">Amount</dt><dd className="text-white">{formatCurrency(p.amount)}</dd></div>
              {p.paymentDate && <div className="flex justify-between"><dt className="text-zinc-400">Processed</dt><dd className="text-white">{formatDateTime(p.paymentDate)}</dd></div>}
              {p.transactionReference && <div className="flex justify-between"><dt className="text-zinc-400">Reference</dt><dd className="font-mono text-amber-300">{p.transactionReference}</dd></div>}
            </dl>
          )}

          {b.status === 'CONFIRMED' && (
            <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-sm text-emerald-200">
              🎟️ You're all set! Show this booking number at the counter: <strong>#{b.id}</strong>
            </p>
          )}
          {b.status === 'CANCELLED' && (
            <p className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/60 p-4 text-sm text-zinc-300">
              This booking was cancelled{p?.status === 'REFUNDED' ? ' and the payment was refunded' : ''}. Cancelled bookings cannot be paid for.
            </p>
          )}

          {b.payable ? (
            <div className="mt-4 space-y-4">
              {p?.status === 'FAILED' && <p className="text-sm text-rose-300">The last attempt failed. You can try again.</p>}
              <fieldset>
                <legend className="label">Payment method</legend>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${method === m ? 'border-amber-400 bg-amber-400/10 text-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}>
                      <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                      <span>{METHOD_ICONS[m]}</span>{humanize(m)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} className="accent-amber-400" />
                Simulate a failed payment (testing only - no real gateway)
              </label>

              {error && <p className="rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p>}

              <button className="btn-primary w-full py-3" onClick={pay} disabled={paying}>
                {paying ? 'Processing…' : `Pay ${formatCurrency(b.totalAmount)}`}
              </button>
            </div>
          ) : b.status === 'PENDING' && (
            <p className="mt-4 text-sm text-zinc-400">This show is no longer open for payment.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className={`mt-1 font-semibold ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</dd>
    </div>
  );
}
