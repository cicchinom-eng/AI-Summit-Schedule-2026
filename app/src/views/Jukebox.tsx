import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { go } from '../App';
import '../jukebox.css';

/* ═══════════════════ Songs ═══════════════════ */
const SONGS = [
  { title: 'Chicken Fried', artist: 'James Santana', src: '/audio/jb-chicken-fried.mp3', year: '2008', original: 'Zac Brown Band' },
  { title: 'Stand By Me', artist: 'James Santana', src: '/audio/jb-stand-by-me.mp3', year: '1961', original: 'Ben E. King' },
  { title: 'Summer of \'69', artist: 'James Santana', src: '/audio/jb-summer-of-69.mp3', year: '1985', original: 'Bryan Adams' },
  { title: 'Time To Say Goodbye', artist: 'James Santana', src: '/audio/jb-time-to-say-goodbye.mp3', year: '1996', original: 'Andrea Bocelli' },
  { title: 'Wagon Wheel', artist: 'James Santana', src: '/audio/jb-wagon-wheel.mp3', year: '2004', original: 'Old Crow Medicine Show' },
];

type PlayerType = 'jukebox' | 'walkman' | 'winamp' | 'ipod' | 'myspace';
type Phase = 'intro' | 'select' | 'player';

/* ═══════════════════ Audio engine ═══════════════════ */
let _audio: HTMLAudioElement | null = null;

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ═══════════════════ SVG Icons ═══════════════════ */
function PlayIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="6,3 20,12 6,21" /></svg>; }
function PauseIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><rect x="5" y="3" width="4" height="18" /><rect x="15" y="3" width="4" height="18" /></svg>; }
function SkipFwdIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="4,3 14,12 4,21" /><polygon points="13,3 23,12 13,21" /></svg>; }
function SkipBackIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="20,3 10,12 20,21" /><polygon points="11,3 1,12 11,21" /></svg>; }

