# Role Prompt Sophistication Catch-Up Proposal

## Why
Open Game Studio roles are compact and maintainable, but CCGS agents include richer responsibilities, collaboration protocol, delegation guidance, output formats, domain standards, and quality gates.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## What Changes
- Extend the role package model with optional structured sections: responsibilities, inputs to inspect, outputs, quality gates, collaboration notes, stop conditions, and handoff format.
- Move repeated guidance into shared compact fragments rendered only when relevant.
- Add role-specific output schemas/checklists for high-value roles before expanding every role.
- Add tests that rendered role prompts include required sections and remain under explicit size/breadth limits.

## Product Boundary Check
- Improves: Upgrade built-in role packages from compact prompts into richer structured role contracts while preventing prompt bloat and preserving Codex-native single-role execution.
- In-scope surfaces: src/roles.ts, src/codex-prompts.ts, src/agents.ts, src/generated-surfaces.ts, tests/codex-prompts.test.ts, tests/roles.test.ts, tests/agents-templates.test.ts, docs/truthmark/engineering/codex/roles-and-workflows.md
- Lightweight prototype use: preserved; new depth is opt-in and selected by role/workflow relevance.
- Codex-native contract: preserved; built around `AGENTS.md`, `.codex/**`, npm package assets, and `opengamestudio` commands.
- Reviewable evidence: source files, generated project files, tests, validation output, and OpenSpec artifacts.
- Explicit non-goals: no telemetry, planner/next, parallel orchestration, hosted daemon, hidden memory, non-Codex runtime replacement, or mandatory heavyweight lifecycle.

## Impact
- Source: src/roles.ts, src/codex-prompts.ts, src/agents.ts, src/generated-surfaces.ts, tests/codex-prompts.test.ts, tests/roles.test.ts, tests/agents-templates.test.ts, docs/truthmark/engineering/codex/roles-and-workflows.md
- Tests: focused Vitest suites plus `npm run validate`.
- Docs/truth: update routed Truthmark engineering/product docs only when implementation changes behavior; this proposal itself is planning-only.
