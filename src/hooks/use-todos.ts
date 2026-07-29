import { useCallback, useEffect, useState } from "react";
import {
  loadTodos,
  newTodo,
  saveTodos,
  TODOS_EVENT,
  type Todo,
} from "@/lib/todos";
import { useHydrated } from "./use-habits";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const hydrated = useHydrated();

  useEffect(() => {
    setTodos(loadTodos());
    const onChange = () => setTodos(loadTodos());
    window.addEventListener(TODOS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(TODOS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const mutate = useCallback((updater: (t: Todo[]) => Todo[]) => {
    setTodos((prev) => {
      const next = updater(prev);
      saveTodos(next);
      return next;
    });
  }, []);

  const addTodo = useCallback(
    (title: string, time?: string) => {
      mutate((list) => [...list, newTodo(title, time)]);
    },
    [mutate],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      mutate((list) =>
        list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      );
    },
    [mutate],
  );

  const updateTodo = useCallback(
    (id: string, patch: Partial<Pick<Todo, "title" | "time" | "done">>) => {
      mutate((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    [mutate],
  );

  const deleteTodo = useCallback(
    (id: string) => {
      mutate((list) => list.filter((t) => t.id !== id));
    },
    [mutate],
  );

  return { state: todos, hydrated, addTodo, toggleTodo, updateTodo, deleteTodo };
}
