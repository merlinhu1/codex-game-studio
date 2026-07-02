## 1. OpenSpec planning

- [x] 1.1 Create OpenSpec change `ccgs-direct-role-depth-batch`
- [x] 1.2 Write proposal, design, and requirements
- [x] 1.3 Validate the OpenSpec change

## 2. TDD contract tests

- [x] 2.1 Add a failing role package test for the 20 direct role-depth gap ids
- [x] 2.2 Add a failing parity test proving no direct `adapt` role gaps remain
- [x] 2.3 Run focused tests and confirm RED

## 3. Implementation

- [x] 3.1 Add the 20 direct role ids to `ccgsParityUpgradedRoleIds`
- [x] 3.2 Add compact CCGS-depth details for each role in `ccgsParityRoleDetails`
- [x] 3.3 Run focused tests and confirm GREEN

## 4. Reference regeneration

- [x] 4.1 Regenerate CCGS parity references with `scripts/audit-ccgs-surfaces.ts`
- [x] 4.2 Inspect generated report diff: direct role gaps closed, major categories remain

## 5. Verification

- [x] 5.1 Run `node --import tsx --test tests/roles.test.ts tests/ccgs-parity-audit.test.ts`
- [x] 5.2 Run `npm run typecheck`
- [x] 5.3 Run `npm test`
- [x] 5.4 Run `npm run validate`
- [x] 5.5 Run `openspec validate ccgs-direct-role-depth-batch --strict --json`
- [x] 5.6 Run `openspec validate --all --strict --json`
- [x] 5.7 Run `git diff --check` and `git diff --cached --check`
