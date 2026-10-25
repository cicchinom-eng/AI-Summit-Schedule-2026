import { useApp, go } from '../App';
import { byTitle, currentBlocks, currentSlot, nextSlot, pathwayColor, roomForSlot, scrollToEl, sessionsInSlot, slotTime } from '../data/derive';
import type { Block, Keynote, Session } from '../data/types';
import { Arrow, Car, Entrance, IdCard, Info, Pin, Print, Search, Truck, Utensils } from '../components/icons';

const PHOTO: Record<string, string> = { 'Kaiz Headshot.jpeg': '/images/kaiz.jpeg', 'James Santana Headshot.jpg': '/images/james-santana.jpg', 'Marc Cicchino Headshot.jpg': '/images/marc-cicchino.jpg' };
const G = {
  arrival: 'linear-gradient(135deg, #e9eaf0 0%, #ffffff 100%)',
  welcome: 'linear-gradient(135deg, #5b4bff 0%, #9b5cff 55%, #ff7ab6 100%)',
  keynote: 'linear-gradient(135deg, #0a6cff 0%, #3fa0ff 55%, #5ee0d8 100%)',
  lunch: 'linear-gradient(135deg, #34c759 0%, #5ee0d8 100%)',
  meetups: 'linear-gradient(135deg, #ff9f0a 0%, #ff6b6b 100%)',
  playground: 'linear-gradient(135deg, #7c5cff 0%, #2cc8ff 100%)',
};
const time = (b?: Block) => (b ? `${b.start} – ${b.end}`.replace(/ (AM|PM)/g, ' $1') : '');

function Person({ k, lg, line }: { k: Keynote; lg?: boolean; line?: string }) {
  const src = PHOTO[k.photo];
  const tbd = /tbd|announced/i.test(k.status + k.name);
  return (
    <div className={`person ${lg ? 'lg' : ''}`}>
      {src ? <img src={src} alt={k.name} /> : <div className="avatar" aria-hidden>{tbd ? '?' : k.name.slice(0, 1)}</div>}
      <div>
        <div className="name">{tbd ? 'To be announced' : k.name}</div>
        <div className="role">{tbd ? 'Speaker coming soon' : [k.title, k.org].filter(Boolean).join(', ')}</div>
        {line && <p className="line">{line}</p>}
      </div>
    </div>
  );
}

