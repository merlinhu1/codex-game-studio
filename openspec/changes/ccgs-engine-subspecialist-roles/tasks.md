## 1. OpenSpec planning

- [x] 1.1 Create OpenSpec change `ccgs-engine-subspecialist-roles`
- [x] 1.2 Write proposal, design, and requirements
- [x] 1.3 Validate OpenSpec change before implementation

## 2. TDD contract tests

- [x] 2.1 Add failing role registry tests for all 12 engine sub-specialist ids and contracts
- [x] 2.2 Add failing engine role-set tests for Godot, Unity, and Unreal project state
- [x] 2.3 Add failing runner tests for wrong-engine sub-specialist rejection and matching sub-specialist prompt context
- [x] 2.4 Add failing parity test proving engine sub-specialist rows are implemented
- [x] 2.5 Run focused tests and confirm RED

## 3. Implementation

- [x] 3.1 Add engine role-set helpers and the 12 sub-specialist ids in `src/roles.ts`
- [x] 3.2 Add compact Codex-native role contracts for the 12 sub-specialists
- [x] 3.3 Update active role selection, runner availability checks, validation imports, and CCGS adaptation decisions
- [x] 3.4 Update engine-reference prompt selection for sub-specialist-specific context
- [x] 3.5 Regenerate tracked `.codex/agents/*.toml` surfaces or update them through the existing renderer contract
- [x] 3.6 Run focused tests and confirm GREEN

## 4. Reference regeneration

- [x] 4.1 Regenerate CCGS parity references with `scripts/audit-ccgs-surfaces.ts`
- [x] 4.2 Inspect generated report diff: role rows close by 12 while workflow/template/rule gaps remain

## 5. Verification

- [x] 5.1 Run focused Node tests for roles, project workflow, runner, validation, adaptation, and parity
- [x] 5.2 Run `npm run typecheck`
- [x] 5.3 Run scoped Node test command covering changed surfaces (`72/72` pass)
- [x] 5.4 Run `npm run validate`
- [x] 5.5 Run `openspec validate ccgs-engine-subspecialist-roles --strict --json`
- [x] 5.6 Run `openspec status --change ccgs-engine-subspecialist-roles --json`
- [x] 5.7 Run `git diff --check` and verify no tracked tests are deleted
