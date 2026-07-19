"use client";

import { create } from "zustand";
import type { Puzzle, ClueEntry, Direction } from "@/types/puzzle";
import type { CellState, CheckMode, HintsUsed } from "@/types/game";

interface GameState {
  puzzle: Puzzle | null;
  cells: CellState[][];
  cursor: { row: number; col: number };
  direction: Direction;
  checkMode: CheckMode;
  hintsRemaining: number;
  hintsUsed: HintsUsed;
  mistakes: number;
  timeSeconds: number;
  isPaused: boolean;
  isComplete: boolean;
  puzzleRevealed: boolean;
  lastAction: { type: "correct" | "wrong" | "complete"; row?: number; col?: number } | null;

  loadPuzzle: (puzzle: Puzzle, checkMode: CheckMode, restore?: { cells: string[][]; timeSeconds: number; hintsUsed: number; mistakes: number }) => void;
  setCursor: (row: number, col: number) => void;
  setDirection: (dir: Direction) => void;
  toggleDirection: () => void;
  moveCursor: (dr: number, dc: number) => void;
  typeLetter: (letter: string) => void;
  backspace: () => void;
  tabToNextClue: (backwards?: boolean) => void;
  selectClue: (clue: ClueEntry) => void;
  checkCurrentWord: () => void;
  checkPuzzle: () => void;
  revealLetter: () => void;
  revealWord: () => void;
  revealClue: () => void;
  revealPuzzle: () => void;
  tick: () => void;
  setPaused: (paused: boolean) => void;
  clearLastAction: () => void;
  setCheckMode: (mode: CheckMode) => void;
}

export const REVEAL_PUZZLE_UNLOCK_SECONDS = 60;

function blockedCell(puzzle: Puzzle, row: number, col: number): boolean {
  return puzzle.grid[row]?.[col] === null || puzzle.grid[row]?.[col] === undefined;
}

function findClueAt(puzzle: Puzzle, row: number, col: number, dir: Direction): ClueEntry | undefined {
  const list = dir === "across" ? puzzle.across : puzzle.down;
  return list.find((c) => {
    if (dir === "across") {
      return c.startRow === row && col >= c.startCol && col < c.startCol + c.answer.length;
    }
    return c.startCol === col && row >= c.startRow && row < c.startRow + c.answer.length;
  });
}

function hasClueInDirection(puzzle: Puzzle, row: number, col: number, dir: Direction): boolean {
  return !!findClueAt(puzzle, row, col, dir);
}

function firstEmptyOrStart(puzzle: Puzzle, clue: ClueEntry): { row: number; col: number } {
  return { row: clue.startRow, col: clue.startCol };
}

function allCluesSorted(puzzle: Puzzle): ClueEntry[] {
  return [...puzzle.across, ...puzzle.down].sort((a, b) => {
    if (a.number !== b.number) return a.number - b.number;
    return a.direction === "across" ? -1 : 1;
  });
}

