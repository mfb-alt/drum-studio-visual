import { cn } from "@/lib/utils";
import type { PadState } from "../types";
import { METAL_SURFACE } from "./surfaces";

/** CY-5 style rubber cymbal seen from above-behind. */
export function CymbalPad({ active, highlighted }: PadState) {
  return (
    <span className="relative block h-full w-full">
      {/* Cast shadow on the floor below */}
      <span className="absolute inset-x-[8%] top-[40%] h-[90%] rounded-[50%] bg-black/45 blur-lg" />

      <span
        className={cn(
          "absolute inset-0 rounded-[50%] border transition-colors duration-200",
          active || highlighted ? "border-accent/70" : "border-pad-rim/70 group-hover:border-accent/50",
        )}
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, var(--pad-cymbal-inner), var(--pad-cymbal) 60%, var(--pad-shell) 100%)",
          boxShadow: "0 10px 18px -12px oklch(0 0 0 / 0.9), inset 0 1px 0 oklch(1 0 0 / 0.08)",
        }}
      />

      {/* Lathing rings */}
      <span className="absolute inset-[8%] rounded-[50%] border border-pad-rim/30" />
      <span className="absolute inset-[17%] rounded-[50%] border border-pad-rim/25" />
      <span className="absolute inset-[27%] rounded-[50%] border border-pad-rim/20" />

      {/* Bell + wing nut */}
      <span
        className="absolute left-1/2 top-[46%] h-[34%] w-[15%] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{ background: METAL_SURFACE, opacity: 0.7 }}
      />
      <span
        className="absolute left-1/2 top-[30%] h-[12%] w-[6%] -translate-x-1/2 rounded-[40%]"
        style={{ background: METAL_SURFACE }}
      />
    </span>
  );
}