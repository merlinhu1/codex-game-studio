---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-25
---

# Project Scaffolding

## Purpose

Project scaffolding turns a non-interactive CLI request into a ready Codex Game Studio project with deterministic state, engine markers, selected engine references, role prompts, workflow prompts, and starter production/design artifacts.

## Scope

This bounded leaf truth doc owns project initialization, generated project state, engine-specific file/folder creation, active-engine reference materialization, generated project `AGENTS.md` and role prompts, and read-only project status/resume behavior. It does not own Codex run execution, task lifecycle persistence, or repository-level CLI validation.

This doc was created from the editable engineering-behavior template at docs/truthmark/templates/engineering-behavior.md.

## Current Implementation Behavior

- `init` and `new` share the same initialization path and require `--name`, `--engine`, `--mode`, and `--non-interactive`; they accept optional `--studio-mode`, defaulting to `guided-studio`.
- Initialization writes projects under `projects/<slug>/`, rejects an existing target path, and checks same-parent slug and Unreal class-name collisions before writing.
- Project state is written to `.codex/studio.json` with schema version 1, product `codex-game-studio`, project summary fields, lifecycle `mode`, policy `studioMode`, the project-scoped role roster, mode-active roles plus the active engine specialist, and all workflow IDs.
- Initialization writes an empty versioned `.codex/approvals.json` approval store alongside `.codex/studio.json`.
- Initialization writes `.codex/studio/config.json` as a schema-versioned, extend-only customization pack seed. The default file contains no local roles, workflows, or templates; projects can add `custom-*` IDs without overriding built-in role/workflow/template IDs.
- Initialization writes `.codex/context-manifest.json` and `.codex/context-manifest.meta.json`. The manifest records selected context entries with source path, reason, required flag, budget metadata, safety classification, and selection status; freshness hashes and inputs live only in the metadata sidecar.
- Initialization materializes only the active engine reference pack under `docs/engine-reference/<engine>/` from packaged `engine_reference/<engine>/` assets before writing the context manifest.
- Context selection rejects unsafe, secret-like, generated/build-output, binary, and non-file paths before budget allocation. Existing required entries receive budget priority over optional entries, but required entries must still fit the file count, per-entry character, and total character budgets.
- Default context manifest requests include selected active-engine reference files and do not include unrelated engine pack files by default.
- Engine scaffolding uses the configured engine registry to create Godot, Unity, or Unreal marker files and source folders.
- Initialization writes `.codex/workflows/*.md`, starter design/production/market docs, project `AGENTS.md`, and one prompt for each project-scoped role. Project-scoped roles include all non-specialist catalog roles plus exactly the active engine specialist role for the selected engine.
- Generated role prompts and workflow files include a deterministic leading metadata header for source-input and rendered-body hashes.
- Role prompt source-input hashes cover rendered project summary fields including studio mode, role package fields, engine display name, engine version, and engine Codex hints without timestamps or absolute paths.
- `status` and `resume` read project state without mutating `.codex/studio.json`; `freeze` intentionally changes project status to `frozen`.

## Core Rules

- Project creation is deterministic and non-interactive; missing `--non-interactive` or `--mode` is an error, while omitted `--studio-mode` uses `guided-studio`.
- Generated projects live under `projects/<slug>/` by default.
- `CODEX.md`, `project_orchestrator.md`, and `.gamestudio/runs` are forbidden generated project surfaces.
- Generated project prompts must include the project name, role display name, project summary, engine context, role instructions, expected outputs, review checklist, and handoff sections.
- Generated project `AGENTS.md` and `.codex/prompts/*.md` must not list or materialize wrong-engine specialist prompts.
- Generated-surface metadata must not use timestamps, absolute paths, process IDs, run IDs, or other operational values.
- Legacy generated surfaces are only those with all generated-surface metadata markers removed; partial or malformed generated metadata, or metadata-shaped body lines outside the leading header, must be treated as invalid metadata or body tampering.

## Flows And States

- Initialization flow: parse options, normalize engine, derive slug, reject collisions, create engine files, create `.codex/runs`, write the empty approval store, write studio state, write the default extend-only customization config, write metadata-bearing workflow files, write starter docs, materialize the active engine reference pack, materialize metadata-bearing role prompts, and write the context manifest plus sidecar metadata.
- Project status states are `active`, `frozen`, and `inactive`; `freeze` is the only current CLI path that mutates status.

## Contracts

- `open-gamestudio init --name <name> --engine <engine> --mode <mode> --non-interactive [--studio-mode <mode>]` creates a project and prints the created path.
- `open-gamestudio new` is an alias for the same initialization behavior.
- `open-gamestudio status --project <path>`, `resume --project <path>`, and `freeze --project <path>` operate on `.codex/studio.json`.

## Product Truth Links

- docs/truthmark/product/open-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Preserve Codex-native project state under `.codex/` and use project-level `AGENTS.md` as the generated instruction surface.
- Decision (2026-05-28): Keep status/resume read-only so inspection commands cannot alter generated project state.
- Decision (2026-06-13): Persist studio policy mode separately from lifecycle mode in generated project state and generated prompt inputs.
- Decision (2026-06-13): Generate context manifest freshness metadata as a sidecar so the manifest body remains stable JSON describing selected context, while stale project-stage or studio-mode inputs are detected separately.
- Decision (2026-06-14): Materialize packaged engine references only for the active engine and select prompt/context entries by relevance instead of loading all engine packs.
- Decision (2026-06-14): Materialize generated project specialist prompts only for the active project engine while keeping all specialist IDs in the canonical role catalog.
- Decision (2026-06-17): Initialize a project-local `.codex/studio/config.json` customization pack as an extend-only overlay so users can add `custom-*` roles, workflows, and templates without replacing generated built-ins.

## Rationale

A deterministic project scaffold gives Codex a stable context package without introducing a separate planner database or hidden orchestration layer. Keeping generated project instructions in `AGENTS.md` aligns with Codex-native workflows and avoids a parallel `CODEX.md` contract.

## Non-Goals

- This doc does not own runtime Codex execution or task-store status transitions after project creation.
- This doc does not define game engine runtime behavior beyond the initial marker files, folders, and selected seed reference files created by the scaffolder.
- This doc does not own approval matching, revocation, expiry, or scope normalization rules; those belong to the Approval Stores truth doc.

## Maintenance Notes

- Update this doc with changes to `src/projects.ts`, `src/context-manifest.ts`, `src/config.ts`, `src/engines.ts`, `src/engine-reference.ts`, `src/agents.ts`, `src/paths.ts`, `engine_configs/**`, or `engine_reference/**`.
- Relevant verification includes project workflow, agent/template, engine-system, and project validation tests.

## Source References

- ../../routes/areas/repository.md
- ../../../../src/projects.ts
- ../../../../src/context-manifest.ts
- ../../../../src/config.ts
- ../../../../src/engines.ts
- ../../../../src/engine-reference.ts
- ../../../../src/agents.ts
- ../../../../src/paths.ts
- ../../../../src/generated-surfaces.ts
- ../../../../src/customization.ts
- ../../../../engine_configs/**
- ../../../../engine_reference/**
- ../../../../tests/project-workflow.test.ts
- ../../../../tests/agents-templates.test.ts
- ../../../../tests/engine-system.test.ts
- ../../../../tests/codex-context-files.test.ts
