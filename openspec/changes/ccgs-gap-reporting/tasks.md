## 1. OpenSpec planning

- [x] 1.1 Create OpenSpec proposal for generated CCGS gap reporting
- [x] 1.2 Create design with scope, decisions, risks, and non-goals
- [x] 1.3 Create `ccgs-gap-reporting` requirements and scenarios
- [x] 1.4 Validate OpenSpec change with `openspec validate ccgs-gap-reporting --strict --json`

## 2. TDD contract tests

- [x] 2.1 Add a failing test that `writeParityReports` writes `ccgs-remaining-gap-tasks.md`
- [x] 2.2 Add failing expectations for remaining-count semantics and category grouping
- [x] 2.3 Run focused test and confirm RED before implementation

## 3. Implementation

- [x] 3.1 Add remaining-gap summary helpers to `src/ccgs-parity.ts`
- [x] 3.2 Add `renderRemainingGapTasksMarkdown(matrix)` export
- [x] 3.3 Update `writeParityReports` to write `ccgs-remaining-gap-tasks.md`
- [x] 3.4 Regenerate parity references with `scripts/audit-ccgs-surfaces.ts`

## 4. Verification

- [x] 4.1 Run focused CCGS parity audit tests
- [x] 4.2 Run `npm run typecheck`
- [x] 4.3 Run `npm test`
- [x] 4.4 Run `npm run validate`
- [x] 4.5 Run `openspec validate ccgs-gap-reporting --strict --json`
- [x] 4.6 Run `openspec status --change ccgs-gap-reporting --json`
- [x] 4.7 Run `git diff --check` and inspect generated report diff
