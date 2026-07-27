import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { midiParser } from "./midiParser";
import type { ParsedMidi } from "./types";

interface MidiImportButtonProps {
  onLoaded: (midi: ParsedMidi) => void;
}

/** Only entry point for MIDI files. Parsing lives in MidiParser. */
export function MidiImportButton({ onLoaded }: MidiImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".mid,.midi,audio/midi,audio/x-midi"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (!/\.midi?$/i.test(file.name)) {
            setError("Formato no válido. Usa un archivo .mid o .midi.");
            return;
          }
          setError(null);
          setLoading(true);
          try {
            onLoaded(await midiParser.parseFile(file));
          } catch {
            setError("No se pudo leer el archivo MIDI.");
          } finally {
            setLoading(false);
          }
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" aria-hidden />
        Importar MIDI
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}