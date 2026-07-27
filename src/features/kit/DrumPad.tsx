import { cn } from "@/lib/utils";
import type { PadDefinition } from "./types";

interface DrumPadProps {
  pad: PadDefinition;
  active: boolean;
  onHit: (pad: PadDefinition) => void;
}

/** Soft rubber body used by tom/snare pads. */
const RUBBER_SURFACE =
  "radial-gradient(ellipse at 42% 22%, var(--pad-rubber-hi), var(--pad-rubber) 58%, var(--pad-shell) 100%)";
const METAL_SURFACE =
  "linear-gradient(160deg, var(--metal-hi), var(--metal) 45%, var(--metal-dark))";

function Flash({ active, className }: { active: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] bg-accent/60 shadow-glow transition-opacity",
        active ? "opacity-100 duration-0" : "opacity-0 duration-300",
        className,
      )}
    />
  );
}

function CymbalBody({ active }: { active: boolean }) {
  return (
    <span className="relative block h-full w-full rounded-full">
      {/* Under-shadow so the cymbal floats above the rack */}
      <span className="absolute inset-x-[6%] top-[24%] h-full rounded-[50%] bg-black/55 blur-md" />
      <span
        className="absolute inset-0 rounded-[50%] border border-pad-rim/70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 34%, var(--pad-cymbal-inner), var(--pad-cymbal) 62%, var(--pad-shell) 100%)",
          boxShadow: "0 8px 18px -10px oklch(0 0 0 / 0.9), inset 0 1px 0 oklch(1 0 0 / 0.08)",
        }}
      />
      {/* Lathing rings */}
      <span className="absolute inset-[9%] rounded-[50%] border border-pad-rim/35" />
      <span className="absolute inset-[18%] rounded-[50%] border border-pad-rim/30" />
      <span className="absolute inset-[28%] rounded-[50%] border border-pad-rim/25" />
      {/* Bell + tension bolt */}
      <span
        className="absolute left-1/2 top-1/2 h-[34%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{ background: METAL_SURFACE, opacity: 0.75 }}
      />
      <Flash active={active} className="rounded-[50%]" />
    </span>
  );
}

function DrumBody({ active }: { active: boolean }) {
  return (
    <span className="relative block h-full w-full rounded-[50%]">
      <span className="absolute inset-x-[4%] top-[22%] h-full rounded-[50%] bg-black/50 blur-md" />
      {/* Hoop */}
      <span
        className="absolute inset-0 rounded-[50%]"
        style={{
          background: METAL_SURFACE,
          boxShadow: "0 12px 26px -12px oklch(0 0 0 / 0.9)",
        }}
      />
      {/* Rubber playing surface with volume */}
      <span
        className="absolute inset-[9%] rounded-[50%] border border-pad-rim/50"
        style={{
          background: RUBBER_SURFACE,
          boxShadow:
            "inset 0 2px 6px oklch(1 0 0 / 0.07), inset 0 -6px 12px oklch(0 0 0 / 0.55)",
        }}
      />
      <span className="absolute inset-[26%] rounded-[50%] border border-pad-rim/25" />
      {/* Tension lugs */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <span
          key={deg}
          className="absolute left-1/2 top-1/2 h-[7%] w-[7%] rounded-full bg-metal-hi/50"
          style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-44%) ` }}
        />
      ))}
      <Flash active={active} className="rounded-[50%]" />
    </span>
  );
}

function KickBody({ active }: { active: boolean }) {
  return (
    <span className="relative block h-full w-full">
      {/* KD-beater tower */}
      <span
        className="absolute left-1/2 top-0 h-[54%] w-[62%] -translate-x-1/2 rounded-[18%] border border-pad-rim/60"
        style={{
          background: RUBBER_SURFACE,
          boxShadow:
            "0 14px 26px -14px oklch(0 0 0 / 0.9), inset 0 2px 4px oklch(1 0 0 / 0.06), inset 0 -8px 14px oklch(0 0 0 / 0.5)",
        }}
      />
      {/* Beater arm */}
      <span
        className="absolute left-1/2 top-[44%] h-[18%] w-[4%] -translate-x-1/2 rounded-full"
        style={{ background: METAL_SURFACE }}
      />
      {/* Footboard, angled away from the drummer */}
      <span
        className="absolute bottom-0 left-1/2 h-[34%] w-[46%] -translate-x-1/2 rounded-[14%] border border-pad-rim/50"
        style={{
          background: METAL_SURFACE,
          transform: "translateX(-50%) perspective(220px) rotateX(52deg)",
          boxShadow: "0 10px 20px -12px oklch(0 0 0 / 0.9)",
        }}
      />
      {/* Base plate */}
      <span className="absolute bottom-[2%] left-1/2 h-[6%] w-[64%] -translate-x-1/2 rounded-full bg-black/60 blur-[2px]" />
      <Flash active={active} className="rounded-[16%]" />
    </span>
  );
}

function PedalBody({ active }: { active: boolean }) {
  return (
    <span className="relative block h-full w-full">
      {/* Hi-hat control pedal (FD-1 style): hinged footboard + heel plate */}
      <span className="absolute bottom-[6%] left-[4%] h-[34%] w-[92%] rounded-[30%] bg-black/50 blur-[3px]" />
      <span
        className="absolute inset-x-0 top-[6%] h-[62%] rounded-[16%] border border-pad-rim/50"
        style={{
          background: RUBBER_SURFACE,
          transform: "perspective(240px) rotateX(46deg)",
          boxShadow: "inset 0 -6px 12px oklch(0 0 0 / 0.5), 0 10px 18px -12px oklch(0 0 0 / 0.9)",
        }}
      />
      <span
        className="absolute bottom-[4%] left-1/2 h-[20%] w-[70%] -translate-x-1/2 rounded-[24%]"
        style={{ background: METAL_SURFACE, opacity: 0.85 }}
      />
      <Flash active={active} className="rounded-[16%]" />
    </span>
  );
}

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
      className="group absolute outline-none"
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
          "relative block h-full w-full transition-transform duration-150 ease-out",
          active ? "scale-[0.96] duration-75" : "group-hover:scale-[1.03]",
        )}
      >
        {pad.shape === "cymbal" && <CymbalBody active={active} />}
        {pad.shape === "drum" && <DrumBody active={active} />}
        {pad.shape === "kick" && <KickBody active={active} />}
        {pad.shape === "pedal" && <PedalBody active={active} />}
      </span>

      {/* Name shown on hover / focus only */}
      <span
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 select-none whitespace-nowrap rounded-md border border-border bg-card/90 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-pad-label opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {pad.label}
      </span>
    </button>
  );
}