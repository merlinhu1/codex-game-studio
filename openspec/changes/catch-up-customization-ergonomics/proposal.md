# Customization Ergonomics Catch-Up Proposal

## Why
CCGS users can edit `.claude/agents`, `.claude/skills`, `.claude/rules`, and hooks directly. OGS is cleaner as a package but less no-code/custom-pack friendly because built-ins live primarily in TypeScript registries.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## What Changes
- Design `opengamestudio.config.json` or `.codex/studio/config.json` extension points for project-local role/workflow/template packs.
- Define schema rules for custom role ids, workflow ids, template metadata, path containment, override/extend behavior, and conflict diagnostics.
- Update init/validate/status/templates list/run prompt paths to load validated local packs.
- Add tests for valid custom packs, duplicate ids, unsafe paths, missing template files, and built-in override policy.
- Document examples that edit local pack files instead of editing package source.

## Product Boundary Check
- Improves: Add project-local customization packs for roles, workflows, templates, and studio policy that are schema-validated, visible in the repo, and safely merged with built-ins without becoming a general plugin/orchestrator platform.
- In-scope surfaces: src/config.ts, src/roles.ts, src/workflows.ts, src/templates.ts, src/validation.ts, src/projects.ts, tests/validation.test.ts, tests/project-workflow.test.ts, docs/setup.md, docs/examples.md
- Lightweight prototype use: preserved; new depth is opt-in and selected by role/workflow relevance.
- Codex-native contract: preserved; built around `AGENTS.md`, `.codex/**`, npm package assets, and `opengamestudio` commands.
- Reviewable evidence: source files, generated project files, tests, validation output, and OpenSpec artifacts.
- Explicit non-goals: no telemetry, planner/next, parallel orchestration, hosted daemon, hidden memory, non-Codex runtime replacement, or mandatory heavyweight lifecycle.

## Impact
- Source: src/config.ts, src/roles.ts, src/workflows.ts, src/templates.ts, src/validation.ts, src/projects.ts, tests/validation.test.ts, tests/project-workflow.test.ts, docs/setup.md, docs/examples.md
- Tests: focused Vitest suites plus `npm run validate`.
- Docs/truth: update routed Truthmark engineering/product docs only when implementation changes behavior; this proposal itself is planning-only.
