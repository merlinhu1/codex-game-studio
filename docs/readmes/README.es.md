# Codex Game Studio

**Convierte una sesión de Codex en un estudio de juegos estructurado y local-first.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio es una CLI TypeScript. Crea para proyectos de juego un workspace listo para Codex y guarda prompts de roles, prompts de workflow, archivos del proyecto, estado de tareas y validación en archivos normales revisables en Git.

No es un motor de juego ni un gestor de proyectos alojado. Su objetivo es dar a Codex un contrato de trabajo más claro, manteniendo las decisiones creativas y la revisión final en manos humanas.

## Inicio rápido

Necesitas Node.js 24 o posterior. `run <role>` requiere la CLI de Codex.

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

Antes de ejecutar Codex de verdad, puedes inspeccionar el prompt del rol:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Los comandos detallados están en el [User Guide](../user-guide.md) en inglés.

## Por qué existe

Un chat de codificación con IA en blanco es flexible, pero el desarrollo de juegos necesita una estructura de estudio repetible:

- Producción necesita hitos, handoffs y comprobaciones de lanzamiento.
- Diseño necesita GDD, especificaciones de sistemas, player journeys y bucles de ajuste.
- Ingeniería necesita prompts de implementación bien delimitados y puertas de validación.
- Arte, QA, audio, localización y live ops también necesitan su propio contexto.
- Las personas que revisan necesitan archivos inspeccionables en Git, no decisiones perdidas en el historial del chat.

Codex Game Studio convierte esa estructura en artefactos locales que Codex puede leer y las personas pueden revisar.

## Lo que obtienes

| Capacidad | Qué significa |
| --- | --- |
| Scaffolding local de proyecto | Crea un workspace de juego determinista en la raíz del repositorio actual. |
| Roles de estudio nativos de Codex | Proporciona prompts enfocados para producción, diseño, ingeniería, arte, QA, localización y lanzamiento. |
| Prompts de workflow | Ofrece prompts reutilizables para mercado, análisis, especificaciones, handoffs, ship checks y revisión UI. |
| Capa de motor | Añade contexto de Godot, Unity o Unreal sin convertir el proyecto en un wrapper de motor. |
| Estado de tareas en archivos | Guarda tareas, locks y metadatos de ejecución bajo `.codex/**`. |
| Inspección antes de ejecutar | Dry-run y salida de prompt permiten revisar antes de dejar que Codex actúe. |
| Validación estricta | Detecta archivos generados obsoletos, metadatos mal formados, recursos faltantes y deriva hacia funciones futuras. |

## Leer más

| Necesidad | Documento |
| --- | --- |
| Instalación, comandos, workflows y validación | [User Guide](../user-guide.md) |
| Escenarios de uso | [Examples](../examples/README.md) |
| Mapa completo de documentación | [Docs Index](../README.md) |

## Estado del proyecto

Codex Game Studio actualmente soporta scaffolding determinista, ejecución de roles Codex, renderizado de prompts de workflow, orquestación de tareas en archivos y validación de repositorio/proyecto.

Los comandos planner o `next`, la telemetría, la orquestación alojada, el paralelismo ilimitado, la propiedad forzada de salidas y la generación de `CODEX.md` / `project_orchestrator.md` están fuera del alcance actual.

## Licencia

Codex Game Studio se distribuye bajo MIT License. Consulta [`LICENSE`](../../LICENSE).
