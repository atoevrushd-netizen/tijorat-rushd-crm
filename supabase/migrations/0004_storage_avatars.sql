-- 0004_storage_avatars.sql
-- Хранилище фото пользователей: публичный bucket `avatars`.
-- Читать может кто угодно (публичный bucket), загружать/менять/удалять — только админ.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Запись в bucket — только администраторам.
create policy "avatars_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and public.is_admin());

create policy "avatars_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

create policy "avatars_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

-- Чтение — всем (bucket публичный; политика для полноты).
create policy "avatars_public_read" on storage.objects
  for select
  using (bucket_id = 'avatars');
