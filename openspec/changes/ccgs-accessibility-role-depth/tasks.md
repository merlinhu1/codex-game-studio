## 1. OpenSpec planning

- [x] 1.1 Create OpenSpec change `ccgs-accessibility-role-depth`
- [x] 1.2 Write proposal, design, and requirements
- [x] 1.3 Validate the OpenSpec change

## 2. TDD contract tests

- [x] 2.1 Add a failing `tests/roles.test.ts` assertion for the accessibility role's CCGS-depth contract
- [x] 2.2 Add a failing `tests/ccgs-parity-audit.test.ts` assertion that accessibility parity is implemented
- [x] 2.3 Run focused tests and confirm RED

## 3. Implementation

- [x] 3.1 Add `accessibility-specialist` to `ccgsParityUpgradedRoleIds`
- [x] 3.2 Add CCGS-depth accessibility contract details to `ccgsParityRoleDetails`
- [x] 3.3 Rerun focused tests and confirm GREEN

## 4. Reference regeneration

- [x] 4.1 Regenerate CCGS parity references with `scripts/audit-ccgs-surfaces.ts`
- [x] 4.2 Inspect reference diffs for one closed role gap

## 5. Verification

- [x] 5.1 Run `node --import tsx --test tests/roles.test.ts tests/ccgs-parity-audit.test.ts`
- [x] 5.2 Run `npm run typecheck`
- [x] 5.3 Run `npm test`
- [x] 5.4 Run `npm run validate`
- [x] 5.5 Run `openspec validate ccgs-accessibility-role-depth --strict --json`
- [x] 5.6 Run `openspec validate --all --strict --json`
- [x] 5.7 Run `git diff --check` and `git diff --cached --check`
