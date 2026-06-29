## 1. Baseline Inventory and Audit Tooling

- [x] 1.1 Add `scripts/audit-ccgs-surfaces.ts` that reads `CCGS_REFERENCE_ROOT` or defaults to `/opt/data/repos/Claude-Code-Game-Studios`.
- [x] 1.2 Add parser coverage for CCGS `.claude/agents/*.md` frontmatter, body sections, skills lists, gate tokens, and output templates.
- [x] 1.3 Add parser coverage for CCGS `.claude/skills/*/SKILL.md` frontmatter, argument hints, allowed tools, assigned agent, phase headings, context files, write targets, verdicts, and report templates.
- [x] 1.4 Add parser coverage for `.claude/docs/workflow-catalog.yaml` phases, steps, commands, required flags, repeatable flags, artifact globs, artifact patterns, and next-phase links.
- [x] 1.5 Add CGS registry extraction for `src/roles.ts`, `src/workflows.ts`, `src/skills.ts`, `src/templates.ts`, and generated validation markers.
- [x] 1.6 Write `tests/ccgs-parity-audit.test.ts` with fixture-based unit tests proving all three source types produce stable inventory rows.
- [x] 1.7 Run `npm test -- tests/ccgs-parity-audit.test.ts`; expected result: parser tests pass without requiring the live CCGS checkout.

## 2. Parity Matrix and Scoring Rubric

- [x] 2.1 Define the matrix schema in `src/ccgs-parity.ts` with source type, source path, source hash, CGS target, decision, score fields, rationale, implementation owner path, test path, and status.
- [x] 2.2 Implement score categories: content depth, procedural specificity, context contract, output contract, role-skill linkage, gate/escalation behavior, Codex fit, and testability.
- [x] 2.3 Generate `references/ccgs-surface-parity-matrix.json` and `references/ccgs-surface-parity-matrix.md` from the current live CCGS checkout.
- [x] 2.4 Require every CCGS row to have one decision: `adopt`, `adapt`, `merge`, `rename-alias`, `defer`, or `out-of-scope`.
- [x] 2.5 Seed obvious preliminary decisions for known exact gaps: CCGS has 49 agents, 73 skills, and workflow-catalog phase steps; CGS currently has 38 roles, 31 workflows, and 11 generated skills.
- [x] 2.6 Add tests that fail when row counts differ between JSON and Markdown reports.
- [x] 2.7 Add tests that fail when any row lacks a decision, rationale, or source hash.

## 3. Agent-by-Agent Upgrade Pass

- [x] 3.1 Compare every CCGS agent against `src/roles.ts` and record whether the target is a direct role, merged role, alias, new role, or out-of-scope.
- [x] 3.2 Upgrade high-value direct matches first: `producer`, `creative-director`, `technical-director`, `game-designer`, `systems-designer`, `gameplay-programmer`, `qa-playtester`, `release-manager`, and `performance-analyst`.
- [x] 3.3 Resolve renamed or collapsed roles: `art-director`, `narrative-director`, `ux-designer`, `qa-lead`, `qa-tester`, `lead-programmer`, `prototyper`, and `analytics-engineer`.
- [ ] 3.4 Decide and implement engine sub-specialists: Godot C#, GDExtension, GDScript, shader; Unity Addressables, DOTS, shader, UI; Unreal Blueprint, GAS, replication, UMG.
- [x] 3.5 Update `renderProjectCustomAgentToml()` tests so upgraded agents prove required domain sections appear in `.codex/agents/*.toml`.
- [ ] 3.6 Update prompt rendering tests so `.codex/prompts/*.md` and `.codex/agents/*.toml` stay semantically aligned.
- [x] 3.7 Run `npm test -- tests/agents-templates.test.ts tests/project-workflow.test.ts tests/validation.test.ts`.

## 4. Skill-by-Skill Upgrade Pass

