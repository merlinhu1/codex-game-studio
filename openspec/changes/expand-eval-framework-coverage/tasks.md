## 1. OpenSpec Planning

- [x] 1.1 Create proposal for first-pass eval coverage expansion
- [x] 1.2 Create design documenting CCGS/Truthmark-inspired decisions
- [x] 1.3 Create specs for coverage and framework validation requirements
- [x] 1.4 Validate OpenSpec change with `openspec validate expand-eval-framework-coverage --strict`

## 2. TDD Coverage

- [x] 2.1 Restore/add `tests/performance-evaluation-framework.test.ts`
- [x] 2.2 Add failing threshold tests for at least 30 scenarios, 10 workflows, 10 skills, and 6 roles
- [x] 2.3 Add validation expectations for first-pass coverage checks
- [x] 2.4 Run focused test and confirm RED before implementation

## 3. Eval Framework Data

- [x] 3.1 Add role behavior rubric
- [x] 3.2 Expand catalog to cover workflow prompt targets
- [x] 3.3 Expand catalog to cover skill-maintenance, QA, review, readiness, and gate targets
- [x] 3.4 Expand catalog to cover representative role prompt targets
- [x] 3.5 Add scenario JSON and prompt markdown for each target

## 4. Validation Integration

- [x] 4.1 Add coverage summary helper to `src/performance-evaluation.ts`
- [x] 4.2 Add validation check for first-pass coverage thresholds
- [x] 4.3 Keep manual-only validation free of real agent/judge calls

## 5. Verification

- [x] 5.1 Run focused performance eval framework tests
- [x] 5.2 Run `npm run typecheck`
- [x] 5.3 Stage new tests before full suite
- [x] 5.4 Run `npm run test`
- [x] 5.5 Run `npm run validate`
- [x] 5.6 Run OpenSpec validation and status
- [x] 5.7 Run Truthmark check/index and verify no deleted tests
