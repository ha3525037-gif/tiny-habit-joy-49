export type Habit = {
  id: string;
  name: string;
  emoji: string;
  createdAt: string; // ISO date
};

export type HabitState = {
  habits: Habit[];
  // completions: habitId -> array of ISO date strings (YYYY-MM-DD)
  completions: Record<string, string[]>;
};

export const HABITS_KEY = "tinyhabit:v1";
export const THEME_KEY = "tinyhabit:theme";
export const MAX_HABITS = 5;

export const EMPTY_STATE: HabitState = { habits: [], completions: {} };

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function loadState(): HabitState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(HABITS_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as HabitState;
    return {
      habits: parsed.habits ?? [],
      completions: parsed.completions ?? {},
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: HabitState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HABITS_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("tinyhabit:changed"));
}

export function computeStreak(dates: string[], reference = new Date()): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date(reference);
  // If today isn't complete, streak may still exist ending yesterday.
  if (!set.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
