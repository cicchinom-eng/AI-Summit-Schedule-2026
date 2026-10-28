import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { go } from '../App';
import '../punchout.css';

/* ═══════════════════════ Types ═══════════════════════ */
type Phase = 'title' | 'fight' | 'winner';
type JamesAnim = 'idle' | 'hit-l' | 'hit-r' | 'taunt' | 'windup' | 'punch' | 'victory';
type RobotAnim = 'idle' | 'punch-l' | 'punch-r' | 'hit' | 'ko';

/* ═══════════════════════ Data ═══════════════════════ */
const COVER = '/images/punchout-cover.jpg';
const JAMES = '/images/punchout-james.png';

const TAUNTS_HIGH = [
  "Is that all you've got?",
  "My intern hits harder.",
  "I barely felt that one.",
  "That tickles, tin can!",
  "Have you tried turning yourself off?",
];
const TAUNTS_MID = [
  "Not bad... for a machine.",
  "My quarterly reviews hit harder!",
  "I've seen scarier spreadsheets.",
  "You call that a punch?",
  "I've taken worse hits at board meetings.",
];
const TAUNTS_LOW = [
  "OK, now I'm paying attention.",
  "I survived budget season. You think YOU scare me?",
  "My PowerPoints are deadlier.",
  "You're going to regret that...",
  "Time to show you my management style.",
];
const HIT_TEXTS = ['POW!', 'WHAM!', 'SMACK!', 'BONK!', 'KA-POW!', 'THWACK!', 'BAM!', 'CRUNCH!'];
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/* ═══════════════════════ Robot SVG ═══════════════════════ */
function RobotSVG() {
  return (
    <svg viewBox="0 0 100 120" fill="none" className="po-robot-svg">
      <defs>
        <linearGradient id="po-mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#AAbbcc" /><stop offset="100%" stopColor="#7B8D98" /></linearGradient>
        <linearGradient id="po-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3572B0" /><stop offset="100%" stopColor="#2558A0" /></linearGradient>
      </defs>
      {/* Antenna */}
      <rect x="47" y="2" width="6" height="14" rx="3" fill="#667" />
      <circle cx="50" cy="2" r="5" fill="#F33" className="po-blink-light" />
      {/* Head */}
      <rect x="26" y="16" width="48" height="30" rx="6" fill="url(#po-mg)" stroke="#5A6B76" strokeWidth="2" />
      <rect x="30" y="20" width="14" height="4" rx="2" fill="#B8CCD8" opacity="0.5" />
      <rect x="34" y="28" width="32" height="12" rx="3" fill="#6B7D8A" />
      <circle cx="43" cy="34" r="3" fill="#4A5A66" /><circle cx="57" cy="34" r="3" fill="#4A5A66" />
      {/* Neck */}
      <rect x="42" y="46" width="16" height="7" rx="2" fill="#7B8D98" />
      {/* Torso */}
      <rect x="16" y="51" width="68" height="50" rx="5" fill="url(#po-bg)" stroke="#1A4F8A" strokeWidth="2" />
      <rect x="26" y="57" width="48" height="36" rx="3" fill="#1A4070" />
      <text x="50" y="70" textAnchor="middle" fill="#4A90D9" fontFamily="monospace" fontSize="7" fontWeight="bold">NJ-AI</text>
      <rect x="34" y="76" width="32" height="3" rx="1.5" fill="#4A90D9" />
      <rect x="34" y="82" width="32" height="3" rx="1.5" fill="#4A90D9" />
      <rect x="34" y="88" width="24" height="3" rx="1.5" fill="#3B6" />
      {/* Arms */}
      <rect x="2" y="55" width="16" height="34" rx="8" fill="#8899AA" stroke="#6B7D8A" strokeWidth="2" />
      <rect x="82" y="55" width="16" height="34" rx="8" fill="#8899AA" stroke="#6B7D8A" strokeWidth="2" />
    </svg>
  );
}

