import { Link } from 'react-router-dom';
import { movieApi, showApi } from '../api/services';
import { EmptyState, ErrorMessage, Spinner } from '../components/common/Feedback';
import MovieCard from '../components/movies/MovieCard';
import ShowCard from '../components/shows/ShowCard';
import { useAsync } from '../hooks/useAsync';

export default function HomePage() {
  const nowShowing = useAsync(() => movieApi.list({ status: 'NOW_SHOWING', size: 8, sort: 'releaseDate,desc' }), []);
  const upcoming = useAsync(() => movieApi.list({ status: 'UPCOMING', size: 4, sort: 'releaseDate,asc' }), []);
  const nextShows = useAsync(() => showApi.list({ upcomingOnly: true, status: 'SCHEDULED', size: 4 }), []);

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/40 px-6 py-12 sm:px-12 sm:py-16">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Tonight at the cinema</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] text-white sm:text-7xl">Pick a movie.<br />Pick your seat.</h1>
          <p className="mt-4 text-zinc-300">Browse what's showing, choose exactly where you sit, and pay in a couple of taps.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/movies" className="btn-primary px-6 py-3">Browse movies</Link>
            <Link to="/shows" className="btn-secondary px-6 py-3">See showtimes</Link>
          </div>
        </div>
      </section>

      <Section title="Now showing" link="/movies?status=NOW_SHOWING">
        {nowShowing.loading ? <Spinner /> : nowShowing.error ? <ErrorMessage message={nowShowing.error} onRetry={nowShowing.reload} /> :
          nowShowing.data!.content.length === 0 ? <EmptyState title="Nothing showing right now">Check back soon.</EmptyState> : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {nowShowing.data!.content.map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
          )}
      </Section>

      <Section title="Next showtimes" link="/shows">
        {nextShows.loading ? <Spinner /> : nextShows.error ? <ErrorMessage message={nextShows.error} onRetry={nextShows.reload} /> :
          nextShows.data!.content.length === 0 ? <EmptyState title="No upcoming shows" /> : (
            <div className="grid gap-3 lg:grid-cols-2">
              {nextShows.data!.content.map((s) => <ShowCard key={s.id} show={s} />)}
            </div>
          )}
      </Section>

      {upcoming.data && upcoming.data.content.length > 0 && (
        <Section title="Coming soon" link="/movies?status=UPCOMING">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {upcoming.data.content.map((m) => <MovieCard key={m.id} movie={m} />)}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, link, children }: { title: string; link: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">{title}</h2>
        <Link to={link} className="text-sm font-semibold text-amber-300 hover:underline">See all →</Link>
      </div>
      {children}
    </section>
  );
}
