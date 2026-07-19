"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Puzzle } from "@/types/puzzle";
import type { PuzzleResult } from "@/types/game";
import { formatTime } from "@/lib/utils";
import { Trophy, Clock, Target, Lightbulb, Share2, ArrowRight } from "lucide-react";

export function EndScreen({ result, puzzle, onNext }: { result: PuzzleResult; puzzle: Puzzle; onNext: () => void }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const duration = 1200;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#E10600", "#00D9FF", "#FACC15"] });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#E10600", "#00D9FF", "#FACC15"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const rows: { label: string; value: number; positive?: boolean }[] = [
    { label: "Base score", value: result.breakdown.base },
    { label: "Speed bonus", value: result.breakdown.speedBonus, positive: true },
    { label: "No hints bonus", value: result.breakdown.noHintsBonus, positive: true },
    { label: "No mistakes bonus", value: result.breakdown.noMistakesBonus, positive: true },
    { label: "Difficulty bonus", value: result.breakdown.difficultyBonus, positive: true },
    { label: "Daily challenge bonus", value: result.breakdown.dailyBonus, positive: true },
    { label: "Mistake penalty", value: -result.breakdown.mistakePenalty },
    { label: "Hint penalty", value: -result.breakdown.hintPenalty },
    { label: "Reveal penalty", value: -result.breakdown.revealPenalty },
    { label: "Slow solve penalty", value: -result.breakdown.slowPenalty },
  ].filter((r) => r.value !== 0);

  function share() {
    const text = `I solved "${puzzle.title}" on Autocrosswords in ${formatTime(result.timeSeconds)} with ${result.accuracy}% accuracy — score ${result.score}! 🏁`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
            <Trophy className="h-14 w-14 text-amber-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" />
          </motion.div>
          <DialogTitle className="mt-3 font-display text-2xl text-white">Puzzle Complete!</DialogTitle>
          <p className="text-white/60 text-sm">{puzzle.title}</p>

          <div className="mt-5 grid w-full grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/5 p-3">
              <Clock className="mx-auto mb-1 h-4 w-4 text-neon-blue" />
              <div className="font-mono text-lg text-white">{formatTime(result.timeSeconds)}</div>
              <div className="text-[10px] uppercase text-white/40">Time</div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <Target className="mx-auto mb-1 h-4 w-4 text-emerald-400" />
              <div className="font-mono text-lg text-white">{result.accuracy}%</div>
              <div className="text-[10px] uppercase text-white/40">Accuracy</div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <Lightbulb className="mx-auto mb-1 h-4 w-4 text-amber-400" />
              <div className="font-mono text-lg text-white">{result.hintsUsed}</div>
              <div className="text-[10px] uppercase text-white/40">Hints</div>
            </div>
          </div>

          <div className="mt-5 w-full space-y-1 rounded-xl bg-white/5 p-4 text-left">
            {rows.map((r) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-white/60">{r.label}</span>
                <span className={r.value < 0 ? "text-red-400" : "text-emerald-400"}>
                  {r.value > 0 ? "+" : ""}
                  {r.value}
                </span>
              </motion.div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-base font-bold">
              <span className="text-white">Total Score</span>
              <span className="text-racing-red">{result.score}</span>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/40">
            Leaderboard coming soon — compare scores with friends and the community.
          </div>

          <div className="mt-5 flex w-full gap-2">
            <Button variant="secondary" className="flex-1" onClick={share}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
            <Button className="flex-1" onClick={onNext}>
              Next Puzzle <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
