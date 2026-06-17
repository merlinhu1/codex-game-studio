# Engine Reference Depth Catch-Up Proposal

## Why
Open Game Studio ships 12 compact engine-reference files while CCGS ships roughly 46 files with modules, plugins, deprecated APIs, breaking changes, and best-practice guidance for Godot, Unity, and Unreal.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## What Changes
- Add per-engine `current-best-practices.md`, `deprecated-apis.md`, `breaking-changes.md`, and module files for animation, audio, input, navigation, networking, physics, rendering, UI.
- Add plugin references for Unity Addressables/Cinemachine/DOTS and Unreal GAS/Common UI/PCG where in-scope.
- Add reference metadata: engine, version reviewed, source/review date, tags, applicable roles/workflows.
- Update context selection so engine-specialist prompts select only relevant module/plugin references.
- Validate package shipping and temp-cwd installed-bin access.

## Product Boundary Check
- Improves: Deepen packaged engine references for Godot, Unity, and Unreal with module-level and plugin-level files that can be selected by relevance without bloating every prompt.
- In-scope surfaces: engine_reference/, src/engine-reference.ts, src/engines.ts, src/prompt-context.ts, src/validation.ts, tests/engine-system.test.ts, tests/codex-context-files.test.ts, docs/truthmark/engineering/codex/runtime-and-tasks.md
- Lightweight prototype use: preserved; new depth is opt-in and selected by role/workflow relevance.
- Codex-native contract: preserved; built around `AGENTS.md`, `.codex/**`, npm package assets, and `opengamestudio` commands.
- Reviewable evidence: source files, generated project files, tests, validation output, and OpenSpec artifacts.
- Explicit non-goals: no telemetry, planner/next, parallel orchestration, hosted daemon, hidden memory, non-Codex runtime replacement, or mandatory heavyweight lifecycle.

## Impact
- Source: engine_reference/, src/engine-reference.ts, src/engines.ts, src/prompt-context.ts, src/validation.ts, tests/engine-system.test.ts, tests/codex-context-files.test.ts, docs/truthmark/engineering/codex/runtime-and-tasks.md
- Tests: focused Vitest suites plus `npm run validate`.
- Docs/truth: update routed Truthmark engineering/product docs only when implementation changes behavior; this proposal itself is planning-only.
