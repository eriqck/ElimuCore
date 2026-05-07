alter table public.scheme_requests
add column if not exists output_kind text not null default 'scheme'
check (output_kind in ('scheme', 'lesson-plan', 'assessment'));

alter table public.scheme_requests
add column if not exists source_request_id uuid references public.scheme_requests(id) on delete set null;

create index if not exists scheme_requests_source_request_id_idx
  on public.scheme_requests(source_request_id);
