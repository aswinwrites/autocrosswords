/**
 * Validates every JSON puzzle in data/puzzles against structural rules:
 * grid consistency, connectivity, numbering correctness, no duplicate
 * clue numbers per direction, no orphan cells, matching answer lengths.
 */
import fs from "node:fs";
import path from "node:path";
import type { Puzzle } from "../types/puzzle";

function validatePuzzle(p: Puzzle): string[] {
  const errors: string[] = [];
  if (p.grid.length !== p.rows) errors.push(`rows mismatch: grid has ${p.grid.length}, expected ${p.rows}`);
  for (const row of p.grid) {
    if (row.length !== p.cols) errors.push(`col mismatch in a row: ${row.length} vs ${p.cols}`);
  }

  const allClues = [...p.across, ...p.down];
  if (allClues.length < 10) errors.push(`too few clues: ${allClues.length}`);

  const seenNumbers = new Map<string, number>();
  for (const clue of allClues) {
    const key = `${clue.number}-${clue.direction}`;
    if (seenNumbers.has(key)) errors.push(`duplicate clue number ${clue.number} ${clue.direction}`);
    seenNumbers.set(key, 1);

    // answer must fit in grid at declared position matching stated direction
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === "across" ? clue.startRow : clue.startRow + i;
      const c = clue.direction === "across" ? clue.startCol + i : clue.startCol;
      if (r < 0 || r >= p.rows || c < 0 || c >= p.cols) {
        errors.push(`clue ${clue.number} ${clue.direction} out of bounds`);
        break;
      }
      const cell = p.grid[r][c];
      if (cell !== clue.answer[i]) {
        errors.push(`clue ${clue.number} ${clue.direction} mismatch at letter ${i}: grid has ${cell}, expected ${clue.answer[i]}`);
        break;
      }
    }
    if (!/^[A-Z]+$/.test(clue.answer)) errors.push(`clue ${clue.number} has invalid answer characters: ${clue.answer}`);
    if (clue.answer.length < 3) errors.push(`clue ${clue.number} answer too short: ${clue.answer}`);
    if (!clue.clue || clue.clue.length < 3) errors.push(`clue ${clue.number} missing/short clue text`);
  }

  // duplicate answers across whole puzzle
  const answerSet = new Set<string>();
  for (const clue of allClues) {
    const k = `${clue.answer}-${clue.direction}`;
    if (answerSet.has(k)) errors.push(`duplicate answer ${clue.answer} (${clue.direction})`);
    answerSet.add(k);
  }

  // connectivity check (flood fill over letter cells)
  let total = 0;
  let start: [number, number] | null = null;
  for (let r = 0; r < p.rows; r++)
    for (let c = 0; c < p.cols; c++)
      if (p.grid[r][c] !== null) {
        total++;
        if (!start) start = [r, c];
      }
  if (start) {
    const seen = new Set<string>();
    const stack = [start];
    seen.add(`${start[0]},${start[1]}`);
    while (stack.length) {
      const [r, c] = stack.pop()!;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= p.rows || nc >= p.cols) continue;
        if (p.grid[nr][nc] === null) continue;
        const key = `${nr},${nc}`;
        if (seen.has(key)) continue;
        seen.add(key);
        stack.push([nr, nc]);
      }
    }
    if (seen.size !== total) errors.push(`disconnected islands: reached ${seen.size} of ${total} letter cells`);
  } else {
    errors.push("grid has no letter cells");
  }

  // orphan cells: a letter cell must belong to at least one across word (len>=2) OR down word (len>=2)
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      if (p.grid[r][c] === null) continue;
      const leftOk = c > 0 && p.grid[r][c - 1] !== null;
      const rightOk = c < p.cols - 1 && p.grid[r][c + 1] !== null;
      const upOk = r > 0 && p.grid[r - 1][c] !== null;
      const downOk = r < p.rows - 1 && p.grid[r + 1][c] !== null;
      if (!leftOk && !rightOk && !upOk && !downOk) {
        errors.push(`orphan cell at (${r},${c})`);
      }
    }
  }

  return errors;
}

function main() {
  const dir = path.join(__dirname, "..", "data", "puzzles");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  let failCount = 0;
  for (const file of files) {
    const puzzle: Puzzle = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    const errors = validatePuzzle(puzzle);
    if (errors.length > 0) {
      failCount++;
      console.log(`FAIL ${file}:`);
      errors.forEach((e) => console.log(`   - ${e}`));
    }
  }
  console.log(`\nValidated ${files.length} puzzles, ${failCount} with errors.`);
  if (failCount > 0) process.exit(1);
}

main();
