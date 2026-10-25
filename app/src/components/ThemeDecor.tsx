import { useEffect, useMemo, useRef, useState } from 'react';
import type { ThemeId } from '../state/theme';

function NintendoDecor() {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState<number[]>([]);
  const [bump, setBump] = useState(false);
  const hud = ['1UP', `SCORE ${String(score).padStart(6, '0')}`, `COINS ×${String(score / 100).padStart(2, '0')}`, 'WORLD 12-7', 'TIME ∞', 'AI LITERACY QUEST', 'HIT THE ? BLOCK'];
  const hit = () => {
    setScore((x) => x + 100);
    setBump(true); setTimeout(() => setBump(false), 220);
    const id = Date.now();
    setCoins((c) => [...c, id]);
    setTimeout(() => setCoins((c) => c.filter((x) => x !== id)), 900);
  };
  return (
    <>
      <div className="hud"><div className="hud-track">{[...hud, ...hud].map((t, i) => <span key={i}>{t}</span>)}</div></div>
      <button className={`qblock ${bump ? 'bump' : ''}`} onClick={hit} style={{ pointerEvents: 'auto' }} aria-label="Hit the question block">?
        {coins.map((id) => <span key={id} className="coin-pop">+100</span>)}
      </button>
      <div className="pac-track">
        <div className="eaten" />
        <div className="pac" />
        <div className="ghost blinky" /><div className="ghost pinky" /><div className="ghost inky" /><div className="ghost clyde" />
      </div>
    </>
  );
}

const NINETIES_TICKER = [
  '☆ Welcome to the NJ AI Literacy Summit ☆', 'You’ve got mail!', 'Best viewed in Netscape Navigator 3.0 at 800×600',
  'Visitor #000,473', '🚧 This page is under construction 🚧', 'Sign my guestbook!', 'Talk to the hand ✋', 'As if!', 'Dial-up connected at 56k 📟',
  'Wassuuup 📺', 'Don’t have a cow, man', 'Be kind, rewind 📼', 'Save to floppy 💾', 'Eat my shorts', 'Totally buggin’', 'Word to your mother',
];
const DISNEY_LINES = ['The Most Magical Summit on Earth', 'Where dreams (and lesson plans) come true', 'A whole new world of AI literacy', 'Hakuna matata, your rooms won’t change (probably)'];

function HitCounter() {
  const [n, setN] = useState(473);
  useEffect(() => { const t = setInterval(() => setN((x) => x + 1), 7000); return () => clearInterval(t); }, []);
  const digits = String(n).padStart(6, '0').split('');
  return <span className="hit-counter" title="Totally real visitor count">{digits.map((d, i) => <b key={i}>{d}</b>)}</span>;
}

function SparkleTrail() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current; if (!host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return;
    let last = 0;
    const onMove = (e: MouseEvent) => {
      const now = performance.now(); if (now - last < 45) return; last = now;
      const s = document.createElement('i');
      s.className = 'sparkle';
      s.style.left = `${e.clientX}px`; s.style.top = `${e.clientY}px`;
      s.style.setProperty('--h', `${Math.floor(Math.random() * 360)}`);
      s.textContent = ['✦', '★', '✧', '●'][Math.floor(Math.random() * 4)];
      host.appendChild(s);
      setTimeout(() => s.remove(), 900);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return <div ref={ref} className="sparkle-host" aria-hidden />;
}

export default function ThemeDecor({ theme, onExit }: { theme: ThemeId; onExit: () => void }) {
  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 100, s: 1 + ((i * 7) % 3), d: (i % 7) * 0.6 })), []);
  const disneyLine = useMemo(() => DISNEY_LINES[Math.floor(Math.random() * DISNEY_LINES.length)], []);
  return (
    <>
      {theme === 'disney' && (
        <div className="theme-bg theme-disney no-print" aria-hidden>
          <div className="sky">{stars.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />)}</div>
          <div className="castle" />
        </div>
      )}
    <div className={`theme-decor theme-${theme} no-print`} aria-hidden>
      {theme === 'nintendo' && <NintendoDecor />}
      {theme === '90s' && (
        <>
          <div className="ticker"><div className="ticker-track">{[...NINETIES_TICKER, ...NINETIES_TICKER].map((t, i) => <span key={i}>{t}</span>)}</div></div>
          <div className="memphis m1" /><div className="memphis m2" /><div className="memphis m3" /><div className="memphis m4" />
          <div className="uc-badge">🚧 UNDER CONSTRUCTION 🚧</div>
          <div className="counter-wrap">You are visitor <HitCounter /></div>
          <div className="floppy">💾</div><div className="tape">📼</div><div className="pager">📟</div><div className="cd">💿</div>
          <SparkleTrail />
        </>
      )}
      {theme === 'disney' && (
        <>
          <div className="wish">✨ {disneyLine} ✨</div>
          <div className="hidden-mickey"><i /><i /><i /></div>
          <div className="sparkle-rise r1">✦</div><div className="sparkle-rise r2">✧</div><div className="sparkle-rise r3">✦</div><div className="sparkle-rise r4">★</div>
        </>
      )}
      <button className="theme-exit" onClick={onExit} style={{ pointerEvents: 'auto' }}>
        {theme === 'nintendo' ? '⏏ Exit game' : theme === '90s' ? '✖ Back to the future' : '☾ Break the spell'}
      </button>
    </div>
    </>
  );
}
