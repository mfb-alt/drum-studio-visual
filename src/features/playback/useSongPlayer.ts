import { useCallback, useRef, useState, type RefObject } from "react";
import type { DrumFamily } from "@/features/midi/drumFamilies";
import { isMidiPayload, type ImportedSong } from "@/features/songs/importedSong";
import type { PlaybackSpeed } from "@/features/songs/types";
import type { CountInBars } from "./PlaybackEngine";
import type { PlayerTrackState, SongPlayer } from "./SongPlayer";
import { useAlphaTabPlayer } from "./useAlphaTabPlayer";
import { usePlaybackEngine } from "./usePlaybackEngine";

type ActiveEngine = "midi" | "alphatab" | null;

export function useSongPlayer(): SongPlayer & {
  rendererRef: RefObject<HTMLDivElement | null>;
} {
  const midi = usePlaybackEngine();
  const alpha = useAlphaTabPlayer();
  const activeEngineRef = useRef<ActiveEngine>(null);
  const [activeEngine, setActiveEngine] = useState<ActiveEngine>(null);
  const [midiTracks, setMidiTracks] = useState<PlayerTrackState[]>([]);
  const midiTrackStateRef = useRef<PlayerTrackState[]>([]);

  const active = activeEngine === "alphatab" ? alpha : midi;

  const applyMidiTrackMix = useCallback(
    (tracks: PlayerTrackState[]) => {
      midiTrackStateRef.current = tracks;
      setMidiTracks(tracks);
      const soloIds = new Set(tracks.filter((track) => track.solo).map((track) => track.id));
      const muted = tracks
        .filter((track) => track.muted || (soloIds.size > 0 && !soloIds.has(track.id)))
        .map((track) => track.id);
      midi.setMutedTrackIds(muted);
    },
    [midi],
  );

  const load = useCallback(
    (song: ImportedSong) => {
      if (isMidiPayload(song.payload)) {
        alpha.stop();
        activeEngineRef.current = "midi";
        setActiveEngine("midi");
        midi.load(song.payload.midi);
        applyMidiTrackMix(song.tracks.map((track) => ({ ...track, muted: false, solo: false })));
      } else {
        midi.stop();
        activeEngineRef.current = "alphatab";
        setActiveEngine("alphatab");
        alpha.load(song);
      }
    },
    [alpha, applyMidiTrackMix, midi],
  );

  const withMidiTrack = useCallback(
    (trackId: number, update: (track: PlayerTrackState) => PlayerTrackState) => {
      applyMidiTrackMix(
        midiTrackStateRef.current.map((track) => (track.id === trackId ? update(track) : track)),
      );
    },
    [applyMidiTrackMix],
  );

  const call = <T>(midiCall: () => T, alphaCall: () => T): T =>
    activeEngineRef.current === "alphatab" ? alphaCall() : midiCall();

  return {
    rendererRef: alpha.rendererRef,
    status: active.status,
    speed: active.speed,
    positionSec: active.positionSec,
    durationSec: active.durationSec,
    bpm: active.bpm,
    litPads: active.litPads,
    loop: active.loop,
    barIndex: active.barIndex,
    barCount: active.barCount,
    hasBarGrid: active.hasBarGrid,
    snapToBars: activeEngine === "alphatab" ? true : midi.snapToBars,
    countInBars: active.countInBars,
    countIn: active.countIn,
    practiceOptions: active.practiceOptions,
    tracks: activeEngine === "alphatab" ? alpha.tracks : midiTracks,
    supportsDrumFamilyMute: activeEngine !== "alphatab",
    eventIndex: active.eventIndex,
    totalEvents: active.totalEvents,
    recentHits: activeEngine === "alphatab" ? [] : midi.recentHits,
    canGoToStart: active.canGoToStart,
    canGoToEnd: active.canGoToEnd,
    canStepBack: active.canStepBack,
    canStepForward: active.canStepForward,
    load,
    play: () =>
      call(midi.play, () => {
        alpha.play();
      }),
    pause: () => call(midi.pause, alpha.pause),
    stop: () => call(midi.stop, alpha.stop),
    seek: (value: number) =>
      call(
        () => midi.seek(value),
        () => alpha.seek(value),
      ),
    setSpeed: (value: PlaybackSpeed) =>
      call(
        () => midi.setSpeed(value),
        () => alpha.setSpeed(value),
      ),
    setLoop: (next) =>
      call(
        () => midi.setLoop(next),
        () => alpha.setLoop(next),
      ),
    setLoopRange: (next) =>
      call(
        () => midi.setLoopRange(next),
        () => alpha.setLoopRange(next),
      ),
    muteTrack: (trackId: number) =>
      call(
        () => withMidiTrack(trackId, (track) => ({ ...track, muted: true })),
        () => alpha.muteTrack(trackId),
      ),
    unmuteTrack: (trackId: number) =>
      call(
        () => withMidiTrack(trackId, (track) => ({ ...track, muted: false })),
        () => alpha.unmuteTrack(trackId),
      ),
    soloTrack: (trackId: number, solo: boolean) =>
      call(
        () => withMidiTrack(trackId, (track) => ({ ...track, solo })),
        () => alpha.soloTrack(trackId, solo),
      ),
    muteDrums: () =>
      call(
        () =>
          applyMidiTrackMix(
            midiTrackStateRef.current.map((track) =>
              track.isDrum ? { ...track, muted: true } : track,
            ),
          ),
        alpha.muteDrums,
      ),
    unmuteDrums: () =>
      call(
        () =>
          applyMidiTrackMix(
            midiTrackStateRef.current.map((track) =>
              track.isDrum ? { ...track, muted: false } : track,
            ),
          ),
        alpha.unmuteDrums,
      ),
    getCurrentTime: () => call(() => midi.positionSec, alpha.getCurrentTime),
    musicalPositionAt: (value: number) =>
      call(
        () => midi.musicalPositionAt(value),
        () => alpha.musicalPositionAt(value),
      ),
    previousBar: () => call(midi.previousBar, alpha.previousBar),
    nextBar: () => call(midi.nextBar, alpha.nextBar),
    goToStart: () => call(midi.goToStart, alpha.goToStart),
    goToEnd: () => call(midi.goToEnd, alpha.goToEnd),
    setCountInBars: (value: CountInBars) =>
      call(
        () => midi.setCountInBars(value),
        () => alpha.setCountInBars(value),
      ),
    setSnapToBars: (value: boolean) =>
      call(
        () => midi.setSnapToBars(value),
        () => undefined,
      ),
    setPracticeOption: (key, value) =>
      call(
        () => midi.setPracticeOption(key, value),
        () => alpha.setPracticeOption(key, value),
      ),
    toggleMutedFamily: (family: DrumFamily) =>
      call(
        () => midi.toggleMutedFamily(family),
        () => undefined,
      ),
    restoreAllPieces: () => call(midi.restoreAllPieces, alpha.unmuteDrums),
    muteAllPieces: () => call(midi.muteAllPieces, alpha.muteDrums),
  };
}
