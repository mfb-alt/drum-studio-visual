import type { PadDefinition } from "./types";

/**
 * Roland TD-1KV layout, seen from the drummer's position.
 * Coordinates are percentages of the stage box so the kit scales
 * from tablet to desktop without recalculating anything.
 */
export const TD1KV_PADS: PadDefinition[] = [
  // Cymbals: CY-5 style, tilted, seen from above-behind.
  { id: "crash", label: "Crash", shape: "cymbal", x: 24, y: 20, size: 24, flatten: 0.3, rotate: -13, keyboardKey: "e" },
  { id: "ride", label: "Ride", shape: "cymbal", x: 80, y: 25, size: 27, flatten: 0.3, rotate: 11, keyboardKey: "y" },
  { id: "hihat", label: "Hi-Hat", shape: "cymbal", x: 12, y: 44, size: 23, flatten: 0.3, rotate: -9, keyboardKey: "q" },
  // Rubber tom pads (PDX/PD style), angled toward the drummer.
  { id: "tom1", label: "Tom 1", shape: "drum", x: 40, y: 43, size: 16, flatten: 0.66, rotate: -6, keyboardKey: "i" },
  { id: "tom2", label: "Tom 2", shape: "drum", x: 58, y: 43, size: 16, flatten: 0.66, rotate: 6, keyboardKey: "o" },
  { id: "tom3", label: "Tom 3", shape: "drum", x: 76, y: 58, size: 17, flatten: 0.68, rotate: 10, keyboardKey: "k" },
  { id: "snare", label: "Snare", shape: "drum", x: 29, y: 63, size: 22, flatten: 0.68, rotate: -4, keyboardKey: "s" },
  // Kick tower + beater pedal, centred between the drummer's feet.
  { id: "kick", label: "Kick", shape: "kick", x: 52, y: 80, size: 20, flatten: 1.05, keyboardKey: " " },
  { id: "hihat-pedal", label: "Pedal Hi-Hat", shape: "pedal", x: 22, y: 88, size: 15, flatten: 0.72, rotate: -6, keyboardKey: "a" },
];