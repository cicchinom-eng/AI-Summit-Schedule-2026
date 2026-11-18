import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useApp, go } from '../App';
import { currentBlocks, currentSlot, fmtMinutes, nextSlot, pathwayColor, roomMapForSlot, sessionRooms, slotTime } from '../data/derive';
import { scrollToEl } from '../data/derive';

export default function Rooms() {
  const { data, route, stars, open, nowMin, eventDay, preview, setPreview } = useApp();
  const initial = parseInt(route.params.get('slot') ?? '', 10);
  const [slot, setSlot] = useState<number>(Number.isFinite(initial) ? initial : (eventDay && currentSlot(data, nowMin)) || 1);
  const [mode, setMode] = useState<'slot' | 'now'>(eventDay && !Number.isFinite(initial) ? 'now' : 'slot');
  const highlight = route.params.get('room');

  useEffect(() => { const s = parseInt(route.params.get('slot') ?? '', 10); if (Number.isFinite(s)) { setSlot(s); setMode('slot'); } }, [route]);
  useEffect(() => { if (highlight) setTimeout(() => scrollToEl(document.getElementById(`room-${highlight}`), 200), 200); }, [highlight]);

  const liveSlot = eventDay ? currentSlot(data, nowMin) : null;
  const effSlot = mode === 'now' ? liveSlot : slot;
  const map = useMemo(() => (effSlot ? roomMapForSlot(data, effSlot) : new Map()), [data, effSlot]);
  const rooms = sessionRooms(data);
  const inUse = rooms.filter((r) => map.has(r.room)).length;
  const openRooms = rooms.length - inUse;
  const wings = [...new Set(rooms.map((r) => r.wing))];
  const nowBlocks = eventDay ? currentBlocks(data, nowMin) : [];
  const nxt = eventDay ? nextSlot(data, nowMin) : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Rooms.</h2>
          <p className="sub">What's running where, and which rooms are open. Green is free. Striped rooms are held for overflow.</p>
        </div>
      </div>

      <div className="slot-switch" role="tablist" aria-label="Time slot">
        {eventDay && (
          <button role="tab" aria-pressed={mode === 'now'} onClick={() => setMode('now')}>
            {mode === 'now' && <motion.span layoutId="room-pill" className="pill-bg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            Right now<small>{fmtMinutes(nowMin)}</small>
          </button>
        )}
        {[1, 2, 3, 4].map((n) => (
          <button key={n} role="tab" aria-pressed={mode === 'slot' && slot === n} onClick={() => { setMode('slot'); setSlot(n); }}>
            {mode === 'slot' && slot === n && <motion.span layoutId="room-pill" className="pill-bg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            Session {n}<small>{slotTime(data, n)}</small>
          </button>
        ))}
      </div>

      {mode === 'now' && !effSlot && (
        <div className="panel soft" style={{ marginTop: 14 }}>
          <h3>{nowBlocks.length ? nowBlocks.map((b) => b.label).join(' · ') : 'Nothing scheduled right now'}</h3>
          <p className="muted" style={{ marginTop: 4 }}>{nxt ? `Concurrent sessions start again at ${data.blocks.find((b) => b.id === `slot${nxt}`)?.start}. Classrooms are open until then.` : 'Concurrent sessions are done for the day. Thanks for coming!'}</p>
          {nowBlocks.some((b) => b.type === 'meetups') && <p style={{ marginTop: 8 }}><a href="#/overview#meetups" onClick={(e) => { e.preventDefault(); go('overview'); setTimeout(() => scrollToEl(document.getElementById('meetups')), 100); }}>See Nerd Out & Meetup rooms</a></p>}
        </div>
      )}

      {effSlot && (
        <>
          <div className="room-summary">
            <div className="stat"><b>{inUse}</b><span>rooms in use</span></div>
            <div className="stat open"><b>{openRooms}</b><span>rooms open</span></div>
            <div className="stat"><b>{map.size}</b><span>sessions in Session {effSlot}</span></div>
          </div>
          {wings.map((w) => (
            <div key={w} className="wing">
              <h3>{w}</h3>
              <div className="room-grid">
                {rooms.filter((r) => r.wing === w).map((r) => {
                  const s = map.get(r.room);
                  const spill = /spillover/i.test(r.kind);
                  if (!s) return (
                    <div key={r.room} id={`room-${r.room}`} className={`room-tile open ${spill ? 'spill' : ''}`}>
                      <div className="rn">{r.room}</div>
                      <div className="rs">{spill ? 'Open · overflow room' : 'Open'}</div>
                      {spill && <div className="rp">Used if a nearby session fills up</div>}
                    </div>
                  );
                  const mine = stars.has(s.id);
                  return (
                    <button key={r.room} id={`room-${r.room}`} className={`room-tile ${mine ? 'mine starred' : ''} ${highlight === r.room ? 'starred' : ''}`} style={{ ['--c' as string]: pathwayColor(data, s.pathway) }} onClick={() => open(s.id)}>
                      <div className="rn">{r.room}</div>
                      <div className="rs">{s.short}</div>
                      <div className="rp">{s.presenters}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="legend"><span><i style={{ background: 'var(--ok-soft)' }} />Open</span><span><i style={{ background: 'repeating-linear-gradient(135deg,#fff 0 3px,#eef1f7 3px 6px)' }} />Held for overflow</span><span><i style={{ boxShadow: 'inset 0 0 0 2px var(--star)' }} />Starred by you</span></div>
        </>
      )}

      <div className="panel" style={{ marginTop: 28 }}>
        <h3>Open rooms, all day</h3>
        <p className="muted small" style={{ marginTop: 4 }}>Handy for organizers: which rooms are free in each slot.</p>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table className="room-table">
            <thead><tr>{[1, 2, 3, 4].map((n) => <th key={n}>Session {n} <span className="muted" style={{ fontWeight: 500 }}>{slotTime(data, n)}</span></th>)}</tr></thead>
            <tbody><tr>{[1, 2, 3, 4].map((n) => {
              const m = roomMapForSlot(data, n);
              const free = rooms.filter((r) => !m.has(r.room));
              return <td key={n}><b className="muted">{free.length} open</b><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>{free.map((r) => <span key={r.room} className="tag open">{r.room}</span>)}</div></td>;
            })}</tr></tbody>
          </table>
        </div>
      </div>

      <div className="panel soft no-print" style={{ marginTop: 16 }}>
        <div className="time-ctl">
          <b>Preview a moment in the day</b>
          <input type="time" value={preview ?? ''} onChange={(e) => setPreview(e.target.value || null)} aria-label="Preview time" />
          {preview && <button className="btn ghost sm" onClick={() => { setPreview(null); setMode('slot'); }}>Back to real time</button>}
          <span className="small muted">Shows the "Right now" view and the live marker as if it were that time on {data.info.event_date}.</span>
        </div>
      </div>
    </>
  );
}
