import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <AppSidebar />
      <main className="flex-1 px-5 py-8 md:px-10 md:py-12">{children}</main>
    </div>
  );
}