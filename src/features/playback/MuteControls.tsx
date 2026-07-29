import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DRUM_FAMILIES, type DrumFamily } from "@/features/midi/drumFamilies";

interface MuteControlsProps {
  disabled?: boolean;
  mutedFamilies: DrumFamily[];
  hideMutedVisuals: boolean;
  onToggle: (family: DrumFamily) => void;
  onRestoreAll: () => void;
  onMuteAll: () => void;
  onHideMutedVisualsChange: (value: boolean) => void;
}

export function MuteControls({
  disabled = false,
  mutedFamilies,
  hideMutedVisuals,
  onToggle,
  onRestoreAll,
  onMuteAll,
  onHideMutedVisualsChange,
}: MuteControlsProps) {
  const allMuted = mutedFamilies.length === DRUM_FAMILIES.length;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/60 px-5 py-2.5">
      <span className="mr-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <VolumeX className="h-3.5 w-3.5" aria-hidden />
        Silenciar piezas
      </span>

      {DRUM_FAMILIES.map(({ id, label }) => {
        const muted = mutedFamilies.includes(id);
        return (
          <Button
            key={id}
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled}
            aria-pressed={muted}
            aria-label={`${label}: ${muted ? "silenciada" : "audible"}`}
            onClick={() => onToggle(id)}
            className={cn(
              "h-8 gap-1.5 rounded-full px-3 text-xs",
              muted && "bg-destructive/15 text-destructive hover:bg-destructive/20 hover:text-destructive",
            )}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
            {label}
          </Button>
        );
      })}

      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || mutedFamilies.length === 0}
          onClick={onRestoreAll}
          className="h-8 gap-1.5 rounded-full px-3 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Restaurar todas
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || allMuted}
          onClick={onMuteAll}
          className="h-8 rounded-full px-3 text-xs"
        >
          Silenciar batería completa
        </Button>
      </div>

      <label className="flex basis-full items-center justify-end gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
        Ocultar también en la guía visual
        <Switch
          checked={hideMutedVisuals}
          disabled={disabled}
          onCheckedChange={onHideMutedVisualsChange}
          aria-label="Ocultar también en la guía visual"
        />
      </label>
    </div>
  );
}
