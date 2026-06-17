# Production Template Depth Catch-Up Proposal

## Why
Open Game Studio has 13 templates while CCGS has roughly 40 production templates spanning design, architecture, QA, release, UX, audio, art, risk, and postmortem artifacts.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## What Changes
- Add production templates for ADR, technical design, architecture traceability, art bible, sound bible, UX spec, accessibility requirements, test plan, test evidence, sprint plan, vertical-slice report, release notes, postmortem, risk register, economy model, difficulty curve, player journey, pitch document.
- Represent each template in the template registry with category, path, short description, and relevant workflow/role hints.
- Update package files and pack/install smoke checks so installed CLI can load the new templates from a temp cwd.
- Add relevance-selection tests that a workflow includes only its mapped templates, not the whole pack.

## Product Boundary Check
- Improves: Add a richer built-in template pack for game production artifacts while keeping templates package-shipped, listed, selected by workflow relevance, and validated through npm pack smoke tests.
- In-scope surfaces: templates/, src/templates.ts, src/prompt-context.ts, src/validation.ts, tests/agents-templates.test.ts, tests/functionality-gap-pass.test.ts, tests/validation.test.ts, package.json
- Lightweight prototype use: preserved; new depth is opt-in and selected by role/workflow relevance.
- Codex-native contract: preserved; built around `AGENTS.md`, `.codex/**`, npm package assets, and `opengamestudio` commands.
- Reviewable evidence: source files, generated project files, tests, validation output, and OpenSpec artifacts.
- Explicit non-goals: no telemetry, planner/next, parallel orchestration, hosted daemon, hidden memory, non-Codex runtime replacement, or mandatory heavyweight lifecycle.

## Impact
- Source: templates/, src/templates.ts, src/prompt-context.ts, src/validation.ts, tests/agents-templates.test.ts, tests/functionality-gap-pass.test.ts, tests/validation.test.ts, package.json
- Tests: focused Vitest suites plus `npm run validate`.
- Docs/truth: update routed Truthmark engineering/product docs only when implementation changes behavior; this proposal itself is planning-only.
