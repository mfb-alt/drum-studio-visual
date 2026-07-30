import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { DrumKit } from "@/features/kit/DrumKit";
import { PlaybackStatusBar } from "@/features/playback/PlaybackStatusBar";
import { MidiDebugPanel } from "@/features/playback/MidiDebugPanel";
import { PracticeControlDock } from "@/features/playback/PracticeControlDock";
import { TrackControlsSheet } from "@/features/playback/TrackControlsSheet";
import { useSongPlayer } from "@/features/playback/useSongPlayer";
import { DifficultyBadge } from "@/features/songs/components/DifficultyBadge";
import { SongImportButton } from "@/features/songs/SongImportButton";
import type { ImportedSong } from "@/features/songs/importedSong";
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
  const [importedSong, setImportedSong] = useState<ImportedSong | null>(null);
  const playback = useSongPlayer();

  const applySong = (nextSong: ImportedSong) => {
    setImportedSong(nextSong);
    playback.load(nextSong);
  };

  const loaded = importedSong !== null;
  const displayTitle = importedSong?.title || song.title;
  const displayArtist = importedSong?.artist || song.artist;
  const displayDuration = playback.durationSec || importedSong?.durationSec || song.durationSec;

  return (
    <div className="space-y-2.5 pb-20">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {displayTitle}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{displayArtist}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          <DifficultyBadge difficulty={song.difficulty} />
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatDuration(displayDuration)}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <SongImportButton onLoaded={applySong} />
        {loaded ? (
          <TrackControlsSheet
            tracks={playback.tracks}
            onMute={playback.muteTrack}
            onUnmute={playback.unmuteTrack}
            onSolo={playback.soloTrack}
          />
        ) : null}
        {importedSong ? (
          <p className="text-xs text-muted-foreground" role="status">
            {importedSong.fileName} · {importedSong.format} · Duración{" "}
            {formatDuration(displayDuration)} · {playback.bpm || importedSong.bpm} BPM ·{" "}
            {importedSong.tracks.length} pistas ·{" "}
            {importedSong.drumTrackIds.length
              ? `${importedSong.drumTrackIds.length} pista(s) de batería`
              : "batería no detectada"}
          </p>
        ) : null}
      </div>

      <div className="relative">
        <div
          ref={playback.rendererRef}
          className="pointer-events-none absolute h-px w-[1200px] overflow-hidden opacity-0"
          aria-hidden="true"
        />
        <DrumKit litPads={playback.litPads} />
        {playback.countIn ? (
          <div
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-background/45 backdrop-blur-[1px]"
            role="status"
            aria-live="assertive"
            aria-label={`Cuenta atrás: compás ${playback.countIn.bar}, tiempo ${playback.countIn.beat}`}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-accent/60 bg-card/90 font-mono text-6xl font-semibold tabular-nums text-accent shadow-xl">
              {playback.countIn.beat}
            </div>
          </div>
        ) : null}
      </div>

      <PlaybackStatusBar
        positionSec={playback.positionSec}
        durationSec={playback.durationSec}
        bpm={playback.bpm}
        speed={playback.speed}
        eventIndex={playback.eventIndex}
        totalEvents={playback.totalEvents}
        loop={playback.loop}
        disabled={!loaded}
        onSeek={playback.seek}
        musicalPositionAt={playback.musicalPositionAt}
        onLoopRange={(range, committed) =>
          playback.setLoopRange({
            startTime: range.startTime,
            endTime: range.endTime,
            snap: committed && playback.snapToBars,
          })
        }
      />

      <PracticeControlDock disabled={!loaded} player={playback} />

      <MidiDebugPanel hits={playback.recentHits} litPads={playback.litPads} />
    </div>
  );
}

function SongNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Canción no encontrada
      </h1>
      <Link to="/biblioteca" className="inline-flex items-center gap-2 text-sm text-accent">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a la biblioteca
      </Link>
    </div>
  );
}
