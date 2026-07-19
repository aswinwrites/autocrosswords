export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert" | "Legend";

export type Category =
  | "Classic Cars"
  | "Formula 1"
  | "Motorcycles"
  | "Aircraft"
  | "Luxury Cars"
  | "Japanese Cars"
  | "American Muscle"
  | "German Engineering"
  | "Indian Automobiles"
  | "Movie Cars"
  | "Supercars"
  | "Electric Vehicles"
  | "Engine Technology"
  | "Car Logos"
  | "Rally"
  | "MotoGP"
  | "Le Mans"
  | "History"
  | "Military Vehicles"
  | "Concept Cars"
  | "Car Culture"
  | "Mixed";

export type Direction = "across" | "down";

export interface ClueEntry {
  number: number;
  answer: string;
  clue: string;
  startRow: number;
  startCol: number;
  direction: Direction;
}

/** null = blocked cell */
export type GridCell = string | null;

export interface Puzzle {
  id: string;
  week: number;
  title: string;
  difficulty: Difficulty;
  category: Category;
  theme: string;
  rows: number;
  cols: number;
  grid: GridCell[][];
  across: ClueEntry[];
  down: ClueEntry[];
  author: string;
  estimatedTime: number;
}

export interface PuzzleSummary {
  id: string;
  week: number;
  title: string;
  difficulty: Difficulty;
  category: Category;
  theme: string;
  estimatedTime: number;
  clueCount: number;
}
