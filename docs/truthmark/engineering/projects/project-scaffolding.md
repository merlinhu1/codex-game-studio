---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-29
---

# Project Scaffolding

## Purpose

Project scaffolding records project-specific state inside a cloned Codex Game Studio template repository.

The template repository already contains the game-facing Codex agents, workflows, skills, and root instructions.

## Scope

This leaf doc owns project initialization, project state, engine-specific files and folders, active-engine reference materialization, and read-only project status/resume behavior.

It owns stateful `.codex/**` files such as `studio.json`, approval state, context manifests, run folders, task state, and project config.

It does not own the instruction bodies in `AGENTS.md`, `.codex/agents/*.toml`, `.codex/workflows/*.md`, or `.agents/skills/*/SKILL.md`.

It does not own Codex run execution, task lifecycle persistence after creation, or repository-level CLI validation.

## Current Implementation Behavior

- `init` and `new` share the same initialization path.
- Initialization requires `--name`, `--engine`, `--mode`, and `--non-interactive`.
- Initialization accepts optional `--studio-mode` and defaults it to `guided-studio`.
- Initialization writes project state into the current repository root by default.
- Initialization rejects an existing different root project unless force refresh is explicit.
- Project state is written to `.codex/studio.json`.
- Project state uses schema version 1 and product `codex-game-studio`.
- Project state records project summary fields, lifecycle `mode`, policy `studioMode`, project-scoped roles, active roles, active engine specialist, and workflow IDs.
- Initialization writes an empty versioned `.codex/approvals.json` approval store.
- Initialization writes `.codex/studio/config.json` as an extend-only customization seed.
- The default customization file contains no local roles, workflows, or templates.
- Projects can add `custom-*` IDs without overriding built-in IDs.
- Initialization writes `.codex/context-manifest.json` and `.codex/context-manifest.meta.json`.
- The manifest records selected context entries with source path, reason, required flag, budget metadata, safety classification, and selection status.
- Freshness hashes and inputs live only in the context-manifest metadata sidecar.
- Initialization materializes only the active engine reference pack.
- Active engine references are copied under `docs/engine-reference/<engine>/` from packaged `engine_reference/<engine>/` assets before the context manifest is written.
- Context selection rejects unsafe, secret-like, generated-output, build-output, binary, and non-file paths before budget allocation.
- Existing required entries receive budget priority.
- Required entries must still fit file-count, per-entry character, and total character budgets.
- Default context manifest requests include selected active-engine reference files.
- Default context manifest requests do not include unrelated engine packs.
- Engine scaffolding uses the configured engine registry for Godot, Unity, and Unreal markers and source folders.
- Initialization writes starter design docs, production docs, market docs, engine marker files, state files, and runtime folders.
- Initialization does not create or overwrite `AGENTS.md`.
- Initialization does not create or overwrite `.codex/agents/*.toml`.
- Initialization does not create or overwrite `.codex/workflows/*.md`.
- Initialization does not create or overwrite `.agents/skills/*/SKILL.md`.
- Project-scoped roles include all non-specialist catalog roles.
- Project-scoped roles include exactly one active engine specialist role.
- Runtime role prompt packets are assembled in memory from tracked custom agents, typed role metadata, selected templates, and project state.
- Runtime role prompt packets are not mirrored to `.codex/prompts/**` during initialization.
- `status` and `resume` read project state without mutating `.codex/studio.json`.
- `freeze` intentionally changes project status to `frozen`.

## Core Rules

- Project creation is deterministic and non-interactive.
- Missing `--non-interactive` or `--mode` is an error.
- Omitted `--studio-mode` uses `guided-studio`.
- Projects use the current repository root as the project workspace.
- Users get template instruction files by cloning the template repository.
- `init` must not copy template instruction files back into the cloned repository.
- `CODEX.md`, `project_orchestrator.md`, `.gamestudio/runs`, `.codex/hooks.json`, coding-standard `.codex/rules/*.rules`, and Truthmark maintenance agents are forbidden game-facing project surfaces.
- Wrong-engine specialist agents may exist as tracked template files but runtime validation selects the active engine specialist for project state.
- Template instruction freshness is reviewed through Git, not generated-surface metadata.
- Generated-surface freshness metadata is not required for tracked agents, workflows, or skills.

