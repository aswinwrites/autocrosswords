export type CheckMode = "live" | "manual" | "none";

export type CellStatus = "empty" | "correct" | "incorrect" | "revealed";

export interface CellState {
  value: string;
  status: CellStatus;
}

export interface HintsUsed {
  revealLetter: number;
  revealWord: number;
  revealClue: number;
}

export interface ScoreBreakdown {
  base: number;
  speedBonus: number;
  noHintsBonus: number;
  noMistakesBonus: number;
  difficultyBonus: number;
  dailyBonus: number;
  mistakePenalty: number;
  hintPenalty: number;
  revealPenalty: number;
  slowPenalty: number;
  total: number;
}

export interface PuzzleResult {
  puzzleId: string;
  completedAt: string;
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  accuracy: number;
  breakdown: ScoreBreakdown;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}
