import { useEffect, useState } from 'react';
import { paymentApi } from '../../api/services';
import { ErrorMessage, Spinner } from '../../components/common/Feedback';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { PAYMENT_STATUSES, type PaymentStatus } from '../../types';
import { formatCurrency, formatDateTime, humanize } from '../../utils/format';

export default function ManagePayments() {
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [status]);
  const { data, loading, error, reload } = useAsync(() => paymentApi.all(status, page, 10), [status, page]);

  return (
    <div>
      <h1 className="page-title">Payments</h1>
      <p className="mt-1 text-sm text-zinc-400">Payment information for every booking.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['', ...PAYMENT_STATUSES] as const).map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${status === s ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}>
            {s ? humanize(s) : 'All'}
          </button>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-zinc-800">
              <tr>
                <th className="table-head">ID</th><th className="table-head">Booking</th><th className="table-head">Customer</th><th className="table-head">Movie</th>
                <th className="table-head">Method</th><th className="table-head">Amount</th><th className="table-head">Reference</th><th className="table-head">Date</th><th className="table-head">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data!.content.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/30">
                  <td className="table-cell text-zinc-500">{p.id}</td>
                  <td className="table-cell">#{p.bookingId} <StatusBadge status={p.bookingStatus} /></td>
                  <td className="table-cell">{p.customerName}</td>
                  <td className="table-cell">{p.movieTitle}<br /><span className="text-xs text-zinc-500">{p.seatNumbers.join(', ')}</span></td>
                  <td className="table-cell">{humanize(p.paymentMethod)}</td>
                  <td className="table-cell font-semibold">{formatCurrency(p.amount)}</td>
                  <td className="table-cell font-mono text-xs text-amber-300">{p.transactionReference ?? '—'}</td>
                  <td className="table-cell text-xs text-zinc-400">{formatDateTime(p.paymentDate ?? p.createdAt)}</td>
                  <td className="table-cell"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
              {data!.content.length === 0 && <tr><td colSpan={9} className="table-cell py-10 text-center text-zinc-500">No payments found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />}
    </div>
  );
}
