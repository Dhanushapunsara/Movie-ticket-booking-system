import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { bookingApi } from '../api/services';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { EmptyState, ErrorMessage, Spinner } from '../components/common/Feedback';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import type { Booking } from '../types';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

export default function MyBookingsPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const { data, loading, error, reload } = useAsync(() => bookingApi.mine(page, 8), [page]);
  const [toCancel, setToCancel] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const cancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      const updated = await bookingApi.cancel(toCancel.id);
      toast.success(updated.paymentStatus === 'REFUNDED'
        ? `Booking #${updated.id} cancelled - your payment will be refunded.`
        : `Booking #${updated.id} cancelled.`);
      setToCancel(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">My bookings</h1>
      <p className="mt-1 text-sm text-zinc-400">Your booking history, payments and tickets.</p>

      <div className="mt-6">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> :
          data!.content.length === 0 ? (
            <EmptyState title="No bookings yet">
              <Link to="/shows" className="btn-primary mt-3">Find a show</Link>
            </EmptyState>
          ) : (
            <>
              <div className="space-y-3">
                {data!.content.map((b) => (
                  <div key={b.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-zinc-500">#{b.id}</span>
                        <h2 className="truncate font-semibold text-white">{b.movieTitle}</h2>
                        <StatusBadge status={b.status} />
                        {b.paymentStatus && <StatusBadge status={b.paymentStatus} prefix="Payment:" />}
                      </div>
                      <p className="mt-1 text-sm text-zinc-300">
                        {formatDate(b.showDate)} · {formatTime(b.showTime)} · {b.theatreName}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Seats <span className="font-semibold text-zinc-200">{b.seatNumbers.join(', ')}</span> · {b.numberOfTickets} ticket{b.numberOfTickets > 1 ? 's' : ''} ·{' '}
                        <span className="font-semibold text-amber-300">{formatCurrency(b.totalAmount)}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {b.payable && <Link to={`/bookings/${b.id}/pay`} className="btn-primary">Pay now</Link>}
                      <Link to={`/bookings/${b.id}/pay`} className="btn-secondary">Details</Link>
                      {b.cancellable && <button className="btn-ghost text-rose-300 hover:text-rose-200" onClick={() => setToCancel(b)}>Cancel</button>}
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={data!.page} totalPages={data!.totalPages} totalElements={data!.totalElements} onChange={setPage} />
            </>
          )}
      </div>

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel booking?"
        message={toCancel ? `Cancel booking #${toCancel.id} for ${toCancel.movieTitle} (seats ${toCancel.seatNumbers.join(', ')})?${toCancel.paymentStatus === 'COMPLETED' ? ' Your completed payment will be refunded.' : ''} The seats will be released.` : ''}
        confirmLabel="Cancel booking"
        danger
        busy={cancelling}
        onConfirm={cancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}
