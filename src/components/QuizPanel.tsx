import { useState } from "react";
import { CheckCircle2, HelpCircle, RotateCcw, Zap } from "lucide-react";
import { useQuiz } from "@/hooks/useQuiz";
import { MAX_QUESTIONS, MIN_QUESTIONS, validateQuizRequest } from "@/lib/jarvis/quiz";
import type { Difficulty } from "@/lib/jarvis/types";

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export function QuizPanel({ onCompleted }: { onCompleted?: () => void }) {
  const quizState = useQuiz(onCompleted);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("5");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [formError, setFormError] = useState("");

  const {
    quiz, question, currentIndex, totalQuestions, selected, result,
    generating, error, saveError, startQuiz, resetQuiz, selectOption, nextQuestion,
  } = quizState;

  const submit = () => {
    const request = { topic: topic.trim(), count: Number(count), difficulty };
    const invalid = validateQuizRequest(request);
    setFormError(invalid ?? "");
    if (invalid) return;
    void startQuiz(request);
  };

  const newQuiz = () => {
    resetQuiz();
    setFormError("");
  };

  return (
    <section id="quiz-me" className="glass-panel mx-auto mt-5 max-w-4xl scroll-mt-24 p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <p className="eyebrow">QUIZ ME</p>
        {(quiz || result) && (
          <button className="suggestion-chip" onClick={newQuiz}>
            <RotateCcw className="mr-1 inline h-3.5 w-3.5" />New quiz
          </button>
        )}
      </div>

      {/* Setup */}
      {!quiz && !generating && (
        <div className="mt-4 space-y-4">
          <h2 className="text-2xl font-semibold">Practice with AI-generated questions</h2>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
            <input
              className="jarvis-input"
              placeholder="Topic (e.g. Java inheritance)"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
            />
            <input
              className="jarvis-input"
              type="number"
              min={MIN_QUESTIONS}
              max={MAX_QUESTIONS}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              aria-label="Number of questions"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((level) => (
              <button
                key={level}
                className="suggestion-chip"
                aria-pressed={difficulty === level}
                style={difficulty === level ? { borderColor: "var(--color-cyan)", color: "var(--color-cyan)" } : undefined}
                onClick={() => setDifficulty(level)}
              >
                {level}
              </button>
            ))}
          </div>
          {(formError || error) && (
            <div className="error-panel"><HelpCircle className="h-4 w-4" /><span>{formError || error}</span></div>
          )}
          <button className="primary-cta" onClick={submit}>
            <Zap className="h-4 w-4" /> Generate quiz
          </button>
        </div>
      )}

      {generating && <p className="mt-5 text-sm text-cyan">JARVIS is writing your questions...</p>}

      {/* One question at a time */}
      {quiz && question && !result && (
        <div className="mt-5">
          <p className="panel-title">
            {quiz.topic.toUpperCase()} · QUESTION {currentIndex + 1} OF {totalQuestions}
          </p>
          <h3 className="mt-3 text-lg font-semibold">{question.question}</h3>
          <div className="mt-4 space-y-2">
            {question.options.map((option, index) => (
              <button
                key={`${option}-${index}`}
                className="action-card w-full text-left"
                aria-pressed={selected === index}
                style={selected === index ? { borderColor: "var(--color-cyan)" } : undefined}
                onClick={() => selectOption(index)}
              >
                <span className="text-sm">{option}</span>
              </button>
            ))}
          </div>
          <button className="mission-button mt-5" disabled={selected === null} onClick={nextQuestion}>
            {currentIndex + 1 === totalQuestions ? "Finish quiz" : "Next question"}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="answer-panel mt-5">
          <p className="panel-title">QUIZ RESULT</p>
          <h3 className="mt-2 text-2xl font-semibold">{result.score}%</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.topic} · {result.correctAnswers} correct · {result.incorrectAnswers} incorrect ·{" "}
            {result.totalQuestions} questions
          </p>
          {saveError && (
            <p className="mt-3 text-xs text-muted-foreground">Result not saved: {saveError}</p>
          )}
          <div className="mt-4 space-y-3">
            {quiz?.questions.map((item, index) => (
              <div key={index} className="text-sm">
                <p className="font-medium">{index + 1}. {item.question}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan" />
                  {item.options[item.correctAnswer]}
                </p>
                {item.explanation && (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.explanation}</p>
                )}
              </div>
            ))}
          </div>
          <button className="primary-cta mt-5" onClick={newQuiz}>Start a new quiz</button>
        </div>
      )}
    </section>
  );
}
