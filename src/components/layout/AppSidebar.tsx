import { Link } from "@tanstack/react-router";
import { Home, Library, Music4, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/biblioteca", label: "Biblioteca", icon: Library },
  { to: "/practicar", label: "Practicar", icon: Music4 },
  { to: "/configuracion", label: "Configuración", icon: Settings },
] as const;

export function AppSidebar() {
  return (
    <aside className="flex shrink-0 flex-col gap-8 border-b border-border bg-sidebar px-4 py-5 md:h-screen md:w-60 md:border-b-0 md:border-r md:py-8">
      <div className="flex items-center gap-3">
        <span className="h-8 w-8 rounded-full border-2 border-accent bg-accent/15" />
        <span className="text-sm font-semibold uppercase tracking-[0.28em] text-sidebar-foreground">
          Drum
        </span>
      </div>

      <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
            activeProps={{ className: "bg-accent/15 text-accent" }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}