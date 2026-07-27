import { createFileRoute } from "@tanstack/react-router";
import { DrumKit } from "@/features/kit/DrumKit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drum Studio — Kit Roland TD-1KV interactivo" },
      {
        name: "description",
        content:
          "Practica batería electrónica con una representación visual e interactiva del kit Roland TD-1KV.",
      },
      { property: "og:title", content: "Drum Studio — Kit Roland TD-1KV interactivo" },
      {
        property: "og:description",
        content:
          "Practica batería electrónica con una representación visual e interactiva del kit Roland TD-1KV.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="space-y-4">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        Drum Studio
      </h1>
      <DrumKit />
    </div>
  );
}
