import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <AppSidebar />
      <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
    </div>
  );
}