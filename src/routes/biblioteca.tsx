import { createFileRoute } from "@tanstack/react-router";
import { SONGS } from "@/features/songs/songsData";
import { SongGrid } from "@/features/songs/components/SongGrid";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca de canciones — Drum Studio" },
      {
        name: "description",
        content: "Explora la colección de canciones de Drum Studio y elige cuál practicar en tu kit.",
      },
      { property: "og:title", content: "Biblioteca de canciones — Drum Studio" },
      {
        property: "og:description",
        content: "Explora la colección de canciones de Drum Studio y elige cuál practicar en tu kit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Biblioteca</h1>
        <p className="text-sm text-muted-foreground">
          {SONGS.length} canciones de demostración listas para practicar.
        </p>
      </header>
      <SongGrid songs={SONGS} />
    </div>
  );
}
