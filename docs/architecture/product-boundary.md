---
status: active
doc_type: architecture
last_reviewed: 2026-06-29
source_of_truth:
  - ../../README.md
  - ../../AGENTS.md
---

# Codex Game Studio Product Boundary

**Audience:** humans and agents designing, planning, or changing Codex Game Studio.

**Use:** read this before creating or revising product designs, implementation plans, OpenSpec changes, role/workflow expansions, approval policy, tracked template and project-state surfaces, or runtime execution behavior.

## Mission

Codex Game Studio helps developers use Codex as a practical game-development studio inside a local repository.

The product should make it easier to start, plan, build, review, and ship games by providing a package-friendly TypeScript CLI that creates project scaffolds, renders bounded Codex prompts, manages game-studio roles and workflows, records auditable project state, and validates the tracked template and project-state surfaces.

The product exists to expand what a developer can do with Codex for game creation. It may orchestrate role-scoped Codex work when the plan, state, permissions, and handoffs stay explicit and reviewable. It must not turn game development into mandatory studio ceremony, hide the developer's intent behind an opaque orchestrator, or replace human creative and technical judgment.

## Product Shape

Codex Game Studio is:

- a local-first CLI and package for game-development repository workflows;
- Codex-native in its primary execution path;
- oriented around tracked template files such as `AGENTS.md`, `.codex/**`, templates, tasks, and validation output;
- useful for both solo/prototype work and more structured studio-style work;
- allowed to provide bounded task orchestration for role-scoped Codex runs when it remains local, explicit, file-backed, policy-gated, and validated;
- explicit about when it is rendering prompts, planning tasks, orchestrating task runs, running Codex, mutating project state, or only inspecting planned behavior.

Codex Game Studio is not:

- a game engine or replacement for engine tooling;
- a hosted service, daemon, IDE, or background workflow controller;
- a general-purpose agent platform or arbitrary workflow DAG engine outside game-studio tasks;
- a hidden memory, checkpoint, telemetry, or analytics platform;
- a CI, merge-approval, or release-enforcement product;
- a requirements-management system or heavyweight studio-process mandate;
- a clone of any reference game-studio framework or workflow library.

External tools, reference workflows, and comparison projects may inspire improvements, but designs must translate those ideas into Codex Game Studio's local, Codex-native, package-friendly boundary.

## Core Behavior Expectations

1. **Codex-native by default.** Direct Codex execution through `codex-game-studio run <role>` remains the primary runtime path. Inspection paths such as `--dry-run` and `--print-prompt` must stay non-mutating.
2. **Orchestration is now in scope when explicit.** The CLI may coordinate multiple role-scoped Codex task runs, including dependencies and bounded sequences, only when task state, selected context, approvals, locks, run metadata, and failure outcomes are visible in `.codex/**` or deterministic CLI output.
3. **Local repository files stay reviewable.** Project state, prompts, tasks, approvals, templates, and validation evidence should be visible in the working tree or deterministic CLI output, not hidden in off-repo services.
4. **Developer control comes first.** Studio depth is optional and mode-controlled. Fast prototype workflows must remain lightweight; orchestration and strict approval flows must be explicit rather than silently imposed on every project.
5. **Project stage and studio strictness are separate.** Lifecycle stage (`design`, `prototype`, `development`) must not be collapsed into process strictness (`fast-prototype`, `guided-studio`, `strict-studio`).
6. **Tracked instructions use `AGENTS.md` and `.codex/**`.** Do not add `CODEX.md`, legacy generated-project compatibility shims, or alternate instruction contracts unless a future boundary update explicitly changes this rule.
7. **Depth comes from selected context, not prompt bloat.** Registries may contain rich roles, workflows, engine references, and rules, but generated prompts and task packets should include only relevant selected material.
8. **Mutation is policy-gated and visible.** Any design that lets Codex or the CLI mutate files must specify write policy, approval/override behavior, sandbox selection, dry-run diagnostics, and where provenance is recorded.
9. **Future-only surfaces must remain absent until built.** Planner/next, telemetry, hard output-ownership enforcement, hosted orchestration, background autonomous loops, and unbounded parallelism must not appear as user-facing behavior before they have implementation, tests, and docs.
10. **Validation is part of the product.** New generated surfaces, package assets, CLI commands, orchestration behavior, and behavior-bearing docs need repo-native validation and tests before readiness or parity claims.
11. **Documentation impact is part of the game workflow.** Functional game changes require a bounded documentation-impact decision with reviewable evidence; the template does not present repository-maintenance tooling as a game-studio product feature.

## In Scope

Designs and plans may expand or refine:

- CLI commands for project initialization, status, templates, validation, tasks, approvals, role runs, explicit task orchestration, and bounded workflow shortcuts;
- generated game project files under the project root, especially `AGENTS.md`, `.codex/**`, templates, tasks, approvals, context manifests, and selected runtime docs;
- role and workflow registries that improve game-development coverage while keeping materialized prompts bounded;
- engine references for Godot, Unity, and Unreal when they are packaged, validated, reviewed, and selected by relevance;
- approval, locking, dependency, and write-policy primitives that explain or gate mutating and orchestrated behavior;
- project validation, package smoke tests, and human-readable documentation that keep generated surfaces honest.

## Out Of Scope Unless This Boundary Changes

Designs and plans must not introduce these as required product behavior:

- server-side orchestration, hosted accounts, daemons, schedulers, or background autonomous loops;
- hidden long-term memory or opaque state outside the project/repository files;
- mandatory heavyweight studio process for small prototypes;
- non-Codex execution hosts as first-class runtime replacements;
- general task management, PR approval, CI enforcement, or release governance outside the game-studio CLI boundary;
- broad prompt generation or orchestration packets that load all agents, all templates, all engine references, or all docs for a single role task;
- compatibility layers for stale generated project formats unless an explicit migration design is approved.

Optional integrations are acceptable only when the local Codex-native workflow remains understandable, reviewable, and usable without them.

## Required Product Boundary Check For Designs And Plans

Every design, plan, or OpenSpec change should answer these questions before implementation starts:

- Which part of the mission does this improve for a game developer?
- Which in-scope product surface changes: CLI, generated project files, role/workflow registry, approval policy, validation, package assets, or docs?
- Does the design preserve lightweight prototype use, or does it force unnecessary studio ceremony?
- Does it preserve Codex-native execution and the `AGENTS.md` / `.codex/**` generated-surface contract?
- What local files or deterministic outputs let a human review the change?
- What writes are allowed, what writes are forbidden, and what fails closed?
- What context is selected, and what prevents loading everything by default?
- Does it accidentally introduce a hosted service, daemon, general-purpose orchestrator, hidden memory layer, CI gate, unbounded parallelism, or heavyweight lifecycle platform?
- What tests, validation commands, and behavior-bearing docs prove the boundary remains intact?

If a design or plan cannot answer these questions, it is not ready to implement.

## Maintenance Notes

Update this boundary when Codex Game Studio's mission, runtime model, generated-surface contract, approval/write-policy model, package boundary, or explicit non-goals change. Keep it human-facing: concise enough to read before planning, concrete enough to stop product drift.
