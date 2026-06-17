# Customization Ergonomics Catch-Up Tasks

## Implementation Checklist
- [x] Read `AGENTS.md` and `docs/architecture/product-boundary.md`; confirm the plan still stays inside the product boundary.
- [x] Add or update the smallest focused tests for the first behavior slice.
- [x] Run the focused failing test and confirm it fails for the expected reason.
- [x] Implement the minimal registry/renderer/asset change for that slice.
- [x] Re-run the focused test and confirm it passes.
- [x] Repeat the TDD loop for each remaining slice in this plan.
- [x] Design `opengamestudio.config.json` or `.codex/studio/config.json` extension points for project-local role/workflow/template packs.
- [x] Define schema rules for custom role ids, workflow ids, template metadata, path containment, override/extend behavior, and conflict diagnostics.
- [x] Update init/validate/status/templates list/run prompt paths to load validated local packs.
- [x] Add tests for valid custom packs, duplicate ids, unsafe paths, missing template files, and built-in override policy.
- [x] Document examples that edit local pack files instead of editing package source.
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
