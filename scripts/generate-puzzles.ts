/**
 * Autocrosswords puzzle generator.
 * Builds 52 valid, fully-connected crossword grids from curated automotive
 * word banks and writes them to data/puzzles/puzzle-0XX.json.
 *
 * Adding puzzle #53+ never requires touching this script: just drop a new
 * hand-authored or generated JSON file that matches types/puzzle.ts into
 * data/puzzles/. This script exists purely to produce the initial 52.
 */
import fs from "node:fs";
import path from "node:path";
import { banks, WordClue } from "../data/wordbanks/index";
import type { Puzzle, ClueEntry, Difficulty, Category, GridCell } from "../types/puzzle";

// ---------- deterministic PRNG ----------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}
function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- difficulty configuration ----------
const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; minClues: number; maxClues: number; estMinutes: [number, number] }> = {
  Easy: { size: 13, minClues: 15, maxClues: 18, estMinutes: [4, 7] },
  Medium: { size: 15, minClues: 17, maxClues: 22, estMinutes: [7, 11] },
  Hard: { size: 17, minClues: 19, maxClues: 25, estMinutes: [10, 15] },
  Expert: { size: 19, minClues: 20, maxClues: 27, estMinutes: [14, 20] },
  Legend: { size: 21, minClues: 20, maxClues: 30, estMinutes: [18, 26] },
};

// ---------- 52-week schedule: category + difficulty, gradually escalating ----------
const CATEGORY_ORDER: Category[] = [
  "Classic Cars", "Formula 1", "Motorcycles", "Aircraft", "Luxury Cars",
  "Japanese Cars", "American Muscle", "German Engineering", "Indian Automobiles",
  "Movie Cars", "Supercars", "Electric Vehicles", "Engine Technology", "Car Logos",
  "Rally", "MotoGP", "Le Mans", "History", "Military Vehicles", "Concept Cars",
  "Car Culture", "Mixed",
];

function difficultyForWeek(week: number): Difficulty {
  if (week <= 10) return "Easy";
  if (week <= 22) return "Medium";
  if (week <= 36) return "Hard";
  if (week <= 46) return "Expert";
  return "Legend";
}

function categoryForWeek(week: number): Category {
  // Walk the category list repeatedly, offsetting each lap so the same
  // category never repeats back-to-back and cycles evenly across 52 weeks.
  const lap = Math.floor((week - 1) / CATEGORY_ORDER.length);
  const idx = (week - 1 + lap * 7) % CATEGORY_ORDER.length;
  return CATEGORY_ORDER[idx];
}

interface Placement {
  answer: string;
  clue: string;
  row: number;
  col: number;
  dir: "across" | "down";
}

function cleanAnswer(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, "");
}

function canPlace(
  grid: (string | null)[][],
  claimedAcross: boolean[][],
  claimedDown: boolean[][],
  size: number,
  word: string,
  row: number,
  col: number,
  dir: "across" | "down"
): boolean {
  const len = word.length;
  if (dir === "across") {
    if (col < 0 || col + len > size || row < 0 || row >= size) return false;
    // cell before/after must be out of bounds or block
    if (col - 1 >= 0 && grid[row][col - 1] !== null) return false;
    if (col + len < size && grid[row][col + len] !== null) return false;
    for (let i = 0; i < len; i++) {
      const cell = grid[row][col + i];
      // never allow two across words to share a row range
      if (claimedAcross[row][col + i]) return false;
      if (cell !== null) {
        if (cell !== word[i]) return false;
      } else {
        const above = row - 1 >= 0 ? grid[row - 1][col + i] : null;
        const below = row + 1 < size ? grid[row + 1][col + i] : null;
        if (above !== null || below !== null) return false;
      }
    }
    return true;
  } else {
    if (row < 0 || row + len > size || col < 0 || col >= size) return false;
    if (row - 1 >= 0 && grid[row - 1][col] !== null) return false;
    if (row + len < size && grid[row + len][col] !== null) return false;
    for (let i = 0; i < len; i++) {
      const cell = grid[row + i][col];
      if (claimedDown[row + i][col]) return false;
      if (cell !== null) {
        if (cell !== word[i]) return false;
      } else {
        const left = col - 1 >= 0 ? grid[row + i][col - 1] : null;
        const right = col + 1 < size ? grid[row + i][col + 1] : null;
        if (left !== null || right !== null) return false;
      }
    }
    return true;
  }
}

