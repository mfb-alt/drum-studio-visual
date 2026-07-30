import { ListMusic, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PlayerTrackState } from "./SongPlayer";

interface TrackControlsSheetProps {
  tracks: PlayerTrackState[];
  onMute: (trackId: number) => void;
  onUnmute: (trackId: number) => void;
  onSolo: (trackId: number, solo: boolean) => void;
}

export function TrackControlsSheet({ tracks, onMute, onUnmute, onSolo }: TrackControlsSheetProps) {
  if (tracks.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <ListMusic className="h-4 w-4" aria-hidden />
          Pistas
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Pistas</SheetTitle>
          <SheetDescription>
            Silencia o deja una pista en solo sin modificar la canción importada.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {tracks.map((track) => (
            <div key={track.id} className="rounded-xl border border-border bg-card/50 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{track.name}</p>
                <p className="truncate text-xs text-muted-foreground">{track.instrument}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={track.muted ? "secondary" : "outline"}
                  className="h-8 flex-1 text-xs"
                  onClick={() => (track.muted ? onUnmute(track.id) : onMute(track.id))}
                >
                  {track.muted ? (
                    <VolumeX className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {track.muted ? "Silenciada" : "Audible"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={track.solo ? "default" : "outline"}
                  className="h-8 flex-1 text-xs"
                  aria-pressed={track.solo}
                  onClick={() => onSolo(track.id, !track.solo)}
                >
                  Solo
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
