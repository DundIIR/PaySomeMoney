# PaySomeMoney — обзор архитектуры

## Что это

Сайт с одной кнопкой оплаты 55 рублей через ЮKassa. Цель проекта — пройти полный цикл вайб-кодинга: от идеи до прода.

После оплаты пользователь получает доступ к статистике: счётчик «N человек / X рублей» и график платежей по дням. Доступ действует **24 часа с момента оплаты**.

## Стек

| Слой | Технология |
|------|------------|
| Фронтенд | React + TypeScript + Vite (без Redux, локальный стейт) |
| График | recharts |
| Бэкенд | Supabase: Postgres + 3 Edge Functions |
| Платежи | ЮKassa |
| Хостинг | VPS Timeweb, nginx, HTTPS через certbot |
| Мониторинг | Яндекс Метрика + UptimeRobot |

На VPS едет только статика фронта — весь бэкенд живёт в Supabase (см. [решение 001](../decisions/001-supabase-as-backend.md)).

## Поток платежа

1. Юзер жмёт кнопку на сайте.
2. Фронт вызывает Edge Function `create-payment`.
3. Фронт сохраняет `access_token` в localStorage и редиректит на `confirmation_url` (страница оплаты ЮKassa).
4. Юзер платит на стороне ЮKassa.
5. ЮKassa шлёт вебхук на `payment-webhook` — тот переводит платёж в `succeeded`.
6. Юзер возвращается на сайт по `return_url`.
7. Фронт читает `access_token` из localStorage и начинает поллить `get-stats` раз в 2 секунды.
8. Как только `get-stats` вернул `succeeded` — показываем статистику и график.

## Модель доступа

- Таблица `payments` закрыта RLS без политик — anon-ключ не может ничего.
- Edge Functions работают через service role.
- Доступ к статистике — по `access_token` (uuid), который хранится в localStorage. Подробнее: [решение 002](../decisions/002-access-token-scheme.md).

## Детали по слоям

- [database.md](database.md) — схема БД и RLS
- [edge-functions.md](edge-functions.md) — три Edge Functions
- [frontend.md](frontend.md) — фронтенд
