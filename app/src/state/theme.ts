import { useCallback, useEffect, useState } from 'react';

export type ThemeId = 'nintendo' | '90s' | 'disney';
export const THEME_CODES: Record<string, ThemeId> = {
  nintendo: 'nintendo', mario: 'nintendo', zelda: 'nintendo', nes: 'nintendo',
  '90s': '90s', "90's": '90s', nineties: '90s', '1990s': '90s',
  disney: 'disney', mickey: 'disney', magic: 'disney',
};
export const THEME_OFF_CODES = ['normal', 'reset', 'off', 'classic', 'default', 'exit'];

const KEY = 'njais26.theme';
const FONTS: Record<ThemeId, string> = {
  nintendo: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400..700&display=swap',
  '90s': 'https://fonts.googleapis.com/css2?family=Bungee&family=Bungee+Shade&family=Comic+Neue:ital,wght@0,400;0,700;1,400&family=VT323&display=swap',
  disney: 'https://fonts.googleapis.com/css2?family=Mouse+Memoirs&family=Nunito:ital,wght@0,400..900;1,400..700&display=swap',
};

function ensureFonts(t: ThemeId) {
  const id = `theme-font-${t}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet'; link.href = FONTS[t];
  document.head.appendChild(link);
}

function apply(t: ThemeId | null) {
  if (t) { ensureFonts(t); document.documentElement.dataset.theme = t; } else delete document.documentElement.dataset.theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId | null>(() => {
    try { const v = localStorage.getItem(KEY) as ThemeId | null; return v && FONTS[v] ? v : null; } catch { return null; }
  });
  useEffect(() => { apply(theme); try { if (theme) localStorage.setItem(KEY, theme); else localStorage.removeItem(KEY); } catch { /* ignore */ } }, [theme]);
  const setTheme = useCallback((t: ThemeId | null) => setThemeState(t), []);
  /** Returns true when the typed text was a secret code (and was consumed). */
  const tryCode = useCallback((raw: string): 'set' | 'off' | null => {
    const w = raw.trim().toLowerCase();
    if (THEME_CODES[w]) { setThemeState(THEME_CODES[w]); return 'set'; }
    if (THEME_OFF_CODES.includes(w)) { setThemeState(null); return 'off'; }
    return null;
  }, []);
  return { theme, setTheme, tryCode };
}
