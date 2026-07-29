import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { useReminder } from "@/hooks/use-reminder";

export function AppShell({ children }: { children: ReactNode }) {
  useReminder();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="mx-auto flex min-h-screen max-w-md flex-col"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <main className="flex-1 pb-32">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
