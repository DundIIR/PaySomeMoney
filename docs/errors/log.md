# Лог ошибок и багов

Формат записи:

```
## YYYY-MM-DD — краткое описание

**Симптом:** что наблюдали.
**Причина:** в чём было дело.
**Решение:** как починили.
```

---

## 2026-06-12 — ERR_CONNECTION_REFUSED на localhost:5173 при работающем Vite

**Симптом:** `npm run dev` пишет «ready, Local: http://localhost:5173/», но браузер получает ERR_CONNECTION_REFUSED (-102).
**Причина:** на Windows с Node 17+ `localhost` резолвится в `::1`, и Vite слушал только IPv6-loopback (`netstat` показывал `[::1]:5173 LISTENING`). Браузер шёл по IPv4 `127.0.0.1`, где никто не слушает.
**Решение:** в `vite.config.ts` добавлен `server: { host: '127.0.0.1' }` — сервер биндится на IPv4.

## 2026-06-12 — «import map path does not exist» при редеплое Edge Function через MCP

**Симптом:** `deploy_edge_function` для существующей функции падает с `BadRequestException: import map path does not exist - .../_5/source/file:///tmp/..._4/source/deno.json` — и с файлом `deno.json` в списке, и без него.
**Причина:** у задеплоенной функции в метаданных `import_map_path` хранится как абсолютный путь к каталогу предыдущей версии (`/tmp/user_fn_..._4/source/deno.json`). При новом деплое без явного `import_map_path` API подставляет этот протухший путь.
**Решение:** при редеплое всегда передавать `import_map_path: "deno.json"` явно и включать `deno.json` в `files`. Это касается всех трёх функций проекта.
