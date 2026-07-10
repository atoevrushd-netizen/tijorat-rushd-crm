-- 0039_chat_msg_update_check.sql
-- Ужесточение RLS: у политики UPDATE сообщений был только USING (какие строки
-- можно менять), без WITH CHECK (какими становятся НОВЫЕ значения). Без него лид,
-- редактируя СВОЁ сообщение, мог бы перенести его в чужой диалог (сменить
-- conversation_id), подменить автора (sender_id) или спрятать как «заметку»
-- (kind='note'). Добавляем WITH CHECK. Админ — без ограничений.

alter policy "chat_msg_update" on public.chat_messages
  with check (
    public.is_admin() or (
      sender_id = auth.uid() and kind <> 'note' and exists (
        select 1 from public.chat_conversations c
        where c.id = chat_messages.conversation_id and c.lead_id = auth.uid()
      )
    )
  );
