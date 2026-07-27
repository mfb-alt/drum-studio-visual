/**
 * Simple metal rack + hardware that ties the TD-1KV together.
 * Purely decorative: it never intercepts pointer events.
 */
export function KitRack() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--metal-dark)" />
          <stop offset="45%" stopColor="var(--metal-hi)" />
          <stop offset="100%" stopColor="var(--metal-dark)" />
        </linearGradient>
      </defs>

      <g
        stroke="url(#tube)"
        strokeLinecap="round"
        fill="none"
        strokeWidth={0.7}
      >
        {/* Curved main bar of the rack */}
        <path d="M14 52 C 30 34, 70 34, 86 56" strokeWidth={0.9} />
        {/* Cymbal / pad boom arms */}
        <path d="M28 46 L 24 22" />
        <path d="M74 48 L 80 27" />
        <path d="M16 50 L 12 46" />
        <path d="M40 46 L 40 52" />
        <path d="M58 46 L 58 52" />
        <path d="M76 55 L 76 62" />
        <path d="M30 60 L 30 70" />
        {/* Legs down to the floor */}
        <path d="M16 52 L 12 92" />
        <path d="M86 56 L 90 92" />
        <path d="M50 44 L 50 74" strokeWidth={0.5} />
      </g>

      {/* Floor feet */}
      <g fill="var(--metal-dark)" opacity={0.9}>
        <ellipse cx="12" cy="92" rx="2.4" ry="0.8" />
        <ellipse cx="90" cy="92" rx="2.4" ry="0.8" />
      </g>
    </svg>
  );
}