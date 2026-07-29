import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LoopState, MusicalPosition } from "./PlaybackEngine";
import { formatPreciseTime } from "./formatTime";

type DragMode = "start" | "end" | "range" | null;

interface LoopTimelineProps {
  positionSec: number;
  durationSec: number;
  loop: LoopState;
  disabled?: boolean;
  onSeek: (timeSec: number) => void;
  musicalPositionAt?: (timeSec: number) => MusicalPosition;
  /** Live while dragging, committed (snapped) on release. */
  onLoopRange: (range: { startTime: number; endTime: number }, committed: boolean) => void;
}

/**
 * Progress bar + draggable loop selection. Purely presentational:
 * it only reports times, never measures.
 */
export function LoopTimeline({
  positionSec,
  durationSec,
  loop,
  disabled = false,
  onSeek,
  musicalPositionAt,
  onLoopRange,
}: LoopTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragMode>(null);
  const [hover, setHover] = useState<{ timeSec: number; leftPct: number } | null>(null);
  const dragOffset = useRef(0);
  const pointerStart = useRef(0);
  const dragMoved = useRef(false);
  const latest = useRef({ loop, durationSec, onLoopRange, onSeek });
  latest.current = { loop, durationSec, onLoopRange, onSeek };

  const timeAt = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return 0;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return ratio * latest.current.durationSec;
    },
    [],
  );

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      const { loop: current, durationSec: total, onLoopRange: emit } = latest.current;
      if (Math.abs(event.clientX - pointerStart.current) <= 3) return;
      dragMoved.current = true;
      const time = timeAt(event.clientX);
      if (drag === "start") {
        emit({ startTime: Math.min(time, current.endTime), endTime: current.endTime }, false);
      } else if (drag === "end") {
        emit({ startTime: current.startTime, endTime: Math.max(time, current.startTime) }, false);
      } else {
        const length = current.endTime - current.startTime;
        const start = Math.min(Math.max(0, time - dragOffset.current), total - length);
        emit({ startTime: start, endTime: start + length }, false);
      }
    };
    const up = (event: PointerEvent) => {
      const { loop: current, onLoopRange: emit, onSeek: seek } = latest.current;
      if (drag === "range" && !dragMoved.current) {
        seek(timeAt(event.clientX));
      } else {
        emit({ startTime: current.startTime, endTime: current.endTime }, true);
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, timeAt]);

  const pct = (value: number) => (durationSec > 0 ? Math.min(100, Math.max(0, (value / durationSec) * 100)) : 0);
  const progress = pct(positionSec);
  const startPct = pct(loop.startTime);
  const endPct = pct(loop.endTime);
  const hasRange = loop.enabled && durationSec > 0 && loop.endTime > loop.startTime;

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-8 flex-1 cursor-pointer select-none rounded-lg bg-muted/40",
        disabled && "pointer-events-none opacity-50",
      )}
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) return;
        onSeek(timeAt(event.clientX));
      }}
      role="group"
      aria-label="Línea de tiempo y selección de bucle"
      onPointerMove={(event) => {
        const timeSec = timeAt(event.clientX);
        setHover({ timeSec, leftPct: durationSec > 0 ? (timeSec / durationSec) * 100 : 0 });
      }}
      onPointerLeave={() => setHover(null)}
    >
      {hasRange ? (
        <>
          <div
            className={cn(
              "absolute inset-y-0 cursor-grab rounded-md border-x-2 border-accent bg-accent/20 active:cursor-grabbing",
              loop.enabled ? "opacity-100" : "opacity-50",
            )}
            style={{ left: `${startPct}%`, width: `${Math.max(0.4, endPct - startPct)}%` }}
            onPointerDown={(event) => {
              event.stopPropagation();
              pointerStart.current = event.clientX;
              dragMoved.current = false;
              dragOffset.current = timeAt(event.clientX) - loop.startTime;
              setDrag("range");
            }}
            aria-label="Mover fragmento"
            role="button"
            tabIndex={-1}
          />
          <Handle
            side="start"
            leftPct={startPct}
            onPointerDown={(clientX) => {
              pointerStart.current = clientX;
              dragMoved.current = false;
              setDrag("start");
            }}
            label="Inicio del bucle"
          />
          <Handle
            side="end"
            leftPct={endPct}
            onPointerDown={(clientX) => {
              pointerStart.current = clientX;
              dragMoved.current = false;
              setDrag("end");
            }}
            label="Final del bucle"
          />
        </>
      ) : null}

      {hover ? (
        <HoverPosition
          timeSec={hover.timeSec}
          leftPct={hover.leftPct}
          musicalPosition={musicalPositionAt?.(hover.timeSec)}
        />
      ) : null}

      {/* Played progress */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 overflow-hidden rounded-b-lg bg-muted"
        aria-hidden
      >
        <div className="h-full rounded-r-full bg-accent/70" style={{ width: `${progress}%` }} />
      </div>

      {/* Playhead */}
      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-foreground"
        style={{ left: `${progress}%` }}
        aria-hidden
      >
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-foreground" />
      </div>
    </div>
  );
}

function Handle({
  side,
  leftPct,
  onPointerDown,
  label,
}: {
  side: "start" | "end";
  leftPct: number;
  onPointerDown: (clientX: number) => void;
  label: string;
}) {
  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuenow={Math.round(leftPct)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      className={cn(
        "absolute top-1/2 z-10 h-7 w-3 -translate-y-1/2 cursor-ew-resize rounded-sm border border-accent bg-accent/80 shadow-md",
        side === "start" ? "-translate-x-full" : "translate-x-0",
      )}
      style={{ left: `${leftPct}%` }}
      onPointerDown={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onPointerDown(event.clientX);
      }}
    >
      <span className="absolute inset-y-1.5 left-1/2 w-px -translate-x-1/2 bg-background/70" aria-hidden />
    </div>
  );
}

function HoverPosition({
  timeSec,
  leftPct,
  musicalPosition,
}: {
  timeSec: number;
  leftPct: number;
  musicalPosition?: MusicalPosition;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-20 w-px bg-foreground/60"
      style={{ left: `${leftPct}%` }}
      aria-hidden
    >
      <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 font-mono text-[11px] text-popover-foreground shadow-md">
        <span>{formatPreciseTime(timeSec)}</span>
        {musicalPosition ? (
          <span className="ml-2">
            Compás {musicalPosition.measure}
            {musicalPosition.beat ? ` · Tiempo ${musicalPosition.beat}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}
