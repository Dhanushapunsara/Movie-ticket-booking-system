import { Link } from 'react-router-dom';
import type { Movie } from '../../types';
import { formatDuration } from '../../utils/format';
import Poster from '../common/Poster';
import StatusBadge from '../common/StatusBadge';

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/5"
    >
      <div className="overflow-hidden">
        <Poster id={movie.id} title={movie.title} url={movie.posterUrl} className="transition duration-300 group-hover:scale-105" />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-white">{movie.title}</h3>
        </div>
        <p className="text-xs text-zinc-400">
          {movie.genre} · {movie.language} · {formatDuration(movie.durationMinutes)}
        </p>
        <StatusBadge status={movie.status} />
      </div>
    </Link>
  );
}
