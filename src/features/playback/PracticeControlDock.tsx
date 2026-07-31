import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pause,
  Play,
  Repeat,
  Settings2,
  SkipBack,
  SkipForward,
  Square,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "@/features/songs/types";
import type { SongPlayer } from "./SongPlayer";
import { LoopControls } from "./LoopControls";
import { changeLoopEnabled } from "./loopControlActions";
import { MuteControls } from "./MuteControls";
import { PracticeOptionsControls } from "./PracticeOptionsControls";

interface PracticeControlDockProps {
  disabled: boolean;
  player: SongPlayer;
}

export function PracticeControlDock({ disabled, player }: PracticeControlDockProps) {
  const currentMeasure = Math.min(player.barIndex + 1, player.barCount);

  const toggleLoop = (enabled: boolean) =>
    changeLoopEnabled({
      enabled,
      loop: player.loop,
      currentMeasure,
      barCount: player.barCount,
      snapToBars: player.snapToBars,
      onRangeChange: player.setLoopRange,
      onChange: player.setLoop,
    });

  const loopDetails = (
    <LoopControls
      disabled={disabled}
      loop={player.loop}
      barIndex={player.barIndex}
      barCount={player.barCount}
      positionSec={player.positionSec}
      hasBarGrid={player.hasBarGrid}
      snapToBars={player.snapToBars}
      onSnapChange={player.setSnapToBars}
      onRangeChange={player.setLoopRange}
      onChange={player.setLoop}
      showToggle={false}
      embedded
    />
  );

  const muteControls =
    player.practiceOptions.drums && player.supportsDrumFamilyMute ? (
      <MuteControls
        disabled={disabled}
        mutedFamilies={player.practiceOptions.mutedFamilies}
        onToggle={player.toggleMutedFamily}
        onRestoreAll={player.restoreAllPieces}
        onMuteAll={player.muteAllPieces}
      />
    ) : (
      <p className="text-sm text-muted-foreground">
        Activa “Escuchar batería” para gestionar las piezas silenciadas.
      </p>
    );

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.18)] backdrop-blur md:left-60">
        <div className="hidden min-h-16 items-center gap-3 px-4 py-2 xl:flex">
          <TransportControls
            disabled={disabled}
            canStepBack={player.canStepBack}
            canStepForward={player.canStepForward}
            onPreviousBar={player.previousBar}
            onPlay={player.play}
            onPause={player.pause}
            onStop={player.stop}
            onNextBar={player.nextBar}
          />

          <SpeedButtons disabled={disabled} speed={player.speed} onChange={player.setSpeed} />

          <Popover>
            <div className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5">
              <Repeat
                className={cn(
                  "h-4 w-4",
                  player.loop.enabled ? "text-accent" : "text-muted-foreground",
                )}
                aria-hidden
              />
              <label className="flex items-center gap-2 whitespace-nowrap text-xs">
                Repetir fragmento
                <Switch
                  checked={player.loop.enabled}
                  disabled={disabled}
                  onCheckedChange={toggleLoop}
                  aria-label="Repetir fragmento"
                />
              </label>
              {player.loop.enabled ? (
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-full px-2 text-[11px]"
                  >
                    Ajustar
                  </Button>
                </PopoverTrigger>
              ) : null}
            </div>
            <PopoverContent side="top" align="center" className="w-[34rem] max-w-[90vw]">
              {loopDetails}
            </PopoverContent>
          </Popover>

          <PracticeOptionsControls
            disabled={disabled}
            options={player.practiceOptions}
            onChange={player.setPracticeOption}
            compact
            showTitle={false}
            shortLabels
          />

          <div className="ml-auto flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="rounded-full">
                  <VolumeX aria-hidden />
                  Silenciar piezas
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-[38rem] max-w-[90vw]">
                {muteControls}
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Más controles de reproducción"
                >
                  <MoreHorizontal aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-80">
                <AdditionalTransport disabled={disabled} player={player} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid min-h-16 grid-cols-[auto_1fr_1fr_1fr] items-center gap-1 px-2 py-2 xl:hidden">
          <TransportControls
            disabled={disabled}
            canStepBack={player.canStepBack}
            canStepForward={player.canStepForward}
            onPreviousBar={player.previousBar}
            onPlay={player.play}
            onPause={player.pause}
            onStop={player.stop}
            onNextBar={player.nextBar}
            compact
          />
          <MobileSpeed disabled={disabled} speed={player.speed} onChange={player.setSpeed} />
          <Button
            type="button"
            variant={player.loop.enabled ? "secondary" : "ghost"}
            disabled={disabled}
            aria-pressed={player.loop.enabled}
            onClick={() => toggleLoop(!player.loop.enabled)}
            className={cn(
              "h-11 min-w-0 flex-col gap-0.5 rounded-xl px-1 text-[11px]",
              player.loop.enabled && "text-accent",
            )}
          >
            <Repeat aria-hidden />
            Repetir
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-11 min-w-0 flex-col gap-0.5 rounded-xl px-1 text-[11px]"
              >
                <Settings2 aria-hidden />
                Opciones
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85dvh] overflow-y-auto rounded-t-2xl px-4 pb-6 pt-5"
            >
              <SheetHeader className="pr-8 text-left">
                <SheetTitle>Opciones de práctica</SheetTitle>
                <SheetDescription>
                  Ajusta la reproducción sin perder tu posición ni selección.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-5">
                <PracticeOptionsControls
                  disabled={disabled}
                  options={player.practiceOptions}
                  onChange={player.setPracticeOption}
                  compact
                  showTitle={false}
                />
                <section className="space-y-2">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Silenciar piezas
                  </h3>
                  {muteControls}
                </section>
                {player.loop.enabled ? (
                  <section className="space-y-2 border-t border-border pt-4">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Ajustes del fragmento
                    </h3>
                    {loopDetails}
                  </section>
                ) : null}
                <section className="border-t border-border pt-4">
                  <AdditionalTransport disabled={disabled} player={player} />
                </section>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}

