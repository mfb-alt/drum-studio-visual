import type { Song } from "./types";

/** Demo data only — replaced later by real songs with MIDI files. */
export const SONGS: Song[] = [
  { id: "back-in-black", title: "Back in Black", artist: "AC/DC", difficulty: "easy", durationSec: 255, bpm: 94 },
  { id: "billie-jean", title: "Billie Jean", artist: "Michael Jackson", difficulty: "easy", durationSec: 294, bpm: 117 },
  { id: "smells-like-teen-spirit", title: "Smells Like Teen Spirit", artist: "Nirvana", difficulty: "medium", durationSec: 301, bpm: 117 },
  { id: "seven-nation-army", title: "Seven Nation Army", artist: "The White Stripes", difficulty: "easy", durationSec: 232, bpm: 124 },
  { id: "in-the-air-tonight", title: "In the Air Tonight", artist: "Phil Collins", difficulty: "medium", durationSec: 336, bpm: 96 },
  { id: "rosanna", title: "Rosanna", artist: "Toto", difficulty: "hard", durationSec: 331, bpm: 87 },
  { id: "tom-sawyer", title: "Tom Sawyer", artist: "Rush", difficulty: "hard", durationSec: 276, bpm: 88 },
  { id: "hysteria", title: "Hysteria", artist: "Muse", difficulty: "medium", durationSec: 227, bpm: 138 },
];

export function getSongById(id: string): Song | undefined {
  return SONGS.find((song) => song.id === id);
}
