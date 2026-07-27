import { DrumPad } from "./DrumPad";
import { TD1KV_PADS } from "./kitConfig";
import { useKitTrigger } from "./useKitTrigger";

export function DrumKit() {
  const { activePads, trigger } = useKitTrigger();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative aspect-[4/3] w-full rounded-3xl border border-border bg-stage shadow-stage">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-stage-glow" />
        {TD1KV_PADS.map((pad) => (
          <DrumPad
            key={pad.id}
            pad={pad}
            active={activePads.includes(pad.id)}
            onHit={trigger}
          />
        ))}
      </div>
    </div>
  );
}