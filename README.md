# Autocrosswords

A production-ready, entirely static crossword puzzle platform for automotive enthusiasts — cars, motorcycles, aircraft, Formula 1, MotoGP, rally, Le Mans, and automotive history. Built with Next.js (App Router, static export), TypeScript, Tailwind CSS, shadcn-style components, Framer Motion, and Zustand. No backend, no database — everything runs and persists in the browser.

Ships with **52 handcrafted-style puzzles**, one per week of the year, generated from a curated automotive clue bank and validated for structural correctness (connectivity, numbering, no orphan cells, no duplicate clues).

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build       # static export to /out
npm run lint         # ESLint
npm run validate:puzzles   # structural validation of every puzzle JSON
npm run generate:puzzles   # regenerate the 52 shipped puzzles from the word banks (optional)
```

The build target is `output: "export"` in `next.config.mjs`, so `npm run build` produces a fully static site in `/out` — no Node server required at runtime.

## Architecture

```
app/                     Next.js App Router pages (all statically exported)
  page.tsx               Home screen
  puzzles/page.tsx        Puzzle library, search & filters
  play/[id]/page.tsx      Crossword gameplay (generateStaticParams over all puzzle ids)
  daily/page.tsx          Daily challenge (deterministic daily puzzle + streaks)
  stats/page.tsx          Statistics dashboard
  achievements/page.tsx   Achievement gallery
  admin/page.tsx          Local-only puzzle builder (not linked from nav)

components/
  crossword/              Grid, Cell rendering, clue bar/list, toolbar, hints, end screen
  home/, puzzles/, stats/, daily/   Page-level client views
  layout/                 Header, animated background
  ui/                     Small shadcn-style primitives (button, card, dialog, tabs, ...)

lib/
  puzzles.ts              Server-side loader — reads every file in data/puzzles at build time
  difficulty.ts           Difficulty ordering/multipliers (client-safe, no fs)
  scoring.ts               Score breakdown calculation
  achievements.ts          Achievement definitions + unlock checks
  validatePuzzle.ts        Client-safe structural validator (used by the admin builder)
  sound.ts                 WebAudio-based sound effects (no audio files to ship)
  store/
    useGameStore.ts         Ephemeral gameplay state (grid, cursor, timer, hints)
    useProgressStore.ts      Persisted state (localStorage): results, streaks, unlocks,
                             achievements, preferences, in-progress saves

data/
  puzzles/puzzle-001.json … puzzle-052.json   The 52 shipped puzzles
  wordbanks/index.ts        Curated automotive clue banks, organized by category

scripts/
  generate-puzzles.ts      Crossword constructor: places words from the word banks into a
                            grid with true intersections, then trims/numbers the result
  validate-puzzles.ts      Structural validator run over every JSON file in data/puzzles

types/
  puzzle.ts                Puzzle, ClueEntry, Difficulty, Category types
  game.ts                  Gameplay/session types (CellState, ScoreBreakdown, PuzzleResult, ...)
