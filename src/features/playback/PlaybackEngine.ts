import type { DrumEvent } from "@/features/midi/types";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";

export interface LoopState {
  enabled: boolean;
  /** 1-based measure numbers. */
  startMeasure: number;
  endMeasure: number;
  startTime: number;
  endTime: number;
  /** True when the range sits exactly on musical bar boundaries. */
  barAligned?: boolean;
}

export interface PlaybackTick {
  positionSec: number;
  durationSec: number;
  status: PlaybackStatus;
  speed: PlaybackSpeed;
  /** Index of the bar the transport is currently inside. */
  barIndex: number;
  barCount: number;
  canGoToStart: boolean;
  canGoToEnd: boolean;
  canStepBack: boolean;
  canStepForward: boolean;
  loop: LoopState;
}

export interface PlaybackEngineListeners {
  /** Fired once per note when the transport reaches it. */
  onEvent?: (event: DrumEvent, index: number) => void;
  /** Fired on every frame with the transport position. */
  onTick?: (tick: PlaybackTick) => void;
  onStatusChange?: (status: PlaybackStatus) => void;
  /** Fired right before the transport jumps back to the loop start. */
  onLoopRestart?: () => void;
}

/**
 * Transport clock. It owns time only: it never renders, never plays audio
 * and knows nothing about React. Later it can delegate to Tone.Transport
 * by replacing `now()` and the frame loop without touching consumers.
 */
export class PlaybackEngine {
  private events: DrumEvent[] = [];
  private durationSec = 0;
  private positionSec = 0;
  private cursor = 0;
  private bars: number[] = [0];
  private beats: number[] = [0];
  private speed: PlaybackSpeed = 1;
  private status: PlaybackStatus = "idle";
  private rafId: number | null = null;
  private lastFrameMs = 0;
  private listeners: PlaybackEngineListeners = {};
  private loopState: LoopState = {
    enabled: false,
    startMeasure: 1,
    endMeasure: 1,
    startTime: 0,
    endTime: 0,
    barAligned: true,
  };

  setListeners(listeners: PlaybackEngineListeners) {
    this.listeners = listeners;
  }

  /** Loads a timeline of events; resets the transport. */
  load(events: DrumEvent[], durationSec: number, bars: number[] = [0], beats: number[] = [0]) {
    this.stop();
    this.events = [...events].sort((a, b) => a.timeSec - b.timeSec);
    this.durationSec = durationSec;
    this.bars = bars.length ? [...bars].sort((a, b) => a - b) : [0];
    this.beats = beats.length ? [...beats].sort((a, b) => a - b) : [...this.bars];
    this.loopState = { ...this.loopState, ...this.measureRangeToTime(1, Math.min(2, this.bars.length)) };
    this.setStatus(this.events.length ? "idle" : "idle");
    this.emitTick();
  }

  play() {
    if (this.status === "playing" || this.durationSec <= 0) return;
    if (this.loopState.enabled) {
      if (
        this.positionSec < this.loopState.startTime - 1e-6 ||
        this.positionSec >= this.loopState.endTime - 1e-6
      ) {
        this.seek(this.loopState.startTime);
      }
      this.setStatus("playing");
      this.lastFrameMs = this.now();
      this.loop();
      return;
    }
    if (this.status === "ended") this.seek(0);
    this.setStatus("playing");
    this.lastFrameMs = this.now();
    this.loop();
  }

  pause() {
    if (this.status !== "playing") return;
    this.cancelLoop();
    this.setStatus("paused");
    this.emitTick();
  }

  stop() {
    this.cancelLoop();
    this.positionSec = 0;
    this.cursor = 0;
    this.setStatus("idle");
    this.emitTick();
  }

  seek(positionSec: number) {
    this.positionSec = Math.max(0, Math.min(positionSec, this.durationSec));
    this.cursor = this.events.findIndex((event) => event.timeSec >= this.positionSec);
    if (this.cursor < 0) this.cursor = this.events.length;
    this.emitTick();
  }

  /** Stops playback and returns the transport to 00:00. */
  goToStart() {
    this.cancelLoop();
    this.setStatus("idle");
    this.seek(0);
  }

  /** Stops playback and parks the transport at the end of the song. */
  goToEnd() {
    if (this.durationSec <= 0) return;
    this.cancelLoop();
    this.seek(this.durationSec);
    this.setStatus("ended");
    this.emitTick();
  }

  /** Moves back exactly one bar, using the loaded bar grid. */
  previousBar() {
    const index = this.currentBarIndex();
    const start = this.bars[index] ?? 0;
    // Within the first moments of a bar, jump to the previous one.
    const target = this.positionSec - start > 0.12 ? start : (this.bars[index - 1] ?? 0);
    this.seek(target);
  }

