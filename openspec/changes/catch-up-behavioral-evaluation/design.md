# Behavioral Evaluation Catch-Up Design

## Architecture
Add a lightweight, local, deterministic behavioral evaluation framework for OGS roles/workflows/templates that catches weak prompt contracts without requiring hosted evaluators or telemetry. The implementation should extend the existing TypeScript registries and renderers instead of introducing a separate orchestration platform. Built-in depth belongs in package-shipped registries/assets; project-specific depth belongs in explicit reviewable local files.

## Current Gap Evidence
Open Game Studio validates CLI and generated-surface mechanics, but CCGS includes a skill/agent testing framework and rubrics that evaluate workflow and prompt behavior more directly.

## Key Decisions
1. Preserve Open Game Studio's local-first, Codex-native runtime.
2. Make added depth discoverable and validated, but do not force it into every prompt.
3. Select context by role/workflow/task relevance; never load all roles, all workflows, all templates, or all engine references for one run.
4. Keep implementation tasks test-first and package-smoke verified where package assets change.

## Data And Surface Contracts
- `tests/`
- `src/validation.ts`
- `src/codex-prompts.ts`
- `src/workflows.ts`
- `docs/system-verification.md`
- `docs/workflow-validation.md`
- `package.json`

## Alternatives Rejected
- Directly copying CCGS `.claude/**` files into generated projects: rejected because OGS is Codex-native and uses `AGENTS.md` / `.codex/**`.
- Adding a general agent orchestrator or background controller: rejected by product boundary.
- Adding broad prompt bundles that include every reference file: rejected because depth must come from selected context.

## Risks And Mitigations
- Prompt bloat: add renderer tests and selected-context assertions.
- Registry drift: update validation to fail when a registry entry lacks materialized/generated/package coverage.
- Product-boundary drift: keep future-only/deferred surfaces absent and add negative tests when relevant.
