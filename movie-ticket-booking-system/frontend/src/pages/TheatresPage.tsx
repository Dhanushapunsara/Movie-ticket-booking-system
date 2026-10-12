import { Link } from 'react-router-dom';
import { theatreApi } from '../api/services';
import { EmptyState, ErrorMessage, Spinner } from '../components/common/Feedback';
import StatusBadge from '../components/common/StatusBadge';
import { useAsync } from '../hooks/useAsync';

export default function TheatresPage() {
  const { data, loading, error, reload } = useAsync(() => theatreApi.list(), []);

  return (
    <div>
      <h1 className="page-title">Theatres</h1>
      <p className="mt-1 text-sm text-zinc-400">Every cinema hall in the network.</p>

      <div className="mt-6">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> :
          data!.length === 0 ? <EmptyState title="No theatres yet" /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data!.map((t) => (
                <div key={t.id} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{t.name}</h2>
                      <p className="text-sm text-zinc-400">📍 {t.location}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-4 text-sm text-zinc-300">
                    <span className="font-display text-3xl text-amber-400">{t.capacity}</span> seats ·{' '}
                    {Math.ceil(t.capacity / 10)} rows
                  </p>
                  {t.status === 'ACTIVE' ? (
                    <Link to={`/shows?theatreId=${t.id}`} className="btn-secondary mt-5">View showtimes</Link>
                  ) : (
                    <p className="mt-5 text-sm text-zinc-500">Temporarily closed</p>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
