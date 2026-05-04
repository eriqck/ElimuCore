insert into storage.buckets (id, name, public)
values ('scheme-documents', 'scheme-documents', false)
on conflict (id) do nothing;

create table if not exists public.scheme_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'generating', 'completed', 'failed')),
  access_mode text not null default 'single_purchase' check (access_mode in ('premium', 'single_purchase')),
  stage text not null check (stage in ('pre-primary', 'junior-school', 'senior-school')),
  class_label text not null,
  subject text not null,
  term text not null,
  year integer not null check (year between 2024 and 2100),
  school_name text not null default '',
  teacher_name text not null default '',
  textbook text not null default '',
  notes text not null default '',
  weeks_in_term integer not null default 12 check (weeks_in_term between 1 and 20),
  lessons_per_week integer not null default 2 check (lessons_per_week between 1 and 10),
  language text not null default 'en' check (language in ('en', 'sw')),
  generated_title text,
  generated_overview text not null default '',
  generated_json jsonb not null default '{}'::jsonb,
  storage_bucket text,
  storage_path text,
  error_message text not null default '',
  paid_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.scheme_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  scheme_request_id uuid not null references public.scheme_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'paystack' check (provider in ('paystack')),
  reference text not null unique,
  status text not null default 'initialized' check (status in ('initialized', 'success', 'failed', 'abandoned')),
  amount_kes integer not null default 20 check (amount_kes >= 0),
  currency text not null default 'KES',
  customer_email text not null default '',
  authorization_url text,
  access_code text,
  paystack_transaction_id text,
  paid_at timestamptz,
  raw_initialize jsonb not null default '{}'::jsonb,
  raw_verify jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists scheme_requests_user_id_idx
  on public.scheme_requests(user_id);

create index if not exists scheme_requests_status_idx
  on public.scheme_requests(status);

create index if not exists scheme_payment_transactions_request_idx
  on public.scheme_payment_transactions(scheme_request_id);

create index if not exists scheme_payment_transactions_user_id_idx
  on public.scheme_payment_transactions(user_id);

create index if not exists scheme_payment_transactions_status_idx
  on public.scheme_payment_transactions(status);

drop trigger if exists scheme_requests_set_updated_at on public.scheme_requests;
create trigger scheme_requests_set_updated_at
before update on public.scheme_requests
for each row
execute function public.set_updated_at();

drop trigger if exists scheme_payment_transactions_set_updated_at on public.scheme_payment_transactions;
create trigger scheme_payment_transactions_set_updated_at
before update on public.scheme_payment_transactions
for each row
execute function public.set_updated_at();

alter table public.scheme_requests enable row level security;
alter table public.scheme_payment_transactions enable row level security;

drop policy if exists "users can read own scheme requests" on public.scheme_requests;
create policy "users can read own scheme requests"
on public.scheme_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can read own scheme payment transactions" on public.scheme_payment_transactions;
create policy "users can read own scheme payment transactions"
on public.scheme_payment_transactions
for select
to authenticated
using (auth.uid() = user_id);
