import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { bookingApi } from '../../api/services';
import { ErrorMessage, Spinner } from '../../components/common/Feedback';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { BOOKING_STATUSES, type Booking, type BookingStatus } from '../../types';
import { formatCurrency, formatDate, formatDateTime, formatTime, humanize } from '../../utils/format';

export default function ManageBookings() {
  const toast = useToast();
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  useEffect(() => setPage(0), [status]);

  const { data, setData, loading, error, reload } = useAsync(() => bookingApi.all(status, page, 10), [status, page]);

  const changeStatus = async (b: Booking, next: BookingStatus) => {
    if (next === b.status) return;
    if (next === 'CANCELLED' && !window.confirm(`Cancel booking #${b.id}? A completed payment will be marked as refunded.`)) return;
    setBusyId(b.id);
    try {
      const updated = await bookingApi.updateStatus(b.id, next);
      setData((d) => d && { ...d, content: d.content.map((x) => (x.id === updated.id ? updated : x)) });
      toast.success(`Booking #${b.id} is now ${humanize(updated.status)}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">All bookings</h1>
      <p className="mt-1 text-sm text-zinc-400">View every booking and update its status.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['', ...BOOKING_STATUSES] as const).map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${status === s ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}>
            {s ? humanize(s) : 'All'}
          </button>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
          <table className="w-full min-w-[980px]">
            <thead className="border-b border-zinc-800">
              <tr>
                <th className="table-head">#</th><th className="table-head">Customer</th><th className="table-head">Movie / Show</th><th className="table-head">Seats</th>
                <th className="table-head">Total</th><th className="table-head">Payment</th><th className="table-head">Booked</th><th className="table-head">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data!.content.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-800/30">
                  <td className="table-cell"><Link to={`/bookings/${b.id}/pay`} className="text-amber-300 hover:underline">{b.id}</Link></td>
                  <td className="table-cell">{b.customerName}<br /><span className="text-xs text-zinc-500">{b.customerEmail}</span></td>
                  <td className="table-cell">{b.movieTitle}<br /><span className="text-xs text-zinc-400">{b.theatreName} · {formatDate(b.showDate)} {formatTime(b.showTime)}</span></td>
                  <td className="table-cell">{b.seatNumbers.join(', ')}</td>
                  <td className="table-cell">{formatCurrency(b.totalAmount)}</td>
                  <td className="table-cell"><StatusBadge status={b.paymentStatus} /></td>
                  <td className="table-cell text-xs text-zinc-400">{formatDateTime(b.bookingDate)}</td>
                  <td className="table-cell">
                    <select
                      aria-label={`Status of booking ${b.id}`}
                      className="input w-36 py-1"
                      value={b.status}
                      disabled={busyId === b.id || b.status === 'CANCELLED'}
                      onChange={(e) => changeStatus(b, e.target.value as BookingStatus)}
                    >
                      {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {data!.content.length === 0 && <tr><td colSpan={8} className="table-cell py-10 text-center text-zinc-500">No bookings found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />}
    </div>
  );
}
