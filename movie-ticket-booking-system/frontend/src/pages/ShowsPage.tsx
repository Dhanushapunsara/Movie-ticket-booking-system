import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieApi, showApi, theatreApi } from '../api/services';
import { EmptyState, ErrorMessage, Spinner } from '../components/common/Feedback';
import Pagination from '../components/common/Pagination';
import ShowCard from '../components/shows/ShowCard';
import { useAsync } from '../hooks/useAsync';
import { todayIso } from '../utils/format';

export default function ShowsPage() {
  const [params, setParams] = useSearchParams();
  const [movieId, setMovieId] = useState(params.get('movieId') ?? '');
  const [theatreId, setTheatreId] = useState(params.get('theatreId') ?? '');
  const [date, setDate] = useState(params.get('date') ?? '');
  const [page, setPage] = useState(0);

  const movies = useAsync(() => movieApi.list({ size: 100, sort: 'title,asc' }), []);
  const theatres = useAsync(() => theatreApi.list('ACTIVE'), []);

  useEffect(() => setPage(0), [movieId, theatreId, date]);
  useEffect(() => {
    const next = new URLSearchParams();
    if (movieId) next.set('movieId', movieId);
    if (theatreId) next.set('theatreId', theatreId);
    if (date) next.set('date', date);
    setParams(next, { replace: true });
  }, [movieId, theatreId, date, setParams]);

  const { data, loading, error, reload } = useAsync(
    () => showApi.list({
      movieId: movieId ? Number(movieId) : '',
      theatreId: theatreId ? Number(theatreId) : '',
      date,
      upcomingOnly: true,
      page,
      size: 10,
    }),
    [movieId, theatreId, date, page],
  );

  return (
    <div>
      <h1 className="page-title">Showtimes</h1>
      <p className="mt-1 text-sm text-zinc-400">Filter by movie, theatre or date.</p>

      <div className="card mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="movie">Movie</label>
          <select id="movie" className="input" value={movieId} onChange={(e) => setMovieId(e.target.value)}>
            <option value="">All movies</option>
            {movies.data?.content.filter((m) => m.status !== 'ENDED').map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="theatre">Theatre</label>
          <select id="theatre" className="input" value={theatreId} onChange={(e) => setTheatreId(e.target.value)}>
            <option value="">All theatres</option>
            {theatres.data?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input id="date" type="date" className="input" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button className="btn-ghost w-full" onClick={() => { setMovieId(''); setTheatreId(''); setDate(''); }}
            disabled={!movieId && !theatreId && !date}>
            Clear filters
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> :
          data!.content.length === 0 ? (
            <EmptyState title="No showtimes found">Try another date, movie or theatre.</EmptyState>
          ) : (
            <>
              <div className="space-y-3">
                {data!.content.map((s) => <ShowCard key={s.id} show={s} />)}
              </div>
              <Pagination page={data!.page} totalPages={data!.totalPages} totalElements={data!.totalElements} onChange={setPage} />
            </>
          )}
      </div>
    </div>
  );
}
