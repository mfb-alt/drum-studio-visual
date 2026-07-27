import { DrumPad } from "./DrumPad";
import { KitRack } from "./KitRack";
import { TD1KV_PADS } from "./kitConfig";
import { useKitTrigger } from "./useKitTrigger";
import type { PadId } from "./types";

interface DrumKitProps {
  /** Pads to keep softly lit, e.g. upcoming-hit cues. Reserved for later. */
  highlightedPads?: PadId[];
  /**
   * Pads pulsed by an external driver (playback, MIDI in). The kit only
   * receives pad ids — it knows nothing about where they come from.
   */
  litPads?: PadId[];
}

/**
 * Stage that hosts the whole kit. The box keeps a 4:3 ratio, takes ~78%
 * of the available width and is capped by the viewport height so the kit
 * grows on large screens and is never cropped on tablets.
 */
export function DrumKit({ highlightedPads = [], litPads = [] }: DrumKitProps) {
  const { activePads, trigger } = useKitTrigger();

  return (
    <div className="flex w-full justify-center">
      <div
        className="relative aspect-[4/3] w-[78%] min-w-[18rem] rounded-3xl border border-border bg-stage shadow-stage"
        style={{ maxWidth: "calc((100dvh - 10rem) * 4 / 3)" }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-stage-glow" />
        {/* Floor gradient adds the "sitting in front of the kit" depth */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] rounded-b-3xl"
          style={{
            background:
              "linear-gradient(to top, oklch(0 0 0 / 0.45), transparent), radial-gradient(ellipse at 50% 100%, color-mix(in oklab, var(--accent) 7%, transparent), transparent 70%)",
          }}
        />
        <KitRack />
        {TD1KV_PADS.map((pad) => (
          <DrumPad
            key={pad.id}
            pad={pad}
            active={activePads.includes(pad.id) || litPads.includes(pad.id)}
            highlighted={highlightedPads.includes(pad.id)}
            onHit={trigger}
          />
        ))}
      </div>
    </div>
  );
}