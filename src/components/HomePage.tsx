import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CalendarDays, Check, Clock3, Flame, Focus, HelpCircle, MessageSquareText, Quote, RotateCcw, Send, Trophy } from "lucide-react";
import spaceHorizon from "@/assets/jarvis-space-horizon.jpg";
import { JarvisCore } from "./JarvisCore";
import { QuizPanel } from "./QuizPanel";
import { FocusPanel } from "./FocusPanel";
import { useJarvisData } from "@/hooks/useJarvisData";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/jarvis/config";

const examples = ["Explain photosynthesis in simple words", "What is the Pythagorean theorem?", "Help me revise Java inheritance"];

export function HomePage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const askRef = useRef<HTMLElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const { mission, progress, refresh, completeMission } = useJarvisData();

  const scrollTo = (element: HTMLElement | null) => element?.scrollIntoView({ behavior: "smooth", block: "center" });
  const openAsk = () => scrollTo(askRef.current);
  const askJarvis = async (suggestion?: string) => {
    const query = (suggestion ?? question).trim();
    if (!query || asking) return;
    setQuestion(query); setAnswer(""); setError(""); setAsking(true);
    // invokeFunction retries the AI service on temporary 429/5xx replies.
    const { data, error: failed } = await invokeFunction<{ answer?: string }>("jarvis-ask", { question: query });
    if (failed) setError(failed);
    else if (!data?.answer) setError("The AI returned an empty response. Please try again.");
    else setAnswer(data.answer);
    setAsking(false);
  };

  const actions = [
    { icon: CalendarDays, title: "Study Planner", text: "Create a personalized study plan.", to: "/planner" as const },
    { icon: MessageSquareText, title: "Ask JARVIS", text: "Get AI-powered answers to your doubts.", action: openAsk },
    { icon: BookOpen, title: "Quiz Me", text: "Practice with AI-generated questions.", action: () => scrollTo(quizRef.current) },
    { icon: Focus, title: "Focus Mode", text: "Stay focused and get more done.", action: () => scrollTo(focusRef.current) },
  ];

  const completionPercent = progress.completionPercent;

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="hero-scene">
        <img src={spaceHorizon} width={1920} height={1080} alt="Earth's blue horizon beneath a star-filled sky" className="hero-space-image" />
        <div className="hero-shade" />
        <p className="side-mantra left-mantra">LEARN<br />PLAN<br />PRACTICE<br />GROW</p>
        <p className="side-mantra right-mantra">MORE<br />THAN<br />A STUDY<br />ASSISTANT</p>
        <div className="page-shell relative z-10 flex min-h-[620px] flex-col items-center justify-center pb-40 pt-24 text-center sm:min-h-[690px]">
          <JarvisCore />
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[0.18em] sm:text-6xl">JARVIS</h1>
          <p className="mt-2 text-2xl font-semibold sm:text-4xl">Study Smarter. Go Further.</p>
          <p className="mt-2 text-sm tracking-[0.12em] text-muted-foreground sm:text-lg">Your Intelligent Academic Companion</p>
          <Link to="/planner" className="primary-cta mt-6">Get Started <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="page-shell relative z-20 -mt-28 pb-12 sm:-mt-32">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="JARVIS actions">
          {actions.map(({ icon: Icon, title, text, to, action }) => {
            const content = <><span className="feature-icon"><Icon /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-semibold">{title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{text}</span></span><ArrowRight className="h-5 w-5 shrink-0 text-cyan" /></>;
            return to ? <Link key={title} to={to} className="action-card">{content}</Link> : <button key={title} onClick={action} className="action-card text-left">{content}</button>;
          })}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_1.14fr_.88fr]">
          <article className="glass-card flex min-h-56 flex-col p-5">
            <div className="flex items-center justify-between">
              <p className="panel-title">TODAY'S MISSION</p>
              {mission.hasMission && <span className="priority-pill">{mission.priority.toUpperCase()} PRIORITY</span>}
            </div>
            {mission.hasMission ? (
              <>
                <div className="mt-5 flex gap-4">
                  <span className="feature-icon"><BookOpen /></span>
                  <div>
                    <h2 className="text-lg font-semibold">{mission.subject} – {mission.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{mission.duration} Minutes</p>
                    <p className="mt-3 text-sm text-muted-foreground">{mission.description}</p>
                  </div>
                </div>
                <button className="mission-button mt-auto" onClick={() => scrollTo(focusRef.current)}>
                  {mission.completed ? "Mission completed" : "Start Mission"} <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <p className="mt-5 text-sm text-muted-foreground">No mission yet. Generate a study plan and JARVIS will set today's task from it.</p>
                <Link to="/planner" className="mission-button mt-auto">Create a study plan <ArrowRight className="h-4 w-4" /></Link>
              </>
            )}
          </article>

          <article className="glass-card min-h-56 p-5">
            <div className="flex items-center justify-between"><p className="panel-title">YOUR PROGRESS</p><Link to="/planner" className="text-xs text-muted-foreground hover:text-cyan">View details →</Link></div>
            <div className="mt-5 grid grid-cols-[120px_1fr] items-center gap-5">
              <div className="progress-ring" style={{ ["--progress" as string]: `${completionPercent ?? 0}%` }}>
                <div><strong>{completionPercent === null ? "—" : `${completionPercent}%`}</strong><span>Completed</span></div>
              </div>
              <div className="space-y-3 text-sm">
                <p className="metric"><Check /> <strong>{progress.topicsCompleted}</strong><span>Topics Completed</span></p>
                <p className="metric"><Flame /> <strong>{progress.currentStreak}</strong><span>Day Streak</span></p>
                <p className="metric"><Trophy /> <strong>{progress.quizzesTaken}</strong><span>Quizzes Taken</span></p>
              </div>
            </div>
          </article>

          <article className="quote-card glass-card min-h-56 p-6"><Quote className="h-8 w-8 text-cyan/60" /><blockquote className="mt-3 font-serif text-xl italic leading-8">Discipline today creates the opportunities tomorrow.</blockquote><p className="mt-5 text-xs tracking-[0.3em] text-muted-foreground">— JARVIS</p></article>
        </section>

        <section ref={askRef} id="ask-jarvis" className="glass-panel mx-auto mt-5 max-w-4xl scroll-mt-24 p-5 sm:p-7">
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start"><JarvisCore small /><div><p className="eyebrow">ASK JARVIS</p><h2 className="mt-2 text-2xl font-semibold">What would you like to understand?</h2><p className="mt-2 text-sm text-muted-foreground">Ask a study question and receive a live AI-powered explanation.</p>
            {!answer && !asking && <div className="mt-4 flex flex-wrap gap-2">{examples.map((item) => <button key={item} className="suggestion-chip" onClick={() => askJarvis(item)}>{item}</button>)}</div>}
            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2"><input className="jarvis-input" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") askJarvis(); }} placeholder="Ask JARVIS anything..." disabled={asking} /><button className="send-button" aria-label="Send question" disabled={asking || !question.trim()} onClick={() => askJarvis()}>{asking ? <span className="loader" /> : <Send className="h-4 w-4" />}</button></div>
            {asking && <p className="mt-4 text-sm text-cyan">JARVIS is analyzing your question...</p>}
            {error && <div className="mt-4 error-panel"><HelpCircle className="h-4 w-4" /><span>{error}</span><button onClick={() => askJarvis()}><RotateCcw className="h-4 w-4" /></button></div>}
            {answer && <div className="answer-panel mt-5"><p className="panel-title">JARVIS RESPONSE</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{answer}</p></div>}
          </div></div>
        </section>

        <div ref={quizRef}><QuizPanel onCompleted={() => void refresh()} /></div>
        <div ref={focusRef}><FocusPanel mission={mission} onMissionCompleted={completeMission} /></div>

        <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border py-6 text-[10px] tracking-[0.28em] text-muted-foreground sm:flex-row"><span>BUILT FOR LEARNERS • POWERED BY AI</span><span>v1.0</span></footer>
      </div>
    </main>
  );
}