- [x] 4.1 Replace generic generated skill bodies in `src/skills.ts` with a renderer that supports per-skill phases, context files, write targets, handoff/report formats, and validation markers.
- [x] 4.2 Upgrade onboarding and setup skills: `start`, `onboard`, `adopt`, `setup-engine`, `help`, and `project-stage-detect`.
- [x] 4.3 Upgrade design skills: `brainstorm`, `quick-design`, `map-systems`, `design-system`, `design-review`, `review-all-gdds`, `art-bible`, `asset-spec`, `ux-design`, and `ux-review`.
- [x] 4.4 Upgrade architecture and production skills: `create-architecture`, `create-control-manifest`, `architecture-decision`, `architecture-review`, `create-epics`, `create-stories`, `estimate`, `sprint-plan`, `sprint-status`, `scope-check`, and `milestone-review`.
- [x] 4.5 Upgrade build and validation skills: `prototype`, `vertical-slice`, `bug-report`, `bug-triage`, `qa-plan`, `regression-suite`, `smoke-check`, `soak-test`, `test-setup`, `test-helpers`, `test-flakiness`, and `test-evidence-review`.
- [x] 4.6 Upgrade release and operations skills: `release-checklist`, `launch-checklist`, `hotfix`, `day-one-patch`, `patch-notes`, `changelog`, `localize`, `security-audit`, `perf-profile`, `tech-debt`, and `retrospective`.
- [x] 4.7 Upgrade team specialty skills: `team-audio`, `team-combat`, `team-level`, `team-live-ops`, `team-narrative`, `team-polish`, `team-qa`, `team-release`, and `team-ui`.
- [x] 4.8 Add validation that upgraded generated skills include required sections and adapted body markers, not just frontmatter.
- [x] 4.9 Run `npm test -- tests/project-workflow.test.ts tests/validation.test.ts tests/template-root-smoke.test.ts`.

## 5. Workflow Catalog and Phase Progression

- [x] 5.1 Add a CGS workflow-catalog model that can represent CCGS-style phases, required steps, optional steps, repeatable steps, artifact checks, and next-phase links.
- [x] 5.2 Map CCGS catalog phases into CGS lifecycle phases without importing Claude slash-command mechanics.
- [ ] 5.3 Upgrade `status`, `resume`, and workflow rendering to show relevant next steps, required artifacts, and incomplete gate checks.
- [x] 5.4 Implement explicit artifact checks for accepted workflow rows such as game concept, systems map, architecture, UX design, vertical slice, playtest polish, release checklist, and changelog.
- [x] 5.5 Add tests for required artifact detection and repeatable step reporting.
- [x] 5.6 Run `npm test -- tests/runner.test.ts tests/tasks.test.ts tests/workflow-recipes.test.ts tests/validation.test.ts`.

## 6. Templates, Rules, and Context Adaptation

- [x] 6.1 Compare CCGS `.claude/docs/templates/**` one by one against CGS `templates/**` and record matrix decisions.
- [ ] 6.2 Upgrade or add templates where CCGS has stronger game-facing artifacts: art bible, architecture decision record, control manifest, pitch, project-stage report, prototype report, test plan, UX spec, and vertical-slice report.
- [x] 6.3 Compare CCGS `.claude/rules/**` one by one and map accepted standards to `.agents/skills/**`, `AGENTS.md`, or selected context, never `.codex/rules/*.rules`.
- [ ] 6.4 Update context manifest defaults so upgraded workflows select the minimum relevant standards, templates, and engine references.
- [x] 6.5 Run `npm test -- tests/codex-context-files.test.ts tests/agents-templates.test.ts tests/validation.test.ts`.

## 7. Behavioral Evaluation Layer

- [x] 7.1 Add deterministic fixture tests for upgraded generated content before adding any LLM or live Codex probe.
- [ ] 7.2 Add manual behavioral-eval scenarios for at least producer planning, vertical-slice scoping, bug triage, QA plan, and release checklist.
- [ ] 7.3 Ensure manual eval output records scenario, selected agent/skill, prompt, trace summary, changed files or no-write proof, final report, and reviewer verdict.
- [ ] 7.4 Keep real Codex/LLM judge runs out of default `npm test` unless explicitly enabled by environment variables.
- [x] 7.5 Run deterministic behavioral tests with `npm test -- tests/behavioral-evaluation.test.ts`.

## 8. Documentation, Truth, and Final Validation

- [ ] 8.1 Update README and user guide only after upgraded behavior exists and tests pass.
- [x] 8.2 Update Truthmark docs for role, skill, workflow, template, validation, and generated-surface behavior after code lands.
- [ ] 8.3 Refresh `references/ccgs-surface-parity-matrix.*` and confirm every adopted/adapted/merged row is implemented or intentionally deferred.
- [x] 8.4 Run `npm test`.
- [x] 8.5 Run `npm run validate` before any parity claim.
- [x] 8.6 Run `truthmark check --json`, `truthmark index --json`, `git diff --check`, `openspec validate ccgs-surface-parity-upgrade --strict --json`, `openspec validate --all --strict --json`, and `openspec status --change ccgs-surface-parity-upgrade --json`.
