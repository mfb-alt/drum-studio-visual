import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { DrumKit } from "@/features/kit/DrumKit";
import { TransportBar } from "@/features/playback/TransportBar";
import { DifficultyBadge } from "@/features/songs/components/DifficultyBadge";
import { getSongById } from "@/features/songs/songsData";
import { formatDuration } from "@/features/songs/types";

export const Route = createFileRoute("/practicar/$songId")({
  loader: ({ params }) => {
    const song = getSongById(params.songId);
    if (!song) throw notFound();
    return { song };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Canción no encontrada — Drum Studio" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { song } = loaderData;
    const title = `${song.title} — Practicar en Drum Studio`;
    const description = `Practica "${song.title}" de ${song.artist} sobre el kit Roland TD-1KV.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "music.song" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: SongNotFound,
  component: PracticeSessionPage,
});

function PracticeSessionPage() {
  const { song } = Route.useLoaderData();

  return (
    <div className="space-y-4">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {song.title}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          <DifficultyBadge difficulty={song.difficulty} />
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatDuration(song.durationSec)}
          </span>
        </div>
      </header>

      <DrumKit />

      <TransportBar />
    </div>
  );
}

function SongNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Canción no encontrada</h1>
      <Link to="/biblioteca" className="inline-flex items-center gap-2 text-sm text-accent">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a la biblioteca
      </Link>
    </div>
  );
}
