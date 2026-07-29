import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { LoopState } from "./PlaybackEngine";

interface LoopControlsProps {
  disabled?: boolean;
  loop: LoopState;
  /** 0-based index of the bar the transport is inside. */
  barIndex: number;
  barCount: number;
  onChange: (next: { enabled: boolean; startMeasure: number; endMeasure: number }) => void;
}

/** Compact loop block; all musical time maths live in PlaybackEngine. */
export function LoopControls({
  disabled = true,
  loop,
  barIndex,
  barCount,
  onChange,
}: LoopControlsProps) {
  const currentMeasure = Math.min(barIndex + 1, barCount);

  const toggle = (enabled: boolean) => {
    if (!enabled) {
      onChange({ enabled: false, startMeasure: loop.startMeasure, endMeasure: loop.endMeasure });
      return;
    }
    onChange({
      enabled: true,
      startMeasure: currentMeasure,
      endMeasure: Math.min(currentMeasure + 1, barCount),
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-border bg-card/60 px-5 py-3">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <Repeat className={cn("h-4 w-4", loop.enabled ? "text-accent" : "text-muted-foreground")} aria-hidden />
        <span>Repetir fragmento</span>
        <Switch
          checked={loop.enabled}
          disabled={disabled}
          onCheckedChange={toggle}
          aria-label="Repetir fragmento"
        />
      </label>

      <div
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-2",
          !loop.enabled && "pointer-events-none opacity-40",
        )}
      >
        <MeasureField
          id="loop-start"
          label="Desde compás"
          value={loop.startMeasure}
          min={1}
          max={barCount}
          disabled={disabled || !loop.enabled}
          onChange={(value) =>
            onChange({
              enabled: true,
              startMeasure: value,
              endMeasure: Math.max(value, loop.endMeasure),
            })
          }
        />
        <MeasureField
          id="loop-end"
          label="Hasta compás"
          value={loop.endMeasure}
          min={loop.startMeasure}
          max={barCount}
          disabled={disabled || !loop.enabled}
          onChange={(value) =>
            onChange({
              enabled: true,
              startMeasure: loop.startMeasure,
              endMeasure: Math.max(loop.startMeasure, value),
            })
          }
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || !loop.enabled}
          className="h-8 rounded-full px-3 text-xs"
          onClick={() =>
            onChange({ enabled: true, startMeasure: currentMeasure, endMeasure: currentMeasure })
          }
        >
          Usar compás actual
        </Button>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Compás actual <span className="font-mono text-foreground">{currentMeasure}</span> / {barCount}
        </span>
      </div>
    </div>
  );
}

function MeasureField({
  id,
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-xs text-muted-foreground">
      {label}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(Math.max(next, min), max));
        }}
        className="h-8 w-16 rounded-md border border-border bg-background px-2 text-center font-mono text-sm text-foreground tabular-nums"
      />
    </label>
  );
}
