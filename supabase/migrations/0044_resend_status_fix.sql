-- 0044_resend_status_fix.sql
-- Фикс: resend_broadcast выставлял статус только по ошибкам ТЕКУЩЕГО прогона (v_err),
-- игнорируя нерасходуемые error-строки (напр. лид мягко удалён → пропущен циклом).
-- Из-за этого статус мог стать 'done', хотя ошибки ещё остаются. Считаем статус по
-- фактически оставшимся строкам status='error'.

create or replace function public.resend_broadcast(p_broadcast uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_rec record; v_conv uuid; v_msg uuid; v_body text; v_ok int := 0; v_err int := 0;
begin
  if not public.is_admin() then raise exception 'Только администратор'; end if;
  select body into v_body from public.chat_broadcasts where id = p_broadcast;
  if v_body is null then raise exception 'Рассылка не найдена'; end if;

  for v_rec in
    select r.id, r.lead_id from public.chat_broadcast_recipients r
    join public.profiles p on p.id = r.lead_id
    where r.broadcast_id = p_broadcast and r.status = 'error'
      and p.deleted_at is null and p.role = 'user'
  loop
    begin
      insert into public.chat_conversations (lead_id) values (v_rec.lead_id)
        on conflict (lead_id) do nothing;
      select id into v_conv from public.chat_conversations where lead_id = v_rec.lead_id;
      insert into public.chat_messages (conversation_id, sender_id, body, kind, broadcast_id)
        values (v_conv, auth.uid(), v_body, 'text', p_broadcast) returning id into v_msg;
      update public.chat_broadcast_recipients
        set message_id = v_msg, status = 'delivered' where id = v_rec.id;
      v_ok := v_ok + 1;
    exception when others then
      v_err := v_err + 1;
    end;
  end loop;

  -- Статус — по РЕАЛЬНО оставшимся ошибкам, а не по v_err этого прогона.
  update public.chat_broadcasts b
    set status = case when exists (
          select 1 from public.chat_broadcast_recipients r
          where r.broadcast_id = p_broadcast and r.status = 'error'
        ) then 'partial' else 'done' end
    where b.id = p_broadcast;
  return jsonb_build_object('resent', v_ok, 'errors', v_err);
end; $$;
grant execute on function public.resend_broadcast(uuid) to authenticated;
