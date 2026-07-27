import { cn } from "@/lib/utils";
import type { PadState } from "../types";
import { METAL_SURFACE, RUBBER_SURFACE } from "./surfaces";

/** FD-style hi-hat control pedal: hinged footboard over a heel plate. */
export function HiHatPedal({ active, highlighted }: PadState) {
  return (
    <span className="relative block h-full w-full">
      <span className="absolute bottom-[4%] left-[4%] h-[36%] w-[92%] rounded-[40%] bg-black/50 blur-md" />

      <span
        className={cn(
          "absolute inset-x-0 top-[4%] h-[62%] rounded-[16%] border transition-[transform,border-color] duration-200 ease-out",
          active || highlighted ? "border-accent/70" : "border-pad-rim/50 group-hover:border-accent/50",
        )}
        style={{
          background: RUBBER_SURFACE,
          transform: `perspective(260px) rotateX(${active ? 56 : 46}deg)`,
          boxShadow: "inset 0 -8px 14px oklch(0 0 0 / 0.5), 0 12px 20px -14px oklch(0 0 0 / 0.9)",
        }}
      />

      {/* Heel plate + hinge */}
      <span
        className="absolute bottom-[6%] left-1/2 h-[20%] w-[72%] -translate-x-1/2 rounded-[24%]"
        style={{ background: METAL_SURFACE, opacity: 0.85 }}
      />
      <span
        className="absolute bottom-[24%] left-1/2 h-[6%] w-[30%] -translate-x-1/2 rounded-full"
        style={{ background: METAL_SURFACE, opacity: 0.6 }}
      />
    </span>
  );
}