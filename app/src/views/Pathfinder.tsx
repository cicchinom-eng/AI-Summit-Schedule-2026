import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp, go } from '../App';
import { buildPath, dayName, emptyProfile, numDays, ordered, ROLE_ORDER, trackColor, roomForSlot, scrollToEl, slotTime, uniqueValues, type Profile } from '../data/derive';
import { Check, Star } from '../components/icons';

const KEY = 'techspo27.profile';

function Pill({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; placeholder: string }) {
  const current = options.find((o) => o.v === value);
  return (
    <span className={`pill-select ${value ? 'set' : ''}`}>
      <span className="pill-label">{current?.l ?? placeholder}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </span>
  );
}

export default function Pathfinder() {
  const { data, stars, addStars, open } = useApp();
  const [p, setP] = useState<Profile>(() => { try { return { ...emptyProfile, ...(JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? {}) }; } catch { return emptyProfile; } });
  const save = (n: Profile) => { setP(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* ignore */ } };
  const roles = ordered(uniqueValues(data, (s) => s.audience), ROLE_ORDER);
  const ready = !!p.role || p.tracks.length > 0 || !!p.experience || !!p.style;
  const path = useMemo(() => (ready ? buildPath(data, p) : []), [data, p, ready]);
  const days = numDays(data);
  const topIds = path.map((st) => st.picks[0]?.session.id).filter(Boolean) as string[];
  const allStarred = topIds.length > 0 && topIds.every((id) => stars.has(id));
  const [revealed, setRevealed] = useState(ready);
  useEffect(() => { if (ready && !revealed) { setRevealed(true); setTimeout(() => scrollToEl(document.getElementById('pf-result'), 84), 80); } }, [ready, revealed]);

  const roleLabel = (r: string) => ({
    'Technology Directors': 'a technology director',
    'Superintendents': 'a superintendent',
    'Asst. Superintendents': 'an assistant superintendent',
    'Curriculum Directors': 'a curriculum director',
    'Building Principals': 'a building principal',
    'IT Staff': 'IT staff',
    'Instructional Coaches': 'an instructional coach',
    'Teachers': 'a teacher',
  }[r] ?? r.toLowerCase());

  const toggleTk = (name: string) => {
    const on = p.tracks.includes(name);
    save({ ...p, tracks: on ? p.tracks.filter((x) => x !== name) : p.tracks.length >= 3 ? [...p.tracks.slice(1), name] : [...p.tracks, name] });
  };

  return (
    <>
      <div className="page-head">
        <div><h2>Pathfinder.</h2><p className="sub">Tell us about yourself and we'll build your ideal {days}-day conference schedule.</p></div>
      </div>

      <section className="madlib">
        <p className="sentence">
          <span>I'm</span>
          <Pill value={p.role} onChange={(v) => save({ ...p, role: v })} placeholder="select your role" options={roles.map((r) => ({ v: r, l: roleLabel(r) }))} />
          <span>who is</span>
          <Pill value={p.experience} onChange={(v) => save({ ...p, experience: v as Profile['experience'] })} placeholder="select experience" options={[{ v: 'new', l: 'just getting started' }, { v: 'intermediate', l: 'comfortable with the basics' }, { v: 'advanced', l: 'ready for advanced topics' }]} />
          <span>with edtech, and I learn best when I</span>
          <Pill value={p.style} onChange={(v) => save({ ...p, style: v as Profile['style'] })} placeholder="any style" options={[{ v: 'hands-on', l: 'get hands-on' }, { v: 'listen', l: 'sit back and absorb' }, { v: 'discuss', l: 'talk it through' }]} />
          <span>.</span>
        </p>
        <div className="curious">
          <span className="curious-label">I'm most interested in</span>
          <div className="curious-chips">
            {data.tracks.map((tk) => {
              const on = p.tracks.includes(tk.name);
              return <button key={tk.id} className="chip tk" aria-pressed={on} style={{ ['--c' as string]: tk.color }} onClick={() => toggleTk(tk.name)}><span className="dot" />{tk.name}</button>;
            })}
          </div>
          <span className="curious-hint">{p.tracks.length === 0 ? 'Pick up to three tracks.' : p.tracks.length === 3 ? 'Three is the max; tap one to swap.' : `${3 - p.tracks.length} more if you like.`}</span>
        </div>
        {ready && <div className="madlib-foot"><button className="btn ghost sm" onClick={() => { save(emptyProfile); setRevealed(false); }}>Start over</button></div>}
      </section>

      <AnimatePresence>
        {ready && (
          <motion.section id="pf-result" className="section" style={{ marginTop: 40 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div className="section-head">
              <div><h2>Your conference.</h2><p className="sub">Top picks for every breakout slot across all {days} days. Picks update live as you change your answers.</p></div>
              <button className="btn dark" disabled={allStarred} onClick={() => addStars(topIds)}>
                {allStarred ? <><Check size={18} /> All top picks starred</> : <><Star size={18} filled /> Star all top picks</>}
              </button>
            </div>

            {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
              const daySteps = path.filter((st) => st.day === d);
              if (daySteps.length === 0) return null;
              return (
                <div key={d} className="pf-day">
                  <h3 className="pf-day-head">{dayName(data, d)} <small>{data.info[`day${d}_date`]}</small></h3>
                  <div className="stops">
                    {daySteps.map((st, i) => {
                      const top = st.picks[0];
                      return (
                        <motion.div key={st.slot} className="stop" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.08 }}>
                          <div className="stop-head"><span className="stop-n">{st.slot}</span><div><b>Breakout {st.slot}</b><span>{slotTime(data, st.slot)}</span></div></div>
                          {top ? (
                            <>
                              <button className="stop-top" style={{ ['--c' as string]: trackColor(data, top.session.track) }} onClick={() => open(top.session.id)}>
                                <div className="track-label">{top.session.track}</div>
                                <div className="t">{top.session.title}</div>
                                <div className="w">{top.session.presenters}</div>
                                <div className="why">{top.reasons.map((r) => <span key={r}>{r}</span>)}</div>
                                <div className="foot"><span className="tag room">{roomForSlot(top.session, st.slot)}</span>{stars.has(top.session.id) && <span className="tag"><Star size={12} filled /> Starred</span>}</div>
                              </button>
                              {st.picks.length > 1 && (
                                <div className="stop-alts">
                                  <div className="alts-label">Backups</div>
                                  {st.picks.slice(1).map((pk) => (
                                    <button key={pk.session.id} className="stop-alt" style={{ ['--c' as string]: trackColor(data, pk.session.track) }} onClick={() => open(pk.session.id)}>
                                      <span className="dot" /><span className="t">{pk.session.title}</span><span className="tag room">{roomForSlot(pk.session, st.slot)}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : <p className="muted">No sessions in this slot yet.</p>}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="panel soft" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
              <span>Want to see everything? The Explore page has every filter.</span>
              <button className="btn light" onClick={() => go('sessions', { track: p.tracks[0] })}>Explore all sessions</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