```

### How puzzles are loaded

`lib/puzzles.ts` reads every `*.json` file in `data/puzzles/` at build time via `fs.readdirSync`. There is no manifest file listing puzzle ids and no import statement per puzzle — the directory listing *is* the source of truth.

## Adding puzzle #53 (and beyond)

**No code changes are required.** Drop a new file into `data/puzzles/` that matches the `Puzzle` shape in `types/puzzle.ts`:

```jsonc
{
  "id": "puzzle-053",
  "week": 53,
  "title": "My New Puzzle",
  "difficulty": "Medium",       // Easy | Medium | Hard | Expert | Legend
  "category": "Formula 1",       // one of the Category union in types/puzzle.ts
  "theme": "Formula 1",
  "rows": 13,
  "cols": 13,
  "grid": [ /* rows x cols, each cell is an uppercase letter string or null for a block */ ],
  "across": [ { "number": 1, "answer": "TURBO", "clue": "...", "startRow": 0, "startCol": 0, "direction": "across" } ],
  "down": [ /* ... */ ],
  "author": "Your Name",
  "estimatedTime": 8
}
```

Two ways to build that file:

1. **Use the built-in Puzzle Builder** at `/admin` (`npm run dev`, then visit `/admin`). It has a grid editor (click to toggle blocks, type letters), automatic numbering, a clue editor bound to every numbered cell, one-click **Validate**, and **Export JSON** / **Import JSON**. This route is intentionally left out of the main navigation — it's a local authoring tool, not a public page.
2. **Extend the generator.** Add clue/answer pairs to `data/wordbanks/index.ts` under an existing (or new) category, add the week to the schedule in `scripts/generate-puzzles.ts`, and run `npm run generate:puzzles`.

Either way, run `npm run validate:puzzles` before shipping — it checks grid/row/column consistency, duplicate clue numbers, out-of-bounds or mismatched answers, orphan cells, and disconnected islands.

Puzzles are picked up automatically the next time the app builds (or, in dev mode, on next request) — nothing else in the codebase references puzzle ids directly except the generated list of static params for `/play/[id]`, which is also derived automatically from the files on disk.

## Gameplay features

- Full keyboard navigation: arrow keys move the cursor, typing auto-advances, Backspace moves back, Tab/Shift+Tab jumps between clues, Space toggles across/down.
- Click a clue to highlight its word; click a cell to select it (click again to flip direction).
- Three checking modes (Live, Manual, None) — configurable in-game.
- Three hints per puzzle: reveal letter, reveal word, reveal first letter of a clue — each reduces the final score.
- Live timer with pause/resume.
- Animated cell feedback (correct flash, wrong shake, number pop, gold shimmer on completion) via Framer Motion.
- Optional muted-by-default sound effects synthesized with the Web Audio API (no audio assets to host).
- Accessible: ARIA labels on every grid cell, full keyboard operability, high-contrast mode, large-font mode, and a colorblind-friendly palette toggle (all under user preferences, persisted).
- Fully responsive: the grid scales to viewport width on tablet/mobile; the clue bar stays above the fold so a mobile keyboard never hides it.

## Progression & persistence

Everything is stored in `localStorage` under the `autocrosswords-progress` key via a persisted Zustand store: completed puzzle results and scores, unlock state (only Week 1 is unlocked initially; completing a puzzle unlocks the next), hint usage, best times, in-progress grids (for "Continue"), daily-challenge streaks, earned achievements, and preferences (theme, sound, check mode, accessibility toggles). "Free Play" in the puzzle library lets you open any puzzle regardless of unlock state.

## Scoring

Base score of 1000, with bonuses for finishing well under the estimated time, zero hints, zero mistakes, higher difficulty, and daily-challenge completions; penalties for mistakes, letter reveals, word/clue reveals, and very slow solves. The end screen animates the full breakdown line by line.

## Deployment

### Vercel (recommended)

1. Push this repository to GitHub.
2. Import it in Vercel — no environment variables are required.
3. Framework preset: Next.js. Build command: `npm run build`. Output directory: `out` (static export).

### Any static host

`npm run build` produces a fully static `/out` directory (HTML/CSS/JS only) that can be served from GitHub Pages, Netlify, S3, or any static file host.

### Environment variables

None. The app has no backend, no API keys, and no secrets.

## Roadmap (architected for, not yet built)

The data model and store boundaries were deliberately kept generic so these can be added without refactoring the puzzle/game core:

- Online leaderboards (the end screen already has a placeholder slot)
- Accounts / cloud sync of the existing localStorage progress shape
- Multiplayer race mode
- Timed tournaments
- Community-submitted puzzles (the JSON schema and validator already support arbitrary user-authored puzzles)
- A public-facing version of the puzzle editor
- Seasonal/limited-time events layered on top of the existing category system

## Tech stack

Next.js 14 (App Router, static export) · TypeScript · Tailwind CSS · Radix UI primitives (shadcn-style components) · Framer Motion · Zustand · Lucide icons · Recharts (stats radar chart) · canvas-confetti.
