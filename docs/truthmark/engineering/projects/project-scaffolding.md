---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-29
---

# Project Scaffolding

## Purpose

Project scaffolding turns a non-interactive CLI request into a ready Codex Game Studio project.

The scaffold includes deterministic state, engine markers, selected engine references, role prompts, Codex custom agents, repository skills, workflow prompts, and starter production/design artifacts.

## Scope

This leaf doc owns project initialization, generated project state, engine-specific files and folders, and active-engine reference materialization.

It also owns generated project `AGENTS.md`, generated role prompts, generated `.codex/agents/*.toml`, generated `.agents/skills/**`, and read-only project status/resume behavior.

It does not own Codex run execution, task lifecycle persistence, or repository-level CLI validation.

## Current Implementation Behavior

- `init` and `new` share the same initialization path.
- Initialization requires `--name`, `--engine`, `--mode`, and `--non-interactive`.
- Initialization accepts optional `--studio-mode` and defaults it to `guided-studio`.
- Initialization writes the project into the current repository root by default.
- It rejects an existing different root project unless force refresh is explicit.
- Explicit `--nested` keeps the legacy `projects/<slug>/` layout and checks same-parent slug collisions plus Unreal class-name collisions before writing.
- Project state is written to `.codex/studio.json`.
- Project state uses schema version 1 and product `codex-game-studio`.
- Project state records project summary fields, lifecycle `mode`, policy `studioMode`, project-scoped roles, active roles, active engine specialist, and workflow IDs.
- Initialization writes an empty versioned `.codex/approvals.json` approval store.
- Initialization writes `.codex/studio/config.json` as an extend-only customization seed.
- The default customization file contains no local roles, workflows, or templates.
- Projects can add `custom-*` IDs without overriding built-in IDs.
- Initialization writes `.codex/context-manifest.json` and `.codex/context-manifest.meta.json`.
- The manifest records selected context entries with source path, reason, required flag, budget metadata, safety classification, and selection status.
- Freshness hashes and inputs live only in the metadata sidecar.
- Initialization materializes only the active engine reference pack.
- Active engine references are copied under `docs/engine-reference/<engine>/` from packaged `engine_reference/<engine>/` assets before the context manifest is written.
- Context selection rejects unsafe, secret-like, generated-output, build-output, binary, and non-file paths before budget allocation.
- Existing required entries receive budget priority.
- Required entries must still fit file-count, per-entry character, and total character budgets.
- Default context manifest requests include selected active-engine reference files.
- Default context manifest requests do not include unrelated engine packs.
- Engine scaffolding uses the configured engine registry for Godot, Unity, and Unreal markers and source folders.
- Initialization writes `.codex/workflows/*.md`, starter design docs, production docs, market docs, project `AGENTS.md`, role prompts, Codex custom-agent TOML files, and repository skills.
- Project-scoped roles include all non-specialist catalog roles.
- Project-scoped roles include exactly one active engine specialist role.
- Generated role prompts and workflow files include deterministic leading metadata.
- Metadata includes source-input and rendered-body hashes.
- Role prompt source-input hashes cover project summary fields, studio mode, role package fields, engine display name, engine version, and engine Codex hints.
- Role prompt source-input hashes exclude timestamps and absolute paths.
- `status` and `resume` read project state without mutating `.codex/studio.json`.
- `freeze` intentionally changes project status to `frozen`.

## Core Rules

- Project creation is deterministic and non-interactive.
- Missing `--non-interactive` or `--mode` is an error.
- Omitted `--studio-mode` uses `guided-studio`.
- Generated projects use the current repository root by default; `--nested` is a legacy migration escape hatch for `projects/<slug>/`.
- `CODEX.md`, `project_orchestrator.md`, `.gamestudio/runs`, `.codex/hooks.json`, coding-standard `.codex/rules/*.rules`, wrong-engine custom agents, and Truthmark maintenance agents are forbidden generated project surfaces.
- Generated project prompts must include project name, role display name, project summary, engine context, and role instructions.
- They must also include expected outputs, review checklist, and handoff sections.
- Generated project `AGENTS.md` must not list wrong-engine specialists.
- Generated `.codex/prompts/*.md` and `.codex/agents/*.toml` must not materialize wrong-engine specialists.
- Generated-surface metadata must not use timestamps, absolute paths, process IDs, run IDs, or other operational values.
- A legacy generated surface has all generated-surface metadata markers removed.
- Partial metadata, malformed metadata, or metadata-shaped body lines outside the leading header count as invalid metadata or body tampering.

## Flows And States

- Initialization parses options, normalizes engine, derives slug, and rejects collisions.
- It creates root game engine files, project files, and `.codex/runs`.
- It writes the empty approval store, studio state, and default customization config.
- It writes metadata-bearing workflow files and starter docs.
- It materializes the active engine reference pack.
- It materializes metadata-bearing role prompts, custom-agent TOML files, and repository skills.
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
- Decision (2026-05-28): Use project-level `AGENTS.md` as the generated instruction surface.
- Decision (2026-05-28): Keep status and resume read-only.
- Decision (2026-05-28): Inspection commands must not alter generated project state.
- Decision (2026-06-13): Persist studio policy mode separately from lifecycle mode.
- Decision (2026-06-13): Include studio policy mode in generated prompt inputs.
- Decision (2026-06-13): Store context manifest freshness metadata in a sidecar.
- Decision (2026-06-13): Keep the manifest body as stable JSON describing selected context.
- Decision (2026-06-13): Detect stale project-stage and studio-mode inputs separately.
- Decision (2026-06-14): Materialize packaged engine references only for the active engine.
- Decision (2026-06-14): Select prompt/context entries by relevance instead of loading all engine packs.
- Decision (2026-06-14): Materialize only the active engine specialist prompt in generated projects.
- Decision (2026-06-14): Keep all specialist IDs in the canonical role catalog.
- Decision (2026-06-17): Initialize `.codex/studio/config.json` as an extend-only customization overlay.
- Decision (2026-06-17): Let users add `custom-*` roles, workflows, and templates without replacing generated built-ins.

## Rationale

A deterministic scaffold gives Codex a stable context package. It avoids a separate planner database or hidden orchestration layer.

Generated project instructions live in `AGENTS.md` to align with Codex-native workflows. This avoids creating a parallel `CODEX.md` contract.

## Non-Goals

- This doc does not own runtime Codex execution.
- This doc does not own task-store status transitions after project creation.
- This doc does not define game engine runtime behavior beyond initial marker files, folders, and selected seed references.
- This doc does not own approval matching, revocation, expiry, or scope normalization rules.

## Maintenance Notes

- Update this doc when project initialization behavior changes.
- Update this doc when context manifest, config, engine, engine reference, agent, path, engine config, or engine reference assets change.
- Relevant verification includes project workflow, agent/template, engine-system, and project validation tests.

- Decision (2026-06-29): Treat the clone checkout root as the primary game root and keep `--nested` only for legacy migration.
- Decision (2026-06-29): Generate Codex-native custom agents under `.codex/agents/*.toml` and repository skills under `.agents/skills/*/SKILL.md`.

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
- ../../../../tests/agents-templates.test.ts
- ../../../../tests/engine-system.test.ts
- ../../../../tests/codex-context-files.test.ts
