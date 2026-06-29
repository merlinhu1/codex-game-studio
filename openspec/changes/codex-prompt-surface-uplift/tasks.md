# Tasks: Codex Prompt Surface Uplift

## 1. Inventory and audit

- [x] 1.1 Create `scripts/audit-prompt-surfaces.ts` to inventory `.codex/agents`, `.codex/workflows`, `.agents/skills`, and runtime prompt owners.
- [x] 1.2 Add `tests/prompt-surface-audit.test.ts` with a failing audit fixture for line counts, hashes, metadata coverage, and upstream candidate mapping.
- [x] 1.3 Emit `references/prompt-surface-uplift-matrix.json` and `references/prompt-surface-uplift-matrix.md` with source path, source hash, local target, decision, score, status, and required tests.
- [x] 1.4 Run `npm test -- tests/prompt-surface-audit.test.ts` and inspect the generated matrix.

## 2. CCGS source parser

- [x] 2.1 Extend the audit script to parse CCGS `.claude/agents/*.md` frontmatter and bodies.
- [x] 2.2 Extend the audit script to parse CCGS `.claude/skills/*/SKILL.md` frontmatter and bodies.
- [x] 2.3 Capture upstream `model`, `tools`, `allowed-tools`, `disallowedTools`, `skills`, `agent`, `memory`, `isolation`, `argument-hint`, `user-invocable`, and `maxTurns`.
- [x] 2.4 Add tests for explicit decisions: `adopt`, `adapt`, `merge`, `split`, `defer`, and `out-of-scope`.

## 3. Metadata schema

- [x] 3.1 Create `src/prompt-surface-metadata.ts` with exact Codex model, reasoning effort, tool policy, source traceability, and link schemas.
- [x] 3.2 Add `tests/prompt-surface-metadata.test.ts` for valid `gpt-5.5`, `gpt-5.4`, and `gpt-5.4-mini` policies.
- [x] 3.3 Add tests that reject `sonnet`, `haiku`, `opus`, `claude-*`, and abstract model labels as active runtime model values.
- [x] 3.4 Add serialization helpers used by validation and runtime rendering.

## 4. Agent model and metadata policy

- [x] 4.1 Add complete model/source/tool/link metadata to pilot agents `game-designer`, `producer`, and `qa-playtester`.
- [x] 4.2 Extend validation to require exact model policy and source traceability for `.codex/agents/*.toml`.
- [x] 4.3 Add validation tests for missing agent model, invalid model, broken linked skill, and missing source hash.
- [x] 4.4 Roll the agent schema across all `.codex/agents/*.toml` files.

## 5. Skill model and metadata policy

- [x] 5.1 Add complete frontmatter to pilot skills `cgs-prototype`, `cgs-design-system`, `cgs-vertical-slice`, `cgs-help`, and `cgs-sprint-status`.
- [x] 5.2 Extend validation to require exact model policy, source traceability, agent routing, and argument hints for user-invocable skills.
- [x] 5.3 Add validation tests for skill model tier selection and Claude metadata rejection.
- [x] 5.4 Roll the policy across all `.agents/skills/*/SKILL.md` files.

## 6. Workflow model and metadata policy

- [x] 6.1 Add frontmatter to pilot workflows `vertical-slice`, `bugfix`, `prototype`, `ship-check`, and `architecture-review`.
- [x] 6.2 Extend validation to require model policy, primary agent, linked skills, phase, risk, argument hint, and source references for `.codex/workflows/*.md`.
- [x] 6.3 Add tests that workflow links resolve to tracked agents and skills.
- [x] 6.4 Roll the policy across all `.codex/workflows/*.md` files.

## 7. Runtime model enforcement

- [x] 7.1 Modify `src/runner.ts` to resolve model policy in order: explicit CLI override, workflow policy, skill policy, agent policy, repository default.
- [x] 7.2 Modify `src/codex-runtime.ts` so Codex execution receives the selected exact model.
- [x] 7.3 Modify `src/tasks.ts` so task runs record selected model, reasoning effort, and source surface.
- [x] 7.4 Add tests that `vertical-slice` uses `gpt-5.5`, `bugfix` uses `gpt-5.4`, and `help` uses `gpt-5.4-mini`.
- [x] 7.5 Add a no-silent-fallback test for rejected model names.

## 8. Pilot content uplift

