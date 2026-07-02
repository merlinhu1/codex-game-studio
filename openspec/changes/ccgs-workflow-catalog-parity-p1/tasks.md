## 1. OpenSpec planning

- [x] 1.1 Create OpenSpec change `ccgs-workflow-catalog-parity-p1`
- [x] 1.2 Write proposal, design, and requirements
- [x] 1.3 Validate OpenSpec change before implementation

## 2. TDD contract tests

- [x] 2.1 Add failing workflow catalog test for the first 12 CCGS workflow-step ids
- [x] 2.2 Add failing parity test proving the first 12 workflow-step rows are implemented and remaining workflow rows drop to 18
- [x] 2.3 Run focused tests and confirm RED

## 3. Implementation

- [x] 3.1 Add first-batch workflow ids and registry entries in `src/workflows.ts`
- [x] 3.2 Update `src/workflow-catalog.ts` to use the same ids and artifacts
- [x] 3.3 Generate tracked `.codex/workflows/*.md` files for the new workflows
- [x] 3.4 Run focused tests and confirm GREEN

## 4. Reference regeneration

- [x] 4.1 Regenerate CCGS parity references with `scripts/audit-ccgs-surfaces.ts`
- [x] 4.2 Inspect generated report diff: workflow rows close by 12 while template/rule gaps remain

## 5. Verification

- [x] 5.1 Run focused Node tests for workflow catalog and parity
- [x] 5.2 Run `npm run typecheck`
- [x] 5.3 Run `npm test`
- [x] 5.4 Run `openspec validate ccgs-workflow-catalog-parity-p1 --strict --json`
- [x] 5.5 Run `openspec status --change ccgs-workflow-catalog-parity-p1 --json`
- [x] 5.6 Run `git diff --check` and verify no tracked tests are deleted
