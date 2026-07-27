import type { PadDefinition, StagePoint } from "./types";

/**
 * Roland TD-1KV layout, seen from the drummer's position.
 * Coordinates are percentages of the stage box so the kit scales
 * from tablet to desktop without recalculating anything.
 */
export const TD1KV_PADS: PadDefinition[] = [
  // Cymbals: CY-5 style, tilted, hanging from boom arms.
  { id: "crash", label: "Crash", shape: "cymbal", x: 23, y: 21, size: 25, flatten: 0.3, rotate: -13, mount: { x: 23, y: 24 }, elevation: 30, keyboardKey: "e" },
  { id: "ride", label: "Ride", shape: "cymbal", x: 80, y: 26, size: 28, flatten: 0.3, rotate: 11, mount: { x: 80, y: 29 }, elevation: 30, keyboardKey: "y" },
  { id: "hihat", label: "Hi-Hat", shape: "cymbal", x: 12, y: 45, size: 24, flatten: 0.3, rotate: -8, mount: { x: 12, y: 47 }, elevation: 40, keyboardKey: "q" },
  // Rubber tom pads (PDX/PD style), angled toward the drummer.
  { id: "tom1", label: "Tom 1", shape: "drum", x: 40, y: 43, size: 16, flatten: 0.66, rotate: -6, mount: { x: 40, y: 46 }, elevation: 20, keyboardKey: "i" },
  { id: "tom2", label: "Tom 2", shape: "drum", x: 58, y: 43, size: 16, flatten: 0.66, rotate: 6, mount: { x: 58, y: 46 }, elevation: 20, keyboardKey: "o" },
  { id: "tom3", label: "Tom 3", shape: "drum", x: 76, y: 58, size: 18, flatten: 0.68, rotate: 10, mount: { x: 76, y: 61 }, elevation: 50, keyboardKey: "k" },
  { id: "snare", label: "Snare", shape: "drum", x: 28, y: 64, size: 23, flatten: 0.68, rotate: -4, mount: { x: 28, y: 68 }, elevation: 50, keyboardKey: "s" },
  // Kick tower + beater pedal, centred between the drummer's feet.
  { id: "kick", label: "Kick", shape: "kick", x: 52, y: 79, size: 24, flatten: 1.05, elevation: 60, keyboardKey: " " },
  { id: "hihat-pedal", label: "Pedal Hi-Hat", shape: "pedal", x: 21, y: 89, size: 16, flatten: 0.72, rotate: -6, elevation: 60, keyboardKey: "a" },
];

/** Aspect ratio of the stage box (width / height). */
export const STAGE_RATIO = 4 / 3;

/**
 * Rack geometry, in stage percentages. The spine is the curved main bar;
 * every pad hangs from it (or from its own floor stand) through a tube.
 */
export const RACK = {
  /** Curved main bar, drummer's point of view. */
  spine: "M 10 60 C 26 40, 74 40, 90 60",
  /** Points on the spine that boom arms start from. */
  spineAnchor: (x: number): StagePoint => {
    // Quadratic-ish approximation of the spine curve above.
    const t = (x - 10) / 80;
    const y = 60 - 4 * 15 * t * (1 - t);
    return { x, y };
  },
  /** Legs that reach the floor. */
  legs: [
    { from: { x: 10, y: 60 }, to: { x: 5, y: 93 } },
    { from: { x: 90, y: 60 }, to: { x: 95, y: 93 } },
  ],
  /** Independent floor stands (hi-hat and snare). */
  stands: [
    { top: { x: 12, y: 47 }, foot: { x: 15, y: 92 } },
    { top: { x: 28, y: 68 }, foot: { x: 30, y: 92 } },
  ],
} as const;