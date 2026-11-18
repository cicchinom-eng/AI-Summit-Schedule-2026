import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { go } from '../App';
import '../spaceinvaders.css';

/* ═══════════════════ Constants ═══════════════════ */
const GW = 400, GH = 540;
const COLS = 11, ROWS = 5;
const PX = 3; // pixel scale
const AW = 8 * PX, AH = 8 * PX; // alien size
const AGX = 10, AGY = 10; // gaps
const SHIP_W = 48, SHIP_H = 44;
const JAMES = '/images/si-james.png';

const COLORS = ['#ff2266', '#10a37f', '#e8714a', '#00e5ff', '#fbd000'];
const PTS = [30, 20, 20, 10, 10];
const WAVE_MSGS = ['THE AI AWAKENS', "THEY'RE LEARNING YOUR PATTERNS", "THEY'RE REWRITING YOUR TESTS", "THEY'VE ACCESSED THE GRADEBOOK", 'RESISTANCE IS COMPUTATIONALLY FUTILE'];
const OVER_MSGS: [number, string][] = [[2000, 'You saved education! ...for now.'], [1000, 'Not bad! The AI retreats temporarily.'], [400, 'Some AI slipped through. Check your essays.'], [0, 'The AI has won. All homework is now auto-generated.']];

// Alien pixel art (8x8, 2 frames per type) encoded as bitmask rows
const SP: number[][][] = [
  [[0x18,0x3c,0x7e,0xdb,0xff,0x24,0x5a,0xa5],[0x18,0x3c,0x7e,0xdb,0xff,0x5a,0x81,0x42]], // squid
  [[0x42,0x24,0x7e,0xdb,0xff,0xbd,0xa5,0x18],[0x42,0xa5,0xdb,0xff,0x7e,0x24,0x42,0x81]], // crab
  [[0x3c,0x7e,0xdb,0xff,0x5a,0xa5,0x81,0x42],[0x3c,0x7e,0xdb,0xff,0x3c,0x5a,0xa5,0x24]], // octopus
];

/* ═══════════════════ Sound synth ═══════════════════ */
let _ac: AudioContext | null = null;
function ac() { if (!_ac) _ac = new AudioContext(); return _ac; }
function beep(f: number, d: number, t: OscillatorType = 'square', v = 0.07) {
  try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(c.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.stop(c.currentTime + d + .01); } catch {}
}
const sndShoot = () => beep(880, 0.08);
const sndHit = () => { beep(220, 0.12, 'sawtooth', 0.09); setTimeout(() => beep(110, 0.1, 'sawtooth', 0.06), 50); };
const sndDie = () => { beep(200, 0.3, 'sawtooth', 0.1); setTimeout(() => beep(80, 0.4, 'sawtooth', 0.08), 100); };
const sndStep = (n: number) => beep(50 + (n % 4) * 12, 0.06, 'square', 0.04);

/* ═══════════════════ Draw helpers ═══════════════════ */
function drawAlien(ctx: CanvasRenderingContext2D, type: number, frame: number, x: number, y: number, color: string) {
  const s = SP[Math.min(type, 2)][frame];
  ctx.fillStyle = color;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (s[r] & (1 << (7 - c))) ctx.fillRect(x + c * PX, y + r * PX, PX, PX);
}

/* ═══════════════════ Component ═══════════════════ */
interface P { x: number; y: number; vx: number; vy: number; life: number; color: string }

