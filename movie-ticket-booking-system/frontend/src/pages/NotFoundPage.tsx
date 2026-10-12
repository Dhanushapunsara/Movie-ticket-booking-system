import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="font-display text-8xl text-amber-400">404</p>
      <h1 className="mt-2 text-xl font-semibold text-white">This scene was cut.</h1>
      <p className="mt-2 text-sm text-zinc-400">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
