import { useState } from "react";
import { ChevronDown, Flag, FlagOff, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { LoopState } from "./PlaybackEngine";
import { formatPreciseTime } from "./formatTime";

interface LoopControlsProps {
  disabled?: boolean;
  loop: LoopState;
  /** 0-based index of the bar the transport is inside. */
  barIndex: number;
  barCount: number;
  positionSec: number;
  hasBarGrid?: boolean;
  snapToBars?: boolean;
  onSnapChange?: (snap: boolean) => void;
  /** Time-based edit; PlaybackEngine converts to measures. */
  onRangeChange?: (next: { startTime: number; endTime: number; enabled?: boolean; snap?: boolean }) => void;
  onChange: (next: { enabled: boolean; startMeasure: number; endMeasure: number }) => void;
}

/** Compact loop block; all musical time maths live in PlaybackEngine. */
export function LoopControls({
  disabled = true,
  loop,
  barIndex,
  barCount,
  positionSec,
  hasBarGrid = false,
  snapToBars = true,
  onSnapChange,
  onRangeChange,
  onChange,
}: LoopControlsProps) {
  const currentMeasure = Math.min(barIndex + 1, barCount);
  const [precise, setPrecise] = useState(false);
  const hasSelection = loop.endTime > loop.startTime;
  const lengthSec = Math.max(0, loop.endTime - loop.startTime);

  const toggle = (enabled: boolean) => {
    if (!enabled) {
      onChange({ enabled: false, startMeasure: loop.startMeasure, endMeasure: loop.endMeasure });
      return;
    }
    if (hasSelection) {
      onRangeChange?.({
        startTime: loop.startTime,
        endTime: loop.endTime,
        enabled: true,
        snap: snapToBars,
      });
      return;
    }
    onChange({
      enabled: true,
      startMeasure: currentMeasure,
      endMeasure: Math.min(currentMeasure + 1, barCount),
    });
  };

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card/60 px-5 py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Repeat
            className={cn("h-4 w-4", loop.enabled ? "text-accent" : "text-muted-foreground")}
            aria-hidden
          />
          <span>Repetir fragmento</span>
          <Switch
            checked={loop.enabled}
            disabled={disabled}
            onCheckedChange={toggle}
            aria-label="Repetir fragmento"
          />
        </label>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          className="h-8 gap-1.5 rounded-full px-3 text-xs"
          onClick={() =>
            onRangeChange?.({
              startTime: positionSec,
              endTime: Math.max(loop.endTime, positionSec),
              snap: snapToBars,
            })
          }
        >
          <Flag className="h-3.5 w-3.5" aria-hidden />
          Marcar inicio aquí
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          className="h-8 gap-1.5 rounded-full px-3 text-xs"
          onClick={() =>
            onRangeChange?.({
              startTime: Math.min(loop.startTime, positionSec),
              endTime: positionSec,
              snap: snapToBars,
            })
          }
        >
          <FlagOff className="h-3.5 w-3.5" aria-hidden />
          Marcar final aquí
        </Button>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Ajustar a compases
          <Switch
            checked={snapToBars}
            disabled={disabled}
            onCheckedChange={(value) => {
              onSnapChange?.(value);
              if (value && hasSelection) {
                onRangeChange?.({ startTime: loop.startTime, endTime: loop.endTime, snap: true });
              }
            }}
            aria-label="Ajustar a compases"
          />
        </label>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setPrecise((value) => !value)}
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          aria-expanded={precise}
        >
          Ajuste preciso
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", precise && "rotate-180")} aria-hidden />
        </button>
      </div>

      <p className="flex flex-wrap items-center gap-x-4 font-mono text-xs text-muted-foreground">
        <span className="text-accent">
          {formatPreciseTime(loop.startTime)} → {formatPreciseTime(loop.endTime)}
        </span>
        {hasBarGrid && loop.barAligned !== false ? (
          <span>
            Compases {loop.startMeasure}–{loop.endMeasure}
          </span>
        ) : null}
        <span>Duración: {lengthSec.toFixed(3)} s</span>
      </p>

      {precise ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-2">
          <MeasureField
            id="loop-start"
            label="Desde compás"
            value={loop.startMeasure}
            min={1}
            max={barCount}
            disabled={disabled}
            onChange={(value) =>
              onChange({
                enabled: loop.enabled,
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
            disabled={disabled}
            onChange={(value) =>
              onChange({
                enabled: loop.enabled,
                startMeasure: loop.startMeasure,
                endMeasure: Math.max(loop.startMeasure, value),
              })
            }
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled}
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
      ) : null}
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
