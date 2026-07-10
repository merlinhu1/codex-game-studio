# Codex Game Studio

**Verwandle eine Codex-Sitzung in ein strukturiertes, lokal-first Game Studio.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio ist eine TypeScript-CLI. Sie erstellt für Spieleprojekte einen Codex-freundlichen Workspace und speichert Rollenprompts, Workflow-Prompts, Projektdateien, Aufgabenstatus und Validierung als normale, in Git überprüfbare Dateien.

Es ist weder eine Game Engine noch ein gehosteter Projektmanager. Es gibt Codex einen klareren Arbeitsvertrag, während kreative Entscheidungen und finale Reviews bei Menschen bleiben.

## Schnellstart

Du brauchst Node.js 24 oder neuer. `run <role>` benötigt die Codex CLI.

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

Vor dem eigentlichen Codex-Lauf kannst du den Rollenprompt prüfen:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Ausführliche Befehle stehen im englischen [User Guide](../user-guide.md).

## Warum es das gibt

Ein leerer AI-Coding-Chat ist flexibel, aber Spieleentwicklung braucht wiederholbare Studio-Struktur:

- Producer brauchen Meilensteine, Übergaben und Release-Checks.
- Designer brauchen GDDs, Systemspezifikationen, Player Journeys und Tuning-Schleifen.
- Engineers brauchen klar begrenzte Implementierungsprompts und Validierungsgates.
- Art, QA, Audio, Lokalisierung und Live Ops brauchen eigenen Kontext.
- Reviewer brauchen Dateien, die in Git überprüfbar sind, statt Entscheidungen in Chat-Verläufen.

Codex Game Studio macht diese Struktur zu lokalen Projektartefakten, die Codex lesen und Menschen prüfen können.

## Was du bekommst

| Fähigkeit | Bedeutung |
| --- | --- |
| Lokales Projektscaffolding | Erstellt einen deterministischen Spiele-Workspace im aktuellen Repository-Root. |
| Codex-native Studio-Rollen | Fokussierte Rollenprompts für Produktion, Design, Engineering, Art, QA, Lokalisierung und Release. |
| Workflow-Prompts | Wiederverwendbare Prompts für Marktanalyse, Daten, Spezifikationen, Handoffs, Ship-Checks und UI-Reviews. |
| Engine-Overlay | Fügt Kontext für Godot, Unity oder Unreal hinzu, ohne dieses Projekt zu einem Engine-Wrapper zu machen. |
| Dateibasierter Aufgabenstatus | Speichert Aufgaben, Locks und Laufmetadaten unter `.codex/**`. |
| Prüfung vor der Ausführung | Dry-runs und Prompt-Ausgabe helfen, Änderungen vor dem Codex-Lauf zu prüfen. |
| Strenge Validierung | Erkennt veraltete generierte Dateien, fehlerhafte Metadaten, fehlende Assets und Drift zu Zukunftsfeatures. |

## Weiterlesen

| Bedarf | Dokument |
| --- | --- |
| Installation, Befehle, Workflows und Validierung | [User Guide](../user-guide.md) |
| Nutzungsszenarien | [Examples](../examples/README.md) |
| Vollständige Dokumentationskarte | [Docs Index](../README.md) |

## Projektstatus

Codex Game Studio unterstützt derzeit deterministisches Projektscaffolding, Codex-Rollenausführung, Workflow-Prompt-Rendering, dateibasierte Aufgabenorchestrierung und Repository-/Projektvalidierung.

Planner- oder `next`-Befehle, Telemetrie, gehostete Orchestrierung, unbegrenzte Parallelität, erzwungene Output-Ownership und das Generieren von `CODEX.md` / `project_orchestrator.md` liegen außerhalb der aktuellen Produktgrenze.

## Lizenz

Codex Game Studio steht unter der MIT License. Siehe [`LICENSE`](../../LICENSE).
