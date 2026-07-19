"use client";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const earned = useProgressStore((s) => s.achievements);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Achievements</h1>
      <p className="text-white/60">
        {hydrated ? earned.length : 0} / {ACHIEVEMENTS.length} unlocked
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = hydrated && earned.includes(a.id);
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[a.icon] ?? Icons.Trophy;
          return (
            <Card key={a.id} className={cn("transition-opacity", !unlocked && "opacity-40 grayscale")}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className={cn("rounded-xl p-3", unlocked ? "bg-racing-red/20 text-racing-red" : "bg-white/5 text-white/40")}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">{a.name}</h3>
                  <p className="text-sm text-white/50">{a.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
