import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { midiParser } from "@/features/midi/midiParser";
import { createAlphaTabSettings } from "@/features/playback/alphaTabSettings";
import { describeProgram, isPercussionTrack } from "./scoreTrackDiagnostics";
import type { ImportedSong, ImportedSongFormat } from "./importedSong";

const ACCEPTED_EXTENSIONS = /\.(mid|midi|gp3|gp4|gp5|gpx|gp|musicxml|xml|mxl)$/i;
const MUSIC_XML_EXTENSIONS = new Set(["musicxml", "xml", "mxl"]);

interface SongImportButtonProps {
  onLoaded: (song: ImportedSong) => void;
}

function extensionOf(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function formatOf(extension: string): ImportedSongFormat {
  if (extension === "mid" || extension === "midi") return "MIDI";
  if (extension === "musicxml" || extension === "xml") return "MusicXML";
  return extension.toUpperCase() as ImportedSongFormat;
}

export function SongImportButton({ onLoaded }: SongImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFile = async (file: File) => {
    const extension = extensionOf(file.name);
    if (!ACCEPTED_EXTENSIONS.test(file.name)) {
      setError("Formato no válido. Importa MIDI, Guitar Pro o MusicXML.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (extension === "mid" || extension === "midi") {
        const midi = await midiParser.parseFile(file);
        onLoaded({
          fileName: file.name,
          title: file.name.replace(/\.[^.]+$/, ""),
          artist: "",
          format: "MIDI",
          durationSec: midi.durationSec,
          bpm: midi.bpm,
          measureCount: midi.measures,
          tracks: midi.tracks.map((track) => ({
            id: track.index,
            name: track.name,
            instrument: `Canal MIDI ${track.channel + 1}`,
            program: 0,
            primaryChannel: track.channel,
            secondaryChannel: track.channel,
            isDrum: track.isDrumTrack,
          })),
          drumTrackIds: midi.drumTrackIndices,
          payload: { engine: "midi", midi },
        });
        return;
      }

      const alphaTab = await import("@coderline/alphatab");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
        bytes,
        createAlphaTabSettings(alphaTab),
      );
      const drumTracks = score.tracks.filter(isPercussionTrack);
      onLoaded({
        fileName: file.name,
        title: score.title || file.name.replace(/\.[^.]+$/, ""),
        artist: score.artist || "",
        format: formatOf(extension),
        durationSec: 0,
        bpm: score.tempo,
        measureCount: score.masterBars.length,
        tracks: score.tracks.map((track) => ({
          id: track.index,
          name: track.name || track.shortName || `Pista ${track.index + 1}`,
          instrument: describeProgram(track.playbackInfo.program),
          program: track.playbackInfo.program,
          primaryChannel: track.playbackInfo.primaryChannel,
          secondaryChannel: track.playbackInfo.secondaryChannel,
          isDrum: drumTracks.includes(track),
        })),
        drumTrackIds: drumTracks.map((track) => track.index),
        payload: { engine: "alphatab", score },
      });
    } catch {
      setError(
        extension === "xml"
          ? "El archivo XML no contiene una partitura MusicXML compatible."
          : MUSIC_XML_EXTENSIONS.has(extension)
            ? "No se pudo leer la partitura MusicXML."
            : extension.startsWith("gp")
              ? "No se pudo leer el archivo Guitar Pro."
              : "No se pudo leer el archivo MIDI.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".mid,.midi,.gp3,.gp4,.gp5,.gpx,.gp,.musicxml,.xml,.mxl"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void loadFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" aria-hidden />
        {loading ? "Importando…" : "Importar canción"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
