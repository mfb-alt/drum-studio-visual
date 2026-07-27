import { createFileRoute } from "@tanstack/react-router";
import { SONGS } from "@/features/songs/songsData";
import { SongGrid } from "@/features/songs/components/SongGrid";

export const Route = createFileRoute("/practicar/")({
  head: () => ({
    meta: [
      { title: "Practicar — Drum Studio" },
      {
        name: "description",
        content: "Elige una canción y practícala sobre el kit Roland TD-1KV de Drum Studio.",
      },
      { property: "og:title", content: "Practicar — Drum Studio" },
      {
        property: "og:description",
        content: "Elige una canción y practícala sobre el kit Roland TD-1KV de Drum Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PracticePicker,
});

function PracticePicker() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Practicar</h1>
        <p className="text-sm text-muted-foreground">Selecciona una canción para abrir la sesión de práctica.</p>
      </header>
      <SongGrid songs={SONGS} />
    </div>
  );
}
