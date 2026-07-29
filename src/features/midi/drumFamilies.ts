import type { PadId } from "@/features/kit/types";

export type DrumFamily = "kick" | "snare" | "hihat" | "ride" | "crash" | "toms";

export const DRUM_FAMILIES: ReadonlyArray<{ id: DrumFamily; label: string }> = [
  { id: "kick", label: "Bombo" },
  { id: "snare", label: "Caja" },
  { id: "hihat", label: "Charles" },
  { id: "ride", label: "Ride" },
  { id: "crash", label: "Crash" },
  { id: "toms", label: "Toms" },
];

/** General MIDI percussion variants supported by the visual kit and mute controls. */
export const GENERAL_MIDI_DRUM_NOTES: ReadonlyArray<{
  note: number;
  family: DrumFamily;
  padId: PadId;
}> = [
  { note: 35, family: "kick", padId: "kick" },
  { note: 36, family: "kick", padId: "kick" },
  { note: 37, family: "snare", padId: "snare" },
  { note: 38, family: "snare", padId: "snare" },
  { note: 39, family: "snare", padId: "snare" },
  { note: 40, family: "snare", padId: "snare" },
  { note: 42, family: "hihat", padId: "hihat" },
  { note: 44, family: "hihat", padId: "hihat-pedal" },
  { note: 46, family: "hihat", padId: "hihat" },
  { note: 41, family: "toms", padId: "tom3" },
  { note: 43, family: "toms", padId: "tom3" },
  { note: 45, family: "toms", padId: "tom2" },
  { note: 47, family: "toms", padId: "tom2" },
  { note: 48, family: "toms", padId: "tom1" },
  { note: 50, family: "toms", padId: "tom1" },
  { note: 49, family: "crash", padId: "crash" },
  { note: 52, family: "crash", padId: "crash" },
  { note: 55, family: "crash", padId: "crash" },
  { note: 57, family: "crash", padId: "crash" },
  { note: 51, family: "ride", padId: "ride" },
  { note: 53, family: "ride", padId: "ride" },
  { note: 59, family: "ride", padId: "ride" },
];

const FAMILY_BY_NOTE = new Map(GENERAL_MIDI_DRUM_NOTES.map(({ note, family }) => [note, family]));
const FAMILY_BY_PAD = new Map(GENERAL_MIDI_DRUM_NOTES.map(({ padId, family }) => [padId, family]));

export function drumFamilyForNote(note: number): DrumFamily | null {
  return FAMILY_BY_NOTE.get(note) ?? null;
}

export function drumFamilyForPad(padId: PadId): DrumFamily | null {
  return FAMILY_BY_PAD.get(padId) ?? null;
}
