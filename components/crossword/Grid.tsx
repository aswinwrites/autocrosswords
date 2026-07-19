"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/store/useGameStore";
import { useProgressStore } from "@/lib/store/useProgressStore";
import type { ClueEntry } from "@/types/puzzle";

function buildNumberMap(rows: number, cols: number, across: ClueEntry[], down: ClueEntry[]) {
  const map = new Map<string, number>();
  for (const c of [...across, ...down]) {
    map.set(`${c.startRow},${c.startCol}`, c.number);
  }
  return map;
}

export function Grid() {
  const puzzle = useGameStore((s) => s.puzzle);
  const cells = useGameStore((s) => s.cells);
  const cursor = useGameStore((s) => s.cursor);
  const direction = useGameStore((s) => s.direction);
  const lastAction = useGameStore((s) => s.lastAction);
  const setCursor = useGameStore((s) => s.setCursor);
  const toggleDirection = useGameStore((s) => s.toggleDirection);
  const highContrast = useProgressStore((s) => s.preferences.highContrast);
  const largeFont = useProgressStore((s) => s.preferences.largeFont);
  const colorblind = useProgressStore((s) => s.preferences.colorblind);

  const numberMap = useMemo(
    () => (puzzle ? buildNumberMap(puzzle.rows, puzzle.cols, puzzle.across, puzzle.down) : new Map()),
    [puzzle]
  );

  if (!puzzle) return null;

  const activeClue = [...puzzle.across, ...puzzle.down].find((c) => {
    if (direction === "across") return c.direction === "across" && c.startRow === cursor.row && cursor.col >= c.startCol && cursor.col < c.startCol + c.answer.length;
    return c.direction === "down" && c.startCol === cursor.col && cursor.row >= c.startRow && cursor.row < c.startRow + c.answer.length;
  });

  function isInActiveWord(r: number, c: number): boolean {
    if (!activeClue) return false;
    if (activeClue.direction === "across") {
      return r === activeClue.startRow && c >= activeClue.startCol && c < activeClue.startCol + activeClue.answer.length;
    }
    return c === activeClue.startCol && r >= activeClue.startRow && r < activeClue.startRow + activeClue.answer.length;
  }

  const cellSizeClass = largeFont ? "text-lg" : "text-base";

  return (
    <div
      className="grid select-none gap-[2px] rounded-xl bg-white/5 p-[2px] shadow-2xl mx-auto"
      style={{
        gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
        width: `min(92vw, ${puzzle.cols * 44}px)`,
        maxWidth: `min(92vw, ${puzzle.cols * 44}px)`,
      }}
      role="grid"
      aria-label={`${puzzle.title} crossword grid`}
    >
      {puzzle.grid.map((row, r) =>
        row.map((cellDef, c) => {
          if (cellDef === null) {
            return <div key={`${r}-${c}`} className="aspect-square bg-charcoal-950 rounded-[4px]" />;
          }
          const cellState = cells[r]?.[c] ?? { value: "", status: "empty" };
          const isCursor = cursor.row === r && cursor.col === c;
          const inWord = isInActiveWord(r, c);
          const number = numberMap.get(`${r},${c}`);
          const flashCorrect = lastAction?.type === "correct" && lastAction.row === r && lastAction.col === c;
          const flashWrong = lastAction?.type === "wrong" && lastAction.row === r && lastAction.col === c;

          let bg = "bg-charcoal-800";
          if (cellState.status === "correct") bg = colorblind ? "bg-blue-600/70" : "bg-emerald-600/70";
          else if (cellState.status === "incorrect") bg = colorblind ? "bg-orange-500/70" : "bg-red-600/60";
          else if (cellState.status === "revealed") bg = "bg-amber-500/50";
          else if (isCursor) bg = "bg-neon-blue/30";
          else if (inWord) bg = "bg-white/10";

          return (
            <button
              key={`${r}-${c}`}
              type="button"
              aria-label={`Row ${r + 1} Column ${c + 1}${number ? `, clue ${number}` : ""}`}
              onClick={() => {
                if (isCursor) toggleDirection();
                else setCursor(r, c);
              }}
              className={cn(
                "relative aspect-square flex items-center justify-center font-mono font-bold uppercase transition-colors duration-150 rounded-[4px] outline-none",
                cellSizeClass,
                bg,
                highContrast ? "text-white" : "text-white/90",
                isCursor && "ring-2 ring-neon-blue z-10",
                flashWrong && "animate-shake-wrong",
                flashCorrect && "animate-flash-correct"
              )}
            >
              {number != null && (
                <span className="absolute top-0.5 left-1 text-[9px] font-sans font-medium text-white/50 animate-number-pop">
                  {number}
                </span>
              )}
              <motion.span
                key={cellState.value}
                initial={{ scale: cellState.value ? 0.5 : 1, opacity: cellState.value ? 0 : 1 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.12 }}
              >
                {cellState.value}
              </motion.span>
            </button>
          );
        })
      )}
    </div>
  );
}
