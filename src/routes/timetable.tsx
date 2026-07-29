import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTimetable } from "@/hooks/use-timetable";
import {
  minutesOfDay,
  nowMinutes,
  sortByStart,
  type TimeBlock,
} from "@/lib/timetable";
import { cn } from "@/lib/utils";

const EMOJI_CHOICES = [
  "🗓️", "💼", "🏋️", "🍽️", "📚", "🧑‍💻", "☕", "🚶",
  "🎨", "🎧", "🧘", "🛏️", "🚿", "🧠", "📞", "✈️",
];

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: "Schedule · TinyHabit" },
      {
        name: "description",
        content:
          "A simple daily timetable that repeats every day, with a live now-line so you always know what's next.",
      },
      { property: "og:title", content: "Schedule · TinyHabit" },
      {
        property: "og:description",
        content: "A simple daily timetable that repeats every day.",
      },
    ],
  }),
  component: TimetablePage,
});

function useNowMinutes() {
  const [n, setN] = useState(() => nowMinutes());
  useEffect(() => {
    const id = window.setInterval(() => setN(nowMinutes()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return n;
}

function TimetablePage() {
  const { state, addBlock, updateBlock, deleteBlock, hydrated } = useTimetable();
  const [editing, setEditing] = useState<TimeBlock | null>(null);
  const [adding, setAdding] = useState(false);
  const now = useNowMinutes();

  const sorted = sortByStart(state);
  const dayStart = 0;
  const dayEnd = 24 * 60;
  const nowPct = ((now - dayStart) / (dayEnd - dayStart)) * 100;

  return (
    <div className="px-6 pt-8">
      <header className="animate-entry mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Your day, on repeat
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Schedule
          </h1>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground active:scale-95 transition"
        >
          <Plus className="size-3.5" strokeWidth={3} /> Block
        </button>
      </header>

      {hydrated && sorted.length === 0 && <ScheduleEmpty />}

      {sorted.length > 0 && (
        <section className="relative">
          {/* now-line */}
          <div
            className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
            style={{ top: `${nowPct}%` }}
          >
            <span className="ml-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-accent-foreground">
              Now
            </span>
            <div className="ml-1 h-[2px] flex-1 bg-accent" />
          </div>

          <ol className="space-y-2.5">
            {sorted.map((b, i) => {
              const isNow =
                minutesOfDay(b.startTime) <= now &&
                minutesOfDay(b.endTime) > now;
              return (
                <li
                  key={b.id}
                  className={cn(
                    "animate-entry flex items-center gap-3 rounded-3xl border border-border bg-card p-3",
                    isNow && "border-accent",
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface text-2xl">
                    {b.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">
                      {b.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {b.startTime} – {b.endTime}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditing(b)}
                    aria-label="Edit"
                    className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground active:scale-90 transition"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${b.title}"?`)) deleteBlock(b.id);
                    }}
                    aria-label="Delete"
                    className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-destructive active:scale-90 transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {(adding || editing) && (
        <BlockSheet
          initial={editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={(title, emoji, start, end) => {
            if (editing)
              updateBlock(editing.id, {
                title,
                emoji,
                startTime: start,
                endTime: end,
              });
            else addBlock(title, emoji, start, end);
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ScheduleEmpty() {
  return (
    <div className="animate-entry flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-accent-soft">
        <CalendarClock className="size-8 text-accent" strokeWidth={2} />
      </div>
      <div>
        <h2 className="font-display text-lg font-bold">Design your day</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Add blocks that repeat every day. TinyHabit will nudge you 10 min before each one starts.
        </p>
      </div>
    </div>
  );
}

function BlockSheet({
  initial,
  onClose,
  onSave,
}: {
  initial: TimeBlock | null;
  onClose: () => void;
  onSave: (title: string, emoji: string, start: string, end: string) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? EMOJI_CHOICES[0]);
  const [start, setStart] = useState(initial?.startTime ?? "09:00");
  const [end, setEnd] = useState(initial?.endTime ?? "10:00");

  const valid = title.trim() && start && end && start < end;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="animate-entry mx-auto w-full max-w-md rounded-t-[2rem] border-t border-border bg-background p-6 pb-10"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">
            {initial ? "Edit block" : "New block"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-surface"
          >
            <X className="size-4" />
          </button>
        </div>

        <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Deep work"
          maxLength={40}
          autoFocus
          className="mb-5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-base font-medium outline-none focus:border-accent"
        />

        <div className="mb-5 flex gap-3">
          <div className="flex-1">
            <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Start
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 font-mono text-sm font-medium outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              End
            </label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 font-mono text-sm font-medium outline-none focus:border-accent"
            />
          </div>
        </div>

        <label className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Icon
        </label>
        <div className="mb-6 grid grid-cols-8 gap-2">
          {EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={cn(
                "grid aspect-square place-items-center rounded-xl border text-xl transition active:scale-90",
                emoji === e
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-card",
              )}
            >
              {e}
            </button>
          ))}
        </div>

        <button
          onClick={() => valid && onSave(title.trim(), emoji, start, end)}
          disabled={!valid}
          className="w-full rounded-full bg-accent py-3.5 text-sm font-bold uppercase tracking-wider text-accent-foreground disabled:opacity-40 active:scale-[0.98] transition"
        >
          {initial ? "Save changes" : "Create block"}
        </button>
      </div>
    </div>
  );
}
