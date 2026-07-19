import { getPuzzleSummaries } from "@/lib/puzzles";
import { HomeView } from "@/components/home/HomeView";

export default function HomePage() {
  const summaries = getPuzzleSummaries();
  return <HomeView summaries={summaries} />;
}
