-- 0041_chat_msg_attachment_bind.sql
-- Ужесточение: файловое сообщение обязано ссылаться на объект ВНУТРИ папки своего
-- диалога ({conversation_id}/…) — та же граница, что и у storage RLS. Закрывает
-- возможность сослаться на файл вне своего диалога (integrity/spoofing). Админ — без ограничений.

drop policy if exists "chat_msg_insert" on public.chat_messages;
create policy "chat_msg_insert" on public.chat_messages
  for insert with check (
    sender_id = auth.uid() and (
      public.is_admin() or (
        kind in ('text', 'file', 'voice')
        and exists (
          select 1 from public.chat_conversations c
          where c.id = chat_messages.conversation_id and c.lead_id = auth.uid()
        )
        and (attachment_path is null or attachment_path like conversation_id::text || '/%')
      )
    )
  );
