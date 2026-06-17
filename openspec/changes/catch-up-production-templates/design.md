# Production Template Depth Catch-Up Design

## Architecture
Add a richer built-in template pack for game production artifacts while keeping templates package-shipped, listed, selected by workflow relevance, and validated through npm pack smoke tests. The implementation should extend the existing TypeScript registries and renderers instead of introducing a separate orchestration platform. Built-in depth belongs in package-shipped registries/assets; project-specific depth belongs in explicit reviewable local files.

## Current Gap Evidence
Open Game Studio has 13 templates while CCGS has roughly 40 production templates spanning design, architecture, QA, release, UX, audio, art, risk, and postmortem artifacts.

## Key Decisions
1. Preserve Open Game Studio's local-first, Codex-native runtime.
2. Make added depth discoverable and validated, but do not force it into every prompt.
3. Select context by role/workflow/task relevance; never load all roles, all workflows, all templates, or all engine references for one run.
4. Keep implementation tasks test-first and package-smoke verified where package assets change.

## Data And Surface Contracts
- `templates/`
- `src/templates.ts`
- `src/prompt-context.ts`
- `src/validation.ts`
- `tests/agents-templates.test.ts`
- `tests/functionality-gap-pass.test.ts`
- `tests/validation.test.ts`
- `package.json`

## Alternatives Rejected
- Directly copying CCGS `.claude/**` files into generated projects: rejected because OGS is Codex-native and uses `AGENTS.md` / `.codex/**`.
- Adding a general agent orchestrator or background controller: rejected by product boundary.
- Adding broad prompt bundles that include every reference file: rejected because depth must come from selected context.

## Risks And Mitigations
- Prompt bloat: add renderer tests and selected-context assertions.
- Registry drift: update validation to fail when a registry entry lacks materialized/generated/package coverage.
- Product-boundary drift: keep future-only/deferred surfaces absent and add negative tests when relevant.
