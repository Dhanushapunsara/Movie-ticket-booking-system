import type { ReactNode } from 'react';

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="my-6 flex flex-col items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-sm text-rose-100 sm:flex-row sm:items-center sm:justify-between" role="alert">
      <p>{message}</p>
      {onRetry && <button className="btn-secondary shrink-0" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="font-display text-5xl text-zinc-700">✦</span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {children && <div className="max-w-md text-sm text-zinc-400">{children}</div>}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-400">{message}</p>;
}
