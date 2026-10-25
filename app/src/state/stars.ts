import { useCallback, useEffect, useState } from 'react';

const KEY = 'njais26.stars';
const SEEN = 'njais26.starNoticeSeen';

function read(): Set<string> {
  try { const raw = localStorage.getItem(KEY); return new Set(raw ? (JSON.parse(raw) as string[]) : []); } catch { return new Set(); }
}

export function useStars() {
  const [stars, setStars] = useState<Set<string>>(() => read());
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify([...stars])); } catch { /* private mode: stars live in memory only */ }
  }, [stars]);

  const toggle = useCallback((id: string) => {
    setStars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        let seen = false;
        try { seen = localStorage.getItem(SEEN) === '1'; } catch { /* ignore */ }
        if (!seen) { setNotice(true); try { localStorage.setItem(SEEN, '1'); } catch { /* ignore */ } }
      }
      return next;
    });
  }, []);

  const addMany = useCallback((ids: string[]) => {
    setStars((prev) => { const next = new Set(prev); ids.forEach((i) => next.add(i)); return next; });
    let seen = false;
    try { seen = localStorage.getItem(SEEN) === '1'; } catch { /* ignore */ }
    if (!seen) { setNotice(true); try { localStorage.setItem(SEEN, '1'); } catch { /* ignore */ } }
  }, []);

  const clear = useCallback(() => setStars(new Set()), []);
  const dismiss = useCallback(() => setNotice(false), []);

  return { stars, toggle, addMany, clear, notice, dismiss };
}
