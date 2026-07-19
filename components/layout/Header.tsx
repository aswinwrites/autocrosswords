"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Trophy, BarChart3, CalendarDays, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/puzzles", label: "Puzzles", icon: Grid3x3 },
  { href: "/daily", label: "Daily", icon: CalendarDays },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-charcoal-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <Gauge className="h-6 w-6 text-racing-red" />
          Auto<span className="text-racing-red">crosswords</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
