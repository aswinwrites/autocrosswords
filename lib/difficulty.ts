export const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard", "Expert", "Legend"] as const;

export const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  Easy: 1,
  Medium: 1.15,
  Hard: 1.3,
  Expert: 1.5,
  Legend: 1.75,
};
