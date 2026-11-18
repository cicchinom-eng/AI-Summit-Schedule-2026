import { motion } from 'motion/react';
import { useApp, go } from '../App';

const palm = (
  <svg viewBox="0 0 64 64" width="32" height="32" fill="none" aria-hidden>
    <path d="M32 4c-2 0-5 18-5 28s2.2 14 5 14 5-4 5-14S34 4 32 4Z" fill="#4a8f29" />
    <path d="M18 14c-1 1.7 10 14 18 22s12 8 13 6-6-12-14-20S19 12.3 18 14Z" fill="#5ba832" />
    <path d="M46 14c1 1.7-10 14-18 22s-12 8-13 6 6-12 14-20 16-9.7 17-8Z" fill="#5ba832" />
    <path d="M30 44h4v16h-4z" fill="#8B5E3C" />
  </svg>
);

export default function SecretMenu() {
  const { data } = useApp();
  const secrets = data.meetups.filter((m) => m.kind === 'Secret Menu');

  return (
    <>
      <div className="secret-menu">
        <motion.div className="sm-header" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}>
          <div className="sm-palm left">{palm}{palm}{palm}</div>
          <div className="sm-palm right">{palm}{palm}{palm}</div>
          <div className="sm-marquee">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
              <div className="sm-stars">&#9733; &#9733; &#9733;</div>
              <h1>Secret Menu</h1>
              <div className="sm-divider" />
              <p className="sm-sub">Not on the schedule. Not on the program.<br />You found them anyway.</p>
              <div className="sm-badge">12:00 PM &ndash; 1:00 PM &middot; During Lunch</div>
            </motion.div>
          </div>
        </motion.div>

        <div className="sm-items">
          {secrets.map((m, i) => (
            <motion.article key={m.id + i} className="sm-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}>
              <div className="sm-card-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="sm-card-body">
                <h3>{m.name}</h3>
                <span className="tag room">{m.room}</span>
                <p>{m.description}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div className="sm-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}>
          <p>Tell a friend. Or don't.</p>
          <button className="btn dark" onClick={() => go('sessions')}>Back to Explore</button>
        </motion.div>
      </div>
    </>
  );
}
