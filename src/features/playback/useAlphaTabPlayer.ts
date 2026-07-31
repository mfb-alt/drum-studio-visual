import { useCallback, useEffect, useRef, useState } from "react";
import type * as AlphaTab from "@coderline/alphatab";
import type { PadId } from "@/features/kit/types";
import { defaultDrumMapper } from "@/features/midi/drumMapper";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";
import type { ImportedSong } from "@/features/songs/importedSong";
import { isPercussionTrack, resolveEventTrack } from "@/features/songs/scoreTrackDiagnostics";
import type { CountInBars, LoopState, MusicalPosition } from "./PlaybackEngine";
import { createAlphaTabSettings } from "./alphaTabSettings";
import { createDefaultPracticeOptions, type PracticeOptions } from "./practiceOptions";
import type { PlayerTrackState } from "./SongPlayer";

const HIGHLIGHT_MS = 220;

export function useAlphaTabPlayer() {
  const rendererRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<AlphaTab.AlphaTabApi | null>(null);
  const alphaTabRef = useRef<typeof AlphaTab | null>(null);
  const songRef = useRef<ImportedSong | null>(null);
  const pendingSongRef = useRef<ImportedSong | null>(null);
  const playWhenReadyRef = useRef(false);
  const readyRef = useRef(false);
  const scoreRef = useRef<AlphaTab.model.Score | null>(null);
  const loopRef = useRef<LoopState>({
    enabled: false,
    startMeasure: 1,
    endMeasure: 1,
    startTime: 0,
    endTime: 0,
  });
  const practiceRef = useRef<PracticeOptions>(createDefaultPracticeOptions());
  const mutedTrackIdsRef = useRef(new Set<number>());
  const soloTrackIdsRef = useRef(new Set<number>());
  const padTimers = useRef(new Map<PadId, ReturnType<typeof setTimeout>>());

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [speed, setSpeedState] = useState<PlaybackSpeed>(1);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [bpm, setBpm] = useState(0);
  const [barCount, setBarCount] = useState(1);
  const [litPads, setLitPads] = useState<PadId[]>([]);
  const [loop, setLoopState] = useState(loopRef.current);
  const [countInBars, setCountInBarsState] = useState<CountInBars>(1);
  const [practiceOptions, setPracticeOptionsState] = useState(practiceRef.current);
  const [tracks, setTracks] = useState<PlayerTrackState[]>([]);
  const [eventIndex, setEventIndex] = useState(-1);
  const [totalEvents, setTotalEvents] = useState(0);

  const refreshTracks = useCallback(() => {
    const song = songRef.current;
    if (!song) return;
    setTracks(
      song.tracks.map((track) => ({
        ...track,
        muted: mutedTrackIdsRef.current.has(track.id),
        solo: soloTrackIdsRef.current.has(track.id),
      })),
    );
  }, []);

  const applyTrackMix = useCallback(() => {
    const api = apiRef.current;
    const score = scoreRef.current;
    if (!api || !score) return;
    const options = practiceRef.current;
    const hasSolo = soloTrackIdsRef.current.size > 0;

    for (const track of score.tracks) {
      const drum = isPercussionTrack(track);
      const practiceMuted = drum ? !options.drums : !options.song;
      const soloMuted = hasSolo && !soloTrackIdsRef.current.has(track.index);
      api.changeTrackMute(
        [track],
        mutedTrackIdsRef.current.has(track.index) || practiceMuted || soloMuted,
      );
    }
    api.metronomeVolume = options.metronome ? 1 : 0;
    refreshTracks();
  }, [refreshTracks]);

  const highlight = useCallback((padId: PadId) => {
    setLitPads((current) => (current.includes(padId) ? current : [...current, padId]));
    const previous = padTimers.current.get(padId);
    if (previous) clearTimeout(previous);
    padTimers.current.set(
      padId,
      setTimeout(() => {
        padTimers.current.delete(padId);
        setLitPads((current) => current.filter((candidate) => candidate !== padId));
      }, HIGHLIGHT_MS),
    );
  }, []);

  const renderSong = useCallback(
    (song: ImportedSong) => {
      if (song.payload.engine !== "alphatab") return;
      songRef.current = song;
      const api = apiRef.current;
      if (!api) {
        pendingSongRef.current = song;
        setReady(false);
        setStatus("loading");
        return;
      }
      pendingSongRef.current = null;
      playWhenReadyRef.current = false;
      readyRef.current = false;
      setReady(false);
      api.stop();
      scoreRef.current = song.payload.score;
      mutedTrackIdsRef.current = new Set();
      soloTrackIdsRef.current = new Set();
      const defaults = createDefaultPracticeOptions();
      practiceRef.current = defaults;
      setPracticeOptionsState(defaults);
      setStatus("loading");
      setPositionSec(0);
      setDurationSec(0);
      setBpm(song.bpm);
      setBarCount(Math.max(1, song.measureCount));
      setLitPads([]);
      setEventIndex(-1);
      setTotalEvents(0);
      const initialLoop: LoopState = {
        enabled: false,
        startMeasure: 1,
        endMeasure: Math.min(2, Math.max(1, song.measureCount)),
        startTime: 0,
        endTime: 0,
        barAligned: true,
      };
      loopRef.current = initialLoop;
      setLoopState(initialLoop);
      refreshTracks();
      api.renderScore(
        song.payload.score,
        song.payload.score.tracks.map((track) => track.index),
      );
    },
    [refreshTracks],
  );

  useEffect(() => {
    const container = rendererRef.current;
    if (!container) return;
    let cancelled = false;
    let api: AlphaTab.AlphaTabApi | null = null;
    const activePadTimers = padTimers.current;

    void import("@coderline/alphatab").then((alphaTab) => {
      if (cancelled) return;
      alphaTabRef.current = alphaTab;
      api = new alphaTab.AlphaTabApi(container, createAlphaTabSettings(alphaTab));
      apiRef.current = api;
      api.midiEventsPlayedFilter = [alphaTab.midi.MidiEventType.NoteOn];

      api.playerReady.on(() => {
        if (cancelled) return;
        readyRef.current = true;
        setReady(true);
        setStatus("idle");
        applyTrackMix();
        if (playWhenReadyRef.current) {
          playWhenReadyRef.current = false;
          api?.play();
        }
      });
      api.playerStateChanged.on(({ state }) => {
        if (!cancelled) {
          if (state === alphaTab.synth.PlayerState.Playing) {
            playWhenReadyRef.current = false;
          }
          setStatus(state === alphaTab.synth.PlayerState.Playing ? "playing" : "paused");
        }
      });
      api.playerPositionChanged.on(({ currentTime, endTime, originalTempo }) => {
        if (cancelled) return;
        setPositionSec(currentTime / 1000);
        setDurationSec(endTime / 1000);
        if (originalTempo > 0) setBpm(Math.round(originalTempo));
      });
      api.midiLoad.on((midiFile) => {
        if (cancelled) return;
        const score = scoreRef.current;
        if (score) {
          const noteCount = midiFile.events.filter(
            (event) => event.type === alphaTab.midi.MidiEventType.NoteOn,
          ).length;
          setTotalEvents(noteCount);
        }
      });
      api.midiLoaded.on(({ endTime }) => {
        if (cancelled) return;
        const nextDuration = endTime / 1000;
        setDurationSec(nextDuration);
        setStatus("idle");
        const currentLoop = loopRef.current;
        const completedLoop = {
          ...currentLoop,
          endTime: currentLoop.endTime || nextDuration,
        };
        loopRef.current = completedLoop;
        setLoopState(completedLoop);
        applyTrackMix();
      });
      api.playerFinished.on(() => {
        if (cancelled) return;
        const currentLoop = loopRef.current;
        if (currentLoop.enabled) {
          api!.timePosition = currentLoop.startTime * 1000;
          api!.play();
        } else {
          setStatus("ended");
        }
      });
      api.midiEventsPlayed.on(({ events }) => {
        const score = scoreRef.current;
        if (cancelled || !score) return;
        for (const midiEvent of events) {
          if (midiEvent.type !== alphaTab.midi.MidiEventType.NoteOn) continue;
          const noteEvent = midiEvent as AlphaTab.midi.NoteOnEvent;
          if (noteEvent.noteVelocity <= 0) continue;
          const track = resolveEventTrack(noteEvent, score.tracks);
          const percussionOnChannel = score.tracks.some(
            (candidate) =>
              isPercussionTrack(candidate) &&
              (candidate.playbackInfo.primaryChannel === noteEvent.channel ||
                candidate.playbackInfo.secondaryChannel === noteEvent.channel),
          );
          if ((!track || !isPercussionTrack(track)) && !percussionOnChannel) continue;
          setEventIndex((current) => current + 1);
          const padId = defaultDrumMapper.toPad(noteEvent.noteKey);
          if (padId && practiceRef.current.visualGuide) highlight(padId);
        }
      });

      const pendingSong = pendingSongRef.current;
      if (pendingSong) renderSong(pendingSong);
    });

    return () => {
      cancelled = true;
      readyRef.current = false;
      playWhenReadyRef.current = false;
      api?.destroy();
      for (const timer of activePadTimers.values()) clearTimeout(timer);
      activePadTimers.clear();
    };
  }, [applyTrackMix, highlight, renderSong]);

  const play = useCallback(() => {
    const api = apiRef.current;
    if (!api || !readyRef.current) {
      playWhenReadyRef.current = true;
      return;
    }
    if (!api.play()) playWhenReadyRef.current = true;
  }, []);

  const pause = useCallback(() => {
    playWhenReadyRef.current = false;
    apiRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    playWhenReadyRef.current = false;
    apiRef.current?.stop();
  }, []);

  const setSpeed = useCallback((value: PlaybackSpeed) => {
    if (apiRef.current) apiRef.current.playbackSpeed = value;
    setSpeedState(value);
  }, []);

  const seek = useCallback((value: number) => {
    if (apiRef.current) apiRef.current.timePosition = Math.max(0, value) * 1000;
    setPositionSec(Math.max(0, value));
  }, []);

  const timeForMeasure = useCallback(
    (measure: number) =>
      durationSec * ((Math.max(1, Math.min(measure, barCount)) - 1) / Math.max(1, barCount)),
    [barCount, durationSec],
  );

  const applyLoop = useCallback((next: LoopState) => {
    const api = apiRef.current;
    loopRef.current = next;
    setLoopState(next);
    if (!api || api.endTick <= 0 || api.endTime <= 0) return;
    api.playbackRange = next.enabled
      ? {
          startTick: Math.round((next.startTime * 1000 * api.endTick) / api.endTime),
          endTick: Math.round((next.endTime * 1000 * api.endTick) / api.endTime),
        }
      : null;
  }, []);

  const setPracticeOption = useCallback(
    (key: "song" | "drums" | "metronome" | "visualGuide", value: boolean) => {
      const next = { ...practiceRef.current, [key]: value };
      practiceRef.current = next;
      setPracticeOptionsState(next);
      if (!value && key === "visualGuide") setLitPads([]);
      applyTrackMix();
    },
    [applyTrackMix],
  );

  const setTrackMute = useCallback(
    (trackId: number, muted: boolean) => {
      if (muted) mutedTrackIdsRef.current.add(trackId);
      else mutedTrackIdsRef.current.delete(trackId);
      applyTrackMix();
    },
    [applyTrackMix],
  );

  const soloTrack = useCallback(
    (trackId: number, solo: boolean) => {
      if (solo) soloTrackIdsRef.current.add(trackId);
      else soloTrackIdsRef.current.delete(trackId);
      applyTrackMix();
    },
    [applyTrackMix],
  );

  const muteDrums = useCallback(() => {
    songRef.current?.drumTrackIds.forEach((trackId) => mutedTrackIdsRef.current.add(trackId));
    applyTrackMix();
  }, [applyTrackMix]);

  const unmuteDrums = useCallback(() => {
    songRef.current?.drumTrackIds.forEach((trackId) => mutedTrackIdsRef.current.delete(trackId));
    applyTrackMix();
  }, [applyTrackMix]);

  const musicalPositionAt = useCallback(
    (value: number): MusicalPosition => ({
      measure: Math.min(
        barCount,
        Math.floor((value / Math.max(durationSec, 0.001)) * barCount) + 1,
      ),
    }),
    [barCount, durationSec],
  );

  return {
    rendererRef,
    ready,
    status,
    speed,
    positionSec,
    durationSec,
    bpm,
    litPads,
    loop,
    barIndex: musicalPositionAt(positionSec).measure - 1,
    barCount,
    hasBarGrid: barCount > 1,
    countInBars,
    countIn: null,
    practiceOptions,
    tracks,
    eventIndex,
    totalEvents,
    canGoToStart: positionSec > 0.001,
    canGoToEnd: durationSec > 0 && positionSec < durationSec - 0.001,
    canStepBack: positionSec > 0.001,
    canStepForward: durationSec > 0 && positionSec < durationSec - 0.001,
    load: renderSong,
    play,
    pause,
    stop,
    seek,
    setSpeed,
    setLoop: (next: { enabled: boolean; startMeasure: number; endMeasure: number }) => {
      const startTime = timeForMeasure(next.startMeasure);
      const endTime =
        next.endMeasure >= barCount ? durationSec : timeForMeasure(next.endMeasure + 1);
      applyLoop({ ...next, startTime, endTime, barAligned: true });
    },
    setLoopRange: (next: {
      startTime: number;
      endTime: number;
      enabled?: boolean;
      snap?: boolean;
    }) => {
      applyLoop({
        enabled: next.enabled ?? loopRef.current.enabled,
        startTime: next.startTime,
        endTime: next.endTime,
        startMeasure: musicalPositionAt(next.startTime).measure,
        endMeasure: musicalPositionAt(Math.max(next.startTime, next.endTime - 0.001)).measure,
        barAligned: next.snap,
      });
    },
    muteTrack: (trackId: number) => setTrackMute(trackId, true),
    unmuteTrack: (trackId: number) => setTrackMute(trackId, false),
    soloTrack,
    muteDrums,
    unmuteDrums,
    getCurrentTime: () => (apiRef.current?.timePosition ?? 0) / 1000,
    musicalPositionAt,
    previousBar: () =>
      seek(timeForMeasure(Math.max(1, musicalPositionAt(positionSec).measure - 1))),
    nextBar: () =>
      seek(timeForMeasure(Math.min(barCount, musicalPositionAt(positionSec).measure + 1))),
    goToStart: () => seek(0),
    goToEnd: () => seek(durationSec),
    setCountInBars: (value: CountInBars) => {
      setCountInBarsState(value);
      if (apiRef.current) apiRef.current.countInVolume = value > 0 ? 1 : 0;
    },
    setPracticeOption,
  };
}
