## Why

The generated CCGS remaining-gap report now has no role-package gaps, but it still lists 30 unresolved CCGS workflow-step rows. The first coherent batch covers early concept, design review, architecture, controls, and accessibility documentation. These are bounded workflow/catalog surfaces, not template or rule adoption.

## What Changes

- Add the first 12 CCGS workflow-step gaps as Codex-native workflow registry entries.
- Keep the workflow phase catalog aligned so status output and artifact prerequisites reflect the same workflow ids.
- Generate tracked `.codex/workflows/*.md` prompt surfaces for the new workflow ids.
- Add TDD coverage for the workflow batch and generated CCGS parity count movement.
- Regenerate CCGS parity references so workflow-step remaining rows drop from 30 to 18.
- Defer the later production/polish/release workflow rows, templates, and rules to separate changes.

## Capabilities

### New Capabilities

- `ccgs-workflow-catalog-parity-p1`: First-batch CCGS workflow-step parity for concept/design/architecture readiness.

### Modified Capabilities

None.

## Impact

- `src/workflows.ts`
- `src/workflow-catalog.ts`
- `.codex/workflows/*.md`
- `tests/workflow-catalog.test.ts`
- `tests/ccgs-parity-audit.test.ts`
- `references/ccgs-surface-parity-matrix.json`
- `references/ccgs-surface-parity-matrix.md`
- `references/ccgs-remaining-gap-tasks.md`
