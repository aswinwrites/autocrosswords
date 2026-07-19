import fs from "node:fs";
import path from "node:path";
import type { Puzzle, PuzzleSummary } from "@/types/puzzle";

const PUZZLES_DIR = path.join(process.cwd(), "data", "puzzles");

let cache: Puzzle[] | null = null;

/**
 * Loads every *.json file from data/puzzles. This is the single integration
 * point for puzzle content: dropping a new well-formed JSON file into that
 * folder is the ONLY step required to add a new puzzle to the app — no
 * code changes, no manifest to edit, no imports to update.
 */
export function getAllPuzzles(): Puzzle[] {
  if (cache) return cache;
  const files = fs
    .readdirSync(PUZZLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const puzzles = files.map((f) => {
    const raw = fs.readFileSync(path.join(PUZZLES_DIR, f), "utf-8");
    return JSON.parse(raw) as Puzzle;
  });
  puzzles.sort((a, b) => a.week - b.week);
  cache = puzzles;
  return puzzles;
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return getAllPuzzles().find((p) => p.id === id);
}

export function getPuzzleSummaries(): PuzzleSummary[] {
  return getAllPuzzles().map((p) => ({
    id: p.id,
    week: p.week,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    theme: p.theme,
    estimatedTime: p.estimatedTime,
    clueCount: p.across.length + p.down.length,
  }));
}

export function getAllPuzzleIds(): string[] {
  return getAllPuzzles().map((p) => p.id);
}

export { DIFFICULTY_ORDER, DIFFICULTY_MULTIPLIER } from "@/lib/difficulty";
