# Фронтенд

React + TypeScript + Vite. Без Redux — локальный стейт. График — recharts.

Деплоится как статика на VPS Timeweb (nginx + HTTPS через certbot).

## Зависимости

- `@supabase/supabase-js` — вызов Edge Functions
- `recharts` — график статистики по дням

## Переменные окружения (`.env.local`)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Anon-ключ используется только для вызова Edge Functions — к таблицам он доступа не имеет (RLS без политик).

## Страницы / состояния

1. **Главная страница с кнопкой** — кнопка «оплатить 55 ₽». По клику:
   - вызывает `create-payment`;
   - сохраняет `access_token` в localStorage;
   - редиректит на `confirmation_url` (ЮKassa).
2. **Страница возврата** (return_url) — после оплаты:
   - читает `access_token` из localStorage;
   - поллит `get-stats` раз в 2 секунды, пока статус `pending`.
3. **Страница статистики** — когда `get-stats` вернул данные:
   - счётчик «N человек / X рублей»;
   - график по дням на recharts.

## Хранение токена

`access_token` лежит в **localStorage**, не в URL — URL попадает в историю браузера и логи (см. [решение 002](../decisions/002-access-token-scheme.md)). Доступ к статистике — 24 часа с момента оплаты, проверяется на сервере в `get-stats`.
