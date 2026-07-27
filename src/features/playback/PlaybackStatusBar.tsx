import { formatPreciseTime } from "./formatTime";
import type { PlaybackSpeed } from "@/features/songs/types";

interface PlaybackStatusBarProps {
  positionSec: number;
  durationSec: number;
  bpm: number;
  speed: PlaybackSpeed;
  eventIndex: number;
  totalEvents: number;
}

/** Read-only transport readout used to verify the MIDI engine. */
export function PlaybackStatusBar({
  positionSec,
  durationSec,
  bpm,
  speed,
  eventIndex,
  totalEvents,
}: PlaybackStatusBarProps) {
  const progress = durationSec > 0 ? Math.min(100, (positionSec / durationSec) * 100) : 0;

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card/60 px-5 py-3">
      <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <span className="tabular-nums text-foreground">{formatPreciseTime(positionSec)}</span>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Progreso de reproducción"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
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
      </div>
    </div>
  );
}