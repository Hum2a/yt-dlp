import { useEffect, useState } from 'react';
import { fetchHealth } from '@/api/client';

export function useApiStatus(pollMs = 15000) {
  const [reachable, setReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    const ping = async () => {
      const ok = await fetchHealth(ac.signal);
      if (!cancelled) {
        setReachable(ok !== null);
      }
    };

    void ping();
    const id = window.setInterval(() => void ping(), pollMs);
    return () => {
      cancelled = true;
      ac.abort();
      window.clearInterval(id);
    };
  }, [pollMs]);

  return reachable;
}
