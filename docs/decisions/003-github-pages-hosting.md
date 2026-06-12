# 003. Хостинг фронта на GitHub Pages

**Статус:** принято
**Дата:** 2026-06-12

## Контекст

Фронт — чистая статика (Vite SPA), весь бэкенд в Supabase Edge Functions. Нужен хостинг для `dist` с HTTPS (требование ЮKassa к `return_url`). В исходном плане был Timeweb VPS, рассматривали также Railway.

## Решение

GitHub Pages + автодеплой через GitHub Actions: на каждый push в `master` workflow собирает проект и публикует `dist`. URL: `https://dundiir.github.io/PaySomeMoney/`.

**Обновление 2026-06-12:** куплен домен `pay-some-money.ru`, подключён к Pages как custom domain. Сайт теперь живёт на корне, поэтому `base` стал `/` и вынесен в переменную `VITE_BASE_PATH` (repository variable на GitHub): если домен отвалится и сайт вернётся на `dundiir.github.io/PaySomeMoney/`, достаточно поставить `VITE_BASE_PATH = /PaySomeMoney/` без правки кода. Секрет `RETURN_URL` в Supabase должен указывать на `https://pay-some-money.ru/success`.

## Альтернативы

- **Timeweb VPS** — полный контроль, но нужно платить, ставить и настраивать nginx, самому обновлять билд при каждом изменении. Для статики избыточно.
- **Railway** — нет бесплатного тарифа, оплата только международной картой; статике нужен лишний веб-процесс (`serve`), потому что Railway раздаёт трафик только в запущенный процесс.

## Ключевые моменты

### Трюк с 404.html вместо HashRouter

GitHub Pages не умеет SPA-fallback: прямой заход на `/PaySomeMoney/success` (редирект ЮKassa) вернул бы 404. Workflow копирует `index.html` в `404.html` — Pages отдаёт его на любой несуществующий путь, приложение загружается и React Router показывает нужную страницу. HashRouter решил бы то же самое, но с уродливыми URL вида `/#/success`.

### base зависит от команды Vite

Сайт живёт в подпапке `/PaySomeMoney/`, поэтому в `vite.config.ts` `base` задан как `command === 'build' ? '/PaySomeMoney/' : '/'` — прод-сборка под Pages, дев на корне localhost. Роутер получает `basename={import.meta.env.BASE_URL}` и автоматически следует за `base`.

### Переменные сборки — в repository variables, не secrets

`VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` зашиваются в публичный бандл при любом хостинге — секретами они не являются, лежат в Settings → Secrets and variables → Actions → Variables.

## Последствия

- Репозиторий должен быть публичным (бесплатный тариф Pages).
- `RETURN_URL` в секретах Supabase должен указывать на `https://dundiir.github.io/PaySomeMoney/success`.
- При переименовании репозитория меняется URL и ломается `base` — обновить оба.
