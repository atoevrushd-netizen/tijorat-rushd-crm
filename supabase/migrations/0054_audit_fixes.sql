-- 0054_audit_fixes.sql — исправления по финальному аудиту (серверная часть).
--   #2  Рассылка не должна «читать» диалоги за админа (сбрасывались непрочитанные).
--   #10 Последнее сообщение в списке диалогов пересчитывать при правке/удалении.
--   #8  Счётчики дашборда — только помесячные задачи (без скрытых старых «дневных»).
--   #1  rebuild_monthly_tasks — пересоздать набор по текущему плану (для смены плана).

-- ── #2: admin_last_read_at не двигаем на fan-out рассылки (broadcast_id задан) ──
create or replace function public.chat_after_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_lead uuid;
begin
  select lead_id into v_lead from public.chat_conversations where id = new.conversation_id;
  update public.chat_conversations
    set last_message = case
          when new.kind = 'file'  then '📎 ' || coalesce(nullif(new.body, ''), new.attachment_name, 'файл')
          when new.kind = 'voice' then '🎙 ' || coalesce(nullif(new.body, ''), 'голосовое сообщение')
          else coalesce(new.body, '') end,
        last_message_at  = new.created_at,
        last_sender_id   = new.sender_id,
        updated_at       = now(),
        -- только настоящее сообщение админа отмечает диалог прочитанным, НЕ рассылка
        admin_last_read_at = case when new.sender_id is distinct from v_lead and new.broadcast_id is null
                                  then new.created_at else admin_last_read_at end,
        lead_last_read_at  = case when new.sender_id = v_lead
                                  then new.created_at else lead_last_read_at end
    where id = new.conversation_id;
  return null;
end; $$;

-- ── #10: пересчёт превью последнего сообщения при UPDATE/DELETE (правка/удаление) ──
create or replace function public.chat_recompute_last(p_conversation uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m record;
begin
  select * into m from public.chat_messages
    where conversation_id = p_conversation and deleted_at is null
    order by created_at desc limit 1;
  update public.chat_conversations
    set last_message = case
          when m.id is null       then null
          when m.kind = 'file'    then '📎 ' || coalesce(nullif(m.body, ''), m.attachment_name, 'файл')
          when m.kind = 'voice'   then '🎙 ' || coalesce(nullif(m.body, ''), 'голосовое сообщение')
          else coalesce(m.body, '') end,
        last_message_at = m.created_at,
        last_sender_id  = m.sender_id
    where id = p_conversation;
end; $$;

create or replace function public.chat_after_message_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.chat_recompute_last(coalesce(new.conversation_id, old.conversation_id));
  return null;
end; $$;

drop trigger if exists chat_messages_after_upd on public.chat_messages;
create trigger chat_messages_after_upd after update on public.chat_messages
  for each row execute function public.chat_after_message_change();
drop trigger if exists chat_messages_after_del on public.chat_messages;
create trigger chat_messages_after_del after delete on public.chat_messages
  for each row execute function public.chat_after_message_change();

-- ── #8: дашборд считает только помесячные задачи (period_month), как и все виды ──
create or replace function public.dashboard_counts()
returns jsonb language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'users_total',      (select count(*) from public.profiles where role = 'user' and deleted_at is null),
    'users_active',     (select count(*) from public.profiles where role = 'user' and deleted_at is null and status = 'active'),
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

-- ── #1: пересоздать помесячный набор по ТЕКУЩЕМУ плану (для смены плана 3↔6) ──
-- Удаляет только авто-выданные помесячные задачи (created_by is null); назначенные
-- вручную (created_by задан) и старые «дневные» (period_month null) не трогает.
create or replace function public.rebuild_monthly_tasks(p_lead uuid)
returns int language plpgsql security definer set search_path = public as $$
declare v_tab uuid; v_start date; v_end date; v_m date; v_total int := 0;
begin
  if not public.is_admin() then raise exception 'Только администратор/разработчик'; end if;
  select subscription_start, subscription_end into v_start, v_end
    from public.profiles where id = p_lead and role = 'user';
  if v_start is null or v_end is null then
    raise exception 'У резидента не задан период подписки';
  end if;
  delete from public.tasks
    where user_id = p_lead and period_month is not null and created_by is null;
  select id into v_tab from public.tabs where key = 'calendar';
  v_m := date_trunc('month', v_start)::date;
  while v_m <= date_trunc('month', v_end)::date loop
    v_total := v_total + public.provision_month(p_lead, v_tab, v_m);
    v_m := (v_m + interval '1 month')::date;
  end loop;
  return v_total;
end; $$;
revoke all on function public.rebuild_monthly_tasks(uuid) from public;
grant execute on function public.rebuild_monthly_tasks(uuid) to authenticated;
