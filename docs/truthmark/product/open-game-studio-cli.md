---
status: active
truth_kind: product-capability
last_reviewed: 2026-06-16
---

# Open Game Studio Codex-Native CLI

## Capability Promise

Open Game Studio provides a local-first, package-friendly TypeScript CLI that helps developers use Codex as a practical game-development studio inside a repository. The CLI must let developers scaffold game projects, render bounded Codex-native prompts, run selected studio roles and workflows, record reviewable project state, and validate generated surfaces without requiring a hosted service, daemon, hidden memory layer, or heavyweight studio process.

## Users And Value

The primary users are developers who want Codex help for game creation while keeping project files, prompts, tasks, approval state, and validation evidence visible in the repository. The product protects lightweight prototype work by keeping studio depth optional, while still supporting more structured game-studio workflows when a project needs them.

## Capability Scope

This capability includes the user-visible Open Game Studio package and CLI surfaces for project initialization, role/workflow prompt rendering, direct Codex execution, task state, approval/write-policy primitives, engine reference packaging, generated project files, and validation.

This capability excludes game-engine functionality, hosted orchestration, background autonomous control, CI or release enforcement, hidden checkpoint/memory systems, and mandatory studio ceremony for small prototypes. Truthmark is repository workflow tooling for this checkout; Open Game Studio must not present Truthmark mechanics as game-studio product features.

## Current Product Behavior

Open Game Studio exposes npm package scripts and a built CLI for initialization, management, template listing, validation, and Codex-oriented role execution. Generated projects use `AGENTS.md` and `.codex/**` surfaces rather than legacy `CODEX.md` contracts. Direct Codex execution through `opengamestudio run <role>` is the default runtime path; `--dry-run` and `--print-prompt` remain inspection-only paths.

The current repository also includes engine reference material for Godot, Unity, and Unreal, context-manifest generation, project task state, approval-store behavior, role/workflow registries, and validation coverage for package assets and generated surfaces.

## Acceptance Criteria

- Developers can initialize and manage project scaffolds through the package CLI while generated project files remain reviewable in the repository.
- Role and workflow execution stays Codex-native by default and does not require a hosted service, daemon, or alternate agent runtime.
- Prompt and context materialization selects relevant roles, workflows, templates, and engine references instead of loading every available agent or template for a single task.
- Mutating runtime behavior is visible and policy-gated; dry-run and print-prompt paths do not mutate project state.
- Generated project contracts use `AGENTS.md` and `.codex/**`; stale generated-project compatibility surfaces are not reintroduced without an explicit boundary change.
- Validation commands and tests cover public CLI/package behavior, generated surfaces, engine references, and future-only surfaces remaining absent until implemented.

## Product Decisions

- 2026-06-13: Open Game Studio is a local-first Codex-native CLI/package for game-development repository workflows, not a hosted studio service, daemon, general orchestrator, or game engine.
- 2026-06-13: Studio depth is optional and mode-controlled; lifecycle stage must remain separate from process strictness.
- 2026-06-13: Generated project instruction contracts use `AGENTS.md` and `.codex/**`, not `CODEX.md` or legacy compatibility shims.
- 2026-06-13: Planner/next, telemetry, parallel orchestration, hard ownership enforcement, and similar future-only surfaces must remain absent until implementation, tests, and docs exist.
- 2026-06-13: Truthmark-backed docs guard repository truth in this checkout, but Truthmark workflow mechanics are not Open Game Studio product features.

## Engineering Realization Links

- docs/truthmark/engineering/projects/project-scaffolding.md
- docs/truthmark/engineering/codex/roles-and-workflows.md
- docs/truthmark/engineering/codex/runtime-and-tasks.md
- docs/truthmark/engineering/codex/approval-stores.md
- docs/truthmark/engineering/contracts/cli-and-validation.md

## Non-Goals

- Game-engine implementation or replacement of Godot, Unity, Unreal, or their native toolchains.
- Hosted accounts, server-side orchestration, daemons, schedulers, or hidden long-running workflow controllers.
- General-purpose task management, PR approval, CI enforcement, or release governance unrelated to the game-studio CLI boundary.
- Hidden long-term memory, checkpoint storage, telemetry, or analytics platforms outside reviewable project files or deterministic CLI output.
- Mandatory heavyweight studio-process adoption for prototype or solo-game work.
- First-class non-Codex runtime replacements unless a future product-boundary update explicitly changes that direction.

## Source References

- ../../../README.md
- ../../../AGENTS.md
- ../../architecture/product-boundary.md
- ../routes/areas/repository.md
- ../engineering/projects/project-scaffolding.md
- ../engineering/codex/roles-and-workflows.md
- ../engineering/codex/runtime-and-tasks.md
- ../engineering/codex/approval-stores.md
- ../engineering/contracts/cli-and-validation.md
- ../../../src/cli.ts
- ../../../src/projects.ts
- ../../../src/roles.ts
- ../../../src/workflows.ts
- ../../../src/runner.ts
- ../../../src/validation.ts
- ../../../tests/functionality-gap-pass.test.ts
- ../../../tests/project-workflow.test.ts
- ../../../tests/runner.test.ts
- ../../../tests/validation.test.ts
