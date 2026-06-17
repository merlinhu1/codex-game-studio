# Engine Reference Depth Catch-Up Design

## Architecture
Deepen packaged engine references for Godot, Unity, and Unreal with module-level and plugin-level files that can be selected by relevance without bloating every prompt. The implementation should extend the existing TypeScript registries and renderers instead of introducing a separate orchestration platform. Built-in depth belongs in package-shipped registries/assets; project-specific depth belongs in explicit reviewable local files.

## Current Gap Evidence
Open Game Studio ships 12 compact engine-reference files while CCGS ships roughly 46 files with modules, plugins, deprecated APIs, breaking changes, and best-practice guidance for Godot, Unity, and Unreal.

## Key Decisions
1. Preserve Open Game Studio's local-first, Codex-native runtime.
2. Make added depth discoverable and validated, but do not force it into every prompt.
3. Select context by role/workflow/task relevance; never load all roles, all workflows, all templates, or all engine references for one run.
4. Keep implementation tasks test-first and package-smoke verified where package assets change.

## Data And Surface Contracts
- `engine_reference/`
- `src/engine-reference.ts`
- `src/engines.ts`
- `src/prompt-context.ts`
- `src/validation.ts`
- `tests/engine-system.test.ts`
- `tests/codex-context-files.test.ts`
- `docs/truthmark/engineering/codex/runtime-and-tasks.md`

## Alternatives Rejected
- Directly copying CCGS `.claude/**` files into generated projects: rejected because OGS is Codex-native and uses `AGENTS.md` / `.codex/**`.
- Adding a general agent orchestrator or background controller: rejected by product boundary.
- Adding broad prompt bundles that include every reference file: rejected because depth must come from selected context.

## Risks And Mitigations
- Prompt bloat: add renderer tests and selected-context assertions.
- Registry drift: update validation to fail when a registry entry lacks materialized/generated/package coverage.
- Product-boundary drift: keep future-only/deferred surfaces absent and add negative tests when relevant.
