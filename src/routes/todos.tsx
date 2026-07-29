import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ListTodo, Plus, Trash2 } from "lucide-react";
import { useTodos } from "@/hooks/use-todos";
import { sortTodos, type Todo } from "@/lib/todos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/todos")({
  head: () => ({
    meta: [
      { title: "Todos · TinyHabit" },
      {
        name: "description",
        content:
          "A tiny todo list with optional times. Focus on what's due, cross it off, move on.",
      },
      { property: "og:title", content: "Todos · TinyHabit" },
      {
        property: "og:description",
        content: "A tiny todo list with optional times.",
      },
    ],
  }),
  component: TodosPage,
});

function TodosPage() {
  const { state, addTodo, toggleTodo, deleteTodo, hydrated } = useTodos();
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    addTodo(title, time || undefined);
    setTitle("");
    setTime("");
  };

  const sorted = sortTodos(state);

  return (
    <div className="px-6 pt-8">
      <header className="animate-entry mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Get it done
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          Todos
        </h1>
      </header>

      <section className="animate-entry mb-5 rounded-3xl border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Add a todo…"
            maxLength={80}
            className="min-w-0 flex-1 rounded-2xl bg-transparent px-3 py-2.5 text-base font-medium outline-none placeholder:text-muted-foreground"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-2xl bg-surface px-2 py-2 font-mono text-xs font-medium outline-none"
          />
          <button
            onClick={submit}
            disabled={!title.trim()}
            aria-label="Add todo"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground disabled:opacity-40 active:scale-90 transition"
          >
            <Plus className="size-5" strokeWidth={3} />
          </button>
        </div>
      </section>

      <section className="space-y-2.5">
        {hydrated && sorted.length === 0 && <TodosEmpty />}
        {sorted.map((t, i) => (
          <TodoRow
            key={t.id}
            todo={t}
            index={i}
            onToggle={() => toggleTodo(t.id)}
            onDelete={() => deleteTodo(t.id)}
          />
        ))}
      </section>
    </div>
  );
}

function TodoRow({
  todo,
  index,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "animate-entry group flex items-center gap-3 rounded-3xl border border-border bg-card p-3",
        todo.done && "opacity-60",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={todo.done}
        aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full border-2 transition-transform active:scale-90",
          todo.done
            ? "border-accent bg-accent text-accent-foreground animate-pop"
            : "border-border bg-transparent",
        )}
      >
        {todo.done && <Check className="size-4" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[15px] font-semibold",
            todo.done && "line-through text-muted-foreground",
          )}
        >
          {todo.title}
        </p>
      </div>
      {todo.time && (
        <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {todo.time}
        </span>
      )}
      <button
        onClick={onDelete}
        aria-label="Delete"
        className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-destructive active:scale-90 transition"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function TodosEmpty() {
  return (
    <div className="animate-entry flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-accent-soft">
        <ListTodo className="size-8 text-accent" strokeWidth={2} />
      </div>
      <div>
        <h2 className="font-display text-lg font-bold">Clear head, done list</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Add a quick todo above. Give it a time and TinyHabit will nudge you.
        </p>
      </div>
    </div>
  );
}
