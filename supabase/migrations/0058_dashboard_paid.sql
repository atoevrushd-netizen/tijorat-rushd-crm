-- 0058_dashboard_paid.sql — счётчик «оплатили полностью» (paid_at, 0055) на дашборде.
create or replace function public.dashboard_counts()
returns jsonb language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'users_total',      (select count(*) from public.profiles where role = 'user' and deleted_at is null),
    'users_active',     (select count(*) from public.profiles where role = 'user' and deleted_at is null and status = 'active'),
    'users_paid',       (select count(*) from public.profiles where role = 'user' and deleted_at is null and paid_at is not null),
    'not_started',      (select count(*) from public.tasks where status = 'not_started'      and period_month is not null),
    'in_progress',      (select count(*) from public.tasks where status = 'in_progress'      and period_month is not null),
    'submitted',        (select count(*) from public.tasks where status = 'submitted'        and period_month is not null),
    'done',             (select count(*) from public.tasks where status = 'done'             and period_month is not null),
    'sent_to_user',     (select count(*) from public.tasks where status = 'sent_to_user'     and period_month is not null),
    'accepted_by_user', (select count(*) from public.tasks where status = 'accepted_by_user' and period_month is not null),
    'needs_revision',   (select count(*) from public.tasks where status = 'needs_revision'   and period_month is not null)
  );
$$;
grant execute on function public.dashboard_counts() to authenticated;
