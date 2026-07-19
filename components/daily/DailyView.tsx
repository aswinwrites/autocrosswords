"use client";
import { useMemo, useEffect, useState } from "react";
import { Flame, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CrosswordGame } from "@/components/crossword/CrosswordGame";
import { useProgressStore } from "@/lib/store/useProgressStore";
import type { Puzzle } from "@/types/puzzle";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledOrder<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DailyView({ puzzles, allPuzzleIds }: { puzzles: Puzzle[]; allPuzzleIds: string[] }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const daily = useProgressStore((s) => s.daily);

  const { todayPuzzle, dayNumber } = useMemo(() => {
    const order = shuffledOrder(puzzles, 42);
    const daysSinceEpoch = Math.floor(Date.now() / 86400000);
    const idx = daysSinceEpoch % order.length;
    return { todayPuzzle: order[idx], dayNumber: daysSinceEpoch };
  }, [puzzles]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Card className="mb-6">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-neon-blue" />
            <div>
              <h1 className="font-display text-xl font-bold text-white">Daily Challenge</h1>
              <p className="text-sm text-white/60">
                {todayPuzzle.title} · {todayPuzzle.category} · {todayPuzzle.difficulty}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">
            <Flame className="h-5 w-5 text-amber-400" />
            <span className="font-mono text-lg text-white">{hydrated ? daily.current : 0}</span>
            <span className="text-xs text-white/50">day streak (best {hydrated ? daily.best : 0})</span>
          </div>
        </CardContent>
      </Card>
      <CrosswordGame puzzle={todayPuzzle} allPuzzleIds={allPuzzleIds} isDaily key={todayPuzzle.id} />
    </div>
  );
}
