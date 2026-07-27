import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración — Drum Studio" },
      { name: "description", content: "Ajustes del kit y del sonido en Drum Studio." },
      { property: "og:title", content: "Configuración — Drum Studio" },
      { property: "og:description", content: "Ajustes del kit y del sonido en Drum Studio." },
    ],
  }),
  component: () => (
    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configuración</h1>
  ),
});