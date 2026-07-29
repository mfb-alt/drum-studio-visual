import { formatPreciseTime } from "./formatTime";
import type { PlaybackSpeed } from "@/features/songs/types";
import type { LoopState } from "./PlaybackEngine";

interface PlaybackStatusBarProps {
  positionSec: number;
  durationSec: number;
  bpm: number;
  speed: PlaybackSpeed;
  eventIndex: number;
  totalEvents: number;
  loop?: LoopState;
}

/** Read-only transport readout used to verify the MIDI engine. */
export function PlaybackStatusBar({
  positionSec,
  durationSec,
  bpm,
  speed,
  eventIndex,
  totalEvents,
  loop,
}: PlaybackStatusBarProps) {
  const progress = durationSec > 0 ? Math.min(100, (positionSec / durationSec) * 100) : 0;
  const loopActive = Boolean(loop?.enabled) && durationSec > 0;
  const loopLeft = loopActive ? (loop!.startTime / durationSec) * 100 : 0;
  const loopWidth = loopActive
    ? Math.max(0.5, ((loop!.endTime - loop!.startTime) / durationSec) * 100)
    : 0;

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card/60 px-5 py-3">
      <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <span className="tabular-nums text-foreground">{formatPreciseTime(positionSec)}</span>
        <div
          className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Progreso de reproducción"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          {loopActive ? (
            <div
              className="absolute inset-y-0 rounded-full border-x border-accent bg-accent/25"
              style={{ left: `${loopLeft}%`, width: `${loopWidth}%` }}
              aria-hidden
            />
          ) : null}
          <div
            className="relative h-full rounded-full bg-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="tabular-nums">{formatPreciseTime(durationSec)}</span>
        <span className="w-12 text-right tabular-nums text-accent">{progress.toFixed(1)} %</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>
          BPM <span className="font-mono text-foreground">{bpm || "—"}</span>
        </span>
        <span>
          Velocidad <span className="font-mono text-foreground">{speed * 100} %</span>
        </span>
        <span>
          Evento{" "}
          <span className="font-mono text-foreground">
            {totalEvents ? `${Math.max(0, eventIndex + 1)} / ${totalEvents}` : "—"}
          </span>
        </span>
        {loopActive ? (
          <span className="text-accent">
            Bucle{" "}
            <span className="font-mono">
              c. {loop!.startMeasure}–{loop!.endMeasure}
            </span>{" "}
            <span className="font-mono">
              {formatPreciseTime(loop!.startTime)} → {formatPreciseTime(loop!.endTime)}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}