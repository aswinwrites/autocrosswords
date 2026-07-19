"use client";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/store/useGameStore";
import type { ClueEntry } from "@/types/puzzle";

function ClueColumn({ title, clues }: { title: string; clues: ClueEntry[] }) {
  const cursor = useGameStore((s) => s.cursor);
  const direction = useGameStore((s) => s.direction);
  const selectClue = useGameStore((s) => s.selectClue);
  const puzzle = useGameStore((s) => s.puzzle);
  const cells = useGameStore((s) => s.cells);

  function isSolved(clue: ClueEntry): boolean {
    if (!puzzle) return false;
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === "across" ? clue.startRow : clue.startRow + i;
      const c = clue.direction === "across" ? clue.startCol + i : clue.startCol;
      if (cells[r]?.[c]?.value !== clue.answer[i]) return false;
    }
    return true;
  }

  return (
    <div className="flex-1 min-w-[160px]">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">{title}</h4>
      <ul className="space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
        {clues.map((clue) => {
          const active =
            direction === clue.direction &&
            (clue.direction === "across"
              ? cursor.row === clue.startRow && cursor.col >= clue.startCol && cursor.col < clue.startCol + clue.answer.length
              : cursor.col === clue.startCol && cursor.row >= clue.startRow && cursor.row < clue.startRow + clue.answer.length);
          const solved = isSolved(clue);
          return (
            <li key={`${clue.direction}-${clue.number}`}>
              <button
                onClick={() => selectClue(clue)}
                className={cn(
                  "w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                  active ? "bg-racing-red/25 text-white" : "text-white/70 hover:bg-white/5",
                  solved && !active && "text-white/35 line-through decoration-white/20"
                )}
              >
                <span className="mr-1.5 font-semibold text-white/50">{clue.number}.</span>
                {clue.clue}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ClueList() {
  const puzzle = useGameStore((s) => s.puzzle);
  if (!puzzle) return null;
  return (
    <div className="flex gap-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <ClueColumn title="Across" clues={puzzle.across} />
      <ClueColumn title="Down" clues={puzzle.down} />
    </div>
  );
}
