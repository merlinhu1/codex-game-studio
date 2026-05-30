---
status: active
doc_type: architecture
truth_kind: architecture
last_reviewed: 2026-05-28
source_of_truth:
  - ../truthmark/areas/repository.md
---

# Repository Structure

## Purpose

Open GameStudio is a Node/TypeScript CLI package that installs and operates Codex-native game studio project workflows.

## Scope

This architecture note records the top-level repository boundaries needed by Truthmark routing. Bounded behavior details live in leaf docs under `docs/truth/**`; cross-cutting runtime scenario walkthroughs live in `docs/architecture/flows/**`.

## Components

- CLI command surface: `src/cli.ts`.
- Project scaffolding: `src/projects.ts`, `src/config.ts`, `src/engines.ts`, `src/agents.ts`, `src/paths.ts`, and `engine_configs/**`.
- Codex prompt and workflow surfaces: `src/roles.ts`, `src/codex-session.ts`, `src/codex-prompts.ts`, `src/workflows.ts`, `src/templates.ts`, and `templates/**`.
- Runtime/task execution: `src/runner.ts`, `src/tasks.ts`, `src/codex-runtime.ts`, and `src/verification.ts`.
- Validation: `src/validation.ts` plus the package metadata and smoke checks it verifies.
- Architecture flow guides: `docs/architecture/flows/**` explain important runtime scenarios, branch logic, and failure paths by linking back to bounded truth docs.

## Boundaries

Project scaffolding writes generated project files but does not execute Codex. Codex prompt/workflow modules render instructions but do not persist run state. Runtime/task modules execute or persist Codex runs but consume the prompt surfaces instead of defining role contracts. CLI/validation modules expose and verify the public package contract.

## Current Structure

- `src/cli.ts` owns the public CLI command wiring.
- `src/projects.ts`, `src/config.ts`, `src/engines.ts`, `src/agents.ts`, and `src/paths.ts` own project scaffolding and generated project surfaces.
- `src/roles.ts`, `src/codex-session.ts`, `src/codex-prompts.ts`, `src/workflows.ts`, and `src/templates.ts` own Codex role, prompt, workflow, and template surfaces.
- `src/runner.ts`, `src/tasks.ts`, `src/codex-runtime.ts`, and `src/verification.ts` own Codex execution, task persistence, runtime checks, and verification processes.
- `src/validation.ts` owns repository and generated-project validation checks.
- `engine_configs/**` and `templates/**` are package runtime assets.
- `tests/**` mirrors those behavior boundaries with Vitest coverage.
- `docs/architecture/flows/**` contains Markdown runtime views for project initialization, role runs, workflow prompt rendering, and validation/repository-truth workflows.

## Product Decisions

- Decision (2026-05-28): Route truth by behavior ownership rather than by mechanically mirroring every source file.
- Decision (2026-05-30): Use Markdown Architecture Flow Guides as arc42-style runtime views for detailed branching/walkthrough documentation; keep bounded Truthmark truth docs as the canonical behavior reference layer.

## Rationale

The package has a small source tree but multiple independent behavioral contracts. Truthmark routing keeps project scaffolding, prompt surfaces, runtime/task execution, and CLI/validation contracts separate so future syncs can update bounded docs instead of a catch-all repository overview.

## Maintenance Notes

Update this architecture note when source modules move across the behavior boundaries in `docs/truthmark/areas/repository.md`. Update `docs/architecture/flows/**` when an architecturally relevant runtime scenario, branch, or failure path changes.
