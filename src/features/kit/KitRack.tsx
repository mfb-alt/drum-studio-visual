import { RACK, TD1KV_PADS } from "./kitConfig";
import type { PadDefinition } from "./types";

/** Pads that hang from the curved rack spine through a boom arm. */
const RACK_MOUNTED: PadDefinition["id"][] = ["crash", "ride", "tom1", "tom2", "tom3"];

/**
 * Structural hardware of the kit: curved rack spine, legs, boom arms and
 * clamps. Every pad with a `mount` gets a real tube reaching it, so the
 * kit reads as assembled hardware instead of floating shapes.
 * Decorative only — it never intercepts pointer events.
 */
export function KitRack() {
  const booms = TD1KV_PADS.filter(
    (pad) => pad.mount && RACK_MOUNTED.includes(pad.id),
  ).map((pad) => {
    const anchor = RACK.spineAnchor(pad.x);
    return { id: pad.id, anchor, mount: pad.mount! };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rack-tube" gradientUnits="userSpaceOnUse" spreadMethod="repeat" x1="0" y1="0" x2="0" y2="4">
          <stop offset="0%" stopColor="var(--metal-dark)" />
          <stop offset="40%" stopColor="var(--metal-hi)" />
          <stop offset="100%" stopColor="var(--metal-dark)" />
        </linearGradient>
        <linearGradient id="rack-tube-v" gradientUnits="userSpaceOnUse" spreadMethod="repeat" x1="0" y1="0" x2="2" y2="0">
          <stop offset="0%" stopColor="var(--metal-hi)" />
          <stop offset="55%" stopColor="var(--metal)" />
          <stop offset="100%" stopColor="var(--metal-dark)" />
        </linearGradient>
      </defs>

      {/* Floor contact shadows keep the hardware grounded */}
      <g fill="oklch(0 0 0)" opacity={0.5}>
        <ellipse cx="5" cy="93" rx="3" ry="0.9" />
        <ellipse cx="95" cy="93" rx="3" ry="0.9" />
        <ellipse cx="15" cy="92" rx="3" ry="0.9" />
        <ellipse cx="30" cy="92" rx="3" ry="0.9" />
      </g>

      <g fill="none" strokeLinecap="round">
        {/* Legs and stands, slightly darker so they read as further away */}
        <g stroke="url(#rack-tube-v)" strokeWidth={0.75} opacity={0.85}>
          {RACK.legs.map((leg) => (
            <line
              key={`leg-${leg.to.x}`}
              x1={leg.from.x}
              y1={leg.from.y}
              x2={leg.to.x}
              y2={leg.to.y}
            />
          ))}
          {RACK.stands.map((stand) => (
            <g key={`stand-${stand.top.x}`}>
              <line x1={stand.top.x} y1={stand.top.y} x2={stand.foot.x} y2={stand.foot.y} />
              {/* tripod feet */}
              <line
                x1={stand.foot.x}
                y1={stand.foot.y}
                x2={stand.foot.x - 5}
                y2={stand.foot.y + 2}
                strokeWidth={0.5}
              />
              <line
                x1={stand.foot.x}
                y1={stand.foot.y}
                x2={stand.foot.x + 5}
                y2={stand.foot.y + 2}
                strokeWidth={0.5}
              />
            </g>
          ))}
          {/* Hi-hat pull rod down to the control pedal */}
          <line x1="15" y1="88" x2="21" y2="90" strokeWidth={0.45} opacity={0.7} />
        </g>

        {/* Curved main bar */}
        <path d={RACK.spine} stroke="url(#rack-tube)" strokeWidth={1} />

        {/* Boom arms from the spine to each pad clamp */}
        <g stroke="url(#rack-tube-v)" strokeWidth={0.7}>
          {booms.map(({ id, anchor, mount }) => (
            <line key={`boom-${id}`} x1={anchor.x} y1={anchor.y} x2={mount.x} y2={mount.y} />
          ))}
        </g>
      </g>

      {/* Clamps where hardware meets a pad */}
      <g fill="var(--metal)" opacity={0.9}>
        {TD1KV_PADS.filter((pad) => pad.mount).map((pad) => (
          <ellipse key={`clamp-${pad.id}`} cx={pad.mount!.x} cy={pad.mount!.y} rx={1.1} ry={0.7} />
        ))}
        {booms.map(({ id, anchor }) => (
          <ellipse key={`anchor-${id}`} cx={anchor.x} cy={anchor.y} rx={1} ry={0.8} />
        ))}
      </g>
    </svg>
  );
}