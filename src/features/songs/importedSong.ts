import type * as AlphaTab from "@coderline/alphatab";
import type { ParsedMidi } from "@/features/midi/types";

export type ImportedSongFormat = "MIDI" | "GP3" | "GP4" | "GP5" | "GPX" | "GP" | "MusicXML" | "MXL";

export interface ImportedSongTrack {
  id: number;
  name: string;
  instrument: string;
  program: number;
  primaryChannel: number;
  secondaryChannel: number;
  isDrum: boolean;
}

type ImportedSongPayload =
  { engine: "midi"; midi: ParsedMidi } | { engine: "alphatab"; score: AlphaTab.model.Score };

/**
 * Format-neutral song document consumed by the practice screen.
 * Only playback adapters inspect the opaque payload.
 */
export interface ImportedSong {
  fileName: string;
  title: string;
  artist: string;
  format: ImportedSongFormat;
  durationSec: number;
  bpm: number;
  measureCount: number;
  tracks: ImportedSongTrack[];
  drumTrackIds: number[];
  payload: ImportedSongPayload;
}

export function isMidiPayload(
  payload: ImportedSongPayload,
): payload is Extract<ImportedSongPayload, { engine: "midi" }> {
  return payload.engine === "midi";
}
