---
status: active
truth_kind: product-capability
last_reviewed: 2026-06-26
---

# Open Game Studio Codex-Native CLI

## Capability Promise

Open Game Studio provides a local-first TypeScript CLI for Codex-assisted game development inside a repository.

The CLI must let developers scaffold projects, render bounded Codex-native prompts, run selected studio roles and workflows, and record reviewable project state.

It must also validate generated surfaces.

It must not require a hosted service, daemon, hidden memory layer, or heavyweight studio process.

## Users And Value

The primary users are developers who want Codex help for game creation while keeping files and evidence visible in the repository.

The product protects lightweight prototype work by keeping studio depth optional. It also supports structured game-studio workflows when a project needs them.

## Capability Scope

This capability includes the user-visible Open Game Studio package and CLI.

It covers project initialization, role/workflow prompt rendering, direct Codex execution, task state, approval/write-policy primitives, and engine reference packaging.

It also covers generated project files and validation.

This capability excludes game-engine functionality and hosted orchestration. It includes explicit local task orchestration when state, approvals, selected context, locks, runs, and failures are reviewable in `.codex/**`.

It also excludes background autonomous control, CI/release enforcement, hidden checkpoint/memory systems, and mandatory studio ceremony for small prototypes.

Truthmark is repository workflow tooling for this checkout. Open Game Studio must not present Truthmark mechanics as game-studio product features.

## Current Product Behavior

Open Game Studio exposes npm package scripts and a built CLI for initialization, management, template listing, validation, and Codex-oriented role execution.

Generated projects use `AGENTS.md` and `.codex/**` surfaces instead of legacy `CODEX.md` contracts.

Direct Codex execution through `opengamestudio run <role>` is the default runtime path.

`--dry-run` and `--print-prompt` remain inspection-only paths.

The current repository includes metadata-validated engine reference material for Godot, Unity, and Unreal.

It also includes context-manifest generation, project task state, approval-store behavior, role/workflow registries, and behavioral-evaluation scenarios.

It includes project-local customization packs and validation coverage for package assets and generated surfaces.

Built-in role prompts use bounded structured contracts.

These contracts cover responsibilities, expected inputs, output formats, quality gates, collaboration notes, and stop conditions.

Built-in role prompts do not clone broad external agent bodies.

Project-local customization uses `.codex/studio/config.json` as an extend-only overlay for `custom-*` roles, workflows, and templates.

Customization uses path-safe validation and generic workflow rendering. It does not replace built-in registries.

Engine reference depth is packaged as active-engine version, best-practice, deprecated API, breaking-change, module, and plugin files.

Engine reference files are selected by role/task relevance instead of being loaded wholesale.

The workflow catalog is a curated prompt-only game-development surface.

It covers onboarding, discovery, design, architecture, implementation planning, QA, testing, release, hotfix, localization, accessibility, and team coordination.

The workflow catalog is not a hidden lifecycle controller.

The production template pack covers design, architecture, art, audio, UX, accessibility, QA, release, production risk, economy, difficulty, player journey, and pitch artifacts.

Production templates are package-shipped assets selected by relevance.

## Acceptance Criteria

- Developers can initialize and manage project scaffolds through the package CLI.
- Generated project files remain reviewable in the repository.
- Role and workflow execution stays Codex-native by default.
- Role and workflow execution does not require a hosted service, daemon, or alternate agent runtime.
- Prompt and context materialization selects relevant roles, workflows, templates, engine references, and customization entries.
- Prompt and context materialization does not load every available agent or template for a single task.
- Mutating runtime behavior is visible and policy-gated.
- Dry-run and print-prompt paths do not mutate project state.
- Generated project contracts use `AGENTS.md` and `.codex/**`.
- Stale generated-project compatibility surfaces are not reintroduced without an explicit boundary change.
- Validation commands and tests cover public CLI/package behavior, generated surfaces, engine references, and future-only surfaces.

## Product Decisions

- 2026-06-13: Open Game Studio is a local-first Codex-native CLI/package for game-development repository workflows.
- 2026-06-13: Open Game Studio is not a hosted studio service, daemon, general-purpose orchestrator, or game engine.
- 2026-06-25: Explicit local task orchestration is inside the product boundary when it remains Codex-native, file-backed, bounded by selected context, policy-gated, and validated.
- 2026-06-26: Foreground task orchestration is exposed through `task orchestrate` with bounded concurrency, transient `.codex/locks/`, workflow task recipes, and no hosted/background/unbounded behavior.
- 2026-06-13: Studio depth is optional and mode-controlled.
- 2026-06-13: Lifecycle stage must remain separate from process strictness.
- 2026-06-13: Generated project instruction contracts use `AGENTS.md` and `.codex/**`.
- 2026-06-13: Generated project instruction contracts do not use `CODEX.md` or legacy compatibility shims.
- 2026-06-26: Planner/next, telemetry, hard ownership enforcement, hosted/background orchestration, unbounded parallelism, and similar surfaces remain out of scope unless a later product-boundary decision, implementation, tests, and truth docs bring them in.
- 2026-06-13: Truthmark-backed docs guard repository truth in this checkout.
- 2026-06-13: Truthmark workflow mechanics are not Open Game Studio product features.
- 2026-06-17: Project-local customization is an extend-only, file-backed overlay for `custom-*` roles, workflows, and templates.
- 2026-06-17: Project-local customization must remain Codex-native, reviewable, path-safe, and non-hosted.

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
- First-class non-Codex runtime replacements unless a future product-boundary update changes that direction.

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
- ../../../src/customization.ts
- ../../../src/runner.ts
- ../../../src/validation.ts
- ../../../tests/functionality-gap-pass.test.ts
- ../../../tests/project-workflow.test.ts
- ../../../tests/runner.test.ts
- ../../../tests/validation.test.ts
