import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PadId } from "@/features/kit/types";
import { triggerDrumPad } from "@/features/kit/triggerDrumPad";
import type { DrumEvent, MidiTempo, ParsedMidi } from "@/features/midi/types";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";
import { PlaybackEngine } from "./PlaybackEngine";

const HIGHLIGHT_MS = 220;
/** How many recent hits the debug panel keeps. */
const DEBUG_LOG_SIZE = 12;

export interface DebugHit {
  id: number;
  timeSec: number;
  note: number;
  padId: PadId;
  index: number;
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
          const hit: DebugHit = { id: hitId.current, timeSec: event.timeSec, note: event.note, padId, index };
          setRecentHits((current) => [hit, ...current].slice(0, DEBUG_LOG_SIZE));
        }
      },
      onTick: (tick) => {
        setPositionSec(tick.positionSec);
        setDurationSec(tick.durationSec);
      },
      onStatusChange: setStatus,
    });
    return () => engine.dispose();
  }, [engine, highlight]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const load = useCallback(
    (midi: ParsedMidi) => {
      engine.load(midi.drumEvents, midi.durationSec);
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
    load,
    play: useCallback(() => engine.play(), [engine]),
    pause: useCallback(() => engine.pause(), [engine]),
    stop: useCallback(() => engine.stop(), [engine]),
    seek: useCallback((value: number) => engine.seek(value), [engine]),
    setSpeed,
  };
}