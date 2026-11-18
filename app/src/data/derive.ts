import type { Block, Pathway, Session, SummitData } from './types';

export const SLOT_IDS = ['slot1', 'slot2', 'slot3', 'slot4'] as const;

export function slotBlock(data: SummitData, slot: number): Block | undefined {
  return data.blocks.find((b) => b.id === `slot${slot}`);
}

export function slotTime(data: SummitData, slot: number): string {
  const b = slotBlock(data, slot);
  return b ? `${b.start.replace(' ', ' ')} – ${b.end.replace(' ', ' ')}` : '';
}

export function slotLabel(data: SummitData, slot: number): string {
  const b = slotBlock(data, slot);
  return b?.label ?? `Session ${slot}`;
}

export function sessionsInSlot(data: SummitData, slot: number): Session[] {
  return data.sessions.filter((s) => s.slots.includes(slot)).sort(byTitle);
}

export const byTitle = (a: Session, b: Session) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });

export function pathwayOf(data: SummitData, name: string): Pathway | undefined {
  return data.pathways.find((p) => p.name === name);
}

export function pathwayColor(data: SummitData, name: string): string {
  return pathwayOf(data, name)?.color ?? '#64748B';
}

/** Rooms for the room board: everything on the Rooms tab except plenary/lunch spaces. */
export function sessionRooms(data: SummitData) {
  return data.rooms.filter((r) => !/plenary|playground|lunch/i.test(r.kind));
}

/** Pure helper: which room holds which session in a slot (room name -> session). Handles "F101 (slot 1); F102 (slot 2)" overrides. */
export function roomMapForSlot(data: SummitData, slot: number): Map<string, Session> {
  const m = new Map<string, Session>();
  for (const s of data.sessions) {
    if (!s.slots.includes(slot)) continue;
    m.set(roomForSlot(s, slot), s);
  }
  return m;
}

export function roomForSlot(s: Session, slot: number): string {
  if (!s.room.includes('(')) return s.room;
  const parts = s.room.split(';').map((p) => p.trim());
  for (const p of parts) {
    const m = /^(.*?)\s*\(slot\s*(\d)\)/i.exec(p);
    if (m && parseInt(m[2], 10) === slot) return m[1].trim();
  }
  return parts[0].replace(/\(.*?\)/, '').trim();
}

