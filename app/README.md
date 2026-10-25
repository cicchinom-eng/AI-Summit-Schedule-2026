# NJ AI Literacy Summit 2026 — schedule app

A static web app (Vite + React) that renders the Summit schedule straight from the Google Sheet
"NJ AI Literacy Summit 2026 — Source of Truth".

## How the live data works
- On every page load (and every 90 seconds while the tab is open) the app downloads each tab of the
  Google Sheet as CSV through Google's public `gviz` endpoint. No server, no API key.
- The Sheet must stay shared as **"Anyone with the link can view"**. If sharing is turned off, the app
  falls back to the copy bundled in `src/data/snapshot.json` and the header badge reads "Offline copy".
- Edits to cell values (names, rooms, titles, descriptions, times, meetup topics, playground exhibits,
  lunch text, keynote info) show up on the site within about a minute, with no code change.
- Adding or removing rows is also fine. What needs a code change: renaming a tab, renaming a header
  row, or inventing a new kind of content the app doesn't know about.
- The Sheet ID lives in `src/data/sheet.ts` (`SHEET_ID`).

## Privacy
- Presenter emails, internal notes, scheduling notes and CFP row numbers are dropped the moment a tab is
  parsed (`PRIVATE_COLUMNS` in `src/data/sheet.ts`) and are never written to the bundled snapshot.
- Keep this repository private: the Sheet is readable by anyone who has its ID, and the ID is in the code.

## Refreshing the bundled snapshot
```
npm run snapshot
```
Downloads every tab from the live Sheet, strips the private columns, and rewrites `src/data/snapshot.json`.
Commit the result. The live fetch always wins, so this only matters for the offline fallback.

## Develop and build
```
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
```

## Deploy
Connect the GitHub repository to a Vercel project with **Root Directory** set to `app`. Vercel detects
Vite automatically; every push to the default branch deploys.
