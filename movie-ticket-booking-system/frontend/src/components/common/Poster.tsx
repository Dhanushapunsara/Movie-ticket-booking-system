import { useState } from 'react';

const GRADIENTS = [
  'from-amber-500 via-rose-600 to-purple-900',
  'from-sky-500 via-indigo-600 to-zinc-900',
  'from-emerald-500 via-teal-700 to-zinc-900',
  'from-rose-500 via-fuchsia-700 to-indigo-950',
  'from-orange-400 via-red-600 to-zinc-900',
  'from-cyan-400 via-blue-700 to-violet-950',
];

interface Props {
  id: number;
  title: string;
  url?: string | null;
  className?: string;
}

/** Shows the movie poster, or a generated title card when there is no poster URL. */
export default function Poster({ id, title, url, className = '' }: Props) {
  const [broken, setBroken] = useState(false);

  if (url && !broken) {
    return (
      <img
        src={url}
        alt={`${title} poster`}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`aspect-[2/3] w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`relative flex aspect-[2/3] w-full items-end overflow-hidden bg-gradient-to-br p-4 ${GRADIENTS[id % GRADIENTS.length]} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      <span className="relative font-display text-3xl leading-none tracking-wide text-white drop-shadow-lg">{title}</span>
    </div>
  );
}