export default function Program() {
  const { data, open, nowMin, eventDay } = useApp();
  const info = data.info;
  const all = [...data.sessions].sort(byTitle);
  const notes = [info.session_note_1, info.session_note_2, info.session_note_3, info.session_note_4].filter(Boolean);
  const block = (id: string) => data.blocks.find((b) => b.id === id);
  const kAM = data.keynotes.find((k) => k.key === 'keynote_am');
  const kPM = data.keynotes.find((k) => k.key === 'keynote_pm');
  const welcome = data.keynotes.filter((k) => k.key.startsWith('welcome'));
  const pmTBD = !kPM || /tbd|announced/i.test(kPM.status + kPM.name);
  const nowBlocks = eventDay ? currentBlocks(data, nowMin) : [];
  const nowSlot = eventDay ? currentSlot(data, nowMin) : null;
  const nextS = eventDay ? nextSlot(data, nowMin) : null;

  const glance = data.blocks.reduce<Block[]>((acc, b) => {
    const dup = acc.find((r) => r.startMin === b.startMin && r.endMin === b.endMin);
    if (dup) { dup.label = 'Lunch, Meetups & Playground'; dup.location = 'Cafeteria · Classrooms · Media Center'; return acc; }
    return [...acc, { ...b }];
  }, []);
  const targetOf = (b: Block) => (b.type === 'concurrent' ? `prog-slot-${b.id.replace('slot', '')}` : b.id === 'keynote_pm' ? 'prog-afternoon' : ['lunch', 'meetups', 'playground'].includes(b.type) ? 'prog-midday' : `prog-${b.id}`);
  const jump = (id: string) => scrollToEl(document.getElementById(id));
  const groupByPathway = (list: Session[]) => data.pathways.map((p) => ({ pathway: p, items: list.filter((s) => s.pathway === p.name) })).filter((g) => g.items.length);
  const lunchIcon = (id: string) => (id === 'trucks' ? <Truck /> : id === 'offcampus' ? <Pin /> : <Utensils />);
  const lunchColor = (id: string) => (id === 'trucks' ? '#ff9f0a' : id === 'offcampus' ? '#0a6cff' : '#34c759');

  return (
    <>
      <div className="page-head compact no-print">
        <h2>Program.</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn light" onClick={() => go('sessions')}><Search /> Explore sessions</button>
          <button className="btn dark" onClick={() => window.print()}><Print /> Save as PDF</button>
        </div>
      </div>

      <div className="prog-cover">
        <h1>NJ AI Literacy Summit</h1>
        <p className="date">{info.event_date} · {info.venue_name}</p>
        <p className="date addr">{info.venue_address}</p>
      </div>

      <div className="glance">
        {glance.map((b) => (
          <div key={b.id} className={`${b.type} clickable ${eventDay && nowMin >= b.startMin && nowMin < b.endMin ? 'is-now' : ''}`} role="link" tabIndex={0} onClick={() => jump(targetOf(b))} onKeyDown={(e) => { if (e.key === 'Enter') jump(targetOf(b)); }}>
            <b>{b.start}</b><span>{b.label}</span><small>{b.location}</small>
            <span className="go"><Arrow /></span>
          </div>
        ))}
      </div>

      {eventDay && nowBlocks.length > 0 && (
        <div className="now-strip no-print">
          <span><b>Now</b> {nowBlocks.map((b) => b.label).join(' · ')}{nowSlot ? '' : nextS ? ` · sessions resume at ${block(`slot${nextS}`)?.start}` : ''}</span>
          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {nowSlot && <button className="btn sm" onClick={() => go('sessions', { slot: String(nowSlot) })}>Sessions running now</button>}
          </span>
        </div>
      )}
      <div className="notice" style={{ margin: '18px 0 0' }}><Info /><span>{info.pdf_disclaimer}</span></div>

      {/* ------------------------------------------------------------ Morning */}
      <section className="section page-break" id="prog-morning">
        <div className="section-head"><h2>Morning.</h2></div>
        <div className="pgrid">
          <div className="pcard third" id="prog-checkin" style={{ ['--g' as string]: G.arrival, ['--glow' as string]: '#c9ccd8' }}>
            <div>
              <div className="when">{time(block('checkin'))}<span className="where">{block('checkin')?.location}</span></div>
              <h3>Check-in</h3>
            </div>
            <div className="facts-list">
              <div className="fact-row"><span className="ic"><IdCard /></span><div><b>Photo ID required</b><span>{info.id_note ?? 'Bring valid state- or federal-issued photo ID.'}</span></div></div>
              <div className="fact-row"><span className="ic"><Entrance /></span><div><b>Auditorium entrance</b><span>On the right side of the building at {info.venue_address}.</span></div></div>
              <div className="fact-row"><span className="ic"><Car /></span><div><b>Parking is limited</b><span>Arrive early and carpool if you can.</span></div></div>
            </div>
          </div>

          <div className="pcard two-thirds" id="prog-welcome" style={{ ['--g' as string]: G.welcome, ['--glow' as string]: '#c7b6ff' }}>
            <div>
              <div className="when">{time(block('welcome'))}<span className="where">Auditorium</span></div>
              <h3>Welcome & Kick-Off</h3>
              <p className="copy">A warm welcome on the main stage to open a day of professional learning and profound exploration.</p>
            </div>
            <div className="people">
              {welcome.map((k, i) => <Person key={k.key} k={k} line={i === 0 ? 'Opening remarks that set the stage for the day.' : 'Kicks off the Summit and the journey of rethinking education in the age of AI.'} />)}
            </div>
          </div>

          {kAM && (
            <div className="pcard" id="prog-keynote_am" style={{ ['--g' as string]: G.keynote, ['--glow' as string]: '#9fd8ff' }}>
              <div>
                <div className="when">{time(block('keynote_am'))}<span className="where">Auditorium</span></div>
                <h3>Morning Keynote</h3>
              </div>
              <div className="pgrid" style={{ gap: 20 }}>
                <div className="half"><Person k={kAM} lg /></div>
                <div className="half" style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                  {kAM.talk && <div className="talk-title">“{kAM.talk}”</div>}
                  <p className="copy">{kAM.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ Midday */}
      <section className="section page-break" id="prog-midday">
        <div className="section-head"><div><h2>Midday.</h2><p className="sub">{time(block('lunch'))}. Eat, wander, and find your people.</p></div></div>
        <div className="pgrid">
          <div className="pcard half" style={{ ['--g' as string]: G.lunch, ['--glow' as string]: '#a9f0c4' }}>
            <div><div className="when">{time(block('lunch'))}</div><h3>Lunch</h3></div>
            <div className="opts">
              {data.lunch.filter((l) => l.id !== 'footnote').map((l) => (
                <div key={l.id} className="opt" style={{ ['--ic' as string]: lunchColor(l.id) }}>
                  <span className="ic">{lunchIcon(l.id)}</span>
                  <div><b>{l.name}</b><span>{l.description}{/^https?:/.test(l.link) && <> <a href={l.link} target="_blank" rel="noreferrer" className="no-print">See options on Yelp.</a></>}</span></div>
                </div>
              ))}
            </div>
            {data.lunch.find((l) => l.id === 'footnote') && <p className="copy" style={{ fontSize: 13, color: 'var(--muted)' }}>{data.lunch.find((l) => l.id === 'footnote')!.description}</p>}
          </div>

          <div className="pcard half" style={{ ['--g' as string]: G.playground, ['--glow' as string]: '#b9c6ff' }}>
            <div><div className="when">{time(block('playground'))}<span className="where">{block('playground')?.location}</span></div><h3>AI Playground</h3>
              <p className="copy">{(data.playground.find((p) => p.order === 0)?.description ?? '').split('. ').slice(0, 2).join('. ')}.</p></div>
            <div className="exhibits">
              {data.playground.filter((p) => p.order > 0).map((p) => <div key={p.id} className="exhibit"><b>{p.name}</b><span>{p.description}</span></div>)}
            </div>
          </div>

          <div className="pcard" style={{ ['--g' as string]: G.meetups, ['--glow' as string]: '#ffd6a8' }}>
            <div><div className="when">{time(block('meetups'))}<span className="where">Classrooms</span></div><h3>Nerd Outs & Meetups</h3>
              <p className="copy">Drop in and out any time. <b>Nerd Outs</b> go deep on a topic. <b>Meetups</b> gather people who share a role or subject.</p></div>
            <div className="pgrid" style={{ gap: 18 }}>
              {['Nerd Out', 'Meetup'].map((kind) => (
                <div key={kind} className={kind === 'Nerd Out' ? 'third' : 'two-thirds'}>
                  <div className="chips-head">{kind === 'Nerd Out' ? 'Nerd Outs' : 'Meetups'}</div>
                  <div className="room-chips">{data.meetups.filter((m) => m.kind === kind).map((m) => <div key={m.id} className="room-chip"><span>{m.name}</span><span className="tag room">{m.room}</span></div>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Afternoon keynote */}
      <section className="section" id="prog-afternoon">
        <div className="section-head"><h2>Afternoon.</h2></div>
        <div className="pgrid">
          <div className={`pcard ${pmTBD ? 'dark' : ''}`} style={{ ['--g' as string]: G.keynote, ['--glow' as string]: '#9fd8ff' }}>
            <div>
              <div className="when">{time(block('keynote_pm'))}<span className="where">Auditorium</span></div>
              <h3>Afternoon Keynote</h3>
            </div>
            {kPM && (
              <div className="pgrid" style={{ gap: 20 }}>
                <div className="half"><Person k={kPM} lg /></div>
                <div className="half" style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                  {!pmTBD && kPM.talk && <div className="talk-title">“{kPM.talk}”</div>}
                  <p className="copy">{kPM.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Sessions */}
      <section className="section page-break" id="prog-sessions">
        <div className="section-head">
          <div><h2>Sessions.</h2><p className="sub" style={{ fontSize: 16, maxWidth: '64ch' }}>{notes.join(' ')}</p></div>
          <button className="btn light no-print" onClick={() => go('sessions')}><Search /> Explore & filter sessions</button>
        </div>
        <div className="prog-legend">{data.pathways.map((p) => <span key={p.id}><i style={{ background: p.color }} />{p.name}</span>)}</div>
        {[1, 2, 3, 4].map((slot) => {
          const list = sessionsInSlot(data, slot);
          return (
            <div key={slot} className={`prog-slot ${slot > 1 ? 'page-break' : ''}`} id={`prog-slot-${slot}`}>
              <div className="prog-slot-head"><h3>Session {slot}</h3><span className="meta">{slotTime(data, slot)} · {list.length} sessions · classrooms</span></div>
              {groupByPathway(list).map((g) => (
                <div key={g.pathway.id} className="prog-group" style={{ ['--c' as string]: g.pathway.color }}>
                  <div className="prog-group-head"><i />{g.pathway.name}</div>
                  <div className="prog-list">
                    {g.items.map((s) => (
                      <div key={s.id} className="prog-item" style={{ ['--c' as string]: pathwayColor(data, s.pathway) }} onClick={() => open(s.id)} role="button" tabIndex={0}>
                        <div><div className="t">{s.title}</div><div className="w">{s.presenters} · {s.format}</div></div>
                        <div className="rm">{roomForSlot(s, slot)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      <section className="section page-break" id="prog-descriptions">
        <div className="section-head"><div><h2>Descriptions.</h2><p className="sub">Every session, alphabetical by title.</p></div></div>
        <div className="prog-desc-list">
          {all.map((s) => (
            <article key={s.id} className="prog-desc" id={`desc-${s.id}`} style={{ ['--c' as string]: pathwayColor(data, s.pathway) }}>
              <h4>{s.title}</h4>
              <div className="facts">
                <span><b>{s.presenters}</b>{s.leadOrg && !s.isTBA ? ` · ${s.leadOrg}` : ''}</span>
                <span>{s.slots.map((sl) => `Session ${sl}`).join(' & ')}</span>
                <span>Room <b>{s.room}</b></span>
                <span>{s.format}</span>
                <span>{s.level === 'Open to All' ? 'Open to all' : 'Some AI experience suggested'}</span>
                <span style={{ color: pathwayColor(data, s.pathway), fontWeight: 600 }}>{s.pathway}</span>
              </div>
              <p className="d">{s.description || 'Details coming soon.'}</p>
              {s.audience.length > 0 && <p className="small muted" style={{ marginTop: 8 }}>Audience: {s.audience.join(', ')}{s.device === 'Yes' ? ' · Bring a device' : ''}</p>}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
