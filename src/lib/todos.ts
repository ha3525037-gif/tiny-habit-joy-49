import { uid } from "./habits";

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  time?: string; // "HH:MM"
};

export const TODOS_KEY = "tinyhabit:todos:v1";
export const TODOS_EVENT = "tinyhabit:todos-changed";

export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TODOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Todo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  window.dispatchEvent(new CustomEvent(TODOS_EVENT));
}

export function newTodo(title: string, time?: string): Todo {
  return {
    id: uid(),
    title: title.trim() || "Untitled",
    done: false,
    createdAt: new Date().toISOString(),
    time: time || undefined,
  };
}

export function sortTodos(todos: Todo[]): Todo[] {
  const withTime = todos.filter((t) => !t.done && t.time);
  const withoutTime = todos.filter((t) => !t.done && !t.time);
  const done = todos.filter((t) => t.done);
  withTime.sort((a, b) => (a.time! < b.time! ? -1 : a.time! > b.time! ? 1 : 0));
  return [...withTime, ...withoutTime, ...done];
}
