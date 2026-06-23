# Supabase — миграции и настройка

SQL-схема базы данных в `migrations/` + локальный стек для разработки.

---

## Вариант 1. Локально на ПК (через Docker) — для разработки и тестов

Требуется **Docker Desktop** (с WSL2). Команды — из корня проекта в **Git Bash**.

```bash
npx supabase start          # поднять локальный Supabase (Postgres+Auth+Storage+Studio)
npx supabase status         # показать URL и ключи
bash supabase/seed-local.sh # засеять тестовых пользователей (1 админ + 12 студентов)
```

`.env` для фронтенда заполняется значениями из `supabase status`:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<ANON_KEY из supabase status>
```

**Тестовые входы (после seed):**
- Админ: `admin@tijorat.local` / `admin12345` → админ-панель со списком пользователей.
- Студент: `student1@tijorat.local` / `student12345` (есть student1…student12) → личный кабинет.

Полезные адреса локально: Studio (просмотр БД) — http://127.0.0.1:54323, почта (Mailpit) — http://127.0.0.1:54324.

### Важные нюансы локального стека
- После `npx supabase db reset` (пересоздание БД) шлюз **Kong** может кешировать старый
  адрес сервиса Auth → ошибки **502** на вход. Лечится перезапуском Kong:
  `docker restart $(docker ps --format '{{.Names}}' | grep kong)`, затем заново `seed-local.sh`.
- `db reset` стирает данные (в т.ч. тестовых пользователей) — после него повторите `seed-local.sh`.

---

## Вариант 2. Облако (supabase.com) — для публичной версии позже

1. Создай проект на [supabase.com](https://supabase.com) → **SQL Editor**.
2. Выполни файлы из `migrations/` по порядку: `0001_profiles.sql`, затем `0002_leads.sql`.
3. Скопируй из **Project Settings → API**: `Project URL` → `VITE_SUPABASE_URL`,
   ключ `anon public` → `VITE_SUPABASE_ANON_KEY` (в `.env`).
4. Тест-админ: **Authentication → Users → Add user**, затем в таблице `profiles`
   поменяй `role` на `admin`.

---

## Google OAuth (по желанию)

**Authentication → Providers → Google** — включить, указать Client ID/Secret
(из Google Cloud Console). Можно настроить позже.

## Порядок именования миграций

`NNNN_краткое_описание.sql` (по возрастанию). Новые изменения схемы — новым файлом,
уже применённые не правим.
