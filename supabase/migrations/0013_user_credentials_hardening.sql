-- 0013_user_credentials_hardening.sql
-- Закалка таблицы паролей по итогам ревью безопасности (находки low, не эксплойты).
--   1) FORCE RLS — политики применяются даже к роли-владельцу таблицы (defense-in-depth).
--      service_role (Edge Functions) имеет BYPASSRLS и продолжает работать.
--   2) updated_at теперь обновляется и при смене пароля (а не только при создании строки).

alter table public.user_credentials force row level security;

create trigger user_credentials_set_updated_at
  before update on public.user_credentials
  for each row execute function public.set_updated_at();
