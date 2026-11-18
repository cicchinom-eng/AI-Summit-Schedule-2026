import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { go } from '../App';
import '../duckhunt.css';

/* ═══════════════════ Assets ═══════════════════ */
const COVER      = '/images/duckhunt-cover.jpg';
const ICON_GPT   = '/images/duckhunt-icon-gpt.png';
const ICON_CLAUDE = '/images/duckhunt-icon-claude.png';
const J_LAUGH    = '/images/duckhunt-laugh.png';
const J_GPT      = '/images/duckhunt-gpt.png';
const J_CLAUDE   = '/images/duckhunt-claude.png';
const J_BOTH     = '/images/duckhunt-both.png';
const SND = {
  intro:   '/audio/dh-intro.mp3',    // 9.1s
  loading: '/audio/dh-loading.mp3',  // 6.3s
  round:   '/audio/dh-round.mp3',    // 6.0s
  laugh:   '/audio/dh-laugh.mp3',    // 3.0s
  shows:   '/audio/dh-shows.mp3',    // 3.0s
  perfect: '/audio/dh-perfect.mp3',  // 3.0s
  clear:   '/audio/dh-clear.mp3',    // 4.6s
  failed:  '/audio/dh-failed.mp3',   // 3.0s
  over:    '/audio/dh-gameover.mp3',  // 4.7s
};

const ROUNDS = 5;
const SHOTS = 3;
const TGT = 64;
const SKY_PLAY = 0.72;
const spd = (r: number) => 1.8 + r * 0.4;

type Phase = 'title' | 'round' | 'result' | 'over';
interface Tgt { type: 'chatgpt'|'claude'; x: number; y: number; vx: number; vy: number; alive: boolean }
interface Bang { x: number; y: number; id: number }

const MSGS: [number, string][] = [
  [900,  'PERFECT! No AI gets past you!'],
  [600,  'Expert-level AI hunter!'],
  [300,  'Some AI slipped through the cracks.'],
  [0,    'The AI was too fast for you!'],
];

/* ═══════════════════ Audio ═══════════════════ */
const _au: HTMLAudioElement[] = [];
function stopAll() { _au.forEach(a => { a.pause(); a.currentTime = 0; }); _au.length = 0; }
function play(src: string) {
  const a = new Audio(src);
  a.volume = 0.55;
  a.addEventListener('ended', () => { const i = _au.indexOf(a); if (i >= 0) _au.splice(i, 1); });
  a.play().catch(() => {});
  _au.push(a);
  return a;
}

