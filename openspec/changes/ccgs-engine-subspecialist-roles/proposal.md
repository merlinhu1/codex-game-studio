## Why

The generated CCGS remaining-gap report still lists 12 engine sub-specialist role rows as unresolved product-decision gaps. CCGS treats these as first-class engine-scoped agents, and Codex Game Studio can adopt the same useful structure without copying Claude runtime delegation or adding hidden orchestration.

## What Changes

- Add the 12 CCGS engine sub-specialists as Codex-native `StudioRoleId` values with compact role contracts.
- Introduce explicit engine role sets so projects list and activate only the parent specialist plus sub-specialists matching the selected engine.
- Reject wrong-engine parent and sub-specialist runs before prompt generation.
- Route sub-specialists to relevant engine-reference files without loading every engine reference by default.
- Regenerate tracked `.codex/agents/*.toml` surfaces and CCGS parity reports so the 12 role-package gaps close.
- Preserve lightweight prototype use: sub-specialists are available as direct run targets and handoff owners, not automatic hidden Task-tool fanout.

## Capabilities

### New Capabilities

- `ccgs-engine-subspecialist-roles`: Engine-scoped Codex role sets and CCGS-derived sub-specialist role packages.

### Modified Capabilities

None.

## Impact

- `src/roles.ts`
- `src/config.ts`
- `src/engine-reference.ts`
- `src/runner.ts`
- `src/validation.ts`
- `src/ccgs-adaptation.ts`
- `.codex/agents/*.toml`
- `tests/roles.test.ts`
- `tests/functionality-gap-pass.test.ts`
- `tests/project-workflow.test.ts`
- `tests/runner.test.ts`
- `tests/validation.test.ts`
- `tests/ccgs-adaptation.test.ts`
- `tests/ccgs-parity-audit.test.ts`
- `references/ccgs-surface-parity-matrix.json`
- `references/ccgs-surface-parity-matrix.md`
- `references/ccgs-remaining-gap-tasks.md`
