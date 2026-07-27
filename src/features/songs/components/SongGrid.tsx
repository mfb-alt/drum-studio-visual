import type { Song } from "../types";
import { SongCard } from "./SongCard";

export function SongGrid({ songs }: { songs: Song[] }) {
  if (songs.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Todavía no hay canciones en tu biblioteca.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
