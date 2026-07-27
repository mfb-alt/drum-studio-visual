import { useCallback, useEffect, useRef, useState } from "react";
import { playPad } from "@/features/audio/audioEngine";
import { TD1KV_PADS } from "./kitConfig";
import type { PadDefinition, PadId } from "./types";

const FLASH_MS = 180;

export function useKitTrigger() {
  const [activePads, setActivePads] = useState<PadId[]>([]);
  const timers = useRef(new Map<PadId, ReturnType<typeof setTimeout>>());

  const trigger = useCallback((pad: PadDefinition) => {
    playPad(pad.id);
    setActivePads((current) => (current.includes(pad.id) ? current : [...current, pad.id]));

    const existing = timers.current.get(pad.id);
    if (existing) clearTimeout(existing);
    timers.current.set(
      pad.id,
      setTimeout(() => {
        timers.current.delete(pad.id);
        setActivePads((current) => current.filter((id) => id !== pad.id));
      }, FLASH_MS),
    );
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const pad = TD1KV_PADS.find((item) => item.keyboardKey === event.key.toLowerCase());
      if (!pad) return;
      event.preventDefault();
      trigger(pad);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [trigger]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  return { activePads, trigger };
}