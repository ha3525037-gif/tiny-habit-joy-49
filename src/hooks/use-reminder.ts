import { useCallback, useEffect, useState } from "react";
import { todayKey, computeStreak } from "@/lib/habits";
import { minutesOfDay, nowMinutes } from "@/lib/timetable";
import { useHabits } from "./use-habits";
import { useTodos } from "./use-todos";
import { useTimetable } from "./use-timetable";

export const REMINDER_SETTINGS_KEY = "tinyhabit:reminder:v1";
export const REMINDER_LOG_KEY = "tinyhabit:reminder-log:v1";
export const REMINDER_SETTINGS_EVENT = "tinyhabit:reminder-settings-changed";

export type ReminderSettings = {
  enabled: boolean;
  time: string; // "HH:MM" daily habit reminder
};

const DEFAULT_SETTINGS: ReminderSettings = { enabled: false, time: "20:00" };

export function loadReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(REMINDER_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveReminderSettings(s: ReminderSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(REMINDER_SETTINGS_EVENT));
}

export function useReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadReminderSettings());
    const onChange = () => setSettings(loadReminderSettings());
    window.addEventListener(REMINDER_SETTINGS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(REMINDER_SETTINGS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((patch: Partial<ReminderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveReminderSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}

type NotifiedLog = { date: string; keys: string[] };

function loadLog(): NotifiedLog {
  if (typeof window === "undefined") return { date: todayKey(), keys: [] };
  try {
    const raw = window.localStorage.getItem(REMINDER_LOG_KEY);
    if (!raw) return { date: todayKey(), keys: [] };
    const parsed = JSON.parse(raw) as NotifiedLog;
    if (parsed.date !== todayKey()) return { date: todayKey(), keys: [] };
    return parsed;
  } catch {
    return { date: todayKey(), keys: [] };
  }
}

function saveLog(log: NotifiedLog) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMINDER_LOG_KEY, JSON.stringify(log));
}

export function useReminder() {
  const { settings } = useReminderSettings();
  const { state: habitState } = useHabits();
  const { state: todos } = useTodos();
  const { state: blocks } = useTimetable();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!settings.enabled) return;
    if (typeof Notification === "undefined") return;

    const check = () => {
      if (Notification.permission !== "granted") return;
      const log = loadLog();
      const already = new Set(log.keys);
      const now = new Date();
      const nowMin = nowMinutes(now);
      const messages: string[] = [];
      const newKeys: string[] = [];

      // Habits: daily reminder time reached, some undone
      const habitReminderMin = minutesOfDay(settings.time);
      const undoneHabits = habitState.habits.filter(
        (h) => !(habitState.completions[h.id] ?? []).includes(todayKey()),
      );

      // Streak-loss warnings (after 20:00) — one per habit per day
      const lateHours = now.getHours() >= 20;
      if (lateHours) {
        for (const h of undoneHabits) {
          const streak = computeStreak(habitState.completions[h.id] ?? []);
          if (streak >= 3) {
            const key = `streak:${h.id}`;
            if (!already.has(key)) {
              messages.push(
                `🔥 Don't lose your ${streak}-day ${h.name} streak — mark it done!`,
              );
              newKeys.push(key);
            }
          }
        }
      }

      // Generic habits-left reminder at configured time
      if (nowMin >= habitReminderMin && undoneHabits.length > 0) {
        const key = `habits:daily`;
        if (!already.has(key)) {
          // Exclude habits already warned via streak line above to avoid duplication
          const warnedIds = new Set(
            newKeys
              .filter((k) => k.startsWith("streak:"))
              .map((k) => k.slice("streak:".length)),
          );
          const remaining = undoneHabits.filter((h) => !warnedIds.has(h.id));
          if (remaining.length > 0) {
            messages.push(
              `${remaining.length} habit${remaining.length === 1 ? "" : "s"} left today`,
            );
          }
          newKeys.push(key);
        }
      }

      // Todos: time arrived
      for (const t of todos) {
        if (t.done || !t.time) continue;
        const tMin = minutesOfDay(t.time);
        if (nowMin >= tMin && nowMin - tMin < 60) {
          const key = `todo:${t.id}`;
          if (!already.has(key)) {
            messages.push(`📞 ${t.title} is due`);
            newKeys.push(key);
          }
        }
      }

      // Timetable: blocks starting within next 10 min
      for (const b of blocks) {
        const sMin = minutesOfDay(b.startTime);
        const diff = sMin - nowMin;
        if (diff >= 0 && diff <= 10) {
          const key = `block:${b.id}`;
          if (!already.has(key)) {
            const label =
              diff <= 0 ? "now" : `in ${diff} min`;
            messages.push(`${b.emoji} ${b.title} ${label}`);
            newKeys.push(key);
          }
        }
      }

      if (messages.length === 0) return;

      const body = messages.join(" · ");
      try {
        new Notification("TinyHabit", { body });
      } catch {
        // ignore
      }
      saveLog({ date: todayKey(), keys: [...log.keys, ...newKeys] });
    };

    check();
    const id = window.setInterval(check, 45_000);
    return () => window.clearInterval(id);
  }, [settings.enabled, settings.time, habitState, todos, blocks]);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}
