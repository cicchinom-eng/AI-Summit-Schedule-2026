import type { Block, Track, Session, ConferenceData } from './types';

/** Total number of breakout slots across all days. */
export function totalSlots(data: ConferenceData): number {
  return data.blocks.filter((b) => b.type === 'breakout').length;
}

export function slotBlock(data: ConferenceData, slot: number): Block | undefined {
  return data.blocks.find((b) => b.id === `slot${slot}`);
}

export function slotTime(data: ConferenceData, slot: number): string {
  const b = slotBlock(data, slot);
  return b ? `${b.start} – ${b.end}` : '';
}

export function slotLabel(data: ConferenceData, slot: number): string {
  const b = slotBlock(data, slot);
  return b?.label ?? `Breakout ${slot}`;
}

export function dayOfSlot(data: ConferenceData, slot: number): number {
  const b = slotBlock(data, slot);
  return b?.day ?? 1;
}

export function slotsForDay(data: ConferenceData, day: number): number[] {
  return data.blocks
    .filter((b) => b.day === day && b.type === 'breakout')
    .map((b) => parseInt(b.id.replace('slot', ''), 10))
    .sort((a, b) => a - b);
}

export function blocksForDay(data: ConferenceData, day: number): Block[] {
  return data.blocks.filter((b) => b.day === day).sort((a, b) => a.order - b.order);
}

export function numDays(data: ConferenceData): number {
  return parseInt(data.info.num_days ?? '3', 10);
}

export function dayName(data: ConferenceData, day: number): string {
  return data.info[`day${day}_name`] ?? `Day ${day}`;
}

export function dayDate(data: ConferenceData, day: number): string {
  return data.info[`day${day}_date`] ?? '';
}

export function sessionsInSlot(data: ConferenceData, slot: number): Session[] {
  return data.sessions.filter((s) => s.slots.includes(slot)).sort(byTitle);
}

export const byTitle = (a: Session, b: Session) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });

export function trackOf(data: ConferenceData, name: string): Track | undefined {
  return data.tracks.find((t) => t.name === name);
}

export function trackColor(data: ConferenceData, name: string): string {
  return trackOf(data, name)?.color ?? '#64748B';
}

export function sessionRooms(data: ConferenceData) {
  return data.rooms.filter((r) => r.kind === 'Breakout');
}

export function roomMapForSlot(data: ConferenceData, slot: number): Map<string, Session> {
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
    const m = /^(.*?)\s*\(slot\s*(\d+)\)/i.exec(p);
    if (m && parseInt(m[2], 10) === slot) return m[1].trim();
  }
  return parts[0].replace(/\(.*?\)/, '').trim();
}