export default function SpaceInvaders() {
  const [phase, setPhase] = useState<'title' | 'game' | 'wave' | 'over'>('title');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [waveMsg, setWaveMsg] = useState('');

  const canRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);
  const shipImg = useRef<HTMLImageElement>(undefined);
  const phRef = useRef(phase);
  useEffect(() => { phRef.current = phase; }, [phase]);

  // All mutable game state in one ref
  const g = useRef({
    px: GW / 2 - SHIP_W / 2,
    aliens: [] as { col: number; row: number; alive: boolean; type: number }[],
    ax: 30, ay: 50, adx: 1, af: 0, stepN: 0, stepT: 0,
    pb: null as { x: number; y: number } | null,
    ab: [] as { x: number; y: number }[],
    abT: 0,
    particles: [] as P[],
    score: 0, lives: 3, wave: 1,
    keys: new Set<string>(),
    invuln: 0,
    stars: [] as { x: number; y: number; s: number; sp: number }[],
  });

  /* ── Load font + ship image ── */
  useEffect(() => {
    if (!document.getElementById('si-font')) {
      const l = document.createElement('link'); l.id = 'si-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
      document.head.appendChild(l);
    }
    const img = new Image(); img.src = JAMES; img.onload = () => { shipImg.current = img; };
  }, []);

  useEffect(() => { const p = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = p; }; }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  /* ── Init stars ── */
  useEffect(() => {
    g.current.stars = Array.from({ length: 80 }, () => ({ x: Math.random() * GW, y: Math.random() * GH, s: 1 + Math.random() * 1.5, sp: 0.15 + Math.random() * 0.35 }));
  }, []);

  /* ── Init wave ── */
  const initWave = useCallback((wv: number) => {
    const s = g.current;
    s.aliens = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) s.aliens.push({ col: c, row: r, alive: true, type: r, });
    s.ax = 20; s.ay = 40 + (wv - 1) * 6; s.adx = 1; s.af = 0; s.stepN = 0; s.stepT = 0;
    s.pb = null; s.ab = []; s.abT = 0; s.particles = [];
    s.px = GW / 2 - SHIP_W / 2;
    s.invuln = 0;
  }, []);

  /* ── Start game ── */
  const startGame = useCallback(() => {
    const s = g.current;
    s.score = 0; s.lives = 3; s.wave = 1;
    setScore(0); setLives(3); setWave(1);
    initWave(1);
    setPhase('game');
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initWave]);

  /* ── Next wave ── */
  const nextWave = useCallback(() => {
    const s = g.current;
    s.wave += 1; setWave(s.wave);
    setWaveMsg(WAVE_MSGS[Math.min(s.wave - 1, WAVE_MSGS.length - 1)]);
    setPhase('wave');
    setTimeout(() => { initWave(s.wave); setPhase('game'); frame.current = requestAnimationFrame(tick); }, 2500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initWave]);

  /* ═══════════════════ GAME LOOP ═══════════════════ */
  const tick = useCallback((now: number) => {
    if (phRef.current !== 'game') return;
    const s = g.current;
    const ctx = canRef.current?.getContext('2d');
    if (!ctx) { frame.current = requestAnimationFrame(tick); return; }

    // ── Input ──
    const spd = 3.5;
    if (s.keys.has('ArrowLeft') || s.keys.has('a')) s.px = Math.max(4, s.px - spd);
    if (s.keys.has('ArrowRight') || s.keys.has('d')) s.px = Math.min(GW - SHIP_W - 4, s.px + spd);
    if ((s.keys.has(' ') || s.keys.has('ArrowUp')) && !s.pb) { s.pb = { x: s.px + SHIP_W / 2 - 1.5, y: GH - SHIP_H - 10 }; sndShoot(); }

    // ── Move bullets ──
    if (s.pb) { s.pb.y -= 7; if (s.pb.y < 0) s.pb = null; }
    s.ab = s.ab.filter(b => { b.y += 2.5 + s.wave * 0.3; return b.y < GH; });

    // ── Step aliens ──
    const alive = s.aliens.filter(a => a.alive);
    const stepMs = Math.max(60, 500 - (COLS * ROWS - alive.length) * 7 - s.wave * 30);
    if (now - s.stepT > stepMs) {
      s.stepT = now; s.af = 1 - s.af; s.stepN++;
      sndStep(s.stepN);
      const step = AW * 0.35;
      s.ax += s.adx * step;
      const xs = alive.map(a => s.ax + a.col * (AW + AGX));
      if (Math.max(...xs) + AW > GW - 6 || Math.min(...xs) < 6) { s.adx *= -1; s.ay += AH * 0.45; }
    }

    // ── Alien fire ──
    if (now - s.abT > Math.max(400, 1200 - s.wave * 100) && s.ab.length < 2 + s.wave) {
      s.abT = now;
      // Pick random front-line alien
      const front: typeof alive[0][] = [];
      for (let c = 0; c < COLS; c++) {
        const col = alive.filter(a => a.col === c);
        if (col.length) front.push(col.reduce((a, b) => a.row > b.row ? a : b));
      }
      if (front.length) {
        const a = front[Math.floor(Math.random() * front.length)];
        s.ab.push({ x: s.ax + a.col * (AW + AGX) + AW / 2, y: s.ay + a.row * (AH + AGY) + AH });
      }
    }

    // ── Collisions: player bullet → aliens ──
    if (s.pb) {
      for (const a of s.aliens) {
        if (!a.alive) continue;
        const ax = s.ax + a.col * (AW + AGX), ay = s.ay + a.row * (AH + AGY);
        if (s.pb!.x > ax - 2 && s.pb!.x < ax + AW + 2 && s.pb!.y > ay && s.pb!.y < ay + AH) {
          a.alive = false; s.pb = null;
          s.score += PTS[a.type] ?? 10; setScore(s.score);
          sndHit();
          const clr = COLORS[a.type];
          for (let i = 0; i < 10; i++) s.particles.push({ x: ax + AW / 2, y: ay + AH / 2, vx: (Math.random() - .5) * 4, vy: (Math.random() - .5) * 4, life: 20 + Math.random() * 10, color: clr });
          break;
        }
      }
    }

    // ── Collisions: alien bullet → player ──
    if (s.invuln <= 0) {
      for (let i = s.ab.length - 1; i >= 0; i--) {
        const b = s.ab[i];
        if (b.x > s.px && b.x < s.px + SHIP_W && b.y > GH - SHIP_H - 5 && b.y < GH) {
          s.ab.splice(i, 1); s.lives--; setLives(s.lives); s.invuln = 90; sndDie();
          for (let j = 0; j < 15; j++) s.particles.push({ x: s.px + SHIP_W / 2, y: GH - SHIP_H / 2, vx: (Math.random() - .5) * 5, vy: (Math.random() - .5) * 5, life: 25, color: '#0f0' });
          if (s.lives <= 0) { setPhase('over'); return; }
          break;
        }
      }
    } else { s.invuln--; }

    // ── Aliens reach bottom → game over ──
    const bottomY = Math.max(...alive.map(a => s.ay + a.row * (AH + AGY) + AH));
    if (bottomY > GH - SHIP_H - 20 && alive.length > 0) { setPhase('over'); return; }

    // ── All aliens dead → next wave ──
    if (alive.length === 0) { nextWave(); return; }

    // ── Particles ──
    s.particles = s.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.life--; return p.life > 0; });

    // ── Stars ──
    s.stars.forEach(st => { st.y += st.sp; if (st.y > GH) { st.y = 0; st.x = Math.random() * GW; } });

    // ═══════════════ RENDER ═══════════════
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, GW, GH);

    // Stars
    s.stars.forEach(st => { ctx.fillStyle = `rgba(255,255,255,${0.3 + st.sp * 0.5})`; ctx.fillRect(st.x, st.y, st.s, st.s); });

    // Aliens
    alive.forEach(a => {
      drawAlien(ctx, a.type, s.af, s.ax + a.col * (AW + AGX), s.ay + a.row * (AH + AGY), COLORS[a.type]);
    });

    // Player bullet
    if (s.pb) { ctx.fillStyle = '#0f0'; ctx.shadowColor = '#0f0'; ctx.shadowBlur = 6; ctx.fillRect(s.pb.x, s.pb.y, 3, 12); ctx.shadowBlur = 0; }

    // Alien bullets
    ctx.fillStyle = '#ff4444';
    s.ab.forEach(b => { ctx.fillRect(b.x - 1, b.y, 3, 8); });

    // Player ship
    if (shipImg.current && (s.invuln <= 0 || Math.floor(s.invuln / 4) % 2 === 0)) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(shipImg.current, s.px, GH - SHIP_H - 5, SHIP_W, SHIP_H);
    }

    // Particles
    s.particles.forEach(p => {
      ctx.globalAlpha = p.life / 30;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1;

    frame.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextWave]);

  /* ── Input ── */
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { cancelAnimationFrame(frame.current); go('sessions'); return; }
      g.current.keys.add(e.key);
      if ((phRef.current === 'title' || phRef.current === 'over') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startGame(); }
    };
    const up = (e: KeyboardEvent) => g.current.keys.delete(e.key);
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, [startGame]);

  // Touch controls
  const tLeft = useCallback(() => { g.current.keys.add('ArrowLeft'); }, []);
  const tRight = useCallback(() => { g.current.keys.add('ArrowRight'); }, []);
  const tFire = useCallback(() => { g.current.keys.add(' '); setTimeout(() => g.current.keys.delete(' '), 50); }, []);
  const tStop = useCallback(() => { g.current.keys.delete('ArrowLeft'); g.current.keys.delete('ArrowRight'); }, []);

  /* ═══════════════════ RENDER ═══════════════════ */
  const overMsg = OVER_MSGS.find(([min]) => g.current.score >= min)?.[1] ?? '';

  const ui = (
    <div className="si" onClick={phase === 'title' || phase === 'over' ? startGame : undefined}>
      <div className="si-scan" />

      {/* HUD */}
      {(phase === 'game' || phase === 'wave') && (
        <div className="si-hud">
          <div><span className="si-label">SCORE</span><span className="si-val">{String(score).padStart(5, '0')}</span></div>
          <div><span className="si-label">WAVE</span><span className="si-val">{wave}</span></div>
          <div><span className="si-label">LIVES</span><span className="si-val">{Array.from({ length: lives }, (_, i) => <span key={i} className="si-life" />)}</span></div>
        </div>
      )}

      {/* Canvas */}
      {(phase === 'game' || phase === 'wave') && (
        <>
          <canvas ref={canRef} width={GW} height={GH} className="si-canvas" />
          <div className="si-touch">
            <button onPointerDown={tLeft} onPointerUp={tStop} onPointerLeave={tStop}>&larr;</button>
            <button onPointerDown={tFire}>FIRE</button>
            <button onPointerDown={tRight} onPointerUp={tStop} onPointerLeave={tStop}>&rarr;</button>
          </div>
        </>
      )}

      {/* Wave message overlay */}
      {phase === 'wave' && (
        <div className="si-wave-overlay">
          <div className="si-wave-num">WAVE {wave}</div>
          <div className="si-wave-msg">{waveMsg}</div>
        </div>
      )}

      {/* Title */}
      {phase === 'title' && (
        <div className="si-title">
          <h1 className="si-title-main">AI INVADERS</h1>
          <p className="si-title-sub">HUMANITY'S LAST HOPE</p>
          <img src={JAMES} alt="James's Ship" className="si-title-ship" draggable={false} />
          <p className="si-title-sub2">DEFEND EDUCATION FROM AI</p>
          <div className="si-title-pts">
            {[0, 1, 2].map(t => (
              <div key={t} className="si-title-row">
                <canvas ref={el => { if (el) { const c = el.getContext('2d'); if (c) { el.width = 8 * PX; el.height = 8 * PX; drawAlien(c, t, 0, 0, 0, COLORS[t]); } } }} className="si-title-alien" />
                <span>= {PTS[t]} PTS</span>
              </div>
            ))}
          </div>
          <p className="si-blink">PRESS START OR CLICK TO PLAY</p>
          <button className="si-back" onClick={e => { e.stopPropagation(); go('sessions'); }}>ESC : BACK</button>
        </div>
      )}

      {/* Game Over */}
      {phase === 'over' && (
        <div className="si-over">
          <div className="si-over-title">GAME OVER</div>
          <div className="si-over-score"><span>SCORE</span><b>{String(score).padStart(5, '0')}</b></div>
          <div className="si-over-msg">{overMsg}</div>
          <p className="si-blink" style={{ marginTop: 20 }}>CLICK OR PRESS START TO PLAY AGAIN</p>
          <button className="si-back" onClick={e => { e.stopPropagation(); go('sessions'); }}>ESC : EXIT</button>
        </div>
      )}
    </div>
  );

  return createPortal(ui, document.body);
}
