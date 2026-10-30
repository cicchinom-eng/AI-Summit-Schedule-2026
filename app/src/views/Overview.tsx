import { motion } from 'motion/react';
import { useApp, go } from '../App';
import { currentBlocks, currentSlot, fmtMinutes, nextSlot, pathwayColor, scrollToEl } from '../data/derive';
import type { Block } from '../data/types';
import { Chevron } from '../components/icons';

const PHOTO: Record<string, string> = { 'Kaiz Headshot.jpeg': '/images/kaiz.jpeg', 'James Santana Headshot.jpg': '/images/james-santana.jpg', 'Marc Cicchino Headshot.jpg': '/images/marc-cicchino.jpg', 'Winston Headshot.png': '/images/winston-roberts.png', 'WinstonHeadshotUpdated.png': '/images/winston-roberts.png' };

const shortLabel = (b: Block) =>
  b.type === 'concurrent' ? b.label.replace('Concurrent Sessions #', 'Sessions ') : b.type === 'keynote' ? 'Keynote' : b.type === 'arrival' ? 'Check-in' : b.type === 'plenary' ? 'Welcome' : b.type === 'lunch' ? 'Lunch & Meetups' : b.label;

const timeRange = (b: Block) => `${b.start} – ${b.end}`.replace(/ (AM|PM)/g, ' $1');

