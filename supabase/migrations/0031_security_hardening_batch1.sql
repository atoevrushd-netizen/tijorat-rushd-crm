-- 0031_security_hardening_batch1.sql
-- Батч 1 аудита (безопасность + перф):
-- 1) is_admin()/is_developer() → STABLE (иначе пересчёт на КАЖДУЮ строку в RLS — тормозит все списки).
-- 2) guard_profile_update → БЕЛЫЙ список для лида (меняет только имя/телефон/фото; новые колонки
--    защищены по умолчанию) + защита строк admin/developer от правок обычным админом.
-- 3) avatars-бакет: ограничение типов файлов и размера (нельзя залить HTML/SVG в публичный бакет).

-- ── 1) STABLE-хелперы ────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'developer')
  );
$$;

create or replace function public.is_developer()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'developer'
  );
$$;

-- ── 2) Ужесточённый guard ────────────────────────────────────────────────────
create or replace function public.guard_profile_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is null then
    return new; -- системные вызовы (service_role, миграции)
  end if;

  -- Разработчик не может разжаловать сам себя (иначе управлять ролями станет некому).
  if auth.uid() = old.id and old.role = 'developer'
     and new.role is distinct from old.role then
    raise exception 'Нельзя снять роль «Разработчик» с самого себя';
  end if;

  -- Смену роли разрешаем только разработчику (защита от эскалации привилегий).
  if new.role is distinct from old.role and not public.is_developer() then
    raise exception 'Роль может менять только разработчик';
  end if;

  if public.is_admin() then
    -- Обычный админ НЕ может менять критичные поля другого админа/разработчика
    -- (блокировка/подмена супер-пользователя) — только разработчик.
    if old.role in ('admin', 'developer')
       and auth.uid() <> old.id
       and not public.is_developer() then
      if new.login is distinct from old.login
         or new.email is distinct from old.email
         or new.status is distinct from old.status
         or new.deleted_at is distinct from old.deleted_at then
        raise exception 'Данные администратора/разработчика может менять только разработчик';
      end if;
    end if;
    return new; -- админ/разработчик — остальное можно
  end if;

  -- Обычный пользователь (лид): БЕЛЫЙ СПИСОК. Разрешено менять только
  -- full_name, phone, photo_url. Любое изменение прочих колонок (в т.ч. новых
  -- в будущем) — запрещено. Сравниваем строки целиком за вычетом разрешённых полей.
  if (to_jsonb(new) - 'full_name' - 'phone' - 'photo_url' - 'updated_at')
     is distinct from
     (to_jsonb(old) - 'full_name' - 'phone' - 'photo_url' - 'updated_at') then
    raise exception 'Недостаточно прав для изменения этих полей профиля';
  end if;

  return new;
end $$;

-- ── 3) Ограничения бакета avatars ────────────────────────────────────────────
update storage.buckets
  set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
      file_size_limit = 5242880  -- 5 MiB
  where id = 'avatars';
