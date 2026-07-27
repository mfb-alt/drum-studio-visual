import type { PadId } from "@/features/kit/types";
import { VOICES } from "./voices";

/**
 * Minimal Web Audio playback layer.
 * Kept isolated so it can later be swapped for sampled kits.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);

    const length = Math.floor(ctx.sampleRate * 2);
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMasterVolume(value: number) {
  const audio = getContext();
  if (audio && master) master.gain.value = Math.min(1, Math.max(0, value));
}

export function playPad(id: PadId, velocity = 1) {
  const audio = getContext();
  if (!audio || !master || !noiseBuffer) return;

  const voice = VOICES[id];
  const now = audio.currentTime;
  const out = audio.createGain();
  out.gain.value = voice.gain * velocity;
  out.connect(master);

  if (voice.tone > 0) {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(voice.tone, now);
    osc.frequency.exponentialRampToValueAtTime(voice.toneEnd, now + voice.decay);
    const env = audio.createGain();
    env.gain.setValueAtTime(1, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + voice.decay);
    osc.connect(env).connect(out);
    osc.start(now);
    osc.stop(now + voice.decay + 0.05);
  }

  if (voice.noise > 0) {
    const source = audio.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = audio.createBiquadFilter();
    filter.type = voice.color > 5000 ? "highpass" : "bandpass";
    filter.frequency.value = voice.color;
    const env = audio.createGain();
    env.gain.setValueAtTime(voice.noise, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + voice.decay);
    source.connect(filter).connect(env).connect(out);
    source.start(now);
    source.stop(now + voice.decay + 0.05);
  }
}