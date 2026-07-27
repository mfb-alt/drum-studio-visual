import { cn } from "@/lib/utils";
import type { PadState } from "../types";
import { METAL_SURFACE, RUBBER_SURFACE } from "./surfaces";

/** Snare / tom rubber pad with hoop and tension lugs. */
export function RubberPad({ active, highlighted }: PadState) {
  return (
    <span className="relative block h-full w-full">
      <span className="absolute inset-x-[6%] top-[30%] h-full rounded-[50%] bg-black/45 blur-lg" />

      {/* Hoop */}
      <span
        className={cn(
          "absolute inset-0 rounded-[50%] border transition-colors duration-200",
          active || highlighted ? "border-accent/70" : "border-transparent group-hover:border-accent/50",
        )}
        style={{ background: METAL_SURFACE, boxShadow: "0 14px 26px -14px oklch(0 0 0 / 0.9)" }}
      />

      {/* Playing surface */}
      <span
        className="absolute inset-[9%] rounded-[50%] border border-pad-rim/50"
        style={{
          background: RUBBER_SURFACE,
          boxShadow: "inset 0 2px 6px oklch(1 0 0 / 0.07), inset 0 -8px 14px oklch(0 0 0 / 0.55)",
        }}
      />
      <span className="absolute inset-[26%] rounded-[50%] border border-pad-rim/20" />

      {/* Tension lugs */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <span
          key={deg}
          className="absolute left-1/2 top-1/2 h-[7%] w-[7%] rounded-full bg-metal-hi/45"
          style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-44%)` }}
        />
      ))}
    </span>
  );
}