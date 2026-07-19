"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGameStore } from "@/lib/store/useGameStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function ClueBar() {
  const puzzle = useGameStore((s) => s.puzzle);
  const cursor = useGameStore((s) => s.cursor);
  const direction = useGameStore((s) => s.direction);
  const tabToNextClue = useGameStore((s) => s.tabToNextClue);

  if (!puzzle) return null;
  const list = direction === "across" ? puzzle.across : puzzle.down;
  const clue = list.find((c) => {
    if (direction === "across") return c.startRow === cursor.row && cursor.col >= c.startCol && cursor.col < c.startCol + c.answer.length;
    return c.startCol === cursor.col && cursor.row >= c.startRow && cursor.row < c.startRow + c.answer.length;
  });

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Previous clue" onClick={() => tabToNextClue(true)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Previous clue (Shift+Tab)</TooltipContent>
      </Tooltip>
      <div className="flex-1 min-w-0">
        <span className="mr-2 rounded bg-racing-red/20 px-1.5 py-0.5 text-xs font-bold text-racing-red">
          {clue ? `${clue.number} ${direction === "across" ? "Across" : "Down"}` : "—"}
        </span>
        <span className="text-sm text-white/90 truncate">{clue?.clue ?? "Select a cell to begin"}</span>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Next clue" onClick={() => tabToNextClue(false)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next clue (Tab)</TooltipContent>
      </Tooltip>
    </div>
  );
}
