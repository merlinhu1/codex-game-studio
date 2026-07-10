# Codex Game Studio

**Transformez une session Codex en studio de jeu structuré et local-first.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio est une CLI TypeScript. Elle crée, pour les projets de jeu, un espace de travail prêt pour Codex et conserve les prompts de rôles, prompts de workflows, fichiers projet, état des tâches et preuves de validation dans des fichiers ordinaires revus dans Git.

Ce n’est ni un moteur de jeu ni un gestionnaire de projet hébergé. L’objectif est de donner à Codex un contrat de travail plus clair tout en gardant les décisions créatives et la revue finale côté humain.

## Démarrage rapide

Node.js 24 ou plus récent est requis. `run <role>` nécessite la CLI Codex.

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

Avant de lancer Codex, vous pouvez inspecter le prompt de rôle :

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Les commandes détaillées sont dans le [User Guide](../user-guide.md) en anglais.

## Pourquoi cela existe

Un chat de codage IA vide est flexible, mais le développement de jeux a besoin d’une structure de studio répétable :

- La production a besoin de jalons, de passations et de contrôles de sortie.
- Le design a besoin de GDD, de spécifications système, de parcours joueur et de boucles de réglage.
- L’ingénierie a besoin de prompts d’implémentation bornés et de portes de validation.
- L’art, la QA, l’audio, la localisation et le live ops ont aussi besoin de leur propre contexte.
- Les reviewers ont besoin de fichiers vérifiables dans Git, pas de décisions perdues dans l’historique du chat.

Codex Game Studio transforme cette structure en artefacts locaux lisibles par Codex et vérifiables par les humains.

## Ce que vous obtenez

| Capacité | Rôle |
| --- | --- |
| Scaffolding local de projet | Crée un workspace de jeu déterministe à la racine du dépôt courant. |
| Rôles de studio natifs Codex | Fournit des prompts ciblés pour production, design, ingénierie, art, QA, localisation et release. |
| Prompts de workflow | Fournit des prompts réutilisables pour marché, analyse, specs, passations, ship checks et revue UI. |
| Surcouche moteur | Ajoute du contexte Godot, Unity ou Unreal sans transformer le projet en wrapper de moteur. |
| État des tâches en fichiers | Stocke tâches, verrous et métadonnées d’exécution sous `.codex/**`. |
| Inspection avant exécution | Les dry-runs et l’affichage de prompt permettent de vérifier avant de lancer Codex. |
| Validation stricte | Détecte fichiers générés obsolètes, métadonnées invalides, ressources manquantes et dérive vers des fonctionnalités futures. |

## Lire la suite

| Besoin | Documentation |
| --- | --- |
| Installation, commandes, workflows et validation | [User Guide](../user-guide.md) |
| Scénarios d’usage | [Examples](../examples/README.md) |
| Carte complète des docs | [Docs Index](../README.md) |

## État du projet

Codex Game Studio prend actuellement en charge le scaffolding déterministe, l’exécution de rôles Codex, le rendu de prompts de workflow, l’orchestration de tâches en fichiers et la validation du dépôt/projet.

Les commandes planner ou `next`, la télémétrie, l’orchestration hébergée, le parallélisme illimité, la propriété forcée des sorties et la génération de `CODEX.md` / `project_orchestrator.md` sont hors du périmètre produit actuel.

## Licence

Codex Game Studio est distribué sous MIT License. Voir [`LICENSE`](../../LICENSE).
