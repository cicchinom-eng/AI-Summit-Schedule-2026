// Rebuilds src/data/snapshot.json (the offline fallback) from the live Google Sheet.
// Private columns (emails, internal notes) are dropped so they never ship in the bundle.
//   npm run snapshot
import { writeFileSync } from 'node:fs';
import Papa from 'papaparse';

const SHEET_ID = '1_jPBOKWe9my1pKl5CoTi9pkHiabHOe7hM35byaw6t-g';
const TABS = ['Event Info', 'Schedule', 'Keynotes', 'Sessions', 'Pathways', 'Meetups', 'Lunch', 'AI Playground', 'Rooms'];
const PRIVATE_COLUMNS = new Set(['Lead Email', 'Co-Presenter Emails', 'Internal Notes', 'Scheduling Notes', 'CFP Row']);

const out = {};
for (const tab of TABS) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${tab}: HTTP ${res.status}`);
  const text = await res.text();
  if (text.trim().startsWith('<')) throw new Error(`${tab}: sheet is not public`);
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
  out[tab] = data.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !PRIVATE_COLUMNS.has(k)).map(([k, v]) => [k, (v ?? '').toString().trim()])));
  console.log(`${tab}: ${out[tab].length} rows`);
}
const json = JSON.stringify(out, null, 1) + '\n';
if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(json)) throw new Error('Refusing to write: an email address slipped through.');
writeFileSync(new URL('../src/data/snapshot.json', import.meta.url), json);
console.log('Wrote src/data/snapshot.json');