function place(
  grid: (string | null)[][],
  claimedAcross: boolean[][],
  claimedDown: boolean[][],
  word: string,
  row: number,
  col: number,
  dir: "across" | "down"
) {
  for (let i = 0; i < word.length; i++) {
    if (dir === "across") {
      grid[row][col + i] = word[i];
      claimedAcross[row][col + i] = true;
    } else {
      grid[row + i][col] = word[i];
      claimedDown[row + i][col] = true;
    }
  }
}

function findIntersections(
  grid: (string | null)[][],
  claimedAcross: boolean[][],
  claimedDown: boolean[][],
  size: number,
  word: string
): { row: number; col: number; dir: "across" | "down" }[] {
  const candidates: { row: number; col: number; dir: "across" | "down" }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const existing = grid[r][c];
      if (existing === null) continue;
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== existing) continue;
        // try placing across, so that word[i] lands at (r,c)
        const acrossCol = c - i;
        if (canPlace(grid, claimedAcross, claimedDown, size, word, r, acrossCol, "across")) {
          candidates.push({ row: r, col: acrossCol, dir: "across" });
        }
        const downRow = r - i;
        if (canPlace(grid, claimedAcross, claimedDown, size, word, downRow, c, "down")) {
          candidates.push({ row: downRow, col: c, dir: "down" });
        }
      }
    }
  }
  return candidates;
}

function buildGrid(size: number, words: WordClue[], rnd: () => number, targetCount: number): Placement[] {
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const claimedAcross: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const claimedDown: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const placements: Placement[] = [];
  const pool = shuffle(
    words.map(([a, c]) => [cleanAnswer(a), c] as WordClue).filter(([a]) => a.length >= 3 && a.length <= size),
    rnd
  );
  // sort longest-first for a strong scaffold, but keep some shuffle entropy
  pool.sort((a, b) => b[0].length - a[0].length || rnd() - 0.5);

  const used = new Set<string>();
  // seed with the longest word, centered across the middle row
  const [seedWord, seedClue] = pool[0];
  const seedRow = Math.floor(size / 2);
  const seedCol = Math.floor((size - seedWord.length) / 2);
  place(grid, claimedAcross, claimedDown, seedWord, seedRow, seedCol, "across");
  placements.push({ answer: seedWord, clue: seedClue, row: seedRow, col: seedCol, dir: "across" });
  used.add(seedWord);

  for (let attempt = 0; attempt < 25 && placements.length < targetCount; attempt++) {
    const remaining = shuffle(pool.filter(([w]) => !used.has(w)), rnd);
    let placedThisPass = 0;
    for (const [word, clue] of remaining) {
      if (placements.length >= targetCount) break;
      if (used.has(word)) continue;
      const candidates = findIntersections(grid, claimedAcross, claimedDown, size, word);
      if (candidates.length === 0) continue;
      const choice = candidates[Math.floor(rnd() * candidates.length)];
      place(grid, claimedAcross, claimedDown, word, choice.row, choice.col, choice.dir);
      placements.push({ answer: word, clue, row: choice.row, col: choice.col, dir: choice.dir });
      used.add(word);
      placedThisPass++;
    }
    if (placedThisPass === 0) break;
  }
  return placements;
}

function trimAndNumber(size: number, placements: Placement[]): { rows: number; cols: number; grid: GridCell[][]; across: ClueEntry[]; down: ClueEntry[] } {
  let minR = size, maxR = -1, minC = size, maxC = -1;
  for (const p of placements) {
    if (p.dir === "across") {
      minR = Math.min(minR, p.row); maxR = Math.max(maxR, p.row);
      minC = Math.min(minC, p.col); maxC = Math.max(maxC, p.col + p.answer.length - 1);
    } else {
      minR = Math.min(minR, p.row); maxR = Math.max(maxR, p.row + p.answer.length - 1);
      minC = Math.min(minC, p.col); maxC = Math.max(maxC, p.col);
    }
  }
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const grid: GridCell[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const adj = placements.map((p) => ({ ...p, row: p.row - minR, col: p.col - minC }));
  for (const p of adj) {
    for (let i = 0; i < p.answer.length; i++) {
      if (p.dir === "across") grid[p.row][p.col + i] = p.answer[i];
      else grid[p.row + i][p.col] = p.answer[i];
    }
  }
  // numbering: scan row-major
  const numberAt: (number | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  let counter = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === null) continue;
      const startsAcross = grid[r][c] !== null && (c === 0 || grid[r][c - 1] === null) && c + 1 < cols && grid[r][c + 1] !== null;
      const startsDown = grid[r][c] !== null && (r === 0 || grid[r - 1][c] === null) && r + 1 < rows && grid[r + 1][c] !== null;
      if (startsAcross || startsDown) {
        counter++;
        numberAt[r][c] = counter;
      }
    }
  }
  const across: ClueEntry[] = [];
  const down: ClueEntry[] = [];
  for (const p of adj) {
    const num = numberAt[p.row][p.col];
    if (num == null) continue; // shouldn't happen
    const entry: ClueEntry = {
      number: num,
      answer: p.answer,
      clue: p.clue,
      startRow: p.row,
      startCol: p.col,
      direction: p.dir,
    };
    if (p.dir === "across") across.push(entry);
    else down.push(entry);
  }
  across.sort((a, b) => a.number - b.number);
  down.sort((a, b) => a.number - b.number);
  return { rows, cols, grid, across, down };
}

