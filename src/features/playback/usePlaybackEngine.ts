import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PadId } from "@/features/kit/types";
import type { ParsedMidi } from "@/features/midi/types";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";
import { PlaybackEngine } from "./PlaybackEngine";

const HIGHLIGHT_MS = 220;

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
  const timers = useRef(new Map<PadId, ReturnType<typeof setTimeout>>());

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
      onEvent: (event) => {
        if (event.padId) highlight(event.padId);
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

  return {
    status,
    speed,
    positionSec,
    durationSec,
    litPads,
    load,
    play: useCallback(() => engine.play(), [engine]),
    pause: useCallback(() => engine.pause(), [engine]),
    stop: useCallback(() => engine.stop(), [engine]),
    seek: useCallback((value: number) => engine.seek(value), [engine]),
    setSpeed,
  };
}