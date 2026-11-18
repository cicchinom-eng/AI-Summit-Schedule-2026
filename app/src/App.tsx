import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { ConferenceData } from './data/types';
import { loadLive, loadSnapshot } from './data/sheet';
import { currentDayNumber, isEventDay, minutesOf } from './data/derive';
import { useStars } from './state/stars';
import { Book, Compass, Grid, Star } from './components/icons';
import SessionDetail from './components/SessionDetail';
import StarModal from './components/StarModal';
import Sessions from './views/Sessions';
import Pathfinder from './views/Pathfinder';
import MyDay from './views/MyDay';
import Program from './views/Program';

export type Route = { view: string; params: URLSearchParams };

export function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  return { view: path || 'program', params: new URLSearchParams(qs ?? '') };
}

export function go(view: string, params?: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => { if (v) p.set(k, v); });
  const qs = p.toString();
  window.location.hash = `/${view}${qs ? '?' + qs : ''}`;
}

type Ctx = {
  data: ConferenceData;
  stars: Set<string>;
  toggleStar: (id: string) => void;
  addStars: (ids: string[]) => void;
  clearStars: () => void;
  open: (id: string) => void;
  route: Route;
  now: Date;
  nowMin: number;
  eventDay: boolean;
  currentDay: number | null;
  preview: string | null;
  setPreview: (v: string | null) => void;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('no ctx');
  return c;
};

const NAV = [
  { id: 'program', label: 'Program', icon: Book },
  { id: 'sessions', label: 'Explore', icon: Grid },
  { id: 'pathfinder', label: 'Pathfinder', icon: Compass },
  { id: 'my-schedule', label: 'My Schedule', icon: Star },
];

export default function App() {
  const [data, setData] = useState<ConferenceData>(() => loadSnapshot());
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [openId, setOpenId] = useState<string | null>(() => parseHash().params.get('s'));
  const [tick, setTick] = useState<Date>(() => new Date());
  const [preview, setPreview] = useState<string | null>(null);
  const { stars, toggle, addMany, clear, notice, dismiss } = useStars();

  useEffect(() => {
    let alive = true;
    const pull = () => loadLive().then((d) => { if (alive) setData(d); }).catch((e) => console.warn('Live sheet unavailable, using snapshot:', e));
    pull();
    const t = setInterval(() => { if (document.visibilityState === 'visible') pull(); }, 90_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    const onHash = () => { const r = parseHash(); setRoute(r); setOpenId(null); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [route.view]);
  useEffect(() => { const t = setInterval(() => setTick(new Date()), 30_000); return () => clearInterval(t); }, []);

  const now = useMemo(() => {
    if (!preview) return tick;
    const [h, m] = preview.split(':').map((x) => parseInt(x, 10));
    const d = new Date(tick); d.setHours(h, m, 0, 0); return d;
  }, [tick, preview]);

  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);

  useEffect(() => { document.body.style.overflow = openId || notice ? 'hidden' : ''; }, [openId, notice]);

  const eventDay = !!preview || isEventDay(data, now);
  const currentDay = preview ? 1 : currentDayNumber(data, now);

  const ctx: Ctx = {
    data, stars, toggleStar: toggle, addStars: addMany, clearStars: clear, open, route,
    now, nowMin: minutesOf(now), eventDay, currentDay, preview, setPreview,
  };

  const View = { sessions: Sessions, pathfinder: Pathfinder, 'my-schedule': MyDay, program: Program }[route.view] ?? Program;
  const openSession = openId ? data.sessions.find((s) => s.id === openId) ?? null : null;

  return (
    <AppCtx.Provider value={ctx}>
      <header className="topbar no-print">
        <div className="wrap topbar-in">
          <a className="wordmark" href="#/program">
            <img src="/techspo-logo.png" alt="Techspo '27" className="wordmark-logo" />
          </a>
{/* live indicator removed per design */}
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.id} href={`#/${n.id}`} aria-current={route.view === n.id ? 'page' : undefined}>
                {n.label}{n.id === 'my-schedule' && stars.size > 0 && <span className="count">{stars.size}</span>}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <div className="wrap view-enter" key={route.view}>
          <View />
          <footer className="footer no-print">
            <span>{data.info.event_edition ?? "Techspo '27"} · {data.info.event_dates}</span>
            <span>Presented by {data.info.host}.</span>
          </footer>
        </div>
      </main>

      <nav className="tabbar no-print" aria-label="Main">
        {NAV.map((n) => (
          <a key={n.id} href={`#/${n.id}`} aria-current={route.view === n.id ? 'page' : undefined}>
            <n.icon size={22} />{n.label}{n.id === 'my-schedule' && stars.size > 0 && <span className="count">{stars.size}</span>}
          </a>
        ))}
      </nav>

      <AnimatePresence>{openSession && <SessionDetail key={openSession.id} session={openSession} onClose={close} />}</AnimatePresence>
      <AnimatePresence>{notice && <StarModal key="notice" onClose={dismiss} />}</AnimatePresence>
    </AppCtx.Provider>
  );
}
