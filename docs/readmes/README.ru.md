# Codex Game Studio

**Превратите сессию Codex в структурированную локальную игровую студию.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio — это TypeScript CLI. Он создает для игровых проектов рабочее пространство, удобное для Codex, и хранит ролевые промпты, workflow-промпты, проектные файлы, состояние задач и данные проверки в обычных файлах, которые можно ревьюить в Git.

Это не игровой движок и не хостинговый менеджер проектов. Цель — дать Codex более ясный рабочий контракт, оставив творческие решения и финальное ревью людям.

## Быстрый старт

Нужен Node.js 24 или новее. Для `run <role>` требуется Codex CLI.

```sh
git clone git@github.com:merlinhu1/codex-game-studio.git signal-cartographer
cd signal-cartographer
npm install
npm run build

./codex-game-studio init --name "Signal Cartographer" --engine godot --mode prototype --non-interactive \
  --concept "A compact puzzle game about routing trains through haunted switchyards"

./codex-game-studio status
./codex-game-studio validate
```

Перед настоящим запуском Codex можно проверить ролевой промпт:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Подробные команды описаны в английском [User Guide](../user-guide.md).

## Зачем это нужно

Пустой AI-чат для кодинга гибок, но разработке игр нужна повторяемая студийная структура:

- Продюсерам нужны майлстоуны, handoff и релизные проверки.
- Дизайнерам нужны GDD, спецификации систем, путь игрока и циклы настройки.
- Инженерам нужны четко ограниченные промпты реализации и валидационные гейты.
- Art, QA, audio, localization и live ops тоже требуют собственного контекста.
- Ревьюерам нужны файлы, проверяемые в Git, а не решения, потерянные в истории чата.

Codex Game Studio превращает эту структуру в локальные артефакты проекта, которые Codex может читать, а люди — ревьюить.

## Что вы получаете

| Возможность | Что это значит |
| --- | --- |
| Локальное создание проекта | Создает детерминированное игровое рабочее пространство в корне текущего репозитория. |
| Студийные роли для Codex | Дает сфокусированные ролевые промпты для production, design, engineering, art, QA, localization и release. |
| Workflow-промпты | Предоставляет повторно используемые промпты для рынка, аналитики, спецификаций, handoff, ship-checks и UI review. |
| Слой движка | Добавляет контекст Godot, Unity или Unreal, не превращая проект в обертку над движком. |
| Состояние задач в файлах | Хранит задачи, блокировки и метаданные запусков в `.codex/**`. |
| Проверка перед запуском | Dry-run и печать промпта помогают проверить работу до запуска Codex. |
| Строгая валидация | Находит устаревшие generated-файлы, неверные метаданные, отсутствующие ресурсы и дрейф к будущим функциям. |

## Подробнее

| Задача | Документ |
| --- | --- |
| Установка, команды, workflows и валидация | [User Guide](../user-guide.md) |
| Сценарии использования | [Examples](../examples/README.md) |
| Полная карта документации | [Docs Index](../README.md) |

## Статус проекта

Codex Game Studio сейчас поддерживает детерминированное создание проекта, запуск ролей Codex, рендеринг workflow-промптов, файловую оркестрацию задач и валидацию репозитория/проекта.

Команды planner или `next`, телеметрия, хостинговая оркестрация, неограниченный параллелизм, принудительное владение результатами и генерация `CODEX.md` / `project_orchestrator.md` не входят в текущие границы продукта.

## Лицензия

Codex Game Studio распространяется под MIT License. См. [`LICENSE`](../../LICENSE).
