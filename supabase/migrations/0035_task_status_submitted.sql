-- 0035_task_status_submitted.sql
-- Новый статус задачи: 'submitted' — резидент отметил задачу выполненной и
-- ждёт подтверждения администратора. ADD VALUE применяется ОТДЕЛЬНОЙ миграцией
-- (в своей транзакции), чтобы функции из 0036 могли ссылаться на новое значение.

alter type task_status add value if not exists 'submitted' after 'in_progress';
