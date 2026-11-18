import { motion } from 'motion/react';
import type { Session } from '../data/types';
import { useApp } from '../App';
import { trackColor, roomForSlot, dayOfSlot } from '../data/derive';
import { Star } from './icons';

export default function SessionCard({ session: s, slot }: { session: Session; slot?: number }) {
  const { data, stars, toggleStar, open } = useApp();
  const starred = stars.has(s.id);
  const color = trackColor(data, s.track);
  const room = slot ? roomForSlot(s, slot) : s.room;
  const others = slot ? s.slots.filter((x) => x !== slot) : [];
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.22 }}
      className={`card ${s.isTBA ? 'tba' : ''}`} style={{ ['--c' as string]: color }} role="button" tabIndex={0}
      onClick={() => open(s.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(s.id); } }}
      aria-label={`${s.title}, ${s.presenters}, room ${room}`}>
      <div className="track-label">{s.track}</div>
      <div className="title">{s.title}</div>
      <div className="who">{s.presenters}{s.leadOrg && !s.isTBA ? <span className="muted"> · {s.leadOrg}</span> : null}</div>
      <div className="meta">
        <span className="tag room">{room}</span>
        <span className="tag">{s.format}</span>
        <span className={`level ${s.level === 'Introductory' ? '' : s.level === 'Intermediate' ? 'mid' : 'adv'}`}><i />{s.level}</span>
      </div>
      {others.length > 0 && <div className="runs-again">Also in {others.map((o) => `Day ${dayOfSlot(data, o)} Breakout ${o}`).join(' & ')}</div>}
      <button className="star" aria-pressed={starred} aria-label={starred ? 'Remove star' : 'Star this session'} onClick={(e) => { e.stopPropagation(); toggleStar(s.id); }}>
        <motion.span animate={starred ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.3 }} style={{ display: 'grid' }}><Star filled={starred} /></motion.span>
      </button>
    </motion.div>
  );
}
