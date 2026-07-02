## Why

The generated gap report now exposes 20 remaining direct role-package depth gaps after the accessibility role upgrade. These are small, repeatable `src/roles.ts` contract upgrades; after they are closed, the next remaining work shifts to larger product-boundary decisions around engine sub-specialists, workflows, templates, and rules.

## What Changes

- Upgrade the remaining direct CCGS role package gaps with explicit Codex-native contract depth.
- Mark those role ids as CCGS parity-upgraded once their role packages include responsibilities, output schema, quality gates, handoff guidance, and stop conditions.
- Add tests that all remaining direct role gaps are upgraded and that parity no longer reports direct `adapt` role gaps.
- Regenerate parity references and stop before engine sub-specialist, workflow, template, and rule categories.

## Capabilities

### New Capabilities

- `ccgs-direct-role-depth-batch`: Batch closure of small direct CCGS role-package depth gaps.

### Modified Capabilities

None.

## Impact

- `src/roles.ts`
- `tests/roles.test.ts`
- `tests/ccgs-parity-audit.test.ts`
- `references/ccgs-remaining-gap-tasks.md`
- `references/ccgs-surface-parity-matrix.json`
- `references/ccgs-surface-parity-matrix.md`
