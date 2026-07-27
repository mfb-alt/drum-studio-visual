import type { PadDefinition } from "./types";

/**
 * Roland TD-1KV layout, seen from the drummer's position.
 * Coordinates are percentages of the stage box so the kit scales
 * from tablet to desktop without recalculating anything.
 */
export const TD1KV_PADS: PadDefinition[] = [
  { id: "crash", label: "Crash", shape: "cymbal", x: 32, y: 13, size: 21, flatten: 0.34, rotate: -8, keyboardKey: "e" },
  { id: "ride", label: "Ride", shape: "cymbal", x: 76, y: 22, size: 24, flatten: 0.34, rotate: 7, keyboardKey: "y" },
  { id: "hihat", label: "Hi-Hat", shape: "cymbal", x: 13, y: 30, size: 19, flatten: 0.34, rotate: -10, keyboardKey: "q" },
  { id: "tom1", label: "Tom 1", shape: "drum", x: 42, y: 41, size: 16, flatten: 0.6, keyboardKey: "i" },
  { id: "tom2", label: "Tom 2", shape: "drum", x: 61, y: 42, size: 16, flatten: 0.6, keyboardKey: "o" },
  { id: "tom3", label: "Tom 3", shape: "drum", x: 80, y: 57, size: 17, flatten: 0.62, keyboardKey: "k" },
  { id: "snare", label: "Snare", shape: "drum", x: 28, y: 58, size: 20, flatten: 0.62, keyboardKey: "s" },
  { id: "kick", label: "Kick", shape: "kick", x: 51, y: 76, size: 26, flatten: 0.5, keyboardKey: " " },
  { id: "hihat-pedal", label: "Pedal Hi-Hat", shape: "pedal", x: 16, y: 84, size: 16, flatten: 0.5, keyboardKey: "a" },
];