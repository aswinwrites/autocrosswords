"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Clock, ListChecks, Star, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/lib/store/useProgressStore";
import type { PuzzleSummary, Difficulty, Category } from "@/types/puzzle";
import { cn } from "@/lib/utils";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard", "Expert", "Legend"];

export function PuzzlesView({ summaries }: { summaries: PuzzleSummary[] }) {
  const searchParams = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [category, setCategory] = useState<Category | "All">((searchParams.get("category") as Category) || "All");
  const [freePlay, setFreePlay] = useState(false);

  const unlocked = useProgressStore((s) => s.unlocked);
  const results = useProgressStore((s) => s.results);

  const categories = useMemo(() => Array.from(new Set(summaries.map((s) => s.category))).sort(), [summaries]);

  const filtered = summaries.filter((p) => {
    if (difficulty !== "All" && p.difficulty !== difficulty) return false;
    if (category !== "All" && p.category !== category) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.theme.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Puzzle Library</h1>
          <p className="text-white/60">52 weeks of automotive crosswords. Complete one to unlock the next.</p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
          <input type="checkbox" checked={freePlay} onChange={(e) => setFreePlay(e.target.checked)} className="accent-racing-red" />
          Free Play (show all)
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by theme, brand, vehicle, or category…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-racing-red/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={difficulty === "All"} onClick={() => setDifficulty("All")}>
            All Difficulties
          </FilterChip>
          {DIFFICULTIES.map((d) => (
            <FilterChip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === "All"} onClick={() => setCategory("All")}>
            All Categories
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c as Category)}>
              {c}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => {
          const isUnlocked = hydrated ? unlocked.includes(p.id) || freePlay : p.week === 1;
          const result = results[p.id];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
            >
              <Link href={isUnlocked ? `/play/${p.id}` : "#"} className={cn(!isUnlocked && "pointer-events-none")}>
                <Card
                  className={cn(
                    "h-full transition-transform hover:-translate-y-1 hover:border-racing-red/30",
                    !isUnlocked && "opacity-50"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neon-blue">Week {p.week}</span>
                      {!isUnlocked && <Lock className="h-4 w-4 text-white/40" />}
                      {result && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold text-white">{p.theme}</h3>
                    <p className="text-xs text-white/50">{p.category}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {p.estimatedTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <ListChecks className="h-3.5 w-3.5" /> {p.clueCount} clues
                      </span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 font-semibold",
                          p.difficulty === "Easy" && "bg-emerald-500/20 text-emerald-400",
                          p.difficulty === "Medium" && "bg-blue-500/20 text-blue-400",
                          p.difficulty === "Hard" && "bg-amber-500/20 text-amber-400",
                          p.difficulty === "Expert" && "bg-orange-500/20 text-orange-400",
                          p.difficulty === "Legend" && "bg-fuchsia-500/20 text-fuchsia-400"
                        )}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                    {result && (
                      <p className="mt-2 text-xs text-white/50">
                        Best score: <span className="font-semibold text-white">{result.score}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="mt-10 text-center text-white/40">No puzzles match your filters.</p>}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button variant={active ? "default" : "outline"} size="sm" onClick={onClick} className="rounded-full">
      {children}
    </Button>
  );
}
