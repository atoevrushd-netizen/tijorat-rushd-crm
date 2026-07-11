-- 0042_chat_voice_meta.sql
-- Метаданные вложения (для голосовых: длительность + пики звуковой волны, чтобы
-- рисовать волну и показывать время без повторного декодирования аудио).
alter table public.chat_messages
  add column if not exists attachment_meta jsonb;
