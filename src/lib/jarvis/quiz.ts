// Structured MCQ generation on top of the EXISTING jarvis-ask Edge Function.
// jarvis-ask itself is unchanged; we send a strict JSON instruction and validate the reply.

import { invokeFunction } from "./supabase-rest";
import type { ApiResult } from "./supabase-rest";
import type { Difficulty, Quiz, QuizQuestion, QuizResult } from "./types";

export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 20;

export interface QuizRequest {
  topic: string;
  count: number;
  difficulty: Difficulty;
}

export function validateQuizRequest(request: QuizRequest): string | null {
  if (!request.topic.trim()) return "Please enter a topic for the quiz.";
  if (!Number.isInteger(request.count) || request.count < MIN_QUESTIONS || request.count > MAX_QUESTIONS) {
    return `Please choose between ${MIN_QUESTIONS} and ${MAX_QUESTIONS} questions.`;
  }
  return null;
}

function buildPrompt({ topic, count, difficulty }: QuizRequest): string {
  return [
    `Create a ${difficulty} difficulty multiple-choice quiz about "${topic}" with exactly ${count} questions.`,
    "Reply with RAW JSON ONLY, no markdown fences and no commentary, in exactly this shape:",
    '{"topic":"...","questions":[{"question":"...","options":["a","b","c","d"],"correctAnswer":0,"explanation":"..."}]}',
    "Rules: each question must have exactly 4 distinct options; correctAnswer is the 0-based index of the correct option; explanation is one or two sentences.",
  ].join("\n");
}

function stripFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1] ?? text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return body.trim();
  return body.slice(start, end + 1);
}

function parseQuestion(value: unknown): QuizQuestion | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const question = typeof raw["question"] === "string" ? raw["question"].trim() : "";
  const options = Array.isArray(raw["options"])
    ? raw["options"].filter((option): option is string => typeof option === "string" && option.trim() !== "")
    : [];
  const correctAnswer = typeof raw["correctAnswer"] === "number" ? raw["correctAnswer"] : Number.NaN;
  const explanation = typeof raw["explanation"] === "string" ? raw["explanation"].trim() : "";
  if (!question || options.length < 2) return null;
  if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) return null;
  return { question, options, correctAnswer, explanation };
}

export function parseQuiz(text: string, request: QuizRequest): Quiz | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFences(text));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const raw = parsed as Record<string, unknown>;
  const list = Array.isArray(raw["questions"]) ? raw["questions"] : [];
  const questions = list
    .map(parseQuestion)
    .filter((entry): entry is QuizQuestion => entry !== null)
    .slice(0, request.count);
  if (questions.length === 0) return null;
  const topic = typeof raw["topic"] === "string" && raw["topic"].trim() ? raw["topic"].trim() : request.topic.trim();
  return { topic, difficulty: request.difficulty, questions };
}

/** Generates a validated quiz. Malformed AI output surfaces as an error, never as broken questions. */
export async function generateQuiz(request: QuizRequest): Promise<ApiResult<Quiz>> {
  const invalid = validateQuizRequest(request);
  if (invalid) return { data: null, error: invalid };

  const { data, error } = await invokeFunction<{ answer?: string }>("jarvis-ask", {
    question: buildPrompt(request),
  });
  if (error) return { data: null, error };
  const answer = data?.answer;
  if (!answer) return { data: null, error: "JARVIS returned an empty response. Please try again." };

  const quiz = parseQuiz(answer, request);
  if (!quiz) {
    return { data: null, error: "JARVIS returned questions in an unexpected format. Please try again." };
  }
  return { data: quiz, error: null };
}

export function buildQuizResult(
  quiz: Quiz,
  answers: (number | null)[],
): QuizResult {
  const correctAnswers = quiz.questions.reduce(
    (total, question, index) => (answers[index] === question.correctAnswer ? total + 1 : total),
    0,
  );
  const totalQuestions = quiz.questions.length;
  return {
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    score: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    completedAt: new Date().toISOString(),
  };
}
