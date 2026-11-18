import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { go } from '../App';
import '../oregontrail.css';

/* ═══════════════════ Data ═══════════════════ */
const PROFS = [
  { id: 'banker', label: 'Banker', img: '/images/ot-banker.png', quip: 'You have $1,600 for supplies.\nMoney won\'t help where you\'re going.' },
  { id: 'carpenter', label: 'Carpenter', img: '/images/ot-carpenter.png', quip: 'You can fix wagons.\nYou cannot fix the copier.' },
  { id: 'doctor', label: 'Doctor', img: '/images/ot-doctor.png', quip: 'You can treat dysentery.\nSpoiler: it won\'t matter.' },
  { id: 'farmer', label: 'Farmer', img: '/images/ot-farmer.png', quip: 'You\'re used to hard work.\nNothing prepares you for this.' },
  { id: 'hunter', label: 'Hunter', img: '/images/ot-hunter.png', quip: 'You can hunt for food.\nThe cafeteria is still worse.' },
];

interface Evt {
  title?: string;
  text: string;
  choices?: { label: string; response: string }[];
}

const EVENTS: Evt[] = [
  {
    text: `It is March 1, 1848.\n\nYour party of 5 is ready to depart.\n\nDestination: NJ AI Literacy Summit\nDistance:    2,000 miles\n\nYou begin your journey with:\n  \u2022 1 wagon (questionable condition)\n  \u2022 2 oxen (one looks unwell)\n  \u2022 100 lbs of food\n  \u2022 Unlimited optimism`,
  },
  {
    title: 'GENERAL STORE \u2014 Independence, Missouri',
    text: `The shopkeeper eyes you suspiciously.\n\n"What'll it be?"`,
    choices: [
      { label: '2,000 lbs of bacon and nothing else', response: `"Interesting choice," the shopkeeper\nmutters, writing slowly.\n\nYour purchase order has been submitted.\n\nUnfortunately, it requires three levels\nof administrative approval.\n\nEstimated delivery: 2028.\n\nYou press on with nothing.` },
      { label: 'Every AI subscription known to man', response: `The shopkeeper laughs for 45 seconds\nstraight. Tears stream down his face.\n\n"You'll need a purchase order for that."\n\nYour request has been forwarded to\nprocurement, who forwarded it to legal,\nwho forwarded it to the void.\n\nYou press on with nothing.` },
      { label: '47 copies of the acceptable use policy', response: `"We're out of those," says the shopkeeper.\n\n"Actually, we never had those."\n\n"Actually, what even is that?"\n\nHe closes the store early.\n\nYou press on with nothing.` },
    ],
  },
  {
    title: '\u2248 DAY 12 \u2248',
    text: `You have traveled 127 miles.\n\nWeather:  Rainy\nMorale:   Dwindling\nFood:     Suspiciously low\n\nOne of your oxen is looking at you\nwith what can only be described as\n"quiet disappointment."`,
  },
  {
    title: 'THE KANSAS RIVER',
    text: `You have reached the Kansas River.\nIt is 640 feet across.\n\nThe water is brown and full of\nstandardized tests.\n\nWhat would you like to do?`,
    choices: [
      { label: 'Attempt to ford the river', response: `You attempt to ford the river.\n\nThe current is too strong.\n\nYou lost:\n  \u2022 200 lbs of lesson plans\n  \u2022 1 wagon wheel\n  \u2022 Your dignity\n\nYou press on, dripping.` },
      { label: 'Caulk the wagon and float across', response: `You caulk the wagon and float.\n\nThe wagon tipped over.\n\nYou lost:\n  \u2022 Every single Chromebook\n  \u2022 400 dry-erase markers\n  \u2022 The will to continue\n\nYou press on, soaked.` },
      { label: 'Wait for the district to approve a bridge', response: `You submit a formal request\nto the river.\n\nThe river does not accept\npurchase orders.\n\nRequest denied.\n\nYou wade across in your\nbusiness casual attire.\n\nYou press on, soggy.` },
    ],
  },
  {
    title: '\u2248 DAY 34 \u2248',
    text: `Your food supplies are dangerously low.\n\nYou decide to go hunting.\n\n. . .\n\n. . . . . .\n\nYou shot 2,847 pounds of buffalo.\n\nHowever \u2014\n\nYOU CAN ONLY CARRY 100 LBS OF MEAT\nBACK TO THE WAGON.\n\n2,747 lbs of perfectly good buffalo\nwill be left to rot on the prairie.\n\nYour party is not pleased.`,
  },
  {
    title: '\u2248 DAY 47 \u2248  \u26A0 TRAGEDY STRIKES',
    text: `\u2022 James has a broken wagon tongue.\n  You have no spare parts.\n\n\u2022 A thief came in the night and stole\n  all 47 acceptable use policies.\n  (You didn't even have those.)\n\n\u2022 One party member has contracted\n  "chronic meeting fatigue."\n\n\u2022 The other ox has died.\n  It was your best ox.\n  It was your ONLY ox.\n\nMorale:  Rock bottom\nFood:    3 lbs of questionable jerky\nOxen:    0\nHope:    See "Oxen"`,
  },
];

