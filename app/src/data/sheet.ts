import Papa from 'papaparse';
import snapshot from './snapshot.json';
import type { Block, Exhibit, Keynote, LunchOption, Meetup, Pathway, Room, Session, SummitData } from './types';

/** The Google Sheet that drives everything. Must be shared as "Anyone with the link can view". */
export const SHEET_ID = '1_jPBOKWe9my1pKl5CoTi9pkHiabHOe7hM35byaw6t-g';
export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

/** Columns the app never needs and must never hold in memory or ship in the bundle. */
const PRIVATE_COLUMNS = new Set(['Lead Email', 'Co-Presenter Emails', 'Internal Notes', 'Scheduling Notes', 'CFP Row']);

const TABS = ['Event Info', 'Schedule', 'Keynotes', 'Sessions', 'Pathways', 'Meetups', 'Lunch', 'AI Playground', 'Rooms'] as const;
type Tab = (typeof TABS)[number];
type Raw = Record<string, string>;

function csvUrl(tab: Tab) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}&_=${Date.now()}`;
}

async function fetchTab(tab: Tab): Promise<Raw[]> {
  const res = await fetch(csvUrl(tab), { cache: 'no-store' });
  if (!res.ok) throw new Error(`${tab}: HTTP ${res.status}`);
  const text = await res.text();
  if (text.trim().startsWith('<')) throw new Error(`${tab}: sheet is not public`);
  const parsed = Papa.parse<Raw>(text, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
  return parsed.data.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !PRIVATE_COLUMNS.has(k)).map(([k, v]) => [k, (v ?? '').toString().trim()])));
}

const list = (s: string | undefined, sep = ';') => (s ?? '').split(sep).map((x) => x.trim()).filter(Boolean);
const num = (s: string | undefined, d = 0) => { const n = parseInt((s ?? '').toString(), 10); return Number.isFinite(n) ? n : d; };

export function toMinutes(t: string): number {
  const m = /(\d{1,2}):(\d{2})\s*([AP]M)?/i.exec(t ?? '');
  if (!m) return 0;
  let h = parseInt(m[1], 10); const mm = parseInt(m[2], 10); const ap = (m[3] ?? '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  if (!ap && h < 7) h += 12; // "2:00" with no meridiem is afternoon at this event
  return h * 60 + mm;
}

function sessions(rows: Raw[]): Session[] {
  return rows.filter((r) => r['Session ID'] && r['Title']).map((r) => {
    const status = r['Status'] ?? '';
    const slots = list(r['Slots'], ',').map((x) => num(x)).filter((x) => x >= 1 && x <= 4);
    return {
      id: r['Session ID'], title: r['Title'], short: r['Short Title'] || r['Title'],
      pathway: r['Primary Pathway'] ?? '', pathway2: r['Secondary Pathway'] ?? '',
      format: r['Format'] ?? '', level: r['Level'] ?? '', grade: r['Grade Band'] ?? '',
      audience: list(r['Audience']), strands: list(r['Strands']), tools: list(r['Tools Featured']),
      device: r['Bring a Device'] ?? '', runs: num(r['Runs'], slots.length || 1), slots, room: r['Room'] ?? '',
      presenters: r['Presenters (display)'] || r['Lead Presenter'] || '',
      leadName: r['Lead Presenter'] ?? '', leadTitle: r['Lead Title'] ?? '', leadOrg: r['Lead Organization'] ?? '',
      coNames: list(r['Co-Presenters']), coDetails: list(r['Co-Presenter Details']),
      status, needs: r['Needs / Requests'] ?? '',
      description: r['Description'] ?? '',
      isTBA: /tba|placeholder|pending/i.test(status) || /^session title tba/i.test(r['Title']),
    };
  });
}

function blocks(rows: Raw[]): Block[] {
  return rows.filter((r) => r['Block ID']).map((r) => ({
    id: r['Block ID'], label: r['Label'], start: r['Start'], end: r['End'],
    startMin: toMinutes(r['Start']), endMin: toMinutes(r['End']),
    location: r['Location'] ?? '', type: r['Type'] ?? '', order: num(r['Order']), description: r['Description'] ?? '',
  })).sort((a, b) => a.order - b.order);
}

function keynotes(rows: Raw[]): Keynote[] {
  return rows.filter((r) => r['Key']).map((r) => ({
    key: r['Key'], role: r['Role'], name: r['Name'], title: r['Title'], org: r['Organization'], talk: r['Talk Title'],
    time: r['Time'], location: r['Location'], bio: r['Bio'], photo: r['Photo File'], status: r['Status'],
  }));
}

function pathways(rows: Raw[]): Pathway[] {
  return rows.filter((r) => r['Name']).map((r) => ({
    id: r['Pathway ID'], name: r['Name'], color: r['Color (hex)'] || '#64748B', icon: r['Icon'], tagline: r['Tagline'], description: r['Description'], order: num(r['Order']),
  })).sort((a, b) => a.order - b.order);
}

const meetups = (rows: Raw[]): Meetup[] => rows.filter((r) => r['Name']).map((r) => ({ id: r['Meetup ID'], name: r['Name'], kind: r['Kind'], room: r['Room'], description: r['Description'], host: r['Host (optional)'], order: num(r['Order']), status: r['Status'] })).sort((a, b) => a.order - b.order);
const lunch = (rows: Raw[]): LunchOption[] => rows.filter((r) => r['Name']).map((r) => ({ id: r['Option ID'], name: r['Name'], description: r['Description'], link: r['Link / Detail'], order: num(r['Order']) })).sort((a, b) => a.order - b.order);
const playground = (rows: Raw[]): Exhibit[] => rows.filter((r) => r['Name']).map((r) => ({ id: r['Exhibit ID'], name: r['Name'], description: r['Description'], location: r['Location'], order: num(r['Order']), status: r['Status'] })).sort((a, b) => a.order - b.order);
const rooms = (rows: Raw[]): Room[] => rows.filter((r) => r['Room']).map((r) => ({ room: r['Room'], wing: r['Wing / Floor'], kind: r['Kind'], notes: r['Notes'] }));
const info = (rows: Raw[]) => Object.fromEntries(rows.filter((r) => r['Key']).map((r) => [r['Key'], r['Value']]));

function assemble(raw: Record<Tab, Raw[]>, source: 'live' | 'snapshot'): SummitData {
  return {
    info: info(raw['Event Info']), blocks: blocks(raw['Schedule']), keynotes: keynotes(raw['Keynotes']), sessions: sessions(raw['Sessions']),
    pathways: pathways(raw['Pathways']), meetups: meetups(raw['Meetups']), lunch: lunch(raw['Lunch']), playground: playground(raw['AI Playground']),
    rooms: rooms(raw['Rooms']), source, fetchedAt: new Date(),
  };
}

export function loadSnapshot(): SummitData {
  return assemble(snapshot as unknown as Record<Tab, Raw[]>, 'snapshot');
}

export async function loadLive(): Promise<SummitData> {
  const entries = await Promise.all(TABS.map(async (t) => [t, await fetchTab(t)] as const));
  const raw = Object.fromEntries(entries) as Record<Tab, Raw[]>;
  if (!raw['Sessions']?.length || !raw['Schedule']?.length) throw new Error('Sheet returned no rows');
  return assemble(raw, 'live');
}
