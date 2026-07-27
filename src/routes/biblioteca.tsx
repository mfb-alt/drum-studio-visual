import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Drum Studio" },
      { name: "description", content: "Tus canciones guardadas en Drum Studio." },
      { property: "og:title", content: "Biblioteca — Drum Studio" },
      { property: "og:description", content: "Tus canciones guardadas en Drum Studio." },
    ],
  }),
  component: () => (
    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Biblioteca</h1>
  ),
});