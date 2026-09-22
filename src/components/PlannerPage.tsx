import { useState } from 'react';
import {
  CalendarClock, Sparkles, Plus, Trash2, BookOpen, Clock,
  Target, ChevronRight, CheckCircle2, Circle, CalendarDays,
  Hourglass, TrendingUp, RotateCcw, Layers, Zap, AlertCircle,
  RefreshCw, Coffee, Repeat,
} from 'lucide-react';
import { JarvisCore } from './JarvisCore';
import { saveStudyPlan } from '@/lib/jarvis/repository';

type Confidence = 'high' | 'medium' | 'low';

interface Subject {
  id: string;
  name: string;
  topics: string;
}

interface StudyDay {
  day: number;
  date: string;
  weekday: string;
  subject: string;
  topic: string;
  hours: number;
  focus: string;
  isRevision: boolean;
  isBreak: boolean;
}

const confidenceConfig: Record<Confidence, { label: string; color: string; activeColor: string }> = {
  high: {
    label: 'High',
    color: 'border-white/10 text-ink-300 hover:border-accent-500/40 hover:text-accent-300',
    activeColor: 'bg-accent-500/15 border-accent-500/40 text-accent-300',
  },
  medium: {
    label: 'Medium',
    color: 'border-white/10 text-ink-300 hover:border-primary-500/40 hover:text-primary-300',
    activeColor: 'bg-primary-500/15 border-primary-500/40 text-primary-300',
  },
  low: {
    label: 'Low',
    color: 'border-white/10 text-ink-300 hover:border-orange-500/40 hover:text-orange-300',
    activeColor: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
  },
};

