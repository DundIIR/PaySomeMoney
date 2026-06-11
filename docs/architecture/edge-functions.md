# Edge Functions

Три функции в Supabase. Все работают через **service role** — это единственный способ доступа к таблице `payments` (RLS без политик закрывает anon).

Секреты в Supabase: `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`.

## create-payment

Вызывается фронтом при нажатии кнопки оплаты.

1. Генерит `access_token` (uuid).
2. Создаёт запись в `payments` со статусом `pending` и `amount = 5500` (копейки).
3. Создаёт платёж в ЮKassa, сохраняет `yookassa_payment_id`.
4. Возвращает фронту:

```json
{ "access_token": "...", "confirmation_url": "..." }
```

Токен генерится именно здесь, а не в вебхуке — вебхук не связан с браузером пользователя (см. [решение 002](../decisions/002-access-token-scheme.md)).

## payment-webhook

Принимает вебхук от ЮKassa о смене статуса платежа.

1. Находит платёж по `yookassa_payment_id`.
2. Переводит статус в `succeeded`.
3. Проставляет `paid_at`.

## get-stats

Вызывается фронтом (поллинг раз в 2 секунды после возврата с оплаты).

Вход: `access_token`.

Логика:
- Если платёж с таким токеном не найден или статус не `succeeded` — возвращает статус `pending` (фронт продолжает поллить).
- Если `paid_at` старше 24 часов — доступ истёк.
- Иначе возвращает агрегированную статистику:

```json
{
  "total_count": 0,
  "total_amount": 0,
  "stats_by_day": []
}
```

- `total_count` — сколько человек оплатило
- `total_amount` — сумма оплат
- `stats_by_day` — данные для графика по дням (recharts на фронте)
