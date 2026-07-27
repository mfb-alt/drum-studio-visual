import { Link } from "@tanstack/react-router";
import { Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_LABEL, formatDuration, type Song } from "../types";
import { DifficultyBadge } from "./DifficultyBadge";

export function SongCard({ song }: { song: Song }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-accent/40">
      <div className="min-w-0 space-y-1">
        <h2 className="truncate text-base font-semibold text-foreground">{song.title}</h2>
        <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <DifficultyBadge difficulty={song.difficulty} />
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {formatDuration(song.durationSec)}
        </span>
      </div>

      <Button asChild size="sm" className="mt-auto w-full">
        <Link to="/practicar/$songId" params={{ songId: song.id }}>
          <Play className="h-4 w-4" aria-hidden />
          Practicar
          <span className="sr-only">
            {song.title} — {DIFFICULTY_LABEL[song.difficulty]}
          </span>
        </Link>
      </Button>
    </article>
  );
}
