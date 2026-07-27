import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/practicar")({
  head: () => ({
    meta: [
      { title: "Practicar — Drum Studio" },
      { name: "description", content: "Modo de práctica de canciones en Drum Studio." },
      { property: "og:title", content: "Practicar — Drum Studio" },
      { property: "og:description", content: "Modo de práctica de canciones en Drum Studio." },
    ],
  }),
  component: () => (
    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Practicar</h1>
  ),
});