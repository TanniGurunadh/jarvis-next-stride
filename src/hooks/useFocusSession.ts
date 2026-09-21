import { useCallback, useEffect, useRef, useState } from "react";
import { endFocusSession, startFocusSession } from "@/lib/jarvis/repository";

/** Focus session timer + persistence. Sessions are only recorded from user actions. */
export function useFocusSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  const start = useCallback(async (missionTaskId: string | null) => {
    setError("");
    setElapsed(0);
    setTaskId(missionTaskId);
    const { data, error: startError } = await startFocusSession(missionTaskId);
    if (startError) setError(startError);
    setSessionId(data?.id ?? null);
    setRunning(true);
  }, []);

  const stop = useCallback(
    async (completed: boolean) => {
      setRunning(false);
      const duration = elapsed;
      if (sessionId) {
        const { error: endError } = await endFocusSession(sessionId, duration, completed);
        if (endError) setError(endError);
      }
      setSessionId(null);
      return { taskId, duration, completed };
    },
    [elapsed, sessionId, taskId],
  );

  return { running, elapsed, error, taskId, start, stop };
}
