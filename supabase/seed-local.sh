#!/usr/bin/env bash
# Засев тестовых данных в ЛОКАЛЬНЫЙ Supabase (для разработки).
# Запуск из корня проекта (Git Bash):  bash supabase/seed-local.sh
#
# Почему так: пользователей создаём через Auth API (ASCII email/пароль),
# а имена/роли/данные ставим напрямую через SQL — потому что curl на Windows
# портит кириллицу в JSON-теле запроса (на реальном фронтенде через supabase-js
# такой проблемы нет).
set -u

DB=$(docker ps --format '{{.Names}}' | grep -i 'supabase_db' | head -1)
eval "$(npx --yes supabase status -o env 2>/dev/null)"
API="$API_URL"; SR="$SERVICE_ROLE_KEY"

mkuser() { # email pass
  curl -s -o /dev/null -X POST "$API/auth/v1/admin/users" \
    -H "apikey: $SR" -H "Authorization: Bearer $SR" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\",\"email_confirm\":true}"
}

echo "Создаю пользователей через Auth API…"
mkuser "admin@tijorat.local" "admin12345"
for i in $(seq 1 12); do mkuser "student$i@tijorat.local" "student12345"; done

echo "Проставляю имена/роли/данные через SQL…"
docker exec "$DB" psql -U postgres -d postgres -c "
update public.profiles set
  full_name = case email
    when 'admin@tijorat.local'     then 'Админ Тест'
    when 'student1@tijorat.local'  then 'Алишер Каримов'
    when 'student2@tijorat.local'  then 'Дилноза Рахимова'
    when 'student3@tijorat.local'  then 'Бахтиёр Юсупов'
    when 'student4@tijorat.local'  then 'Мадина Холова'
    when 'student5@tijorat.local'  then 'Фаррух Назаров'
    when 'student6@tijorat.local'  then 'Зарина Усманова'
    when 'student7@tijorat.local'  then 'Тимур Сафаров'
    when 'student8@tijorat.local'  then 'Нигина Олимова'
    when 'student9@tijorat.local'  then 'Рустам Шарипов'
    when 'student10@tijorat.local' then 'Сабина Азизова'
    when 'student11@tijorat.local' then 'Джамшед Икромов'
    when 'student12@tijorat.local' then 'Малика Турсунова'
  end,
  role = case when email='admin@tijorat.local' then 'admin'::user_role else 'user'::user_role end,
  phone = case when email='admin@tijorat.local' then '+992900000001'
               else '+99290000'||lpad(regexp_replace(email,'\D','','g'),4,'0') end,
  business_direction = case when email='admin@tijorat.local' then 'Управление'
               else (array['Маркетинг','Продажи','Контент','SMM','Дизайн','Финансы'])[((regexp_replace(email,'\D','','g'))::int-1)%6+1] end
where email like '%@tijorat.local';
update public.profiles set status='paused'   where email='student2@tijorat.local';
update public.profiles set status='archived' where email='student3@tijorat.local';
"

echo ""
echo "Готово. Тестовые входы:"
echo "  Админ:   admin@tijorat.local   / admin12345"
echo "  Студент: student1@tijorat.local / student12345  (и student2..student12)"
