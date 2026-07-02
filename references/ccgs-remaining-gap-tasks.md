# Remaining CCGS Gap Tasks

Source evidence:

- CCGS reference root: `/opt/data/repos/Claude-Code-Game-Studios`
- Generated parity report: `references/ccgs-surface-parity-matrix.json`
- Prompt-surface audit: `references/prompt-surface-uplift-matrix.json`
- CCGS workflow catalog: `/opt/data/repos/Claude-Code-Game-Studios/.claude/docs/workflow-catalog.yaml`

## Current state

- Implemented parity rows: 118
- Remaining parity rows: 100
- Prompt-surface audit rows complete: 102
- Prompt-surface audit rows deferred: 46
- Implemented OpenSpec change docs were removed after the eval-framework coverage work landed in durable code, tests, and reference reports.

The prompt-surface audit shows exact CCGS agent and skill source references are mostly complete. The remaining CCGS gap is now broader product parity: richer role-package behavior, workflow phase coverage, reusable templates, and rule/standards adaptation.

## Remaining tasks by priority

### 1. Close direct role-package depth gaps

The `.codex/agents/*.toml` prompt surfaces have source metadata, but `src/roles.ts` still has parity TODOs for these direct CCGS role packages. Upgrade each role package with CCGS-depth responsibilities, inputs, outputs, gates, stop conditions, and handoff contracts, then update tests that cover role rendering and validation.

Roles:

- `accessibility-specialist`
- `ai-programmer`
- `audio-director`
- `community-manager`
- `devops-engineer`
- `economy-designer`
- `engine-programmer`
- `godot-specialist`
- `level-designer`
- `live-ops-designer`
- `localization-lead`
- `network-programmer`
- `security-engineer`
- `sound-designer`
- `technical-artist`
- `tools-programmer`
- `ui-programmer`
- `unity-specialist`
- `unreal-specialist`
- `world-builder`
- `writer`

Suggested verification:

- `tests/roles.test.ts`
- `tests/template-repository-surfaces.test.ts`
- `tests/validation.test.ts`
- `npm run validate`

### 2. Decide how to handle CCGS engine sub-specialists

CCGS has specialist agents that do not yet have direct Codex Game Studio role surfaces. Do not blindly add all of them as top-level roles; decide whether each becomes a role, an engine-reference module, a skill, or a documented defer.

Deferred specialists:

- Godot: `godot-csharp-specialist`, `godot-gdextension-specialist`, `godot-gdscript-specialist`, `godot-shader-specialist`
- Unreal: `ue-blueprint-specialist`, `ue-gas-specialist`, `ue-replication-specialist`, `ue-umg-specialist`
- Unity: `unity-addressables-specialist`, `unity-dots-specialist`, `unity-shader-specialist`, `unity-ui-specialist`

Suggested outcome:

- Add an explicit decision table to the parity report or product-boundary docs.
- If adopted, route them through engine-scoped context rather than broad always-on role lists unless the product intentionally expands the role roster.

### 3. Add missing CCGS workflow phase steps

The current Codex workflow catalog covers 31 prompt-only workflows, but CCGS parity still has 30 missing phase-step rows from the CCGS workflow catalog. Add these as workflow aliases, phase-catalog entries, or documented non-adoptions.

Workflow steps:

- Concept and systems design: `engine-setup`, `game-concept`, `design-review-concept`, `art-bible`, `map-systems`, `design-system`, `design-review`, `review-all-gdds`, `consistency-check`
- Technical setup and pre-production: `create-architecture`, `control-manifest`, `accessibility-doc`, `entity-inventory`, `asset-spec`, `ux-design`, `ux-review`, `test-setup`
- Production and review: `implement`, `code-review`, `bug-report`, `retrospective`, `team-feature`, `scope-check`, `balance-check`, `asset-audit`, `playtest-polish`, `team-polish`
- Release: `patch-notes`, `changelog`, `launch-checklist`

Suggested verification:

- `tests/workflow-catalog.test.ts`
- `tests/workflow-recipes.test.ts`
- `tests/functionality-gap-pass.test.ts`
- CLI help and dry-run rendering for any new aliases

### 4. Adopt missing CCGS templates as package templates

The package already has several workflow templates wired into prompt rendering. These 26 CCGS templates still have no Codex Game Studio equivalent. Add them only where they improve workflow output contracts; avoid dumping every template into every prompt.

Templates:

- Architecture and technical docs: `architecture-decision-record`, `architecture-doc-from-code`, `technical-design-document`
- Agent protocols: `design-agent-protocol`, `implementation-agent-protocol`, `leadership-agent-protocol`
- Concept and design docs: `concept-doc-from-prototype`, `design-doc-from-implementation`, `game-concept`, `game-design-document`, `game-pillars`, `systems-index`
- Content and UX docs: `faction-design`, `hud-design`, `interaction-pattern-library`, `level-design-document`, `narrative-character-sheet`
- Production/release docs: `changelog-template`, `incident-response`, `milestone-definition`, `post-mortem`, `project-stage-report`, `prototype-report`, `release-checklist-template`, `risk-register-entry`, `skill-test-spec`

Suggested verification:

- Template registry tests for every adopted template.
- Workflow rendering tests that prove only selected relevant templates are inlined.
- Package asset validation.

### 5. Adapt CCGS rules into Codex-native standards surfaces

CCGS rule files should not be copied as `.codex/rules/*.rules`. Convert their intent into skills, AGENTS guidance, docs, or selected engine-reference context.

Rule areas:

- `ai-code`
- `data-files`
- `design-docs`
- `engine-code`
- `gameplay-code`
- `narrative`
- `network-code`
- `prototype-code`
- `shader-code`
- `test-standards`
- `ui-code`

Suggested destination:

- Existing standards skills such as `cgs-standards-gameplay`, `cgs-standards-prototype`, `cgs-standards-tests`, and `cgs-standards-ui`.
- `AGENTS.md` or `docs/ai/repo-rules.md` only for durable repository-wide policy.
- Engine-reference modules when the guidance is engine-specific.

### 6. Tighten audit/report semantics

The two reference reports currently answer different questions:

- `prompt-surface-uplift-matrix.*` checks prompt metadata/depth for local prompt surfaces.
- `ccgs-surface-parity-matrix.*` tracks broader CCGS product parity.

Add explicit labels or derived summary fields so future readers do not treat prompt-surface completion as full CCGS parity completion.

Suggested verification:

- Audit scripts regenerate stable JSON/Markdown.
- `tests/ccgs-parity-audit.test.ts`
- `tests/prompt-surface-validation.test.ts`

## Close-the-gap acceptance criteria

The CCGS gap can be considered closed when:

1. Every direct role has CCGS-depth role-package contracts in `src/roles.ts` and generated TOML remains source-traceable.
2. Every deferred engine specialist has an explicit adopt/adapt/defer decision with a Codex-native destination.
3. Workflow phase steps from CCGS are represented as supported Codex workflows, aliases, phase metadata, or documented non-adoptions.
4. Adopted templates are packaged, registry-tested, and only inlined into relevant workflow prompts.
5. CCGS rules are represented as standards skills/docs/engine context, not copied as Claude rule files.
6. `npm run typecheck`, `npm test`, `npm run validate`, parity audits, and OpenSpec validation all pass.
