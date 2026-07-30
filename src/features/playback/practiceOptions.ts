import { drumFamilyForNote, type DrumFamily } from "@/features/midi/drumFamilies";

export interface PracticeOptions {
  song: boolean;
  drums: boolean;
  metronome: boolean;
  visualGuide: boolean;
  mutedFamilies: DrumFamily[];
}

export function createDefaultPracticeOptions(): PracticeOptions {
  return {
    song: true,
    drums: true,
    metronome: false,
    visualGuide: true,
    mutedFamilies: [],
  };
}

export function shouldPlayDrumNote(note: number, options: PracticeOptions): boolean {
  if (!options.drums) return false;
  const family = drumFamilyForNote(note);
  return family === null || !options.mutedFamilies.includes(family);
}
