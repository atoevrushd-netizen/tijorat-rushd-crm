-- 0036_task_submit_flow.sql
-- Рабочий процесс «резидент отмечает выполнение → администратор проверяет».
--   1) set_task_submitted — резидент ставит/снимает галочку «выполнено» → 'submitted'.
--   2) review_task        — админ принимает ('done') или отклоняет ('needs_revision').
-- Уведомления идут автоматически: смена статуса пишется в activity_log триггером
-- log_task_activity с actor = auth.uid(), а колокольчик показывает чужие действия.

-- Резидент отмечает СВОЮ задачу выполненной (или отменяет отметку). RLS на tasks
-- разрешает UPDATE только админу — поэтому действие идёт через SECURITY DEFINER.
create or replace function public.set_task_submitted(p_task_id uuid, p_submitted boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_owner  uuid;
  v_status task_status;
begin
  select user_id, status into v_owner, v_status from public.tasks where id = p_task_id;
  if v_owner is null then
    raise exception 'Задача не найдена';
  end if;
  if v_owner <> auth.uid() then
    raise exception 'Это не ваша задача';
  end if;

  if p_submitted then
    if v_status not in ('not_started', 'in_progress', 'needs_revision') then
      raise exception 'Эту задачу нельзя отправить на проверку';
    end if;
    update public.tasks set status = 'submitted' where id = p_task_id;
  else
    if v_status <> 'submitted' then
      raise exception 'Отменить можно только задачу на проверке';
    end if;
    update public.tasks set status = 'in_progress' where id = p_task_id;
  end if;
end; $$;
revoke all on function public.set_task_submitted(uuid, boolean) from public;
grant execute on function public.set_task_submitted(uuid, boolean) to authenticated;

-- Админ проверяет отправленную задачу: принять ('done') или вернуть ('needs_revision').
create or replace function public.review_task(
  p_task_id uuid,
  p_accept  boolean,
  p_comment text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_status task_status;
begin
  if not public.is_admin() then
    raise exception 'Только администратор';
  end if;
  select status into v_status from public.tasks where id = p_task_id;
  if v_status is null then
    raise exception 'Задача не найдена';
  end if;
  if v_status <> 'submitted' then
    raise exception 'Проверить можно только задачу на проверке';
  end if;

  if p_accept then
    update public.tasks
      set status = 'done',
          accepted_at = now(),
          admin_comment = coalesce(nullif(p_comment, ''), admin_comment)
      where id = p_task_id;
  else
    update public.tasks
      set status = 'needs_revision',
          admin_comment = p_comment
      where id = p_task_id;
  end if;
end; $$;
revoke all on function public.review_task(uuid, boolean, text) from public;
grant execute on function public.review_task(uuid, boolean, text) to authenticated;

-- Дашборд: учитываем новый статус в счётчиках.
create or replace function public.dashboard_counts()
returns jsonb language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'users_total',      (select count(*) from public.profiles where role = 'user' and deleted_at is null),
    'users_active',     (select count(*) from public.profiles where role = 'user' and deleted_at is null and status = 'active'),
    'not_started',      (select count(*) from public.tasks where status = 'not_started'),
    'in_progress',      (select count(*) from public.tasks where status = 'in_progress'),
    'submitted',        (select count(*) from public.tasks where status = 'submitted'),
    'done',             (select count(*) from public.tasks where status = 'done'),
    'sent_to_user',     (select count(*) from public.tasks where status = 'sent_to_user'),
    'accepted_by_user', (select count(*) from public.tasks where status = 'accepted_by_user'),
    'needs_revision',   (select count(*) from public.tasks where status = 'needs_revision')
  );
$$;
grant execute on function public.dashboard_counts() to authenticated;
