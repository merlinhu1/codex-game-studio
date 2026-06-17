---
status: active
doc_type: behavior
truth_kind: engineering-behavior
last_reviewed: 2026-05-30
source_of_truth:
  - ../../routes/areas/repository.md
  - ../../../architecture/repository-structure.md
---

# Repository Overview

## Purpose

Open Game Studio exists as a Codex-native workflow layer for game-development projects. The repository packages a TypeScript CLI that scaffolds game projects, renders role/workflow prompts for Codex, executes bounded Codex run lifecycles, and validates both repository and generated-project contracts.

## Scope

This bounded leaf truth doc summarizes the repository-level behavior surface. More specific behavior is owned by the project scaffolding, Codex role/workflow, runtime/task execution, and CLI/validation truth documents listed in `docs/truthmark/routes/areas/repository.md`.

## Current Implementation Behavior

- The package exposes the `opengamestudio` CLI from `dist/cli.js`.
- Initialization commands create deterministic generated game project structure under `projects/<slug>`.
- Generated projects contain `.codex/studio.json`, role prompt files, workflow markdown, starter design/production/market documents, engine-specific project markers, and a Codex-native `AGENTS.md` instruction surface.
- Role run commands render deterministic Codex prompts and, unless in inspection mode, execute Codex with optional verification, review, and bounded fix passes.
- Workflow shortcut commands are render-only prompt surfaces and do not imply hidden planner, parallel orchestration, telemetry, or ownership enforcement behavior.
- Validation checks package metadata, source and template presence, role/workflow rendering, behavioral-evaluation scenarios, project-local customization packs, future-surface guardrails, build output, and package install smoke behavior.

## Core Rules

- Repository behavior is grouped by behavior ownership rather than by mechanically mirroring every source file.
- Generated project instruction contracts use Codex-native `AGENTS.md`; the repository does not introduce `CODEX.md` as a primary instruction contract.
- Runtime execution is explicit: dry-run and print-prompt modes are inspection paths, while non-dry runs write prompt/run metadata before executing Codex.
- Truthmark is an injected repository-truth workflow/tooling layer for agent surfaces and documentation routing. It is not an Open Game Studio runtime feature unless product code explicitly implements Truthmark-facing behavior.

## Flows And States

Architecture runtime walkthroughs live under `docs/architecture/flows/**`; they explain branching logic and failure paths while linking back to the bounded truth docs that own the behavior.

- Project initialization flow: parse CLI input, normalize engine/config, guard against project-name collisions, create engine/project folders, write `.codex` state and workflow files, write starter docs, and materialize role prompts/instructions. See `docs/architecture/flows/project-initialization.md`.
- Role run flow: validate role/project/task, render prompt and context list, optionally return inspection output, write run cache, execute Codex, run verification/review, optionally run bounded fix passes, and report `done` or `blocked`. See `docs/architecture/flows/role-run-lifecycle.md`.
- Workflow prompt rendering flow: validate project context, resolve the workflow alias/ID, render deterministic prompt text, and return without launching Codex or writing run state. See `docs/architecture/flows/workflow-prompt-rendering.md`.
- Repository validation flow: build the package, run validation checks, and fail if any package, source, prompt, workflow, template, or future-surface contract is broken. See `docs/architecture/flows/validation-and-repository-truth.md`.

## Contracts

- Public CLI command contracts are owned by `docs/truthmark/engineering/contracts/cli-and-validation.md`.
- Role/workflow prompt contracts are owned by `docs/truthmark/engineering/codex/roles-and-workflows.md`.
- Runtime/task lifecycle contracts are owned by `docs/truthmark/engineering/codex/runtime-and-tasks.md`.
- Project scaffolding contracts are owned by `docs/truthmark/engineering/projects/project-scaffolding.md`.

## Product Truth Links

- None. This engineering overview currently summarizes repository implementation ownership directly; no separate product-lane promise is currently authored.

## Engineering Decisions

- Decision (2026-05-28): Route truth by behavior ownership rather than by mechanically mirroring every source file.
- Decision (2026-05-30): Treat Truthmark Portal output as generated non-canonical presentation; Markdown truth docs remain canonical.
- Decision (2026-05-30): Use Markdown Architecture Flow Guides as runtime-view documentation for important cross-cutting flow scenarios; bounded Truthmark truth docs remain the behavior authority.

## Rationale

The repository combines scaffolding, prompt generation, runtime execution, and validation in one package. Keeping those surfaces bounded makes the architecture easier to reason about and prevents generated agent workflow scaffolding from being mistaken for user-facing Open Game Studio product behavior.

## Non-Goals

- This doc does not replace the more specific bounded truth docs for project scaffolding, Codex role/workflow surfaces, runtime/task execution, or CLI/validation contracts.
- This repository does not expose hidden parallel orchestration, telemetry, planner/next queues, or ownership enforcement as public CLI behavior.
- Truthmark Portal HTML is generated presentation and is not canonical repository truth.

## Maintenance Notes

- Update this overview when top-level repository behavior boundaries change.
- Update the leaf truth docs named in `docs/truthmark/routes/areas/repository.md` when behavior changes within their owned surface.
- Update `docs/architecture/flows/**` when an architecturally relevant runtime branch, sequence, or failure path changes.
- Relevant verification includes `npm run validate` for behavior changes and `npx truthmark check --json` for repository-truth documentation changes.

## Source References

- ../../routes/areas/repository.md
- ../../../architecture/repository-structure.md
