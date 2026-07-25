import { useEffect, useState } from "react";
import { THEME_KEY } from "@/lib/habits";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
    applyTheme(initial);
    setTheme(initial);
  }, []);

  const update = (next: Theme) => {
    applyTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  return { theme, setTheme: update, toggle: () => update(theme === "dark" ? "light" : "dark") };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}
