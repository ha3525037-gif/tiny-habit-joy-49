import { useCallback, useEffect, useState } from "react";
import {
  loadTimetable,
  newBlock,
  saveTimetable,
  TIMETABLE_EVENT,
  type TimeBlock,
} from "@/lib/timetable";
import { useHydrated } from "./use-habits";

export function useTimetable() {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const hydrated = useHydrated();

  useEffect(() => {
    setBlocks(loadTimetable());
    const onChange = () => setBlocks(loadTimetable());
    window.addEventListener(TIMETABLE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(TIMETABLE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const mutate = useCallback((updater: (b: TimeBlock[]) => TimeBlock[]) => {
    setBlocks((prev) => {
      const next = updater(prev);
      saveTimetable(next);
      return next;
    });
  }, []);

  const addBlock = useCallback(
    (title: string, emoji: string, startTime: string, endTime: string) => {
      mutate((list) => [...list, newBlock(title, emoji, startTime, endTime)]);
    },
    [mutate],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<Omit<TimeBlock, "id" | "createdAt">>) => {
      mutate((list) =>
        list.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      );
    },
    [mutate],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      mutate((list) => list.filter((b) => b.id !== id));
    },
    [mutate],
  );

  return { state: blocks, hydrated, addBlock, updateBlock, deleteBlock };
}
