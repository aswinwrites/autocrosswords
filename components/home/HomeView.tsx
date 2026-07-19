"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Flame, Trophy, Percent, Timer as TimerIcon, ArrowRight, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgressStore } from "@/lib/store/useProgressStore";
import type { PuzzleSummary } from "@/types/puzzle";
import { formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";

const CATEGORIES = [
  "Formula 1", "Classic Cars", "Motorcycles", "Aircraft", "Rally", "MotoGP",
  "Le Mans", "Supercars", "Electric Vehicles", "German Engineering",
];

export function HomeView({ summaries }: { summaries: PuzzleSummary[] }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const results = useProgressStore((s) => s.results);
  const unlocked = useProgressStore((s) => s.unlocked);
  const streak = useProgressStore((s) => s.streak);
  const recentlyPlayed = useProgressStore((s) => s.recentlyPlayed);
  const totalScore = useProgressStore((s) => s.totalScore);

  const completedCount = Object.keys(results).length;
  const completionPct = Math.round((completedCount / summaries.length) * 100);
  const avgTime =
    completedCount > 0
      ? Math.round(Object.values(results).reduce((sum, r) => sum + r.timeSeconds, 0) / completedCount)
      : 0;

  const weekOfYear = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now.getTime() - start.getTime()) / 86400000;
    return Math.min(52, Math.max(1, Math.ceil((diff + start.getDay() + 1) / 7)));
  })();
  const weeklyPuzzle = summaries.find((p) => p.week === weekOfYear) ?? summaries[0];

  const continuePuzzle = hydrated
    ? summaries.find((p) => unlocked.includes(p.id) && !results[p.id])
    : undefined;
  const playHref = continuePuzzle ? `/play/${continuePuzzle.id}` : `/play/${summaries[0].id}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <Gauge className="h-12 w-12 text-racing-red" />
          <h1 className="font-display text-4xl font-bold sm:text-6xl">
            Auto<span className="text-gradient-racing">crosswords</span>
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-xl text-white/60"
        >
          A crossword for people who dream in horsepower. 52 handcrafted puzzles across cars, F1, MotoGP,
          aircraft, rally, and automotive history — one new theme every week.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" asChild>
            <Link href={playHref}>
              <Play className="mr-2 h-5 w-5" /> {continuePuzzle ? "Continue Playing" : "Play Now"}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/daily">Daily Challenge</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link href="/puzzles">Browse All Puzzles</Link>
          </Button>
        </motion.div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Percent} label="Completion" value={`${hydrated ? completionPct : 0}%`} />
        <StatCard icon={Flame} label="Current Streak" value={`${hydrated ? streak.current : 0} days`} />
        <StatCard icon={Trophy} label="Total Score" value={hydrated ? totalScore().toLocaleString() : "0"} />
        <StatCard icon={TimerIcon} label="Avg Solve Time" value={hydrated && avgTime ? formatTime(avgTime) : "—"} />
      </section>

      <section className="mt-10">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <span className="rounded-full bg-neon-blue/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neon-blue">
                Weekly Challenge — Week {weeklyPuzzle.week}
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{weeklyPuzzle.title}</h3>
              <p className="text-sm text-white/60">
                {weeklyPuzzle.category} · {weeklyPuzzle.difficulty} · {weeklyPuzzle.clueCount} clues · ~{weeklyPuzzle.estimatedTime} min
              </p>
            </div>
            <Button asChild>
              <Link href={`/play/${weeklyPuzzle.id}`}>
                Play This Week <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h3 className="mb-3 font-display text-lg font-semibold text-white">Browse by Category</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/puzzles?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 transition-colors hover:border-racing-red/50 hover:text-white"
            >
              {c}
            </Link>
          ))}
          <Link
            href="/puzzles"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-neon-blue transition-colors hover:border-neon-blue/50"
          >
            View all →
          </Link>
        </div>
      </section>

      {hydrated && recentlyPlayed.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Continue Playing</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentlyPlayed.map((id) => {
              const p = summaries.find((s) => s.id === id);
              if (!p) return null;
              return (
                <Link key={id} href={`/play/${id}`} className="min-w-[220px]">
                  <Card className="h-full transition-transform hover:-translate-y-0.5">
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-white/40">Week {p.week}</p>
                      <p className="mt-1 font-semibold text-white">{p.title}</p>
                      <p className="mt-1 text-xs text-white/50">
                        {p.category} · {p.difficulty}
                      </p>
                      {results[id] && <Progress value={100} className="mt-3" />}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Correct
        </div>
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Incorrect
        </div>
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Revealed
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Play; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <Icon className="mb-2 h-5 w-5 text-racing-red" />
        <div className="font-display text-2xl font-bold text-white">{value}</div>
        <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
      </CardContent>
    </Card>
  );
}
