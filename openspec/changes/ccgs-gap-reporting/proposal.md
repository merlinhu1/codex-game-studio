## Why

The CCGS gap report was manually written after removing implemented OpenSpec docs, but the source of truth is the parity audit. Manual summaries can drift from `ccgs-surface-parity-matrix.json` and make the next gap-closing step ambiguous.

## What Changes

- Generate an actionable `references/ccgs-remaining-gap-tasks.md` from the parity matrix whenever `scripts/audit-ccgs-surfaces.ts` writes parity reports.
- Add summary counts that distinguish implemented parity rows, remaining parity rows, and remaining rows by source type.
- Keep the report focused on next implementation work: direct role depth, engine specialist decisions, workflow steps, templates, rules, and audit semantics.
- Do not change role, workflow, template, or skill behavior in this pass.

## Capabilities

### New Capabilities

- `ccgs-gap-reporting`: Generated remaining-gap reporting for CCGS parity audits.

### Modified Capabilities

None.

## Impact

- `src/ccgs-parity.ts`
- `scripts/audit-ccgs-surfaces.ts`
- `tests/ccgs-parity-audit.test.ts`
- `references/ccgs-remaining-gap-tasks.md`
- `references/ccgs-surface-parity-matrix.{json,md}` when reports are regenerated
