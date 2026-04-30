create table if not exists public.learning_classes (
  slug text primary key,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  audience text not null default '',
  status_label text not null default 'Available',
  available boolean not null default true,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.learning_topics (
  slug text primary key,
  class_slug text not null references public.learning_classes(slug) on delete cascade,
  title text not null,
  summary text not null default '',
  description text not null default '',
  access text not null default 'premium' check (access in ('free', 'premium')),
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.learning_lessons (
  slug text primary key,
  topic_slug text not null references public.learning_topics(slug) on delete cascade,
  title text not null,
  summary text not null default '',
  description text not null default '',
  lesson_type text not null default 'practice' check (lesson_type in ('guided', 'practice', 'quiz')),
  access text not null default 'premium' check (access in ('free', 'premium')),
  estimated_minutes integer not null default 8 check (estimated_minutes > 0),
  sort_order integer not null default 0,
  objectives jsonb not null default '[]'::jsonb,
  learning_cards jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  passing_score integer not null default 70 check (passing_score between 0 and 100),
  published boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_slug text not null references public.learning_classes(slug) on delete cascade,
  topic_slug text not null references public.learning_topics(slug) on delete cascade,
  lesson_slug text not null references public.learning_lessons(slug) on delete cascade,
  completed boolean not null default false,
  score integer check (score between 0 and 100),
  question_count integer not null default 0 check (question_count >= 0),
  completed_at timestamptz,
  last_activity_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id, lesson_slug)
);

create table if not exists public.learning_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_slug text not null references public.learning_classes(slug) on delete cascade,
  topic_slug text not null references public.learning_topics(slug) on delete cascade,
  lesson_slug text not null references public.learning_lessons(slug) on delete cascade,
  score integer not null check (score between 0 and 100),
  question_count integer not null default 0 check (question_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  answers jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists learning_topics_class_slug_idx
  on public.learning_topics(class_slug);

create index if not exists learning_lessons_topic_slug_idx
  on public.learning_lessons(topic_slug);

create index if not exists learning_progress_user_id_idx
  on public.learning_progress(user_id);

create index if not exists learning_progress_topic_slug_idx
  on public.learning_progress(topic_slug);

create index if not exists learning_quiz_attempts_user_id_idx
  on public.learning_quiz_attempts(user_id);

drop trigger if exists learning_classes_set_updated_at on public.learning_classes;
create trigger learning_classes_set_updated_at
before update on public.learning_classes
for each row
execute function public.set_updated_at();

drop trigger if exists learning_topics_set_updated_at on public.learning_topics;
create trigger learning_topics_set_updated_at
before update on public.learning_topics
for each row
execute function public.set_updated_at();

drop trigger if exists learning_lessons_set_updated_at on public.learning_lessons;
create trigger learning_lessons_set_updated_at
before update on public.learning_lessons
for each row
execute function public.set_updated_at();

drop trigger if exists learning_progress_set_updated_at on public.learning_progress;
create trigger learning_progress_set_updated_at
before update on public.learning_progress
for each row
execute function public.set_updated_at();

alter table public.learning_classes enable row level security;
alter table public.learning_topics enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.learning_progress enable row level security;
alter table public.learning_quiz_attempts enable row level security;

drop policy if exists "public can read published learning classes" on public.learning_classes;
create policy "public can read published learning classes"
on public.learning_classes
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published learning topics" on public.learning_topics;
create policy "public can read published learning topics"
on public.learning_topics
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published learning lessons" on public.learning_lessons;
create policy "public can read published learning lessons"
on public.learning_lessons
for select
to anon, authenticated
using (published = true);

drop policy if exists "users can read own learning progress" on public.learning_progress;
create policy "users can read own learning progress"
on public.learning_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own learning progress" on public.learning_progress;
create policy "users can insert own learning progress"
on public.learning_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own learning progress" on public.learning_progress;
create policy "users can update own learning progress"
on public.learning_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can read own quiz attempts" on public.learning_quiz_attempts;
create policy "users can read own quiz attempts"
on public.learning_quiz_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own quiz attempts" on public.learning_quiz_attempts;
create policy "users can insert own quiz attempts"
on public.learning_quiz_attempts
for insert
to authenticated
with check (auth.uid() = user_id);
