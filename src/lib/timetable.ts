import { uid } from "./habits";

export type TimeBlock = {
  id: string;
  title: string;
  emoji: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  createdAt: string;
};

export const TIMETABLE_KEY = "tinyhabit:timetable:v1";
export const TIMETABLE_EVENT = "tinyhabit:timetable-changed";

export function loadTimetable(): TimeBlock[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TIMETABLE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TimeBlock[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTimetable(blocks: TimeBlock[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIMETABLE_KEY, JSON.stringify(blocks));
  window.dispatchEvent(new CustomEvent(TIMETABLE_EVENT));
}

export function newBlock(
  title: string,
  emoji: string,
  startTime: string,
  endTime: string,
): TimeBlock {
  return {
    id: uid(),
    title: title.trim() || "Untitled",
    emoji: emoji || "🗓️",
    startTime,
    endTime,
    createdAt: new Date().toISOString(),
  };
}

export function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function nowMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatTime(hhmm: string): string {
  return hhmm;
}

export function sortByStart(blocks: TimeBlock[]): TimeBlock[] {
  return [...blocks].sort(
    (a, b) => minutesOfDay(a.startTime) - minutesOfDay(b.startTime),
  );
}
