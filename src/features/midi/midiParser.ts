import { Midi } from "@tonejs/midi";
import { DrumMapper, defaultDrumMapper } from "./drumMapper";
import type { DrumEvent, ParsedMidi } from "./types";

/** General MIDI percussion channel (channel 10, 0-based index 9). */
export const GM_DRUM_CHANNEL = 9;

/**
 * Reads .mid/.midi files and returns a clean, UI-agnostic structure.
 * Nothing from @tonejs/midi escapes this module.
 */
export class MidiParser {
  constructor(private mapper: DrumMapper = defaultDrumMapper) {}

  async parseFile(file: File): Promise<ParsedMidi> {
    const buffer = await file.arrayBuffer();
    return this.parseArrayBuffer(buffer, file.name);
  }

  parseArrayBuffer(buffer: ArrayBuffer, fileName = "untitled.mid"): ParsedMidi {
    const midi = new Midi(buffer);

    const events: DrumEvent[] = [];
    midi.tracks.forEach((track, index) => {
      track.notes.forEach((note) => {
        events.push({
          timeSec: note.time,
          note: note.midi,
          padId: this.mapper.toPad(note.midi),
          velocity: note.velocity,
          track: index,
          channel: track.channel,
        });
      });
    });
    events.sort((a, b) => a.timeSec - b.timeSec);

    const tempos = midi.header.tempos.map((tempo) => ({
      timeSec: midi.header.ticksToSeconds(tempo.ticks),
      bpm: tempo.bpm,
    }));
    const timeSignatures = midi.header.timeSignatures.map((signature) => ({
      timeSec: midi.header.ticksToSeconds(signature.ticks),
      numerator: signature.timeSignature[0],
      denominator: signature.timeSignature[1],
    }));

    const bpm = Math.round(tempos[0]?.bpm ?? 120);
    const durationSec = midi.duration;
    const numerator = timeSignatures[0]?.numerator ?? 4;
    const denominator = timeSignatures[0]?.denominator ?? 4;
    const secondsPerBeat = 60 / (bpm || 120);
    const secondsPerMeasure = secondsPerBeat * numerator * (4 / denominator);
    const measures = secondsPerMeasure > 0 ? Math.ceil(durationSec / secondsPerMeasure) : 0;

    const drumEvents = events.filter(
      (event) => event.channel === GM_DRUM_CHANNEL && event.padId !== null,
    );
    const drumTrackDetected = drumEvents.length > 0;

    return {
      fileName,
      durationSec,
      bpm,
      tempos,
      timeSignatures,
      measures,
      tracks: midi.tracks.map((track, index) => ({
        index,
        name: track.name || `Pista ${index + 1}`,
        channel: track.channel,
        noteCount: track.notes.length,
        isDrumTrack: track.channel === 9,
      })),
      events,
      drumEvents,
      drumTrackDetected,
      drumChannel: drumTrackDetected ? GM_DRUM_CHANNEL : null,
      drumTrackIndices: [...new Set(drumEvents.map((event) => event.track))],
    };
  }
}

export const midiParser = new MidiParser();

/**
 * Fallback for files that do not flag the percussion channel: rebuild the
 * drum timeline from a manually chosen track.
 */
export function withManualDrumTrack(midi: ParsedMidi, trackIndex: number): ParsedMidi {
  const drumEvents = midi.events.filter((event) => event.track === trackIndex && event.padId !== null);
  const channel = midi.tracks.find((track) => track.index === trackIndex)?.channel ?? null;
  return {
    ...midi,
    drumEvents,
    drumTrackDetected: false,
    drumChannel: channel,
    drumTrackIndices: [trackIndex],
  };
}