/* ═══════════════════ Component ═══════════════════ */
type Phase = 'title' | 'pick' | 'game' | 'death';

export default function OregonTrail() {
  const [phase, setPhase] = useState<Phase>('title');
  const [prof, setProf] = useState(PROFS[0]);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [typeDone, setTypeDone] = useState(false);
  const [choiceIdx, setChoiceIdx] = useState(-1);
  const [respTyped, setRespTyped] = useState('');
  const [respDone, setRespDone] = useState(false);
  const [showQuip, setShowQuip] = useState(false);

  const fullRef = useRef('');
  const respRef = useRef('');
  const timerRef = useRef(0);
  const phRef = useRef<Phase>('title');
  useEffect(() => { phRef.current = phase; }, [phase]);

  /* ── Font ── */
  useEffect(() => {
    if (!document.getElementById('ot-font')) {
      const l = document.createElement('link');
      l.id = 'ot-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    const p = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = p; clearInterval(timerRef.current); };
  }, []);

  /* ── Typewriter engine ── */
  const startTyping = useCallback((text: string, onChar: (t: string) => void, onDone: () => void) => {
    clearInterval(timerRef.current);
    let i = 0;
    fullRef.current = text;
    timerRef.current = window.setInterval(() => {
      i++;
      if (i > text.length) { clearInterval(timerRef.current); onDone(); return; }
      onChar(text.slice(0, i));
    }, 18);
  }, []);

  const skipTyping = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  /* ── Start a game step ── */
  const beginStep = useCallback((idx: number) => {
    setStep(idx);
    setChoiceIdx(-1);
    setRespTyped('');
    setRespDone(false);
    setTypeDone(false);
    const evt = EVENTS[idx];
    startTyping(evt.text, t => setTyped(t), () => setTypeDone(true));
  }, [startTyping]);

  /* ── Choose profession ── */
  const pickProf = useCallback((p: typeof PROFS[0]) => {
    setProf(p);
    setShowQuip(true);
  }, []);

  /* ── Advance ── */
  const advance = useCallback(() => {
    const p = phRef.current;
    if (p === 'title') { setPhase('pick'); return; }
    if (p === 'pick') {
      if (!showQuip) return;
      setShowQuip(false);
      setPhase('game');
      beginStep(0);
      return;
    }
    if (p === 'game') {
      const evt = EVENTS[step];
      // Still typing intro → skip
      if (!typeDone) { skipTyping(); setTyped(fullRef.current); setTypeDone(true); return; }
      // Has choices and none chosen yet → wait for click
      if (evt.choices && choiceIdx < 0) return;
      // Response typing → skip
      if (evt.choices && choiceIdx >= 0 && !respDone) { skipTyping(); setRespTyped(respRef.current); setRespDone(true); return; }
      // Advance to next step
      if (step + 1 < EVENTS.length) { beginStep(step + 1); }
      else { setPhase('death'); }
      return;
    }
    if (p === 'death') {
      setPhase('title');
      return;
    }
  }, [step, typeDone, choiceIdx, respDone, showQuip, beginStep, skipTyping]);

  /* ── Choose an option ── */
  const makeChoice = useCallback((idx: number) => {
    const evt = EVENTS[step];
    if (!evt.choices || choiceIdx >= 0) return;
    setChoiceIdx(idx);
    const resp = evt.choices[idx].response;
    respRef.current = resp;
    startTyping(resp, t => setRespTyped(t), () => setRespDone(true));
  }, [step, choiceIdx, startTyping]);

  /* ── Keys ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { clearInterval(timerRef.current); go('sessions'); return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); return; }
      // Number keys for choices / profession
      const n = parseInt(e.key);
      if (phRef.current === 'pick' && !showQuip && n >= 1 && n <= 5) { pickProf(PROFS[n - 1]); return; }
      if (phRef.current === 'game' && typeDone && choiceIdx < 0) {
        const evt = EVENTS[step];
        if (evt.choices && n >= 1 && n <= evt.choices.length) { makeChoice(n - 1); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [advance, pickProf, makeChoice, step, typeDone, choiceIdx, showQuip]);

  const evt = EVENTS[step] ?? EVENTS[0];

  /* ═══════════════════ RENDER ═══════════════════ */
  const game = (
    <div className="ot" onClick={advance}>
      <div className="ot-scan" />
      <div className="ot-vig" />

      {/* ──── TITLE ──── */}
      {phase === 'title' && (
        <div className="ot-screen ot-title-screen">
          <pre className="ot-title-box">{`
  ╔══════════════════════════════╗
  ║                              ║
  ║      THE  OREGON  TRAIL      ║
  ║                              ║
  ║    NJ AI Literacy Summit     ║
  ║          Edition             ║
  ║                              ║
  ╚══════════════════════════════╝`}</pre>
          <p className="ot-copy">&copy; 2026 NJ AI Literacy Summit</p>
          <p className="ot-blink ot-prompt">Press ENTER or click to start</p>
        </div>
      )}

      {/* ──── PROFESSION ──── */}
      {phase === 'pick' && !showQuip && (
        <div className="ot-screen" onClick={e => e.stopPropagation()}>
          <p className="ot-line">Many kinds of people made the long</p>
          <p className="ot-line">journey to the AI Literacy Summit.</p>
          <p className="ot-line">&nbsp;</p>
          <p className="ot-line">You may:</p>
          <p className="ot-line">&nbsp;</p>
          <div className="ot-prof-grid">
            {PROFS.map((p, i) => (
              <button key={p.id} className="ot-prof-btn" onClick={() => pickProf(p)}>
                <img src={p.img} alt={p.label} draggable={false} />
                <span>{i + 1}. {p.label}</span>
              </button>
            ))}
          </div>
          <p className="ot-line">&nbsp;</p>
          <p className="ot-line dim">Click a character or press 1-5</p>
        </div>
      )}

      {/* ──── PROFESSION QUIP ──── */}
      {phase === 'pick' && showQuip && (
        <div className="ot-screen">
          <div className="ot-quip-wrap">
            <img src={prof.img} alt={prof.label} className="ot-quip-img" draggable={false} />
            <div>
              <p className="ot-line bright">You chose: {prof.label}</p>
              <p className="ot-line">&nbsp;</p>
              {prof.quip.split('\n').map((l, i) => <p key={i} className="ot-line">{l}</p>)}
            </div>
          </div>
          <p className="ot-line">&nbsp;</p>
          <p className="ot-blink ot-prompt">Press ENTER to embark</p>
        </div>
      )}

      {/* ──── GAME EVENTS ──── */}
      {phase === 'game' && (
        <div className="ot-screen" onClick={e => { if (evt.choices && typeDone && choiceIdx < 0) e.stopPropagation(); }}>
          {evt.title && <p className="ot-line bright">{evt.title}</p>}
          {evt.title && <p className="ot-line">&nbsp;</p>}
          <pre className="ot-body">{typed}{!typeDone && <span className="ot-cursor">{'\u2588'}</span>}</pre>

          {/* Choices */}
          {typeDone && evt.choices && choiceIdx < 0 && (
            <div className="ot-choices" onClick={e => e.stopPropagation()}>
              <p className="ot-line">&nbsp;</p>
              {evt.choices.map((c, i) => (
                <button key={i} className="ot-choice" onClick={() => makeChoice(i)}>
                  {i + 1}. {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Response */}
          {choiceIdx >= 0 && (
            <>
              <p className="ot-line">&nbsp;</p>
              <pre className="ot-body">{respTyped}{!respDone && <span className="ot-cursor">{'\u2588'}</span>}</pre>
            </>
          )}

          {/* Continue prompt */}
          {((typeDone && !evt.choices) || respDone) && (
            <><p className="ot-line">&nbsp;</p><p className="ot-blink ot-prompt">Press ENTER to continue</p></>
          )}
        </div>
      )}

      {/* ──── DEATH ──── */}
      {phase === 'death' && (
        <div className="ot-screen ot-death-screen">
          <p className="ot-death-headline">YOU HAVE DIED OF DYSENTERY</p>
          <div className="ot-tombstone">
            <img src={prof.img} alt={prof.label} className="ot-tomb-img" draggable={false} />
            <div className="ot-tomb-stone">
              <p>R.I.P.</p>
              <p className="bright">A {prof.label}</p>
              <p>from New Jersey</p>
              <p className="dim">&mdash;</p>
              <p className="dim">They never made it to</p>
              <p className="dim">the AI Literacy Summit.</p>
            </div>
          </div>
          <p className="ot-epitaph">"Gone, but not cleared from the cache."</p>
          <p className="ot-line dim">Final Score: 0</p>
          <p className="ot-line">&nbsp;</p>
          <p className="ot-blink ot-prompt">Press ENTER to try again</p>
          <button className="ot-exit" onClick={e => { e.stopPropagation(); go('sessions'); }}>ESC : EXIT</button>
        </div>
      )}
    </div>
  );

  return createPortal(game, document.body);
}
