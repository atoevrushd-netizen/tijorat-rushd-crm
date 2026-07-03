-- 0028_drop_flags.sql
-- Убрана функция «Флаги приложения» (их никто не читал — задел, который не пригодился).
-- Колонка app_settings.flags больше не нужна.
alter table public.app_settings drop column if exists flags;
