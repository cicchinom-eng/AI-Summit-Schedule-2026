import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { go } from '../App';
import '../jukebox.css';
import { PODCAST_TRANSCRIPTS } from './podcastTranscripts';

/* ══════════════════════════════════════════════════════════════════════════════
   JUKEBOX  —  Premium Streaming Music Player
   Apple Music-inspired dark interface for the NJ AI Literacy Summit.
   Triggered by typing "jukebox" in the search bar. Full-screen overlay.
   ══════════════════════════════════════════════════════════════════════════════ */

interface Song {
  id: number;
  title: string;
  artist: string;
  src: string;
  art: string;
  duration: number;
}

const SONGS: Song[] = [
  { id: 0, title: 'Chicken Fried', artist: 'James Santana', src: '/audio/jb-chicken-fried.mp3', art: '/images/jb-art-chicken-fried.jpg', duration: 198 },
  { id: 1, title: 'Stand By Me', artist: 'James Santana', src: '/audio/jb-stand-by-me.mp3', art: '/images/jb-art-stand-by-me.jpg', duration: 92 },
  { id: 2, title: "Summer of '69", artist: 'James Santana', src: '/audio/jb-summer-of-69.mp3', art: '/images/jb-art-summer-of-69.jpg', duration: 248 },
  { id: 3, title: 'Time To Say Goodbye', artist: 'James Santana', src: '/audio/jb-time-to-say-goodbye.mp3', art: '/images/jb-art-time-to-say-goodbye.jpg', duration: 270 },
  { id: 4, title: 'Wagon Wheel', artist: 'James Santana', src: '/audio/jb-wagon-wheel.mp3', art: '/images/jb-art-wagon-wheel.jpg', duration: 248 },
];

interface PodcastEp {
  id: number;
  title: string;
  duration: number;
  src: string;
  description: string;
  tools: { name: string; url: string }[];
}

const PODCAST_ART = '/images/podcast-art.png';

const PODCAST_EPS: PodcastEp[] = [
  { id: 1, title: 'Your Newest Superpower', duration: 401, src: '/audio/podcast-ep1.mp3',
    description: 'Non-programmers building real software by just talking — and why that changes everything about who gets to solve problems in schools.',
    tools: [
      { name: 'Claude', url: 'https://claude.ai' },
      { name: 'Google Gemini', url: 'https://gemini.google.com' },
      { name: 'VS Code', url: 'https://code.visualstudio.com' },
      { name: 'Google Sites', url: 'https://sites.google.com' },
      { name: 'Vercel', url: 'https://vercel.com' },
    ]},
  { id: 2, title: 'The Thinking Problem', duration: 502, src: '/audio/podcast-ep2.mp3',
    description: 'We handed students a machine that can think for them. The question is whether they\'ll keep thinking at all.',
    tools: [
      { name: 'ChatGPT', url: 'https://chat.openai.com' },
      { name: 'Google Gemini in Classroom', url: 'https://edu.google.com/workspace-for-education/classroom/' },
    ]},
  { id: 3, title: 'Six Assistants and a Cup of Coffee', duration: 376, src: '/audio/podcast-ep3.mp3',
    description: 'What if six AI agents had already drafted your agenda before you woke up?',
    tools: [
      { name: 'Gemini Skills', url: 'https://gemini.google.com' },
      { name: 'Claude', url: 'https://claude.ai' },
    ]},
  { id: 4, title: 'Carpe Datum', duration: 457, src: '/audio/podcast-ep4.mp3',
    description: 'Every district is drowning in data. The insights are already there. They just can\'t find them.',
    tools: [
      { name: 'Gemini Notebook', url: 'https://notebooklm.google.com' },
      { name: 'Google Sheets + Gemini', url: 'https://sheets.google.com' },
    ]},
  { id: 5, title: 'Creativity in the Age of AI', duration: 456, src: '/audio/podcast-ep5.mp3',
    description: 'Creativity isn\'t what AI replaces. It\'s what AI makes room for.',
    tools: [
      { name: 'Suno', url: 'https://suno.com' },
      { name: 'Google Vids', url: 'https://workspace.google.com/products/vids/' },
      { name: 'Adobe Express', url: 'https://www.adobe.com/express/' },
    ]},
];

