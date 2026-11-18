import { useState } from 'react';
import { useApp, go } from '../App';
import { blocksForDay, dayName, numDays, slotsForDay, trackColor, roomForSlot, slotTime } from '../data/derive';
import { Info, Print, Star } from '../components/icons';

export default function MyDay() {
  const { data, stars, toggleStar, clearStars, open, currentDay } = useApp();
  const days = numDays(data);
  const mine = data.sessions.filter((s) => stars.has(s.id));
  const info = data.info;
  const [viewDay, setViewDay] = useState<number>(currentDay ?? 1);

  const daySlots = slotsForDay(data, viewDay);
  const dayBlockList = blocksForDay(data, viewDay);
  const perSlot = daySlots.map((slot) => ({ slot, picks: mine.filter((s) => s.slots.includes(slot)) }));

  return (
    <>
      <div className="page-head no-print">
        <div>
          <h2>My schedule.</h2>
          <p className="sub">Your starred sessions organized by day and time slot.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {mine.length > 0 && <button className="btn dark" onClick={() => window.print()}><Print size={18} /> Save as PDF</button>}
          {mine.length > 0 && <button className="btn ghost sm" onClick={() => { if (confirm('Remove all your stars?')) clearStars(); }}>Clear stars</button>}
        </div>
      </div>

      <div className="print-only prog-cover" style={{ paddingTop: 0 }}>
        <h1 style={{ fontSize: 34 }}>My Techspo '27 Schedule</h1>
        <p className="date">{info.event_dates} · {info.venue_name}</p>
      </div>

      {mine.length === 0 ? (
        <div className="panel soft" style={{ textAlign: 'center', padding: 48 }}>
          <Star size={36} className="" />
          <h3 style={{ marginTop: 10 }}>No stars yet</h3>
          <p className="muted" style={{ marginTop: 6, maxWidth: '44ch', marginInline: 'auto' }}>Star sessions as you browse and they'll collect here. Then save the list as a PDF to have during the conference.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn dark" onClick={() => go('pathfinder')}>Build my schedule</button>
            <button className="btn light" onClick={() => go('sessions')}>Browse sessions</button>
          </div>
        </div>
      ) : (
        <>
          <div className="day-switch no-print" role="tablist" aria-label="Conference day">
            {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
              const count = mine.filter((s) => s.slots.some((sl) => slotsForDay(data, d).includes(sl))).length;
              return (
                <button key={d} role="tab" aria-pressed={viewDay === d} onClick={() => setViewDay(d)} className={viewDay === d ? 'active' : ''}>
                  <b>{dayName(data, d)}</b>
                  <small>{count} session{count !== 1 ? 's' : ''}</small>
                </button>
              );
            })}
          </div>

          <div className="notice" style={{ marginBottom: 18, marginTop: 14 }}>
            <Info />
            <span>{info.pdf_disclaimer ?? 'Schedule is subject to change. Check the live app for updates.'} <span className="no-print">Your stars are saved only in this browser — save the PDF when done.</span></span>
          </div>

          <div className="panel">
            {(() => {
              const rows: React.ReactNode[] = [];
              const seen = new Set<string>();
              for (const b of dayBlockList) {
                if (b.type !== 'breakout') {
                  rows.push(<div key={b.id} className="day-fixed"><b>{b.start} – {b.end}</b><span>{b.label}{b.location ? ` · ${b.location}` : ''}</span></div>);
                  continue;
                }
                const slot = parseInt(b.id.replace('slot', ''), 10);
                const picks = perSlot.find((p) => p.slot === slot)?.picks ?? [];
                rows.push(
                  <div key={b.id} className="day-slot">
                    <div className="when"><b>Breakout {slot}</b><span>{slotTime(data, slot)}</span></div>
                    <div>
                      {picks.length === 0 ? (
                        <p className="empty">Nothing starred here yet. <a href={`#/sessions?day=${viewDay}&slot=${slot}`}>Browse Breakout {slot}</a></p>
                      ) : picks.map((s, i) => {
                        const already = seen.has(s.id); seen.add(s.id);
                        return (
                          <div key={s.id} className="day-pick" style={{ ['--c' as string]: trackColor(data, s.track) }}>
                            <div>
                              <div className="t"><button style={{ textAlign: 'left', font: 'inherit' }} onClick={() => open(s.id)}>{s.title}</button></div>
                              <div className="w">{s.presenters}</div>
                              <div className="r"><span className="tag room">{roomForSlot(s, slot)}</span><span className="tag">{s.format}</span>{i > 0 && <span className="backup">Backup</span>}{already && <span className="backup">Also in an earlier slot</span>}</div>
                            </div>
                            <button className="star no-print" style={{ position: 'static' }} aria-pressed onClick={() => toggleStar(s.id)} aria-label="Remove star"><Star filled /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>,
                );
              }
              return rows;
            })()}
          </div>
          <p className="print-only small muted" style={{ marginTop: 16 }}>Live schedule: {window.location.origin}{window.location.pathname} · {info.website_url}</p>
        </>
      )}
    </>
  );
}
