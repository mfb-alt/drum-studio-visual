import type { DrumEvent } from "@/features/midi/types";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";

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
}

export interface PlaybackEngineListeners {
  /** Fired once per note when the transport reaches it. */
  onEvent?: (event: DrumEvent, index: number) => void;
  /** Fired on every frame with the transport position. */
  onTick?: (tick: PlaybackTick) => void;
  onStatusChange?: (status: PlaybackStatus) => void;
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
  private speed: PlaybackSpeed = 1;
  private status: PlaybackStatus = "idle";
  private rafId: number | null = null;
  private lastFrameMs = 0;
  private listeners: PlaybackEngineListeners = {};

  setListeners(listeners: PlaybackEngineListeners) {
    this.listeners = listeners;
  }

  /** Loads a timeline of events; resets the transport. */
  load(events: DrumEvent[], durationSec: number, bars: number[] = [0]) {
    this.stop();
    this.events = [...events].sort((a, b) => a.timeSec - b.timeSec);
    this.durationSec = durationSec;
    this.bars = bars.length ? [...bars].sort((a, b) => a - b) : [0];
    this.setStatus(this.events.length ? "idle" : "idle");
    this.emitTick();
  }

  play() {
    if (this.status === "playing" || this.durationSec <= 0) return;
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

    while (this.cursor < this.events.length && this.events[this.cursor].timeSec <= this.positionSec) {
      this.listeners.onEvent?.(this.events[this.cursor], this.cursor);
      this.cursor += 1;
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