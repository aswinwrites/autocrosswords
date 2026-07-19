"use client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useGameStore, REVEAL_PUZZLE_UNLOCK_SECONDS } from "@/lib/store/useGameStore";
import { formatTime } from "@/lib/utils";
import { Eye, Type, MessageSquareText, ScanEye, Lock } from "lucide-react";

export function HintPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const hintsRemaining = useGameStore((s) => s.hintsRemaining);
  const timeSeconds = useGameStore((s) => s.timeSeconds);
  const revealLetter = useGameStore((s) => s.revealLetter);
  const revealWord = useGameStore((s) => s.revealWord);
  const revealClue = useGameStore((s) => s.revealClue);
  const revealPuzzle = useGameStore((s) => s.revealPuzzle);

  const secondsToUnlock = Math.max(0, REVEAL_PUZZLE_UNLOCK_SECONDS - timeSeconds);
  const revealPuzzleUnlocked = secondsToUnlock === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-white text-xl font-display">Hints</DialogTitle>
        <DialogDescription className="text-white/60">
          You have {hintsRemaining} hint{hintsRemaining === 1 ? "" : "s"} remaining. Hints reduce your final score.
        </DialogDescription>
        <div className="mt-4 grid gap-3">
          <Button
            variant="secondary"
            className="justify-start"
            disabled={hintsRemaining <= 0}
            onClick={() => {
              revealLetter();
              onOpenChange(false);
            }}
          >
            <Type className="mr-2 h-4 w-4" /> Reveal Letter
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            disabled={hintsRemaining <= 0}
            onClick={() => {
              revealWord();
              onOpenChange(false);
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> Reveal Word
          </Button>
          <Button
            variant="secondary"
            className="justify-start"
            disabled={hintsRemaining <= 0}
            onClick={() => {
              revealClue();
              onOpenChange(false);
            }}
          >
            <MessageSquareText className="mr-2 h-4 w-4" /> Reveal First Letter of Clue
          </Button>

          <div className="my-1 h-px bg-white/10" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="justify-start"
                disabled={!revealPuzzleUnlocked}
                onClick={() => {
                  revealPuzzle();
                  onOpenChange(false);
                }}
              >
                {revealPuzzleUnlocked ? (
                  <ScanEye className="mr-2 h-4 w-4" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                {revealPuzzleUnlocked ? "Check All Answers" : `Check All Answers — unlocks at ${formatTime(REVEAL_PUZZLE_UNLOCK_SECONDS)}`}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {revealPuzzleUnlocked
                ? "Fills in every answer. Doesn't use your hint count, but locks in a token score for this puzzle."
                : `Unlocks after 1 minute of play — ${formatTime(secondsToUnlock)} left`}
            </TooltipContent>
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  );
}
