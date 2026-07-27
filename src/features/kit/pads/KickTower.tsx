import { cn } from "@/lib/utils";
import type { PadState } from "../types";
import { METAL_SURFACE, RUBBER_SURFACE } from "./surfaces";

/** KD-style bass tower with its beater and footboard. */
export function KickTower({ active, highlighted }: PadState) {
  return (
    <span className="relative block h-full w-full">
      <span className="absolute bottom-[2%] left-1/2 h-[10%] w-[72%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-md" />

      {/* Beater pad tower */}
      <span
        className={cn(
          "absolute left-1/2 top-0 h-[52%] w-[58%] -translate-x-1/2 rounded-[18%] border transition-colors duration-200",
          active || highlighted ? "border-accent/70" : "border-pad-rim/60 group-hover:border-accent/50",
        )}
        style={{
          background: RUBBER_SURFACE,
          boxShadow:
            "0 16px 28px -16px oklch(0 0 0 / 0.9), inset 0 2px 4px oklch(1 0 0 / 0.06), inset 0 -10px 16px oklch(0 0 0 / 0.5)",
        }}
      />

      {/* Beater arm, tilts on hit */}
      <span
        className="absolute left-1/2 top-[42%] h-[20%] w-[4%] origin-bottom -translate-x-1/2 rounded-full transition-transform duration-200 ease-out"
        style={{
          background: METAL_SURFACE,
          transform: `translateX(-50%) rotate(${active ? -14 : 0}deg)`,
        }}
      />

      {/* Footboard seen in perspective */}
      <span
        className="absolute bottom-[6%] left-1/2 h-[34%] w-[46%] -translate-x-1/2 rounded-[14%] border border-pad-rim/50 transition-transform duration-200 ease-out"
        style={{
          background: METAL_SURFACE,
          transform: `translateX(-50%) perspective(240px) rotateX(${active ? 60 : 52}deg)`,
          boxShadow: "0 12px 20px -14px oklch(0 0 0 / 0.9)",
        }}
      />
      <span
        className="absolute bottom-[3%] left-1/2 h-[6%] w-[52%] -translate-x-1/2 rounded-full"
        style={{ background: METAL_SURFACE, opacity: 0.8 }}
      />
    </span>
  );
}