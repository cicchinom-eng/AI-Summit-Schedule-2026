import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { SummitData } from './data/types';
import { loadLive, loadSnapshot } from './data/sheet';
import { isEventDay, minutesOf } from './data/derive';
import { useStars } from './state/stars';
import { useTheme, type ThemeId } from './state/theme';
import ThemeDecor from './components/ThemeDecor';
import { Book, Compass, Grid, Star } from './components/icons';
import SessionDetail from './components/SessionDetail';
import StarModal from './components/StarModal';
import Overview from './views/Overview';
import Sessions from './views/Sessions';
import Pathfinder from './views/Pathfinder';
import Rooms from './views/Rooms';
import MyDay from './views/MyDay';
import Program from './views/Program';
import SecretMenu from './views/SecretMenu';
import PunchOut from './views/PunchOut';
import DuckHunt from './views/DuckHunt';
import OregonTrail from './views/OregonTrail';
import SpaceInvaders from './views/SpaceInvaders';
import AOL from './views/AOL';

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
  data: SummitData;
  stars: Set<string>;
  toggleStar: (id: string) => void;
  addStars: (ids: string[]) => void;
  clearStars: () => void;
  open: (id: string) => void;
  route: Route;
  now: Date; // real or previewed
  nowMin: number;
  eventDay: boolean;
  preview: string | null; // "HH:MM" or null
  setPreview: (v: string | null) => void;
  theme: ThemeId | null;
  tryThemeCode: (raw: string) => 'set' | 'off' | null;
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
  { id: 'my-day', label: 'My Day', icon: Star },
];
/** Pages that stay reachable by URL (and by typing their name into the Explore search) but are not in the menus. */
export const HIDDEN_VIEWS = ['rooms', 'overview', 'secret-menu', 'punchout', 'duckhunt', 'oregontrail', 'spaceinvaders', 'aol'];

export default function App() {
  const [data, setData] = useState<SummitData>(() => loadSnapshot());
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [openId, setOpenId] = useState<string | null>(() => parseHash().params.get('s'));
  const [tick, setTick] = useState<Date>(() => new Date());
  const [preview, setPreview] = useState<string | null>(null);
  const { stars, toggle, addMany, clear, notice, dismiss } = useStars();
  const { theme, setTheme, tryCode } = useTheme();
  const [toast, setToast] = useState<string | null>(null);
  const tryThemeCode = useCallback((raw: string) => {
    const r = tryCode(raw);
    const w = raw.trim().toLowerCase();
    if (r === 'set') setToast(w.includes('disney') || w === 'mickey' || w === 'magic' ? '✨ Bibbidi-bobbidi-boo. The magic is on.' : w.startsWith('9') || w === 'nineties' ? '📼 Whoa. It\u2019s 1996 again.' : w.startsWith('8') || w === 'eighties' || w === 'radical' ? '🕶 Totally radical. It\u2019s 1985.' : '🍄 Player 1 has entered the game.');
    else if (r === 'off') setToast('Back to normal.');
    if (r) setTimeout(() => setToast(null), 2600);
    return r;
  }, [tryCode]);

  // Live data: fetch on load, then refresh every 90 s while the tab is visible.
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

  const ctx: Ctx = {
    data, stars, toggleStar: toggle, addStars: addMany, clearStars: clear, open, route,
    now, nowMin: minutesOf(now), eventDay: !!preview || isEventDay(data, now), preview, setPreview,
    theme, tryThemeCode,
  };

  const View = { overview: Overview, sessions: Sessions, pathfinder: Pathfinder, rooms: Rooms, 'my-day': MyDay, program: Program, 'secret-menu': SecretMenu, punchout: PunchOut, duckhunt: DuckHunt, oregontrail: OregonTrail, spaceinvaders: SpaceInvaders, aol: AOL }[route.view] ?? Program;
  const openSession = openId ? data.sessions.find((s) => s.id === openId) ?? null : null;

  return (
    <AppCtx.Provider value={ctx}>
      <header className="topbar no-print">
        <div className="wrap topbar-in">
          <a className="wordmark" href="#/program"><b>NJ AI Literacy Summit</b><span>2026</span></a>
          <span className={`live ${data.source}`} title={data.source === 'live' ? `Reading the live schedule sheet (checked ${data.fetchedAt.toLocaleTimeString()})` : 'Showing the built-in copy of the schedule'}>
            <i />{data.source === 'live' ? 'Live schedule' : 'Offline copy'}
          </span>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.id} href={`#/${n.id}`} aria-current={route.view === n.id ? 'page' : undefined}>
                {n.label}{n.id === 'my-day' && stars.size > 0 && <span className="count">{stars.size}</span>}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <div className="wrap view-enter" key={route.view}>
          <View />
          <footer className="footer no-print">
            <span>{data.info.event_edition ?? 'NJ AI Literacy Summit'} · {data.info.event_date}</span>
            <span>Hosted by {data.info.host}.</span>
          </footer>
        </div>
      </main>

      <nav className="tabbar no-print" aria-label="Main">
        {NAV.map((n) => (
          <a key={n.id} href={`#/${n.id}`} aria-current={route.view === n.id ? 'page' : undefined}>
            <n.icon size={22} />{n.label}{n.id === 'my-day' && stars.size > 0 && <span className="count">{stars.size}</span>}
          </a>
        ))}
      </nav>

      {theme && <ThemeDecor theme={theme} onExit={() => { setTheme(null); setToast('Back to normal.'); setTimeout(() => setToast(null), 2000); }} />}
      {toast && <div className="theme-toast no-print" role="status">{toast}</div>}
      <AnimatePresence>{openSession && <SessionDetail key={openSession.id} session={openSession} onClose={close} />}</AnimatePresence>
      <AnimatePresence>{notice && <StarModal key="notice" onClose={dismiss} />}</AnimatePresence>
    </AppCtx.Provider>
  );
}
