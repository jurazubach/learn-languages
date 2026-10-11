# Drill — EN / SK

Личное приложение для зубрёжки уроков английского и словацкого перед сном. React + Vite, только мобильная вёрстка, без сервера и без хранения прогресса. Деплоится на GitHub Pages при пуше в `master` (`.github/workflows/deploy.yml`).

## Команды

- `npm run dev` — локально
- `npm run validate` — проверка всех `lesson.json`
- `npm run build` — валидация + typecheck + сборка в `dist/`

## Структура

- `content/<en|sk>/lessons/<id>/lesson.json` — уроки; вшиваются в бандл через `import.meta.glob` (`src/content.ts`). `source.md` рядом — расшифровка скриншотов.
- `src/screens/` — Home (выбор языка), Language (режимы и уроки), Session (карточки), LessonPage (шпаргалка и блоки по правилам).
- `src/session.ts` — сборка колоды: блок урока / урок / микс / всё вперемешку.
- `scripts/validate-lessons.mjs` — валидатор формата, запускается перед сборкой.
- `.claude/skills/lesson/` — скилл `/lesson`: материалы урока → карточки. Методика и формат карточек — в `references/`.
- `docs/indeas/` — исходные идеи методики (полная версия с FSRS и озвучкой; в v1 их нет).

## Правила

- Контент генерируется только через `/lesson` и только в рамках типов из `.claude/skills/lesson/references/cards.md`. Новый тип карточки = изменения в `src/types.ts`, `CardView.tsx`, валидаторе и `cards.md` одновременно.
- Роутинг на hash (`#/en/play?...`), `base: './'` — работает под любым именем репозитория.
- Прогресс не сохраняется намеренно; localStorage не используем.
