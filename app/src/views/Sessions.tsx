import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp, go, HIDDEN_VIEWS } from '../App';
import { applyFilters, countActive, emptyFilters, FORMAT_ORDER, GRADE_ORDER, LEVEL_ORDER, ordered, ROLE_ORDER, sessionsInSlot, slotTime, uniqueValues, byTitle, type Filters } from '../data/derive';
import SessionCard from '../components/SessionCard';
import { Search, X } from '../components/icons';

function Chip({ on, onClick, color, children }: { on: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button className={`chip ${color ? 'pw' : ''}`} aria-pressed={on} onClick={onClick} style={color ? { ['--c' as string]: color } : undefined}>
      {color && <span className="dot" />}{children}
    </button>
  );
}

export default function Sessions() {
  const { data, route, stars, tryThemeCode } = useApp();
  const initialSlot = parseInt(route.params.get('slot') ?? '1', 10);
  const [slot, setSlot] = useState<number>(Number.isFinite(initialSlot) && initialSlot >= 0 && initialSlot <= 4 ? initialSlot : 1);
  const [f, setF] = useState<Filters>(() => ({ ...emptyFilters, pathways: route.params.get('pathway') ? [route.params.get('pathway')!] : [], q: route.params.get('q') ?? '' }));
  const [showFilters, setShowFilters] = useState<boolean>(() => !!route.params.get('pathway'));

  useEffect(() => {
    const s = parseInt(route.params.get('slot') ?? '', 10);
    if (Number.isFinite(s)) setSlot(s);
    const pw = route.params.get('pathway');
    if (pw) { setF((x) => ({ ...x, pathways: [pw] })); setShowFilters(true); }
  }, [route]);

  const base = useMemo(() => (slot === 0 ? [...data.sessions].sort(byTitle) : sessionsInSlot(data, slot)), [data, slot]);
  const list = useMemo(() => applyFilters(base, f, stars), [base, f, stars]);
  const active = countActive(f);

  const roles = ordered(uniqueValues(data, (s) => s.audience), ROLE_ORDER);
  const grades = ordered(uniqueValues(data, (s) => [s.grade]), GRADE_ORDER);
  const levels = ordered(uniqueValues(data, (s) => [s.level]), LEVEL_ORDER);
  const formats = ordered(uniqueValues(data, (s) => [s.format]), FORMAT_ORDER);
  const tog = (key: keyof Filters, v: string) => setF((x) => { const arr = x[key] as string[]; return { ...x, [key]: arr.includes(v) ? arr.filter((a) => a !== v) : [...arr, v] }; });

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Explore.</h2>
          <p className="sub">Up to 30 sessions per time slot to choose from. Star what you like; nothing to sign up for.</p>
        </div>
        <button className="btn light" onClick={() => go('pathfinder')}>Not sure where to start? Try the Pathfinder</button>
      </div>

      <div className="slot-switch" role="tablist" aria-label="Time slot">
        {[1, 2, 3, 4, 0].map((n) => (
          <button key={n} role="tab" aria-pressed={slot === n} onClick={() => { setSlot(n); go('sessions', { slot: String(n), pathway: f.pathways[0] }); }}>
            {slot === n && <motion.span layoutId="slot-pill" className="pill-bg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            {n === 0 ? 'All sessions' : `Session ${n}`}
            <small>{n === 0 ? 'Every slot' : slotTime(data, n)}</small>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <label className="search"><Search /><span className="vh">Search sessions</span>
          <input type="search" placeholder="Search titles, presenters, tools, rooms…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              const w = f.q.trim().toLowerCase();
              const slug = w.replace(/\s+/g, '-');
              if (HIDDEN_VIEWS.includes(slug)) { e.preventDefault(); setF({ ...f, q: '' }); go(slug); return; }
              if (tryThemeCode(w)) { e.preventDefault(); setF({ ...f, q: '' }); }
            }} />
          {f.q && <button onClick={() => setF({ ...f, q: '' })} aria-label="Clear search"><X size={16} /></button>}
        </label>
        <button className="btn light" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>Filters{active - (f.q ? 1 : 0) > 0 ? ` (${active - (f.q ? 1 : 0)})` : ''}</button>
        <Chip on={f.starredOnly} onClick={() => setF({ ...f, starredOnly: !f.starredOnly })}>★ Starred only</Chip>
        {active > 0 && <button className="btn ghost sm" onClick={() => setF(emptyFilters)}>Clear all</button>}
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div className="filters" initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <div className="filter-group">
              <div className="label">Pathway<small>Topic lens</small></div>
              <div className="chips">{data.pathways.map((p) => <Chip key={p.id} color={p.color} on={f.pathways.includes(p.name)} onClick={() => tog('pathways', p.name)}>{p.name}</Chip>)}</div>
            </div>
            <div className="filter-group">
              <div className="label">My role</div>
              <div className="chips">{roles.map((r) => <Chip key={r} on={f.roles.includes(r)} onClick={() => tog('roles', r)}>{r}</Chip>)}</div>
            </div>
            <div className="filter-group">
              <div className="label">Experience</div>
              <div className="chips">{levels.map((l) => <Chip key={l} on={f.levels.includes(l)} onClick={() => tog('levels', l)}>{l === 'Open to All' ? 'Open to all (beginners welcome)' : l}</Chip>)}</div>
            </div>
            <div className="filter-group">
              <div className="label">Grade band</div>
              <div className="chips">{grades.map((g) => <Chip key={g} on={f.grades.includes(g)} onClick={() => tog('grades', g)}>{g}</Chip>)}</div>
            </div>
            <div className="filter-group">
              <div className="label">Format</div>
              <div className="chips">{formats.map((x) => <Chip key={x} on={f.formats.includes(x)} onClick={() => tog('formats', x)}>{x}</Chip>)}<Chip on={f.device} onClick={() => setF({ ...f, device: !f.device })}>Hands-on with my device</Chip></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="results-line">
        <span>{slot === 0 && !active ? <b>Every session, every slot</b> : <><b>{list.length}</b> {list.length === 1 ? 'session' : 'sessions'}{slot ? ` in Session ${slot}` : ''}{active ? ' match your filters' : ''}</>}</span>
        {slot > 0 && <span className="small">{slotTime(data, slot)} · classrooms</span>}
      </div>

      {list.length === 0 ? (
        <div className="panel soft" style={{ textAlign: 'center', padding: 40 }}>
          <h3>Nothing matches yet</h3>
          <p className="muted" style={{ marginTop: 6 }}>Try fewer filters, or check another time slot.</p>
          <button className="btn dark sm" style={{ marginTop: 14 }} onClick={() => setF(emptyFilters)}>Clear filters</button>
        </div>
      ) : (
        <motion.div className="grid" layout>
          <AnimatePresence mode="popLayout">
            {list.map((s) => <SessionCard key={s.id} session={s} slot={slot || undefined} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
