"use client";

const ITEMS = [
  { color: "bg-neon-blue", label: "Current cell" },
  { color: "bg-emerald-600", label: "Correct" },
  { color: "bg-red-600", label: "Incorrect" },
  { color: "bg-amber-500", label: "Revealed by hint" },
];

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 px-1 text-xs text-white/40">
      {ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
