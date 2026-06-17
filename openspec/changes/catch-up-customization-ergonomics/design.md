# Customization Ergonomics Catch-Up Design

## Architecture
Add project-local customization packs for roles, workflows, templates, and studio policy that are schema-validated, visible in the repo, and safely merged with built-ins without becoming a general plugin/orchestrator platform. The implementation should extend the existing TypeScript registries and renderers instead of introducing a separate orchestration platform. Built-in depth belongs in package-shipped registries/assets; project-specific depth belongs in explicit reviewable local files.

## Current Gap Evidence
CCGS users can edit `.claude/agents`, `.claude/skills`, `.claude/rules`, and hooks directly. OGS is cleaner as a package but less no-code/custom-pack friendly because built-ins live primarily in TypeScript registries.

## Key Decisions
1. Preserve Open Game Studio's local-first, Codex-native runtime.
2. Make added depth discoverable and validated, but do not force it into every prompt.
3. Select context by role/workflow/task relevance; never load all roles, all workflows, all templates, or all engine references for one run.
4. Keep implementation tasks test-first and package-smoke verified where package assets change.

## Data And Surface Contracts
- `src/config.ts`
- `src/roles.ts`
- `src/workflows.ts`
- `src/templates.ts`
- `src/validation.ts`
- `src/projects.ts`
- `tests/validation.test.ts`
- `tests/project-workflow.test.ts`
- `docs/setup.md`
- `docs/examples.md`

## Alternatives Rejected
- Directly copying CCGS `.claude/**` files into generated projects: rejected because OGS is Codex-native and uses `AGENTS.md` / `.codex/**`.
- Adding a general agent orchestrator or background controller: rejected by product boundary.
- Adding broad prompt bundles that include every reference file: rejected because depth must come from selected context.

## Risks And Mitigations
- Prompt bloat: add renderer tests and selected-context assertions.
- Registry drift: update validation to fail when a registry entry lacks materialized/generated/package coverage.
- Product-boundary drift: keep future-only/deferred surfaces absent and add negative tests when relevant.
