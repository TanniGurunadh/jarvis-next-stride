import { Pause, Play, Square } from "lucide-react";
import { useFocusSession } from "@/hooks/useFocusSession";
import type { Mission } from "@/lib/jarvis/types";

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

interface FocusPanelProps {
  mission: Mission;
  onMissionCompleted: (taskId: string) => Promise<boolean> | void;
}

/** Focus session tied to Today's Mission. Completion is always an explicit user action. */
export function FocusPanel({ mission, onMissionCompleted }: FocusPanelProps) {
  const session = useFocusSession();
  const taskId = mission.hasMission ? mission.taskId : null;

  const finish = async (completed: boolean) => {
    const ended = await session.stop(completed);
    if (completed && ended.taskId) await onMissionCompleted(ended.taskId);
  };

  return (
    <section id="focus-mode" className="glass-panel mx-auto mt-5 max-w-4xl scroll-mt-24 p-5 sm:p-7">
      <p className="eyebrow">FOCUS MODE</p>
      {mission.hasMission ? (
        <>
          <h2 className="mt-2 text-2xl font-semibold">{mission.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mission.subject} · {mission.duration} minutes planned
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-2 text-2xl font-semibold">No mission yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a study plan first — your focus session will follow today's task.
          </p>
        </>
      )}

      <p className="mt-6 font-display text-5xl tracking-[0.12em] text-cyan">{formatClock(session.elapsed)}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {!session.running ? (
          <button className="primary-cta" onClick={() => void session.start(taskId)}>
            <Play className="h-4 w-4" /> Start focus session
          </button>
        ) : (
          <>
            <button className="mission-button" onClick={() => void finish(true)}>
              <Square className="h-4 w-4" /> Complete mission
            </button>
            <button className="suggestion-chip" onClick={() => void finish(false)}>
              <Pause className="mr-1 inline h-3.5 w-3.5" /> Stop without completing
            </button>
          </>
        )}
      </div>

      {session.error && (
        <p className="mt-4 text-xs text-muted-foreground">Session not saved: {session.error}</p>
      )}
    </section>
  );
}
