# Domain Role Coverage Catch-Up Proposal

## Why
Open Game Studio has 20 roles while CCGS has 49 agents. The missing value is not raw count; it is specialist coverage for production domains that a game developer reasonably expects.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## What Changes
- Add domain clusters for audio, level/world/content, systems/economy, live ops/community/localization/accessibility, security/devops/performance/network/AI/UI programming.
- Add only roles with clear game-studio outputs and selected context strategies; do not add a role just to mirror a CCGS name.
- Update role package rendering and generated project prompt materialization for every new role.
- Add validation coverage that all role packages render and no single role run loads all roles.

## Product Boundary Check
- Improves: Expand Open Game Studio role coverage across game-development specialties while preserving bounded Codex prompts and the AGENTS.md/.codex generated-surface contract.
- In-scope surfaces: src/roles.ts, src/codex-prompts.ts, src/projects.ts, src/validation.ts, tests/roles.test.ts, tests/codex-prompts.test.ts, tests/functionality-gap-pass.test.ts, docs/truthmark/engineering/codex/roles-and-workflows.md
- Lightweight prototype use: preserved; new depth is opt-in and selected by role/workflow relevance.
- Codex-native contract: preserved; built around `AGENTS.md`, `.codex/**`, npm package assets, and `opengamestudio` commands.
- Reviewable evidence: source files, generated project files, tests, validation output, and OpenSpec artifacts.
- Explicit non-goals: no telemetry, planner/next, parallel orchestration, hosted daemon, hidden memory, non-Codex runtime replacement, or mandatory heavyweight lifecycle.

## Impact
- Source: src/roles.ts, src/codex-prompts.ts, src/projects.ts, src/validation.ts, tests/roles.test.ts, tests/codex-prompts.test.ts, tests/functionality-gap-pass.test.ts, docs/truthmark/engineering/codex/roles-and-workflows.md
- Tests: focused Vitest suites plus `npm run validate`.
- Docs/truth: update routed Truthmark engineering/product docs only when implementation changes behavior; this proposal itself is planning-only.
