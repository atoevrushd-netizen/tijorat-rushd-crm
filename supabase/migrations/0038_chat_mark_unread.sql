-- 0038_chat_mark_unread.sql
-- «Отметить диалог непрочитанным» (только админ): откатываем метку прочтения админа
-- на «перед последним входящим», чтобы диалог снова показывался с непрочитанным.

create or replace function public.chat_mark_unread(p_conversation uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_lead uuid;
  v_last timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Только администратор';
  end if;
  select lead_id into v_lead from public.chat_conversations where id = p_conversation;
  if v_lead is null then raise exception 'Диалог не найден'; end if;

  select max(created_at) into v_last from public.chat_messages
    where conversation_id = p_conversation and sender_id = v_lead and deleted_at is null;
  if v_last is null then return; end if; -- нет входящих — помечать нечего

  update public.chat_conversations
    set admin_last_read_at = v_last - interval '1 millisecond'
    where id = p_conversation;
end; $$;
grant execute on function public.chat_mark_unread(uuid) to authenticated;
