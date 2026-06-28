# Project Anatomy

Codex Game Studio projects are ordinary directories under `projects/<slug>/`. The generated files are the contract between humans, Codex, validation, and later role runs.

## Generated project tree

A typical project starts like this:

```text
projects/my-game/
  AGENTS.md
  .codex/
    studio.json
    context-manifest.json
    prompts/
    workflows/
    runs/
    tasks.json
    locks/
    studio/
      config.json
  documentation/
  source/
    project-my-game/
```

Exact files vary by engine, mode, and generated workflow state.

## What humans edit

Humans normally edit:

- `documentation/` game-design and production docs;
- source files under `source/project-<slug>/`;
- explicit task descriptions in `.codex/tasks.json` when using task workflows;
- project customization in `.codex/studio/config.json`.

Review changes to generated prompts and workflow files carefully. They carry freshness metadata that validation checks.

## What agents read

Codex roles read bounded context selected for the role and task. A role run may include:

- project `AGENTS.md`;
- `.codex/studio.json`;
- selected generated role prompts;
- selected workflow prompts;
- relevant `documentation/` files;
- relevant templates;
- engine context and engine reference snippets.

Codex Game Studio does not recursively dump the whole project into every prompt.

## Important files

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Generated project instructions for Codex. Owned by the CLI renderer. |
| `.codex/studio.json` | Project metadata, role roster, workflow IDs, workflow state, and validation contract. |
| `.codex/context-manifest.json` | Selected context-file manifest used to keep prompt context explicit. |
| `.codex/prompts/` | Generated role prompts for supported studio roles. |
| `.codex/workflows/` | Generated workflow prompts and recipes. |
| `.codex/runs/` | Prompt packets and run metadata produced by role execution. |
| `.codex/tasks.json` | File-backed task state for explicit task workflows. |
| `.codex/locks/` | Transient locks for bounded local orchestration. |
| `.codex/studio/config.json` | Optional project-local customization overlay. |
| `documentation/` | Starter game-design and production documents. |
| `source/project-<slug>/` | Engine project location contract. |

## Repository assets that feed projects

| Repository path | Purpose |
| --- | --- |
| `src/` | TypeScript CLI implementation. |
| `src/roles.ts` | Role-package registry compiled into the CLI. |
| `templates/` | Design, production, art, QA, release, analytics, and engine templates. |
| `engine_configs/` | Engine overlays for Godot, Unity, and Unreal. |
| `engine_reference/` | Curated engine reference packs selected by role and task. |
| `docs/` | Setup, migration, validation, architecture, and truth docs. |
| `tests/` | Vitest coverage for projects, prompts, templates, validation, runner behavior, engine behavior, and orchestration. |

## Validation-sensitive surfaces

Generated role prompts and workflow files include deterministic freshness metadata and rendered-body hashes. Validation compares those files against the current renderer and flags stale, malformed, or manually tampered surfaces.

Project validation also checks starter docs, engine source markers, read-only command behavior, forbidden legacy artifacts, and future-only CLI drift.

See [Workflow Validation](workflow-validation.md) for the full validation contract.
