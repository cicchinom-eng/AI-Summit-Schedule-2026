import { useState } from 'react';
import { useApp, go } from '../App';
import { byTitle, blocksForDay, currentBlocks, currentSlot, dayDate, dayName, nextSlot, numDays, trackColor, roomForSlot, scrollToEl, sessionsInSlot, slotsForDay, slotTime } from '../data/derive';
import type { Keynote } from '../data/types';
import { Arrow, Calendar, Info, MapPin, Print, Search } from '../components/icons';

function Person({ k }: { k: Keynote }) {
  const tbd = /tbd|announced/i.test(k.name);
  return (
    <div className="person">
      <div className="avatar" aria-hidden>{tbd ? '?' : k.name.slice(0, 1)}</div>
      <div>
        <div className="name">{tbd ? 'To be announced' : k.name}</div>
        <div className="role">{tbd ? 'Speaker coming soon' : [k.title, k.org].filter(Boolean).join(', ')}</div>
      </div>
    </div>
  );
}

export default function Program() {
  const { data, open, nowMin, eventDay, currentDay } = useApp();
  const info = data.info;
  const days = numDays(data);
  const [viewDay, setViewDay] = useState<number>(currentDay ?? 1);
  const all = [...data.sessions].sort(byTitle);
  const notes = [info.session_note_1, info.session_note_2, info.session_note_3].filter(Boolean);
  const dayBlocks = blocksForDay(data, viewDay);
  const daySlots = slotsForDay(data, viewDay);
  const keynotes = data.keynotes.filter((k) => k.day === viewDay);
  const nowBlocks = eventDay && currentDay === viewDay ? currentBlocks(data, nowMin, viewDay) : [];
  const nowSlot = eventDay && currentDay === viewDay ? currentSlot(data, nowMin, viewDay) : null;
  const nextS = eventDay && currentDay === viewDay ? nextSlot(data, nowMin, viewDay) : null;

  const jump = (id: string) => scrollToEl(document.getElementById(id));
  const groupByTrack = (list: ReturnType<typeof sessionsInSlot>) => data.tracks.map((t) => ({ track: t, items: list.filter((s) => s.track === t.name) })).filter((g) => g.items.length);

  return (
    <>
      <div className="page-head compact no-print">
        <h2>Program.</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn light" onClick={() => go('sessions')}><Search /> Explore sessions</button>
          <button className="btn gold" onClick={() => window.print()}><Print /> Save as PDF</button>
        </div>
      </div>

      {/* ---- HERO ---- */}
      <div className="hero-cover">
        <div className="hero-geo" aria-hidden>
          <div className="geo-line g1" /><div className="geo-line g2" /><div className="geo-line g3" />
          <div className="geo-diamond" /><div className="geo-ring" />
        </div>
        <div className="hero-content">
          <img src="/techspo-logo.png" alt="Techspo '27" className="hero-logo" />
          <h1>Conference<br />Schedule</h1>
          <div className="hero-meta">
            <span><Calendar size={16} /> {info.event_dates}</span>
            <span><MapPin size={16} /> {info.venue_name}</span>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><b>{data.sessions.length}</b><span>Sessions</span></div>
            <div className="hero-stat"><b>{data.tracks.length}</b><span>Tracks</span></div>
            <div className="hero-stat"><b>{days}</b><span>Days</span></div>
          </div>
        </div>
      </div>

      {/* ---- DAY PICKER ---- */}
      <div className="day-switch" role="tablist" aria-label="Conference day">
        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
          <button key={d} role="tab" aria-pressed={viewDay === d} onClick={() => setViewDay(d)} className={viewDay === d ? 'active' : ''}>
            <b>{dayName(data, d)}</b>
            <small>{dayDate(data, d)}</small>
          </button>
        ))}
      </div>

      {/* ---- AT-A-GLANCE ---- */}
      <div className="glance">
        {dayBlocks.map((b) => {
          const isNow = eventDay && currentDay === viewDay && nowMin >= b.startMin && nowMin < b.endMin;
          return (
            <div key={b.id} className={`${b.type} clickable ${isNow ? 'is-now' : ''}`} role="link" tabIndex={0}
              onClick={() => jump(b.type === 'breakout' ? `prog-slot-${b.id.replace('slot', '')}` : `prog-${b.id}`)}>
              <b>{b.start}</b><span>{b.label}</span><small>{b.location}</small>
              <span className="go"><Arrow /></span>
            </div>
          );
        })}
      </div>

      {eventDay && currentDay === viewDay && nowBlocks.length > 0 && (
        <div className="now-strip no-print">
          <span><b>Happening now</b> {nowBlocks.map((b) => b.label).join(' · ')}{nowSlot ? '' : nextS ? ` · Next sessions at ${data.blocks.find((b) => b.id === `slot${nextS}`)?.start}` : ''}</span>
          {nowSlot && <button className="btn sm glass" onClick={() => go('sessions', { day: String(viewDay), slot: String(nowSlot) })}>Sessions running now</button>}
        </div>
      )}

      <div className="notice" style={{ margin: '18px 0 0' }}><Info /><span>{info.pdf_disclaimer}</span></div>

      {/* ---- KEYNOTES ---- */}
      {keynotes.length > 0 && (
        <section className="section" id={`prog-keynotes-${viewDay}`}>
          <div className="section-head"><h2>Keynotes.</h2></div>
          <div className="pgrid">
            {keynotes.map((k) => {
              const tbd = /tbd|announced/i.test(k.name);
              return (
                <div key={k.key} className={`pcard keynote-card ${tbd ? 'tbd' : ''}`} id={`prog-${k.key}`}>
                  <div>
                    <div className="when">{k.time}<span className="where">{k.location}</span></div>
                    <h3>{k.role}</h3>
                    {k.talk && !tbd && <div className="talk-title">"{k.talk}"</div>}
                  </div>
                  <Person k={k} />
                  {k.bio && <p className="copy">{k.bio}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- SPECIAL EVENTS ---- */}
      {data.events.filter((e) => e.day === viewDay).length > 0 && (
        <section className="section" id={`prog-events-${viewDay}`}>
          <div className="section-head"><h2>Events.</h2></div>
          <div className="pgrid">
            {data.events.filter((e) => e.day === viewDay).map((ev) => (
              <div key={ev.id} className="pcard event-card half" id={`prog-${ev.id}`}>
                <div>
                  <div className="when">{ev.time}<span className="where">{ev.location}</span></div>
                  <h3>{ev.name}</h3>
                  <p className="copy">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- SESSIONS ---- */}
      <section className="section page-break" id="prog-sessions">
        <div className="section-head">
          <div><h2>Sessions.</h2><p className="sub" style={{ fontSize: 16, maxWidth: '64ch' }}>{notes.join(' ')}</p></div>
          <button className="btn light no-print" onClick={() => go('sessions', { day: String(viewDay) })}><Search /> Explore & filter</button>
        </div>
        <div className="prog-legend">{data.tracks.map((t) => <span key={t.id}><i style={{ background: t.color }} />{t.name}</span>)}</div>
        {daySlots.map((slot) => {
          const list = sessionsInSlot(data, slot);
          return (
            <div key={slot} className="prog-slot" id={`prog-slot-${slot}`}>
              <div className="prog-slot-head"><h3>Breakout {slot}</h3><span className="meta">{slotTime(data, slot)} · {list.length} sessions</span></div>
              {groupByTrack(list).map((g) => (
                <div key={g.track.id} className="prog-group" style={{ ['--c' as string]: g.track.color }}>
                  <div className="prog-group-head"><i />{g.track.name}</div>
                  <div className="prog-list">
                    {g.items.map((s) => (
                      <div key={s.id} className="prog-item" style={{ ['--c' as string]: trackColor(data, s.track) }} onClick={() => open(s.id)} role="button" tabIndex={0}>
                        <div><div className="t">{s.title}</div><div className="w">{s.presenters} · {s.format}</div></div>
                        <div className="rm">{roomForSlot(s, slot) || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      {/* ---- DESCRIPTIONS ---- */}
      <section className="section page-break" id="prog-descriptions">
        <div className="section-head"><div><h2>Descriptions.</h2><p className="sub">Every session, alphabetical.</p></div></div>
        <div className="prog-desc-list">
          {all.map((s) => (
            <article key={s.id} className="prog-desc" id={`desc-${s.id}`} style={{ ['--c' as string]: trackColor(data, s.track) }}>
              <h4>{s.title}</h4>
              <div className="facts">
                <span><b>{s.presenters}</b>{s.leadOrg && !s.isTBA ? ` · ${s.leadOrg}` : ''}</span>
                <span>{s.slots.map((sl) => `Breakout ${sl}`).join(' & ')}</span>
                {s.room && <span>Room <b>{s.room}</b></span>}
                <span>{s.format}</span>
                <span>{s.level}</span>
                <span style={{ color: trackColor(data, s.track), fontWeight: 600 }}>{s.track}</span>
              </div>
              <p className="d">{s.description || 'Details coming soon.'}</p>
              {s.audience.length > 0 && <p className="small muted" style={{ marginTop: 8 }}>Audience: {s.audience.join(', ')}</p>}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
