---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-25
---

# Repository Overview

## Purpose

Open Game Studio is a Codex-native workflow layer for game-development projects.

The repository packages a TypeScript CLI.

The CLI scaffolds game projects, renders role/workflow prompts for Codex, runs bounded Codex lifecycles, and validates repository and generated-project contracts.

## Scope

This leaf doc summarizes the repository-level behavior surface.

More specific behavior is owned by leaf truth docs.

Those docs cover project scaffolding, Codex role/workflow behavior, runtime/task execution, approval stores, and CLI/validation contracts.

They are listed in `docs/truthmark/routes/areas/repository.md`.

## Current Implementation Behavior

- The package exposes the `opengamestudio` CLI from `dist/cli.js`.
- Initialization commands create deterministic game project structure under `projects/<slug>`.
- Generated projects contain `.codex/studio.json`, role prompt files, workflow markdown, starter docs, engine markers, and `AGENTS.md`.
- Role run commands render deterministic Codex prompts.
- Unless in inspection mode, role run commands execute Codex with optional verification, review, and bounded fix passes.
- Workflow shortcut commands are render-only prompt surfaces.
- Workflow shortcuts do not imply hidden planner, parallel orchestration, telemetry, or ownership enforcement behavior.
- Validation checks package metadata, source files, templates, role/workflow rendering, behavioral-evaluation scenarios, and customization packs.
- It also checks future-surface guardrails, build output, and package install smoke behavior.

## Core Rules

- Repository behavior is grouped by behavior ownership.
- Truth docs do not mechanically mirror every source file.
- Generated project instruction contracts use Codex-native `AGENTS.md`.
- The repository does not introduce `CODEX.md` as a primary instruction contract.
- Runtime execution is explicit.
- Dry-run and print-prompt modes are inspection paths.
- Non-dry runs write prompt/run metadata before executing Codex.
- Truthmark is an injected repository-truth workflow/tooling layer.
- Truthmark is not an Open Game Studio runtime feature unless product code implements Truthmark-facing behavior.

## Flows And States

Architecture runtime walkthroughs live under `docs/architecture/flows/**`.

They explain branching logic and failure paths. They also link back to the bounded truth docs that own behavior.

- Project initialization parses CLI input, normalizes engine/config, guards collisions, creates files, writes `.codex` state, writes starter docs, and materializes prompts.
- See `docs/architecture/flows/project-initialization.md`.
- Role run lifecycle validates role, project, and task.
- It renders prompt and context, may return inspection output, writes run cache, executes Codex, runs verification/review, may run fix passes, and reports `done` or `blocked`.
- See `docs/architecture/flows/role-run-lifecycle.md`.
- Workflow prompt rendering validates project context, resolves workflow alias or ID, renders deterministic prompt text, and returns without launching Codex or writing run state.
- See `docs/architecture/flows/workflow-prompt-rendering.md`.
- Repository validation builds the package, runs validation checks, and fails broken package, source, prompt, workflow, template, or future-surface contracts.
- See `docs/architecture/flows/validation-and-repository-truth.md`.

## Contracts

- Public CLI command contracts are owned by `docs/truthmark/engineering/contracts/cli-and-validation.md`.
- Role/workflow prompt contracts are owned by `docs/truthmark/engineering/codex/roles-and-workflows.md`.
- Runtime/task lifecycle contracts are owned by `docs/truthmark/engineering/codex/runtime-and-tasks.md`.
- Approval-store contracts are owned by `docs/truthmark/engineering/codex/approval-stores.md`.
- Project scaffolding contracts are owned by `docs/truthmark/engineering/projects/project-scaffolding.md`.

## Product Truth Links

- None. This engineering overview summarizes repository implementation ownership directly.

## Engineering Decisions

- Decision (2026-05-28): Route truth by behavior ownership rather than source-file mirroring.
- Decision (2026-05-30): Treat Truthmark Portal output as generated non-canonical presentation.
- Decision (2026-05-30): Keep Markdown truth docs canonical.
- Decision (2026-05-30): Use Markdown Architecture Flow Guides for important runtime-view scenarios.
- Decision (2026-05-30): Keep bounded Truthmark truth docs as behavior authority.

## Rationale

The repository combines scaffolding, prompt generation, runtime execution, approvals, and validation in one package.

Bounded truth surfaces make the architecture easier to review. They also prevent generated agent workflow scaffolding from being mistaken for user-facing product behavior.

## Non-Goals

- This doc does not replace specific leaf truth docs.
- This repository does not expose hidden parallel orchestration.
- This repository does not expose telemetry.
- This repository does not expose planner/next queues.
- This repository does not expose ownership enforcement as public CLI behavior.
- Truthmark Portal HTML is generated presentation and is not canonical repository truth.

## Maintenance Notes

- Update this overview when top-level repository behavior boundaries change.
- Update leaf truth docs when behavior changes within their owned surface.
- Update `docs/architecture/flows/**` when relevant runtime branches, sequences, or failure paths change.
- Relevant verification includes `npm run validate` for behavior changes.
- Relevant verification includes `truthmark check --json` for repository-truth documentation changes.

## Source References

- ../../routes/areas/repository.md
- ../../../architecture/repository-structure.md
- ../../../architecture/flows/project-initialization.md
- ../../../architecture/flows/role-run-lifecycle.md
- ../../../architecture/flows/workflow-prompt-rendering.md
- ../../../architecture/flows/validation-and-repository-truth.md
- ../../../../package.json
- ../../../../src/cli.ts
- ../../../../src/projects.ts
- ../../../../src/runner.ts
- ../../../../src/validation.ts
