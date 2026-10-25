import { useApp, go } from '../App';
import { pathwayColor, roomForSlot, slotTime } from '../data/derive';
import { Info, Print, Star } from '../components/icons';

export default function MyDay() {
  const { data, stars, toggleStar, clearStars, open } = useApp();
  const mine = data.sessions.filter((s) => stars.has(s.id));
  const info = data.info;
  const perSlot = [1, 2, 3, 4].map((slot) => ({ slot, picks: mine.filter((s) => s.slots.includes(slot)) }));
  // A session that runs twice and is starred shows in both slots; flag the second as "also".
  const fixed = data.blocks.filter((b) => b.type !== 'concurrent');

  return (
    <>
      <div className="page-head no-print">
        <div>
          <h2>My day.</h2>
          <p className="sub">Your starred sessions, slot by slot. Extra stars in a slot are your backups if a room fills.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {mine.length > 0 && <button className="btn dark" onClick={() => window.print()}><Print size={18} /> Save as PDF</button>}
          {mine.length > 0 && <button className="btn ghost sm" onClick={() => { if (confirm('Remove all your stars?')) clearStars(); }}>Clear stars</button>}
        </div>
      </div>

      <div className="print-only prog-cover" style={{ paddingTop: 0 }}>
                <h1 style={{ fontSize: 34 }}>My day at the Summit</h1>
        <p className="date">{info.event_date} · {info.venue_name}, {info.venue_address}</p>
      </div>

      {mine.length === 0 ? (
        <div className="panel soft" style={{ textAlign: 'center', padding: 48 }}>
          <Star size={36} className="" />
          <h3 style={{ marginTop: 10 }}>No stars yet</h3>
          <p className="muted" style={{ marginTop: 6, maxWidth: '44ch', marginInline: 'auto' }}>Star sessions as you browse and they'll collect here. Then save the list as a PDF so it's with you on the day.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn dark" onClick={() => go('pathfinder')}>Build a path for me</button>
            <button className="btn light" onClick={() => go('sessions')}>Browse sessions</button>
          </div>
        </div>
      ) : (
        <>
          <div className="notice" style={{ marginBottom: 18 }}>
            <Info />
            <span>{info.pdf_disclaimer ?? 'Rooms and times can change. Double-check the live schedule app on the day of the Summit.'} <span className="no-print">Your stars are saved only in this browser, so save the PDF when you're done.</span></span>
          </div>
          <div className="panel">
            {(() => {
              const rows: React.ReactNode[] = [];
              const seen = new Set<string>();
              for (const b of data.blocks) {
                if (b.type !== 'concurrent') {
                  rows.push(<div key={b.id} className="day-fixed"><b>{b.start} – {b.end}</b><span>{b.label}{b.location ? ` · ${b.location}` : ''}</span></div>);
                  continue;
                }
                const slot = parseInt(b.id.replace('slot', ''), 10);
                const picks = perSlot.find((p) => p.slot === slot)?.picks ?? [];
                rows.push(
                  <div key={b.id} className="day-slot">
                    <div className="when"><b>Session {slot}</b><span>{slotTime(data, slot)}</span></div>
                    <div>
                      {picks.length === 0 ? (
                        <p className="empty">Nothing starred here yet. <a href={`#/sessions?slot=${slot}`}>Browse Session {slot}</a></p>
                      ) : picks.map((s, i) => {
                        const already = seen.has(s.id); seen.add(s.id);
                        return (
                          <div key={s.id} className="day-pick" style={{ ['--c' as string]: pathwayColor(data, s.pathway) }}>
                            <div>
                              <div className="t"><button style={{ textAlign: 'left', font: 'inherit' }} onClick={() => open(s.id)}>{s.title}</button></div>
                              <div className="w">{s.presenters}</div>
                              <div className="r"><span className="tag room">{roomForSlot(s, slot)}</span><span className="tag">{s.format}</span>{i > 0 && <span className="backup">Backup</span>}{already && <span className="backup">Also starred in an earlier slot</span>}</div>
                            </div>
                            <button className="star no-print" style={{ position: 'static' }} aria-pressed onClick={() => toggleStar(s.id)} aria-label="Remove star"><Star filled /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>,
                );
              }
              void fixed;
              return rows;
            })()}
          </div>
          <p className="print-only small muted" style={{ marginTop: 16 }}>Live schedule: {window.location.origin}{window.location.pathname} · {info.website_url}</p>
        </>
      )}
    </>
  );
}
