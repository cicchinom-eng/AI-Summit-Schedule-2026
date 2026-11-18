import { motion } from 'motion/react';
import { useApp, go } from '../App';
import { Star } from './icons';

export default function StarModal({ onClose }: { onClose: () => void }) {
  const { data } = useApp();
  const text = data.info.star_modal_text || "Great choice! Your starred sessions are saved in this browser only. When you've built your schedule, export it as a PDF so you'll have it during the conference.";
  return (
    <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="scrim" style={{ position: 'absolute', zIndex: 0 }} onClick={onClose} />
      <motion.div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="sm-title" initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 32 }}>
        <div className="badge"><Star filled /></div>
        <h2 id="sm-title">Your first star</h2>
        <p>{text}</p>
        <div className="actions">
          <button className="btn dark" onClick={onClose}>Keep exploring</button>
          <button className="btn light" onClick={() => { onClose(); go('my-schedule'); }}>See my schedule</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
