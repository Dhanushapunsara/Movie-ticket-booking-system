import { Link, useParams } from 'react-router-dom';
import { movieApi } from '../api/services';
import { EmptyState, ErrorMessage, Spinner } from '../components/common/Feedback';
import Poster from '../components/common/Poster';
import StatusBadge from '../components/common/StatusBadge';
import ShowCard from '../components/shows/ShowCard';
import { useAsync } from '../hooks/useAsync';
import type { Show } from '../types';
import { formatDate, formatDuration } from '../utils/format';

export default function MovieDetailsPage() {
  const movieId = Number(useParams().id);
  const movie = useAsync(() => movieApi.get(movieId), [movieId]);
  const shows = useAsync(() => movieApi.shows(movieId), [movieId]);

  if (movie.loading) return <Spinner />;
  if (movie.error || !movie.data) return <ErrorMessage message={movie.error ?? 'Movie not found'} onRetry={movie.reload} />;

  const m = movie.data;
  const grouped = groupByDate(shows.data?.content ?? []);

  return (
    <div>
      <Link to="/movies" className="text-sm text-zinc-400 hover:text-white">← All movies</Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="mx-auto w-48 overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl md:w-full">
          <Poster id={m.id} title={m.title} url={m.posterUrl} />
        </div>

        <div>
          <StatusBadge status={m.status} />
          <h1 className="mt-3 font-display text-5xl leading-none tracking-wide text-white sm:text-6xl">{m.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {[m.genre, m.language, formatDuration(m.durationMinutes), m.releaseDate ? `Released ${formatDate(m.releaseDate)}` : null]
              .filter(Boolean)
              .map((t) => <span key={t} className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300">{t}</span>)}
          </div>
          {m.description && <p className="mt-6 max-w-2xl leading-relaxed text-zinc-300">{m.description}</p>}

          <h2 className="mt-10 font-display text-3xl tracking-wide text-white">Showtimes</h2>
          <div className="mt-4">
            {shows.loading ? <Spinner label="Loading showtimes…" /> : shows.error ? <ErrorMessage message={shows.error} onRetry={shows.reload} /> :
              grouped.length === 0 ? (
                <EmptyState title="No upcoming shows">
                  {m.status === 'UPCOMING' ? 'This movie is coming soon - showtimes will be announced.' :
                    m.status === 'ENDED' ? 'This movie has finished its run.' : 'Check back later for new showtimes.'}
                </EmptyState>
              ) : (
                <div className="space-y-6">
                  {grouped.map(([date, list]) => (
                    <div key={date}>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-300">{formatDate(date)}</h3>
                      <div className="space-y-3">
                        {list.map((s) => <ShowCard key={s.id} show={s} showMovie={false} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

function groupByDate(shows: Show[]): [string, Show[]][] {
  const map = new Map<string, Show[]>();
  shows.forEach((s) => map.set(s.showDate, [...(map.get(s.showDate) ?? []), s]));
  return [...map.entries()];
}
