"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CheckMode, PuzzleResult } from "@/types/game";

export interface Preferences {
  theme: "dark" | "light";
  sound: boolean;
  checkMode: CheckMode;
  highContrast: boolean;
  largeFont: boolean;
  colorblind: boolean;
}

export interface InProgressState {
  cells: string[][];
  timeSeconds: number;
  hintsUsed: number;
  mistakes: number;
  lastPlayed: string;
}

interface StreakState {
  current: number;
  best: number;
  lastCompletedDate: string | null;
}

interface DailyState {
  current: number;
  best: number;
  lastPlayedDate: string | null;
  usedPuzzleIds: string[];
}

interface ProgressState {
  results: Record<string, PuzzleResult>;
  unlocked: string[];
  streak: StreakState;
  daily: DailyState;
  achievements: string[];
  preferences: Preferences;
  inProgress: Record<string, InProgressState>;
  recentlyPlayed: string[];

  completePuzzle: (result: PuzzleResult) => void;
  unlockPuzzle: (id: string) => void;
  saveInProgress: (id: string, state: InProgressState) => void;
  clearInProgress: (id: string) => void;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  addAchievements: (ids: string[]) => void;
  recordDailyPlay: (puzzleId: string) => void;
  touchRecentlyPlayed: (id: string) => void;
  totalScore: () => number;
  totalCompleted: () => number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateKey: string): boolean {
  const d = new Date(dateKey);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toISOString().slice(0, 10) === y.toISOString().slice(0, 10);
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      results: {},
      unlocked: ["puzzle-001"],
      streak: { current: 0, best: 0, lastCompletedDate: null },
      daily: { current: 0, best: 0, lastPlayedDate: null, usedPuzzleIds: [] },
      achievements: [],
      preferences: {
        theme: "dark",
        sound: false,
        checkMode: "manual",
        highContrast: false,
        largeFont: false,
        colorblind: false,
      },
      inProgress: {},
      recentlyPlayed: [],

      completePuzzle: (result) => {
        set((state) => {
          const today = todayKey();
          const prevDate = state.streak.lastCompletedDate;
          let current = state.streak.current;
          if (prevDate === today) {
            // already counted today
          } else if (prevDate && isYesterday(prevDate)) {
            current += 1;
          } else {
            current = 1;
          }
          const best = Math.max(state.streak.best, current);
          const inProgress = { ...state.inProgress };
          delete inProgress[result.puzzleId];
          return {
            results: { ...state.results, [result.puzzleId]: result },
            streak: { current, best, lastCompletedDate: today },
            inProgress,
          };
        });
      },

      unlockPuzzle: (id) => {
        set((state) => (state.unlocked.includes(id) ? state : { unlocked: [...state.unlocked, id] }));
      },

      saveInProgress: (id, s) => {
        set((state) => ({ inProgress: { ...state.inProgress, [id]: s } }));
      },

      clearInProgress: (id) => {
        set((state) => {
          const inProgress = { ...state.inProgress };
          delete inProgress[id];
          return { inProgress };
        });
      },

      setPreference: (key, value) => {
        set((state) => ({ preferences: { ...state.preferences, [key]: value } }));
      },

      addAchievements: (ids) => {
        if (ids.length === 0) return;
        set((state) => ({ achievements: Array.from(new Set([...state.achievements, ...ids])) }));
      },

      recordDailyPlay: (puzzleId) => {
        set((state) => {
          const today = todayKey();
          if (state.daily.lastPlayedDate === today) return {};
          const prevDate = state.daily.lastPlayedDate;
          let current = state.daily.current;
          if (prevDate && isYesterday(prevDate)) current += 1;
          else current = 1;
          const best = Math.max(state.daily.best, current);
          return {
            daily: {
              current,
              best,
              lastPlayedDate: today,
              usedPuzzleIds: [...state.daily.usedPuzzleIds, puzzleId],
            },
          };
        });
      },

      touchRecentlyPlayed: (id) => {
        set((state) => {
          const filtered = state.recentlyPlayed.filter((p) => p !== id);
          return { recentlyPlayed: [id, ...filtered].slice(0, 8) };
        });
      },

      totalScore: () => {
        return Object.values(get().results).reduce((sum, r) => sum + r.score, 0);
      },
      totalCompleted: () => Object.keys(get().results).length,
    }),
    { name: "autocrosswords-progress" }
  )
);
