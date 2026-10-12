interface Props {
  page: number;          // 0-based
  totalPages: number;
  totalElements?: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, totalElements, onChange }: Props) {
  if (totalPages <= 1) {
    return totalElements !== undefined ? (
      <p className="mt-6 text-center text-xs text-zinc-500">{totalElements} result{totalElements === 1 ? '' : 's'}</p>
    ) : null;
  }
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      <button className="btn-secondary" disabled={page === 0} onClick={() => onChange(page - 1)}>← Prev</button>
      <span className="text-sm text-zinc-400">
        Page <span className="font-semibold text-white">{page + 1}</span> of {totalPages}
        {totalElements !== undefined && <span className="hidden sm:inline"> · {totalElements} results</span>}
      </span>
      <button className="btn-secondary" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next →</button>
    </nav>
  );
}
