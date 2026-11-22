import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { goBack } from '../App';

/**
 * Large Language Monsters — a standalone HTML game loaded via iframe.
 * Triggered by typing "pokemon" in the Explore search.
 */
export default function Pokemon() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goBack();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const ui = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#0b1612' }}>
      <iframe
        src="/llm-game/index.html"
        title="Large Language Monsters"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        allow="autoplay"
      />
      <button
        onClick={() => goBack()}
        style={{
          position: 'fixed',
          top: 'max(8px, env(safe-area-inset-top, 8px))',
          right: 8,
          zIndex: 210,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 20,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          padding: '5px 14px',
          cursor: 'pointer',
        }}
      >
        Exit
      </button>
    </div>
  );

  return createPortal(ui, document.body);
}