export default function Overview() {
  const { data, nowMin, eventDay, stars } = useApp();
  const info = data.info;
  const dayStart = Math.min(...data.blocks.map((b) => b.startMin));
  const dayEnd = Math.max(...data.blocks.map((b) => b.endMin));
  const span = dayEnd - dayStart;
  const nowBlocks = eventDay ? currentBlocks(data, nowMin) : [];
  const curSlot = eventDay ? currentSlot(data, nowMin) : null;
  const nxt = eventDay ? nextSlot(data, nowMin) : null;
  const isNow = (b: Block) => eventDay && nowMin >= b.startMin && nowMin < b.endMin;

  const ribbon: Block[] = [];
  for (const b of data.blocks) {
    const dup = ribbon.find((r) => r.startMin === b.startMin && r.endMin === b.endMin);
    if (dup) { dup.label = 'Lunch, Meetups & Playground'; dup.type = 'lunch'; continue; }
    ribbon.push({ ...b });
  }

  const [weekday, ...rest] = (info.event_date ?? '').split(', ');
  const block = (id: string) => data.blocks.find((b) => b.id === id);
  const keynoteFor = (id: string) => data.keynotes.find((k) => k.key === id);
  const welcome = data.keynotes.filter((k) => k.key.startsWith('welcome'));
  const kAM = keynoteFor('keynote_am');
  const kPM = keynoteFor('keynote_pm');
  const pmTBD = !kPM || /tbd|announced/i.test(kPM.name);
  const slotTile = (n: number, cls: string) => {
    const b = block(`slot${n}`); if (!b) return null;
    const list = data.sessions.filter((s) => s.slots.includes(n));
    const pws = [...new Set(list.map((s) => s.pathway))].map((p) => pathwayColor(data, p));
    return (
      <button key={b.id} className={`tile g-sessions clickable ${cls}`} onClick={() => go('sessions', { slot: String(n) })}>
        {isNow(b) && <span className="now-pill">Now</span>}
        <div>
          <div className="time">{timeRange(b)}<span className="where">Classrooms</span></div>
          <h3>Sessions {n}</h3>
        </div>
        <div className="foot" style={{ justifyContent: 'space-between' }}>
          <div className="big">{list.length}<small>concurrent sessions</small></div>
          <div className="dots">{pws.map((c) => <i key={c} style={{ ['--c' as string]: c }} />)}</div>
        </div>
      </button>
    );
  };

  return (
    <>
      <section className="hero">
        <div className="orb a" /><div className="orb b" /><div className="orb c" />
        <div className="hero-top">
          <h1>NJ AI Literacy Summit</h1>
          <div className="hero-meta">
            <b>{rest.join(', ') || info.event_date}</b>
            <div>{weekday}{weekday ? ', ' : ''}doors at {data.blocks[0]?.start}</div>
            <div>{info.venue_name}</div>
            <div><a href={info.venue_map_url} target="_blank" rel="noreferrer">{info.venue_address}</a></div>
          </div>
        </div>

        <div className="ribbon" aria-label="Schedule at a glance">
          <div className="ribbon-track">
            {ribbon.map((b, i) => {
              const w = ((b.endMin - b.startMin) / span) * 100;
              return (
                <motion.button key={b.id} className={`ribbon-block ${b.type} ${w < 5 ? 'tiny' : ''} ${isNow(b) ? 'is-now' : ''}`}
                  style={{ flexBasis: `${w}%` }} title={`${b.label} · ${b.start}–${b.end}`}
                  initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  onClick={() => (b.type === 'concurrent' ? go('sessions', { slot: b.id.replace('slot', '') }) : scrollToEl(document.getElementById(`block-${b.id}`), 120))}>
                  <b>{shortLabel(b).replace('Sessions ', 'Session ')}</b>
                  <span>{b.start}</span>
                </motion.button>
              );
            })}
            {eventDay && nowMin >= dayStart && nowMin <= dayEnd && (
              <motion.div className="now-needle" style={{ left: `${((nowMin - dayStart) / span) * 100}%` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
            )}
          </div>
          <div className="ribbon-ticks"><span>{fmtMinutes(dayStart)}</span><span>{fmtMinutes(Math.round((dayStart + dayEnd) / 2 / 15) * 15)}</span><span>{fmtMinutes(dayEnd)}</span></div>
        </div>

        <div className="hero-now">
          {eventDay && nowBlocks.length > 0 ? (
            <>
              <span>Now: <b>{nowBlocks.map((b) => b.label).join(' · ')}</b>{curSlot ? '' : nxt ? ` · sessions resume at ${block(`slot${nxt}`)?.start}` : ''}</span>
              {curSlot && <button className="btn white sm" onClick={() => go('sessions', { slot: String(curSlot) })}>Sessions running now</button>}
            </>
          ) : (
            <>
              <button className="btn white" onClick={() => go('pathfinder')}>Find my path</button>
              <button className="btn glass" onClick={() => go('sessions')}>Explore sessions</button>
              {stars.size > 0 && <button className="btn glass" onClick={() => go('my-day')}>My day · {stars.size}</button>}
            </>
          )}
        </div>
      </section>

      <section className="section" id="day">
        <div className="section-head"><div><h2>Schedule.</h2></div></div>
        <div className="mosaic">
          {block('checkin') && (
            <div id="block-checkin" className="tile g-arrival third">
              {isNow(block('checkin')!) && <span className="now-pill">Now</span>}
              <div>
                <div className="time">{timeRange(block('checkin')!)}</div>
                <h3>Check-in</h3>
                <p className="lead">{info.id_note ?? 'Bring a valid photo ID.'} Enter through the auditorium entrance on the right side of the building.</p>
              </div>
              <div className="foot"><a className="link" href={info.venue_map_url} target="_blank" rel="noreferrer">Directions <Chevron /></a></div>
            </div>
          )}
          {block('welcome') && (
            <div id="block-welcome" className="tile g-welcome vivid two-thirds">
              {isNow(block('welcome')!) && <span className="now-pill">Now</span>}
              <div>
                <div className="time">{timeRange(block('welcome')!)}<span className="where">Auditorium</span></div>
                <h3>Welcome & Kick-Off</h3>
              </div>
              <div className="foot" style={{ gap: 22 }}>
                {welcome.map((k) => (
                  <div key={k.key} className="face-row">
                    {PHOTO[k.photo] && <img className="face" src={PHOTO[k.photo]} alt={k.name} />}
                    <div><div className="name">{k.name}</div><div className="role">{k.title}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {block('keynote_am') && kAM && (
            <div id="block-keynote_am" className="tile g-keynote vivid">
              {isNow(block('keynote_am')!) && <span className="now-pill">Now</span>}
              <div>
                <div className="time">{timeRange(block('keynote_am')!)}<span className="where">Auditorium</span></div>
                <h3>Morning Keynote</h3>
                {kAM.talk && <p className="lead" style={{ fontWeight: 600 }}>{kAM.talk}</p>}
              </div>
              <div className="face-row">
                {PHOTO[kAM.photo] && <img className="face" src={PHOTO[kAM.photo]} alt={kAM.name} />}
                <div><div className="name">{kAM.name}</div><div className="role">{[kAM.title, kAM.org].filter(Boolean).join(', ')}</div></div>
              </div>
            </div>
          )}
          {slotTile(1, 'half')}
          {slotTile(2, 'half')}
          {block('lunch') && (
            <div id="block-lunch" className="tile g-lunch">
              {isNow(block('lunch')!) && <span className="now-pill">Now</span>}
              <div>
                <div className="time">{timeRange(block('lunch')!)}</div>
                <h3>Lunch</h3>
              </div>
              <div className="mini">
                <div><b>Lunch</b><span>Cafeteria, food trucks ({(info.lunch_food_trucks ?? 'burgers and empanadas').toLowerCase()}), or off campus.</span></div>
                <div><b>Nerd Outs & Meetups</b><span>Drop-in rooms by topic and by role. Come and go as you like.</span></div>
                <div><b>AI Playground</b><span>Hands-on demos and student showcases in the {block('playground')?.location ?? 'Media Center'}.</span></div>
              </div>
            </div>
          )}
          {block('keynote_pm') && (
            <div id="block-keynote_pm" className={`tile vivid ${pmTBD ? 'g-keynote-tbd' : 'g-keynote'}`}>
              {isNow(block('keynote_pm')!) && <span className="now-pill">Now</span>}
              <div>
                <div className="time">{timeRange(block('keynote_pm')!)}<span className="where">Auditorium</span></div>
                <h3>Afternoon Keynote</h3>
                {pmTBD ? <p className="lead">Speaker to be announced.</p> : kPM?.talk && <p className="lead" style={{ fontWeight: 600 }}>{kPM.talk}</p>}
              </div>
              {!pmTBD && kPM && (
                <div className="face-row">
                  {PHOTO[kPM.photo] && <img className="face" src={PHOTO[kPM.photo]} alt={kPM.name} />}
                  <div><div className="name">{kPM.name}</div><div className="role">{[kPM.title, kPM.org].filter(Boolean).join(', ')}</div></div>
                </div>
              )}
            </div>
          )}
          {slotTile(3, 'half')}
          {slotTile(4, 'half')}
        </div>
      </section>

      <section className="section" id="keynotes">
        <div className="section-head"><div><h2>Keynotes.</h2></div></div>
        <div className="grid pair">
          {data.keynotes.filter((k) => k.key.startsWith('keynote')).map((k) => {
            const tbd = /tbd|announced/i.test(k.name);
            return (
              <article key={k.key} className={`speaker ${tbd ? 'tbd' : ''}`}>
                {PHOTO[k.photo] ? <img src={PHOTO[k.photo]} alt={k.name} /> : <div className="avatar" aria-hidden>{tbd ? '?' : k.name.slice(0, 1)}</div>}
                <div>
                  <div className="when">{k.role} · {k.time}</div>
                  <h3>{tbd ? 'To be announced' : k.name}</h3>
                  <div className="who">{tbd ? 'Check back soon.' : [k.title, k.org].filter(Boolean).join(', ')}</div>
                  {!tbd && k.talk && <div className="talk">“{k.talk}”</div>}
                  <p className="bio">{k.bio}</p>
                </div>
              </article>
            );
          })}
          {welcome.map((k) => (
            <article key={k.key} className="speaker welcome">
              {PHOTO[k.photo] ? <img src={PHOTO[k.photo]} alt={k.name} /> : <div className="avatar" aria-hidden>{k.name.slice(0, 1)}</div>}
              <div>
                <div className="when">{k.role} · {k.time}</div>
                <h3>{k.name}</h3>
                <div className="who">{[k.title, k.org].filter(Boolean).join(', ')}</div>
                <p className="bio">{k.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="lunch">
        <div className="section-head"><div><h2>Lunch.</h2><p className="sub">{block('lunch')?.start} – {block('lunch')?.end}. Three ways to do it.</p></div></div>
        <div className="grid">
          {data.lunch.filter((l) => l.id !== 'footnote').map((l) => (
            <article key={l.id} className="lunch-card">
              <h3>{l.name}</h3>
              <p>{l.description}</p>
              {/^https?:/.test(l.link) && <p style={{ marginTop: 10 }}><a className="link" href={l.link} target="_blank" rel="noreferrer">Nearby options on Yelp <Chevron /></a></p>}
            </article>
          ))}
        </div>
        {data.lunch.find((l) => l.id === 'footnote') && <p className="small muted" style={{ marginTop: 12 }}>{data.lunch.find((l) => l.id === 'footnote')!.description}</p>}
      </section>

      <section className="section" id="meetups">
        <div className="section-head"><div><h2>Nerd Outs & Meetups.</h2><p className="sub">Drop in any time during lunch. Nerd Outs go deep on a topic. Meetups gather people who share a role or subject.</p></div></div>
        <div className="grid pair">
          {['Nerd Out', 'Meetup'].map((kind) => (
            <div key={kind}>
              <h3 style={{ marginBottom: 10 }}>{kind === 'Nerd Out' ? 'Nerd Outs' : 'Meetups'}</h3>
              <div className="meet-list">
                {data.meetups.filter((m) => m.kind === kind).map((m) => (
                  <div key={m.id} className="meet-row">
                    <div><b>{m.name}</b>{m.description && <div className="small">{m.description}</div>}</div>
                    <span className="tag room">{m.room}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="playground">
        <div className="section-head"><div><h2>AI Playground.</h2><p className="sub">{block('playground')?.location}, all through lunch. {data.playground.find((p) => p.order === 0)?.description.split('. ').slice(0, 1).join('')}.</p></div></div>
        <div className="grid">
          {data.playground.filter((p) => p.order > 0).map((p) => (
            <article key={p.id} className="lunch-card"><h3>{p.name}</h3><p>{p.description}</p></article>
          ))}
        </div>
      </section>

      <section className="section" id="pathways">
        <div className="section-head"><div><h2>Pathways.</h2><p className="sub">Seven ways through the day. Every session belongs to one, and often a second.</p></div></div>
        <div className="grid paths">
          {data.pathways.map((p) => {
            const n = data.sessions.filter((s) => s.pathway === p.name).length;
            return (
              <button key={p.id} className="pw-tile" style={{ ['--c' as string]: p.color }} onClick={() => go('sessions', { pathway: p.name })}>
                <div><h3>{p.name}</h3><p className="tag-line">{p.tagline}</p></div>
                <span className="n">{n} sessions</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="tile g-arrival" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 0 }}>
          <div><h3 style={{ fontSize: 22 }}>The full program</h3><p className="lead">Every session and description, laid out for paper.</p></div>
          <button className="btn dark" onClick={() => go('program')}>Open the program</button>
        </div>
      </section>
    </>
  );
}
