import type { AchievementDef, PuzzleResult } from "@/types/game";
import type { Puzzle } from "@/types/puzzle";

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "perfect-accuracy", name: "100% Accuracy", description: "Finish a puzzle with zero mistakes", icon: "Target" },
  { id: "no-hints", name: "Purist", description: "Finish a puzzle without using any hints", icon: "Ban" },
  { id: "speed-demon", name: "Speed Demon", description: "Finish a puzzle in under half its estimated time", icon: "Zap" },
  { id: "motorhead", name: "Motorhead", description: "Complete 10 puzzles", icon: "Wrench" },
  { id: "plane-spotter", name: "Plane Spotter", description: "Complete an Aircraft puzzle", icon: "Plane" },
  { id: "f1-genius", name: "F1 Genius", description: "Complete a Formula 1 puzzle with no mistakes", icon: "Flag" },
  { id: "bike-buff", name: "Bike Buff", description: "Complete a Motorcycles or MotoGP puzzle", icon: "Bike" },
  { id: "perfect-week", name: "Perfect Week", description: "Complete 7 puzzles in a 7-day span", icon: "CalendarCheck" },
  { id: "future-ready", name: "Future Ready", description: "Complete an Electric Vehicles puzzle", icon: "Battery" },
  { id: "centurion", name: "Centurion", description: "Earn a total score of 10,000 points or more", icon: "Trophy" },
  { id: "streak-7", name: "On a Roll", description: "Reach a 7-day daily challenge streak", icon: "Flame" },
  { id: "legend-solver", name: "Legend Solver", description: "Complete a Legend difficulty puzzle", icon: "Crown" },
];

export function checkNewAchievements(
  result: PuzzleResult,
  puzzle: Puzzle,
  totalCompleted: number,
  totalScore: number,
  dailyStreak: number,
  already: Set<string>,
  puzzleRevealed = false
): string[] {
  const earned: string[] = [];
  const add = (id: string) => {
    if (!already.has(id) && !earned.includes(id)) earned.push(id);
  };

  // A fully-revealed puzzle only counts toward participation-style achievements,
  // never the skill-based ones (accuracy, no-hints, speed, per-category mastery).
  if (!puzzleRevealed) {
    if (result.mistakes === 0) add("perfect-accuracy");
    if (result.hintsUsed === 0) add("no-hints");
    if (result.timeSeconds < puzzle.estimatedTime * 30) add("speed-demon");
    if (puzzle.category === "Aircraft") add("plane-spotter");
    if (puzzle.category === "Formula 1" && result.mistakes === 0) add("f1-genius");
    if (puzzle.category === "Motorcycles" || puzzle.category === "MotoGP") add("bike-buff");
    if (puzzle.category === "Electric Vehicles") add("future-ready");
    if (puzzle.difficulty === "Legend") add("legend-solver");
  }
  if (totalCompleted >= 10) add("motorhead");
  if (totalScore >= 10000) add("centurion");
  if (dailyStreak >= 7) add("streak-7");

  return earned;
}