function TransportControls({
  disabled,
  canStepBack,
  canStepForward,
  onPreviousBar,
  onPlay,
  onPause,
  onStop,
  onNextBar,
  compact = false,
}: {
  disabled: boolean;
  canStepBack: boolean;
  canStepForward: boolean;
  onPreviousBar: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNextBar: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1", compact && "gap-0")}>
      <TransportControl
        label="Retroceder un compás"
        disabled={disabled || !canStepBack}
        onClick={onPreviousBar}
        compact={compact}
      >
        <ChevronLeft aria-hidden />
      </TransportControl>
      <TransportControl label="Reproducir" disabled={disabled} onClick={onPlay} compact={compact}>
        <Play aria-hidden />
      </TransportControl>
      <TransportControl label="Pausa" disabled={disabled} onClick={onPause} compact={compact}>
        <Pause aria-hidden />
      </TransportControl>
      <TransportControl label="Detener" disabled={disabled} onClick={onStop} compact={compact}>
        <Square aria-hidden />
      </TransportControl>
      <TransportControl
        label="Avanzar un compás"
        disabled={disabled || !canStepForward}
        onClick={onNextBar}
        compact={compact}
      >
        <ChevronRight aria-hidden />
      </TransportControl>
    </div>
  );
}

function TransportControl({
  label,
  disabled,
  onClick,
  compact,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={label === "Reproducir" ? "default" : "ghost"}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("rounded-full", compact && "h-10 w-8 rounded-xl")}
    >
      {children}
    </Button>
  );
}

function SpeedButtons({
  disabled,
  speed,
  onChange,
}: {
  disabled: boolean;
  speed: PlaybackSpeed;
  onChange: (speed: PlaybackSpeed) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border p-1">
      <span className="pl-2 pr-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        Velocidad
      </span>
      {PLAYBACK_SPEEDS.map((value) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          aria-pressed={value === speed}
          onClick={() => onChange(value)}
          className={cn(
            "h-7 rounded-full px-2 text-[11px]",
            value === speed && "bg-accent/15 text-accent",
          )}
        >
          {value * 100} %
        </Button>
      ))}
    </div>
  );
}

function MobileSpeed({
  disabled,
  speed,
  onChange,
}: {
  disabled: boolean;
  speed: PlaybackSpeed;
  onChange: (speed: PlaybackSpeed) => void;
}) {
  return (
    <label className="flex h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px]">
      <span className="text-muted-foreground">Velocidad</span>
      <select
        value={speed}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value) as PlaybackSpeed)}
        aria-label="Velocidad de reproducción"
        className="h-6 rounded-md border border-border bg-background px-1 font-mono text-xs text-foreground"
      >
        {PLAYBACK_SPEEDS.map((value) => (
          <option key={value} value={value}>
            {value * 100} %
          </option>
        ))}
      </select>
    </label>
  );
}

function AdditionalTransport({ disabled, player }: PracticeControlDockProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Navegación y cuenta atrás
      </p>
      <div className="flex items-center justify-center gap-1">
        <IconButton
          label="Ir al inicio"
          disabled={disabled || !player.canGoToStart}
          onClick={player.goToStart}
        >
          <SkipBack aria-hidden />
        </IconButton>
        <IconButton
          label="Ir al final"
          disabled={disabled || !player.canGoToEnd}
          onClick={player.goToEnd}
        >
          <SkipForward aria-hidden />
        </IconButton>
      </div>
      <label className="flex items-center justify-between gap-3 text-sm">
        Cuenta atrás
        <select
          value={player.countInBars}
          disabled={disabled}
          onChange={(event) => player.setCountInBars(Number(event.target.value) as 0 | 1 | 2)}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
        >
          <option value={0}>Desactivada</option>
          <option value={1}>1 compás</option>
          <option value={2}>2 compases</option>
        </select>
      </label>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-full"
    >
      {children}
    </Button>
  );
}