// ----------------------------------------------------------------------------- time
export function eventDate(data: SummitData): Date | null {
  const iso = data.info.event_date_iso;
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

export function isEventDay(data: SummitData, now: Date): boolean {
  const e = eventDate(data);
  return !!e && e.getFullYear() === now.getFullYear() && e.getMonth() === now.getMonth() && e.getDate() === now.getDate();
}

export function minutesOf(d: Date) { return d.getHours() * 60 + d.getMinutes(); }

export function fmtMinutes(min: number): string {
  const h24 = Math.floor(min / 60), mm = min % 60;
  const ap = h24 >= 12 ? 'PM' : 'AM';
  const h = ((h24 + 11) % 12) + 1;
  return `${h}:${mm.toString().padStart(2, '0')} ${ap}`;
}

export function currentBlocks(data: SummitData, min: number): Block[] {
  return data.blocks.filter((b) => min >= b.startMin && min < b.endMin);
}

export function currentSlot(data: SummitData, min: number): number | null {
  for (let i = 1; i <= 4; i++) {
    const b = slotBlock(data, i);
    if (b && min >= b.startMin - 5 && min < b.endMin) return i;
  }
  return null;
}

export function nextSlot(data: SummitData, min: number): number | null {
  for (let i = 1; i <= 4; i++) {
    const b = slotBlock(data, i);
    if (b && min < b.startMin) return i;
  }
  return null;
}

// ----------------------------------------------------------------------------- filtering
export type Filters = {
  q: string;
  pathways: string[];
  levels: string[];
  roles: string[];
  grades: string[];
  formats: string[];
  device: boolean; // only sessions with no device requirement? -> we use "hands-on" meaning device Yes/Helpful
  starredOnly: boolean;
};

export const emptyFilters: Filters = { q: '', pathways: [], levels: [], roles: [], grades: [], formats: [], device: false, starredOnly: false };

export function countActive(f: Filters): number {
  return f.pathways.length + f.levels.length + f.roles.length + f.grades.length + f.formats.length + (f.device ? 1 : 0) + (f.starredOnly ? 1 : 0) + (f.q ? 1 : 0);
}

export function applyFilters(list: Session[], f: Filters, stars: Set<string>): Session[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((s) => {
    if (f.starredOnly && !stars.has(s.id)) return false;
    if (f.pathways.length && !f.pathways.includes(s.pathway) && !f.pathways.includes(s.pathway2)) return false;
    if (f.levels.length && !f.levels.includes(s.level)) return false;
    if (f.roles.length && !f.roles.some((r) => s.audience.includes(r))) return false;
    if (f.grades.length && !f.grades.includes(s.grade) && !(f.grades.includes('All grades') && s.grade === 'All grades')) return false;
    if (f.formats.length && !f.formats.includes(s.format)) return false;
    if (f.device && !s.device) return false;
    if (q) {
      const hay = [s.title, s.short, s.presenters, s.leadOrg, s.description, s.tools.join(' '), s.pathway, s.pathway2, s.room, s.strands.join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function uniqueValues(data: SummitData, pick: (s: Session) => string[]): string[] {
  const set = new Set<string>();
  data.sessions.forEach((s) => pick(s).forEach((v) => v && set.add(v)));
  return [...set];
}

export const ROLE_ORDER = ['Teachers', 'Tech Coaches', 'Technology Directors', 'Department Supervisors', 'Building Administrators', 'Directors / Asst. Superintendents', 'Superintendents', 'Other'];
export const GRADE_ORDER = ['Elementary', 'K-8', 'Secondary (6-12)', 'All grades', 'Leaders / System-level'];
export const LEVEL_ORDER = ['Open to All', 'Some AI Experience Suggested'];
export const FORMAT_ORDER = ['Interactive', 'Presentation', 'Conversation', 'Panel Discussion'];

export function ordered(values: string[], order: string[]): string[] {
  return [...values].sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
}

// ----------------------------------------------------------------------------- pathfinder
export type Profile = {
  role: string;
  experience: 'new' | 'comfortable' | 'advanced' | '';
  pathways: string[];
  grade: string;
  style: 'hands-on' | 'listen' | 'discuss' | '';
};

export const emptyProfile: Profile = { role: '', experience: '', pathways: [], grade: '', style: '' };

export function scoreSession(s: Session, p: Profile): { score: number; reasons: string[] } {
  let score = 0; const reasons: string[] = [];
  if (s.isTBA) score -= 5;
  if (p.pathways.length) {
    if (p.pathways.includes(s.pathway)) { score += 4; reasons.push(s.pathway); }
    else if (p.pathways.includes(s.pathway2)) { score += 2; reasons.push(s.pathway2); }
    else score -= 1;
  }
  if (p.role) {
    if (s.audience.includes(p.role)) { score += 2.5; reasons.push(`For ${p.role.toLowerCase()}`); }
    else if (s.audience.length) score -= 2;
  }
  if (p.experience === 'new') {
    if (s.level === 'Open to All') { score += 1.5; reasons.push('Beginner-friendly'); } else score -= 1.5;
  } else if (p.experience === 'advanced') {
    if (s.level !== 'Open to All') { score += 1.5; reasons.push('Goes deeper'); }
  }
  if (p.grade) {
    if (s.grade === p.grade) { score += 2; reasons.push(s.grade); }
    else if (s.grade === 'All grades') score += 0.5;
    else if (p.grade === 'Leaders / System-level' && s.audience.some((a) => /superintendent|administrator|director/i.test(a))) score += 1;
    else if (s.grade === 'Leaders / System-level' && p.grade !== 'Leaders / System-level') score -= 1;
  }
  if (p.style === 'hands-on' && s.format === 'Interactive') { score += 1.5; reasons.push('Hands-on'); }
  if (p.style === 'listen' && s.format === 'Presentation') { score += 1.5; reasons.push('Presentation'); }
  if (p.style === 'discuss' && (s.format === 'Conversation' || s.format === 'Panel Discussion')) { score += 1.5; reasons.push('Discussion'); }
  return { score, reasons: [...new Set(reasons)].slice(0, 3) };
}

export type PathStep = { slot: number; picks: { session: Session; score: number; reasons: string[] }[] };

/** Builds a day: top three per slot, avoiding recommending the same session twice when it runs twice. */
export function buildPath(data: SummitData, p: Profile): PathStep[] {
  const used = new Set<string>();
  const steps: PathStep[] = [];
  for (let slot = 1; slot <= 4; slot++) {
    const ranked = sessionsInSlot(data, slot)
      .map((s) => ({ session: s, ...scoreSession(s, p) }))
      .sort((a, b) => b.score - a.score || a.session.title.localeCompare(b.session.title));
    const picks: PathStep['picks'] = [];
    for (const r of ranked) {
      if (used.has(r.session.id)) continue;
      picks.push(r);
      if (picks.length === 3) break;
    }
    if (picks[0]) used.add(picks[0].session.id);
    steps.push({ slot, picks });
  }
  return steps;
}

// ----------------------------------------------------------------------------- scrolling
/** Animated scroll that doesn't rely on the browser's native smooth scrolling (which some environments disable). */
export function scrollToEl(el: HTMLElement | null, offset = 72, duration = 650) {
  if (!el) return;
  const startY = window.scrollY;
  const targetY = Math.max(0, el.getBoundingClientRect().top + startY - offset);
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduce || Math.abs(targetY - startY) < 2) { window.scrollTo(0, targetY); return; }
  const t0 = performance.now();
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let ticked = false;
  const step = (now: number) => {
    ticked = true;
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, startY + (targetY - startY) * ease(p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  // If frames are throttled (background tab, some embedded webviews), jump instead of stalling.
  setTimeout(() => { if (!ticked) window.scrollTo(0, targetY); }, 150);
}