/* ═══════════════════ Component ═══════════════════ */
export default function Jukebox() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [playerType, setPlayerType] = useState<PlayerType>('jukebox');
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [introStep, setIntroStep] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  // Fake spectrum analyzer for Winamp (reliable across all browsers)
  const [specBars, setSpecBars] = useState<number[]>(Array(20).fill(0));

  const track = SONGS[trackIdx];

  /* ── Font ── */
  useEffect(() => {
    if (!document.getElementById('jb-font')) {
      const l = document.createElement('link'); l.id = 'jb-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Luckiest+Guy&family=Pacifico&family=Inter:wght@400;600;700&family=Comic+Neue:wght@400;700&family=VT323&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  /* ── Lock scroll ── */
  useEffect(() => {
    const p = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = p;
      if (_audio) { _audio.pause(); _audio = null; }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Intro animation ── */
  useEffect(() => {
    if (phase !== 'intro') return;
    const t1 = setTimeout(() => setIntroStep(1), 600);
    const t2 = setTimeout(() => setIntroStep(2), 2200);
    const t3 = setTimeout(() => setIntroStep(3), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  /* ── Audio setup ── */
  const loadTrack = useCallback((idx: number, autoplay: boolean) => {
    if (_audio) { _audio.pause(); }
    const a = new Audio(SONGS[idx].src);
    a.volume = 0.75;
    _audio = a;
    audioRef.current = a;
    a.addEventListener('loadedmetadata', () => setDuration(a.duration));
    a.addEventListener('ended', () => {
      const next = (idx + 1) % SONGS.length;
      setTrackIdx(next);
      loadTrack(next, true);
    });
    if (autoplay) {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, []);

  /* ── Fake spectrum analyzer for Winamp (fun animated bars) ── */
  useEffect(() => {
    if (playerType !== 'winamp' || phase !== 'player') return;
    let alive = true;
    const seeds = Array.from({ length: 20 }, () => Math.random() * 100);
    const update = () => {
      if (!alive) return;
      if (playing) {
        const t = Date.now() / 1000;
        const bars = seeds.map((seed, i) => {
          const base = 0.2 + Math.sin(t * (1.5 + i * 0.3) + seed) * 0.3;
          const bounce = Math.abs(Math.sin(t * (2 + i * 0.5) + seed * 2)) * 0.5;
          return Math.min(1, base + bounce + Math.random() * 0.15);
        });
        setSpecBars(bars);
      } else {
        setSpecBars(prev => prev.map(v => Math.max(0, v - 0.05)));
      }
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  }, [playerType, phase, playing]);

  /* ── Time update loop ── */
  useEffect(() => {
    const iv = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 250);
    return () => clearInterval(iv);
  }, []);

  /* ── Playback controls ── */
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, []);

  const nextTrack = useCallback(() => {
    const next = (trackIdx + 1) % SONGS.length;
    setTrackIdx(next);
    loadTrack(next, true);
  }, [trackIdx, loadTrack]);

  const prevTrack = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prev = (trackIdx - 1 + SONGS.length) % SONGS.length;
    setTrackIdx(prev);
    loadTrack(prev, true);
  }, [trackIdx, loadTrack]);

  const scrub = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const bar = scrubRef.current;
    if (!bar || !audioRef.current) return;
    const doScrub = (clientX: number) => {
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      audioRef.current!.currentTime = pct * (audioRef.current!.duration || 0);
      setCurrentTime(audioRef.current!.currentTime);
    };
    doScrub(e.clientX);
    // Allow drag scrubbing
    const onMove = (ev: PointerEvent) => doScrub(ev.clientX);
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  const selectPlayer = useCallback((type: PlayerType) => {
    setPlayerType(type);
    setPhase('player');
    loadTrack(0, true);
  }, [loadTrack]);

  const goBack = useCallback(() => {
    if (phase === 'player') {
      if (_audio) { _audio.pause(); _audio = null; }
      setPlaying(false);
      setPhase('select');
    } else {
      go('sessions');
    }
  }, [phase]);

  /* ── Keys ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { goBack(); return; }
      if (phase === 'intro' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setPhase('select'); return; }
      if (phase === 'player') {
        if (e.key === ' ') { e.preventDefault(); togglePlay(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); nextTrack(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prevTrack(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [phase, goBack, togglePlay, nextTrack, prevTrack]);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ═══════════════════ PLAYER RENDERERS ═══════════════════ */

  /* ─────────────────── 1. JUKEBOX (1950s Diner) ─────────────────── */
  const renderJukeboxPlayer = () => (
    <div className="jb-jukebox-player">
      <div className="jb-juke-body">
        {/* Wood side panels */}
        <div className="jb-juke-wood-left" />
        <div className="jb-juke-wood-right" />

        {/* Chrome top trim */}
        <div className="jb-juke-chrome-top" />

        {/* Arch with chasing multicolor LEDs */}
        <div className="jb-juke-arch">
          <div className="jb-juke-lights">
            {Array.from({ length: 44 }, (_, i) => {
              const colors = ['#ff2222','#3366ff','#00cc44','#FFD700','#ff44aa','#ff8800','#aa22ff','#00ddff'];
              const color = colors[i % colors.length];
              return (
                <i key={i} className="jb-juke-bulb" style={{
                  animationDelay: `${i * 0.08}s`,
                  left: `${(i / 43) * 100}%`,
                  background: color,
                  boxShadow: `0 0 6px ${color}, 0 0 14px ${color}, 0 0 28px ${color}50`,
                }} />
              );
            })}
          </div>

          {/* Bubble tubes */}
          <div className="jb-juke-bubble-tube jb-juke-bubble-left">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="jb-juke-bubble" style={{ animationDelay: `${i * 0.5}s`, left: `${20 + Math.random() * 60}%` }} />
            ))}
          </div>
          <div className="jb-juke-bubble-tube jb-juke-bubble-right">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="jb-juke-bubble" style={{ animationDelay: `${i * 0.45 + 0.2}s`, left: `${20 + Math.random() * 60}%` }} />
            ))}
          </div>

          {/* Glass dome with vinyl */}
          <div className="jb-juke-glass">
            <div className="jb-juke-glass-reflection" />
            <div className={`jb-juke-vinyl ${playing ? 'spinning' : ''}`}>
              {/* Grooves */}
              <div className="jb-juke-groove jb-juke-groove-1" />
              <div className="jb-juke-groove jb-juke-groove-2" />
              <div className="jb-juke-groove jb-juke-groove-3" />
              <div className="jb-juke-groove jb-juke-groove-4" />
              <div className="jb-juke-label">
                <span className="jb-juke-label-text">{track.title.substring(0, 2).toUpperCase()}</span>
                <span className="jb-juke-label-ring" />
              </div>
            </div>
          </div>
        </div>

        {/* Now Playing info */}
        <div className="jb-juke-info">
          <div className="jb-juke-now">NOW PLAYING</div>
          <div className="jb-juke-title">{track.title}</div>
          <div className="jb-juke-artist">Covered by {track.artist}</div>
          <div className="jb-juke-original">Originally by {track.original} ({track.year})</div>
        </div>

        {/* Song buttons with chrome bezels */}
        <div className="jb-juke-songlist">
          {SONGS.map((s, i) => (
            <button key={i} className={`jb-juke-song ${i === trackIdx ? 'active' : ''}`}
              onClick={() => { setTrackIdx(i); loadTrack(i, true); }}>
              <span className="jb-juke-code">{String.fromCharCode(65 + i)}1</span>
              <span className="jb-juke-sname">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Chrome transport controls */}
        <div className="jb-juke-controls">
          <button className="jb-juke-ctrl-btn" onClick={prevTrack}><SkipBackIcon /></button>
          <button className="jb-juke-ctrl-btn jb-juke-play" onClick={togglePlay}>{playing ? <PauseIcon /> : <PlayIcon />}</button>
          <button className="jb-juke-ctrl-btn" onClick={nextTrack}><SkipFwdIcon /></button>
        </div>

        {/* Scrub bar */}
        <div className="jb-scrub-wrap" ref={scrubRef} onPointerDown={scrub}>
          <div className="jb-scrub-bar"><div className="jb-scrub-fill" style={{ width: `${pct}%` }} /></div>
          <div className="jb-scrub-times"><span>{fmt(currentTime)}</span><span>{fmt(duration)}</span></div>
        </div>
      </div>
    </div>
  );

  /* ─────────────────── 2. WALKMAN (1980s Sony TPS-L2) ─────────────────── */
  const renderWalkman = () => (
    <div className="jb-walkman-player">
      <div className="jb-wm-body">
        {/* Brushed metal overlay */}
        <div className="jb-wm-brushed" />

        {/* Headphone jack */}
        <div className="jb-wm-jack">
          <div className="jb-wm-jack-hole" />
          <span className="jb-wm-jack-label">PHONES</span>
        </div>

        {/* WALKMAN brand text */}
        <div className="jb-wm-brand">WALKMAN</div>
        <div className="jb-wm-sony">SONY</div>

        {/* Cassette window */}
        <div className="jb-wm-window">
          {/* Cassette shell outline */}
          <div className="jb-wm-cassette-shell">
            <div className="jb-wm-cassette-top" />
            {/* Left reel (spins faster) */}
            <div className={`jb-wm-reel jb-wm-reel-l ${playing ? 'spinning-fast' : ''}`}>
              <div className="jb-wm-spoke" />
              <div className="jb-wm-spoke jb-wm-spoke-2" />
              <div className="jb-wm-spoke jb-wm-spoke-3" />
              <div className="jb-wm-reel-hub" />
            </div>
            {/* Right reel (spins slower) */}
            <div className={`jb-wm-reel jb-wm-reel-r ${playing ? 'spinning-slow' : ''}`}>
              <div className="jb-wm-spoke" />
              <div className="jb-wm-spoke jb-wm-spoke-2" />
              <div className="jb-wm-spoke jb-wm-spoke-3" />
              <div className="jb-wm-reel-hub" />
            </div>
            {/* Tape threading between reels */}
            <div className="jb-wm-tape" />
            <div className="jb-wm-tape-path-top" />
            <div className="jb-wm-tape-path-bottom" />
          </div>
          {/* Cassette label */}
          <div className="jb-wm-tape-label">
            <div className="jb-wm-tape-title">{track.title}</div>
            <div className="jb-wm-tape-artist">{track.artist}</div>
          </div>
        </div>

        {/* LCD display */}
        <div className="jb-wm-lcd">
          <div className="jb-wm-lcd-track">TRACK {trackIdx + 1} / {SONGS.length}</div>
          <div className="jb-wm-lcd-title">{track.title}</div>
          <div className="jb-wm-lcd-time">{fmt(currentTime)} / {fmt(duration)}</div>
          <div className="jb-wm-lcd-eq">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="jb-wm-lcd-bar" style={{
                height: playing ? `${30 + Math.sin(Date.now() / 300 + i) * 25 + Math.random() * 20}%` : '10%'
              }} />
            ))}
          </div>
        </div>

        {/* Side controls: MEGA BASS + Volume */}
        <div className="jb-wm-side-controls">
          <div className="jb-wm-mega-bass">
            <span className="jb-wm-mb-label">MEGA BASS</span>
            <div className="jb-wm-mb-switch">
              <div className="jb-wm-mb-toggle" />
            </div>
          </div>
          <div className="jb-wm-volume">
            <span className="jb-wm-vol-label">VOL</span>
            <div className="jb-wm-vol-track">
              <div className="jb-wm-vol-thumb" />
            </div>
          </div>
        </div>

        {/* Transport buttons */}
        <div className="jb-wm-buttons">
          <button className="jb-wm-btn" onClick={prevTrack} title="Rewind">
            <span className="jb-wm-btn-icon">&#9664;&#9664;</span>
          </button>
          <button className="jb-wm-btn" onClick={() => { if(audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; setPlaying(false); setCurrentTime(0); } }} title="Stop">
            <span className="jb-wm-btn-icon">&#9632;</span>
          </button>
          <button className="jb-wm-btn jb-wm-play" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
            <span className="jb-wm-btn-icon">{playing ? '&#9646;&#9646;' : '&#9654;'}</span>
          </button>
          <button className="jb-wm-btn" onClick={nextTrack} title="Fast Forward">
            <span className="jb-wm-btn-icon">&#9654;&#9654;</span>
          </button>
          <button className="jb-wm-btn" onClick={togglePlay} title="Pause">
            <span className="jb-wm-btn-icon">&#9646;&#9646;</span>
          </button>
        </div>

        {/* Scrub bar */}
        <div className="jb-scrub-wrap" ref={scrubRef} onPointerDown={scrub}>
          <div className="jb-scrub-bar jb-wm-scrub"><div className="jb-scrub-fill jb-wm-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        {/* Song list */}
        <div className="jb-wm-songlist">
          {SONGS.map((s, i) => (
            <button key={i} className={`jb-wm-song ${i === trackIdx ? 'active' : ''}`}
              onClick={() => { setTrackIdx(i); loadTrack(i, true); }}>
              {i + 1}. {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─────────────────── 3. WINAMP (late 1990s) ─────────────────── */
  const renderWinamp = () => (
    <div className="jb-winamp-player">
      <div className="jb-wa-window">
        {/* Title bar */}
        <div className="jb-wa-titlebar">
          <div className="jb-wa-title-left">
            <span className="jb-wa-title-bolt" />
            <span className="jb-wa-title-text">WINAMP</span>
            <span className="jb-wa-title-version">2.95</span>
          </div>
          <div className="jb-wa-tb-btns">
            <span className="jb-wa-tb-btn">_</span>
            <span className="jb-wa-tb-btn jb-wa-tb-close">x</span>
          </div>
        </div>

        {/* Main display area */}
        <div className="jb-wa-display">
          {/* Left: spectrum analyzer */}
          <div className="jb-wa-spectrum">
            {Array.from({ length: 28 }, (_, i) => {
              const val = specBars[Math.floor(i * specBars.length / 28)] || 0;
              const totalSegs = 16;
              const litSegs = Math.max(1, Math.round(val * totalSegs));
              return (
                <div key={i} className="jb-wa-spec-col">
                  {Array.from({ length: totalSegs }, (_, s) => {
                    const segIdx = totalSegs - 1 - s;
                    const isLit = segIdx < litSegs;
                    let segColor = '#00cc00';
                    if (segIdx >= totalSegs * 0.75) segColor = '#ff2222';
                    else if (segIdx >= totalSegs * 0.5) segColor = '#dddd00';
                    else segColor = '#00cc00';
                    return (
                      <div key={s} className={`jb-wa-spec-seg ${isLit ? 'lit' : ''}`}
                        style={{ background: isLit ? segColor : '#0a1a0a' }} />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Right: track info */}
          <div className="jb-wa-track-info">
            <div className="jb-wa-time-display">
              <span className="jb-wa-time-big">{fmt(currentTime)}</span>
            </div>
            <div className="jb-wa-meta-row">
              <span className="jb-wa-bitrate">128</span>
              <span className="jb-wa-meta-label">kbps</span>
              <span className="jb-wa-bitrate">44</span>
              <span className="jb-wa-meta-label">kHz</span>
              <span className="jb-wa-stereo-badge">STEREO</span>
            </div>
            <div className="jb-wa-scroll">
              <span className="jb-wa-marquee">{trackIdx + 1}. {track.artist} - {track.title} *** downloaded via Napster ;) *** totally_legal_mp3.exe ***</span>
            </div>
          </div>
        </div>

        {/* Volume + Balance sliders */}
        <div className="jb-wa-sliders-row">
          <div className="jb-wa-slider-group">
            <span className="jb-wa-slider-label">VOL</span>
            <div className="jb-wa-slider-track">
              <div className="jb-wa-slider-fill" style={{ width: '75%' }} />
              <div className="jb-wa-slider-thumb" style={{ left: '75%' }} />
            </div>
          </div>
          <div className="jb-wa-slider-group">
            <span className="jb-wa-slider-label">BAL</span>
            <div className="jb-wa-slider-track">
              <div className="jb-wa-slider-fill jb-wa-bal-fill" style={{ width: '50%' }} />
              <div className="jb-wa-slider-thumb" style={{ left: '50%' }} />
            </div>
          </div>
          <button className="jb-wa-eq-btn">EQ</button>
        </div>

        {/* Seek bar */}
        <div className="jb-wa-scrub" ref={scrubRef} onPointerDown={scrub}>
          <div className="jb-wa-scrub-bg">
            <div className="jb-wa-scrub-fill" style={{ width: `${pct}%` }} />
            <div className="jb-wa-scrub-thumb" style={{ left: `${pct}%` }} />
          </div>
        </div>

        {/* Transport controls */}
        <div className="jb-wa-controls">
          <button className="jb-wa-ctrl" onClick={prevTrack} title="Previous">
            <span>&#9664;&#9664;</span>
          </button>
          <button className="jb-wa-ctrl jb-wa-ctrl-play" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
            <span>{playing ? '&#9646;&#9646;' : '&#9654;'}</span>
          </button>
          <button className="jb-wa-ctrl" onClick={() => { if(audioRef.current) { audioRef.current.pause(); setPlaying(false); } }} title="Pause">
            <span>&#9646;&#9646;</span>
          </button>
          <button className="jb-wa-ctrl jb-wa-ctrl-stop" onClick={() => { if(audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; setPlaying(false); setCurrentTime(0); } }} title="Stop">
            <span>&#9632;</span>
          </button>
          <button className="jb-wa-ctrl" onClick={nextTrack} title="Next">
            <span>&#9654;&#9654;</span>
          </button>
        </div>

        {/* Napster badge */}
        <div className="jb-wa-napster">
          <div className="jb-wa-napster-icon">
            <svg viewBox="0 0 40 40" width="32" height="32">
              {/* Cat head */}
              <circle cx="20" cy="18" r="10" fill="#000" />
              {/* Ears */}
              <polygon points="10,12 6,2 16,8" fill="#000" />
              <polygon points="30,12 34,2 24,8" fill="#000" />
              {/* Face */}
              <circle cx="20" cy="18" r="7" fill="#fff" />
              {/* Eyes */}
              <circle cx="17" cy="16" r="1.8" fill="#000" />
              <circle cx="23" cy="16" r="1.8" fill="#000" />
              <circle cx="17.4" cy="15.6" r="0.5" fill="#fff" />
              <circle cx="23.4" cy="15.6" r="0.5" fill="#fff" />
              {/* Nose */}
              <polygon points="20,19 18.5,20.5 21.5,20.5" fill="#ff6699" />
              {/* Mouth */}
              <path d="M17 21.5 Q20 24 23 21.5" stroke="#000" strokeWidth="0.7" fill="none" />
              {/* Headphones */}
              <path d="M8,16 Q8,4 20,4 Q32,4 32,16" stroke="#333" strokeWidth="3" fill="none" />
              <rect x="5" y="13" width="6" height="8" rx="2" fill="#333" />
              <rect x="29" y="13" width="6" height="8" rx="2" fill="#333" />
              <rect x="6" y="14" width="4" height="6" rx="1.5" fill="#666" />
              <rect x="30" y="14" width="4" height="6" rx="1.5" fill="#666" />
              {/* Body hint */}
              <ellipse cx="20" cy="34" rx="8" ry="6" fill="#000" />
            </svg>
          </div>
          <div className="jb-wa-napster-info">
            <span className="jb-wa-napster-label">Downloaded via Napster</span>
            <span className="jb-wa-napster-badge">FREE MP3 --- 100% LEGAL* (*not legal)</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="jb-wa-tagline">it really whips the llama's ass!</div>

        {/* Playlist */}
        <div className="jb-wa-playlist">
          <div className="jb-wa-pl-title">
            <span>WINAMP PLAYLIST EDITOR</span>
            <span className="jb-wa-pl-count">{SONGS.length} items</span>
          </div>
          <div className="jb-wa-pl-list">
            {SONGS.map((s, i) => (
              <button key={i} className={`jb-wa-pl-item ${i === trackIdx ? 'active' : ''}`}
                onClick={() => { setTrackIdx(i); loadTrack(i, true); }}>
                <span className="jb-wa-pl-num">{i + 1}.</span>
                <span className="jb-wa-pl-info">{s.artist} - {s.title}</span>
                <span className="jb-wa-pl-dur">({s.year})</span>
              </button>
            ))}
          </div>
          <div className="jb-wa-pl-footer">{SONGS.length} tracks &middot; it really whips the llama's ass</div>
        </div>
      </div>
    </div>
  );

  /* ─────────────────── 4. iPod (2000s) ─────────────────── */
  const renderIPod = () => (
    <div className="jb-ipod-player">
      <div className="jb-ipod-body">
        {/* Shine/reflection overlay */}
        <div className="jb-ipod-shine" />

        <div className="jb-ipod-screen">
          <div className="jb-ipod-status">
            <span>iPod</span>
            <span>{playing ? '&#9654;' : '&#9646;&#9646;'}</span>
            <span>&#x1F50B;</span>
          </div>
          {/* Album art placeholder with warm gradient */}
          <div className="jb-ipod-art">
            <div className="jb-ipod-cover-art">
              <div className="jb-ipod-cover-gradient" />
              <div className="jb-ipod-cover-note">&#9835;</div>
              <div className="jb-ipod-cover-title">{track.title}</div>
            </div>
          </div>
          <div className="jb-ipod-track-name">{track.title}</div>
          <div className="jb-ipod-track-artist">{track.artist}</div>
          <div className="jb-ipod-progress">
            <span>{fmt(currentTime)}</span>
            <div className="jb-ipod-prog-bar" ref={scrubRef} onPointerDown={scrub}>
              <div className="jb-ipod-prog-fill" style={{ width: `${pct}%` }} />
              <div className="jb-ipod-prog-diamond" style={{ left: `${pct}%` }} />
            </div>
            <span>-{fmt(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        {/* Click wheel with concentric groove marks */}
        <div className="jb-ipod-wheel" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const dist = Math.sqrt(x * x + y * y);
            if (dist < rect.width * 0.2) { togglePlay(); return; }
            const angle = Math.atan2(y, x) * 180 / Math.PI;
            if (angle > -45 && angle < 45) nextTrack();
            else if (angle > 135 || angle < -135) prevTrack();
          }}>
          <div className="jb-ipod-wheel-ring">
            {/* Concentric groove marks */}
            <div className="jb-ipod-groove jb-ipod-groove-1" />
            <div className="jb-ipod-groove jb-ipod-groove-2" />
            <div className="jb-ipod-groove jb-ipod-groove-3" />
            <div className="jb-ipod-groove jb-ipod-groove-4" />
            <span className="jb-ipod-wl-menu">MENU</span>
            <span className="jb-ipod-wl-next">&#9654;&#9654;</span>
            <span className="jb-ipod-wl-prev">&#9664;&#9664;</span>
            <span className="jb-ipod-wl-play">&#9654;&#9646;&#9646;</span>
          </div>
          <div className="jb-ipod-wheel-center" onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
        </div>

        {/* Mobile fallback */}
        <div className="jb-ipod-mobile-ctrl">
          <button onClick={prevTrack}>&#9664;&#9664; Prev</button>
          <button className="jb-ipod-mc-play" onClick={togglePlay}>{playing ? '&#9646;&#9646; Pause' : '&#9654; Play'}</button>
          <button onClick={nextTrack}>Next &#9654;&#9654;</button>
        </div>

        {/* Song list */}
        <div className="jb-ipod-songlist">
          {SONGS.map((s, i) => (
            <button key={i} className={`jb-ipod-song ${i === trackIdx ? 'active' : ''}`}
              onClick={() => { setTrackIdx(i); loadTrack(i, true); }}>
              <span className="jb-ipod-s-title">{s.title}</span>
              <span className="jb-ipod-s-artist">{s.artist}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─────────────────── 5. MYSPACE (mid-2000s) ─────────────────── */
  const renderMySpace = () => (
    <div className="jb-myspace-player">
      <div className="jb-ms-page">
        <div className="jb-ms-header">
          <div className="jb-ms-logo">MySpace</div>
          <div className="jb-ms-nav">
            <span>Home</span><span>Browse</span><span>Search</span><span>Invite</span><span>Mail</span><span>Blog</span><span>Forum</span><span>Groups</span>
          </div>
        </div>
        <div className="jb-ms-profile">
          <div className="jb-ms-left">
            {/* Avatar with James's photo and sparkles */}
            <div className="jb-ms-avatar">
              <img src="/images/punchout-james.png" alt="James Santana" className="jb-ms-avatar-img" />
              {/* Animated sparkle dots */}
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className="jb-ms-sparkle" style={{
                  top: `${10 + Math.random() * 80}%`,
                  left: `${-10 + Math.random() * 120}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                }} />
              ))}
            </div>
            <div className="jb-ms-username">"James"</div>
            <div className="jb-ms-status">
              <span className="jb-ms-status-dot" />
              Online Now!
            </div>
            <div className="jb-ms-details">
              <p>Male, 100 years old</p>
              <p>New Jersey, US</p>
              <p>Last Login: today</p>
            </div>
            <div className="jb-ms-mood">Mood: musical &#127925;</div>

            {/* Visitor counter */}
            <div className="jb-ms-visitor-counter">
              <div className="jb-ms-vc-label">Profile Views:</div>
              <div className="jb-ms-vc-digits">
                {'004219'.split('').map((d, i) => (
                  <span key={i} className="jb-ms-vc-digit">{d}</span>
                ))}
              </div>
            </div>

            <div className="jb-ms-friends">
              <div className="jb-ms-friends-title">James's Top Friends</div>
              <div className="jb-ms-friends-grid">
                <div className="jb-ms-friend"><div className="jb-ms-friend-av">T</div><span>Tom</span></div>
                <div className="jb-ms-friend"><div className="jb-ms-friend-av">M</div><span>Marc</span></div>
                <div className="jb-ms-friend"><div className="jb-ms-friend-av">K</div><span>Kaiz</span></div>
              </div>
            </div>
          </div>
          <div className="jb-ms-right">
            <div className="jb-ms-blurb">
              <h3>About Me:</h3>
              <p>just a guy who loves music, education, and AI literacy!! check out my songs below &#128071;&#128071;&#128071; pls dont steal my CSS &#128556;</p>
              <p className="jb-ms-blurb-extra">if u like my music add me!! i accept all friend requests lol</p>
            </div>

            {/* Currently Playing blinking text */}
            <div className="jb-ms-currently-playing">&#9835; Currently Playing &#9835;</div>

            {/* Music player widget */}
            <div className="jb-ms-music-player">
              <div className="jb-ms-mp-header">
                <div className="jb-ms-mp-title">James's Music</div>
                <div className="jb-ms-mp-auto">[Auto-Play is ON... you're welcome]</div>
              </div>
              <div className="jb-ms-mp-now">
                <div className={`jb-ms-mp-vinyl ${playing ? 'spinning' : ''}`}>
                  <div className="jb-ms-mp-vinyl-label">{track.title.charAt(0)}</div>
                </div>
                <div className="jb-ms-mp-info">
                  <div className="jb-ms-mp-track">{track.title}</div>
                  <div className="jb-ms-mp-artist">{track.artist}</div>
                  <div className="jb-ms-mp-original">orig. {track.original}</div>
                </div>
              </div>
              <div className="jb-ms-mp-controls">
                <button onClick={prevTrack}>&#9664;&#9664;</button>
                <button className="jb-ms-mp-play" onClick={togglePlay}>{playing ? '&#9646;&#9646;' : '&#9654;'}</button>
                <button onClick={nextTrack}>&#9654;&#9654;</button>
              </div>
              <div className="jb-ms-mp-scrub" ref={scrubRef} onPointerDown={scrub}>
                <div className="jb-ms-mp-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="jb-ms-mp-time">{fmt(currentTime)} / {fmt(duration)}</div>
              <div className="jb-ms-mp-list">
                {SONGS.map((s, i) => (
                  <button key={i} className={`jb-ms-mp-item ${i === trackIdx ? 'active' : ''}`}
                    onClick={() => { setTrackIdx(i); loadTrack(i, true); }}>
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments section - expanded with more entries */}
            <div className="jb-ms-comments">
              <h3>Comments:</h3>
              <div className="jb-ms-comment"><b>Tom:</b> hey welcome to myspace!! - Tom</div>
              <div className="jb-ms-comment"><b>Marc:</b> great summit today!! ur music is fire</div>
              <div className="jb-ms-comment"><b>Kaiz:</b> please change ur autoplay song it's been 3 hours</div>
              <div className="jb-ms-comment"><b>xXDJ_MasterXx:</b> yo this profile is SICK!! how do you get the sparkles?? teach me pls</div>
              <div className="jb-ms-comment"><b>~*SaRaH*~:</b> OMG ur music is soooo good!! added to my top 8!!1!</div>
            </div>
          </div>
        </div>
        <div className="jb-ms-footer">
          <span>&copy;2003-2026 MySpace Inc. All Rights Reserved.</span>
          <span className="jb-ms-footer-extra">| Terms | Privacy | About | Contact | Advertise | MySpace International</span>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════ RENDER ═══════════════════ */
  const ui = (
    <div className="jb">
      {/* ──── INTRO ──── */}
      {phase === 'intro' && (
        <div className="jb-intro" onClick={() => setPhase('select')}>
          <div className="jb-intro-stars" />
          <div className="jb-intro-content">
            <div className={`jb-intro-line jb-il-1 ${introStep >= 0 ? 'show' : ''}`}>
              <span className="jb-intro-emoji">&#127925;</span>
            </div>
            <div className={`jb-intro-line jb-il-2 ${introStep >= 1 ? 'show' : ''}`}>
              <h1>One for the road.</h1>
            </div>
            <div className={`jb-intro-line jb-il-3 ${introStep >= 2 ? 'show' : ''}`}>
              <p>What a day. You learned something new, met someone great,<br className="jb-br-hide" />
              and maybe even saw the world a little differently.<br /><br />
              Before you go &mdash; James Santana recorded these covers just for you.<br />
              Roll the windows down. Turn it up. Enjoy the drive home.</p>
            </div>
            <div className={`jb-intro-line jb-il-4 ${introStep >= 3 ? 'show' : ''}`}>
              <div className="jb-intro-cta jb-desktop-only">Press ENTER to pick your player</div>
              <div className="jb-intro-cta jb-mobile-only">Tap to pick your player</div>
            </div>
          </div>
          <div className="jb-intro-road">
            <div className="jb-road-stripe" />
          </div>
        </div>
      )}

      {/* ──── PLAYER SELECTOR ──── */}
      {phase === 'select' && (
        <div className="jb-select">
          <div className="jb-select-header">
            <h2>Pick your player.</h2>
            <p>How do you want to listen?</p>
          </div>
          <div className="jb-select-grid">
            {/* JUKEBOX CARD */}
            <button className="jb-sel-card jb-sel-jukebox" onClick={() => selectPlayer('jukebox')}>
              <div className="jb-sel-icon">
                <div className="jb-sel-glow jb-sel-glow-jukebox" />
                <svg viewBox="0 0 80 100" width="80" height="100">
                  <defs>
                    <linearGradient id="jk-body" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a02020" />
                      <stop offset="50%" stopColor="#6a1414" />
                      <stop offset="100%" stopColor="#3a0808" />
                    </linearGradient>
                    <linearGradient id="jk-chrome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fff8e0" />
                      <stop offset="50%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#b8960a" />
                    </linearGradient>
                  </defs>
                  {/* Chrome trim */}
                  <rect x="8" y="6" width="64" height="88" rx="10" fill="url(#jk-chrome)" />
                  <rect x="11" y="9" width="58" height="82" rx="8" fill="url(#jk-body)" />
                  {/* Wood panels */}
                  <rect x="4" y="20" width="6" height="60" rx="2" fill="#5a3a1a" stroke="#8a6a3a" strokeWidth="0.5" />
                  <rect x="70" y="20" width="6" height="60" rx="2" fill="#5a3a1a" stroke="#8a6a3a" strokeWidth="0.5" />
                  {/* Glass dome */}
                  <rect x="17" y="14" width="46" height="32" rx="8" fill="#1a0a04" />
                  <ellipse cx="40" cy="30" rx="13" ry="13" fill="#111" stroke="#FFD700" strokeWidth="1" />
                  {/* Vinyl grooves */}
                  <circle cx="40" cy="30" r="11" fill="none" stroke="#222" strokeWidth="0.5" />
                  <circle cx="40" cy="30" r="9" fill="none" stroke="#222" strokeWidth="0.5" />
                  <circle cx="40" cy="30" r="7" fill="none" stroke="#222" strokeWidth="0.5" />
                  <circle cx="40" cy="30" r="4" fill="#c41a1a" />
                  <circle cx="40" cy="30" r="1.5" fill="#FFD700" />
                  {/* Song slots */}
                  <rect x="18" y="52" width="44" height="5" rx="2.5" fill="#2a0a0a" stroke="#FFD700" strokeWidth="0.5" />
                  <rect x="18" y="60" width="44" height="5" rx="2.5" fill="#2a0a0a" stroke="#FFD700" strokeWidth="0.5" />
                  <rect x="18" y="68" width="44" height="5" rx="2.5" fill="#2a0a0a" stroke="#FFD700" strokeWidth="0.5" />
                  <rect x="18" y="76" width="44" height="5" rx="2.5" fill="#2a0a0a" stroke="#FFD700" strokeWidth="0.5" />
                  {/* Chasing bulbs */}
                  {Array.from({ length: 10 }, (_, i) => {
                    const colors = ['#ff2222','#3366ff','#00cc44','#FFD700','#ff44aa'];
                    return <circle key={i} cx={14 + i * 5.5} cy="10" r="2" fill={colors[i % 5]} className="jb-sel-bulb" style={{ animationDelay: `${i * 0.12}s` }} />;
                  })}
                </svg>
              </div>
              <div className="jb-sel-name">Jukebox</div>
              <div className="jb-sel-era">1950s</div>
            </button>

            {/* WALKMAN CARD */}
            <button className="jb-sel-card jb-sel-walkman" onClick={() => selectPlayer('walkman')}>
              <div className="jb-sel-icon">
                <div className="jb-sel-glow jb-sel-glow-walkman" />
                <svg viewBox="0 0 70 100" width="70" height="100">
                  <defs>
                    <linearGradient id="wk-body" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3a5a8a" />
                      <stop offset="40%" stopColor="#2a4a7a" />
                      <stop offset="100%" stopColor="#1a3060" />
                    </linearGradient>
                  </defs>
                  {/* Body */}
                  <rect x="5" y="5" width="60" height="90" rx="6" fill="url(#wk-body)" stroke="#8aacdd" strokeWidth="1.5" />
                  {/* Brushed texture lines */}
                  {Array.from({ length: 15 }, (_, i) => (
                    <line key={i} x1="8" y1={10 + i * 5.5} x2="62" y2={10 + i * 5.5} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  ))}
                  {/* Chrome top accent */}
                  <rect x="5" y="5" width="60" height="4" rx="2" fill="linear-gradient(#ddd,#999)" opacity="0.5" />
                  {/* Cassette window */}
                  <rect x="12" y="14" width="46" height="30" rx="4" fill="#0a0a14" stroke="#6a8aba" strokeWidth="1" />
                  {/* Reels */}
                  <circle cx="26" cy="29" r="9" fill="none" stroke="#6a8aba" strokeWidth="1.5" />
                  <circle cx="26" cy="29" r="3" fill="#4a6a9a" />
                  {/* Spokes */}
                  <line x1="26" y1="22" x2="26" y2="26" stroke="#6a8aba" strokeWidth="1" />
                  <line x1="20" y1="31" x2="24" y2="29" stroke="#6a8aba" strokeWidth="1" />
                  <line x1="32" y1="31" x2="28" y2="29" stroke="#6a8aba" strokeWidth="1" />
                  <circle cx="44" cy="29" r="9" fill="none" stroke="#6a8aba" strokeWidth="1.5" />
                  <circle cx="44" cy="29" r="3" fill="#4a6a9a" />
                  <line x1="44" y1="22" x2="44" y2="26" stroke="#6a8aba" strokeWidth="1" />
                  <line x1="38" y1="31" x2="42" y2="29" stroke="#6a8aba" strokeWidth="1" />
                  <line x1="50" y1="31" x2="46" y2="29" stroke="#6a8aba" strokeWidth="1" />
                  {/* Tape */}
                  <line x1="26" y1="29" x2="44" y2="29" stroke="#6a4a2a" strokeWidth="1.5" />
                  {/* LCD */}
                  <rect x="14" y="50" width="42" height="14" rx="3" fill="#1a2a1a" stroke="#3a5a3a" strokeWidth="0.8" />
                  <text x="35" y="58" textAnchor="middle" fill="#6aba6a" fontSize="5" fontFamily="monospace">WALKMAN</text>
                  <text x="35" y="62" textAnchor="middle" fill="#4a8a4a" fontSize="3" fontFamily="monospace">TPS-L2</text>
                  {/* Transport buttons */}
                  <rect x="14" y="70" width="10" height="9" rx="2" fill="#5a7aaa" stroke="#8aacdd" strokeWidth="0.5" />
                  <text x="19" y="77" textAnchor="middle" fill="#fff" fontSize="5">&#9664;</text>
                  <rect x="26" y="70" width="10" height="9" rx="2" fill="#5a7aaa" stroke="#8aacdd" strokeWidth="0.5" />
                  <rect x="29" y="73" width="4" height="3" fill="#fff" />
                  <rect x="38" y="68" width="14" height="13" rx="3" fill="#ff8c00" stroke="#FFD700" strokeWidth="1" />
                  <text x="45" y="78" textAnchor="middle" fill="#fff" fontSize="7">&#9654;</text>
                  <rect x="54" y="70" width="10" height="9" rx="2" fill="#5a7aaa" stroke="#8aacdd" strokeWidth="0.5" />
                  <text x="59" y="77" textAnchor="middle" fill="#fff" fontSize="5">&#9654;</text>
                  {/* SONY logo */}
                  <text x="35" y="93" textAnchor="middle" fill="#8aacdd" fontSize="5" fontFamily="sans-serif" fontWeight="bold">SONY</text>
                </svg>
              </div>
              <div className="jb-sel-name">Walkman</div>
              <div className="jb-sel-era">1980s</div>
            </button>

            {/* WINAMP CARD */}
            <button className="jb-sel-card jb-sel-winamp" onClick={() => selectPlayer('winamp')}>
              <div className="jb-sel-icon">
                <div className="jb-sel-glow jb-sel-glow-winamp" />
                <svg viewBox="0 0 80 100" width="80" height="100">
                  <defs>
                    <linearGradient id="wa-tbar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2a3a1a" />
                      <stop offset="50%" stopColor="#4a5a2a" />
                      <stop offset="100%" stopColor="#2a3a1a" />
                    </linearGradient>
                  </defs>
                  {/* Body */}
                  <rect x="4" y="8" width="72" height="84" rx="2" fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="1" />
                  {/* Bevel top */}
                  <line x1="4" y1="8" x2="76" y2="8" stroke="#444" strokeWidth="1" />
                  <line x1="4" y1="8" x2="4" y2="92" stroke="#444" strokeWidth="1" />
                  {/* Title bar */}
                  <rect x="6" y="10" width="68" height="10" rx="1" fill="url(#wa-tbar)" />
                  <text x="40" y="18" textAnchor="middle" fill="#bde0a0" fontSize="6" fontFamily="monospace" fontWeight="bold">WINAMP</text>
                  {/* Display */}
                  <rect x="6" y="22" width="68" height="34" rx="1" fill="#000" />
                  {/* Spectrum bars - segmented */}
                  {Array.from({ length: 20 }, (_, i) => {
                    const h = 8 + Math.random() * 20;
                    const segs = Math.round(h / 3);
                    return Array.from({ length: segs }, (_, s) => {
                      let fill = '#00cc00';
                      if (s > segs * 0.7) fill = '#ff3333';
                      else if (s > segs * 0.4) fill = '#dddd00';
                      return <rect key={`${i}-${s}`} x={9 + i * 3.2} y={52 - s * 3} width="2.5" height="2" fill={fill} />;
                    });
                  })}
                  {/* Time */}
                  <text x="58" y="32" textAnchor="middle" fill="#00ff00" fontSize="8" fontFamily="monospace">3:42</text>
                  {/* Scrolling text placeholder */}
                  <text x="40" y="40" textAnchor="middle" fill="#00ff00" fontSize="4" fontFamily="monospace">Playing: Track 1...</text>
                  {/* Seek bar */}
                  <rect x="6" y="58" width="68" height="4" rx="2" fill="#1a1a1a" />
                  <rect x="6" y="58" width="30" height="4" rx="2" fill="#00cc00" />
                  <circle cx="36" cy="60" r="3" fill="#888" stroke="#aaa" strokeWidth="0.5" />
                  {/* Transport buttons */}
                  {Array.from({ length: 5 }, (_, i) => (
                    <rect key={i} x={10 + i * 12.5} y={66} width="11" height="10" rx="1.5" fill="#3a4a2a" stroke="#5a7a3a" strokeWidth="0.5" />
                  ))}
                  <text x="15.5" y="74" textAnchor="middle" fill="#bde0a0" fontSize="6">&#9664;</text>
                  <text x="28" y="74" textAnchor="middle" fill="#bde0a0" fontSize="7">&#9654;</text>
                  <text x="40.5" y="74" textAnchor="middle" fill="#bde0a0" fontSize="5">&#9646;&#9646;</text>
                  <text x="53" y="74" textAnchor="middle" fill="#ff5555" fontSize="6">&#9632;</text>
                  <text x="65.5" y="74" textAnchor="middle" fill="#bde0a0" fontSize="6">&#9654;</text>
                  {/* Napster cat */}
                  <circle cx="68" cy="6" r="4" fill="#000" />
                  <circle cx="58" cy="6" r="4" fill="#000" />
                  <circle cx="63" cy="9" r="5" fill="#fff" />
                  <circle cx="61" cy="8" r="1.2" fill="#000" />
                  <circle cx="65" cy="8" r="1.2" fill="#000" />
                  <path d="M60.5 10.5 Q63 12 65.5 10.5" stroke="#000" strokeWidth="0.5" fill="none" />
                  {/* Playlist hint */}
                  <rect x="6" y="80" width="68" height="10" rx="1" fill="#0a0a1a" />
                  <text x="40" y="87" textAnchor="middle" fill="#00aa00" fontSize="4" fontFamily="monospace">PLAYLIST: 5 items</text>
                </svg>
              </div>
              <div className="jb-sel-name">Winamp</div>
              <div className="jb-sel-era">1990s</div>
              <div className="jb-sel-napster">feat. Napster</div>
            </button>

            {/* iPod CARD */}
            <button className="jb-sel-card jb-sel-ipod" onClick={() => selectPlayer('ipod')}>
              <div className="jb-sel-icon">
                <div className="jb-sel-glow jb-sel-glow-ipod" />
                <svg viewBox="0 0 60 100" width="60" height="100">
                  <defs>
                    <linearGradient id="ip-body" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f8f8f8" />
                      <stop offset="30%" stopColor="#f0f0f0" />
                      <stop offset="100%" stopColor="#d8d8d8" />
                    </linearGradient>
                    <linearGradient id="ip-shine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                      <stop offset="40%" stopColor="rgba(255,255,255,0.4)" />
                      <stop offset="60%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                    <linearGradient id="ip-screen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c8dce8" />
                      <stop offset="100%" stopColor="#a0b8c8" />
                    </linearGradient>
                  </defs>
                  <rect x="5" y="2" width="50" height="96" rx="10" fill="url(#ip-body)" stroke="#bbb" strokeWidth="1" />
                  {/* Shine */}
                  <rect x="5" y="2" width="50" height="96" rx="10" fill="url(#ip-shine)" />
                  {/* Screen */}
                  <rect x="10" y="8" width="40" height="34" rx="4" fill="url(#ip-screen)" stroke="#999" strokeWidth="0.8" />
                  <text x="30" y="18" textAnchor="middle" fill="#333" fontSize="5" fontFamily="sans-serif" fontWeight="bold">iPod</text>
                  {/* Album art placeholder */}
                  <rect x="17" y="20" width="26" height="18" rx="2" fill="#e8b87a" opacity="0.7" />
                  <text x="30" y="32" textAnchor="middle" fill="#fff" fontSize="8">&#9835;</text>
                  {/* Wheel */}
                  <circle cx="30" cy="68" r="20" fill="#e8e8e8" stroke="#ccc" strokeWidth="1" />
                  {/* Grooves */}
                  <circle cx="30" cy="68" r="17" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
                  <circle cx="30" cy="68" r="14" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
                  <circle cx="30" cy="68" r="11" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
                  <circle cx="30" cy="68" r="8" fill="#f4f4f4" stroke="#ddd" strokeWidth="0.8" />
                  <text x="30" y="52" textAnchor="middle" fill="#999" fontSize="4">MENU</text>
                  <text x="47" y="70" textAnchor="middle" fill="#999" fontSize="4">&#9654;&#9654;</text>
                  <text x="13" y="70" textAnchor="middle" fill="#999" fontSize="4">&#9664;&#9664;</text>
                  <text x="30" y="85" textAnchor="middle" fill="#999" fontSize="4">&#9654;&#9646;&#9646;</text>
                </svg>
              </div>
              <div className="jb-sel-name">iPod</div>
              <div className="jb-sel-era">2000s</div>
            </button>

            {/* MYSPACE CARD */}
            <button className="jb-sel-card jb-sel-myspace" onClick={() => selectPlayer('myspace')}>
              <div className="jb-sel-icon">
                <div className="jb-sel-glow jb-sel-glow-myspace" />
                <svg viewBox="0 0 80 100" width="80" height="100">
                  <rect x="4" y="8" width="72" height="84" rx="3" fill="#fff" stroke="#003399" strokeWidth="2" />
                  <rect x="4" y="8" width="72" height="16" rx="3" fill="#003399" />
                  <text x="40" y="20" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">MySpace</text>
                  {/* Avatar area with photo hint */}
                  <rect x="12" y="30" width="22" height="22" rx="2" fill="#ffe0d0" stroke="#003399" strokeWidth="1" />
                  <circle cx="23" cy="37" r="4" fill="#003399" opacity="0.3" />
                  <ellipse cx="23" cy="46" rx="6" ry="4" fill="#003399" opacity="0.2" />
                  {/* Sparkle dots */}
                  <circle cx="10" cy="34" r="1.5" fill="#FFD700" className="jb-sel-bulb" style={{ animationDelay: '0s' }} />
                  <circle cx="36" cy="28" r="1.5" fill="#ff44aa" className="jb-sel-bulb" style={{ animationDelay: '0.3s' }} />
                  <circle cx="8" cy="50" r="1.5" fill="#00ccff" className="jb-sel-bulb" style={{ animationDelay: '0.6s' }} />
                  <circle cx="38" cy="52" r="1.5" fill="#FFD700" className="jb-sel-bulb" style={{ animationDelay: '0.9s' }} />
                  {/* Content lines */}
                  <rect x="38" y="30" width="34" height="5" rx="1" fill="#f0f0f0" />
                  <rect x="38" y="38" width="34" height="5" rx="1" fill="#f0f0f0" />
                  <rect x="38" y="46" width="34" height="5" rx="1" fill="#f0f0f0" />
                  {/* Music player */}
                  <rect x="12" y="58" width="56" height="16" rx="2" fill="#000" />
                  <text x="40" y="68" textAnchor="middle" fill="#00ff00" fontSize="4.5" fontFamily="monospace">&#9654; Now Playing...</text>
                  <rect x="14" y="70" width="52" height="2" rx="1" fill="#003399" />
                  {/* Comment area */}
                  <rect x="12" y="78" width="56" height="10" rx="2" fill="#f0f4ff" stroke="#003399" strokeWidth="0.5" />
                  <text x="40" y="85" textAnchor="middle" fill="#003399" fontSize="3.5">Tom left a comment!</text>
                </svg>
              </div>
              <div className="jb-sel-name">MySpace</div>
              <div className="jb-sel-era">2000s</div>
            </button>
          </div>
          <button className="jb-select-back" onClick={() => go('sessions')}>Back to Explore</button>
        </div>
      )}

      {/* ──── ACTIVE PLAYER ──── */}
      {phase === 'player' && (
        <div className={`jb-player-wrap jb-pt-${playerType}`}>
          <button className="jb-player-back" onClick={goBack}>
            &#8592; Choose another player
          </button>
          {playerType === 'jukebox' && renderJukeboxPlayer()}
          {playerType === 'walkman' && renderWalkman()}
          {playerType === 'winamp' && renderWinamp()}
          {playerType === 'ipod' && renderIPod()}
          {playerType === 'myspace' && renderMySpace()}
          <button className="jb-player-exit" onClick={() => go('sessions')}>Exit to Explore</button>
        </div>
      )}
    </div>
  );

  return createPortal(ui, document.body);
}
