import { useCallback, useEffect, useState } from 'react';
import { fetchActiveTips } from '../services/tips';

// Los tips son datos casi estáticos: get() una vez por sesión, cacheado a nivel de módulo.
let cache = null;
let inflight = null;

export function resetTipsCache() {
  cache = null;
  inflight = null;
}

export function useTips() {
  const [tips, setTips] = useState(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    if (cache && !force) {
      setTips(cache);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      inflight = inflight ?? fetchActiveTips();
      const list = await inflight;
      cache = list;
      setTips(list);
    } catch (e) {
      setError(e);
    } finally {
      inflight = null;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { tips, loading, error, reload: () => load(true) };
}
