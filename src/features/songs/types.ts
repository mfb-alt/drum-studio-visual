/** Domain models for the song library and future MIDI playback. */

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: Difficulty;
  /** Duration in seconds. */
  durationSec: number;
  bpm: number;
  /** Future: path/URL of the MIDI file that drives playback. */
  midiUrl?: string;
}

/** Playback speed multipliers exposed in the transport bar. */
export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "ended";

/** Transport state for the (future) MIDI player. */
export interface PlaybackState {
  status: PlaybackStatus;
  /** Current position in seconds. */
  positionSec: number;
  durationSec: number;
  speed: PlaybackSpeed;
  loop: boolean;
}

export const INITIAL_PLAYBACK_STATE: PlaybackState = {
  status: "idle",
  positionSec: 0,
  durationSec: 0,
  speed: 1,
  loop: false,
};

/** A practice run of a single song. */
export interface PracticeSession {
  id: string;
  songId: string;
  startedAt: string;
  endedAt?: string;
  playback: PlaybackState;
  /** Future: accuracy metrics per pad. */
  score?: {
    hits: number;
    misses: number;
    accuracy: number;
  };
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
