// Persistence + derivation layer. All reads/writes target the project's existing
// Supabase project (see SUPABASE_SETUP.md for the tables this expects).

import { insertRow, selectRows, updateRows } from "./supabase-rest";
import type { ApiResult } from "./supabase-rest";
import {
  EMPTY_PROGRESS,
  NO_MISSION,
  type FocusSession,
  type Mission,
  type Priority,
  type Progress,
  type QuizResult,
  type StudyTask,
} from "./types";

interface StudyTaskRow {
  id: string;
  plan_id: string | null;
  day: number;
  scheduled_date: string;
  subject: string;
  topic: string;
  hours: number | string;
  focus: string | null;
  is_revision: boolean | null;
  is_break: boolean | null;
  completed_at: string | null;
}

interface QuizAttemptRow {
  id: string;
  topic: string;
  difficulty: string | null;
  total_questions: number;
  correct_answers: number;
  score: number | string;
  completed_at: string;
}

interface FocusSessionRow {
  id: string;
  task_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  completed: boolean | null;
}

const toTask = (row: StudyTaskRow): StudyTask => ({
  id: row.id,
  planId: row.plan_id,
  day: row.day,
  date: row.scheduled_date,
  subject: row.subject,
  topic: row.topic,
  hours: Number(row.hours) || 0,
  focus: row.focus ?? "",
  isRevision: Boolean(row.is_revision),
  isBreak: Boolean(row.is_break),
  completedAt: row.completed_at,
});

const toSession = (row: FocusSessionRow): FocusSession => ({
  id: row.id,
  taskId: row.task_id,
  startedAt: row.started_at,
  endedAt: row.ended_at,
  durationSeconds: row.duration_seconds ?? 0,
  completed: Boolean(row.completed),
});

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Saves a generated study plan and its daily tasks. */
export async function saveStudyPlan(input: {
  examDate: string;
  studyHours: number;
  confidence: string;
  days: {
    day: number;
    date: string;
    subject: string;
    topic: string;
    hours: number;
    focus: string;
    isRevision: boolean;
    isBreak: boolean;
  }[];
}): Promise<ApiResult<{ planId: string }>> {
  const plan = await insertRow<{ id: string }>("study_plans", {
    exam_date: input.examDate,
    study_hours: input.studyHours,
    confidence: input.confidence,
  });
  if (plan.error || !plan.data) return { data: null, error: plan.error ?? "Could not save the study plan." };

  const tasks = input.days.map((day) => ({
    plan_id: plan.data!.id,
    day: day.day,
    scheduled_date: day.date,
    subject: day.subject,
    topic: day.topic,
    hours: day.hours,
    focus: day.focus,
    is_revision: day.isRevision,
    is_break: day.isBreak,
  }));
  const saved = await insertRow("study_tasks", tasks);
  if (saved.error) return { data: null, error: saved.error };
  return { data: { planId: plan.data.id }, error: null };
}

export async function fetchStudyTasks(): Promise<ApiResult<StudyTask[]>> {
  const { data, error } = await selectRows<StudyTaskRow>(
    "study_tasks",
    "select=*&order=scheduled_date.asc",
  );
  if (error) return { data: null, error };
  return { data: (data ?? []).map(toTask), error: null };
}

export async function fetchQuizAttempts(): Promise<ApiResult<QuizAttemptRow[]>> {
  return selectRows<QuizAttemptRow>("quiz_attempts", "select=*&order=completed_at.desc");
}

export async function fetchFocusSessions(): Promise<ApiResult<FocusSession[]>> {
  const { data, error } = await selectRows<FocusSessionRow>(
    "focus_sessions",
    "select=*&order=started_at.desc",
  );
  if (error) return { data: null, error };
  return { data: (data ?? []).map(toSession), error: null };
}

