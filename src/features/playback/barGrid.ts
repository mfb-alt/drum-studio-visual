import type { MidiTempo, MidiTimeSignature } from "@/features/midi/types";

export interface BarGridInput {
  tempos: MidiTempo[];
  timeSignatures: MidiTimeSignature[];
  durationSec: number;
  fallbackBpm?: number;
}

const MAX_BARS = 5000;

function valueAt<T extends { timeSec: number }>(list: T[], timeSec: number): T | undefined {
  let current: T | undefined = list[0];
  for (const item of list) {
    if (item.timeSec <= timeSec + 1e-6) current = item;
    else break;
  }
  return current;
}

/**
 * Builds the absolute start time of every bar. Uses tempo + time-signature
 * changes when the file provides them and falls back to a 4/4 estimate.
 */
export function buildBarGrid({
  tempos,
  timeSignatures,
  durationSec,
  fallbackBpm = 120,
}: BarGridInput): number[] {
  if (durationSec <= 0) return [0];
  const sortedTempos = [...tempos].sort((a, b) => a.timeSec - b.timeSec);
  const sortedSignatures = [...timeSignatures].sort((a, b) => a.timeSec - b.timeSec);

  const bars: number[] = [0];
  let time = 0;
  while (time < durationSec && bars.length < MAX_BARS) {
    const bpm = valueAt(sortedTempos, time)?.bpm ?? fallbackBpm;
    const signature = valueAt(sortedSignatures, time);
    const numerator = signature?.numerator ?? 4;
    const denominator = signature?.denominator ?? 4;
    const beats = numerator * (4 / denominator);
    const barSec = (beats * 60) / (bpm > 0 ? bpm : fallbackBpm);
    if (!Number.isFinite(barSec) || barSec <= 0) break;
    time += barSec;
    if (time >= durationSec - 1e-6) break;
    bars.push(time);
  }
  return bars;
}
