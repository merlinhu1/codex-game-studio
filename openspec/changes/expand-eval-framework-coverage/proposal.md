## Why

The initial eval framework proves the shape, but three scenarios are not enough to judge skill and prompt quality across the studio. The next pass must cover the highest-risk workflows, skill-maintenance and QA/review/gate skills, and representative role clusters with behavior-focused scenarios rather than surface-existence checks.

## What Changes

- Expand `eval-framework/catalog.json` from scaffold coverage to a first real coverage pass.
- Add behavior scenarios for critical/high workflow prompts.
- Add behavior scenarios for skill-maintenance, QA, review, readiness, and gate skills.
- Add representative role prompt scenarios across major role clusters.
- Add validation/tests that enforce minimum scenario counts, coverage categories, semantic dimensions, and the no-existence-only strategy.
- Keep the framework manual-only and token-aware; no real agent or judge calls run in default CI.

## Capabilities

### New Capabilities
- `performance-eval-coverage`: Maintainer-only behavior evaluation coverage for skills, workflows, and role prompts.

### Modified Capabilities
- `performance-eval-framework`: The existing eval framework SHALL enforce first-pass coverage thresholds and category distribution instead of only validating the scaffold.

## Impact

- `eval-framework/**` catalog, rubrics, scenario prompts, and expected behavior files.
- `src/performance-evaluation.ts` coverage validation helpers.
- `tests/performance-evaluation-framework.test.ts` TDD coverage for scenario counts and prompt/skill/role coverage.
- `src/validation.ts` remains the integration point for repository validation.
