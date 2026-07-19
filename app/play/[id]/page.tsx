import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPuzzleIds, getPuzzleById } from "@/lib/puzzles";
import { CrosswordGame } from "@/components/crossword/CrosswordGame";

export function generateStaticParams() {
  return getAllPuzzleIds().map((id) => ({ id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const puzzle = getPuzzleById(params.id);
  if (!puzzle) return { title: "Puzzle not found — Autocrosswords" };
  const title = `${puzzle.title} — Week ${puzzle.week} | Autocrosswords`;
  const description = `Play "${puzzle.title}" — a ${puzzle.difficulty} ${puzzle.category} crossword with ${puzzle.across.length + puzzle.down.length} clues, about ${puzzle.estimatedTime} minutes to solve.`;
  return {
    title,
    description,
    alternates: { canonical: `/play/${puzzle.id}` },
    openGraph: { title, description, images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

export default function PlayPage({ params }: { params: { id: string } }) {
  const puzzle = getPuzzleById(params.id);
  if (!puzzle) notFound();
  const allIds = getAllPuzzleIds();
  return <CrosswordGame puzzle={puzzle} allPuzzleIds={allIds} />;
}
