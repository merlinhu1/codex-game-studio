# Remaining CCGS Gap Tasks

Source evidence:

- CCGS reference root: `/opt/data/repos/Claude-Code-Game-Studios`
- Generated parity report: `references/ccgs-surface-parity-matrix.json`
- Generated parity summary: `references/ccgs-surface-parity-matrix.md`

## Current state

- Implemented parity rows: 181
- Remaining parity rows: 37
- Deferred parity rows: 0
- Out-of-scope parity rows: 0
- Remaining role rows: 0
- Remaining workflow-step rows: 0
- Remaining template rows: 26
- Remaining rule rows: 11
- Remaining skill rows: 0

Prompt-surface metadata completion is not the same as full CCGS product-parity completion. The prompt-surface audit checks local metadata, depth, and source traceability; this report tracks broader CCGS parity rows that still need product decisions or implementation.

## Role package gaps

No remaining rows.

## Workflow-step gaps

No remaining rows.

## Template gaps

- `architecture-decision-record` → template:architecture-decision-record (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `architecture-doc-from-code` → template:architecture-doc-from-code (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `changelog-template` → template:changelog-template (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `design-agent-protocol` → template:design-agent-protocol (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `implementation-agent-protocol` → template:implementation-agent-protocol (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `leadership-agent-protocol` → template:leadership-agent-protocol (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `concept-doc-from-prototype` → template:concept-doc-from-prototype (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `design-doc-from-implementation` → template:design-doc-from-implementation (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `faction-design` → template:faction-design (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `game-concept` → template:game-concept (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `game-design-document` → template:game-design-document (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `game-pillars` → template:game-pillars (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `hud-design` → template:hud-design (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `incident-response` → template:incident-response (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `interaction-pattern-library` → template:interaction-pattern-library (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `level-design-document` → template:level-design-document (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `milestone-definition` → template:milestone-definition (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `narrative-character-sheet` → template:narrative-character-sheet (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `post-mortem` → template:post-mortem (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `project-stage-report` → template:project-stage-report (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `prototype-report` → template:prototype-report (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `release-checklist-template` → template:release-checklist-template (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `risk-register-entry` → template:risk-register-entry (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `skill-test-spec` → template:skill-test-spec (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `systems-index` → template:systems-index (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`
- `technical-design-document` → template:technical-design-document (todo, adopt); owner: `templates/`; tests: `tests/agents-templates.test.ts`

## Rule adaptation gaps

- `ai-code` → rule:ai-code (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `data-files` → rule:data-files (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `design-docs` → rule:design-docs (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `engine-code` → rule:engine-code (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `gameplay-code` → rule:gameplay-code (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `narrative` → rule:narrative (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `network-code` → rule:network-code (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `prototype-code` → rule:prototype-code (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `shader-code` → rule:shader-code (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `test-standards` → rule:test-standards (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`
- `ui-code` → rule:ui-code (todo, adapt); owner: `src/skills.ts`; tests: `tests/codex-context-files.test.ts`

## Skill gaps

No remaining rows.

## Close-the-gap acceptance criteria

1. Every remaining row is either implemented with tests, explicitly deferred with rationale, or marked out of scope.
2. Direct role-package gaps update `src/roles.ts` and role/template validation tests.
3. Workflow-step gaps update workflow catalog, aliases, recipes, or documented non-adoption decisions.
4. Template gaps add package templates only where workflow output contracts need them.
5. Rule gaps become Codex-native standards skills, docs, or selected engine-reference context; they are not copied as Claude rule files.
6. `npm run typecheck`, `npm test`, `npm run validate`, parity audit regeneration, and OpenSpec validation pass.