/* ═══════════════════ Component ═══════════════════ */
export default function DuckHunt() {
  const [phase, setPhase] = useState<Phase>('title');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(SHOTS);
  const [jamesImg, setJamesImg] = useState('');
  const [bangs, setBangs] = useState<Bang[]>([]);
  const [flash, setFlash] = useState(false);
  const [catchText, setCatchText] = useState(false);

  const skyRef = useRef<HTMLDivElement>(null);
  const t0 = useRef<HTMLDivElement>(null);
  const t1 = useRef<HTMLDivElement>(null);
  const tD = useRef<Tgt[]>([]);
  const frame = useRef(0);
  const hitsR = useRef<string[]>([]);
  const shotsR = useRef(SHOTS);
  const scoreR = useRef(0);
  const roundR = useRef(1);
  const phR = useRef<Phase>('title');
  const ending = useRef(false);

  useEffect(() => { phR.current = phase; }, [phase]);

  /* ── Font ── */
  useEffect(() => {
    if (!document.getElementById('dh-font')) {
      const l = document.createElement('link');
      l.id = 'dh-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  /* ── Scroll lock ── */
  useEffect(() => {
    const p = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = p; stopAll(); };
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  /* ── Animation loop ── */
  const loop = useCallback(() => {
    const sky = skyRef.current;
    if (!sky) return;
    const w = sky.clientWidth;
    const h = sky.clientHeight * SKY_PLAY;
    tD.current.forEach((t, i) => {
      if (!t.alive) return;
      t.x += t.vx; t.y += t.vy;
      if (t.x < 0) { t.x = 0; t.vx = Math.abs(t.vx); }
      if (t.x > w - TGT) { t.x = w - TGT; t.vx = -Math.abs(t.vx); }
      if (t.y < 0) { t.y = 0; t.vy = Math.abs(t.vy); }
      if (t.y > h - TGT) { t.y = h - TGT; t.vy = -Math.abs(t.vy); }
      if (Math.random() < 0.018) {
        const a = Math.random() * Math.PI * 2;
        const s = spd(roundR.current);
        t.vx = Math.cos(a) * s * (0.7 + Math.random() * 0.6);
        t.vy = Math.sin(a) * s * (0.7 + Math.random() * 0.6);
      }
      const el = i === 0 ? t0.current : t1.current;
      if (el) el.style.transform = `translate(${t.x}px, ${t.y}px)`;
    });
    frame.current = requestAnimationFrame(loop);
  }, []);

  /* ── Spawn targets and begin round ── */
  const initRound = useCallback(() => {
    const sky = skyRef.current;
    if (!sky) { requestAnimationFrame(() => initRound()); return; }
    const w = sky.clientWidth;
    const h = sky.clientHeight * SKY_PLAY;
    const s = spd(roundR.current);
    const mk = (type: 'chatgpt'|'claude', xF: number): Tgt => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      return { type, x: w * xF, y: h * 0.85, vx: Math.cos(a) * s, vy: Math.sin(a) * s, alive: true };
    };
    tD.current = [mk('chatgpt', 0.2 + Math.random() * 0.15), mk('claude', 0.55 + Math.random() * 0.15)];
    hitsR.current = [];
    shotsR.current = SHOTS;
    ending.current = false;
    setShots(SHOTS);
    setJamesImg('');
    [t0.current, t1.current].forEach(el => {
      if (!el) return;
      el.style.display = '';
      const inner = el.querySelector('.dh-tgt') as HTMLElement;
      if (inner) { inner.classList.remove('dh-hit'); inner.style.opacity = '1'; }
    });
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(loop);
    stopAll();
    play(SND.round);
  }, [loop]);

  /* ── Start game ── */
  const startGame = useCallback(() => {
    roundR.current = 1; scoreR.current = 0;
    setRound(1); setScore(0);
    stopAll();
    play(SND.loading);
    setPhase('round');
    setCatchText(true);
    // Wait for loading music to finish (6.3s), then start round 1
    setTimeout(() => {
      setCatchText(false);
      initRound();
    }, 6500);
  }, [initRound]);

  /* ── End round ── */
  const endRound = useCallback(() => {
    if (ending.current) return;
    ending.current = true;
    cancelAnimationFrame(frame.current);
    const h = hitsR.current;

    // Step 1: James reaction sound (3s)
    stopAll();
    let img = J_LAUGH;
    if (h.length === 2) { img = J_BOTH; play(SND.perfect); }
    else if (h.length === 1) { img = h[0] === 'chatgpt' ? J_GPT : J_CLAUDE; play(SND.shows); }
    else { play(SND.laugh); }
    setJamesImg(img);
    setPhase('result');

    // Step 2: After reaction sound finishes (3.2s), play transition sound
    setTimeout(() => {
      stopAll();
      if (h.length > 0) play(SND.clear); // 4.6s
      else play(SND.failed);              // 3.0s
      const wait = h.length > 0 ? 4800 : 3200;

      // Step 3: After transition sound finishes, next round or game over
      setTimeout(() => {
        if (roundR.current >= ROUNDS) {
          stopAll();
          setPhase('over');
          play(SND.over);
        } else {
          roundR.current += 1;
          setRound(roundR.current);
          setPhase('round');
          requestAnimationFrame(() => requestAnimationFrame(() => initRound()));
        }
      }, wait);
    }, 3300);
  }, [initRound]);

  /* ── Shot ── */
  const handleShot = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (phR.current !== 'round' || shotsR.current <= 0 || ending.current) return;
    e.preventDefault();
    const sky = skyRef.current;
    if (!sky) return;
    const rect = sky.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    shotsR.current -= 1;
    setShots(shotsR.current);
    setFlash(true); setTimeout(() => setFlash(false), 80);
    setBangs(b => [...b, { x: cx, y: cy, id: Date.now() }]);
    setTimeout(() => setBangs(b => b.slice(1)), 600);

    tD.current.forEach((t, i) => {
      if (!t.alive) return;
      if (Math.hypot(cx - (t.x + TGT / 2), cy - (t.y + TGT / 2)) < TGT * 0.75) {
        t.alive = false;
        hitsR.current.push(t.type);
        scoreR.current += 100;
        setScore(scoreR.current);
        const el = (i === 0 ? t0 : t1).current?.querySelector('.dh-tgt');
        if (el) el.classList.add('dh-hit');
      }
    });

    if (tD.current.every(t => !t.alive) || shotsR.current <= 0) {
      setTimeout(() => endRound(), tD.current.every(t => !t.alive) ? 500 : 900);
    }
  }, [endRound]);

  /* ── Keys ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { cancelAnimationFrame(frame.current); stopAll(); go('sessions'); return; }
      if ((phR.current === 'title' || phR.current === 'over') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startGame(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [startGame]);

  /* ═══════════════════ RENDER ═══════════════════ */
  const overMsg = MSGS.find(([min]) => scoreR.current >= min)?.[1] ?? '';

  const game = (
    <div className="dh">
      <div className="dh-scan" />

      {/* ──── TITLE ──── */}
      {phase === 'title' && (
        <div className="dh-title" onClick={startGame}>
          <div className="dh-title-bg" style={{ backgroundImage: `url(${COVER})` }} />
          <div className="dh-title-bottom">
            <div className="dh-blink dh-start-text">PRESS START OR CLICK TO PLAY</div>
            <button className="dh-back" onClick={e => { e.stopPropagation(); go('sessions'); }}>ESC : BACK TO EXPLORE</button>
          </div>
        </div>
      )}

      {/* ──── GAME ──── */}
      {(phase === 'round' || phase === 'result') && (
        <div className="dh-game">
          <div className="dh-hud">
            <div className="dh-hud-l"><span className="dh-hud-label">ROUND</span><span className="dh-hud-val">{round}/{ROUNDS}</span></div>
            <div className="dh-hud-c"><span className="dh-hud-label">SCORE</span><span className="dh-hud-val dh-score">{String(score).padStart(4, '0')}</span></div>
            <div className="dh-hud-r"><span className="dh-hud-label">SHOTS</span><div className="dh-bullets">{[0,1,2].map(i => <i key={i} className={i < shots ? 'live' : 'spent'} />)}</div></div>
          </div>

          <div className="dh-sky" ref={skyRef} onPointerDown={phase === 'round' && !catchText ? handleShot : undefined}>
            {flash && <div className="dh-flash" />}
            {bangs.map(b => <div key={b.id} className="dh-bang" style={{ left: b.x, top: b.y }}>BANG!</div>)}
            <div ref={t0} className="dh-tgt-wrap" style={{ position: 'absolute', top: 0, left: 0 }}>
              <div className="dh-tgt dh-chatgpt"><img src={ICON_GPT} alt="ChatGPT" draggable={false} /><i className="dh-wing dh-wl" /><i className="dh-wing dh-wr" /></div>
            </div>
            <div ref={t1} className="dh-tgt-wrap" style={{ position: 'absolute', top: 0, left: 0 }}>
              <div className="dh-tgt dh-claude"><img src={ICON_CLAUDE} alt="Claude" draggable={false} /><i className="dh-wing dh-wl" /><i className="dh-wing dh-wr" /></div>
            </div>

            {/* "CATCH THE AI!" — shown only on round 1 intro */}
            {catchText && (
              <div className="dh-catch">
                <div className="dh-catch-round">ROUND 1</div>
                <div className="dh-catch-text">CATCH THE AI!</div>
              </div>
            )}
          </div>

          {phase === 'result' && jamesImg && (
            <div className="dh-james" key={round + jamesImg}>
              <img src={jamesImg} alt="James" draggable={false} />
            </div>
          )}

          <div className="dh-grass" />
        </div>
      )}

      {/* ──── GAME OVER ──── */}
      {phase === 'over' && (
        <div className="dh-over" onClick={startGame}>
          <div className="dh-over-sky" />
          <div className="dh-over-content">
            <div className="dh-over-title">GAME OVER</div>
            <div className="dh-over-score"><span>FINAL SCORE</span><b>{String(score).padStart(4, '0')}</b></div>
            <div className="dh-over-msg">{overMsg}</div>
            <img src={score >= 500 ? J_BOTH : J_LAUGH} alt="James" className="dh-over-james" draggable={false} />
            <div className="dh-blink" style={{ marginTop: 16, fontSize: 9 }}>PRESS START OR CLICK TO PLAY AGAIN</div>
            <button className="dh-back" onClick={e => { e.stopPropagation(); go('sessions'); }}>EXIT TO EXPLORE</button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(game, document.body);
}
