import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp, go } from '../App';
import { buildPath, emptyProfile, GRADE_ORDER, ROLE_ORDER, ordered, pathwayColor, roomForSlot, scrollToEl, slotTime, uniqueValues, type Profile } from '../data/derive';
import { Check, Star } from '../components/icons';

const KEY = 'njais26.profile';

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
  const roles = ordered(uniqueValues(data, (s) => s.audience), ROLE_ORDER).filter((r) => r !== 'Other');
  const grades = ordered(uniqueValues(data, (s) => [s.grade]), GRADE_ORDER).filter((g) => g !== 'All grades');
  const ready = !!p.role || p.pathways.length > 0 || !!p.experience || !!p.grade || !!p.style;
  const path = useMemo(() => (ready ? buildPath(data, p) : []), [data, p, ready]);
  const topIds = path.map((st) => st.picks[0]?.session.id).filter(Boolean) as string[];
  const allStarred = topIds.length > 0 && topIds.every((id) => stars.has(id));
  const [revealed, setRevealed] = useState(ready);
  useEffect(() => { if (ready && !revealed) { setRevealed(true); setTimeout(() => scrollToEl(document.getElementById('pf-result'), 84), 80); } }, [ready, revealed]);

  const roleLabel = (r: string) => ({ Teachers: 'a teacher', 'Tech Coaches': 'a tech coach', 'Technology Directors': 'a technology director', 'Department Supervisors': 'a department supervisor', 'Building Administrators': 'a building administrator', 'Directors / Asst. Superintendents': 'a director or assistant superintendent', Superintendents: 'a superintendent' }[r] ?? r.toLowerCase());
  const gradeLabel = (g: string) => ({ Elementary: 'elementary students', 'K-8': 'K-8 students', 'Secondary (6-12)': 'secondary students', 'Leaders / System-level': 'school and district leaders' }[g] ?? g);
  const togglePw = (name: string) => {
    const on = p.pathways.includes(name);
    save({ ...p, pathways: on ? p.pathways.filter((x) => x !== name) : p.pathways.length >= 3 ? [...p.pathways.slice(1), name] : [...p.pathways, name] });
  };

  return (
    <>
      <div className="page-head">
        <div><h2>Pathfinder.</h2><p className="sub">Fill in the blanks and your day takes shape below.</p></div>
      </div>

      <section className="madlib">
        <p className="sentence">
          <span>I'm</span>
          <Pill value={p.role} onChange={(v) => save({ ...p, role: v })} placeholder="a role" options={roles.map((r) => ({ v: r, l: roleLabel(r) }))} />
          <span>who is</span>
          <Pill value={p.experience} onChange={(v) => save({ ...p, experience: v as Profile['experience'] })} placeholder="new or experienced" options={[{ v: 'new', l: 'just getting started' }, { v: 'comfortable', l: 'comfortable with the basics' }, { v: 'advanced', l: 'ready to go deep' }]} />
          <span>with AI. I work with</span>
          <Pill value={p.grade} onChange={(v) => save({ ...p, grade: v })} placeholder="any grade" options={grades.map((g) => ({ v: g, l: gradeLabel(g) }))} />
          <span>and I learn best when I</span>
          <Pill value={p.style} onChange={(v) => save({ ...p, style: v as Profile['style'] })} placeholder="learn any way" options={[{ v: 'hands-on', l: 'get hands-on' }, { v: 'listen', l: 'sit back and take notes' }, { v: 'discuss', l: 'talk it through' }]} />
          <span>.</span>
        </p>
        <div className="curious">
          <span className="curious-label">I'm curious about</span>
          <div className="curious-chips">
            {data.pathways.map((pw) => {
              const on = p.pathways.includes(pw.name);
              return <button key={pw.id} className="chip pw" aria-pressed={on} style={{ ['--c' as string]: pw.color }} onClick={() => togglePw(pw.name)}><span className="dot" />{pw.name}</button>;
            })}
          </div>
          <span className="curious-hint">{p.pathways.length === 0 ? 'Pick up to three.' : p.pathways.length === 3 ? 'Three is the max; tap one to swap.' : `${3 - p.pathways.length} more if you like.`}</span>
        </div>
        {ready && <div className="madlib-foot"><button className="btn ghost sm" onClick={() => { save(emptyProfile); setRevealed(false); }}>Start over</button></div>}
      </section>

      <AnimatePresence>
        {ready && (
          <motion.section id="pf-result" className="section" style={{ marginTop: 40 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div className="section-head">
              <div><h2>Your day.</h2><p className="sub">A top pick for each time slot, with two backups in case a room fills. Picks update as you change your answers.</p></div>
              <button className="btn dark" disabled={allStarred} onClick={() => addStars(topIds)}>
                {allStarred ? <><Check size={18} /> Top picks starred</> : <><Star size={18} filled /> Star all four top picks</>}
              </button>
            </div>
            <div className="stops">
              {path.map((st, i) => {
                const top = st.picks[0];
                return (
                  <motion.div key={st.slot} className="stop" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.08 }}>
                    <div className="stop-head"><span className="stop-n">{st.slot}</span><div><b>Session {st.slot}</b><span>{slotTime(data, st.slot)}</span></div></div>
                    {top ? (
                      <>
                        <button className="stop-top" style={{ ['--c' as string]: pathwayColor(data, top.session.pathway) }} onClick={() => open(top.session.id)}>
                          <div className="pw-label">{top.session.pathway}</div>
                          <div className="t">{top.session.title}</div>
                          <div className="w">{top.session.presenters}</div>
                          <div className="why">{top.reasons.map((r) => <span key={r}>{r}</span>)}</div>
                          <div className="foot"><span className="tag room">{roomForSlot(top.session, st.slot)}</span>{stars.has(top.session.id) && <span className="tag"><Star size={12} filled /> Starred</span>}</div>
                        </button>
                        {st.picks.length > 1 && (
                          <div className="stop-alts">
                            <div className="alts-label">Backups</div>
                            {st.picks.slice(1).map((pk) => (
                              <button key={pk.session.id} className="stop-alt" style={{ ['--c' as string]: pathwayColor(data, pk.session.pathway) }} onClick={() => open(pk.session.id)}>
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
            <div className="panel soft" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
              <span>Want to see everything? The Explore page has every filter.</span>
              <button className="btn light" onClick={() => go('sessions', { pathway: p.pathways[0] })}>Explore all sessions</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
