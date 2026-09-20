import { BrainCircuit } from "lucide-react";

export function JarvisCore({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? "jarvis-core jarvis-core-small" : "jarvis-core"} aria-label="JARVIS AI core online">
      <span className="core-ring core-ring-one" />
      <span className="core-ring core-ring-two" />
      <span className="core-ring core-ring-three" />
      <span className="core-node core-node-one" />
      <span className="core-node core-node-two" />
      <span className="core-center">
        <span className="core-triangle" />
        <BrainCircuit className="core-brain" strokeWidth={1.25} />
      </span>
    </div>
  );
}
