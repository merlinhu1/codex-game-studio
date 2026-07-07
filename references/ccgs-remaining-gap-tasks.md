# Remaining CCGS Gap Tasks

Source evidence:

- CCGS reference root: `/opt/data/repos/Claude-Code-Game-Studios`
- Generated parity report: `references/ccgs-surface-parity-matrix.json`
- Generated parity summary: `references/ccgs-surface-parity-matrix.md`

## Current state

- Implemented parity rows: 218
- Remaining parity rows: 0
- Deferred parity rows: 0
- Out-of-scope parity rows: 0
- Remaining role rows: 0
- Remaining workflow-step rows: 0
- Remaining template rows: 0
- Remaining rule rows: 0
- Remaining skill rows: 0

Prompt-surface metadata completion is not the same as full CCGS product-parity completion. The prompt-surface audit checks local metadata, depth, and source traceability; this report tracks broader CCGS parity rows that still need product decisions or implementation.

## Role package gaps

No remaining rows.

## Workflow-step gaps

No remaining rows.

## Template gaps

No remaining rows.

## Rule adaptation gaps

No remaining rows.

## Skill gaps

No remaining rows.

## Close-the-gap acceptance criteria

1. Every remaining row is either implemented with tests, explicitly deferred with rationale, or marked out of scope.
2. Direct role-package gaps update `src/roles.ts` and role/template validation tests.
3. Workflow-step gaps update workflow catalog, aliases, recipes, or documented non-adoption decisions.
4. Template gaps add package templates only where workflow output contracts need them.
5. Rule gaps become Codex-native standards skills, docs, or selected engine-reference context; they are not copied as Claude rule files.
6. `npm run typecheck`, `npm test`, `npm run validate`, parity audit regeneration, and OpenSpec validation pass.
