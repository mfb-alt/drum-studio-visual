import { playPad } from "@/features/audio/audioEngine";
import type { PadId } from "./types";

/**
 * Single entry point for firing a pad: plays the existing sound.
 * Visual lighting/animation is handled by the caller's local state,
 * but the audio side is shared by manual clicks and MIDI playback.
 */
export function triggerDrumPad(padId: PadId, velocity = 1) {
  playPad(padId, velocity);
}
