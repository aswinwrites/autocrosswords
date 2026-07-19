"use client";
import { useEffect, useMemo, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgressStore } from "@/lib/store/useProgressStore";
import type { PuzzleSummary } from "@/types/puzzle";
import { formatTime } from "@/lib/utils";

export function StatsView({ summaries }: { summaries: PuzzleSummary[] }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const results = useProgressStore((s) => s.results);
  const streak = useProgressStore((s) => s.streak);
  const totalScore = useProgressStore((s) => s.totalScore);

  const byId = useMemo(() => new Map(summaries.map((s) => [s.id, s])), [summaries]);

  const solved = Object.values(results);
  const totalSolved = solved.length;
  const avgAccuracy = totalSolved ? Math.round(solved.reduce((s, r) => s + r.accuracy, 0) / totalSolved) : 0;
  const avgTime = totalSolved ? Math.round(solved.reduce((s, r) => s + r.timeSeconds, 0) / totalSolved) : 0;
  const completionPct = Math.round((totalSolved / summaries.length) * 100);

  const categoryCounts = new Map<string, number>();
  for (const r of solved) {
    const cat = byId.get(r.puzzleId)?.category;
    if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }
  const favoriteCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const difficultyCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0, Expert: 0, Legend: 0 };
  for (const r of solved) {
    const diff = byId.get(r.puzzleId)?.difficulty;
    if (diff) difficultyCounts[diff] += 1;
  }
  const radarData = Object.entries(difficultyCounts).map(([difficulty, count]) => ({ difficulty, count }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Statistics Dashboard</h1>
      <p className="text-white/60">Your Autocrosswords performance at a glance.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total Solved" value={hydrated ? `${totalSolved}` : "0"} />
        <Metric label="Accuracy" value={hydrated ? `${avgAccuracy}%` : "—"} />
        <Metric label="Avg Solve Time" value={hydrated && avgTime ? formatTime(avgTime) : "—"} />
        <Metric label="Favorite Category" value={hydrated ? favoriteCategory : "—"} />
        <Metric label="Total Score" value={hydrated ? totalScore().toLocaleString() : "0"} />
        <Metric label="Longest Streak" value={hydrated ? `${streak.best} days` : "0 days"} />
        <Metric label="Completion" value={hydrated ? `${completionPct}%` : "0%"} />
        <Metric label="Puzzles Remaining" value={hydrated ? `${summaries.length - totalSolved}` : `${summaries.length}`} />
      </div>

      <div className="mt-6">
        <Progress value={completionPct} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Difficulty Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="difficulty" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
              <Radar dataKey="count" stroke="#E10600" fill="#E10600" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="font-display text-2xl font-bold text-white">{value}</div>
        <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
      </CardContent>
    </Card>
  );
}
