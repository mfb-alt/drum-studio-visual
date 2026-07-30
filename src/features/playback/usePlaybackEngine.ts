import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PadId } from "@/features/kit/types";
import { triggerDrumPad } from "@/features/kit/triggerDrumPad";
import { playMetronomeClick, stopAllVoices } from "@/features/audio/audioEngine";
import { DRUM_FAMILIES, type DrumFamily } from "@/features/midi/drumFamilies";
import type { DrumEvent, MidiTempo, ParsedMidi } from "@/features/midi/types";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";
import {
  PlaybackEngine,
  type CountInBars,
  type CountInPlan,
  type LoopState,
} from "./PlaybackEngine";
import { buildBarGrid, buildBeatGrid } from "./barGrid";
import { createDefaultPracticeOptions, type PracticeOptions } from "./practiceOptions";

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
  const [countInBars, setCountInBarsState] = useState<CountInBars>(1);
  const [countIn, setCountIn] = useState<CountInPlan | null>(null);
  const [practiceOptions, setPracticeOptionsState] = useState<PracticeOptions>(
    createDefaultPracticeOptions,
  );
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
  const countInTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countInGeneration = useRef(0);
  const countInBarsRef = useRef<CountInBars>(countInBars);
  const startCountInRef = useRef<(positionSec?: number) => boolean>(() => false);
  const practiceOptionsRef = useRef<PracticeOptions>(practiceOptions);
  const hitId = useRef(0);
  countInBarsRef.current = countInBars;

  const cancelCountIn = useCallback(() => {
    countInGeneration.current += 1;
    if (countInTimer.current) clearTimeout(countInTimer.current);
    countInTimer.current = null;
    setCountIn(null);
  }, []);

  const startCountIn = useCallback(
    (positionSec?: number) => {
      const bars = countInBarsRef.current;
      if (!bars) return false;
      cancelCountIn();
      const plan = engine.countInPlan(bars, positionSec);
      if (!plan.length) return false;

      const generation = countInGeneration.current;
      let deadline = performance.now();
      const runBeat = (index: number) => {
        if (generation !== countInGeneration.current) return;
        const step = plan[index];
        setCountIn(step);
        playMetronomeClick(step.beat === 1);
        deadline += step.durationMs;
        countInTimer.current = setTimeout(
          () => {
            if (generation !== countInGeneration.current) return;
            if (index + 1 < plan.length) {
              runBeat(index + 1);
              return;
            }
            countInTimer.current = null;
            setCountIn(null);
            engine.play();
          },
          Math.max(0, deadline - performance.now()),
        );
      };
      runBeat(0);
      return true;
    },
    [cancelCountIn, engine],
  );
  startCountInRef.current = startCountIn;

  const commitPracticeOptions = useCallback(
    (next: PracticeOptions) => {
      if (!next.drums) stopAllVoices();
      if (!next.visualGuide) setLitPads([]);
      practiceOptionsRef.current = next;
      engine.setPracticeOptions(next);
      setPracticeOptionsState(next);
    },
    [engine],
  );

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
      onEvent: (event: DrumEvent, index: number, playAudio: boolean) => {
        setEventIndex(index);
        if (event.padId) {
          const padId = event.padId;
          if (playAudio) {
            triggerDrumPad(padId, event.velocity > 0 ? event.velocity : 1);
          }
          if (practiceOptionsRef.current.visualGuide) highlight(padId);
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
      onBeat: (_timeSec, position) => {
        playMetronomeClick(position.beat === 1);
      },
      onLoopRestart: () => {
        // Silence the previous cycle so nothing bleeds over the restart.
        stopAllVoices();
        return startCountInRef.current(engine.getLoop().startTime) ? false : true;
      },
    });
    return () => {
      cancelCountIn();
      engine.dispose();
    };
  }, [cancelCountIn, engine, highlight]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const load = useCallback(
    (midi: ParsedMidi) => {
      cancelCountIn();
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
      const defaults = createDefaultPracticeOptions();
      practiceOptionsRef.current = defaults;
      engine.setPracticeOptions(defaults);
      setPracticeOptionsState(defaults);
    },
    [cancelCountIn, engine],
  );

  const setSpeed = useCallback(
    (value: PlaybackSpeed) => {
      cancelCountIn();
      engine.setSpeed(value);
      setSpeedState(value);
    },
    [cancelCountIn, engine],
  );

  const setLoop = useCallback(
    (next: { enabled: boolean; startMeasure: number; endMeasure: number }) => {
      cancelCountIn();
      engine.setLoop(next);
      setLoopState(engine.getLoop());
    },
    [cancelCountIn, engine],
  );

  /** Time-based loop edit used by the visual selector and the mark buttons. */
  const setLoopRange = useCallback(
    (next: { startTime: number; endTime: number; enabled?: boolean; snap?: boolean }) => {
      cancelCountIn();
      engine.setLoopTime({
        enabled: next.enabled ?? engine.getLoop().enabled,
        startTime: next.startTime,
        endTime: next.endTime,
        snap: next.snap ?? false,
      });
      setLoopState(engine.getLoop());
    },
    [cancelCountIn, engine],
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
    countInBars,
    countIn,
    practiceOptions,
    setMutedTrackIds: useCallback(
      (trackIds: Iterable<number>) => engine.setMutedTrackIds(trackIds),
      [engine],
    ),
    setPracticeOption: useCallback(
      (key: "song" | "drums" | "metronome" | "visualGuide", value: boolean) => {
        commitPracticeOptions({ ...practiceOptionsRef.current, [key]: value });
      },
      [commitPracticeOptions],
    ),
    toggleMutedFamily: useCallback(
      (family: DrumFamily) => {
        const next = new Set(practiceOptionsRef.current.mutedFamilies);
        if (next.has(family)) next.delete(family);
        else next.add(family);
        commitPracticeOptions({ ...practiceOptionsRef.current, mutedFamilies: [...next] });
      },
      [commitPracticeOptions],
    ),
    restoreAllPieces: useCallback(() => {
      commitPracticeOptions({ ...practiceOptionsRef.current, mutedFamilies: [] });
    }, [commitPracticeOptions]),
    muteAllPieces: useCallback(() => {
      commitPracticeOptions({
        ...practiceOptionsRef.current,
        mutedFamilies: DRUM_FAMILIES.map(({ id }) => id),
      });
    }, [commitPracticeOptions]),
    setCountInBars: useCallback(
      (value: CountInBars) => {
        cancelCountIn();
        countInBarsRef.current = value;
        setCountInBarsState(value);
      },
      [cancelCountIn],
    ),
    ...nav,
    load,
    play: useCallback(() => {
      if (engine.getStatus() === "playing" || countInTimer.current) return;
      const currentLoop = engine.getLoop();
      const outsideLoop =
        currentLoop.enabled &&
        (positionSec < currentLoop.startTime - 1e-6 || positionSec >= currentLoop.endTime - 1e-6);
      const target = outsideLoop
        ? currentLoop.startTime
        : engine.getStatus() === "ended"
          ? 0
          : positionSec;
      if (!startCountIn(target)) engine.play();
    }, [engine, positionSec, startCountIn]),
    pause: useCallback(() => {
      cancelCountIn();
      engine.pause();
    }, [cancelCountIn, engine]),
    stop: useCallback(() => {
      cancelCountIn();
      engine.stop();
    }, [cancelCountIn, engine]),
    seek: useCallback(
      (value: number) => {
        cancelCountIn();
        engine.seek(value);
      },
      [cancelCountIn, engine],
    ),
    musicalPositionAt: useCallback((value: number) => engine.musicalPositionAt(value), [engine]),
    goToStart: useCallback(() => {
      cancelCountIn();
      engine.goToStart();
    }, [cancelCountIn, engine]),
    goToEnd: useCallback(() => {
      cancelCountIn();
      engine.goToEnd();
    }, [cancelCountIn, engine]),
    previousBar: useCallback(() => {
      cancelCountIn();
      engine.previousBar();
    }, [cancelCountIn, engine]),
    nextBar: useCallback(() => {
      cancelCountIn();
      engine.nextBar();
    }, [cancelCountIn, engine]),
    setSpeed,
    setLoop,
    setLoopRange,
  };
}
