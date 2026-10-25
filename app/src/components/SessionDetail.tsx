import { useEffect } from 'react';
import { motion } from 'motion/react';
import type { Session } from '../data/types';
import { useApp } from '../App';
import { pathwayColor, roomForSlot, slotTime } from '../data/derive';
import { Laptop, Star, X } from './icons';

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
        <div className="pw-line">
          <span className="tag pw" style={{ ['--c' as string]: pathwayColor(data, s.pathway) }}>{s.pathway}</span>
          {s.pathway2 && <span className="tag pw" style={{ ['--c' as string]: pathwayColor(data, s.pathway2), opacity: 0.85 }}>{s.pathway2}</span>}
        </div>
        <h2 id="sd-title">{s.title}</h2>
        <div className="who">
          {presenters.map((p, i) => (<div key={i}><b>{p.name}</b>{p.detail && <span className="muted"> · {p.detail}</span>}</div>))}
        </div>

        <div className="facts">
          <div className="fact room"><small>Room</small><b>{s.room}</b></div>
          <div className="fact"><small>When</small>
            {s.slots.map((sl) => (<b key={sl} style={{ display: 'block', fontSize: 14 }}>Session {sl} · {slotTime(data, sl)}{s.slots.length > 1 && roomForSlot(s, sl) !== s.room ? ` · ${roomForSlot(s, sl)}` : ''}</b>))}
          </div>
          <div className="fact"><small>Format</small><b>{s.format}</b></div>
          <div className="fact"><small>Who it's for</small><b style={{ fontSize: 14 }}>{s.level === 'Open to All' ? 'Open to all, beginners welcome' : 'Some AI experience suggested'}</b></div>
        </div>

        {s.device && (<p className="list-line" style={{ marginTop: 0 }}><Laptop size={15} className="" /> <b>{s.device === 'Yes' ? 'Bring a laptop or device.' : 'A device is helpful but optional.'}</b> {s.needs && <span>{s.needs}</span>}</p>)}

        <p className={`desc ${s.isTBA ? 'tba' : ''}`} style={{ marginTop: 14 }}>{s.description || 'Session details coming soon.'}</p>

        {s.audience.length > 0 && <p className="list-line"><b>Audience:</b> {s.audience.join(', ')}</p>}
        {s.grade && s.grade !== 'All grades' && <p className="list-line"><b>Grade band:</b> {s.grade}</p>}
        {s.tools.length > 0 && <p className="list-line"><b>Tools featured:</b> {s.tools.join(', ')}</p>}
        {s.strands.length > 0 && <p className="list-line"><b>Strands:</b> {s.strands.join(', ')}</p>}
        {s.runs > 1 && <p className="list-line muted">This session runs {s.runs} times, so you have more than one chance to catch it.</p>}

        <div className="cta">
          <button className="btn star-btn" aria-pressed={starred} onClick={() => toggleStar(s.id)}>
            <Star filled={starred} />{starred ? 'Starred for my day' : 'Star this session'}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
