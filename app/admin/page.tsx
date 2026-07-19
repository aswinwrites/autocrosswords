"use client";
import { useMemo, useRef, useState } from "react";
import { Download, Upload, CheckCircle2, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeNumbering, validatePuzzleStructure } from "@/lib/validatePuzzle";
import type { ClueEntry, Difficulty, Category, Puzzle, Direction } from "@/types/puzzle";
import { cn } from "@/lib/utils";

const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard", "Expert", "Legend"];
const CATS: Category[] = [
  "Classic Cars", "Formula 1", "Motorcycles", "Aircraft", "Luxury Cars", "Japanese Cars",
  "American Muscle", "German Engineering", "Indian Automobiles", "Movie Cars", "Supercars",
  "Electric Vehicles", "Engine Technology", "Car Logos", "Rally", "MotoGP", "Le Mans",
  "History", "Military Vehicles", "Concept Cars", "Car Culture", "Mixed",
];

export default function AdminPage() {
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const [grid, setGrid] = useState<(string | null)[][]>(() => Array.from({ length: 9 }, () => Array(9).fill("")));
  const [meta, setMeta] = useState({
    id: "puzzle-053",
    week: 53,
    title: "New Puzzle",
    difficulty: "Easy" as Difficulty,
    category: "Mixed" as Category,
    theme: "Mixed",
    author: "Autocrosswords Studio",
    estimatedTime: 6,
  });
  const [clues, setClues] = useState<Record<string, { answer: string; clue: string }>>({});
  const [errors, setErrors] = useState<string[] | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function resize(newRows: number, newCols: number) {
    setGrid((prev) => {
      const next: (string | null)[][] = Array.from({ length: newRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) => prev[r]?.[c] ?? "")
      );
      return next;
    });
    setRows(newRows);
    setCols(newCols);
  }

  function toggleCell(r: number, c: number) {
    setGrid((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = next[r][c] === null ? "" : null;
      return next;
    });
  }

  function setLetter(r: number, c: number, letter: string) {
    setGrid((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = letter.toUpperCase().slice(-1);
      return next;
    });
  }

  const normalizedGrid: (string | null)[][] = grid.map((row) => row.map((cell) => (cell === null ? null : cell || null)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const numberAt = useMemo(() => computeNumbering(rows, cols, normalizedGrid), [rows, cols, grid]);

  const clueStarts = useMemo(() => {
    const starts: { r: number; c: number; number: number; directions: Direction[] }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const num = numberAt[r][c];
        if (num == null) continue;
        const directions: Direction[] = [];
        const startsAcross = normalizedGrid[r][c] !== null && (c === 0 || normalizedGrid[r][c - 1] === null) && c + 1 < cols && normalizedGrid[r][c + 1] !== null;
        const startsDown = normalizedGrid[r][c] !== null && (r === 0 || normalizedGrid[r - 1][c] === null) && r + 1 < rows && normalizedGrid[r + 1][c] !== null;
        if (startsAcross) directions.push("across");
        if (startsDown) directions.push("down");
        starts.push({ r, c, number: num, directions });
      }
    }
    return starts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberAt, rows, cols, grid]);

  function buildPuzzle(): Puzzle {
    const across: ClueEntry[] = [];
    const down: ClueEntry[] = [];
    for (const s of clueStarts) {
      for (const dir of s.directions) {
        const key = `${s.number}-${dir}`;
        const entry = clues[key];
        let answer = "";
        if (dir === "across") {
          let c = s.c;
          while (c < cols && normalizedGrid[s.r][c] !== null) {
            answer += normalizedGrid[s.r][c] || "?";
            c++;
          }
        } else {
          let r = s.r;
          while (r < rows && normalizedGrid[r][s.c] !== null) {
            answer += normalizedGrid[r][s.c] || "?";
            r++;
          }
        }
        const clueEntry: ClueEntry = {
          number: s.number,
          answer,
          clue: entry?.clue ?? "",
          startRow: s.r,
          startCol: s.c,
          direction: dir,
        };
        if (dir === "across") across.push(clueEntry);
        else down.push(clueEntry);
      }
    }
    return {
      ...meta,
      rows,
      cols,
      grid: normalizedGrid,
      across,
      down,
    };
  }

  function handleValidate() {
    const puzzle = buildPuzzle();
    setErrors(validatePuzzleStructure(puzzle));
  }

  function handleExport() {
    const puzzle = buildPuzzle();
    const blob = new Blob([JSON.stringify(puzzle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${puzzle.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const puzzle: Puzzle = JSON.parse(reader.result as string);
        setMeta({
          id: puzzle.id,
          week: puzzle.week,
          title: puzzle.title,
          difficulty: puzzle.difficulty,
          category: puzzle.category,
          theme: puzzle.theme,
          author: puzzle.author,
          estimatedTime: puzzle.estimatedTime,
        });
        setRows(puzzle.rows);
        setCols(puzzle.cols);
        setGrid(puzzle.grid.map((row) => row.map((c) => c ?? null)));
        const newClues: Record<string, { answer: string; clue: string }> = {};
        for (const c of [...puzzle.across, ...puzzle.down]) {
          newClues[`${c.number}-${c.direction}`] = { answer: c.answer, clue: c.clue };
        }
        setClues(newClues);
        setErrors(null);
      } catch {
        alert("Invalid puzzle JSON file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
        Internal tool — not linked from the public app. Use this to author new puzzle JSON files for data/puzzles.
      </div>
      <h1 className="font-display text-3xl font-bold text-white">Puzzle Builder</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="ID"><input className="input" value={meta.id} onChange={(e) => setMeta({ ...meta, id: e.target.value })} /></Field>
            <Field label="Week"><input type="number" className="input" value={meta.week} onChange={(e) => setMeta({ ...meta, week: Number(e.target.value) })} /></Field>
            <Field label="Title"><input className="input" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></Field>
            <Field label="Theme"><input className="input" value={meta.theme} onChange={(e) => setMeta({ ...meta, theme: e.target.value })} /></Field>
            <Field label="Difficulty">
              <select className="input" value={meta.difficulty} onChange={(e) => setMeta({ ...meta, difficulty: e.target.value as Difficulty })}>
                {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select className="input" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value as Category })}>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Author"><input className="input" value={meta.author} onChange={(e) => setMeta({ ...meta, author: e.target.value })} /></Field>
            <Field label="Est. minutes"><input type="number" className="input" value={meta.estimatedTime} onChange={(e) => setMeta({ ...meta, estimatedTime: Number(e.target.value) })} /></Field>
            <div className="flex gap-2">
              <Field label="Rows"><input type="number" className="input" value={rows} onChange={(e) => resize(Number(e.target.value), cols)} /></Field>
              <Field label="Cols"><input type="number" className="input" value={cols} onChange={(e) => resize(rows, Number(e.target.value))} /></Field>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" onClick={handleValidate}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Validate</Button>
              <Button size="sm" variant="secondary" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" /> Export JSON</Button>
              <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
                <Upload className="mr-1.5 h-4 w-4" /> Import JSON
              </Button>
              <input ref={fileInput} type="file" accept="application/json" className="hidden" onChange={handleImport} />
            </div>
            {errors && (
              <div className={cn("rounded-lg p-3 text-xs", errors.length === 0 ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300")}>
                {errors.length === 0 ? (
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Puzzle is valid!</span>
                ) : (
                  <ul className="space-y-1">
                    {errors.map((e, i) => (
                      <li key={i} className="flex items-start gap-1.5"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Grid Editor</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-white/50">Click a cell to toggle block/letter. Type a letter to fill an active cell.</p>
              <div
                className="grid gap-[2px] bg-white/5 p-[2px] rounded-lg"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, maxWidth: cols * 40 }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => (
                    <div key={`${r}-${c}`} className="relative aspect-square">
                      {numberAt[r]?.[c] != null && (
                        <span className="absolute top-0 left-0.5 z-10 text-[8px] text-white/50">{numberAt[r][c]}</span>
                      )}
                      <input
                        maxLength={1}
                        value={cell === null ? "" : cell}
                        onClick={(e) => {
                          if ((e.target as HTMLInputElement).value === "" && cell === "") toggleCell(r, c);
                        }}
                        onDoubleClick={() => toggleCell(r, c)}
                        onChange={(e) => setLetter(r, c, e.target.value)}
                        disabled={cell === null}
                        className={cn(
                          "h-full w-full rounded-[3px] border-0 text-center font-mono text-sm font-bold uppercase outline-none",
                          cell === null ? "bg-charcoal-950" : "bg-charcoal-800 text-white focus:bg-neon-blue/20"
                        )}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Clue Editor</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
              {clueStarts.length === 0 && <p className="text-sm text-white/40">No numbered starts yet — build a grid above.</p>}
              {clueStarts.map((s) =>
                s.directions.map((dir) => {
                  const key = `${s.number}-${dir}`;
                  return (
                    <div key={key} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                      <span className="w-14 shrink-0 text-xs font-semibold text-white/60">
                        {s.number} {dir === "across" ? "A" : "D"}
                      </span>
                      <input
                        className="input flex-1"
                        placeholder="Clue text…"
                        value={clues[key]?.clue ?? ""}
                        onChange={(e) => setClues({ ...clues, [key]: { answer: clues[key]?.answer ?? "", clue: e.target.value } })}
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <style>{`.input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; padding: 0.4rem 0.6rem; font-size: 0.85rem; color: white; width: 100%; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/50">{label}</span>
      {children}
    </label>
  );
}
