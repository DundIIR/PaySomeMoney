# PaySomeMoney

## Как работать с этим проектом

В начале каждой сессии (или когда берёшь новую задачу):
1. Прочитай `docs/journal/` — открой файл с последней датой
2. Прочитай `docs/architecture/overview.md` если нужен общий контекст

В конце каждой сессии (или когда задача выполнена):
1. Открой файл журнала за сегодня `docs/journal/YYYY-MM-DD.md` (создай если нет)
2. Допиши что сделано, какие проблемы встретились, что следующее
3. Если была ошибка — добавь запись в `docs/errors/log.md`

При принятии архитектурных решений:
1. Создай файл `docs/decisions/NNN-название.md`
2. Опиши: что решили, почему, какие альтернативы отвергли

## Структура docs/

- `architecture/` — как устроен проект (не редактируй без причины)
- `journal/` — хронология работы, один файл на дату
- `errors/` — баги и решения
- `decisions/` — почему приняли то или иное решение

## Где что лежит

- Фронт: `src/`
- Edge Functions: `supabase/functions/`
- Документация: `docs/`
- Переменные окружения: `.env.local` (не в git)
- MCP конфиг: `.mcp.json`

## Важные детали проекта

- Supabase project ref: `tpnrzwstakixiaeuwlop`
- Деплой Edge Functions через MCP инструмент Supabase (CLI не установлен); при редеплое обязательно передавать `import_map_path: "deno.json"` и сам `deno.json` в files (см. docs/errors/log.md)
- `return_url` в create-payment берётся из секрета `RETURN_URL` (фолбэк — `localhost:5173/success`); перед продом добавить секрет с прод-URL
- RLS на таблице payments без политик — anon ничего не может, функции через service role
- access_token хранится в localStorage на фронте, не в URL