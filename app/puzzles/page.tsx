import { Suspense } from "react";
import { getPuzzleSummaries } from "@/lib/puzzles";
import { PuzzlesView } from "@/components/puzzles/PuzzlesView";

export default function PuzzlesPage() {
  const summaries = getPuzzleSummaries();
  return (
    <Suspense fallback={null}>
      <PuzzlesView summaries={summaries} />
    </Suspense>
  );
}
