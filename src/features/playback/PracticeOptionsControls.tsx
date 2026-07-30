import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { PracticeOptions } from "./practiceOptions";

type BooleanPracticeOption = "song" | "drums" | "metronome" | "visualGuide";

const OPTIONS: ReadonlyArray<{ key: BooleanPracticeOption; label: string }> = [
  { key: "song", label: "Escuchar canción" },
  { key: "drums", label: "Escuchar batería" },
  { key: "metronome", label: "Escuchar metrónomo" },
  { key: "visualGuide", label: "Mostrar guía visual" },
];

interface PracticeOptionsControlsProps {
  disabled?: boolean;
  options: PracticeOptions;
  onChange: (key: BooleanPracticeOption, value: boolean) => void;
  compact?: boolean;
  showTitle?: boolean;
  shortLabels?: boolean;
}

export function PracticeOptionsControls({
  disabled = false,
  options,
  onChange,
  compact = false,
  showTitle = true,
  shortLabels = false,
}: PracticeOptionsControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2",
        !compact && "rounded-2xl border border-border bg-card/60 px-5 py-2.5",
      )}
    >
      {showTitle ? (
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Opciones de práctica
        </span>
      ) : null}
      {OPTIONS.map(({ key, label }) => {
        const visibleLabel = shortLabels
          ? {
              song: "Canción",
              drums: "Batería",
              metronome: "Metrónomo",
              visualGuide: "Guía visual",
            }[key]
          : label;
        return (
          <label
            key={key}
            className={cn(
              "flex items-center gap-2 text-xs text-foreground",
              compact && "whitespace-nowrap",
            )}
          >
            {visibleLabel}
            <Switch
              checked={options[key]}
              disabled={disabled}
              onCheckedChange={(value) => onChange(key, value)}
              aria-label={label}
            />
          </label>
        );
      })}
    </div>
  );
}
