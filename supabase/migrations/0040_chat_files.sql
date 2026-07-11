-- 0040_chat_files.sql
-- Файлы и медиа в чате: вложение на сообщении + приватный бакет 'chat' с доступом
-- по участию в диалоге. Один файл на сообщение (несколько файлов = несколько
-- сообщений). Превью/иконки/скачивание — на клиенте по mime.

-- ── Вложение на сообщении ───────────────────────────────────────────────────
alter table public.chat_messages
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_size bigint,
  add column if not exists attachment_mime text;

-- ── Приватный бакет для файлов чата ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
  values ('chat', 'chat', false, 104857600)  -- 100 MiB
  on conflict (id) do update set file_size_limit = excluded.file_size_limit;

-- Путь файла: {conversation_id}/{uuid}.{ext} → первая папка = id диалога.
-- Читать/загружать может участник диалога (лид своей карточки) или админ.
drop policy if exists "chat_files_select" on storage.objects;
create policy "chat_files_select" on storage.objects for select to authenticated using (
  bucket_id = 'chat' and (
    public.is_admin() or exists (
      select 1 from public.chat_conversations c
      where c.id::text = (storage.foldername(name))[1] and c.lead_id = auth.uid()
    )
  )
);
drop policy if exists "chat_files_insert" on storage.objects;
create policy "chat_files_insert" on storage.objects for insert to authenticated with check (
  bucket_id = 'chat' and (
    public.is_admin() or exists (
      select 1 from public.chat_conversations c
      where c.id::text = (storage.foldername(name))[1] and c.lead_id = auth.uid()
    )
  )
);
drop policy if exists "chat_files_delete_admin" on storage.objects;
create policy "chat_files_delete_admin" on storage.objects for delete to authenticated using (
  bucket_id = 'chat' and public.is_admin()
);

-- ── Лид теперь может слать файлы/голосовые (не только текст), но не «заметки» ──
drop policy if exists "chat_msg_insert" on public.chat_messages;
create policy "chat_msg_insert" on public.chat_messages
  for insert with check (
    sender_id = auth.uid() and (
      public.is_admin() or (
        kind in ('text', 'file', 'voice') and exists (
          select 1 from public.chat_conversations c
          where c.id = chat_messages.conversation_id and c.lead_id = auth.uid()
        )
      )
    )
  );

-- ── Превью последнего сообщения для файлов/голосовых ────────────────────────
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
        admin_last_read_at = case when new.sender_id is distinct from v_lead
                                  then new.created_at else admin_last_read_at end,
        lead_last_read_at  = case when new.sender_id = v_lead
                                  then new.created_at else lead_last_read_at end
    where id = new.conversation_id;
  return null;
end; $$;
