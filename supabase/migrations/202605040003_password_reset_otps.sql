create table if not exists public.password_reset_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  otp_hash text not null,
  attempts integer not null default 0 check (attempts >= 0),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists password_reset_otps_user_id_idx
  on public.password_reset_otps(user_id);

create index if not exists password_reset_otps_email_idx
  on public.password_reset_otps(email);

create index if not exists password_reset_otps_expires_at_idx
  on public.password_reset_otps(expires_at);

drop trigger if exists password_reset_otps_set_updated_at on public.password_reset_otps;
create trigger password_reset_otps_set_updated_at
before update on public.password_reset_otps
for each row
execute function public.set_updated_at();

alter table public.password_reset_otps enable row level security;
