import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { DrumKit } from "@/features/kit/DrumKit";
import { MidiImportButton } from "@/features/midi/MidiImportButton";
import { withManualDrumTrack } from "@/features/midi/midiParser";
import type { ParsedMidi } from "@/features/midi/types";
import { TransportBar } from "@/features/playback/TransportBar";
import { PlaybackStatusBar } from "@/features/playback/PlaybackStatusBar";
import { MidiDebugPanel } from "@/features/playback/MidiDebugPanel";
import { usePlaybackEngine } from "@/features/playback/usePlaybackEngine";
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
  const [midi, setMidi] = useState<ParsedMidi | null>(null);
  const playback = usePlaybackEngine();

  const applyMidi = (parsed: ParsedMidi) => {
    setMidi(parsed);
    playback.load(parsed);
  };

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

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-4">
          <MidiImportButton onLoaded={applyMidi} />
          {midi ? (
            <p className="text-xs text-muted-foreground" role="status">
              Archivo cargado · Duración {formatDuration(midi.durationSec)} · {midi.bpm} BPM ·{" "}
              {midi.tracks.length} pistas · {midi.drumEvents.length} eventos de batería ·{" "}
              {midi.drumChannel !== null ? `canal de batería ${midi.drumChannel + 1}` : "sin canal de batería"}
            </p>
          ) : null}
        </div>

        {midi ? (
          <p className="text-[11px] text-muted-foreground">
            Pistas detectadas:{" "}
            {midi.tracks
              .map((track) => `${track.name} (canal ${track.channel + 1}, ${track.noteCount} notas)`)
              .join(" · ")}
          </p>
        ) : null}

        {midi && !midi.drumTrackDetected ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              No se ha detectado automáticamente una pista de batería
            </p>
            <label className="text-xs text-muted-foreground" htmlFor="drum-track">
              Elegir pista:
            </label>
            <select
              id="drum-track"
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              value={midi.drumTrackIndices[0] ?? ""}
              onChange={(event) => {
                const index = Number(event.target.value);
                if (Number.isNaN(index)) return;
                applyMidi(withManualDrumTrack(midi, index));
              }}
            >
              <option value="">Selecciona una pista</option>
              {midi.tracks.map((track) => (
                <option key={track.index} value={track.index}>
                  {track.name} · canal {track.channel + 1} · {track.noteCount} notas
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <DrumKit litPads={playback.litPads} />

      <PlaybackStatusBar
        positionSec={playback.positionSec}
        durationSec={playback.durationSec}
        bpm={playback.bpm}
        speed={playback.speed}
        eventIndex={playback.eventIndex}
        totalEvents={playback.totalEvents}
      />

      <TransportBar
        disabled={!midi}
        speed={playback.speed}
        canGoToStart={playback.canGoToStart}
        canGoToEnd={playback.canGoToEnd}
        canStepBack={playback.canStepBack}
        canStepForward={playback.canStepForward}
        onPlay={playback.play}
        onPause={playback.pause}
        onGoToStart={playback.goToStart}
        onGoToEnd={playback.goToEnd}
        onPreviousBar={playback.previousBar}
        onNextBar={playback.nextBar}
        onSpeedChange={playback.setSpeed}
      />

      <MidiDebugPanel hits={playback.recentHits} litPads={playback.litPads} />
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
