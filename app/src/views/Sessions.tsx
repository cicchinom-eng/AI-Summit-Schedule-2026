import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp, go } from '../App';
import { applyFilters, countActive, dayName, dayDate, emptyFilters, FORMAT_ORDER, LEVEL_ORDER, numDays, ordered, ROLE_ORDER, sessionsInSlot, slotsForDay, slotTime, uniqueValues, byTitle, type Filters } from '../data/derive';
import SessionCard from '../components/SessionCard';
import { Search, X } from '../components/icons';

function Chip({ on, onClick, color, children }: { on: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button className={`chip ${color ? 'tk' : ''}`} aria-pressed={on} onClick={onClick} style={color ? { ['--c' as string]: color } : undefined}>
      {color && <span className="dot" />}{children}
    </button>
  );
}

export default function Sessions() {
  const { data, route, stars } = useApp();
  const days = numDays(data);
  const initDay = parseInt(route.params.get('day') ?? '0', 10);
  const initSlot = parseInt(route.params.get('slot') ?? '0', 10);
  const [day, setDay] = useState<number>(initDay >= 1 && initDay <= days ? initDay : 0);
  const [slot, setSlot] = useState<number>(initSlot);
  const [f, setF] = useState<Filters>(() => ({ ...emptyFilters, tracks: route.params.get('track') ? [route.params.get('track')!] : [], q: route.params.get('q') ?? '' }));
  const [showFilters, setShowFilters] = useState<boolean>(() => !!route.params.get('track'));

  const daySlots = useMemo(() => day > 0 ? slotsForDay(data, day) : [], [data, day]);

  useEffect(() => {
    const d = parseInt(route.params.get('day') ?? '', 10);
    const s = parseInt(route.params.get('slot') ?? '', 10);
    if (Number.isFinite(d)) setDay(d);
    if (Number.isFinite(s)) setSlot(s);
    const tk = route.params.get('track');
    if (tk) { setF((x) => ({ ...x, tracks: [tk] })); setShowFilters(true); }
  }, [route]);

  const base = useMemo(() => {
    if (slot > 0) return sessionsInSlot(data, slot);
    if (day > 0) {
      const slots = slotsForDay(data, day);
      return [...data.sessions].filter((s) => s.slots.some((sl) => slots.includes(sl))).sort(byTitle);
    }
    return [...data.sessions].sort(byTitle);
  }, [data, day, slot]);

  const list = useMemo(() => applyFilters(base, f, stars), [base, f, stars]);
  const active = countActive(f);

  const roles = ordered(uniqueValues(data, (s) => s.audience), ROLE_ORDER);
  const levels = ordered(uniqueValues(data, (s) => [s.level]), LEVEL_ORDER);
  const formats = ordered(uniqueValues(data, (s) => [s.format]), FORMAT_ORDER);
  const tags = uniqueValues(data, (s) => s.tags).sort();
  const tog = (key: keyof Filters, v: string) => setF((x) => { const arr = x[key] as string[]; return { ...x, [key]: arr.includes(v) ? arr.filter((a) => a !== v) : [...arr, v] }; });

  const pickDay = (d: number) => { setDay(d); setSlot(0); go('sessions', { day: String(d) }); };
  const pickSlot = (s: number) => { setSlot(s); go('sessions', { day: String(day), slot: String(s), track: f.tracks[0] }); };

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Explore.</h2>
          <p className="sub">Browse all sessions across {days} days. Star your favorites and build your schedule.</p>
        </div>
        <button className="btn light" onClick={() => go('pathfinder')}>Not sure where to start? Try the Pathfinder</button>
      </div>

      {/* Day switcher */}
      <div className="day-switch" role="tablist" aria-label="Conference day">
        <button role="tab" aria-pressed={day === 0} onClick={() => pickDay(0)} className={day === 0 ? 'active' : ''}>
          <b>All days</b><small>Every session</small>
        </button>
        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
          <button key={d} role="tab" aria-pressed={day === d} onClick={() => pickDay(d)} className={day === d ? 'active' : ''}>
            <b>{dayName(data, d)}</b><small>{dayDate(data, d)}</small>
          </button>
        ))}
      </div>

      {/* Slot switcher (if a specific day is selected) */}
      {day > 0 && daySlots.length > 0 && (
        <div className="slot-switch" role="tablist" aria-label="Breakout slot">
          <button role="tab" aria-pressed={slot === 0} onClick={() => pickSlot(0)}>
            {slot === 0 && <motion.span layoutId="slot-pill" className="pill-bg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            All breakouts<small>{dayName(data, day)}</small>
          </button>
          {daySlots.map((s) => (
            <button key={s} role="tab" aria-pressed={slot === s} onClick={() => pickSlot(s)}>
              {slot === s && <motion.span layoutId="slot-pill" className="pill-bg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              Breakout {s}<small>{slotTime(data, s)}</small>
            </button>
          ))}
        </div>
      )}

      <div className="toolbar">
        <label className="search"><Search /><span className="vh">Search sessions</span>
          <input type="search" placeholder="Search titles, presenters, tools, rooms..." value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
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
              <div className="label">Track<small>Topic area</small></div>
              <div className="chips">{data.tracks.map((t) => <Chip key={t.id} color={t.color} on={f.tracks.includes(t.name)} onClick={() => tog('tracks', t.name)}>{t.name}</Chip>)}</div>
            </div>
            <div className="filter-group">
              <div className="label">My role</div>
              <div className="chips">{roles.map((r) => <Chip key={r} on={f.roles.includes(r)} onClick={() => tog('roles', r)}>{r}</Chip>)}</div>
            </div>
            <div className="filter-group">
              <div className="label">Level</div>
              <div className="chips">{levels.map((l) => <Chip key={l} on={f.levels.includes(l)} onClick={() => tog('levels', l)}>{l}</Chip>)}</div>
            </div>
            <div className="filter-group">
              <div className="label">Format</div>
              <div className="chips">{formats.map((x) => <Chip key={x} on={f.formats.includes(x)} onClick={() => tog('formats', x)}>{x}</Chip>)}</div>
            </div>
            {tags.length > 0 && (
              <div className="filter-group">
                <div className="label">Tags</div>
                <div className="chips">{tags.map((t) => <Chip key={t} on={f.tags.includes(t)} onClick={() => tog('tags', t)}>{t}</Chip>)}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="results-line">
        <span>{!active && day === 0 ? <b>Every session, all days</b> : <><b>{list.length}</b> {list.length === 1 ? 'session' : 'sessions'}{slot ? ` in Breakout ${slot}` : day ? ` on ${dayName(data, day)}` : ''}{active ? ' match your filters' : ''}</>}</span>
        {slot > 0 && <span className="small">{slotTime(data, slot)}</span>}
      </div>

      {list.length === 0 ? (
        <div className="panel soft" style={{ textAlign: 'center', padding: 40 }}>
          <h3>Nothing matches yet</h3>
          <p className="muted" style={{ marginTop: 6 }}>Try fewer filters or check another day.</p>
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
