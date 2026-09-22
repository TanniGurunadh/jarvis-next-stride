# Supabase setup required for JARVIS core data

The app uses ONE backend: your existing Supabase project (`VITE_SUPABASE_URL`).
The Edge Functions `jarvis-ask` and `generate-study-plan` are unchanged, and quiz
generation reuses `jarvis-ask` — so **no new Edge Function is needed**.

The following tables do **not** exist yet and must be created manually in your
Supabase project (SQL Editor). Until they exist, the app runs correctly and shows
empty states (no mission, zero progress); saving a plan/quiz/session reports a
non-blocking notice instead of crashing.

```sql
-- 1. Study plans
create table public.study_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade, -- null until auth exists
  exam_date date not null,
  study_hours numeric not null,
  confidence text not null,
  created_at timestamptz not null default now()
);

-- 2. Study tasks (one per planned day) — source of Today's Mission
create table public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.study_plans(id) on delete cascade,
  student_id uuid references auth.users(id) on delete cascade,
  day int not null,
  scheduled_date date not null,
  subject text not null,
  topic text not null,
  hours numeric not null default 0,
  focus text,
  is_revision boolean not null default false,
  is_break boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index study_tasks_date_idx on public.study_tasks (scheduled_date);
create index study_tasks_plan_idx on public.study_tasks (plan_id);

-- 3. Quiz attempts
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade,
  topic text not null,
  difficulty text,
  total_questions int not null,
  correct_answers int not null,
  score numeric not null,
  completed_at timestamptz not null default now()
);
create index quiz_attempts_completed_idx on public.quiz_attempts (completed_at desc);

-- 4. Focus sessions
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade,
  task_id uuid references public.study_tasks(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds int,
  completed boolean not null default false
);
create index focus_sessions_started_idx on public.focus_sessions (started_at desc);

-- Data API grants (required for PostgREST access)
grant select, insert, update on public.study_plans, public.study_tasks,
  public.quiz_attempts, public.focus_sessions to anon, authenticated;

-- RLS
alter table public.study_plans   enable row level security;
alter table public.study_tasks   enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.focus_sessions enable row level security;
```

## RLS policies

There is **no authentication in the app today**, so records are written with
`student_id = null`. Two options:

### A. No auth yet (works immediately, data is shared by all visitors)

```sql
create policy "anon full access" on public.study_plans    for all to anon using (true) with check (true);
create policy "anon full access" on public.study_tasks    for all to anon using (true) with check (true);
create policy "anon full access" on public.quiz_attempts  for all to anon using (true) with check (true);
create policy "anon full access" on public.focus_sessions for all to anon using (true) with check (true);
```

### B. After you add Supabase Auth (recommended, per-student data)

```sql
create policy "own rows" on public.study_plans    for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
-- repeat for study_tasks, quiz_attempts, focus_sessions
```

With option B, `student_id` must be set on insert — add it in
`src/lib/jarvis/repository.ts` once auth exists.
