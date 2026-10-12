import type { SeatRow } from '../../types';

interface Props {
  rows: SeatRow[];
  booked: Set<string>;
  selected: Set<string>;
  maxReached: boolean;
  disabled?: boolean;
  onToggle: (seat: string) => void;
}

/** Theatre seat grid. Rows are lettered (A, B, C …) and the screen is at the top. */
export default function SeatMap({ rows, booked, selected, maxReached, disabled, onToggle }: Props) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="mx-auto w-max min-w-full">
        {/* Screen */}
        <div className="mx-auto mb-8 w-3/4 max-w-lg">
          <div className="h-2 rounded-t-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_8px_30px_rgba(251,191,36,0.35)]" />
          <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-500">Screen</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          {rows.map((row) => (
            <div key={row.row} className="flex items-center gap-2">
              <span className="w-6 text-right text-xs font-semibold text-zinc-500">{row.row}</span>
              <div className="flex gap-1.5">
                {row.seats.map((seat, i) => {
                  const isBooked = booked.has(seat);
                  const isSelected = selected.has(seat);
                  const blocked = isBooked || disabled || (maxReached && !isSelected);
                  return (
                    <button
                      key={seat}
                      type="button"
                      disabled={blocked}
                      onClick={() => onToggle(seat)}
                      title={isBooked ? `${seat} - booked` : seat}
                      aria-label={`Seat ${seat}${isBooked ? ' (booked)' : isSelected ? ' (selected)' : ''}`}
                      aria-pressed={isSelected}
                      className={[
                        'h-7 w-7 rounded-t-lg rounded-b-sm text-[10px] font-semibold transition sm:h-8 sm:w-8',
                        i === 4 ? 'mr-4 sm:mr-6' : '', // aisle after seat 5
                        isBooked
                          ? 'cursor-not-allowed bg-zinc-800 text-zinc-600 line-through'
                          : isSelected
                            ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/30'
                            : blocked
                              ? 'cursor-not-allowed bg-zinc-700/40 text-zinc-500'
                              : 'bg-zinc-700 text-zinc-200 hover:bg-amber-200 hover:text-zinc-900',
                      ].join(' ')}
                    >
                      {seat.replace(row.row, '')}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-xs font-semibold text-zinc-500">{row.row}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-zinc-400">
          <Legend className="bg-zinc-700" label="Available" />
          <Legend className="bg-amber-400" label="Selected" />
          <Legend className="bg-zinc-800" label="Booked" />
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded-t-md rounded-b-sm ${className}`} />
      {label}
    </span>
  );
}