/* ═══════════════════════ Component ═══════════════════════ */
export default function PunchOut() {
  const [phase, setPhase] = useState<Phase>('title');
  const [jamesHP, setJamesHP] = useState(100);
  const [jamesAnim, setJamesAnim] = useState<JamesAnim>('idle');
  const [robotAnim, setRobotAnim] = useState<RobotAnim>('idle');
  const [taunt, setTaunt] = useState<string | null>(null);
  const [hitFx, setHitFx] = useState<{ t: string; x: number; y: number; id: number } | null>(null);
  const [shake, setShake] = useState(0);
  const [flash, setFlash] = useState(false);
  const [koStep, setKoStep] = useState(0);
  const [intro, setIntro] = useState(false);

  const cdRef = useRef(false);
  const hitsRef = useRef(0);
  const hpRef = useRef(100);
  const phRef = useRef<Phase>('title');
  const koRef = useRef(0);
  const intRef = useRef(false);

  useEffect(() => { phRef.current = phase; }, [phase]);
  useEffect(() => { hpRef.current = jamesHP; }, [jamesHP]);
  useEffect(() => { koRef.current = koStep; }, [koStep]);
  useEffect(() => { intRef.current = intro; }, [intro]);

  /* ── Font ── */
  useEffect(() => {
    if (!document.getElementById('po-font')) {
      const l = document.createElement('link');
      l.id = 'po-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  /* ── Lock scroll ── */
  useEffect(() => {
    const p = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = p; };
  }, []);

  /* ── Start fight ── */
  const startFight = useCallback(() => {
    setPhase('fight');
    setIntro(true);
    setTimeout(() => setIntro(false), 1800);
  }, []);

  /* ── Punch ── */
  const doPunch = useCallback((side: 'l' | 'r') => {
    if (phRef.current !== 'fight' || cdRef.current || koRef.current > 0 || intRef.current) return;
    cdRef.current = true;
    setRobotAnim(side === 'l' ? 'punch-l' : 'punch-r');

    setTimeout(() => {
      const dmg = 5 + Math.floor(Math.random() * 6);
      const hp = Math.max(0, hpRef.current - dmg);
      hpRef.current = hp;
      setJamesHP(hp);
      setJamesAnim(side === 'l' ? 'hit-l' : 'hit-r');
      hitsRef.current += 1;
      setHitFx({ t: pick(HIT_TEXTS), x: 25 + Math.random() * 50, y: 8 + Math.random() * 30, id: Date.now() });
      setShake(s => s + 1);

      if (hitsRef.current % (3 + Math.floor(Math.random() * 3)) === 0 && hp > 20) {
        setTimeout(() => {
          const pool = hp > 65 ? TAUNTS_HIGH : hp > 35 ? TAUNTS_MID : TAUNTS_LOW;
          setTaunt(pick(pool));
          setTimeout(() => setTaunt(null), 2200);
        }, 300);
      }

      setTimeout(() => {
        setRobotAnim('idle');
        setJamesAnim('idle');
        cdRef.current = false;
      }, 220);
    }, 100);
  }, []);

  /* ── KO ── */
  const triggerKO = useCallback(() => {
    cdRef.current = true;
    setJamesAnim('taunt');
    setTaunt("You shouldn't have done that...");
    setKoStep(1);

    setTimeout(() => {
      setTaunt(null);
      setJamesAnim('windup');
      setKoStep(2);
      setTimeout(() => {
        setKoStep(3);
        setTimeout(() => {
          setKoStep(4);
          setJamesAnim('punch');
          setRobotAnim('hit');
          setFlash(true);
          setShake(s => s + 1);
          setTimeout(() => {
            setFlash(false);
            setRobotAnim('ko');
            setTimeout(() => {
              setKoStep(5);
              setTimeout(() => { setPhase('winner'); setJamesAnim('victory'); }, 2800);
            }, 700);
          }, 400);
        }, 2200);
      }, 2200);
    }, 1800);
  }, []);

  useEffect(() => {
    if (phase === 'fight' && jamesHP <= 15 && koStep === 0) triggerKO();
  }, [jamesHP, phase, koStep, triggerKO]);

  /* ── Reset ── */
  const reset = useCallback(() => {
    setPhase('title'); setJamesHP(100); setJamesAnim('idle'); setRobotAnim('idle');
    setTaunt(null); setHitFx(null); setShake(0); setFlash(false); setKoStep(0); setIntro(false);
    hitsRef.current = 0; cdRef.current = false;
  }, []);

  /* ── Keys ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const p = phRef.current;
      if (p === 'title') {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startFight(); }
        if (e.key === 'Escape') go('sessions');
      } else if (p === 'fight') {
        if (koRef.current > 0) return;
        if (e.key === 'Escape') { go('sessions'); return; }
        const k = e.key.toLowerCase();
        if (k === 'z' || k === 'j' || k === 'arrowleft') { e.preventDefault(); doPunch('l'); }
        if (k === 'x' || k === 'k' || k === 'arrowright') { e.preventDefault(); doPunch('r'); }
      } else if (p === 'winner') {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reset(); }
        if (e.key === 'Escape') go('sessions');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [doPunch, reset, startFight]);

  /* ═══════════════════════ RENDER ═══════════════════════ */
  const game = (
    <div className={`po ${shake ? `po-shake-${shake % 2}` : ''}`}>
      <div className="po-scan" />
      {flash && <div className="po-flash" />}

      {/* ──── TITLE ──── */}
      {phase === 'title' && (
        <div className="po-title">
          <div className="po-title-bg" style={{ backgroundImage: `url(${COVER})` }} />
          <div className="po-title-bottom">
            <div className="po-blink po-start-text">PRESS START</div>
            <button className="po-back" onClick={() => go('sessions')}>ESC : BACK TO EXPLORE</button>
          </div>
        </div>
      )}

      {/* ──── FIGHT ──── */}
      {phase === 'fight' && (
        <div className="po-fight">
          <div className="po-hud">
            <div className="po-hud-side">
              <span className="po-hud-name">ROBO-3000</span>
              <div className="po-bar"><div className="po-hp po-hp-g" style={{ width: koStep >= 4 ? '0%' : '100%' }} /></div>
            </div>
            <div className="po-hud-mid">ROUND 1</div>
            <div className="po-hud-side po-right">
              <span className="po-hud-name">J. SANTANA</span>
              <div className="po-bar"><div className={`po-hp ${jamesHP > 50 ? 'po-hp-g' : jamesHP > 25 ? 'po-hp-y' : 'po-hp-r'}`} style={{ width: `${jamesHP}%` }} /></div>
            </div>
          </div>

          <div className="po-ring">
            <div className="po-crowd" />
            <div className="po-rope po-r1" /><div className="po-rope po-r2" /><div className="po-rope po-r3" />
            <div className="po-post po-pl" /><div className="po-post po-pr" />

            <div className={`po-james po-ja-${jamesAnim}`}>
              <img src={JAMES} alt="James Santana" className="po-james-img" draggable={false} />
            </div>

            {taunt && <div className="po-taunt"><span>{taunt}</span></div>}
            {hitFx && <div key={hitFx.id} className="po-hit" style={{ left: `${hitFx.x}%`, top: `${hitFx.y}%` }}>{hitFx.t}</div>}

            <div className={`po-robot po-ro-${robotAnim}`}>
              <div className="po-robot-body"><RobotSVG /></div>
              <div className="po-glove po-gl-l" />
              <div className="po-glove po-gl-r" />
            </div>
          </div>

          {koStep === 0 && !intro && (
            <>
              <div className="po-ctrl"><span>Z / &#8592; &nbsp; LEFT PUNCH</span><span>X / &#8594; &nbsp; RIGHT PUNCH</span></div>
              <div className="po-touch">
                <button onPointerDown={() => doPunch('l')}>&#x1F44A; LEFT</button>
                <button onPointerDown={() => doPunch('r')}>RIGHT &#x1F44A;</button>
              </div>
            </>
          )}

          {intro && <div className="po-intro"><div className="po-intro-r">ROUND 1</div><div className="po-intro-f">FIGHT!</div></div>}
          {koStep === 2 && <div className="po-ko-warn">JAMES IS WINDING UP...</div>}
          {koStep === 3 && <div className="po-ko-move"><small>SPECIAL MOVE</small><br />THE SUMMATIVE SMASH</div>}
          {koStep === 5 && <div className="po-ko-big">K.O.<span>!!</span></div>}
        </div>
      )}

      {/* ──── WINNER ──── */}
      {phase === 'winner' && (
        <div className="po-winner">
          <div className="po-confetti-box" aria-hidden>{Array.from({ length: 50 }, (_, i) => (
            <i key={i} className="po-confetti" style={{ left: `${(i * 2) % 100}%`, animationDelay: `${(i * 0.13) % 3}s`, background: ['#e52521','#fbd000','#049cd8','#43b047','#ff6fb5','#fff'][i % 6], width: `${6 + (i % 4) * 2}px`, height: `${8 + (i % 3) * 4}px` }} />
          ))}</div>
          <div className="po-win-badge">WINNER</div>
          <div className="po-win-frame"><img src={JAMES} alt="Champion James Santana" draggable={false} /></div>
          <div className="po-win-name">JAMES SANTANA</div>
          <div className="po-win-sub">UNDEFEATED CHAMPION</div>
          <div className="po-win-rec">RECORD: &infin; &ndash; 0</div>
          <div className="po-blink" style={{ marginTop: 20, fontSize: 9 }}>PRESS START TO TRY AGAIN</div>
          <button className="po-back" onClick={() => go('sessions')}>EXIT TO EXPLORE</button>
        </div>
      )}
    </div>
  );

  return createPortal(game, document.body);
}
