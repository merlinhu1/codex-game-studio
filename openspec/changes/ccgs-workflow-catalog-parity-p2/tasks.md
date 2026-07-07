## 1. OpenSpec planning

- [x] 1.1 Create OpenSpec change `ccgs-workflow-catalog-parity-p2`
- [x] 1.2 Write proposal, design, and requirements
- [x] 1.3 Validate OpenSpec change before final commit

## 2. TDD contract tests

- [x] 2.1 Add failing workflow catalog test for the remaining 18 CCGS workflow-step ids
- [x] 2.2 Add failing parity test proving all workflow-step rows are implemented
- [x] 2.3 Run focused tests and confirm RED

## 3. Implementation

- [x] 3.1 Add remaining workflow ids and registry entries in `src/workflows.ts`
- [x] 3.2 Update `src/workflow-catalog.ts` with phase/catalog steps for the remaining ids
- [x] 3.3 Add tracked `.codex/workflows/*.md` files for the new workflows
- [x] 3.4 Run focused tests and confirm GREEN

## 4. Reference regeneration

- [x] 4.1 Regenerate CCGS parity references with `scripts/audit-ccgs-surfaces.ts`
- [x] 4.2 Regenerate prompt-surface references with `scripts/audit-prompt-surfaces.ts`
- [x] 4.3 Inspect generated report diff: workflow rows close by 18 while template/rule gaps remain

## 5. Verification

- [x] 5.1 Run focused Node tests for workflow catalog and parity
- [x] 5.2 Run `npm run typecheck`
- [x] 5.3 Run `npm test`
- [x] 5.4 Run `npm run validate`
- [x] 5.5 Run `openspec validate ccgs-workflow-catalog-parity-p2 --strict --json`
- [x] 5.6 Run `openspec status --change ccgs-workflow-catalog-parity-p2 --json`
- [x] 5.7 Run `git diff --check`, `git diff --cached --check`, and verify no tracked tests are deleted
