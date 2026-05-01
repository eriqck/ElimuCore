create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_slug text not null references public.membership_plans(slug) on update cascade,
  provider text not null default 'paystack' check (provider in ('paystack')),
  reference text not null unique,
  status text not null default 'initialized' check (status in ('initialized', 'success', 'failed', 'abandoned')),
  amount_kes integer not null check (amount_kes >= 0),
  currency text not null default 'KES',
  customer_email text not null default '',
  authorization_url text,
  access_code text,
  paystack_transaction_id text,
  paid_at timestamptz,
  activated_membership_id uuid references public.memberships(id) on delete set null,
  raw_initialize jsonb not null default '{}'::jsonb,
  raw_verify jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists payment_transactions_user_id_idx
  on public.payment_transactions(user_id);

create index if not exists payment_transactions_plan_slug_idx
  on public.payment_transactions(plan_slug);

create index if not exists payment_transactions_status_idx
  on public.payment_transactions(status);

drop trigger if exists payment_transactions_set_updated_at on public.payment_transactions;
create trigger payment_transactions_set_updated_at
before update on public.payment_transactions
for each row
execute function public.set_updated_at();

alter table public.payment_transactions enable row level security;

drop policy if exists "users can read own payment transactions" on public.payment_transactions;
create policy "users can read own payment transactions"
on public.payment_transactions
for select
to authenticated
using (auth.uid() = user_id);
