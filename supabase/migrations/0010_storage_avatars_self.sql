-- 0010_storage_avatars_self.sql
-- Разрешаем пользователю загружать/менять/удалять ТОЛЬКО свой аватар.
-- Имя файла аватара = "<user_id>.<ext>" (см. uploadAvatar), поэтому проверяем,
-- что объект начинается с id вызывающего. Политики админа (0004) остаются — они OR-ятся.

create policy "avatars_self_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and name like (auth.uid()::text || '.%'));

create policy "avatars_self_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and name like (auth.uid()::text || '.%'));

create policy "avatars_self_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and name like (auth.uid()::text || '.%'));
