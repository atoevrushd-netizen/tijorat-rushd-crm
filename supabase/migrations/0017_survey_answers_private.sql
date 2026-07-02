-- 0017_survey_answers_private.sql
-- Приватность ответов: лид видит ТОЛЬКО свои ответы, админ — все.
-- Раньше select был открытым (using true) ради вкладки «ответы всех» у лидов —
-- теперь эта вкладка только у админа, а чтение ответов ограничено «свой или админ».
drop policy if exists "survey_a_select_auth" on public.survey_answers;

create policy "survey_a_select_own_or_admin" on public.survey_answers
  for select using (user_id = auth.uid() or public.is_admin());
