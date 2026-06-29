# Project Anatomy

Codex Game Studio projects are repository-root template workspaces. The clone-visible template files are the contract between humans, Codex, validation, and later role runs.

## Template repository tree

A typical cloned project starts like this:

```text
open-gamestudio/
  AGENTS.md
  .agents/
    skills/
      cgs-start/SKILL.md
      cgs-prototype/SKILL.md
      ...
  .codex/
    agents/
      producer.toml
      market-analyst.toml
      ...
    workflows/
      market-analysis.md
      prototype.md
      ...
  documentation/
  source/
```

After `codex-game-studio init`, project state and runtime files are added beside those tracked template surfaces:

```text
.codex/
  studio.json
  context-manifest.json
  context-manifest.meta.json
  runs/
  tasks.json
  locks/
  studio/
    config.json
source/
  project-<slug>/
```

Exact starter files vary by engine, mode, and workflow state.

## What humans edit

Humans normally edit:

- `AGENTS.md`, `.codex/agents/*.toml`, `.codex/workflows/*.md`, and `.agents/skills/*/SKILL.md` when changing the template behavior;
- `documentation/` game-design and production docs;
- source files under `source/project-<slug>/`;
- explicit task descriptions in `.codex/tasks.json` when using task workflows;
- project customization in `.codex/studio/config.json`.

Do not treat agent, workflow, or skill bodies as generated output. They are tracked template files, and ordinary Git review is the freshness mechanism.

## What agents read

Codex roles read bounded context selected for the role and task. A role run may include:

- project `AGENTS.md`;
- `.codex/studio.json`;
- selected tracked custom agents under `.codex/agents/*.toml`;
- selected tracked workflow files under `.codex/workflows/*.md`;
- relevant repository skills under `.agents/skills/*/SKILL.md`;
- relevant `documentation/` files;
- relevant templates;
- engine context and engine reference snippets.

Codex Game Studio does not recursively dump the whole project into every prompt.

## Important files

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Tracked game-template instructions for Codex. |
| `.codex/agents/*.toml` | Tracked Codex custom-agent definitions for studio roles. |
| `.codex/workflows/*.md` | Tracked workflow prompts and recipes. |
| `.agents/skills/*/SKILL.md` | Tracked repository skills adapted from the CCGS workflow surface. |
| `.codex/studio.json` | Project metadata, role roster, workflow IDs, workflow state, and validation contract. |
| `.codex/context-manifest.json` | Selected context-file manifest used to keep prompt context explicit. |
| `.codex/runs/` | Prompt packets and run metadata produced by role execution. |
| `.codex/tasks.json` | File-backed task state for explicit task workflows. |
| `.codex/locks/` | Transient locks for bounded local orchestration. |
| `.codex/studio/config.json` | Optional project-local customization overlay. |
| `documentation/` | Starter game-design and production documents. |
| `source/project-<slug>/` | Engine project location contract. |

## Repository assets that feed runtime behavior

| Repository path | Purpose |
| --- | --- |
| `src/` | TypeScript CLI implementation. |
| `src/roles.ts` | Role-package registry used for CLI help, validation, and runtime prompt packets. |
| `templates/` | Design, production, art, QA, release, analytics, and engine templates. |
| `engine_configs/` | Engine overlays for Godot, Unity, and Unreal. |
| `engine_reference/` | Curated engine reference packs selected by role and task. |
| `docs/` | Setup, migration, validation, architecture, and truth docs. |
| `tests/` | node:test coverage for projects, templates, validation, runner behavior, engine behavior, and orchestration. |

## Validation-sensitive surfaces

Validation checks clone-ready template surfaces before project state exists and also validates initialized project state after `init`.

Template validation checks tracked agents, workflows, and skills for expected structure and for absence of maintenance-only surfaces. Project validation checks starter docs, engine source markers, context manifests, read-only command behavior, forbidden legacy artifacts, and future-only CLI drift.

See [Workflow Validation](workflow-validation.md) for the full validation contract.
