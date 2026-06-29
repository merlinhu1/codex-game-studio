# Codex Prompt Surface Uplift Plan

Canonical implementation record: `openspec/changes/codex-prompt-surface-uplift/`.

## Implemented direction

- Prompt surfaces remain tracked template files under `.codex/agents`, `.codex/workflows`, and `.agents/skills`.
- `init` does not generate or overwrite agent, workflow, or skill bodies.
- Exact Codex model policy is declared on prompt surfaces.
- Runtime commands pass the selected exact model to Codex execution.
- Validation checks model policy, source traceability, links, depth, output contracts, and optional OpenAI skill metadata.

## Model routing

- Complex design, architecture, production, and release-gate tasks: `gpt-5.5`.
- Moderate implementation, QA, docs, bugfix, and bounded workflow tasks: `gpt-5.4`.
- Simple help, status, classification, checklist, and small lookup tasks: `gpt-5.4-mini`.

## Evidence files

- `scripts/audit-prompt-surfaces.ts`
- `references/prompt-surface-uplift-matrix.json`
- `references/prompt-surface-uplift-matrix.md`
- `references/prompt-uplift-eval-protocol.md`
- `src/prompt-surface-metadata.ts`
- `tests/prompt-surface-audit.test.ts`
- `tests/prompt-surface-metadata.test.ts`
- `tests/prompt-surface-validation.test.ts`
