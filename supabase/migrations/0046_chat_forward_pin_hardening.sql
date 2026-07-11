-- 0046_chat_forward_pin_hardening.sql — по итогам адверсариального ревью.
--
-- 1) БЕЗОПАСНОСТЬ (главное): привилегированные колонки pinned_*/forwarded_* может
--    писать только админ. Базовый RLS не умеет выразить «колонка не изменилась»
--    (WITH CHECK видит лишь итоговую строку), поэтому лид мог прямым UPDATE своей
--    строки выставить pinned_at (само-закрепление) или подделать forwarded_from_*
--    (фейковая пометка «от Администрации») в обход RPC pin_message. Ставим BEFORE-
--    триггер: не-админу эти 4 колонки принудительно = OLD (UPDATE) или NULL (INSERT).
--    RPC pin_message/forward_message — SECURITY DEFINER, но auth.uid()/is_admin()
--    считаются по JWT вызывающего-админа, поэтому для них триггер пропускает NEW.
--
-- 2) ПРИВАТНОСТЬ: forward_message больше НЕ сохраняет имя автора-лида в пересланную
--    копию (она лежит в диалоге другого лида и читается им) — иначе имя одного
--    клиента утекало другому. Метку «Переслано» несёт сам факт forwarded_from_msg;
--    первоисточник админ прослеживает по этой ссылке. Плюс вайтлист kind и проверка
--    пути вложения (та же граница диалога, что и в 0041).

create or replace function public.chat_msg_guard_admin_cols()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.pinned_at := null; new.pinned_by := null;
    new.forwarded_from_msg := null; new.forwarded_from_name := null;
  else
    new.pinned_at := old.pinned_at; new.pinned_by := old.pinned_by;
    new.forwarded_from_msg := old.forwarded_from_msg;
    new.forwarded_from_name := old.forwarded_from_name;
  end if;
  return new;
end; $$;
drop trigger if exists chat_msg_guard_admin_cols on public.chat_messages;
create trigger chat_msg_guard_admin_cols
  before insert or update on public.chat_messages
  for each row execute function public.chat_msg_guard_admin_cols();

create or replace function public.forward_message(p_source uuid, p_targets jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_src  record;
  v_t    jsonb;
  v_conv uuid;
  v_path text;
  v_n    int := 0;
begin
  if not public.is_admin() then raise exception 'Только администратор'; end if;

  select m.* into v_src from public.chat_messages m
    where m.id = p_source and m.deleted_at is null;
  if not found then raise exception 'Сообщение не найдено'; end if;
  if v_src.kind not in ('text', 'file', 'voice') then
    raise exception 'Этот тип сообщения нельзя переслать';
  end if;

  for v_t in select * from jsonb_array_elements(p_targets)
  loop
    v_conv := (v_t->>'conv')::uuid;
    v_path := nullif(v_t->>'path', '');
    if v_path is not null and v_path not like v_conv::text || '/%' then
      raise exception 'Некорректный путь вложения';
    end if;
    insert into public.chat_messages
      (conversation_id, sender_id, body, kind,
       attachment_path, attachment_name, attachment_size, attachment_mime, attachment_meta,
       forwarded_from_msg, forwarded_from_name)
    values
      (v_conv, auth.uid(), v_src.body, v_src.kind,
       v_path, v_src.attachment_name, v_src.attachment_size, v_src.attachment_mime, v_src.attachment_meta,
       p_source, null);
    v_n := v_n + 1;
  end loop;
  return v_n;
end; $$;
grant execute on function public.forward_message(uuid, jsonb) to authenticated;
