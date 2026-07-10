# Codex Game Studio

**Trasforma una sessione Codex in uno studio di gioco strutturato e local-first.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio è una CLI TypeScript. Crea per i progetti di gioco uno workspace pronto per Codex e salva prompt dei ruoli, prompt dei workflow, file di progetto, stato delle attività e validazione in file normali revisionabili in Git.

Non è un motore di gioco né un project manager ospitato. Il suo obiettivo è dare a Codex un contratto di lavoro più chiaro, lasciando le decisioni creative e la revisione finale agli esseri umani.

## Avvio rapido

Serve Node.js 24 o più recente. `run <role>` richiede la CLI Codex.

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

Prima di eseguire davvero Codex, puoi ispezionare il prompt del ruolo:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

I comandi dettagliati sono nella [User Guide](../user-guide.md) in inglese.

## Perché esiste

Una chat AI di coding vuota è flessibile, ma lo sviluppo di giochi richiede una struttura di studio ripetibile:

- I producer hanno bisogno di milestone, handoff e controlli di release.
- I designer hanno bisogno di GDD, specifiche di sistema, player journey e cicli di tuning.
- Gli engineer hanno bisogno di prompt di implementazione delimitati e gate di validazione.
- Art, QA, audio, localizzazione e live ops hanno bisogno del proprio contesto.
- I reviewer hanno bisogno di file verificabili in Git, non decisioni perse nella cronologia della chat.

Codex Game Studio trasforma questa struttura in artefatti locali leggibili da Codex e revisionabili dagli umani.

## Cosa ottieni

| Capacità | Significato |
| --- | --- |
| Scaffolding locale del progetto | Crea uno workspace di gioco deterministico nella root del repository corrente. |
| Ruoli di studio nativi Codex | Fornisce prompt mirati per produzione, design, engineering, art, QA, localizzazione e release. |
| Prompt di workflow | Fornisce prompt riutilizzabili per mercato, analisi, specifiche, handoff, ship check e review UI. |
| Overlay del motore | Aggiunge contesto Godot, Unity o Unreal senza trasformare il progetto in un wrapper del motore. |
| Stato attività su file | Salva attività, lock e metadati di esecuzione sotto `.codex/**`. |
| Ispezione prima dell’esecuzione | Dry-run e stampa del prompt permettono di controllare prima di lasciare agire Codex. |
| Validazione rigorosa | Rileva file generati obsoleti, metadati errati, asset mancanti e deriva verso feature future. |

## Approfondisci

| Esigenza | Documento |
| --- | --- |
| Installazione, comandi, workflow e validazione | [User Guide](../user-guide.md) |
| Scenari realistici | [Examples](../examples/README.md) |
| Mappa completa della documentazione | [Docs Index](../README.md) |

## Stato del progetto

Codex Game Studio supporta attualmente scaffolding deterministico, esecuzione di ruoli Codex, rendering dei prompt di workflow, orchestrazione di attività su file e validazione repository/progetto.

Comandi planner o `next`, telemetria, orchestrazione ospitata, parallelismo illimitato, proprietà forzata degli output e generazione di `CODEX.md` / `project_orchestrator.md` sono fuori dal perimetro prodotto attuale.

## Licenza

Codex Game Studio usa la MIT License. Vedi [`LICENSE`](../../LICENSE).
