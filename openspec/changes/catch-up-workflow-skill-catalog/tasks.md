# Workflow And Skill Catalog Catch-Up Tasks

## Implementation Checklist
- [x] Read `AGENTS.md` and `docs/architecture/product-boundary.md`; confirm the plan still stays inside the product boundary.
- [x] Add or update the smallest focused tests for the first behavior slice.
- [x] Run the focused failing test and confirm it fails for the expected reason.
- [x] Implement the minimal registry/renderer/asset change for that slice.
- [x] Re-run the focused test and confirm it passes.
- [x] Repeat the TDD loop for each remaining slice in this plan.
- [x] Create a workflow taxonomy: onboarding/discovery, design/architecture, implementation planning, QA/testing, release/hotfix, localization/accessibility, and team coordination.
- [x] Add high-value workflow prompt shortcuts before low-value aliases: start/onboard, brainstorm, prototype, architecture-decision, architecture-review, create-epics, create-stories, sprint-plan, sprint-status, story-readiness, story-done, qa-plan, regression-suite, security-audit, perf-profile, release-checklist, hotfix, localization-plan.
- [x] Keep workflow output prompt-only unless an existing CLI surface already owns state changes.
- [x] Add tests for command help, workflow rendering, aliases, and project materialization.
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