  /** Moves forward exactly one bar, using the loaded bar grid. */
  nextBar() {
    const next = this.bars[this.currentBarIndex() + 1];
    this.seek(next ?? this.durationSec);
  }

  private currentBarIndex(): number {
    let index = 0;
    for (let i = 0; i < this.bars.length; i += 1) {
      if (this.bars[i] <= this.positionSec + 1e-6) index = i;
      else break;
    }
    return index;
  }

  /** Only the internal clock rate changes; the timeline stays untouched. */
  setSpeed(speed: PlaybackSpeed) {
    this.speed = speed;
    this.emitTick();
  }

  getSpeed() {
    return this.speed;
  }

  getLoop(): LoopState {
    return { ...this.loopState };
  }

  /**
   * Single source of truth for musical range -> transport time.
   * Measures are 1-based; the range ends at the very end of `endMeasure`.
   */
  measureRangeToTime(startMeasure: number, endMeasure: number) {
    const total = Math.max(1, this.bars.length);
    const start = Math.min(Math.max(1, Math.round(startMeasure)), total);
    const end = Math.min(Math.max(start, Math.round(endMeasure)), total);
    const startTime = this.bars[start - 1] ?? 0;
    const endTime = end >= total ? this.durationSec : (this.bars[end] ?? this.durationSec);
    return { startMeasure: start, endMeasure: end, startTime, endTime };
  }

  /**
   * Enables/updates the loop. Changing the range while playing stops playback
   * and parks the cursor at the start of the new fragment.
   */
  setLoop(next: { enabled: boolean; startMeasure: number; endMeasure: number }) {
    const range = this.measureRangeToTime(next.startMeasure, next.endMeasure);
    const previous = this.loopState;
    this.loopState = { enabled: next.enabled, ...range };

    const rangeChanged =
      previous.startMeasure !== range.startMeasure || previous.endMeasure !== range.endMeasure;

    if (next.enabled && (rangeChanged || !previous.enabled)) {
      this.cancelLoop();
      this.setStatus("idle");
      this.seek(range.startTime);
      return;
    }
    this.emitTick();
  }

  getStatus() {
    return this.status;
  }

  dispose() {
    this.cancelLoop();
    this.listeners = {};
  }

  private loop = () => {
    if (this.status !== "playing") return;
    const nowMs = this.now();
    const deltaSec = ((nowMs - this.lastFrameMs) / 1000) * this.speed;
    this.lastFrameMs = nowMs;
    this.positionSec = Math.min(this.positionSec + deltaSec, this.durationSec);

    const looping = this.loopState.enabled && this.loopState.endTime > this.loopState.startTime;
    // While looping, notes exactly at the loop end belong to the next cycle.
    const limit = looping ? Math.min(this.positionSec, this.loopState.endTime - 1e-6) : this.positionSec;

    while (this.cursor < this.events.length && this.events[this.cursor].timeSec <= limit) {
      this.listeners.onEvent?.(this.events[this.cursor], this.cursor);
      this.cursor += 1;
    }

    if (looping && this.positionSec >= this.loopState.endTime - 1e-6) {
      this.listeners.onLoopRestart?.();
      this.positionSec = this.loopState.startTime;
      this.cursor = this.events.findIndex((event) => event.timeSec >= this.positionSec - 1e-6);
      if (this.cursor < 0) this.cursor = this.events.length;
      this.emitTick();
      this.rafId = this.requestFrame(this.loop);
      return;
    }

    this.emitTick();

    if (this.positionSec >= this.durationSec) {
      this.cancelLoop();
      this.setStatus("ended");
      return;
    }
    this.rafId = this.requestFrame(this.loop);
  };

  private setStatus(status: PlaybackStatus) {
    if (this.status === status) return;
    this.status = status;
    this.listeners.onStatusChange?.(status);
  }

  private emitTick() {
    const barIndex = this.currentBarIndex();
    const atStart = this.positionSec <= 1e-3;
    const atEnd = this.durationSec > 0 && this.positionSec >= this.durationSec - 1e-3;
    this.listeners.onTick?.({
      positionSec: this.positionSec,
      durationSec: this.durationSec,
      status: this.status,
      speed: this.speed,
      barIndex,
      barCount: this.bars.length,
      canGoToStart: this.durationSec > 0 && !atStart,
      canGoToEnd: this.durationSec > 0 && !atEnd,
      canStepBack: this.durationSec > 0 && !atStart,
      canStepForward: this.durationSec > 0 && !atEnd,
      loop: { ...this.loopState },
    });
  }

  private cancelLoop() {
    if (this.rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
  }

  private requestFrame(callback: () => void): number {
    if (typeof requestAnimationFrame === "undefined") return 0;
    return requestAnimationFrame(callback);
  }

  private now(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  }
}