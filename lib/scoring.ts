import type { Difficulty } from "@/types/puzzle";
import type { ScoreBreakdown } from "@/types/game";
import { DIFFICULTY_MULTIPLIER } from "@/lib/difficulty";

export interface ScoreInputs {
  difficulty: Difficulty;
  timeSeconds: number;
  estimatedTime: number; // in minutes
  mistakes: number;
  hintsUsed: { revealLetter: number; revealWord: number; revealClue: number };
  isDaily: boolean;
  totalCells: number;
}

const BASE_SCORE = 1000;

export function computeScore(inputs: ScoreInputs): ScoreBreakdown {
  const base = BASE_SCORE;
  const parTime = inputs.estimatedTime * 60;
  const speedRatio = parTime > 0 ? inputs.timeSeconds / parTime : 1;

  const speedBonus =
    speedRatio <= 0.5 ? 300 : speedRatio <= 0.75 ? 200 : speedRatio <= 1 ? 100 : 0;

  const totalHints = inputs.hintsUsed.revealLetter + inputs.hintsUsed.revealWord + inputs.hintsUsed.revealClue;
  const noHintsBonus = totalHints === 0 ? 150 : 0;
  const noMistakesBonus = inputs.mistakes === 0 ? 150 : 0;
  const difficultyBonus = Math.round(base * (DIFFICULTY_MULTIPLIER[inputs.difficulty] - 1));
  const dailyBonus = inputs.isDaily ? 100 : 0;

  const mistakePenalty = Math.min(300, inputs.mistakes * 15);
  const hintPenalty = Math.min(200, (inputs.hintsUsed.revealLetter * 20));
  const revealPenalty = Math.min(300, inputs.hintsUsed.revealWord * 60 + inputs.hintsUsed.revealClue * 40);

  const slowThreshold = parTime * 2;
  const slowPenalty = inputs.timeSeconds > slowThreshold ? Math.min(200, Math.round((inputs.timeSeconds - slowThreshold) / 10)) : 0;

  const total = Math.max(
    0,
    Math.round(
      base +
        speedBonus +
        noHintsBonus +
        noMistakesBonus +
        difficultyBonus +
        dailyBonus -
        mistakePenalty -
        hintPenalty -
        revealPenalty -
        slowPenalty
    )
  );

  return {
    base,
    speedBonus,
    noHintsBonus,
    noMistakesBonus,
    difficultyBonus,
    dailyBonus,
    mistakePenalty,
    hintPenalty,
    revealPenalty,
    slowPenalty,
    total,
  };
}
