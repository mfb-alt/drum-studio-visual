export type PadId =
  | "crash"
  | "ride"
  | "hihat"
  | "snare"
  | "tom1"
  | "tom2"
  | "tom3"
  | "kick"
  | "hihat-pedal";

export type PadShape = "cymbal" | "drum" | "kick" | "pedal";

export interface PadDefinition {
  id: PadId;
  label: string;
  shape: PadShape;
  /** Position of the pad center, in % of the stage box. */
  x: number;
  y: number;
  /** Width of the pad, in % of the stage box. */
  size: number;
  /** Vertical squash to fake the drummer point of view. */
  flatten?: number;
  rotate?: number;
  keyboardKey?: string;
}