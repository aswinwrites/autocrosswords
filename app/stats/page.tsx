import { getPuzzleSummaries } from "@/lib/puzzles";
import { StatsView } from "@/components/stats/StatsView";

export default function StatsPage() {
  const summaries = getPuzzleSummaries();
  return <StatsView summaries={summaries} />;
}
