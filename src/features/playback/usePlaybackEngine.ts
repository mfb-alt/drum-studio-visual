import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PadId } from "@/features/kit/types";
import { triggerDrumPad } from "@/features/kit/triggerDrumPad";
import { stopAllVoices } from "@/features/audio/audioEngine";
import type { DrumEvent, MidiTempo, ParsedMidi } from "@/features/midi/types";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";
import { PlaybackEngine, type LoopState } from "./PlaybackEngine";
import { buildBarGrid, buildBeatGrid } from "./barGrid";

const HIGHLIGHT_MS = 220;
/** How many recent hits the debug panel keeps. */
const DEBUG_LOG_SIZE = 12;

export interface DebugHit {
  id: number;
  timeSec: number;
  note: number;
  padId: PadId;
  index: number;
  channel: number;
}

/**
 * Thin React adapter over PlaybackEngine. It translates timed MIDI events
 * into `highlight(padId)` pulses; the kit only ever receives pad ids.
 */
export function usePlaybackEngine() {
  const engine = useMemo(() => new PlaybackEngine(), []);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [speed, setSpeedState] = useState<PlaybackSpeed>(1);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [litPads, setLitPads] = useState<PadId[]>([]);
  const [eventIndex, setEventIndex] = useState(-1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [tempos, setTempos] = useState<MidiTempo[]>([]);
  const [baseBpm, setBaseBpm] = useState(0);
  const [recentHits, setRecentHits] = useState<DebugHit[]>([]);
  const [barIndex, setBarIndex] = useState(0);
  const [barCount, setBarCount] = useState(1);
  const [hasBarGrid, setHasBarGrid] = useState(false);
  const [snapToBars, setSnapToBars] = useState(true);
  const [loop, setLoopState] = useState<LoopState>({
    enabled: false,
    startMeasure: 1,
    endMeasure: 1,
    startTime: 0,
    endTime: 0,
  });
  const [nav, setNav] = useState({
    canGoToStart: false,
    canGoToEnd: false,
    canStepBack: false,
    canStepForward: false,
  });
  const timers = useRef(new Map<PadId, ReturnType<typeof setTimeout>>());
  const hitId = useRef(0);

  const highlight = useCallback((padId: PadId) => {
    setLitPads((current) => (current.includes(padId) ? current : [...current, padId]));
    const existing = timers.current.get(padId);
    if (existing) clearTimeout(existing);
    timers.current.set(
      padId,
      setTimeout(() => {
        timers.current.delete(padId);
        setLitPads((current) => current.filter((id) => id !== padId));
      }, HIGHLIGHT_MS),
    );
  }, []);

  useEffect(() => {
    engine.setListeners({
      onEvent: (event: DrumEvent, index: number) => {
        setEventIndex(index);
        if (event.padId) {
          const padId = event.padId;
          triggerDrumPad(padId, event.velocity > 0 ? event.velocity : 1);
          highlight(padId);
          hitId.current += 1;
          const hit: DebugHit = {
            id: hitId.current,
            timeSec: event.timeSec,
            note: event.note,
            padId,
            index,
            channel: event.channel,
          };
          setRecentHits((current) => [hit, ...current].slice(0, DEBUG_LOG_SIZE));
        }
      },
      onTick: (tick) => {
        setPositionSec(tick.positionSec);
        setDurationSec(tick.durationSec);
        setBarIndex(tick.barIndex);
        setBarCount(tick.barCount);
        setLoopState(tick.loop);
        setNav({
          canGoToStart: tick.canGoToStart,
          canGoToEnd: tick.canGoToEnd,
          canStepBack: tick.canStepBack,
          canStepForward: tick.canStepForward,
        });
      },
      onStatusChange: setStatus,
      onLoopRestart: () => {
        // Silence the previous cycle so nothing bleeds over the restart.
        stopAllVoices();
      },
    });
    return () => engine.dispose();
  }, [engine, highlight]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const load = useCallback(
    (midi: ParsedMidi) => {
      const gridInput = {
        tempos: midi.tempos,
        timeSignatures: midi.timeSignatures,
        durationSec: midi.durationSec,
        fallbackBpm: midi.bpm,
      };
      const bars = buildBarGrid(gridInput);
      const beats = buildBeatGrid(gridInput);
      engine.load(midi.drumEvents, midi.durationSec, bars, beats);
      setHasBarGrid(engine.hasBarGrid());
      setDurationSec(midi.durationSec);
      setPositionSec(0);
      setEventIndex(-1);
      setTotalEvents(midi.drumEvents.length);
      setTempos(midi.tempos);
      setBaseBpm(midi.bpm);
      setRecentHits([]);
    },
    [engine],
  );

  const setSpeed = useCallback(
    (value: PlaybackSpeed) => {
      engine.setSpeed(value);
      setSpeedState(value);
    },
    [engine],
  );

  const setLoop = useCallback(
    (next: { enabled: boolean; startMeasure: number; endMeasure: number }) => {
      engine.setLoop(next);
      setLoopState(engine.getLoop());
    },
    [engine],
  );

  /** Time-based loop edit used by the visual selector and the mark buttons. */
  const setLoopRange = useCallback(
    (next: { startTime: number; endTime: number; enabled?: boolean; snap?: boolean }) => {
      engine.setLoopTime({
        enabled: next.enabled ?? engine.getLoop().enabled,
        startTime: next.startTime,
        endTime: next.endTime,
        snap: next.snap ?? false,
      });
      setLoopState(engine.getLoop());
    },
    [engine],
  );

  const bpm = useMemo(() => {
    if (!tempos.length) return baseBpm;
    let current = tempos[0].bpm;
    for (const tempo of tempos) {
      if (tempo.timeSec <= positionSec) current = tempo.bpm;
      else break;
    }
    return Math.round(current);
  }, [tempos, positionSec, baseBpm]);

  return {
    status,
    speed,
    positionSec,
    durationSec,
    litPads,
    bpm,
    eventIndex,
    totalEvents,
    recentHits,
    barIndex,
    barCount,
    loop,
    hasBarGrid,
    snapToBars,
    setSnapToBars,
    ...nav,
    load,
    play: useCallback(() => engine.play(), [engine]),
    pause: useCallback(() => engine.pause(), [engine]),
    stop: useCallback(() => engine.stop(), [engine]),
    seek: useCallback((value: number) => engine.seek(value), [engine]),
    goToStart: useCallback(() => engine.goToStart(), [engine]),
    goToEnd: useCallback(() => engine.goToEnd(), [engine]),
    previousBar: useCallback(() => engine.previousBar(), [engine]),
    nextBar: useCallback(() => engine.nextBar(), [engine]),
    setSpeed,
    setLoop,
    setLoopRange,
  };
}