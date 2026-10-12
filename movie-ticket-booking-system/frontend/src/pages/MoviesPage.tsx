import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieApi } from '../api/services';
import { EmptyState, ErrorMessage, Spinner } from '../components/common/Feedback';
import Pagination from '../components/common/Pagination';
import MovieCard from '../components/movies/MovieCard';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { MOVIE_STATUSES, type MovieStatus } from '../types';
import { humanize } from '../utils/format';

const GENRES = ['Action', 'Animation', 'Comedy', 'Drama', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];
const LANGUAGES = ['English', 'Sinhala', 'Tamil', 'Hindi'];
const PAGE_SIZE = 12;

export default function MoviesPage() {
  const [params, setParams] = useSearchParams();
  const [title, setTitle] = useState(params.get('title') ?? '');
  const [genre, setGenre] = useState(params.get('genre') ?? '');
  const [language, setLanguage] = useState(params.get('language') ?? '');
  const [status, setStatus] = useState<MovieStatus | ''>((params.get('status') as MovieStatus) ?? '');
  const [sort, setSort] = useState('releaseDate,desc');
  const [page, setPage] = useState(0);
  const debouncedTitle = useDebounce(title);

  // reset to first page whenever a filter changes
  useEffect(() => setPage(0), [debouncedTitle, genre, language, status, sort]);

  // keep filters in the URL so results can be shared / bookmarked
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedTitle) next.set('title', debouncedTitle);
    if (genre) next.set('genre', genre);
    if (language) next.set('language', language);
    if (status) next.set('status', status);
    setParams(next, { replace: true });
  }, [debouncedTitle, genre, language, status, setParams]);

  const { data, loading, error, reload } = useAsync(
    () => movieApi.list({ title: debouncedTitle, genre, language, status, page, size: PAGE_SIZE, sort }),
    [debouncedTitle, genre, language, status, page, sort],
  );

  const hasFilters = title || genre || language || status;

  return (
    <div>
      <h1 className="page-title">Movies</h1>
      <p className="mt-1 text-sm text-zinc-400">Search and filter the full catalogue.</p>

      <div className="card mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="label" htmlFor="q">Search title</label>
          <input id="q" className="input" placeholder="e.g. Orbit Zero" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="genre">Genre</label>
          <select id="genre" className="input" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">All genres</option>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="lang">Language</label>
          <select id="lang" className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">All languages</option>
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value as MovieStatus | '')}>
            <option value="">Any status</option>
            {MOVIE_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
          </select>
        </div>
        <div className="flex items-end justify-between gap-3 sm:col-span-2 lg:col-span-5">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" className="input w-auto py-1.5" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="releaseDate,desc">Newest first</option>
              <option value="releaseDate,asc">Oldest first</option>
              <option value="title,asc">Title A–Z</option>
              <option value="durationMinutes,asc">Shortest</option>
            </select>
          </div>
          {hasFilters && (
            <button className="btn-ghost" onClick={() => { setTitle(''); setGenre(''); setLanguage(''); setStatus(''); }}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> :
          data!.content.length === 0 ? (
            <EmptyState title="No movies match your filters">Try a different title or clear the filters.</EmptyState>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {data!.content.map((m) => <MovieCard key={m.id} movie={m} />)}
              </div>
              <Pagination page={data!.page} totalPages={data!.totalPages} totalElements={data!.totalElements} onChange={setPage} />
            </>
          )}
      </div>
    </div>
  );
}
