import { BookOpen, BrainCircuit, GraduationCap, Sparkles, Target, Users } from "lucide-react";
import { JarvisCore } from "./JarvisCore";

const values = [
  { icon: Target, title: "Our Mission", text: "Make focused, intelligent exam preparation accessible to every student." },
  { icon: BookOpen, title: "What We Build", text: "A study companion that plans, explains, prioritizes, and keeps progress visible." },
  { icon: Sparkles, title: "Why JARVIS", text: "An always-available academic intelligence designed to help students move with clarity." },
];

export function AboutPage() {
  return (
    <main className="page-top stars-bg min-h-screen">
      <section className="page-shell py-16 text-center sm:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <JarvisCore small />
          <p className="eyebrow mt-8">SYSTEM PROFILE</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-6xl">Intelligence built for <span className="text-cyan">students.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">JARVIS turns complex exam preparation into a clear, personalized path—built by IT students who understand the pressure.</p>
        </div>
      </section>
      <section className="page-shell grid gap-4 pb-16 md:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => <article key={title} className="glass-card p-6"><span className="feature-icon"><Icon /></span><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}
      </section>
      <section className="page-shell pb-24">
        <div className="glass-panel grid gap-8 p-7 md:grid-cols-[auto_1fr] md:items-center md:p-10">
          <span className="feature-icon h-16 w-16"><GraduationCap /></span>
          <div><p className="eyebrow">CREATED AT</p><h2 className="mt-2 text-2xl font-semibold">Gudlavalleru Engineering College</h2><p className="mt-2 flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4 text-cyan" /> Department of Information Technology</p><p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><BrainCircuit className="h-4 w-4 text-cyan" />Built with purpose by students, for students.</p></div>
        </div>
      </section>
    </main>
  );
}
