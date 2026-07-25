import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Moon, Pencil, Plus, Sun, Trash2, X } from "lucide-react";
import { useHabits } from "@/hooks/use-habits";
import { useTheme } from "@/hooks/use-theme";
import { MAX_HABITS, type Habit } from "@/lib/habits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Setup · TinyHabit" },
      {
        name: "description",
        content:
          "Add, rename, reorder, or delete your habits. Switch between light and dark mode.",
      },
      { property: "og:title", content: "Setup · TinyHabit" },
      {
        property: "og:description",
        content: "Manage your habits and appearance settings.",
      },
    ],
  }),
  component: SettingsPage,
});

const EMOJI_CHOICES = [
  "💧", "📖", "🧘", "🏃", "🥗", "😴", "✍️", "🎯",
  "☀️", "🌱", "🎧", "💪", "🧠", "🙏", "🚿", "🍎",
];

function SettingsPage() {
  const { state, addHabit, updateHabit, deleteHabit, reorderHabits, hydrated } = useHabits();
  const { theme, toggle } = useTheme();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const canAdd = state.habits.length < MAX_HABITS;

  return (
    <div className="px-6 pt-8">
      <header className="animate-entry mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Preferences
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Setup</h1>
      </header>

      <section className="animate-entry mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Habits ({state.habits.length}/{MAX_HABITS})
          </h2>
          <button
            onClick={() => setAdding(true)}
            disabled={!canAdd}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground disabled:opacity-40 active:scale-95 transition"
          >
            <Plus className="size-3.5" strokeWidth={3} /> Add
          </button>
        </div>

        <div className="space-y-2">
          {hydrated && state.habits.length === 0 && (
            <p className="rounded-3xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              No habits yet. Add up to {MAX_HABITS}.
            </p>
          )}
          {state.habits.map((h, i) => (
            <div
              key={h.id}
              className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface text-xl">
                {h.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{h.name}</p>
              </div>
              <div className="flex items-center gap-1">
                <IconBtn
                  disabled={i === 0}
                  onClick={() => reorderHabits(i, i - 1)}
                  label="Move up"
                >
                  <ArrowUp className="size-4" />
                </IconBtn>
                <IconBtn
                  disabled={i === state.habits.length - 1}
                  onClick={() => reorderHabits(i, i + 1)}
                  label="Move down"
                >
                  <ArrowDown className="size-4" />
                </IconBtn>
                <IconBtn onClick={() => setEditing(h)} label="Edit">
                  <Pencil className="size-4" />
                </IconBtn>
                <IconBtn
                  onClick={() => {
                    if (confirm(`Delete "${h.name}"? This will also erase its history.`)) {
                      deleteHabit(h.id);
                    }
                  }}
                  label="Delete"
                  tone="destructive"
                >
                  <Trash2 className="size-4" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-entry">
        <h2 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Appearance
        </h2>
        <button
          onClick={toggle}
          className="flex w-full items-center justify-between rounded-3xl border border-border bg-card p-4 active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-surface">
              {theme === "dark" ? (
                <Moon className="size-5 text-accent" />
              ) : (
                <Sun className="size-5 text-accent" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Dark mode</p>
              <p className="text-xs text-muted-foreground">
                {theme === "dark" ? "On" : "Off"}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              theme === "dark" ? "bg-accent" : "bg-surface-2",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                theme === "dark" ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </div>
        </button>
      </section>

      <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        All data stored on this device
      </p>

      {(adding || editing) && (
        <HabitSheet
          initial={editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={(name, emoji) => {
            if (editing) updateHabit(editing.id, { name, emoji });
            else addHabit(name, emoji);
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  tone?: "destructive";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-9 place-items-center rounded-full text-muted-foreground transition active:scale-90 disabled:opacity-30",
        tone === "destructive" ? "hover:text-destructive" : "hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function HabitSheet({
  initial,
  onClose,
  onSave,
}: {
  initial: Habit | null;
  onClose: () => void;
  onSave: (name: string, emoji: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? EMOJI_CHOICES[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="animate-entry mx-auto w-full max-w-md rounded-t-[2rem] border-t border-border bg-background p-6 pb-10"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">
            {initial ? "Edit habit" : "New habit"}
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
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Drink water"
          maxLength={40}
          autoFocus
          className="mb-5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-base font-medium outline-none focus:border-accent"
        />

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
          onClick={() => name.trim() && onSave(name.trim(), emoji)}
          disabled={!name.trim()}
          className="w-full rounded-full bg-accent py-3.5 text-sm font-bold uppercase tracking-wider text-accent-foreground disabled:opacity-40 active:scale-[0.98] transition"
        >
          {initial ? "Save changes" : "Create habit"}
        </button>
      </div>
    </div>
  );
}
