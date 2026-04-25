create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.membership_plans (
  slug text primary key,
  name text not null,
  duration_months integer not null check (duration_months > 0),
  price_kes integer not null check (price_kes >= 0),
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_slug text not null references public.membership_plans(slug) on update cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'cancelled')),
  starts_at timestamptz,
  expires_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists memberships_status_idx on public.memberships(status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = case
      when public.profiles.full_name = '' then excluded.full_name
      else public.profiles.full_name
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (id, email, full_name)
select
  id,
  coalesce(email, ''),
  coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do update
set
  email = excluded.email,
  full_name = case
    when public.profiles.full_name = '' then excluded.full_name
    else public.profiles.full_name
  end;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists membership_plans_set_updated_at on public.membership_plans;
create trigger membership_plans_set_updated_at
before update on public.membership_plans
for each row
execute function public.set_updated_at();

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
before update on public.memberships
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.membership_plans enable row level security;
alter table public.memberships enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "public can read active membership plans" on public.membership_plans;
create policy "public can read active membership plans"
on public.membership_plans
for select
to anon, authenticated
using (active = true);

drop policy if exists "users can read own memberships" on public.memberships;
create policy "users can read own memberships"
on public.memberships
for select
to authenticated
using (auth.uid() = user_id);

insert into public.membership_plans (
  slug,
  name,
  duration_months,
  price_kes,
  description,
  active,
  sort_order
)
values
  ('1-month', '1 Month', 1, 300, 'Full unlimited access for one month.', true, 1),
  ('6-months', '6 Months', 6, 500, 'Extended unlimited access for active teachers and families.', true, 2),
  ('1-year', '1 Year', 12, 1000, 'Best-value full unlimited access for the school year.', true, 3)
on conflict (slug) do update
set
  name = excluded.name,
  duration_months = excluded.duration_months,
  price_kes = excluded.price_kes,
  description = excluded.description,
  active = excluded.active,
  sort_order = excluded.sort_order;
