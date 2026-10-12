import { Link } from 'react-router-dom';
import { adminApi, bookingApi } from '../../api/services';
import { ErrorMessage, Spinner } from '../../components/common/Feedback';
import StatusBadge from '../../components/common/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { formatCurrency, formatDate, formatTime } from '../../utils/format';

export default function AdminDashboard() {
  const stats = useAsync(() => adminApi.stats(), []);
  const recent = useAsync(() => bookingApi.all('', 0, 5), []);

  if (stats.loading) return <Spinner />;
  if (stats.error || !stats.data) return <ErrorMessage message={stats.error ?? 'Could not load stats'} onRetry={stats.reload} />;
  const s = stats.data;

  const cards = [
    { label: 'Revenue', value: formatCurrency(s.totalRevenue), sub: `${s.completedPayments} completed payments`, to: '/admin/payments', accent: true },
    { label: 'Bookings', value: s.totalBookings, sub: `${s.confirmedBookings} confirmed · ${s.pendingBookings} pending · ${s.cancelledBookings} cancelled`, to: '/admin/bookings' },
    { label: 'Movies', value: s.totalMovies, sub: `${s.nowShowingMovies} now showing`, to: '/admin/movies' },
    { label: 'Shows', value: s.totalShows, sub: `${s.scheduledShows} scheduled`, to: '/admin/shows' },
    { label: 'Theatres', value: s.totalTheatres, sub: 'cinema halls', to: '/admin/theatres' },
    { label: 'Users', value: s.totalUsers, sub: `${s.totalCustomers} customers`, to: '/admin/users' },
  ];

  return (
    <div>
      <h1 className="page-title">Admin dashboard</h1>
      <p className="mt-1 text-sm text-zinc-400">Overview of the booking platform.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`card p-5 transition hover:border-amber-400/50 ${c.accent ? 'bg-gradient-to-br from-amber-500/15 to-zinc-900' : ''}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{c.label}</p>
            <p className={`mt-2 font-display text-4xl ${c.accent ? 'text-amber-400' : 'text-white'}`}>{c.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="font-display text-3xl tracking-wide text-white">Latest bookings</h2>
        <Link to="/admin/bookings" className="text-sm font-semibold text-amber-300 hover:underline">All bookings →</Link>
      </div>
      <div className="card mt-4 overflow-x-auto">
        {recent.loading ? <Spinner /> : recent.error ? <ErrorMessage message={recent.error} /> : (
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-zinc-800">
              <tr><th className="table-head">#</th><th className="table-head">Customer</th><th className="table-head">Movie</th><th className="table-head">Show</th><th className="table-head">Total</th><th className="table-head">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {recent.data!.content.map((b) => (
                <tr key={b.id}>
                  <td className="table-cell text-zinc-500">{b.id}</td>
                  <td className="table-cell">{b.customerName}</td>
                  <td className="table-cell">{b.movieTitle}</td>
                  <td className="table-cell text-zinc-400">{formatDate(b.showDate)} {formatTime(b.showTime)}</td>
                  <td className="table-cell">{formatCurrency(b.totalAmount)}</td>
                  <td className="table-cell"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
              {recent.data!.content.length === 0 && <tr><td colSpan={6} className="table-cell text-center text-zinc-500">No bookings yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
