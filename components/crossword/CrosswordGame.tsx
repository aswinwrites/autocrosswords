"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Puzzle } from "@/types/puzzle";
import { useGameStore } from "@/lib/store/useGameStore";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { Grid } from "@/components/crossword/Grid";
import { Legend } from "@/components/crossword/Legend";
import { ClueBar } from "@/components/crossword/ClueBar";
import { ClueList } from "@/components/crossword/ClueList";
import { Toolbar } from "@/components/crossword/Toolbar";
import { HintPanel } from "@/components/crossword/HintPanel";
import { EndScreen } from "@/components/crossword/EndScreen";
import { computeScore } from "@/lib/scoring";
import { checkNewAchievements } from "@/lib/achievements";
import { playSound } from "@/lib/sound";
import type { PuzzleResult } from "@/types/game";

export function CrosswordGame({ puzzle, allPuzzleIds, isDaily = false }: { puzzle: Puzzle; allPuzzleIds: string[]; isDaily?: boolean }) {
  const router = useRouter();
  const [hintsOpen, setHintsOpen] = useState(false);
  const [result, setResult] = useState<PuzzleResult | null>(null);
  const loadedRef = useRef(false);

  const loadPuzzle = useGameStore((s) => s.loadPuzzle);
  const typeLetter = useGameStore((s) => s.typeLetter);
  const moveCursor = useGameStore((s) => s.moveCursor);
  const backspace = useGameStore((s) => s.backspace);
  const tabToNextClue = useGameStore((s) => s.tabToNextClue);
  const toggleDirection = useGameStore((s) => s.toggleDirection);
  const tick = useGameStore((s) => s.tick);
  const isComplete = useGameStore((s) => s.isComplete);
  const isPaused = useGameStore((s) => s.isPaused);
  const cells = useGameStore((s) => s.cells);
  const timeSeconds = useGameStore((s) => s.timeSeconds);
  const mistakes = useGameStore((s) => s.mistakes);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const lastAction = useGameStore((s) => s.lastAction);
  const clearLastAction = useGameStore((s) => s.clearLastAction);

  const preferences = useProgressStore((s) => s.preferences);
  const completePuzzle = useProgressStore((s) => s.completePuzzle);
  const unlockPuzzle = useProgressStore((s) => s.unlockPuzzle);
  const saveInProgress = useProgressStore((s) => s.saveInProgress);
  const inProgressMap = useProgressStore((s) => s.inProgress);
  const achievements = useProgressStore((s) => s.achievements);
  const addAchievements = useProgressStore((s) => s.addAchievements);
  const totalCompleted = useProgressStore((s) => s.totalCompleted);
  const totalScore = useProgressStore((s) => s.totalScore);
  const dailyStreak = useProgressStore((s) => s.daily.current);
  const recordDailyPlay = useProgressStore((s) => s.recordDailyPlay);
  const touchRecentlyPlayed = useProgressStore((s) => s.touchRecentlyPlayed);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const restore = inProgressMap[puzzle.id];
    loadPuzzle(puzzle, preferences.checkMode, restore ? { cells: restore.cells, timeSeconds: restore.timeSeconds, hintsUsed: restore.hintsUsed, mistakes: restore.mistakes } : undefined);
    touchRecentlyPlayed(puzzle.id);
    if (isDaily) recordDailyPlay(puzzle.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);

  // timer
  useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [tick]);

  // sound + flash cleanup
  useEffect(() => {
    if (!lastAction) return;
    if (lastAction.type === "correct") playSound("correct", preferences.sound);
    if (lastAction.type === "wrong") playSound("wrong", preferences.sound);
    if (lastAction.type === "complete") playSound("complete", preferences.sound);
    const t = setTimeout(() => clearLastAction(), 650);
    return () => clearTimeout(t);
  }, [lastAction, preferences.sound, clearLastAction]);

  // persist progress periodically
  useEffect(() => {
    if (isComplete) return;
    const id = setInterval(() => {
      const cellValues = cells.map((row) => row.map((c) => c.value));
      saveInProgress(puzzle.id, {
        cells: cellValues,
        timeSeconds: useGameStore.getState().timeSeconds,
        hintsUsed: hintsUsed.revealLetter + hintsUsed.revealWord + hintsUsed.revealClue,
        mistakes,
        lastPlayed: new Date().toISOString(),
      });
    }, 4000);
    return () => clearInterval(id);
  }, [cells, isComplete, mistakes, hintsUsed, puzzle.id, saveInProgress]);

  // completion handling
  useEffect(() => {
    if (!isComplete || result) return;
    const totalHints = hintsUsed.revealLetter + hintsUsed.revealWord + hintsUsed.revealClue;
    const totalCells = puzzle.grid.flat().filter((c) => c !== null).length;
    const breakdown = computeScore({
      difficulty: puzzle.difficulty,
      timeSeconds,
      estimatedTime: puzzle.estimatedTime,
      mistakes,
      hintsUsed,
      isDaily,
      totalCells,
    });
    const accuracy = Math.max(0, Math.round(((totalCells - mistakes) / totalCells) * 100));
    const puzzleResult: PuzzleResult = {
      puzzleId: puzzle.id,
      completedAt: new Date().toISOString(),
      timeSeconds,
      mistakes,
      hintsUsed: totalHints,
      score: breakdown.total,
      accuracy,
      breakdown,
    };
    completePuzzle(puzzleResult);
    const idx = allPuzzleIds.indexOf(puzzle.id);
    if (idx >= 0 && idx + 1 < allPuzzleIds.length) unlockPuzzle(allPuzzleIds[idx + 1]);
    const earned = checkNewAchievements(
      puzzleResult,
      puzzle,
      totalCompleted() + 1,
      totalScore() + breakdown.total,
      dailyStreak + 1,
      new Set(achievements)
    );
    addAchievements(earned);
    setResult(puzzleResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isPaused || isComplete) return;
      const key = e.key;
      if (key === "ArrowUp") { e.preventDefault(); moveCursor(-1, 0); }
      else if (key === "ArrowDown") { e.preventDefault(); moveCursor(1, 0); }
      else if (key === "ArrowLeft") { e.preventDefault(); moveCursor(0, -1); }
      else if (key === "ArrowRight") { e.preventDefault(); moveCursor(0, 1); }
      else if (key === "Backspace") { e.preventDefault(); backspace(); }
      else if (key === "Tab") { e.preventDefault(); tabToNextClue(e.shiftKey); }
      else if (key === " ") { e.preventDefault(); toggleDirection(); }
      else if (/^[a-zA-Z]$/.test(key)) {
        typeLetter(key);
        playSound("keypress", preferences.sound);
      }
    },
    [isPaused, isComplete, moveCursor, backspace, tabToNextClue, toggleDirection, typeLetter, preferences.sound]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-16 pt-4 lg:flex-row lg:gap-6">
      <div className="flex flex-1 flex-col gap-4">
        <div className="sticky top-16 z-30 flex flex-col gap-2 bg-charcoal-950/80 backdrop-blur-xl pb-2 pt-1 -mx-4 px-4 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
          <Toolbar onOpenHints={() => setHintsOpen(true)} />
          <ClueBar />
        </div>
        <Grid />
        <Legend />
      </div>
      <div className="lg:w-96">
        <ClueList />
      </div>
      <HintPanel open={hintsOpen} onOpenChange={setHintsOpen} />
      {result && (
        <EndScreen
          result={result}
          puzzle={puzzle}
          onNext={() => {
            const idx = allPuzzleIds.indexOf(puzzle.id);
            const next = idx >= 0 ? allPuzzleIds[idx + 1] : undefined;
            if (next) router.push(`/play/${next}`);
            else router.push("/puzzles");
          }}
        />
      )}
    </div>
  );
}
