import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "@/features/songs/types";
import type { CountInBars } from "./PlaybackEngine";

interface TransportBarProps {
  /** Disabled until a timeline is loaded. */
  disabled?: boolean;
  speed?: PlaybackSpeed;
  countInBars?: CountInBars;
  canGoToStart?: boolean;
  canGoToEnd?: boolean;
  canStepBack?: boolean;
  canStepForward?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onGoToStart?: () => void;
  onGoToEnd?: () => void;
  onPreviousBar?: () => void;
  onNextBar?: () => void;
  onSpeedChange?: (speed: PlaybackSpeed) => void;
  onCountInChange?: (bars: CountInBars) => void;
}

/** Presentational transport bar; all timing lives in PlaybackEngine. */
export function TransportBar({
  disabled = true,
  speed = 1,
  countInBars = 1,
  canGoToStart = false,
  canGoToEnd = false,
  canStepBack = false,
  canStepForward = false,
  onPlay,
  onPause,
  onGoToStart,
  onGoToEnd,
  onPreviousBar,
  onNextBar,
  onSpeedChange,
  onCountInChange,
}: TransportBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-border bg-card/60 px-5 py-3">
      <div className="flex items-center gap-2">
        <TransportButton label="Ir al inicio" disabled={disabled || !canGoToStart} onClick={onGoToStart}>
          <SkipBack className="h-4 w-4" aria-hidden />
        </TransportButton>
        <TransportButton
          label="Retroceder un compás"
          disabled={disabled || !canStepBack}
          onClick={onPreviousBar}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </TransportButton>
        <TransportButton label="Reproducir" disabled={disabled} onClick={onPlay}>
          <Play className="h-4 w-4" aria-hidden />
        </TransportButton>
        <TransportButton label="Pausa" disabled={disabled} onClick={onPause}>
          <Pause className="h-4 w-4" aria-hidden />
        </TransportButton>
        <TransportButton
          label="Avanzar un compás"
          disabled={disabled || !canStepForward}
          onClick={onNextBar}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </TransportButton>
        <TransportButton label="Ir al final" disabled={disabled || !canGoToEnd} onClick={onGoToEnd}>
          <SkipForward className="h-4 w-4" aria-hidden />
        </TransportButton>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Velocidad</span>
        <div className="flex items-center gap-1">
          {PLAYBACK_SPEEDS.map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              aria-pressed={value === speed}
              onClick={() => onSpeedChange?.(value)}
              className={cn(
                "h-8 rounded-full px-3 text-xs",
                value === speed && "bg-accent/15 text-accent",
              )}
            >
              {value * 100} %
            </Button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        Cuenta atrás
        <select
          value={countInBars}
          disabled={disabled}
          onChange={(event) => onCountInChange?.(Number(event.target.value) as CountInBars)}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs normal-case text-foreground"
        >
          <option value={0}>Desactivada</option>
          <option value={1}>1 compás</option>
          <option value={2}>2 compases</option>
        </select>
      </label>
    </div>
  );
}

function TransportButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="h-9 w-9 rounded-full"
    >
      {children}
    </Button>
  );
}
