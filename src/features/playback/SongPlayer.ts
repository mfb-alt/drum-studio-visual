import type { PadId } from "@/features/kit/types";
import type { DrumFamily } from "@/features/midi/drumFamilies";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";
import type { ImportedSong, ImportedSongTrack } from "@/features/songs/importedSong";
import type { CountInBars, CountInPlan, LoopState, MusicalPosition } from "./PlaybackEngine";
import type { PracticeOptions } from "./practiceOptions";
import type { DebugHit } from "./usePlaybackEngine";

export interface PlayerTrackState extends ImportedSongTrack {
  muted: boolean;
  solo: boolean;
}

/** Shared transport contract implemented by the MIDI and alphaSynth adapters. */
export interface SongPlayer {
  readonly status: PlaybackStatus;
  readonly speed: PlaybackSpeed;
  readonly positionSec: number;
  readonly durationSec: number;
  readonly bpm: number;
  readonly litPads: PadId[];
  readonly loop: LoopState;
  readonly barIndex: number;
  readonly barCount: number;
  readonly hasBarGrid: boolean;
  readonly countInBars: CountInBars;
  readonly countIn: CountInPlan | null;
  readonly practiceOptions: PracticeOptions;
  readonly snapToBars: boolean;
  readonly tracks: PlayerTrackState[];
  readonly supportsDrumFamilyMute: boolean;
  readonly eventIndex: number;
  readonly totalEvents: number;
  readonly recentHits: DebugHit[];
  readonly canGoToStart: boolean;
  readonly canGoToEnd: boolean;
  readonly canStepBack: boolean;
  readonly canStepForward: boolean;

  load(song: ImportedSong): void;
  play(): void;
  pause(): void;
  stop(): void;
  seek(positionSec: number): void;
  setSpeed(speed: PlaybackSpeed): void;
  setLoop(next: { enabled: boolean; startMeasure: number; endMeasure: number }): void;
  setLoopRange(next: {
    startTime: number;
    endTime: number;
    enabled?: boolean;
    snap?: boolean;
  }): void;
  muteTrack(trackId: number): void;
  unmuteTrack(trackId: number): void;
  soloTrack(trackId: number, solo: boolean): void;
  muteDrums(): void;
  unmuteDrums(): void;
  getCurrentTime(): number;
  musicalPositionAt(positionSec: number): MusicalPosition;
  previousBar(): void;
  nextBar(): void;
  goToStart(): void;
  goToEnd(): void;
  setCountInBars(value: CountInBars): void;
  setSnapToBars(value: boolean): void;
  setPracticeOption(key: "song" | "drums" | "metronome" | "visualGuide", value: boolean): void;
  toggleMutedFamily(family: DrumFamily): void;
  restoreAllPieces(): void;
  muteAllPieces(): void;
}
