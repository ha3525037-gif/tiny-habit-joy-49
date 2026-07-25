import { useState } from "react";
import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeStreak, todayKey, type Habit } from "@/lib/habits";

export function HabitCard({
  habit,
  completions,
  onToggle,
  index,
}: {
  habit: Habit;
  completions: string[];
  onToggle: () => void;
  index: number;
}) {
  const done = completions.includes(todayKey());
  const streak = computeStreak(completions);
  const [burst, setBurst] = useState(0);

  const handle = () => {
    if (!done) setBurst((n) => n + 1);
    onToggle();
  };

  return (
    <div
      className="animate-entry group flex items-center justify-between rounded-3xl border border-border bg-card p-4"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface text-2xl">
          {habit.emoji}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-foreground">
            {habit.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            <Flame
              className={cn(
                "size-3.5",
                streak > 0 ? "fill-orange-500 text-orange-500" : "text-muted-foreground opacity-50",
              )}
            />
            <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {streak} Day Streak
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handle}
        aria-pressed={done}
        aria-label={done ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
        className={cn(
          "relative grid size-12 shrink-0 place-items-center rounded-full border-2 transition-transform active:scale-90",
          done
            ? "border-accent bg-accent text-accent-foreground animate-pop"
            : "border-border bg-transparent",
        )}
      >
        {done && <Check className="size-5" strokeWidth={3} />}
        {burst > 0 && done && (
          <span
            key={burst}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-accent animate-burst"
          />
        )}
      </button>
    </div>
  );
}
