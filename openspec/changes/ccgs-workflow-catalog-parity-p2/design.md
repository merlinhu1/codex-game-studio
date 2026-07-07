# Design: Remaining workflow-step parity closure

## Approach

Treat `references/ccgs-remaining-gap-tasks.md` as the scoreboard. The remaining workflow-step rows map directly to Codex-native workflows, so the canonical implementation belongs in `src/workflows.ts`, `src/workflow-catalog.ts`, and tracked `.codex/workflows/*.md` files.

The work follows the same pattern as `ccgs-workflow-catalog-parity-p1`:

1. Add RED tests for registry/catalog coverage and parity-report movement.
2. Add canonical workflow registry entries for the exact ids.
3. Add catalog steps in the phase where the workflow is used.
4. Add tracked workflow prompt surfaces with primary agent, linked skills, phase, traceability, and output contract metadata.
5. Regenerate reports and verify the workflow-step count goes to zero while template and rule rows remain.

## Workflow ids

This change covers:

- `entity-inventory`
- `asset-spec`
- `ux-design`
- `ux-review`
- `test-setup`
- `implement`
- `code-review`
- `bug-report`
- `retrospective`
- `team-feature`
- `scope-check`
- `balance-check`
- `asset-audit`
- `playtest-polish`
- `team-polish`
- `patch-notes`
- `changelog`
- `launch-checklist`

## Product boundaries

These are Codex-native workflow surfaces. They may link to existing repository skills, but they must not copy hidden Claude hooks or introduce generated prompt mirrors during initialization.
