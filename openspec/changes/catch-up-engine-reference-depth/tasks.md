# Engine Reference Depth Catch-Up Tasks

## Implementation Checklist
- [x] Read `AGENTS.md` and `docs/architecture/product-boundary.md`; confirm the plan still stays inside the product boundary.
- [x] Add or update the smallest focused tests for the first behavior slice.
- [x] Run the focused failing test and confirm it fails for the expected reason.
- [x] Implement the minimal registry/renderer/asset change for that slice.
- [x] Re-run the focused test and confirm it passes.
- [x] Repeat the TDD loop for each remaining slice in this plan.
- [x] Add per-engine `current-best-practices.md`, `deprecated-apis.md`, `breaking-changes.md`, and module files for animation, audio, input, navigation, networking, physics, rendering, UI.
- [x] Add plugin references for Unity Addressables/Cinemachine/DOTS and Unreal GAS/Common UI/PCG where in-scope.
- [x] Add reference metadata: engine, version reviewed, source/review date, tags, applicable roles/workflows.
- [x] Update context selection so engine-specialist prompts select only relevant module/plugin references.
- [x] Validate package shipping and temp-cwd installed-bin access.
- [x] Update generated-surface/package validation expectations where assets or commands change.
- [x] Run `git diff --check`.
- [x] Run focused tests for touched areas.
- [x] Run `npm run validate` before any parity or readiness claim.
- [x] If functional behavior changed, update routed Truthmark docs and run `npx truthmark check --json` and `npx truthmark index --json`.

## Suggested Focused Commands
- `npm test -- --run tests/roles.test.ts tests/codex-prompts.test.ts tests/functionality-gap-pass.test.ts`
- `npm test -- --run tests/project-workflow.test.ts tests/validation.test.ts`
- `npm run validate`

## Acceptance Criteria
- OpenSpec validation for this change passes.
- The new or changed OGS surfaces are locally reviewable and package-aware.
- No explicit deferred/future-only feature becomes a user-facing command or required behavior.
