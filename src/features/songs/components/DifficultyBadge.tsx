import { cn } from "@/lib/utils";
import { DIFFICULTY_LABEL, type Difficulty } from "../types";

const STYLES: Record<Difficulty, string> = {
  easy: "border-accent/40 text-accent",
  medium: "border-amber-400/40 text-amber-300",
  hard: "border-rose-400/40 text-rose-300",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide",
        STYLES[difficulty],
      )}
    >
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}
