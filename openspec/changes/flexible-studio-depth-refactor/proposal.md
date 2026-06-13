## Why

Open Game Studio already has a working Codex-native CLI, role runner, workflow prompts, and validation, but its current depth is shallower than Claude Code Game Studios (CCGS): role prompts are concise, broad context is ad hoc, engine guidance is minimal, and approval/session recovery workflows are not first-class. This change formalizes a flexible studio-depth refactor so Open Game Studio can offer CCGS-level usefulness without becoming a restrictive process framework.

## What Changes

- Add separate project-stage and studio-policy axes: project stage remains `design|prototype|development`, while studio mode becomes `fast-prototype|guided-studio|strict-studio`.
- Add shared mutating-execution eligibility for `run <role>` and `task run`, including approval matching, override provenance, and practical Codex sandbox selection.
- Add a structured context manifest and shared prompt-context builder for run/review/fix/workflow prompts.
- Add curated, versioned engine reference packs for Godot, Unity, and Unreal, with package/install validation and human-review metadata before engine-richness claims.
- Expand the built-in role taxonomy while preserving current user-facing capabilities such as studio orchestration, market analysis, data/analytics, UI/UX, QA, release, and handoff.
- Add workflow catalog breadth as registry data first, with selected high-value CLI aliases only.
- Add path-scoped rules and lightweight session recovery state without forcing strict ceremony on every project.
- Harden validation, installed-bin smoke tests, and docs/Truthmark closeout gates for the new clean generated-surface contract.
- **BREAKING**: generated project surfaces and internal module contracts may be recreated cleanly; no runtime compatibility shims, old-role aliases, `CODEX.md`, or `project_orchestrator.md` are added.

## Capabilities

### New Capabilities

- `studio-policy-gates`: Project-stage/studio-mode contracts, approval records, approval matching, shared write eligibility, and Codex sandbox mapping.
- `context-contract`: Context manifests, path-safe context selection, shared prompt-context rendering, path-scoped rules, and session recovery state.
- `engine-reference-packs`: Package-bundled engine reference registries and project materialization for Godot, Unity, and Unreal.
- `studio-taxonomy`: Built-in role taxonomy expansion with available/active/materialized role separation and custom-role extension lane.
- `workflow-catalog`: Registry-first workflow catalog expansion with explicit exposure and approval behavior.
- `validation-and-packaging`: Strict generated-surface validation, package asset verification, installed-bin smoke tests, parity rubrics, and docs/Truthmark closeout.

### Modified Capabilities

- None. This repository has no archived OpenSpec specs yet; all requirements are introduced as new capability specs.

## Impact

- Source modules: `src/cli.ts`, `src/config.ts`, `src/projects.ts`, `src/runner.ts`, `src/tasks.ts`, `src/codex-session.ts`, `src/context.ts`, `src/workflows.ts`, `src/templates.ts`, `src/agents.ts`, `src/roles.ts`, `src/engines.ts`, `src/validation.ts`.
- New modules likely include `src/studio-policy.ts`, `src/approvals.ts`, `src/context-manifest.ts`, `src/prompt-context.ts`, `src/engine-reference.ts`, `src/rules.ts`, and `src/session-state.ts`.
- Package assets: `engine_reference/**`, `rules/**`, selected runtime docs, `templates/**`, and existing `engine_configs/**`.
- Generated project surfaces: `AGENTS.md`, `.codex/studio.json`, `.codex/prompts/**`, `.codex/workflows/**`, `.codex/context-manifest.json`, `.codex/context-manifest.meta.json`, `.codex/approvals.json`, `.codex/rules/**` or `.codex/rules.json`, `production/session-state/active.md`, and `docs/engine-reference/<engine>/**`.
- Tests: focused Vitest suites plus built CLI/package smoke via npm scripts; `npm run validate` remains required before readiness/parity claims.
- Documentation/truth: README and Truthmark-backed docs must be updated/synced for behavior-bearing changes.
