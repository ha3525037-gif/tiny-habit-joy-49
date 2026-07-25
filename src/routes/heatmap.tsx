import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHabits } from "@/hooks/use-habits";
import { cn } from "@/lib/utils";
import { todayKey } from "@/lib/habits";

export const Route = createFileRoute("/heatmap")({
  head: () => ({
    meta: [
      { title: "History · TinyHabit" },
      {
        name: "description",
        content:
          "See a calendar heatmap of your habit consistency. Darker squares mean more habits completed.",
      },
      { property: "og:title", content: "History · TinyHabit" },
      {
        property: "og:description",
        content: "A calendar heatmap of your habit consistency across the month.",
      },
    ],
  }),
  component: HeatmapPage,
});

function HeatmapPage() {
  const { state } = useHabits();
  const [offset, setOffset] = useState(0);

  const view = useMemo(() => {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + offset);
    return base;
  }, [offset]);

  const monthLabel = view.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const startWeekday = new Date(view.getFullYear(), view.getMonth(), 1).getDay();

  const cells: Array<{ key: string; day: number; ratio: number; isToday: boolean } | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  const habitCount = Math.max(state.habits.length, 1);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    let done = 0;
    for (const h of state.habits) {
      if ((state.completions[h.id] ?? []).includes(key)) done += 1;
    }
    cells.push({
      key,
      day: d,
      ratio: state.habits.length ? done / habitCount : 0,
      isToday: key === todayKey(),
    });
  }

  return (
    <div className="px-6 pt-8">
      <header className="animate-entry mb-6 flex items-end justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Consistency Matrix
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            History
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            onClick={() => setOffset((o) => o - 1)}
            className="grid size-9 place-items-center rounded-full border border-border bg-card active:scale-95 transition"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="Next month"
            onClick={() => setOffset((o) => Math.min(0, o + 1))}
            disabled={offset >= 0}
            className="grid size-9 place-items-center rounded-full border border-border bg-card disabled:opacity-30 active:scale-95 transition"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="animate-entry rounded-3xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-sm font-semibold">{monthLabel}</span>
          <Legend />
        </div>
        <div className="mb-2 grid grid-cols-7 gap-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center font-mono text-[10px] font-medium uppercase text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, i) =>
            cell ? (
              <div
                key={cell.key}
                className={cn(
                  "relative aspect-square rounded-md",
                  cell.isToday && "ring-2 ring-accent ring-offset-2 ring-offset-card",
                )}
                style={{ backgroundColor: shade(cell.ratio) }}
                title={`${cell.key} — ${Math.round(cell.ratio * 100)}%`}
              />
            ) : (
              <div key={`e-${i}`} className="aspect-square" />
            ),
          )}
        </div>
      </div>

      {state.habits.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No habits yet.{" "}
          <Link to="/settings" className="font-semibold text-accent underline underline-offset-4">
            Add one
          </Link>{" "}
          to start tracking.
        </p>
      )}
    </div>
  );
}

function shade(ratio: number): string {
  if (ratio <= 0) return "var(--color-surface)";
  const clamped = Math.min(1, Math.max(0.1, ratio));
  return `color-mix(in oklab, var(--color-accent) ${Math.round(clamped * 100)}%, var(--color-surface))`;
}

function Legend() {
  const steps = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[10px] uppercase text-muted-foreground">less</span>
      {steps.map((s) => (
        <div key={s} className="size-3 rounded-[3px]" style={{ backgroundColor: shade(s) }} />
      ))}
      <span className="font-mono text-[10px] uppercase text-muted-foreground">more</span>
    </div>
  );
}