// ----------------------------------------------------------------------------- time
export function eventStartDate(data: ConferenceData): Date | null {
  const iso = data.info.event_start_iso;
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

export function eventEndDate(data: ConferenceData): Date | null {
  const iso = data.info.event_end_iso;
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

export function isEventDay(data: ConferenceData, now: Date): boolean {
  const start = eventStartDate(data);
  const end = eventEndDate(data);
  if (!start || !end) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return today >= start && today <= end;
}

export function currentDayNumber(data: ConferenceData, now: Date): number | null {
  const start = eventStartDate(data);
  if (!start) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const days = numDays(data);
  if (diff >= 0 && diff < days) return diff + 1;
  return null;
}

export function minutesOf(d: Date) { return d.getHours() * 60 + d.getMinutes(); }

export function fmtMinutes(min: number): string {
  const h24 = Math.floor(min / 60), mm = min % 60;
  const ap = h24 >= 12 ? 'PM' : 'AM';
  const h = ((h24 + 11) % 12) + 1;
  return `${h}:${mm.toString().padStart(2, '0')} ${ap}`;
}

export function currentBlocks(data: ConferenceData, min: number, day: number): Block[] {
  return blocksForDay(data, day).filter((b) => min >= b.startMin && min < b.endMin);
}

export function currentSlot(data: ConferenceData, min: number, day: number): number | null {
  const slots = slotsForDay(data, day);
  for (const slot of slots) {
    const b = slotBlock(data, slot);
    if (b && min >= b.startMin - 5 && min < b.endMin) return slot;
  }
  return null;
}

export function nextSlot(data: ConferenceData, min: number, day: number): number | null {
  const slots = slotsForDay(data, day);
  for (const slot of slots) {
    const b = slotBlock(data, slot);
    if (b && min < b.startMin) return slot;
  }
  return null;
}

// ----------------------------------------------------------------------------- filtering
export type Filters = {
  q: string;
  tracks: string[];
  levels: string[];
  roles: string[];
  formats: string[];
  tags: string[];
  starredOnly: boolean;
};

export const emptyFilters: Filters = { q: '', tracks: [], levels: [], roles: [], formats: [], tags: [], starredOnly: false };

export function countActive(f: Filters): number {
  return f.tracks.length + f.levels.length + f.roles.length + f.formats.length + f.tags.length + (f.starredOnly ? 1 : 0) + (f.q ? 1 : 0);
}

export function applyFilters(list: Session[], f: Filters, stars: Set<string>): Session[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((s) => {
    if (f.starredOnly && !stars.has(s.id)) return false;
    if (f.tracks.length && !f.tracks.includes(s.track) && !f.tracks.includes(s.track2)) return false;
    if (f.levels.length && !f.levels.includes(s.level)) return false;
    if (f.roles.length && !f.roles.some((r) => s.audience.includes(r))) return false;
    if (f.formats.length && !f.formats.includes(s.format)) return false;
    if (f.tags.length && !f.tags.some((t) => s.tags.includes(t))) return false;
    if (q) {
      const hay = [s.title, s.short, s.presenters, s.leadOrg, s.description, s.tools.join(' '), s.track, s.track2, s.room, s.tags.join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function uniqueValues(data: ConferenceData, pick: (s: Session) => string[]): string[] {
  const set = new Set<string>();
  data.sessions.forEach((s) => pick(s).forEach((v) => v && set.add(v)));
  return [...set];
}

export const ROLE_ORDER = ['Technology Directors', 'Superintendents', 'Asst. Superintendents', 'Curriculum Directors', 'Building Principals', 'IT Staff', 'Instructional Coaches', 'Teachers'];
export const LEVEL_ORDER = ['Introductory', 'Intermediate', 'Advanced'];
export const FORMAT_ORDER = ['Workshop', 'Presentation', 'Panel Discussion', 'Roundtable'];

export function ordered(values: string[], order: string[]): string[] {
  return [...values].sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
}

// ----------------------------------------------------------------------------- pathfinder
export type Profile = {
  role: string;
  experience: 'new' | 'intermediate' | 'advanced' | '';
  tracks: string[];
  scope: string;
  style: 'hands-on' | 'listen' | 'discuss' | '';
};

export const emptyProfile: Profile = { role: '', experience: '', tracks: [], scope: '', style: '' };

export function scoreSession(s: Session, p: Profile): { score: number; reasons: string[] } {
  let score = 0; const reasons: string[] = [];
  if (s.isTBA) score -= 5;
  if (p.tracks.length) {
    if (p.tracks.includes(s.track)) { score += 4; reasons.push(s.track); }
    else if (p.tracks.includes(s.track2)) { score += 2; reasons.push(s.track2); }
    else score -= 1;
  }
  if (p.role) {
    if (s.audience.includes(p.role)) { score += 2.5; reasons.push(`For ${p.role.toLowerCase()}`); }
    else if (s.audience.length) score -= 2;
  }
  if (p.experience === 'new') {
    if (s.level === 'Introductory') { score += 1.5; reasons.push('Introductory'); } else if (s.level === 'Advanced') score -= 1.5;
  } else if (p.experience === 'advanced') {
    if (s.level === 'Advanced') { score += 1.5; reasons.push('Advanced'); } else if (s.level === 'Introductory') score -= 1;
  } else if (p.experience === 'intermediate') {
    if (s.level === 'Intermediate') { score += 1; reasons.push('Intermediate'); }
  }
  if (p.style === 'hands-on' && s.format === 'Workshop') { score += 1.5; reasons.push('Hands-on'); }
  if (p.style === 'listen' && s.format === 'Presentation') { score += 1.5; reasons.push('Presentation'); }
  if (p.style === 'discuss' && (s.format === 'Roundtable' || s.format === 'Panel Discussion')) { score += 1.5; reasons.push('Discussion'); }
  return { score, reasons: [...new Set(reasons)].slice(0, 3) };
}

export type PathStep = { slot: number; day: number; picks: { session: Session; score: number; reasons: string[] }[] };

export function buildPath(data: ConferenceData, p: Profile): PathStep[] {
  const used = new Set<string>();
  const steps: PathStep[] = [];
  const days = numDays(data);
  for (let d = 1; d <= days; d++) {
    const slots = slotsForDay(data, d);
    for (const slot of slots) {
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
      steps.push({ slot, day: d, picks });
    }
  }
  return steps;
}

// ----------------------------------------------------------------------------- scrolling
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
    const prog = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, startY + (targetY - startY) * ease(prog));
    if (prog < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  setTimeout(() => { if (!ticked) window.scrollTo(0, targetY); }, 150);
}
