import type { PadId } from "@/features/kit/types";
import { GENERAL_MIDI_DRUM_NOTES } from "./drumFamilies";

/**
 * General MIDI percussion note -> pad of the kit.
 * Editing this map is the only thing needed to support another
 * module, a custom kit or a user-defined mapping.
 */
export type DrumMap = Readonly<Record<number, PadId>>;

export const GENERAL_MIDI_DRUM_MAP: DrumMap = Object.fromEntries(
  GENERAL_MIDI_DRUM_NOTES.map(({ note, padId }) => [note, padId]),
);

/** Stateless mapper so alternative maps can be injected later. */
export class DrumMapper {
  constructor(private map: DrumMap = GENERAL_MIDI_DRUM_MAP) {}

  /** Pad for a MIDI note, or null when the note is out of the kit. */
  toPad(note: number): PadId | null {
    return this.map[note] ?? null;
  }

  /** Returns a new mapper with some notes overridden. */
  withOverrides(overrides: Record<number, PadId>): DrumMapper {
    return new DrumMapper({ ...this.map, ...overrides });
  }

  entries(): Array<[number, PadId]> {
    return Object.entries(this.map).map(([note, pad]) => [Number(note), pad]);
  }
}

export const defaultDrumMapper = new DrumMapper();
