# Behavioral Evaluation Catch-Up Proposal

## Why
Open Game Studio validates CLI and generated-surface mechanics, but CCGS includes a skill/agent testing framework and rubrics that evaluate workflow and prompt behavior more directly.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## What Changes
- Define an evaluation fixture format for role/workflow scenarios with expected prompt obligations and forbidden drift.
- Add static behavior checks for required sections, relevant templates, selected context, forbidden future-only surfaces, and output contract coverage.
- Add representative scenarios for core workflows and new catch-up roles.
- Expose evaluation through npm scripts or validation subchecks only if it stays local and deterministic.
- Document how to add a scenario when a role/workflow is added.

## Product Boundary Check
- Improves: Add a lightweight, local, deterministic behavioral evaluation framework for OGS roles/workflows/templates that catches weak prompt contracts without requiring hosted evaluators or telemetry.
- In-scope surfaces: tests/, src/validation.ts, src/codex-prompts.ts, src/workflows.ts, docs/system-verification.md, docs/workflow-validation.md, package.json
- Lightweight prototype use: preserved; new depth is opt-in and selected by role/workflow relevance.
- Codex-native contract: preserved; built around `AGENTS.md`, `.codex/**`, npm package assets, and `opengamestudio` commands.
- Reviewable evidence: source files, generated project files, tests, validation output, and OpenSpec artifacts.
- Explicit non-goals: no telemetry, planner/next, parallel orchestration, hosted daemon, hidden memory, non-Codex runtime replacement, or mandatory heavyweight lifecycle.

## Impact
- Source: tests/, src/validation.ts, src/codex-prompts.ts, src/workflows.ts, docs/system-verification.md, docs/workflow-validation.md, package.json
- Tests: focused Vitest suites plus `npm run validate`.
- Docs/truth: update routed Truthmark engineering/product docs only when implementation changes behavior; this proposal itself is planning-only.