export default function PlannerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: crypto.randomUUID(), name: '', topics: '' },
  ]);
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState('4');
  const [confidence, setConfidence] = useState<Confidence>('medium');
  const [plan, setPlan] = useState<StudyDay[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saveNotice, setSaveNotice] = useState('');

  const addSubject = () => {
    setSubjects([...subjects, { id: crypto.randomUUID(), name: '', topics: '' }]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: 'name' | 'topics', value: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const generatePlan = async () => {
    setError('');
    setErrorMsg('');

    const validSubjects = subjects.filter((s) => s.name.trim() && s.topics.trim());
    if (validSubjects.length === 0) {
      setError('Please add at least one subject with a name and topics.');
      return;
    }
    if (!examDate) {
      setError('Please select your exam date.');
      return;
    }
    const hours = parseFloat(studyHours);
    if (!hours || hours < 1) {
      setError('Please enter at least 1 study hour per day.');
      return;
    }

    setGenerating(true);
    setPlan(null);
    setCompletedTasks(new Set());

    try {
      const apiUrl = `${SUPABASE_URL}/functions/v1/generate-study-plan`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          subjects: validSubjects.map((s) => ({ name: s.name.trim(), topics: s.topics.trim() })),
          examDate,
          studyHours: hours,
          confidence,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate study plan.');
      }

      if (!data.plan || !Array.isArray(data.plan) || data.plan.length === 0) {
        throw new Error('The AI returned an invalid plan. Please try again.');
      }

      setPlan(data.plan);

      // Persist the plan + its daily tasks so Today's Mission and Progress use real data.
      const saved = await saveStudyPlan({
        examDate,
        studyHours: hours,
        confidence,
        days: (data.plan as StudyDay[]).map((day) => ({
          day: day.day,
          date: day.date,
          subject: day.subject,
          topic: day.topic,
          hours: day.hours,
          focus: day.focus,
          isRevision: day.isRevision,
          isBreak: day.isBreak,
        })),
      });
      setSaveNotice(saved.error ?? '');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(message);
    } finally {
      setGenerating(false);
    }
  };

  const resetPlan = () => {
    setPlan(null);
    setCompletedTasks(new Set());
    setErrorMsg('');
    setSaveNotice('');
  };

  const completedCount = completedTasks.size;
  const totalDays = plan?.length ?? 0;
  const progressPct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <div className="flex flex-col items-center text-center gap-5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 animate-fade-in">
              <Sparkles className="h-4 w-4 text-accent-400" />
              <span className="text-xs font-medium text-accent-300 tracking-wide">AI Study Planner</span>
            </div>

            <div className="animate-fade-in-up">
              <div className="flex justify-center mb-5">
                <JarvisCore small />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                Plan Your <span className="gradient-text">Exam Prep</span>
              </h1>
              <p className="text-base sm:text-lg text-ink-400 max-w-xl mx-auto text-balance leading-relaxed">
                Tell JARVIS your subjects, topics, and exam date. Get a personalized
                one-task-a-day study schedule powered by AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form + Dashboard */}
      <section className="relative pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Form Panel */}
            <div className="lg:col-span-2 animate-fade-in-up">
              <div className="glass-card p-6 sm:p-7 sticky top-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Study Details</h2>
                    <p className="text-xs text-ink-500">Fill in your exam information</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Subjects */}
                  <div>
                    <label className="form-label">Subjects & Topics</label>
                    <div className="space-y-3">
                      {subjects.map((subject, idx) => (
                        <div key={subject.id} className="space-y-2 animate-stagger-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={`Subject ${idx + 1} name`}
                              value={subject.name}
                              onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                              className="form-input"
                            />
                            {subjects.length > 1 && (
                              <button
                                onClick={() => removeSubject(subject.id)}
                                className="shrink-0 h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-ink-400 hover:text-red-400 hover:border-red-500/30 transition-all duration-200 flex items-center justify-center"
                                aria-label="Remove subject"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Topics (comma-separated, e.g. Algebra, Calculus, Geometry)"
                            value={subject.topics}
                            onChange={(e) => updateSubject(subject.id, 'topics', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addSubject}
                      className="mt-3 flex items-center gap-2 text-sm text-primary-300 hover:text-primary-200 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Add another subject
                    </button>
                  </div>

                  {/* Exam Date */}
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Exam Date
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="form-input"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Study Hours */}
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Hourglass className="h-3.5 w-3.5" />
                      Study Hours Per Day
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="12"
                        step="0.5"
                        value={studyHours}
                        onChange={(e) => setStudyHours(e.target.value)}
                        className="flex-1 accent-primary-500"
                      />
                      <div className="shrink-0 w-16 px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-center">
                        <span className="text-sm font-semibold text-primary-300">{studyHours}h</span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Level */}
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      Confidence Level
                    </label>
                    <div className="flex gap-2">
                      {(['high', 'medium', 'low'] as Confidence[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setConfidence(level)}
                          className={`confidence-btn border ${confidence === level ? confidenceConfig[level].activeColor : confidenceConfig[level].color}`}
                        >
                          {confidenceConfig[level].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form validation error */}
                  {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-fade-in">
                      {error}
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={generatePlan}
                    disabled={generating}
                    className="btn-primary-lg w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Generate My Study Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard / Preview */}
            <div className="lg:col-span-3">
              {/* Empty state */}
              {!plan && !generating && !errorMsg && (
                <div className="glass-card p-10 sm:p-14 text-center h-full flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary-500/15 rounded-full blur-2xl animate-pulse-glow" />
                    <div className="relative h-20 w-20 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      <Layers className="h-9 w-9 text-primary-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Your Study Plan Awaits</h3>
                  <p className="text-ink-400 max-w-sm mx-auto leading-relaxed">
                    Fill in your details on the left and click <span className="text-primary-300 font-medium">Generate My Study Plan</span> to get your personalized AI-powered schedule.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-ink-500">
                    <ChevronRight className="h-4 w-4 text-primary-400" />
                    <span>Powered by Google Gemini AI</span>
                  </div>
                </div>
              )}

              {/* Generating state */}
              {generating && (
                <div className="glass-card p-10 sm:p-14 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                  <JarvisCore small />
                  <h3 className="text-lg font-semibold text-white mt-6 mb-1">JARVIS is planning...</h3>
                  <p className="text-sm text-ink-400">Analyzing your subjects and building your schedule with AI</p>
                  <div className="mt-5 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary-400 animate-bounce-subtle"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Error state */}
              {errorMsg && !generating && (
                <div className="glass-card p-10 sm:p-14 text-center h-full flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-500/15 rounded-full blur-2xl animate-pulse-glow" />
                    <div className="relative h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertCircle className="h-9 w-9 text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Something Went Wrong</h3>
                  <p className="text-ink-400 max-w-sm mx-auto leading-relaxed mb-6">
                    {errorMsg}
                  </p>
                  <button
                    onClick={generatePlan}
                    className="btn-primary flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </button>
                </div>
              )}

              {/* Plan generated */}
              {plan && !generating && !errorMsg && (
                <div className="space-y-5">
                  {/* Summary bar */}
                  <div className="glass-card p-5 sm:p-6 animate-scale-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary-500/20 to-accent-500/10 border border-white/10 flex items-center justify-center">
                          <CalendarClock className="h-5 w-5 text-primary-300" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">Your AI Study Schedule</h3>
                          <p className="text-xs text-ink-500">{totalDays} days · One task per day</p>
                        </div>
                      </div>
                      <button
                        onClick={resetPlan}
                        className="flex items-center gap-2 text-sm text-ink-400 hover:text-white transition-colors duration-200"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-400">Progress</span>
                        <span className="font-semibold text-primary-300">{completedCount}/{totalDays} tasks · {progressPct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-primary-500 to-accent-500 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <div className="glass-panel px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <BookOpen className="h-3.5 w-3.5 text-primary-300" />
                          <span className="text-xs text-ink-500">Subjects</span>
                        </div>
                        <div className="text-lg font-bold text-white">{new Set(plan.map((d) => d.subject)).size}</div>
                      </div>
                      <div className="glass-panel px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <Clock className="h-3.5 w-3.5 text-accent-300" />
                          <span className="text-xs text-ink-500">Total Hrs</span>
                        </div>
                        <div className="text-lg font-bold text-white">{plan.reduce((sum, d) => sum + d.hours, 0)}h</div>
                      </div>
                      <div className="glass-panel px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <TrendingUp className="h-3.5 w-3.5 text-primary-300" />
                          <span className="text-xs text-ink-500">Days Left</span>
                        </div>
                        <div className="text-lg font-bold text-white">{totalDays}</div>
                      </div>
                    </div>
                  </div>

                  {/* Task list — One Task a Day */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide pr-1">
                    {plan.map((day, i) => {
                      const isDone = completedTasks.has(i);
                      return (
                        <div
                          key={i}
                          className={`task-card animate-stagger-in ${isDone ? 'opacity-50' : ''} ${day.isBreak ? 'border-accent-500/15' : ''}`}
                          style={{ animationDelay: `${Math.min(i * 0.03, 0.9)}s` }}
                        >
                          <div className="flex items-start gap-4">
                            {/* Day number */}
                            <div className="shrink-0 flex flex-col items-center">
                              <div className={`h-12 w-12 rounded-xl border flex flex-col items-center justify-center ${
                                day.isBreak
                                  ? 'bg-accent-500/10 border-accent-500/20'
                                  : day.isRevision
                                  ? 'bg-primary-500/10 border-primary-500/20'
                                  : 'bg-linear-to-br from-primary-500/15 to-primary-700/5 border-primary-500/20'
                              }`}>
                                <span className="text-[10px] font-medium text-ink-500 leading-none">{day.weekday}</span>
                                <span className="text-sm font-bold text-white leading-none mt-0.5">{day.day}</span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-xs font-medium text-primary-300">{day.subject}</span>
                                    <span className="text-ink-600">·</span>
                                    <span className="text-xs text-ink-500">{day.date}</span>
                                    {day.isRevision && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-300 text-[10px] font-medium">
                                        <Repeat className="h-2.5 w-2.5" />
                                        Revision
                                      </span>
                                    )}
                                    {day.isBreak && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-300 text-[10px] font-medium">
                                        <Coffee className="h-2.5 w-2.5" />
                                        Light Day
                                      </span>
                                    )}
                                  </div>
                                  <h4 className={`text-sm font-semibold ${isDone ? 'text-ink-500 line-through' : 'text-white'}`}>
                                    {day.topic}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                                      <Clock className="h-3 w-3" />
                                      {day.hours}h
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                                      <Target className="h-3 w-3" />
                                      {day.focus}
                                    </span>
                                  </div>
                                </div>

                                {/* Check toggle */}
                                <button
                                  onClick={() => toggleTask(i)}
                                  className="shrink-0 transition-all duration-200 hover:scale-110"
                                  aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="h-6 w-6 text-accent-400" />
                                  ) : (
                                    <Circle className="h-6 w-6 text-ink-600 hover:text-ink-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {saveNotice && (
                    <div className="glass-panel px-5 py-4 text-xs text-ink-400 leading-relaxed">
                      Plan shown but not saved for your dashboard: {saveNotice}
                    </div>
                  )}

                  {/* Footer note */}
                  <div className="glass-panel px-5 py-4 flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-accent-400 shrink-0" />
                    <p className="text-xs text-ink-400 leading-relaxed">
                      This study plan was generated by JARVIS using Google Gemini AI.
                      Topics, revision days, and light days are balanced to keep your prep low-stress.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
