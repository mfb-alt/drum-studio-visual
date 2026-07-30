import { Switch } from "@/components/ui/switch";
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
}

export function PracticeOptionsControls({
  disabled = false,
  options,
  onChange,
}: PracticeOptionsControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-border bg-card/60 px-5 py-2.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Opciones de práctica
      </span>
      {OPTIONS.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-2 text-xs text-foreground">
          {label}
          <Switch
            checked={options[key]}
            disabled={disabled}
            onCheckedChange={(value) => onChange(key, value)}
            aria-label={label}
          />
        </label>
      ))}
    </div>
  );
}
