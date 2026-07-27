import type { DrumEvent } from "@/features/midi/types";
import type { PlaybackSpeed, PlaybackStatus } from "@/features/songs/types";

export interface PlaybackTick {
  positionSec: number;
  durationSec: number;
  status: PlaybackStatus;
  speed: PlaybackSpeed;
}

export interface PlaybackEngineListeners {
  /** Fired once per note when the transport reaches it. */
  onEvent?: (event: DrumEvent) => void;
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
  private speed: PlaybackSpeed = 1;
  private status: PlaybackStatus = "idle";
  private rafId: number | null = null;
  private lastFrameMs = 0;
  private listeners: PlaybackEngineListeners = {};

  setListeners(listeners: PlaybackEngineListeners) {
    this.listeners = listeners;
  }

  /** Loads a timeline of events; resets the transport. */
  load(events: DrumEvent[], durationSec: number) {
    this.stop();
    this.events = [...events].sort((a, b) => a.timeSec - b.timeSec);
    this.durationSec = durationSec;
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
      this.listeners.onEvent?.(this.events[this.cursor]);
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
    this.listeners.onTick?.({
      positionSec: this.positionSec,
      durationSec: this.durationSec,
      status: this.status,
      speed: this.speed,
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