create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.school_levels (
  slug text primary key,
  title text not null,
  subtitle text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.resource_categories (
  slug text primary key,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  school_level_slug text not null references public.school_levels(slug) on update cascade,
  category_slug text not null references public.resource_categories(slug) on update cascade,
  subject text not null default 'General',
  access text not null default 'free' check (access in ('free', 'premium')),
  format text not null default 'PDF',
  resource_year integer,
  term text,
  featured boolean not null default false,
  published boolean not null default true,
  storage_path text,
  source_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.resource_files (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  label text not null,
  file_kind text not null default 'download' check (file_kind in ('download', 'paper', 'marking-scheme', 'notes', 'zip', 'link')),
  bucket_path text not null,
  mime_type text,
  file_size_bytes bigint,
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

drop trigger if exists school_levels_set_updated_at on public.school_levels;
create trigger school_levels_set_updated_at
before update on public.school_levels
for each row
execute function public.set_updated_at();

drop trigger if exists resource_categories_set_updated_at on public.resource_categories;
create trigger resource_categories_set_updated_at
before update on public.resource_categories
for each row
execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

alter table public.school_levels enable row level security;
alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;
alter table public.resource_files enable row level security;

drop policy if exists "public can read school levels" on public.school_levels;
create policy "public can read school levels"
on public.school_levels
for select
to anon, authenticated
using (true);

drop policy if exists "public can read resource categories" on public.resource_categories;
create policy "public can read resource categories"
on public.resource_categories
for select
to anon, authenticated
using (true);

drop policy if exists "public can read published resources" on public.resources;
create policy "public can read published resources"
on public.resources
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published resource files" on public.resource_files;
create policy "public can read published resource files"
on public.resource_files
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.resources
    where public.resources.id = public.resource_files.resource_id
      and public.resources.published = true
  )
);

insert into storage.buckets (id, name, public)
values ('resource-files', 'resource-files', false)
on conflict (id) do nothing;

insert into public.school_levels (slug, title, subtitle, sort_order)
values
  ('secondary-school', 'Secondary School', 'Focused resources for KCSE preparation', 1),
  ('junior-school', 'Junior School', 'Structured CBC support for Grade 7-9 learners', 2),
  ('primary-school', 'Primary School', 'Organized content for Grades 1-6', 3),
  ('pre-primary', 'Pre-Primary', 'Early learning resources for PP1 and PP2', 4)
on conflict (slug) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  sort_order = excluded.sort_order;

insert into public.resource_categories (slug, name, sort_order)
values
  ('past-papers', 'Past Papers', 1),
  ('notes', 'Notes', 2),
  ('topical-questions', 'Topical Questions', 3),
  ('schemes-of-work', 'Schemes of Work', 4),
  ('lesson-plans', 'Lesson Plans', 5),
  ('assignments', 'Assignments', 6),
  ('setbooks', 'Setbooks', 7),
  ('powerpoint-notes', 'PowerPoint Notes', 8),
  ('exams', 'Exams', 9),
  ('marking-schemes', 'Marking Schemes', 10)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order;
