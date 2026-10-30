import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { go } from '../App';
import '../aol.css';

/* ═══════════════════ Audio ═══════════════════ */
const SND = {
  dialup: '/audio/aol-dialup.mp3',
  signin: '/audio/aol-signin.mp3',
  recv:   '/audio/aol-recv.mp3',
  sent:   '/audio/aol-sent.mp3',
  bye:    '/audio/aol-bye.mp3',
};
const _au: HTMLAudioElement[] = [];
function stopAll() { _au.forEach(a => { a.pause(); a.currentTime = 0; }); _au.length = 0; }
function play(src: string) {
  const a = new Audio(src); a.volume = 0.6;
  a.addEventListener('ended', () => { const i = _au.indexOf(a); if (i >= 0) _au.splice(i, 1); });
  a.play().catch(() => {}); _au.push(a); return a;
}

/* ═══════════════════ Away messages ═══════════════════ */
const AWAY: { q: string; a: string }[] = [
  // Muhammad Ali
  { q: "Float like a butterfly, sting like a bee. Your hands can't hit what your eyes can't see.", a: 'Muhammad Ali' },
  { q: 'I am the greatest. I said that even before I knew I was.', a: 'Muhammad Ali' },
  { q: "Don't count the days. Make the days count.", a: 'Muhammad Ali' },
  { q: 'The man who has no imagination has no wings.', a: 'Muhammad Ali' },
  { q: 'Service to others is the rent you pay for your room here on earth.', a: 'Muhammad Ali' },
  { q: "He who is not courageous enough to take risks will accomplish nothing in life.", a: 'Muhammad Ali' },
  { q: "It's not bragging if you can back it up.", a: 'Muhammad Ali' },
  { q: 'Impossible is just a big word thrown around by small men who find it easier to live in the world they\'ve been given.', a: 'Muhammad Ali' },
  { q: "If my mind can conceive it, my heart can believe it \u2014 then I can achieve it.", a: 'Muhammad Ali' },
  { q: "I hated every minute of training, but I said, don't quit. Suffer now and live the rest of your life as a champion.", a: 'Muhammad Ali' },
  // Steve Jobs
  { q: 'Stay hungry. Stay foolish.', a: 'Steve Jobs' },
  { q: "Your time is limited, so don't waste it living someone else's life.", a: 'Steve Jobs' },
  { q: 'Innovation distinguishes between a leader and a follower.', a: 'Steve Jobs' },
  { q: 'The people who are crazy enough to think they can change the world are the ones who do.', a: 'Steve Jobs' },
  { q: 'Design is not just what it looks like. Design is how it works.', a: 'Steve Jobs' },
  { q: 'Have the courage to follow your heart and intuition.', a: 'Steve Jobs' },
  { q: "Being the richest man in the cemetery doesn't matter to me. Going to bed at night saying we've done something wonderful, that's what matters.", a: 'Steve Jobs' },
  { q: "I'm convinced that about half of what separates successful entrepreneurs from the non-successful ones is pure perseverance.", a: 'Steve Jobs' },
  // Bruce
  { q: 'Control what you can control.', a: 'Bruce' },
  // Originals (classic away message vibes)
  { q: "I'm not here right now. I'm somewhere else. Thinking about stuff.", a: '~ me ~' },
  { q: 'If you can read this, I stepped away from the computer and forgot to sign off. Again.', a: '~ me ~' },
  { q: "Life is what happens when you're busy checking your buddy list.", a: '~ me ~' },
  { q: "Currently at the NJ AI Literacy Summit pretending to understand what 'agentic' means.", a: '~ me ~' },
  { q: "brb. or not. who knows. it's 2026 and I still use away messages.", a: '~ me ~' },
  { q: 'In a meeting about a meeting that could have been an email about a memo.', a: '~ me ~' },
  { q: 'Went to go find myself. If I get back before I return, keep me here.', a: '~ me ~' },
  { q: "I'll be back in 5 minutes. If I'm not, read this message again.", a: '~ me ~' },
  { q: 'Out teaching robots to be kind. The robots are not cooperating.', a: '~ me ~' },
  { q: "I'm not ignoring you. I'm just prioritizing my absence.", a: '~ me ~' },
];

