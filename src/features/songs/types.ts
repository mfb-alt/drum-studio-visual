/** Placeholder domain model for the future song library. */
export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
}

export const SONGS: Song[] = [];