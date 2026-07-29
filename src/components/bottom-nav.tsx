import { Link } from "@tanstack/react-router";
import { CalendarDays, CheckSquare, Clock, Home, Settings } from "lucide-react";

const tabs = [
  { to: "/", label: "Today", icon: Home },
  { to: "/todos", label: "Todos", icon: CheckSquare },
  { to: "/timetable", label: "Schedule", icon: Clock },
  { to: "/heatmap", label: "History", icon: CalendarDays },
  { to: "/settings", label: "Setup", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-md items-start justify-between px-4 pt-3 pb-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-1 flex-col items-center gap-1 py-1 text-muted-foreground data-[status=active]:text-accent"
          >
            <Icon className="size-5" strokeWidth={2.25} />
            <span className="font-display text-[10px] font-bold uppercase tracking-wider">
              {label}
            </span>
          </Link>
        ))}
      </div>
      <div className="pointer-events-none mx-auto mb-1 h-1 w-32 rounded-full bg-foreground/10" />
    </nav>
  );
}
