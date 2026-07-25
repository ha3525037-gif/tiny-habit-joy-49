import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { useHabits } from "@/hooks/use-habits";
import { HabitCard } from "@/components/habit-card";
import { todayKey } from "@/lib/habits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today · TinyHabit" },
      {
        name: "description",
        content:
          "Your daily habit check-in. Tap a habit to mark it done and keep your streak going.",
      },
      { property: "og:title", content: "Today · TinyHabit" },
      {
        property: "og:description",
        content: "Tap to complete today's habits and watch your streaks grow.",
      },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const { state, toggleToday, hydrated } = useHabits();
  const today = new Date();
  const dateLabel = today
    .toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();

  const doneCount = state.habits.filter((h) =>
    (state.completions[h.id] ?? []).includes(todayKey()),
  ).length;
  const total = state.habits.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div>
      <header className="animate-entry px-6 pt-8 pb-4">
        <div className="flex items-end justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {dateLabel}
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
              Today
            </h1>
          </div>
          <ProgressRing pct={pct} />
        </div>
      </header>

      <section className="space-y-3 px-6">
        {!hydrated || total > 0 ? (
          state.habits.map((h, i) => (
            <HabitCard
              key={h.id}
              habit={h}
              completions={state.completions[h.id] ?? []}
              onToggle={() => toggleToday(h.id)}
              index={i}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const offset = c - (c * pct) / 100;
  return (
    <div className="relative grid size-14 place-items-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth="4"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 500ms var(--ease-out-expo)" }}
        />
      </svg>
      <span className="font-mono text-xs font-bold">{pct}%</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="animate-entry flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="relative grid size-20 place-items-center rounded-full bg-accent-soft">
        <Sparkles className="size-8 text-accent" strokeWidth={2} />
        <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-accent text-accent-foreground shadow">
          <Plus className="size-3.5" strokeWidth={3} />
        </span>
      </div>
      <div>
        <h2 className="font-display text-lg font-bold">Plant your first habit</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Add up to five small habits. Tap them each day and watch your streaks grow.
        </p>
      </div>
      <Link
        to="/settings"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground active:scale-95 transition-transform"
      >
        <Plus className="size-4" strokeWidth={3} />
        Add a habit
      </Link>
    </div>
  );
}
