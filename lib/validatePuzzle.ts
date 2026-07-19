import type { Puzzle } from "@/types/puzzle";

export function validatePuzzleStructure(p: Puzzle): string[] {
  const errors: string[] = [];
  if (!p.id) errors.push("Missing id");
  if (!p.title) errors.push("Missing title");
  if (p.grid.length !== p.rows) errors.push(`rows mismatch: grid has ${p.grid.length} rows, expected ${p.rows}`);
  for (const row of p.grid) {
    if (row.length !== p.cols) errors.push(`column count mismatch: row has ${row.length}, expected ${p.cols}`);
  }

  const allClues = [...p.across, ...p.down];
  if (allClues.length < 1) errors.push("Puzzle has no clues");

  const seen = new Set<string>();
  for (const clue of allClues) {
    const key = `${clue.number}-${clue.direction}`;
    if (seen.has(key)) errors.push(`Duplicate clue number ${clue.number} ${clue.direction}`);
    seen.add(key);
    if (!/^[A-Z]+$/.test(clue.answer)) errors.push(`Clue ${clue.number} (${clue.direction}) has invalid characters in answer`);
    if (clue.answer.length < 2) errors.push(`Clue ${clue.number} (${clue.direction}) answer too short`);
    if (!clue.clue || clue.clue.trim().length < 3) errors.push(`Clue ${clue.number} (${clue.direction}) is missing clue text`);
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === "across" ? clue.startRow : clue.startRow + i;
      const c = clue.direction === "across" ? clue.startCol + i : clue.startCol;
      if (r < 0 || r >= p.rows || c < 0 || c >= p.cols) {
        errors.push(`Clue ${clue.number} (${clue.direction}) goes out of grid bounds`);
        break;
      }
      const cell = p.grid[r][c];
      if (cell !== clue.answer[i]) {
        errors.push(`Clue ${clue.number} (${clue.direction}) letter ${i + 1} doesn't match the grid`);
        break;
      }
    }
  }

  // connectivity / orphan check
  let total = 0;
  let start: [number, number] | null = null;
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      if (p.grid[r][c] !== null) {
        total++;
        if (!start) start = [r, c];
        const leftOk = c > 0 && p.grid[r][c - 1] !== null;
        const rightOk = c < p.cols - 1 && p.grid[r][c + 1] !== null;
        const upOk = r > 0 && p.grid[r - 1][c] !== null;
        const downOk = r < p.rows - 1 && p.grid[r + 1][c] !== null;
        if (!leftOk && !rightOk && !upOk && !downOk) errors.push(`Orphan cell at row ${r + 1}, col ${c + 1}`);
      }
    }
  }
  if (start) {
    const seenCells = new Set<string>();
    const stack: [number, number][] = [start];
    seenCells.add(`${start[0]},${start[1]}`);
    while (stack.length) {
      const [r, c] = stack.pop()!;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= p.rows || nc >= p.cols) continue;
        if (p.grid[nr][nc] === null) continue;
        const key = `${nr},${nc}`;
        if (seenCells.has(key)) continue;
        seenCells.add(key);
        stack.push([nr, nc]);
      }
    }
    if (seenCells.size !== total) errors.push(`Grid has disconnected islands (${seenCells.size} of ${total} cells reachable)`);
  }

  return errors;
}

export function computeNumbering(rows: number, cols: number, grid: (string | null)[][]) {
  const numberAt: (number | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  let counter = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === null) continue;
      const startsAcross = (c === 0 || grid[r][c - 1] === null) && c + 1 < cols && grid[r][c + 1] !== null;
      const startsDown = (r === 0 || grid[r - 1][c] === null) && r + 1 < rows && grid[r + 1][c] !== null;
      if (startsAcross || startsDown) {
        counter++;
        numberAt[r][c] = counter;
      }
    }
  }
  return numberAt;
}