const BORDERS = [
  '~*~*~*~*~*~*~*~*~*~',
  '.:*:..:*:..:*:..:*:.',
  '\u2605\u00b7.\u00b7\u00b4\u00af`\u00b7.\u00b7\u2605\u00b7.\u00b7\u00b4\u00af`\u00b7.\u00b7\u2605',
  '\u2022\u00b0\u00a4*(\u00af`\u2605\u00b4\u00af)*\u00a4\u00b0\u2022',
  '-*-*-*-*-*-*-*-*-*-',
  '\u2661 \u2661 \u2661 \u2661 \u2661 \u2661 \u2661 \u2661',
  '\u00b7:*\u00a8\u00a8*:\u00b7. \u00b7:*\u00a8\u00a8*:\u00b7.',
  '\u00bb-(\u00af`\u00b7.\u00b7\u00b4\u00af)->',
];
const ACOLORS = ['#6633cc', '#cc3399', '#3366cc', '#009999', '#cc6600', '#663399', '#339966', '#cc3366'];

/* ═══════════════════ Component ═══════════════════ */
type Phase = 'login' | 'connecting' | 'chat';
interface Msg { from: 'james' | 'user' | 'sys'; text: string; time: string; away?: { q: string; a: string; border: string; color: string } }

function now() { return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }); }