function isConnected(rows: number, cols: number, grid: GridCell[][]): boolean {
  let start: [number, number] | null = null;
  let total = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] !== null) {
        total++;
        if (!start) start = [r, c];
      }
  if (!start) return false;
  const seen = new Set<string>();
  const stack: [number, number][] = [start];
  seen.add(`${start[0]},${start[1]}`);
  while (stack.length) {
    const [r, c] = stack.pop()!;
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]] as const) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === null) continue;
      const key = `${nr},${nc}`;
      if (seen.has(key)) continue;
      seen.add(key);
      stack.push([nr, nc]);
    }
  }
  return seen.size === total;
}

function generatePuzzle(week: number): Puzzle {
  const difficulty = difficultyForWeek(week);
  const category = categoryForWeek(week);
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const seed = hashString(`autocrosswords-week-${week}-${category}`);
  const rnd = mulberry32(seed);
  const bank = banks[category];
  if (!bank) throw new Error(`No word bank for category ${category}`);

  let best: ReturnType<typeof trimAndNumber> | null = null;
  let bestCount = -1;
  for (let trial = 0; trial < 40; trial++) {
    const trialRnd = mulberry32(seed + trial * 7919);
    const placements = buildGrid(cfg.size, bank, trialRnd, cfg.maxClues);
    const built = trimAndNumber(cfg.size, placements);
    if (!isConnected(built.rows, built.cols, built.grid)) continue;
    const count = built.across.length + built.down.length;
    if (count > bestCount) {
      bestCount = count;
      best = built;
    }
    if (count >= cfg.maxClues) break;
  }
  if (!best || bestCount < 10) throw new Error(`Failed to generate a valid grid for week ${week} (${category}) — best had ${bestCount} clues`);

  const idNum = String(week).padStart(3, "0");
  const estimatedTime = Math.round(cfg.estMinutes[0] + rnd() * (cfg.estMinutes[1] - cfg.estMinutes[0]));

  return {
    id: `puzzle-${idNum}`,
    week,
    title: `${category} — Week ${week}`,
    difficulty,
    category,
    theme: category,
    rows: best.rows,
    cols: best.cols,
    grid: best.grid,
    across: best.across,
    down: best.down,
    author: "Autocrosswords Studio",
    estimatedTime,
  };
}

function main() {
  const outDir = path.join(__dirname, "..", "data", "puzzles");
  fs.mkdirSync(outDir, { recursive: true });
  const summaries: { week: number; category: string; difficulty: string; clues: number }[] = [];
  for (let week = 1; week <= 52; week++) {
    const puzzle = generatePuzzle(week);
    const file = path.join(outDir, `${puzzle.id}.json`);
    fs.writeFileSync(file, JSON.stringify(puzzle, null, 2) + "\n");
    summaries.push({
      week,
      category: puzzle.category,
      difficulty: puzzle.difficulty,
      clues: puzzle.across.length + puzzle.down.length,
    });
    console.log(`Week ${String(week).padStart(2, "0")}: ${puzzle.category} (${puzzle.difficulty}) — ${puzzle.across.length + puzzle.down.length} clues, ${puzzle.rows}x${puzzle.cols}`);
  }
  console.log(`\nGenerated ${summaries.length} puzzles into ${outDir}`);
}

main();