export const useGameStore = create<GameState>((set, get) => ({
  puzzle: null,
  cells: [],
  cursor: { row: 0, col: 0 },
  direction: "across",
  checkMode: "manual",
  hintsRemaining: 3,
  hintsUsed: { revealLetter: 0, revealWord: 0, revealClue: 0 },
  mistakes: 0,
  timeSeconds: 0,
  isPaused: false,
  isComplete: false,
  puzzleRevealed: false,
  lastAction: null,

  loadPuzzle: (puzzle, checkMode, restore) => {
    const cells: CellState[][] = puzzle.grid.map((row) =>
      row.map(() => ({ value: "", status: "empty" as const }))
    );
    if (restore) {
      for (let r = 0; r < restore.cells.length; r++) {
        for (let c = 0; c < restore.cells[r].length; c++) {
          if (cells[r] && cells[r][c] && restore.cells[r][c]) {
            cells[r][c] = { value: restore.cells[r][c], status: "empty" };
          }
        }
      }
    }
    const firstClue = puzzle.across[0] ?? puzzle.down[0];
    set({
      puzzle,
      cells,
      cursor: firstClue ? { row: firstClue.startRow, col: firstClue.startCol } : { row: 0, col: 0 },
      direction: "across",
      checkMode,
      hintsRemaining: 3 - 0,
      hintsUsed: { revealLetter: 0, revealWord: 0, revealClue: 0 },
      mistakes: 0,
      timeSeconds: restore?.timeSeconds ?? 0,
      isPaused: false,
      isComplete: false,
      puzzleRevealed: false,
      lastAction: null,
    });
  },

  setCursor: (row, col) => {
    const { puzzle } = get();
    if (!puzzle || blockedCell(puzzle, row, col)) return;
    set((state) => {
      let dir = state.direction;
      if (!hasClueInDirection(puzzle, row, col, dir)) {
        dir = dir === "across" ? "down" : "across";
      }
      return { cursor: { row, col }, direction: dir };
    });
  },

  setDirection: (dir) => set({ direction: dir }),

  toggleDirection: () => {
    const { puzzle, cursor, direction } = get();
    if (!puzzle) return;
    const next = direction === "across" ? "down" : "across";
    if (hasClueInDirection(puzzle, cursor.row, cursor.col, next)) {
      set({ direction: next });
    }
  },

  moveCursor: (dr, dc) => {
    const { puzzle, cursor } = get();
    if (!puzzle) return;
    let row = cursor.row;
    let col = cursor.col;
    for (let step = 0; step < Math.max(puzzle.rows, puzzle.cols); step++) {
      row += dr;
      col += dc;
      if (row < 0 || col < 0 || row >= puzzle.rows || col >= puzzle.cols) return;
      if (!blockedCell(puzzle, row, col)) {
        get().setCursor(row, col);
        return;
      }
    }
  },

  typeLetter: (letter) => {
    const { puzzle, cursor, direction, cells, checkMode } = get();
    if (!puzzle) return;
    if (blockedCell(puzzle, cursor.row, cursor.col)) return;
    const upper = letter.toUpperCase();
    const newCells = cells.map((r) => r.slice());
    const correctLetter = puzzle.grid[cursor.row][cursor.col];
    let status: CellState["status"] = "empty";
    if (checkMode === "live") {
      status = upper === correctLetter ? "correct" : "incorrect";
      if (upper !== correctLetter) {
        set((s) => ({ mistakes: s.mistakes + 1 }));
      }
    }
    newCells[cursor.row][cursor.col] = { value: upper, status };
    set({
      cells: newCells,
      lastAction:
        checkMode === "live"
          ? { type: upper === correctLetter ? "correct" : "wrong", row: cursor.row, col: cursor.col }
          : null,
    });

    // advance
    const dr = direction === "down" ? 1 : 0;
    const dc = direction === "across" ? 1 : 0;
    const nr = cursor.row + dr;
    const nc = cursor.col + dc;
    if (nr < puzzle.rows && nc < puzzle.cols && !blockedCell(puzzle, nr, nc)) {
      set({ cursor: { row: nr, col: nc } });
    }
    maybeComplete();
  },

  backspace: () => {
    const { puzzle, cursor, direction, cells } = get();
    if (!puzzle) return;
    const newCells = cells.map((r) => r.slice());
    if (newCells[cursor.row][cursor.col].value) {
      newCells[cursor.row][cursor.col] = { value: "", status: "empty" };
      set({ cells: newCells });
      return;
    }
    const dr = direction === "down" ? -1 : 0;
    const dc = direction === "across" ? -1 : 0;
    const pr = cursor.row + dr;
    const pc = cursor.col + dc;
    if (pr >= 0 && pc >= 0 && !blockedCell(puzzle, pr, pc)) {
      newCells[pr][pc] = { value: "", status: "empty" };
      set({ cells: newCells, cursor: { row: pr, col: pc } });
    }
  },

  tabToNextClue: (backwards = false) => {
    const { puzzle, cursor, direction } = get();
    if (!puzzle) return;
    const clues = allCluesSorted(puzzle);
    const current = findClueAt(puzzle, cursor.row, cursor.col, direction);
    let idx = current ? clues.findIndex((c) => c.number === current.number && c.direction === current.direction) : -1;
    idx = backwards ? idx - 1 : idx + 1;
    if (idx < 0) idx = clues.length - 1;
    if (idx >= clues.length) idx = 0;
    const next = clues[idx];
    if (next) {
      set({ cursor: firstEmptyOrStart(puzzle, next), direction: next.direction });
    }
  },

  selectClue: (clue) => {
    set({ cursor: { row: clue.startRow, col: clue.startCol }, direction: clue.direction });
  },

  checkCurrentWord: () => {
    const { puzzle, cursor, direction, cells } = get();
    if (!puzzle) return;
    const clue = findClueAt(puzzle, cursor.row, cursor.col, direction);
    if (!clue) return;
    const newCells = cells.map((r) => r.slice());
    let mistakeDelta = 0;
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === "across" ? clue.startRow : clue.startRow + i;
      const c = clue.direction === "across" ? clue.startCol + i : clue.startCol;
      const cell = newCells[r][c];
      if (!cell.value) continue;
      const correct = cell.value === puzzle.grid[r][c];
      if (!correct && cell.status !== "incorrect") mistakeDelta++;
      newCells[r][c] = { value: cell.value, status: correct ? "correct" : "incorrect" };
    }
    set((s) => ({ cells: newCells, mistakes: s.mistakes + mistakeDelta }));
    maybeComplete();
  },

  checkPuzzle: () => {
    const { puzzle, cells } = get();
    if (!puzzle) return;
    const newCells = cells.map((r) => r.slice());
    let mistakeDelta = 0;
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        if (puzzle.grid[r][c] === null) continue;
        const cell = newCells[r][c];
        if (!cell.value) continue;
        const correct = cell.value === puzzle.grid[r][c];
        if (!correct && cell.status !== "incorrect") mistakeDelta++;
        newCells[r][c] = { value: cell.value, status: correct ? "correct" : "incorrect" };
      }
    }
    set((s) => ({ cells: newCells, mistakes: s.mistakes + mistakeDelta }));
    maybeComplete();
  },

  revealLetter: () => {
    const { puzzle, cursor, cells, hintsRemaining, hintsUsed } = get();
    if (!puzzle || hintsRemaining <= 0) return;
    if (blockedCell(puzzle, cursor.row, cursor.col)) return;
    const newCells = cells.map((r) => r.slice());
    newCells[cursor.row][cursor.col] = { value: puzzle.grid[cursor.row][cursor.col]!, status: "revealed" };
    set({
      cells: newCells,
      hintsRemaining: hintsRemaining - 1,
      hintsUsed: { ...hintsUsed, revealLetter: hintsUsed.revealLetter + 1 },
    });
    maybeComplete();
  },

  revealWord: () => {
    const { puzzle, cursor, direction, cells, hintsRemaining, hintsUsed } = get();
    if (!puzzle || hintsRemaining <= 0) return;
    const clue = findClueAt(puzzle, cursor.row, cursor.col, direction);
    if (!clue) return;
    const newCells = cells.map((r) => r.slice());
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === "across" ? clue.startRow : clue.startRow + i;
      const c = clue.direction === "across" ? clue.startCol + i : clue.startCol;
      newCells[r][c] = { value: puzzle.grid[r][c]!, status: "revealed" };
    }
    set({
      cells: newCells,
      hintsRemaining: hintsRemaining - 1,
      hintsUsed: { ...hintsUsed, revealWord: hintsUsed.revealWord + 1 },
    });
    maybeComplete();
  },

  revealClue: () => {
    // Reveals the clue text is already visible; this hint flags the clue as "assisted"
    // by revealing its first letter as a nudge without spending a full word reveal.
    const { hintsRemaining, hintsUsed, puzzle, cursor, direction, cells } = get();
    if (!puzzle || hintsRemaining <= 0) return;
    const clue = findClueAt(puzzle, cursor.row, cursor.col, direction);
    if (!clue) return;
    const newCells = cells.map((r) => r.slice());
    newCells[clue.startRow][clue.startCol] = { value: puzzle.grid[clue.startRow][clue.startCol]!, status: "revealed" };
    set({
      cells: newCells,
      hintsRemaining: hintsRemaining - 1,
      hintsUsed: { ...hintsUsed, revealClue: hintsUsed.revealClue + 1 },
    });
  },

  revealPuzzle: () => {
    const { puzzle, timeSeconds } = get();
    if (!puzzle || timeSeconds < REVEAL_PUZZLE_UNLOCK_SECONDS) return;
    const newCells = puzzle.grid.map((row) =>
      row.map((letter) => (letter === null ? { value: "", status: "empty" as const } : { value: letter, status: "revealed" as const }))
    );
    set({ cells: newCells, puzzleRevealed: true });
    maybeComplete();
  },

  tick: () => {
    if (get().isPaused || get().isComplete) return;
    set((s) => ({ timeSeconds: s.timeSeconds + 1 }));
  },

  setPaused: (paused) => set({ isPaused: paused }),

  clearLastAction: () => set({ lastAction: null }),

  setCheckMode: (mode) => set({ checkMode: mode }),
}));

function maybeComplete() {
  const { puzzle, cells, isComplete } = useGameStore.getState();
  if (!puzzle || isComplete) return;
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      if (puzzle.grid[r][c] === null) continue;
      if (cells[r][c].value !== puzzle.grid[r][c]) return;
    }
  }
  const newCells = cells.map((row) => row.map((cell) => (cell.value ? { ...cell, status: "correct" as const } : cell)));
  useGameStore.setState({ cells: newCells, isComplete: true, lastAction: { type: "complete" } });
}
