"use client";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SECTIONS: { title: string; rows: { k: string; v: string }[] }[] = [
  {
    title: "Keyboard Controls",
    rows: [
      { k: "Arrow keys", v: "Move the cursor around the grid" },
      { k: "Type a letter", v: "Fill the cell and auto-advance in the current direction" },
      { k: "Backspace", v: "Clear the current cell, or move back and clear the previous one" },
      { k: "Tab / Shift+Tab", v: "Jump to the next / previous clue" },
      { k: "Space, or click an active cell again", v: "Toggle between Across and Down" },
      { k: "Click a clue", v: "Jump straight to that word" },
    ],
  },
  {
    title: "Checking Your Answers",
    rows: [
      { k: "Live Check", v: "Every letter is marked correct or incorrect the instant you type it" },
      { k: "Manual Check", v: "Use the Check Word / Check Puzzle buttons whenever you want a check" },
      { k: "No Checking", v: "No feedback until you finish — for a purer solving experience" },
    ],
  },
  {
    title: "Hints",
    rows: [
      { k: "Reveal Letter", v: "Fills the selected cell — the smallest penalty" },
      { k: "Reveal Word", v: "Fills the entire current word — a larger penalty" },
      { k: "Reveal First Letter of Clue", v: "A nudge for a specific clue without giving away the whole word" },
      { k: "3 per puzzle", v: "Hints are limited and always reduce your final score" },
    ],
  },
  {
    title: "Scoring",
    rows: [
      { k: "Base", v: "Every completed puzzle starts at 1000 points" },
      { k: "Bonuses", v: "Fast completion, zero hints, zero mistakes, higher difficulty, and daily challenges all add points" },
      { k: "Penalties", v: "Mistakes, hints, reveals, and very slow solves subtract from your score" },
    ],
  },
  {
    title: "Cell Colors",
    rows: [
      { k: "Blue outline", v: "Your current cell" },
      { k: "Green", v: "Correct" },
      { k: "Red / orange", v: "Incorrect (orange in colorblind mode)" },
      { k: "Amber", v: "Revealed by a hint" },
      { k: "Gold shimmer", v: "The whole puzzle, once solved" },
    ],
  },
];

export function HelpModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="How to play">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogTitle className="font-display text-2xl text-white">How to Play</DialogTitle>
        <div className="mt-4 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neon-blue">{section.title}</h3>
              <dl className="space-y-2">
                {section.rows.map((row) => (
                  <div key={row.k} className="text-sm">
                    <dt className="inline font-semibold text-white">{row.k}: </dt>
                    <dd className="inline text-white/60">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
