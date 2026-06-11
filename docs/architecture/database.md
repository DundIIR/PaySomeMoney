# База данных

Postgres в Supabase (регион eu-central-1). Одна таблица.

## Таблица `payments`

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | uuid | primary key |
| `access_token` | uuid | unique; токен доступа к статистике, хранится в localStorage на фронте |
| `yookassa_payment_id` | text | unique; id платежа в ЮKassa |
| `amount` | integer | сумма в копейках (5500 = 55 ₽) |
| `status` | text | `pending` / `succeeded` / `canceled` |
| `created_at` | timestamptz | момент создания записи |
| `paid_at` | timestamptz | момент подтверждения оплаты (проставляет вебхук) |

## Безопасность (RLS)

- RLS на таблице **включён**, политик **нет** — anon-ключ не может ни читать, ни писать.
- Весь доступ к данным идёт только через Edge Functions, которые работают через **service role**.
- Полноценная авторизация (Supabase Auth) не используется — для проекта такого масштаба она избыточна, доступ контролируется через `access_token` (см. [решение 002](../decisions/002-access-token-scheme.md)).

## Жизненный цикл записи

1. `create-payment` создаёт запись со статусом `pending`, генерит `access_token`, заполняет `yookassa_payment_id` после создания платежа в ЮKassa.
2. `payment-webhook` по `yookassa_payment_id` переводит запись в `succeeded` и проставляет `paid_at`.
3. `get-stats` проверяет `status = 'succeeded'` и `paid_at` не старше 24 часов.

## Миграции

Таблица создана через миграцию Supabase (RLS включён в той же миграции).