## Flows And States

- Initialization parses options, normalizes engine, derives slug, and rejects collisions.
- It creates root game engine files, project files, and `.codex/runs`.
- It writes the empty approval store, studio state, and default customization config.
- It writes starter docs.
- It materializes the active engine reference pack.
- It writes the context manifest and sidecar metadata.
- Project status states are `active`, `frozen`, and `inactive`.
- `freeze` is the only current CLI path that mutates project status.

## Contracts

- `codex-game-studio init --name <name> --engine <engine> --mode <mode> --non-interactive [--studio-mode <mode>]` initializes the current repository root and prints the created path.
- `codex-game-studio new` is an alias for initialization.
- `codex-game-studio status [--project <path>]` reads `.codex/studio.json`.
- `codex-game-studio resume [--project <path>]` reads `.codex/studio.json`.
- `codex-game-studio freeze [--project <path>]` operates on `.codex/studio.json` and changes status.

## Product Truth Links

- docs/truthmark/product/codex-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Preserve Codex-native project state under `.codex/`.
- Decision (2026-05-28): Keep status and resume read-only.
- Decision (2026-05-28): Inspection commands must not alter project state.
- Decision (2026-06-13): Persist studio policy mode separately from lifecycle mode.
- Decision (2026-06-13): Store context manifest freshness metadata in a sidecar.
- Decision (2026-06-13): Keep the manifest body as stable JSON describing selected context.
- Decision (2026-06-13): Detect stale project-stage and studio-mode inputs separately.
- Decision (2026-06-14): Materialize packaged engine references only for the active engine.
- Decision (2026-06-14): Select prompt/context entries by relevance instead of loading all engine packs.
- Decision (2026-06-14): Keep all specialist IDs in the canonical role catalog.
- Decision (2026-06-17): Initialize `.codex/studio/config.json` as an extend-only customization overlay.
- Decision (2026-06-17): Let users add `custom-*` roles, workflows, and templates without replacing built-ins.
- Decision (2026-06-29): Treat the clone checkout root as the game root; do not maintain a script-installed or nested project compatibility mode.
- Decision (2026-06-29): Treat Codex agents, workflows, and skills as tracked template repository surfaces.
- Decision (2026-06-29): Do not generate, copy, or overwrite agent, workflow, or skill instruction bodies during `init`.
- Decision (2026-06-29): Assemble runtime role prompt packets in memory instead of materializing `.codex/prompts/**` mirrors.

## Rationale

A deterministic scaffold gives Codex stable project state without hiding template behavior inside generators.

Clone-visible template files keep the game-facing assistant surface reviewable in Git.

## Non-Goals

- This doc does not own runtime Codex execution.
- This doc does not own task-store status transitions after project creation.
- This doc does not define game engine runtime behavior beyond initial marker files, folders, and selected seed references.
- This doc does not own approval matching, revocation, expiry, or scope normalization rules.

## Maintenance Notes

- Update this doc when project initialization behavior changes.
- Update this doc when context manifest, config, engine, path, engine config, or engine reference assets change.
- Update the template-surface docs when `AGENTS.md`, `.codex/agents`, `.codex/workflows`, or `.agents/skills` behavior changes.
- Relevant verification includes project workflow, template-repository, engine-system, context-file, and project validation tests.

## Source References

- ../../routes/areas/repository.md
- ../../../../src/projects.ts
- ../../../../src/context-manifest.ts
- ../../../../src/config.ts
- ../../../../src/engines.ts
- ../../../../src/engine-reference.ts
- ../../../../src/agents.ts
- ../../../../src/skills.ts
- ../../../../src/paths.ts
- ../../../../src/generated-surfaces.ts
- ../../../../src/customization.ts
- ../../../../engine_configs/**
- ../../../../engine_reference/**
- ../../../../tests/project-workflow.test.ts
- ../../../../tests/template-repository-surfaces.test.ts
- ../../../../tests/engine-system.test.ts
- ../../../../tests/codex-context-files.test.ts
