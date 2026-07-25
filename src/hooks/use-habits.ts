import { useCallback, useEffect, useState } from "react";
import {
  EMPTY_STATE,
  loadState,
  saveState,
  todayKey,
  uid,
  type Habit,
  type HabitState,
} from "@/lib/habits";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useHabits() {
  const [state, setState] = useState<HabitState>(EMPTY_STATE);
  const hydrated = useHydrated();

  useEffect(() => {
    setState(loadState());
    const onChange = () => setState(loadState());
    window.addEventListener("tinyhabit:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("tinyhabit:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const mutate = useCallback((updater: (s: HabitState) => HabitState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const addHabit = useCallback(
    (name: string, emoji: string) => {
      mutate((s) => {
        if (s.habits.length >= 5) return s;
        const habit: Habit = {
          id: uid(),
          name: name.trim() || "New Habit",
          emoji: emoji || "✨",
          createdAt: new Date().toISOString(),
        };
        return { ...s, habits: [...s.habits, habit] };
      });
    },
    [mutate],
  );

  const updateHabit = useCallback(
    (id: string, patch: Partial<Pick<Habit, "name" | "emoji">>) => {
      mutate((s) => ({
        ...s,
        habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      }));
    },
    [mutate],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      mutate((s) => {
        const { [id]: _drop, ...rest } = s.completions;
        return {
          habits: s.habits.filter((h) => h.id !== id),
          completions: rest,
        };
      });
    },
    [mutate],
  );

  const reorderHabits = useCallback(
    (fromIndex: number, toIndex: number) => {
      mutate((s) => {
        const next = [...s.habits];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return { ...s, habits: next };
      });
    },
    [mutate],
  );

  const toggleToday = useCallback(
    (id: string) => {
      const key = todayKey();
      mutate((s) => {
        const list = s.completions[id] ?? [];
        const has = list.includes(key);
        const nextList = has ? list.filter((d) => d !== key) : [...list, key];
        return { ...s, completions: { ...s.completions, [id]: nextList } };
      });
    },
    [mutate],
  );

  return {
    hydrated,
    state,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    toggleToday,
  };
}
