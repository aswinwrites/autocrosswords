"use client";
import { Lightbulb, CheckCircle2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useGameStore } from "@/lib/store/useGameStore";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { formatTime } from "@/lib/utils";

export function Toolbar({ onOpenHints }: { onOpenHints: () => void }) {
  const timeSeconds = useGameStore((s) => s.timeSeconds);
  const isPaused = useGameStore((s) => s.isPaused);
  const setPaused = useGameStore((s) => s.setPaused);
  const checkMode = useGameStore((s) => s.checkMode);
  const checkCurrentWord = useGameStore((s) => s.checkCurrentWord);
  const checkPuzzle = useGameStore((s) => s.checkPuzzle);
  const hintsRemaining = useGameStore((s) => s.hintsRemaining);
  const sound = useProgressStore((s) => s.preferences.sound);
  const setPreference = useProgressStore((s) => s.setPreference);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={isPaused ? "Resume" : "Pause"} onClick={() => setPaused(!isPaused)}>
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isPaused ? "Resume timer" : "Pause timer"}</TooltipContent>
        </Tooltip>
        <span className="font-mono text-lg text-white tabular-nums">{isPaused ? "· · ·" : formatTime(timeSeconds)}</span>
      </div>
      <div className="flex items-center gap-2">
        {checkMode === "manual" && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" onClick={checkCurrentWord}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Check Word
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark the current word correct or incorrect</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" onClick={checkPuzzle}>
                  Check Puzzle
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark every filled cell in the grid correct or incorrect</TooltipContent>
            </Tooltip>
          </>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onOpenHints}>
              <Lightbulb className="mr-1.5 h-4 w-4" /> Hints ({hintsRemaining})
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reveal a letter, word, or clue hint — each reduces your score</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={sound ? "Mute sound" : "Unmute sound"}
              onClick={() => setPreference("sound", !sound)}
            >
              {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{sound ? "Mute sound effects" : "Unmute sound effects"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