const INTRO_LINES = [
  'Thank you for spending your day',
  'at the NJ AI Literacy Summit.',
  null, // pause
  'Please enjoy this little parting gift',
  'as we go our separate ways:',
  null, // pause
  'a few tracks to listen to',
  'on your ride home.',
  null, // longer pause
  'Drive safe, and see you next year.',
];

type Tab = 'home' | 'library' | 'radio' | 'tv' | 'surprise';

/* ── Helpers ── */
const fmt = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

/* ── SVG Icon Components ── */
const IconPlay = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
const IconPause = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
);
const IconPrev = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
);
const IconNext = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-3.5 6L4 6v12z" /></svg>
);
const IconShuffle = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
);
const IconRepeat = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>
);
const IconChevronDown = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor" /></svg>
);
const IconLibrary = () => (
  <svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" fill="currentColor" /></svg>
);
const IconRadio = () => (
  <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor" /></svg>
);
const IconTV = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>
);
const IconArcade = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="3"/>
    <rect x="11" y="8" width="2" height="6" rx="1"/>
    <path d="M6 16a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H6z"/>
  </svg>
);
const IconVolLow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" fill="currentColor" /></svg>
);
const IconVolHigh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor" /></svg>
);

/* ── Playing Bars (must be outside Jukebox so React preserves its state) ── */
function PlayingBars({ paused }: { paused?: boolean }) {
  const [heights, setHeights] = useState([6, 10, 4]);
  const targets = useRef([14, 5, 12]);
  const raf = useRef(0);

  useEffect(() => {
    if (paused) return;
    let last = 0;
    const step = (now: number) => {
      if (now - last > 60) {
        last = now;
        setHeights(prev => prev.map((h, i) => {
          // Ease toward target
          const t = targets.current[i];
          const next = h + (t - h) * 0.18;
          // Pick new target when close
          if (Math.abs(next - t) < 0.5) {
            targets.current[i] = 3 + Math.random() * 13;
          }
          return next;
        }));
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [paused]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 16, width: 16 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3,
          height: paused ? 6 : h,
          background: '#fc3c44',
          borderRadius: 1,
          opacity: paused ? 0.35 : 1,
          transition: paused ? 'height 0.4s, opacity 0.4s' : 'none',
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════ */
export default function Jukebox() {
  /* ── Detect return from Arcade game ── */
  const initState = useRef(() => {
    try {
      const fromArcade = sessionStorage.getItem('jb-from-arcade') === '1';
      const seenIntro = sessionStorage.getItem('jb-seen-intro') === '1';
      // Clear the arcade flag immediately (one-time use)
      sessionStorage.removeItem('jb-from-arcade');
      return { fromArcade, seenIntro };
    } catch { return { fromArcade: false, seenIntro: false }; }
  });
  const { fromArcade, seenIntro } = initState.current();

  /* ── Intro state ── */
  const [introPhase, setIntroPhase] = useState<'showing' | 'fading' | 'done'>(seenIntro ? 'done' : 'showing');
  const [visibleLines, setVisibleLines] = useState(seenIntro ? 10 : 0);

  /* ── App state — Arcade only if returning from a game, otherwise Home ── */
  const [tab, setTab] = useState<Tab>(fromArcade ? 'surprise' : 'home');

  /* Mark that we've seen the intro (persists across reloads, NOT the arcade flag) */
  useEffect(() => {
    try { sessionStorage.setItem('jb-seen-intro', '1'); } catch {}
  }, []);

  /* ── Audio state ── */
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [podcastIdx, setPodcastIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [volume, setVolume] = useState(1);
  const [npOpen, setNpOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedEp, setExpandedEp] = useState<number>(-1);
  const [transcriptOpen, setTranscriptOpen] = useState(-1);
  const [tvPlaying, setTvPlaying] = useState(false);

  /* ── Refs ── */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const scrubRef = useRef<HTMLDivElement>(null);

  const currentSong = currentIdx >= 0 ? SONGS[currentIdx] : null;
  const currentPodcast = podcastIdx >= 0 ? PODCAST_EPS[podcastIdx] : null;

  /* ══════════ INTRO SEQUENCE ══════════ */
  useEffect(() => {
    if (introPhase !== 'showing') return;
    let lineIdx = 0;
    let globalIdx = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const showNext = () => {
      if (globalIdx >= INTRO_LINES.length) {
        // All lines shown, wait then fade
        timers.push(setTimeout(() => setIntroPhase('fading'), 2200));
        return;
      }
      const item = INTRO_LINES[globalIdx];
      if (item === null) {
        // pause line
        const pauseDur = globalIdx === INTRO_LINES.length - 2 ? 1200 : 600;
        globalIdx++;
        timers.push(setTimeout(showNext, pauseDur));
      } else {
        lineIdx++;
        setVisibleLines(lineIdx);
        globalIdx++;
        const delay = globalIdx >= INTRO_LINES.length ? 100 : 800;
        timers.push(setTimeout(showNext, delay));
      }
    };

    timers.push(setTimeout(showNext, 800));
    return () => timers.forEach(clearTimeout);
  }, [introPhase]);

  // Fade-out transition
  useEffect(() => {
    if (introPhase !== 'fading') return;
    const t = setTimeout(() => setIntroPhase('done'), 1300);
    return () => clearTimeout(t);
  }, [introPhase]);

  const skipIntro = useCallback(() => {
    if (introPhase === 'done') return;
    setIntroPhase('fading');
  }, [introPhase]);

  /* ══════════ AUDIO ENGINE ══════════ */
  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 1;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // iOS audio unlock
  useEffect(() => {
    const unlock = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      // Also nudge audio element
      const a = audioRef.current;
      if (a && a.paused && !a.src) {
        a.load();
      }
    };
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('click', unlock, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
  }, []);

  // Time update loop
  useEffect(() => {
    const tick = () => {
      const a = audioRef.current;
      if (a && !isDragging) {
        setCurrentTime(a.currentTime);
        if (a.duration && isFinite(a.duration)) setDuration(a.duration);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isDragging]);

  // Handle song ended
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => {
      if (podcastIdx >= 0) {
        // Podcast ended — advance to next episode or stop
        if (podcastIdx < PODCAST_EPS.length - 1) {
          playPodcast(podcastIdx + 1);
        } else {
          setIsPlaying(false);
          setPodcastIdx(-1);
        }
        return;
      }
      if (repeatOn) {
        a.currentTime = 0;
        a.play();
      } else {
        playNext();
      }
    };
    a.addEventListener('ended', onEnded);
    return () => a.removeEventListener('ended', onEnded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, podcastIdx, shuffleOn, repeatOn]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playSong = useCallback((idx: number) => {
    const a = audioRef.current;
    if (!a) return;
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    a.src = SONGS[idx].src;
    a.load();
    a.play().catch(() => {});
    setCurrentIdx(idx);
    setPodcastIdx(-1);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(SONGS[idx].duration);
  }, []);

  const playPodcast = useCallback((idx: number) => {
    const a = audioRef.current;
    if (!a) return;
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    a.src = PODCAST_EPS[idx].src;
    a.load();
    a.play().catch(() => {});
    setCurrentIdx(-1);
    setPodcastIdx(idx);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(PODCAST_EPS[idx].duration);
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (currentIdx < 0 && podcastIdx < 0) {
      playSong(0);
      return;
    }
    if (a.paused) {
      a.play().catch(() => {});
      setIsPlaying(true);
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }, [currentIdx, podcastIdx, playSong]);

  const playNext = useCallback(() => {
    if (podcastIdx >= 0) {
      if (podcastIdx < PODCAST_EPS.length - 1) {
        playPodcast(podcastIdx + 1);
      }
      return;
    }
    if (currentIdx < 0) { playSong(0); return; }
    if (shuffleOn) {
      let next = Math.floor(Math.random() * SONGS.length);
      while (next === currentIdx && SONGS.length > 1) next = Math.floor(Math.random() * SONGS.length);
      playSong(next);
    } else {
      playSong((currentIdx + 1) % SONGS.length);
    }
  }, [currentIdx, podcastIdx, shuffleOn, playSong, playPodcast]);

  const playPrev = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (podcastIdx >= 0) {
      if (a.currentTime > 3) {
        a.currentTime = 0;
        return;
      }
      if (podcastIdx > 0) {
        playPodcast(podcastIdx - 1);
      }
      return;
    }
    if (currentIdx < 0) return;
    // If more than 3 seconds in, restart current track
    if (a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    const prev = currentIdx === 0 ? SONGS.length - 1 : currentIdx - 1;
    playSong(prev);
  }, [currentIdx, podcastIdx, playSong, playPodcast]);

  const seekTo = useCallback((fraction: number) => {
    const a = audioRef.current;
    if (!a) return;
    if (currentIdx < 0 && podcastIdx < 0) return;
    let d: number;
    if (podcastIdx >= 0) {
      d = a.duration && isFinite(a.duration) ? a.duration : PODCAST_EPS[podcastIdx].duration;
    } else {
      d = a.duration && isFinite(a.duration) ? a.duration : SONGS[currentIdx].duration;
    }
    a.currentTime = fraction * d;
    setCurrentTime(a.currentTime);
  }, [currentIdx, podcastIdx]);

  const shuffleAll = useCallback(() => {
    setShuffleOn(true);
    const idx = Math.floor(Math.random() * SONGS.length);
    playSong(idx);
  }, [playSong]);

  /* ══════════ SCRUBBER DRAG ══════════ */
  const handleScrubStart = useCallback((clientX: number) => {
    if (!scrubRef.current) return;
    setIsDragging(true);
    const rect = scrubRef.current.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(frac);
  }, [seekTo]);

  const handleScrubMove = useCallback((clientX: number) => {
    if (!isDragging || !scrubRef.current) return;
    const rect = scrubRef.current.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(frac);
  }, [isDragging, seekTo]);

  const handleScrubEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse & touch scrub events
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => handleScrubMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) handleScrubMove(e.touches[0].clientX); };
    const onUp = () => handleScrubEnd();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, handleScrubMove, handleScrubEnd]);

  /* ══════════ LIFECYCLE ══════════ */

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Preload images
  useEffect(() => {
    SONGS.forEach(s => { const img = new Image(); img.src = s.art; });
    { const img = new Image(); img.src = PODCAST_ART; }
  }, []);

  // Keys
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (npOpen) { setNpOpen(false); return; }
        // Stop audio and go back
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
        go('sessions');
      }
      if (e.key === ' ' && introPhase === 'done') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [npOpen, introPhase, togglePlay]);

  // Load fonts
  useEffect(() => {
    if (!document.getElementById('jb-font')) {
      const l = document.createElement('link');
      l.id = 'jb-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  /* ══════════ COMPUTED ══════════ */
  const progress = duration > 0 ? currentTime / duration : 0;
  const hasAnythingPlaying = currentIdx >= 0 || podcastIdx >= 0;

  /* ══════════ RENDER HELPERS ══════════ */

  /* PlayingBars is defined outside the component (above) */

  /* ── Intro ── */
  const renderIntro = () => {
    if (introPhase === 'done') return null;
    let lineCount = 0;
    return (
      <div className={`jb-intro ${introPhase === 'fading' ? 'fade-out' : ''}`} onClick={skipIntro}>
        <div className="jb-intro-lines">
          {INTRO_LINES.map((line, i) => {
            if (line === null) return null;
            lineCount++;
            const thisNum = lineCount;
            return (
              <div key={i} className={`jb-intro-line ${thisNum <= visibleLines ? 'visible' : ''}`}>
                {line}
              </div>
            );
          })}
        </div>
        <button className="jb-intro-skip" onClick={skipIntro}>tap to skip</button>
      </div>
    );
  };

  /* ── Tab Bar ── */
  const renderTabBar = () => (
    <nav className="jb-tabbar">
      {([
        { id: 'home' as Tab, label: 'Home', Icon: IconHome },
        { id: 'library' as Tab, label: 'Library', Icon: IconLibrary },
        { id: 'radio' as Tab, label: 'Radio', Icon: IconRadio },
        { id: 'tv' as Tab, label: 'TV', Icon: IconTV },
        { id: 'surprise' as Tab, label: 'Arcade', Icon: IconArcade },
      ]).map(t => (
        <button
          key={t.id}
          className={`jb-tab ${tab === t.id ? 'active' : ''}`}
          onClick={() => setTab(t.id)}
        >
          <t.Icon />
          <span className="jb-tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );

  /* ── Mini Player ── */
  const renderMiniPlayer = () => {
    if (!hasAnythingPlaying) return null;
    const miniArt = currentPodcast ? PODCAST_ART : currentSong?.art || '';
    const miniTitle = currentPodcast ? currentPodcast.title : currentSong?.title || '';
    const miniSub = currentPodcast ? 'NJ AI Summit Radio' : currentSong?.artist || '';
    return (
      <div className="jb-mini" onClick={(e) => {
        // Don't expand if clicking play button
        if ((e.target as HTMLElement).closest('.jb-mini-play')) return;
        setNpOpen(true);
      }}>
        <div className="jb-mini-progress" style={{ width: `${progress * 100}%` }} />
        <img className="jb-mini-art" src={miniArt} alt="" />
        <div className="jb-mini-info">
          <div className="jb-mini-title">{miniTitle}</div>
          <div className="jb-mini-artist">{miniSub}</div>
        </div>
        <button className="jb-mini-play" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
          {isPlaying ? <IconPause size={20} /> : <IconPlay size={20} />}
        </button>
      </div>
    );
  };

  /* ── Full-Screen Now Playing ── */
  const renderNowPlaying = () => {
    if (!hasAnythingPlaying) return null;
    const npArt = currentPodcast ? PODCAST_ART : currentSong?.art || '';
    const npTitle = currentPodcast ? currentPodcast.title : currentSong?.title || '';
    const npSub = currentPodcast ? 'NJ AI Summit Radio' : currentSong?.artist || '';
    return (
      <div className={`jb-np ${npOpen ? 'open' : ''}`}>
        <div className="jb-np-bg">
          <img src={npArt} alt="" />
        </div>
        <div className="jb-np-content">
          {/* Collapse button */}
          <div className="jb-np-close">
            <button className="jb-np-close-btn" onClick={() => setNpOpen(false)}>
              <IconChevronDown />
            </button>
          </div>

          {/* Album Art */}
          <div className="jb-np-art-wrap">
            <img className="jb-np-art" src={npArt} alt={npTitle} />
          </div>

          {/* Track Info */}
          <div className="jb-np-info">
            <div className="jb-np-title">{npTitle}</div>
            <div className="jb-np-artist">{npSub}</div>
            {currentPodcast && (
              <div style={{ fontSize: 13, color: 'var(--jb-text-tertiary)', marginTop: 6, lineHeight: 1.5 }}>
                {currentPodcast.description}
              </div>
            )}
          </div>

          {/* Scrubber */}
          <div className="jb-np-scrubber">
            <div
              className={`jb-np-bar-wrap ${isDragging ? 'dragging' : ''}`}
              ref={scrubRef}
              onMouseDown={(e) => handleScrubStart(e.clientX)}
              onTouchStart={(e) => { if (e.touches[0]) handleScrubStart(e.touches[0].clientX); }}
            >
              <div className="jb-np-bar">
                <div className="jb-np-bar-fill" style={{ width: `${progress * 100}%` }} />
                <div className="jb-np-bar-thumb" style={{ left: `${progress * 100}%` }} />
              </div>
            </div>
            <div className="jb-np-times">
              <span>{fmt(currentTime)}</span>
              <span>-{fmt(Math.max(0, duration - currentTime))}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="jb-np-controls">
            <button className={`jb-np-ctrl small ${shuffleOn ? 'active' : ''}`} onClick={() => setShuffleOn(s => !s)}>
              <IconShuffle />
            </button>
            <button className="jb-np-ctrl medium" onClick={playPrev}>
              <IconPrev />
            </button>
            <button className="jb-np-play-btn" onClick={togglePlay}>
              {isPlaying ? <IconPause size={28} /> : <IconPlay size={28} />}
            </button>
            <button className="jb-np-ctrl medium" onClick={playNext}>
              <IconNext />
            </button>
            <button className={`jb-np-ctrl small ${repeatOn ? 'active' : ''}`} onClick={() => setRepeatOn(r => !r)}>
              <IconRepeat />
            </button>
          </div>

          {/* Volume */}
          <div className="jb-np-volume">
            <IconVolLow />
            <div
              className="jb-np-vol-track"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
              }}
            >
              <div className="jb-np-vol-fill" style={{ width: `${volume * 100}%` }} />
            </div>
            <IconVolHigh />
          </div>
        </div>
      </div>
    );
  };

  /* ── Home Tab ── */
  const renderHome = () => (
    <div className={`jb-page ${hasAnythingPlaying ? 'has-mini' : ''}`}>
      <div className="jb-page-header">
        <h1>NJ AI Summit</h1>
      </div>
      <div className="jb-page-pad">
        {/* Hero */}
        <div className="jb-hero" onClick={() => playSong(0)}>
          <img src={SONGS[0].art} alt={SONGS[0].title} />
          <div className="jb-hero-overlay">
            <div className="jb-hero-title">{SONGS[0].title}</div>
            <div className="jb-hero-artist">{SONGS[0].artist}</div>
          </div>
          <button className="jb-hero-play" onClick={(e) => { e.stopPropagation(); playSong(0); }}>
            <IconPlay size={28} />
          </button>
        </div>

        {/* Songs for the Road */}
        <div className="jb-section-title">Songs for the Road</div>
        <div className="jb-hscroll">
          {[SONGS[0], SONGS[2], SONGS[3], SONGS[4], SONGS[1]].map((s) => (
            <div key={s.id} className="jb-hscroll-card" onClick={() => playSong(s.id)}>
              <img src={s.art} alt={s.title} />
              <div className="jb-hscroll-card-title">{s.title}</div>
              <div className="jb-hscroll-card-artist">{s.artist}</div>
            </div>
          ))}
        </div>

        {/* Podcast Feature */}
        <div className="jb-section-title" style={{ marginTop: 28 }}>NJ AI Summit Radio</div>
        <div className="jb-podcast-hero" onClick={() => setTab('radio')}>
          <img src={PODCAST_ART} alt="NJ AI Literacy Summit Radio" />
          <div className="jb-podcast-hero-overlay">
            <div className="jb-podcast-hero-badge">PODCAST</div>
            <div className="jb-podcast-hero-title">5 Episodes for the Road</div>
            <div className="jb-podcast-hero-sub">Tap to listen</div>
          </div>
        </div>

        {/* Track List */}
        <div className="jb-tracklist">
          <div className="jb-section-title">Track List</div>
          {SONGS.map((s, i) => (
            <div
              key={s.id}
              className={`jb-track ${currentIdx === i ? 'playing' : ''}`}
              onClick={() => { if (currentIdx === i) { togglePlay(); } else { playSong(i); } }}
            >
              <div className="jb-track-num">
                {currentIdx === i ? <PlayingBars paused={!isPlaying} /> : i + 1}
              </div>
              <img className="jb-track-art" src={s.art} alt="" />
              <div className="jb-track-info">
                <div className="jb-track-title">{s.title}</div>
                <div className="jb-track-artist">{s.artist}</div>
              </div>
              <div className="jb-track-dur">{fmt(s.duration)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Library Tab ── */
  const renderLibrary = () => (
    <div className={`jb-page ${hasAnythingPlaying ? 'has-mini' : ''}`}>
      <div className="jb-page-header">
        <h1>Library</h1>
      </div>
      <div className="jb-page-pad">
        <button className="jb-shuffle-btn" onClick={shuffleAll}>
          <IconShuffle size={20} /> Shuffle All
        </button>
        <div className="jb-lib-list">
          {SONGS.map((s, i) => (
            <div
              key={s.id}
              className={`jb-lib-row ${currentIdx === i ? 'playing' : ''}`}
              onClick={() => { if (currentIdx === i) { togglePlay(); } else { playSong(i); } }}
            >
              <img className="jb-lib-art" src={s.art} alt="" />
              <div className="jb-lib-info">
                <div className="jb-lib-title">{s.title}</div>
                <div className="jb-lib-artist">{s.artist}</div>
              </div>
              {currentIdx === i && <PlayingBars paused={!isPlaying} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Radio Tab ── */
  const renderRadio = () => (
    <div className={`jb-page ${hasAnythingPlaying ? 'has-mini' : ''}`}>
      <div className="jb-page-header">
        <h1>Radio</h1>
      </div>
      <div className="jb-page-pad">
        {/* Podcast artwork */}
        <div className="jb-radio-art">
          <img src={PODCAST_ART} alt="NJ AI Literacy Summit Radio" />
        </div>
        <div className="jb-radio-header">
          <h2>NJ AI Literacy Summit Radio</h2>
          <p>5 Episodes</p>
        </div>

        {/* Episode list */}
        <div className="jb-ep-list">
          {PODCAST_EPS.map((ep, i) => {
            const isActive = podcastIdx === i;
            const isExpanded = expandedEp === i;
            return (
              <div key={ep.id} className={`jb-ep ${isActive ? 'active-ep' : ''}`}>
                <div
                  className="jb-ep-main"
                  onClick={() => setExpandedEp(isExpanded ? -1 : i)}
                >
                  <div className="jb-ep-num">
                    {isActive ? <PlayingBars paused={!isPlaying} /> : ep.id}
                  </div>
                  <div className="jb-ep-info">
                    <div className="jb-ep-title">{ep.title}</div>
                    <div className="jb-ep-meta">
                      <span>{fmt(ep.duration)}</span>
                      <span>Episode {ep.id}</span>
                    </div>
                    {!isExpanded && (
                      <div className="jb-ep-desc">{ep.description}</div>
                    )}
                  </div>
                  <button
                    className={`jb-ep-play ${isActive && isPlaying ? 'playing' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isActive && isPlaying) {
                        togglePlay();
                      } else if (isActive && !isPlaying) {
                        togglePlay();
                      } else {
                        playPodcast(i);
                      }
                    }}
                  >
                    {isActive && isPlaying ? (
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>
                </div>
                {isExpanded && (
                  <div className="jb-ep-details">
                    <div className="jb-ep-details-desc">{ep.description}</div>
                    <div className="jb-ep-tools-title">Show Notes &mdash; Tools Discussed</div>
                    <div className="jb-ep-tools">
                      {ep.tools.map(tool => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="jb-ep-tool"
                        >
                          {tool.name}
                        </a>
                      ))}
                    </div>
                    <button
                      className="jb-ep-transcript-toggle"
                      onClick={(e) => { e.stopPropagation(); setTranscriptOpen(transcriptOpen === ep.id ? -1 : ep.id); }}
                    >
                      {transcriptOpen === ep.id ? 'Hide Transcript' : 'View Transcript'}
                    </button>
                    {transcriptOpen === ep.id && (
                      <div className="jb-ep-transcript">
                        {PODCAST_TRANSCRIPTS[ep.id - 1]?.split('\n\n').map((para, j) => (
                          <p key={j}>{para}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── TV Tab ── */
  const renderTV = () => (
    <div className={`jb-page jb-tv-page ${hasAnythingPlaying ? 'has-mini' : ''}`}>
      {/* Full-bleed cinematic hero */}
      <div className="jb-tv-hero">
        {!tvPlaying ? (
          <>
            {/* Thumbnail from YouTube — high-res maxresdefault */}
            <img
              className="jb-tv-poster"
              src="https://img.youtube.com/vi/lu9jt7Wyo5w/maxresdefault.jpg"
              alt="NJ AI Literacy Summit 2026"
              draggable={false}
            />
            <div className="jb-tv-gradient" />
            {/* Play button */}
            <button className="jb-tv-play" onClick={() => { if (audioRef.current) audioRef.current.pause(); setIsPlaying(false); setTvPlaying(true); }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z" /></svg>
            </button>
            {/* Title overlay at bottom */}
            <div className="jb-tv-title-overlay">
              <div className="jb-tv-badge">NJ AI TV</div>
              <h1 className="jb-tv-title">NJ AI Literacy Summit 2026</h1>
              <p className="jb-tv-subtitle">"How Hard Can It Be?"</p>
            </div>
          </>
        ) : (
          <div className="jb-tv-iframe-wrap">
            <iframe
              src="https://www.youtube.com/embed/lu9jt7Wyo5w?autoplay=1&modestbranding=1&rel=0&showinfo=0&playsinline=1"
              title="NJ AI Literacy Summit 2026"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Info below the hero */}
      <div className="jb-tv-meta">
        <div className="jb-tv-meta-row">
          <span className="jb-tv-meta-year">2026</span>
          <span className="jb-tv-meta-dot" />
          <span>2 min</span>
          <span className="jb-tv-meta-dot" />
          <span>Education</span>
        </div>
        <p className="jb-tv-desc">
          Bus driver. Custodian. Cafeteria cook. Classroom teacher. Main office secretary. One superintendent tries to walk in their shoes, all in a single day. It goes about as well as you'd expect&hellip; and ends better than you'd imagine.
        </p>
      </div>
    </div>
  );

  /* ── Arcade Tab ── */
  const ARCADE_GAMES = [
    { id: 'punchout', title: "Punch Out", subtitle: "Boxing", icon: '/images/arcade-punchout.png' },
    { id: 'duckhunt', title: "AI Hunt", subtitle: "Shooting Gallery", icon: '/images/arcade-duckhunt.png' },
    { id: 'oregontrail', title: "Oregon Trail", subtitle: "Adventure", icon: '/images/arcade-oregontrail.png' },
    { id: 'spaceinvaders', title: "AI Invaders", subtitle: "Arcade", icon: '/images/arcade-spaceinvaders.png' },
    { id: 'aol', title: "AIM Chat", subtitle: "Nostalgia", icon: '/images/arcade-aol.png' },
    { id: 'pokemon', title: "LL Monsters", subtitle: "RPG", icon: '/images/arcade-pokemon.png' },
  ];

  const renderSurprise = () => (
    <div className={`jb-page ${hasAnythingPlaying ? 'has-mini' : ''}`}>
      <div className="jb-page-header">
        <h1>Arcade</h1>
      </div>
      <div className="jb-page-pad">
        {/* iOS-style icon grid */}
        <div className="jb-arcade-grid">
          {ARCADE_GAMES.map(g => (
            <button
              key={g.id}
              className="jb-arcade-app"
              onClick={() => {
                if (audioRef.current) { audioRef.current.pause(); }
                try { sessionStorage.setItem('jb-from-arcade', '1'); } catch {}
                go(g.id, { from: 'arcade' });
              }}
            >
              <div className="jb-arcade-icon-wrap">
                <img src={g.icon} alt={g.title} className="jb-arcade-icon" draggable={false} />
              </div>
              <div className="jb-arcade-label">{g.title}</div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );

  /* ══════════ MAIN RENDER ══════════ */
  const renderPage = () => {
    switch (tab) {
      case 'home': return renderHome();
      case 'library': return renderLibrary();
      case 'radio': return renderRadio();
      case 'tv': return renderTV();
      case 'surprise': return renderSurprise();
    }
  };

  const ui = (
    <div className="jb">
      {/* Intro Sequence */}
      {renderIntro()}

      {/* Main App (visible even during intro, just behind it) */}
      {renderPage()}
      {renderMiniPlayer()}
      {renderTabBar()}
      {renderNowPlaying()}

      {/* Back/Exit button */}
      <button className="jb-back" onClick={() => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
        go('sessions');
      }}>
        Exit
      </button>
    </div>
  );

  return createPortal(ui, document.body);
}