- [x] 8.1 Deeply adapt CCGS `prototype` into `.agents/skills/cgs-prototype/SKILL.md` using Codex-native metadata and wording.
- [x] 8.2 Deeply adapt CCGS `design-system` into `.agents/skills/cgs-design-system/SKILL.md`.
- [x] 8.3 Deeply adapt CCGS `vertical-slice` into `.agents/skills/cgs-vertical-slice/SKILL.md`.
- [x] 8.4 Deeply adapt CCGS `game-designer` into `.codex/agents/game-designer.toml`.
- [x] 8.5 Deeply uplift `.codex/workflows/vertical-slice.md` with phase gates, artifacts, model policy, linked skills, and final report contract.
- [x] 8.6 Add depth tests for pilot surfaces and run `npm test -- tests/template-repository-surfaces.test.ts tests/runner.test.ts tests/validation.test.ts`.

## 9. Bulk skill uplift

- [x] 9.1 Group all skills by upstream source, local complexity tier, and model policy.
- [x] 9.2 Adapt every upstream-backed skill section-by-section, preserving long-form procedure where upstream content is substantial.
- [x] 9.3 Add explicit adaptation rationale for any upstream-backed skill that remains short.
- [x] 9.4 Add validation that flags suspiciously thin wrappers for upstream sources over 200 lines.

## 10. Bulk agent uplift

- [x] 10.1 Map every CCGS agent to a local Codex agent or an explicit defer/out-of-scope decision.
- [x] 10.2 Expand every local agent with use cases, do-not-use cases, responsibilities, procedure, output contract, stop conditions, linked skills, and handoff requirements.
- [x] 10.3 Update `src/roles.ts` so rendered runtime prompts align with tracked agent metadata.
- [x] 10.4 Run `npm test -- tests/roles.test.ts tests/template-repository-surfaces.test.ts`.

## 11. Bulk workflow uplift

- [x] 11.1 Add model policy, selected context, required artifacts, phase gates, and output contract to every workflow Markdown file.
- [x] 11.2 Update `src/workflows.ts` and `src/workflow-catalog.ts` so registry metadata matches tracked workflow frontmatter.
- [x] 11.3 Run `npm test -- tests/workflow-catalog.test.ts tests/workflow-recipes.test.ts`.

## 12. Optional OpenAI skill UI metadata

- [x] 12.1 Add `agents/openai.yaml` for selected high-value user-invocable skills: `cgs-prototype`, `cgs-vertical-slice`, `cgs-bugfix`, `cgs-release-checklist`, and `cgs-help`.
- [x] 12.2 Validate display name, short description, default prompt, invocation policy, and dependency shape.
- [x] 12.3 Add tests that optional skill metadata paths resolve and do not introduce hidden lifecycle behavior.

## 13. Quality scoring and validation

- [x] 13.1 Extend `src/validation.ts` with prompt-surface quality scoring for metadata, depth, procedure, context contract, output contract, gates, stop conditions, traceability, and model policy.
- [x] 13.2 Add stable diagnostic IDs for thin wrappers, missing model policy, missing traceability, Claude metadata, and broken links.
- [x] 13.3 Keep deterministic validation separate from behavioral evaluation.
- [x] 13.4 Run `npm run validate` and ensure it fails intentionally on fixture regressions and passes on the completed template.

## 14. Behavioral evals

- [x] 14.1 Add deterministic behavioral scenarios for design-system, prototype, vertical-slice, bugfix, and release-checklist prompts.
- [x] 14.2 Add `references/prompt-uplift-eval-protocol.md` for optional manual Codex evaluation runs.
- [x] 14.3 Ensure evals check output structures and stop conditions rather than just file length.

## 15. Docs and Truthmark

- [x] 15.1 Replace `docs/plans/2026-06-29-codex-prompt-surface-uplift.md` with the compact OpenSpec index.
- [x] 15.2 Update `README.md`, `docs/project-anatomy.md`, `docs/user-guide.md`, and `docs/workflow-validation.md` with exact model routing behavior.
- [x] 15.3 Update `docs/truthmark/**/*.md` source references for new metadata files, tests, and validation behavior.

## 16. Final verification

- [x] 16.1 Run `npm run typecheck`.
- [x] 16.2 Run `npm test`.
- [x] 16.3 Run `npm run validate`.
- [x] 16.4 Run `git diff --check`.
- [x] 16.5 Run `npx --yes truthmark check --json`.
- [x] 16.6 Run `npx --yes truthmark index --json`.
- [x] 16.7 Run `openspec validate codex-prompt-surface-uplift --strict --json` and `openspec validate --all --strict --json`.