export async function saveQuizAttempt(result: QuizResult): Promise<ApiResult<{ id: string }>> {
  return insertRow<{ id: string }>("quiz_attempts", {
    topic: result.topic,
    difficulty: result.difficulty,
    total_questions: result.totalQuestions,
    correct_answers: result.correctAnswers,
    score: result.score,
    completed_at: result.completedAt,
  });
}

export async function startFocusSession(taskId: string | null): Promise<ApiResult<{ id: string }>> {
  return insertRow<{ id: string }>("focus_sessions", {
    task_id: taskId,
    started_at: new Date().toISOString(),
    completed: false,
  });
}

export async function endFocusSession(
  sessionId: string,
  durationSeconds: number,
  completed: boolean,
): Promise<ApiResult<unknown[]>> {
  return updateRows("focus_sessions", `id=eq.${sessionId}`, {
    ended_at: new Date().toISOString(),
    duration_seconds: durationSeconds,
    completed,
  });
}

/** Marks a study task complete — only ever called from an explicit user action. */
export async function completeStudyTask(taskId: string): Promise<ApiResult<unknown[]>> {
  return updateRows("study_tasks", `id=eq.${taskId}`, {
    completed_at: new Date().toISOString(),
  });
}

function priorityFor(task: StudyTask, index: number): Priority {
  if (task.isBreak) return "low";
  if (index === 0 || task.isRevision) return "high";
  return "medium";
}

/** Today's Mission: derived from real study-plan tasks, never invented. */
export function deriveMission(tasks: StudyTask[]): Mission {
  if (tasks.length === 0) return NO_MISSION;
  const today = todayIso();
  const pending = tasks.filter((task) => !task.completedAt);
  const dueToday = tasks.find((task) => task.date === today);
  const task = dueToday ?? pending[0];
  if (!task) return NO_MISSION;
  return {
    hasMission: true,
    taskId: task.id,
    title: task.topic || task.subject,
    subject: task.subject,
    duration: Math.round((task.hours || 0) * 60),
    description: task.focus || `Work through ${task.topic || task.subject}.`,
    priority: priorityFor(task, tasks.indexOf(task)),
    completed: Boolean(task.completedAt),
  };
}

function streakFrom(dates: string[]): number {
  const unique = Array.from(new Set(dates.map((value) => value.slice(0, 10)))).sort().reverse();
  if (unique.length === 0) return 0;
  const day = 86_400_000;
  const startOfToday = new Date(todayIso()).getTime();
  const first = new Date(unique[0]!).getTime();
  if (startOfToday - first > day) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const previous = new Date(unique[i - 1]!).getTime();
    const current = new Date(unique[i]!).getTime();
    if (previous - current === day) streak++;
    else break;
  }
  return streak;
}

/** Progress from actual activity only; zero/empty when there is no data. */
export function deriveProgress(
  tasks: StudyTask[],
  attempts: QuizAttemptRow[],
  sessions: FocusSession[],
): Progress {
  if (tasks.length === 0 && attempts.length === 0 && sessions.length === 0) return EMPTY_PROGRESS;
  const completedTasks = tasks.filter((task) => task.completedAt);
  const focusMinutes = Math.round(
    sessions.reduce((total, session) => total + (session.durationSeconds || 0), 0) / 60,
  );
  const scores = attempts.map((attempt) => Number(attempt.score) || 0);
  return {
    topicsCompleted: completedTasks.length,
    totalTasks: tasks.length,
    quizzesTaken: attempts.length,
    averageQuizScore: scores.length
      ? Math.round(scores.reduce((total, value) => total + value, 0) / scores.length)
      : null,
    focusSessions: sessions.filter((session) => session.completed).length,
    focusMinutes,
    currentStreak: streakFrom([
      ...completedTasks.map((task) => task.completedAt!),
      ...attempts.map((attempt) => attempt.completed_at),
      ...sessions.filter((session) => session.completed).map((session) => session.startedAt),
    ]),
    completionPercent:
      tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : null,
  };
}

export type { QuizAttemptRow };
