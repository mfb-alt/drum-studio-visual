import type { PadId } from "@/features/kit/types";

/** A single drum note, already normalised and independent of the MIDI file. */
export interface DrumEvent {
  /** Absolute time from the start of the song, in seconds. */
  timeSec: number;
  /** MIDI note number as written in the file. */
  note: number;
  /** Pad it maps to, or null when the note is not part of the kit. */
  padId: PadId | null;
  /** 0..1 strike strength. */
  velocity: number;
  /** Track index the note came from. */
  track: number;
}

export interface MidiTempo {
  timeSec: number;
  bpm: number;
}

export interface MidiTimeSignature {
  timeSec: number;
  numerator: number;
  denominator: number;
}

export interface MidiTrackSummary {
  index: number;
  name: string;
  channel: number;
  noteCount: number;
  isDrumTrack: boolean;
}

/** Clean structure returned by the parser — no library types leak out. */
export interface ParsedMidi {
  fileName: string;
  durationSec: number;
  /** Tempo of the first tempo event, rounded. */
  bpm: number;
  tempos: MidiTempo[];
  timeSignatures: MidiTimeSignature[];
  /** Number of measures, estimated from tempo + time signature. */
  measures: number;
  tracks: MidiTrackSummary[];
  /** Every note event of the file, sorted by time. */
  events: DrumEvent[];
  /** Events that map to a pad of the kit, sorted by time. */
  drumEvents: DrumEvent[];
}