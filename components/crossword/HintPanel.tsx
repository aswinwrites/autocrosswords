"use client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store/useGameStore";
import { Eye, Type, MessageSquareText } from "lucide-react";

export function HintPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const hintsRemaining = useGameStore((s) => s.hintsRemaining);
  const revealLetter = useGameStore((s) => s.revealLetter);
  const revealWord = useGameStore((s) => s.revealWord);
  const revealClue = useGameStore((s) => s.revealClue);

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
