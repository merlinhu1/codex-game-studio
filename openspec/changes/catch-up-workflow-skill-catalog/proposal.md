# Workflow And Skill Catalog Catch-Up Proposal

## Why
Open Game Studio has 13 workflow shortcuts while CCGS exposes 73 skills across onboarding, design, QA, testing, release, sprint, team, localization, hotfix, and review workflows.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## What Changes
- Create a workflow taxonomy: onboarding/discovery, design/architecture, implementation planning, QA/testing, release/hotfix, localization/accessibility, and team coordination.
- Add high-value workflow prompt shortcuts before low-value aliases: start/onboard, brainstorm, prototype, architecture-decision, architecture-review, create-epics, create-stories, sprint-plan, sprint-status, story-readiness, story-done, qa-plan, regression-suite, security-audit, perf-profile, release-checklist, hotfix, localization-plan.
- Keep workflow output prompt-only unless an existing CLI surface already owns state changes.
- Add tests for command help, workflow rendering, aliases, and project materialization.

## Product Boundary Check
- Improves: Expand workflow coverage into a curated Codex-native catalog of game-development actions without importing CCGS slash-command ceremony or turning OGS into a general task manager.
- In-scope surfaces: src/workflows.ts, src/cli.ts, src/templates.ts, src/projects.ts, src/validation.ts, tests/functionality-gap-pass.test.ts, tests/cli-prompt-surface.test.ts, tests/project-workflow.test.ts, templates/
- Lightweight prototype use: preserved; new depth is opt-in and selected by role/workflow relevance.
- Codex-native contract: preserved; built around `AGENTS.md`, `.codex/**`, npm package assets, and `opengamestudio` commands.
- Reviewable evidence: source files, generated project files, tests, validation output, and OpenSpec artifacts.
- Explicit non-goals: no telemetry, planner/next, parallel orchestration, hosted daemon, hidden memory, non-Codex runtime replacement, or mandatory heavyweight lifecycle.

## Impact
- Source: src/workflows.ts, src/cli.ts, src/templates.ts, src/projects.ts, src/validation.ts, tests/functionality-gap-pass.test.ts, tests/cli-prompt-surface.test.ts, tests/project-workflow.test.ts, templates/
- Tests: focused Vitest suites plus `npm run validate`.
- Docs/truth: update routed Truthmark engineering/product docs only when implementation changes behavior; this proposal itself is planning-only.
