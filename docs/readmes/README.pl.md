# Codex Game Studio

**Zamień sesję Codex w uporządkowane, lokalne studio gier.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio to CLI w TypeScript. Tworzy dla projektów gier workspace gotowy dla Codex i zapisuje prompty ról, prompty workflow, pliki projektu, stan zadań oraz walidację w zwykłych plikach możliwych do przeglądu w Git.

To nie jest silnik gry ani hostowany menedżer projektu. Celem jest dać Codex jaśniejszy kontrakt pracy, a decyzje kreatywne i końcowy review zostawić ludziom.

## Szybki start

Wymagany jest Node.js 24 lub nowszy. `run <role>` wymaga Codex CLI.

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

Przed prawdziwym uruchomieniem Codex możesz sprawdzić prompt roli:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Szczegółowe komendy są w angielskim [User Guide](../user-guide.md).

## Dlaczego to istnieje

Pusty chat AI do kodowania jest elastyczny, ale tworzenie gier wymaga powtarzalnej struktury studia:

- Produkcja potrzebuje kamieni milowych, przekazań i kontroli wydania.
- Design potrzebuje GDD, specyfikacji systemów, ścieżek gracza i pętli strojenia.
- Inżynierowie potrzebują ograniczonych promptów implementacji i bramek walidacji.
- Art, QA, audio, lokalizacja i live ops też potrzebują własnego kontekstu.
- Reviewerzy potrzebują plików widocznych w Git, a nie decyzji znikających w historii chatu.

Codex Game Studio zamienia tę strukturę w lokalne artefakty projektu czytelne dla Codex i ludzi.

## Co otrzymujesz

| Możliwość | Znaczenie |
| --- | --- |
| Lokalne tworzenie projektu | Tworzy deterministyczny workspace gry w katalogu głównym bieżącego repozytorium. |
| Role studia natywne dla Codex | Dostarcza skupione prompty dla produkcji, designu, engineeringu, artu, QA, lokalizacji i release. |
| Prompty workflow | Daje prompty wielokrotnego użytku dla rynku, analiz, specyfikacji, handoffów, ship checków i UI review. |
| Warstwa silnika | Dodaje kontekst Godot, Unity lub Unreal bez robienia z projektu wrappera silnika. |
| Stan zadań w plikach | Przechowuje zadania, blokady i metadane uruchomień w `.codex/**`. |
| Inspekcja przed wykonaniem | Dry-run i wydruk promptu pozwalają sprawdzić pracę przed uruchomieniem Codex. |
| Ścisła walidacja | Wykrywa przestarzałe pliki generowane, błędne metadane, brakujące zasoby i dryf do przyszłych funkcji. |

## Czytaj dalej

| Potrzeba | Dokument |
| --- | --- |
| Instalacja, komendy, workflow i walidacja | [User Guide](../user-guide.md) |
| Scenariusze użycia | [Examples](../examples/README.md) |
| Pełna mapa dokumentacji | [Docs Index](../README.md) |

## Status projektu

Codex Game Studio obsługuje obecnie deterministyczne tworzenie projektu, wykonywanie ról Codex, renderowanie promptów workflow, orkiestrację zadań w plikach i walidację repozytorium/projektu.

Komendy planner lub `next`, telemetria, hostowana orkiestracja, nieograniczona równoległość, wymuszona własność wyników oraz generowanie `CODEX.md` / `project_orchestrator.md` są poza obecnym zakresem produktu.

## Licencja

Codex Game Studio jest dostępny na MIT License. Zobacz [`LICENSE`](../../LICENSE).
