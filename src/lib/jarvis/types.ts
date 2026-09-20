// Shared domain types for JARVIS core data (quiz, missions, focus, progress).

export type Difficulty = "easy" | "medium" | "hard";
export type Priority = "high" | "medium" | "low";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  topic: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
}

export interface QuizResult {
  topic: string;
  difficulty: Difficulty;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // percentage 0-100
  completedAt: string; // ISO timestamp
}

export interface StudyTask {
  id: string;
  planId: string | null;
  day: number;
  date: string; // YYYY-MM-DD
  subject: string;
  topic: string;
  hours: number;
  focus: string;
  isRevision: boolean;
  isBreak: boolean;
  completedAt: string | null;
}

export type Mission =
  | { hasMission: false }
  | {
      hasMission: true;
      taskId: string;
      title: string;
      subject: string;
      duration: number; // minutes
      description: string;
      priority: Priority;
      completed: boolean;
    };

export interface FocusSession {
  id: string;
  taskId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  completed: boolean;
}

export interface Progress {
  topicsCompleted: number;
  totalTasks: number;
  quizzesTaken: number;
  averageQuizScore: number | null;
  focusSessions: number;
  focusMinutes: number;
  currentStreak: number;
  completionPercent: number | null; // null when there is no valid denominator
}

export const EMPTY_PROGRESS: Progress = {
  topicsCompleted: 0,
  totalTasks: 0,
  quizzesTaken: 0,
  averageQuizScore: null,
  focusSessions: 0,
  focusMinutes: 0,
  currentStreak: 0,
  completionPercent: null,
};

export const NO_MISSION: Mission = { hasMission: false };
