update public.membership_plans
set
  price_kes = case slug
    when '1-month' then 299
    when '6-months' then 499
    when '1-year' then 999
    else price_kes
  end,
  updated_at = timezone('utc'::text, now())
where slug in ('1-month', '6-months', '1-year');
