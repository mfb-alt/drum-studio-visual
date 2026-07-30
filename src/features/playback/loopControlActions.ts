import type { LoopState } from "./PlaybackEngine";

export function changeLoopEnabled({
  enabled,
  loop,
  currentMeasure,
  barCount,
  snapToBars,
  onRangeChange,
  onChange,
}: {
  enabled: boolean;
  loop: LoopState;
  currentMeasure: number;
  barCount: number;
  snapToBars: boolean;
  onRangeChange?: (next: {
    startTime: number;
    endTime: number;
    enabled?: boolean;
    snap?: boolean;
  }) => void;
  onChange: (next: { enabled: boolean; startMeasure: number; endMeasure: number }) => void;
}) {
  if (!enabled) {
    onChange({
      enabled: false,
      startMeasure: loop.startMeasure,
      endMeasure: loop.endMeasure,
    });
    return;
  }
  if (loop.endTime > loop.startTime) {
    onRangeChange?.({
      startTime: loop.startTime,
      endTime: loop.endTime,
      enabled: true,
      snap: snapToBars,
    });
    return;
  }
  onChange({
    enabled: true,
    startMeasure: currentMeasure,
    endMeasure: Math.min(currentMeasure + 1, barCount),
  });
}
