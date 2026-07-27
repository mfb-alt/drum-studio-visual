import { cn } from "@/lib/utils";
import type { PadDefinition } from "./types";

interface DrumPadProps {
  pad: PadDefinition;
  active: boolean;
  onHit: (pad: PadDefinition) => void;
}

const shapeStyles: Record<PadDefinition["shape"], string> = {
  cymbal: "bg-pad-cymbal rounded-full",
  drum: "bg-pad-shell rounded-full",
  kick: "bg-pad-shell rounded-full",
  pedal: "bg-pad-shell rounded-[28%]",
};

export function DrumPad({ pad, active, onHit }: DrumPadProps) {
  return (
    <button
      type="button"
      aria-label={pad.label}
      aria-pressed={active}
      onPointerDown={(event) => {
        event.preventDefault();
        onHit(pad);
      }}
      className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
      style={{
        left: `${pad.x}%`,
        top: `${pad.y}%`,
        width: `${pad.size}%`,
        aspectRatio: `1 / ${pad.flatten ?? 1}`,
        transform: `translate(-50%, -50%) rotate(${pad.rotate ?? 0}deg)`,
      }}
    >
      <span
        className={cn(
          "relative flex h-full w-full items-center justify-center border border-pad-rim shadow-pad transition-transform duration-150 ease-out",
          shapeStyles[pad.shape],
          active ? "scale-95 duration-75" : "group-hover:scale-[1.03]",
        )}
      >
        <span
          className={cn(
            "absolute inset-[14%] rounded-[inherit] border border-pad-rim/60",
            pad.shape === "cymbal" ? "bg-pad-cymbal-inner" : "bg-pad-head",
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-accent/70 opacity-0 shadow-glow transition-opacity",
            active ? "opacity-100 duration-0" : "duration-300",
          )}
        />
        <span className="relative z-10 select-none text-[clamp(0.55rem,1.1vw,0.8rem)] font-medium uppercase tracking-[0.18em] text-pad-label">
          {pad.label}
        </span>
      </span>
    </button>
  );
}