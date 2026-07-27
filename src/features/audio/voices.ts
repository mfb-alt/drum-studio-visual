import type { PadId } from "@/features/kit/types";

export interface VoiceSpec {
  /** Body oscillator start frequency in Hz (0 = noise only). */
  tone: number;
  /** Pitch the body sweeps down to. */
  toneEnd: number;
  /** Amount of noise mixed in (0-1). */
  noise: number;
  /** Noise band centre in Hz. */
  color: number;
  decay: number;
  gain: number;
}

export const VOICES: Record<PadId, VoiceSpec> = {
  crash: { tone: 0, toneEnd: 0, noise: 1, color: 6200, decay: 1.6, gain: 0.35 },
  ride: { tone: 0, toneEnd: 0, noise: 1, color: 8200, decay: 1.1, gain: 0.28 },
  hihat: { tone: 0, toneEnd: 0, noise: 1, color: 9500, decay: 0.16, gain: 0.32 },
  "hihat-pedal": { tone: 0, toneEnd: 0, noise: 1, color: 7200, decay: 0.09, gain: 0.28 },
  snare: { tone: 190, toneEnd: 150, noise: 0.9, color: 2400, decay: 0.28, gain: 0.5 },
  tom1: { tone: 260, toneEnd: 130, noise: 0.1, color: 1200, decay: 0.5, gain: 0.6 },
  tom2: { tone: 200, toneEnd: 100, noise: 0.1, color: 1000, decay: 0.55, gain: 0.6 },
  tom3: { tone: 140, toneEnd: 70, noise: 0.1, color: 800, decay: 0.7, gain: 0.6 },
  kick: { tone: 120, toneEnd: 42, noise: 0.05, color: 400, decay: 0.45, gain: 0.9 },
};