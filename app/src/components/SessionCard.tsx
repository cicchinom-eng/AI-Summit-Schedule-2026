import { motion } from 'motion/react';
import type { Session } from '../data/types';
import { useApp } from '../App';
import { pathwayColor, roomForSlot } from '../data/derive';
import { Laptop, Star } from './icons';

export default function SessionCard({ session: s, slot }: { session: Session; slot?: number }) {
  const { data, stars, toggleStar, open } = useApp();
  const starred = stars.has(s.id);
  const color = pathwayColor(data, s.pathway);
  const room = slot ? roomForSlot(s, slot) : s.room;
  const others = slot ? s.slots.filter((x) => x !== slot) : [];
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.22 }}
      className={`card ${s.isTBA ? 'tba' : ''}`} style={{ ['--c' as string]: color }} role="button" tabIndex={0}
      onClick={() => open(s.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(s.id); } }}
      aria-label={`${s.title}, ${s.presenters}, room ${room}`}>
      <div className="pw-label">{s.pathway}</div>
      <div className="title">{s.title}</div>
      <div className="who">{s.presenters}{s.leadOrg && !s.isTBA ? <span className="muted"> · {s.leadOrg}</span> : null}</div>
      <div className="meta">
        <span className="tag room">{room}</span>
        <span className="tag">{s.format}</span>
        {s.device === 'Yes' && <span className="tag" title="Bring a device"><Laptop size={13} />Bring a device</span>}
        <span className={`level ${s.level === 'Open to All' ? '' : 'some'}`}><i />{s.level === 'Open to All' ? 'Open to all' : 'Some experience'}</span>
      </div>
      {others.length > 0 && <div className="runs-again">Also runs in {others.map((o) => `Session ${o}`).join(' & ')}</div>}
      <button className="star" aria-pressed={starred} aria-label={starred ? 'Remove star' : 'Star this session'} onClick={(e) => { e.stopPropagation(); toggleStar(s.id); }}>
        <motion.span animate={starred ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.3 }} style={{ display: 'grid' }}><Star filled={starred} /></motion.span>
      </button>
    </motion.div>
  );
}
