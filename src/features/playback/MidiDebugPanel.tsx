import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TD1KV_PADS } from "@/features/kit/kitConfig";
import type { PadId } from "@/features/kit/types";
import { formatPreciseTime } from "./formatTime";
import type { DebugHit } from "./usePlaybackEngine";

const PAD_LABELS: Record<string, string> = Object.fromEntries(
  TD1KV_PADS.map((pad) => [pad.id, pad.label.toUpperCase()]),
);

interface MidiDebugPanelProps {
  hits: DebugHit[];
  litPads: PadId[];
}

/**
 * Development-only readout of the MIDI stream. Safe to delete later:
 * nothing else depends on it.
 */
export function MidiDebugPanel({ hits, litPads }: MidiDebugPanelProps) {
  const [open, setOpen] = useState(true);
  const latest = hits.length ? hits[0] : null;
  const simultaneous = latest ? hits.filter((hit) => Math.abs(hit.timeSec - latest.timeSec) < 0.001) : [];

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground"
      >
        <span>Panel de depuración MIDI</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
            <span className="tabular-nums text-foreground">
              {latest ? formatPreciseTime(latest.timeSec) : "00:00.000"}
            </span>
            {simultaneous.length ? (
              simultaneous.map((hit) => (
                <span
                  key={hit.id}
                  className="rounded-md bg-accent/15 px-2 py-0.5 text-xs text-accent"
                >
                  Canal {hit.channel + 1} · MIDI {hit.note} · {PAD_LABELS[hit.padId] ?? hit.padId.toUpperCase()}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Sin eventos todavía</span>
            )}
          </div>

          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Pads encendidos:{" "}
            <span className="font-mono text-foreground">
              {litPads.length ? litPads.map((id) => PAD_LABELS[id] ?? id).join(", ") : "—"}
            </span>
          </div>

          <ul className="max-h-40 space-y-1 overflow-y-auto font-mono text-xs text-muted-foreground">
            {hits.map((hit) => (
              <li key={hit.id} className="flex gap-3">
                <span className="tabular-nums">{formatPreciseTime(hit.timeSec)}</span>
                <span className="w-16">Canal {hit.channel + 1}</span>
                <span className="w-16">MIDI {hit.note}</span>
                <span className="text-foreground">{PAD_LABELS[hit.padId] ?? hit.padId.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}