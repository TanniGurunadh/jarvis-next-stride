import { useCallback, useEffect, useState } from "react";
import {
  completeStudyTask,
  deriveMission,
  deriveProgress,
  fetchFocusSessions,
  fetchQuizAttempts,
  fetchStudyTasks,
} from "@/lib/jarvis/repository";
import {
  EMPTY_PROGRESS,
  NO_MISSION,
  type Mission,
  type Progress,
} from "@/lib/jarvis/types";

/** Real mission + progress data. No study plan/activity means an explicit empty state. */
export function useJarvisData() {
  const [mission, setMission] = useState<Mission>(NO_MISSION);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const [tasks, attempts, sessions] = await Promise.all([
      fetchStudyTasks(),
      fetchQuizAttempts(),
      fetchFocusSessions(),
    ]);
    const firstError = tasks.error ?? attempts.error ?? sessions.error;
    setError(firstError ?? "");
    setMission(deriveMission(tasks.data ?? []));
    setProgress(deriveProgress(tasks.data ?? [], attempts.data ?? [], sessions.data ?? []));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const completeMission = useCallback(
    async (taskId: string) => {
      const { error: completionError } = await completeStudyTask(taskId);
      if (completionError) {
        setError(completionError);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh],
  );

  return { mission, progress, loading, error, refresh, completeMission };
}
