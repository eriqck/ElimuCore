alter table public.scheme_requests
drop constraint if exists scheme_requests_output_kind_check;

alter table public.scheme_requests
add constraint scheme_requests_output_kind_check
check (
  output_kind in (
    'scheme',
    'lesson-plan',
    'assessment',
    'marking-scheme',
    'lesson-notes'
  )
);