export default function AOL() {
  const [phase, setPhase] = useState<Phase>('login');
  const [name, setName] = useState('');
  const [connectStep, setConnectStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [jamesOn, setJamesOn] = useState(false);
  const [typing, setTyping] = useState(false);

  const shuffled = useRef<number[]>([]);
  const awayIdx = useRef(0);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.getElementById('aol-font')) {
      const l = document.createElement('link'); l.id = 'aol-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    const p = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = p; stopAll(); };
  }, []);

  // Auto-scroll chat
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, typing]);

  // Shuffle away messages
  useEffect(() => {
    shuffled.current = [...Array(AWAY.length).keys()].sort(() => Math.random() - 0.5);
    awayIdx.current = 0;
  }, []);

  const getAway = useCallback(() => {
    if (awayIdx.current >= shuffled.current.length) {
      shuffled.current = [...Array(AWAY.length).keys()].sort(() => Math.random() - 0.5);
      awayIdx.current = 0;
    }
    const msg = AWAY[shuffled.current[awayIdx.current++]];
    return { ...msg, border: BORDERS[Math.floor(Math.random() * BORDERS.length)], color: ACOLORS[Math.floor(Math.random() * ACOLORS.length)] };
  }, []);

  /* ── Sign on ── */
  const signOn = useCallback(() => {
    if (!name.trim()) return;
    setPhase('connecting');
    setConnectStep(0); setProgress(0);
    stopAll();
    play(SND.dialup);

    // 30s dialup: 3 phases of ~10s each
    let p = 0;
    const iv = setInterval(() => {
      p += 1.1;
      setProgress(Math.min(p, 100));
      if (p < 33) setConnectStep(1);
      else if (p < 66) setConnectStep(2);
      else setConnectStep(3);
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          setPhase('chat');
          // James signs in after 2s
          setTimeout(() => {
            play(SND.signin);
            setJamesOn(true);
            // James sends first message after 1.5s
            setTimeout(() => {
              play(SND.recv);
              setMessages([{ from: 'james', text: `Hey ${name.trim()}! How are you enjoying the AI Summit so far?? 😄`, time: now() }]);
            }, 1500);
          }, 2000);
        }, 500);
      }
    }, 330);

    return () => clearInterval(iv);
  }, [name]);

  /* ── Send message ── */
  const sendMsg = useCallback(() => {
    const txt = input.trim();
    if (!txt) return;
    setInput('');
    play(SND.sent);
    setMessages(m => [...m, { from: 'user', text: txt, time: now() }]);

    // James "typing" then auto-respond
    setTimeout(() => setTyping(true), 500);
    setTimeout(() => {
      setTyping(false);
      play(SND.recv);
      const aw = getAway();
      setMessages(m => [...m, { from: 'james', text: '', time: now(), away: aw }]);
    }, 2200);
  }, [input, getAway]);

  const handleKey = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); sendMsg(); } }, [sendMsg]);
  const handleLoginKey = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter') signOn(); }, [signOn]);

  /* ── Exit ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { stopAll(); play(SND.bye); setTimeout(() => go('sessions'), 800); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* ═══════════════════ RENDER ═══════════════════ */
  const ui = (
    <div className="aol">
      {/* ── LOGIN ── */}
      {phase === 'login' && (
        <div className="aol-login-bg">
          <div className="aol-login-box">
            <div className="aol-logo">
              <div className="aol-triangle" />
              <div className="aol-logo-text"><b>AI Summit</b> Online</div>
            </div>
            <div className="aol-form">
              <label>Screen Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleLoginKey}
                placeholder="Enter your name" autoFocus maxLength={20} className="aol-input" />
              <button className="aol-btn aol-btn-blue" onClick={signOn} disabled={!name.trim()}>Sign On</button>
            </div>
            <div className="aol-login-footer">Version 5.0 &middot; NJ AI Summit Edition</div>
          </div>
          <button className="aol-esc" onClick={() => go('sessions')}>ESC: Exit</button>
        </div>
      )}

      {/* ── CONNECTING (3-phase modem screen images) ── */}
      {phase === 'connecting' && (
        <div className="aol-login-bg">
          <img
            src={`/images/aol-modem-${connectStep || 1}.png`}
            alt={`Connecting phase ${connectStep}`}
            className="aol-modem-img"
            key={connectStep}
          />
        </div>
      )}

      {/* ── CHAT DESKTOP ── */}
      {phase === 'chat' && (
        <div className="aol-desktop">
          {/* Buddy List */}
          <div className="aol-win aol-buddylist">
            <div className="aol-titlebar"><span>Buddy List</span><div className="aol-tb-btns"><span>&ndash;</span><span>&#9744;</span><span>&times;</span></div></div>
            <div className="aol-win-body">
              <div className="aol-bl-group">Buddies (1/2)</div>
              <div className="aol-buddy away"><span className="aol-dot yellow" />MarcC2026 <i>(Away)</i></div>
              {jamesOn && <div className="aol-buddy online"><span className="aol-dot green" />JSantana26</div>}
              <div className="aol-bl-group" style={{ marginTop: 12 }}>Offline (0)</div>
            </div>
          </div>

          {/* Chat Window */}
          {messages.length > 0 && (
            <div className="aol-win aol-chatwin">
              <div className="aol-titlebar"><span>JSantana26 - Instant Message</span><div className="aol-tb-btns"><span>&ndash;</span><span>&#9744;</span><span>&times;</span></div></div>
              <div className="aol-win-body aol-chat-body">
                <div className="aol-chat-area" ref={chatRef}>
                  {messages.map((m, i) => (
                    <div key={i} className={`aol-msg aol-msg-${m.from}`}>
                      {m.from === 'sys' ? (
                        <div className="aol-sys">{m.text}</div>
                      ) : m.away ? (
                        <div className="aol-away-wrap">
                          <span className="aol-msg-name james">JSantana26</span> <span className="aol-msg-time">({m.time})</span>
                          <div className="aol-away" style={{ color: m.away.color }}>
                            <div className="aol-away-border">{m.away.border}</div>
                            <div className="aol-away-quote">"{m.away.q}"</div>
                            <div className="aol-away-attr">- {m.away.a}</div>
                            <div className="aol-away-border">{m.away.border}</div>
                          </div>
                          <div className="aol-away-note">[Auto-Response from JSantana26]: JSantana26 is away.</div>
                        </div>
                      ) : (
                        <div>
                          <span className={`aol-msg-name ${m.from}`}>{m.from === 'james' ? 'JSantana26' : name.trim()}</span>{' '}
                          <span className="aol-msg-time">({m.time})</span>: {m.text}
                        </div>
                      )}
                    </div>
                  ))}
                  {typing && <div className="aol-typing">JSantana26 is typing...</div>}
                </div>
                <div className="aol-chat-bottom">
                  <input className="aol-chat-input" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey} placeholder="Type a message..." autoFocus />
                  <button className="aol-btn aol-btn-send" onClick={sendMsg}>Send</button>
                </div>
              </div>
            </div>
          )}

          <button className="aol-esc desktop" onClick={() => { stopAll(); play(SND.bye); setTimeout(() => go('sessions'), 800); }}>Sign Off (ESC)</button>
        </div>
      )}
    </div>
  );

  return createPortal(ui, document.body);
}
