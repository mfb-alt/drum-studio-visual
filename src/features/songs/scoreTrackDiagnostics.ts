import type * as alphaTab from "@coderline/alphatab";

const DRUM_NAME_PATTERN =
  /\b(drum|drums|drumkit|percussion|percusi[oó]n|bater[ií]a|kit|caj[oó]n)\b/i;

const GM_PROGRAM_FAMILIES = [
  "Piano",
  "Percusión cromática",
  "Órgano",
  "Guitarra",
  "Bajo",
  "Cuerdas",
  "Ensemble",
  "Metales",
  "Viento-madera",
  "Flautas",
  "Sintetizador lead",
  "Sintetizador pad",
  "Efectos de sintetizador",
  "Instrumentos étnicos",
  "Percusión melódica",
  "Efectos",
] as const;

export function describeProgram(program: number): string {
  const normalizedProgram = Math.max(0, Math.min(127, Math.trunc(program)));
  const family = GM_PROGRAM_FAMILIES[Math.floor(normalizedProgram / 8)];
  return `${family ?? "Programa MIDI"} · ${normalizedProgram}`;
}

export function isPercussionTrack(track: alphaTab.model.Track): boolean {
  if (track.isPercussion || track.staves.some((staff) => staff.isPercussion)) return true;
  if (
    track.playbackInfo.primaryChannel === 9 ||
    track.playbackInfo.secondaryChannel === 9 ||
    track.playbackInfo.bank === 128
  ) {
    return true;
  }
  if (track.percussionArticulations.length > 0) return true;
  return DRUM_NAME_PATTERN.test(`${track.name} ${track.shortName}`);
}

export function resolveEventTrack(
  event: alphaTab.midi.NoteOnEvent,
  tracks: alphaTab.model.Track[],
): alphaTab.model.Track | null {
  const directTrack = tracks.find(
    (track) =>
      track.index === event.track &&
      (track.playbackInfo.primaryChannel === event.channel ||
        track.playbackInfo.secondaryChannel === event.channel),
  );
  if (directTrack) return directTrack;

  const channelMatches = tracks.filter(
    (track) =>
      track.playbackInfo.primaryChannel === event.channel ||
      track.playbackInfo.secondaryChannel === event.channel,
  );
  if (channelMatches.length === 1) return channelMatches[0];
  return tracks.find((track) => track.index === event.track) ?? null;
}
