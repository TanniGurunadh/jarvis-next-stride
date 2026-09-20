import { BrainCircuit } from "lucide-react";

export function JarvisMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="jarvis-mark shrink-0" aria-hidden="true">
        <BrainCircuit className="h-5 w-5" strokeWidth={1.6} />
      </span>
      {!compact && <span className="font-display truncate text-xl font-semibold tracking-[0.16em] text-foreground">JARVIS</span>}
    </span>
  );
}
