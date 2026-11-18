import { useEffect } from 'react';
import { motion } from 'motion/react';
import type { Session } from '../data/types';
import { useApp } from '../App';
import { trackColor, roomForSlot, slotTime, dayOfSlot, dayName } from '../data/derive';
import { Star, X } from './icons';

export default function SessionDetail({ session: s, onClose }: { session: Session; onClose: () => void }) {
  const { data, stars, toggleStar } = useApp();
  const starred = stars.has(s.id);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const presenters = [{ name: s.leadName, detail: [s.leadTitle, s.leadOrg].filter(Boolean).join(' @ ') }, ...s.coDetails.map((d) => {
    const m = /^(.*?)(?:\s\((.*?)\))?(?:\s@\s(.*))?$/.exec(d) ?? [];
    return { name: m[1] ?? d, detail: [m[2], m[3]].filter(Boolean).join(' @ ') };
  })];

  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
      <motion.aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="sd-title"
        initial={isMobile ? { y: '100%' } : { x: '100%' }} animate={isMobile ? { y: 0 } : { x: 0 }} exit={isMobile ? { y: '100%' } : { x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
        <button className="close" onClick={onClose} aria-label="Close"><X /></button>
        <div className="track-line">
          <span className="tag track" style={{ ['--c' as string]: trackColor(data, s.track) }}>{s.track}</span>
          {s.track2 && <span className="tag track" style={{ ['--c' as string]: trackColor(data, s.track2), opacity: 0.85 }}>{s.track2}</span>}
        </div>
        <h2 id="sd-title">{s.title}</h2>
        <div className="who">
          {presenters.map((p, i) => (<div key={i}><b>{p.name}</b>{p.detail && <span className="muted"> · {p.detail}</span>}</div>))}
        </div>

        <div className="facts">
          <div className="fact room"><small>Room</small><b>{s.room}</b></div>
          <div className="fact"><small>When</small>
            {s.slots.map((sl) => (<b key={sl} style={{ display: 'block', fontSize: 14 }}>{dayName(data, dayOfSlot(data, sl))} Breakout {sl} · {slotTime(data, sl)}{s.slots.length > 1 && roomForSlot(s, sl) !== s.room ? ` · ${roomForSlot(s, sl)}` : ''}</b>))}
          </div>
          <div className="fact"><small>Format</small><b>{s.format}</b></div>
          <div className="fact"><small>Level</small><b>{s.level}</b></div>
        </div>

        <p className={`desc ${s.isTBA ? 'tba' : ''}`} style={{ marginTop: 14 }}>{s.description || 'Session details coming soon.'}</p>

        {s.audience.length > 0 && <p className="list-line"><b>Audience:</b> {s.audience.join(', ')}</p>}
        {s.tools.length > 0 && <p className="list-line"><b>Tools featured:</b> {s.tools.join(', ')}</p>}
        {s.tags.length > 0 && <p className="list-line"><b>Tags:</b> {s.tags.join(', ')}</p>}
        {s.slots.length > 1 && <p className="list-line muted">This session runs {s.slots.length} times across the conference.</p>}

        <div className="cta">
          <button className="btn star-btn" aria-pressed={starred} onClick={() => toggleStar(s.id)}>
            <Star filled={starred} />{starred ? 'Starred' : 'Star this session'}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
