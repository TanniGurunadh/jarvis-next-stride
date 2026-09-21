import { useCallback, useState } from "react";
import { buildQuizResult, generateQuiz, type QuizRequest } from "@/lib/jarvis/quiz";
import { saveQuizAttempt } from "@/lib/jarvis/repository";
import type { Quiz, QuizResult } from "@/lib/jarvis/types";

interface QuizState {
  quiz: Quiz | null;
  answers: (number | null)[];
  currentIndex: number;
  selected: number | null;
  result: QuizResult | null;
  generating: boolean;
  error: string;
  saveError: string;
}

const initialState: QuizState = {
  quiz: null,
  answers: [],
  currentIndex: 0,
  selected: null,
  result: null,
  generating: false,
  error: "",
  saveError: "",
};

export function useQuiz(onCompleted?: () => void) {
  const [state, setState] = useState<QuizState>(initialState);

  /** Full reset: questions, index, selection, score, completion and previous result. */
  const resetQuiz = useCallback(() => setState(initialState), []);

  const startQuiz = useCallback(async (request: QuizRequest) => {
    setState({ ...initialState, generating: true });
    const { data, error } = await generateQuiz(request);
    if (error || !data) {
      setState({ ...initialState, error: error ?? "Could not generate the quiz." });
      return;
    }
    setState({
      ...initialState,
      quiz: data,
      answers: Array.from({ length: data.questions.length }, () => null),
    });
  }, []);

  const selectOption = useCallback((index: number) => {
    setState((prev) => (prev.result ? prev : { ...prev, selected: index }));
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev.quiz || prev.selected === null) return prev;
      const answers = [...prev.answers];
      answers[prev.currentIndex] = prev.selected;
      const isLast = prev.currentIndex === prev.quiz.questions.length - 1;
      if (!isLast) {
        return { ...prev, answers, currentIndex: prev.currentIndex + 1, selected: null };
      }
      const result = buildQuizResult(prev.quiz, answers);
      void saveQuizAttempt(result).then(({ error }) => {
        if (error) setState((current) => ({ ...current, saveError: error }));
        else onCompleted?.();
      });
      return { ...prev, answers, result };
    });
  }, [onCompleted]);

  const question = state.quiz?.questions[state.currentIndex] ?? null;

  return {
    ...state,
    question,
    totalQuestions: state.quiz?.questions.length ?? 0,
    startQuiz,
    resetQuiz,
    selectOption,
    nextQuestion,
  };
}
