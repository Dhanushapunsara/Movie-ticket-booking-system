import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
  error: 'border-rose-500/40 bg-rose-950/90 text-rose-100',
  info: 'border-sky-500/40 bg-sky-950/90 text-sky-100',
};

const ICONS: Record<ToastType, string> = { success: '✓', error: '!', info: 'i' };

/** Small toast system for success / failure feedback after operations. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
    window.setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4000);
  }, [dismiss]);

  const value = useMemo(() => ({
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m),
    info: (m: string) => push('info', m),
  }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-96">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${STYLES[t.type]}`}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
              {ICONS[t.type]}
            </span>
            <p className="flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-white/60 hover:text-white" aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
