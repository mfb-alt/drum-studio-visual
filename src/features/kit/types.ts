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

/** Point in stage percentage coordinates. */
export interface StagePoint {
  x: number;
  y: number;
}

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
  /**
   * Where the hardware clamp meets the pad. The rack draws a tube
   * from its spine to this point so nothing floats in the air.
   */
  mount?: StagePoint;
  /** Paint order / perceived height. Higher renders in front. */
  elevation?: number;
}

/**
 * Runtime state of a single pad. Kept separate from the static
 * definition so future sources (MIDI in, song playback, auto-highlight)
 * can drive a pad without touching its geometry.
 */
export interface PadState {
  /** Pad was just struck: plays the compression + flash animation. */
  active: boolean;
  /** Passive highlight, e.g. "hit this next" cues. */
  highlighted?: boolean;
  /** 0..1 strike strength, reserved for velocity-aware visuals. */
  velocity?: number;
}