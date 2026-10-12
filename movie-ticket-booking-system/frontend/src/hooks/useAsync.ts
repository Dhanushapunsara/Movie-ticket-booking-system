import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { getErrorMessage } from '../api/client';

/**
 * Runs an async loader and tracks loading / error / data.
 * Re-runs whenever `deps` change; `reload()` runs it again on demand.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const callId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const reload = useCallback(async () => {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await run();
      if (id === callId.current) setData(result);
    } catch (e) {
      if (id === callId.current) setError(getErrorMessage(e));
    } finally {
      if (id === callId.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}
