-- 0045_chat_forward_pin.sql
-- Пересылка и закрепление сообщений.
--  • Закрепление: pinned_at/pinned_by на сообщении; закреплённые видит и лид
--    (баннер над лентой). Ставит/снимает только админ.
--  • Пересылка: копия сообщения в целевой диалог с пометкой первоисточника.
--    Только админ. Вложения предварительно копируются клиентом в папку цели
--    (storage.copy) — путь остаётся привязан к диалогу-получателю (storage RLS).

alter table public.chat_messages
  add column if not exists pinned_at           timestamptz,
  add column if not exists pinned_by           uuid references public.profiles (id) on delete set null,
  add column if not exists forwarded_from_msg  uuid references public.chat_messages (id) on delete set null,
  add column if not exists forwarded_from_name text;

create index if not exists chat_messages_pinned_idx
  on public.chat_messages (conversation_id, pinned_at desc) where pinned_at is not null;

-- ── Закрепить/открепить сообщение (только админ) ─────────────────────────────
create or replace function public.pin_message(p_msg uuid, p_pin boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Только администратор'; end if;
  update public.chat_messages
    set pinned_at = case when p_pin then now() else null end,
        pinned_by = case when p_pin then auth.uid() else null end
    where id = p_msg;
  if not found then raise exception 'Сообщение не найдено'; end if;
end; $$;
grant execute on function public.pin_message(uuid, boolean) to authenticated;

-- ── Переслать сообщение в один/несколько диалогов (только админ) ─────────────
-- p_targets: jsonb-массив [{ "conv": <uuid диалога>, "path": <новый путь вложения | null> }].
-- Копирует текст/вид/вложение/мету, проставляет forwarded_from_*. Возвращает число копий.
create or replace function public.forward_message(p_source uuid, p_targets jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_src  record;
  v_from text;
  v_t    jsonb;
  v_n    int := 0;
begin
  if not public.is_admin() then raise exception 'Только администратор'; end if;

  select m.*, c.lead_id as src_lead into v_src
    from public.chat_messages m
    join public.chat_conversations c on c.id = m.conversation_id
    where m.id = p_source and m.deleted_at is null;
  if not found then raise exception 'Сообщение не найдено'; end if;

  -- Имя первоисточника: цепочку сохраняем; иначе имя лида-автора; для админа — NULL
  -- (клиент покажет «Администрация»).
  if v_src.forwarded_from_msg is not null then
    v_from := v_src.forwarded_from_name;
  elsif v_src.sender_id = v_src.src_lead then
    select full_name into v_from from public.profiles where id = v_src.src_lead;
  else
    v_from := null;
  end if;

  for v_t in select * from jsonb_array_elements(p_targets)
  loop
    insert into public.chat_messages
      (conversation_id, sender_id, body, kind,
       attachment_path, attachment_name, attachment_size, attachment_mime, attachment_meta,
       forwarded_from_msg, forwarded_from_name)
    values
      ((v_t->>'conv')::uuid, auth.uid(), v_src.body, v_src.kind,
       nullif(v_t->>'path', ''), v_src.attachment_name, v_src.attachment_size,
       v_src.attachment_mime, v_src.attachment_meta,
       p_source, v_from);
    v_n := v_n + 1;
  end loop;
  return v_n;
end; $$;
grant execute on function public.forward_message(uuid, jsonb) to authenticated;
