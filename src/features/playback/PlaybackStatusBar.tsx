import { formatPreciseTime } from "./formatTime";
import type { PlaybackSpeed } from "@/features/songs/types";
import type { LoopState, MusicalPosition } from "./PlaybackEngine";
import { LoopTimeline } from "./LoopTimeline";

interface PlaybackStatusBarProps {
  positionSec: number;
  durationSec: number;
  bpm: number;
  speed: PlaybackSpeed;
  eventIndex: number;
  totalEvents: number;
  loop?: LoopState;
  disabled?: boolean;
  onSeek?: (timeSec: number) => void;
  musicalPositionAt?: (timeSec: number) => MusicalPosition;
  onLoopRange?: (range: { startTime: number; endTime: number }, committed: boolean) => void;
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
  disabled = false,
  onSeek,
  musicalPositionAt,
  onLoopRange,
}: PlaybackStatusBarProps) {
  const progress = durationSec > 0 ? Math.min(100, (positionSec / durationSec) * 100) : 0;
  const loopActive = Boolean(loop?.enabled) && durationSec > 0;

  return (
    <div className="space-y-1.5 rounded-2xl border border-border bg-card/60 px-5 py-2.5">
      <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <span className="tabular-nums text-foreground">{formatPreciseTime(positionSec)}</span>
        {loop ? (
          <LoopTimeline
            positionSec={positionSec}
            durationSec={durationSec}
            loop={loop}
            disabled={disabled}
            onSeek={(value) => onSeek?.(value)}
            musicalPositionAt={musicalPositionAt}
            onLoopRange={(range, committed) => onLoopRange?.(range, committed)}
          />
        ) : (
          <div className="h-1.5 flex-1 rounded-full bg-muted" aria-hidden />
        )}
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
              {formatPreciseTime(loop!.startTime)} → {formatPreciseTime(loop!.endTime)}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
