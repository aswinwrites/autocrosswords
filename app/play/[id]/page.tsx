import { notFound } from "next/navigation";
import { getAllPuzzleIds, getPuzzleById } from "@/lib/puzzles";
import { CrosswordGame } from "@/components/crossword/CrosswordGame";

export function generateStaticParams() {
  return getAllPuzzleIds().map((id) => ({ id }));
}

export default function PlayPage({ params }: { params: { id: string } }) {
  const puzzle = getPuzzleById(params.id);
  if (!puzzle) notFound();
  const allIds = getAllPuzzleIds();
  return <CrosswordGame puzzle={puzzle} allPuzzleIds={allIds} />;
}
