import type { ReactNode } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "@/features/songs/types";

interface TransportBarProps {
  /** Disabled until a timeline is loaded. */
  disabled?: boolean;
  speed?: PlaybackSpeed;
  onPlay?: () => void;
  onPause?: () => void;
  onRewind?: () => void;
  onForward?: () => void;
  onSpeedChange?: (speed: PlaybackSpeed) => void;
}

/** Presentational transport bar; all timing lives in PlaybackEngine. */
export function TransportBar({
  disabled = true,
  speed = 1,
  onPlay,
  onPause,
  onRewind,
  onForward,
  onSpeedChange,
}: TransportBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-border bg-card/60 px-5 py-3">
      <div className="flex items-center gap-2">
        <TransportButton label="Retroceder" disabled={disabled} onClick={onRewind}>
          <SkipBack className="h-4 w-4" aria-hidden />
        </TransportButton>
        <TransportButton label="Reproducir" disabled={disabled} onClick={onPlay}>
          <Play className="h-4 w-4" aria-hidden />
        </TransportButton>
        <TransportButton label="Pausa" disabled={disabled} onClick={onPause}>
          <Pause className="h-4 w-4" aria-hidden />
        </TransportButton>
        <TransportButton label="Avanzar" disabled={disabled} onClick={onForward}>
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
