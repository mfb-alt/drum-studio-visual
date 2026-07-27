import { cn } from "@/lib/utils";
import { CymbalPad } from "./pads/CymbalPad";
import { HiHatPedal } from "./pads/HiHatPedal";
import { KickTower } from "./pads/KickTower";
import { RubberPad } from "./pads/RubberPad";
import type { PadDefinition, PadShape, PadState } from "./types";

interface DrumPadProps extends PadState {
  pad: PadDefinition;
  onHit: (pad: PadDefinition) => void;
}

/**
 * Registry of pad bodies. Adding a new piece of hardware only means
 * writing a component and registering it here.
 */
const PAD_BODIES: Record<PadShape, (state: PadState) => React.ReactElement> = {
  cymbal: CymbalPad,
  drum: RubberPad,
  kick: KickTower,
  pedal: HiHatPedal,
};

/**
 * Positions a pad on the stage, owns the hit animation, the hover
 * tooltip and the accent glow. The visual body itself is delegated,
 * so any future driver (MIDI, playback, cues) only needs to flip
 * `active` / `highlighted` on this component.
 */
export function DrumPad({ pad, active, highlighted, onHit }: DrumPadProps) {
  const Body = PAD_BODIES[pad.shape];

  return (
    <button
      type="button"
      aria-label={pad.label}
      aria-pressed={active}
      onPointerDown={(event) => {
        event.preventDefault();
        onHit(pad);
      }}
      className="group absolute cursor-pointer outline-none focus-visible:outline-none"
      style={{
        left: `${pad.x}%`,
        top: `${pad.y}%`,
        width: `${pad.size}%`,
        aspectRatio: `1 / ${pad.flatten ?? 1}`,
        transform: `translate(-50%, -50%) rotate(${pad.rotate ?? 0}deg)`,
        zIndex: pad.elevation ?? 10,
      }}
    >
      <span
        className={cn(
          "relative block h-full w-full will-change-transform",
          "transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "scale-[0.975] duration-[120ms]" : "group-hover:scale-[1.02]",
        )}
      >
        <Body active={active} highlighted={highlighted} />

        {/* Brief strike flash */}
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-accent/45 shadow-glow transition-opacity ease-out",
            active ? "opacity-100 duration-[80ms]" : "opacity-0 duration-[280ms]",
          )}
          style={{ borderRadius: pad.shape === "cymbal" || pad.shape === "drum" ? "50%" : "16%" }}
        />
      </span>

      {/* Elegant tooltip — never printed on the pad itself */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 translate-y-1 select-none whitespace-nowrap rounded-full border border-accent/25 bg-card/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-pad-label opacity-0 shadow-lg backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        style={{ transform: `translate(-50%, 0) rotate(${-(pad.rotate ?? 0)}deg)` }}
      >
        {pad.label}
      </span>
    </button>
  );
}