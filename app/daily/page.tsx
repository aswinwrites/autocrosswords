import { getAllPuzzles, getAllPuzzleIds } from "@/lib/puzzles";
import { DailyView } from "@/components/daily/DailyView";

export default function DailyPage() {
  const puzzles = getAllPuzzles();
  const allIds = getAllPuzzleIds();
  return <DailyView puzzles={puzzles} allPuzzleIds={allIds} />;
}
