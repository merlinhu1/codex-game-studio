## 1. Policy and Approval Foundation

- [ ] 1.1 Add failing `tests/studio-policy.test.ts` cases for independent project stage/studio mode, studio-mode approval defaults, read-only plan/review phases, implementation/fix eligibility, and `danger-full-access` mutating sandbox defaults.
- [ ] 1.2 Create `src/studio-policy.ts` with `ProjectStage`, `StudioMode`, `ApprovalPolicy`, `WritePolicy`, `CodexSandboxMode`, `CodexStudioPhase`, and pure policy mapping helpers.
- [ ] 1.3 Verify policy primitives with `npm test -- tests/studio-policy.test.ts` and `npm run typecheck`.
- [ ] 1.4 Add failing `tests/approval-gates.test.ts` and validation/project workflow tests for approval stages, canonical objective/scope hashing, unsafe scope rejection, `.codex/approvals.json` generation, and malformed approval validation.
- [ ] 1.5 Create `src/approvals.ts` with schema, canonical serialization, objective hash, scope normalization, approval matching, expiry/revocation logic, and approval-store helpers.
- [ ] 1.6 Generate `.codex/approvals.json` during `initProject` and validate approval-store shape in `src/validation.ts`.
- [ ] 1.7 Verify approval storage with `npm test -- tests/approval-gates.test.ts tests/project-workflow.test.ts tests/validation.test.ts -t "approval"` and `npm run typecheck`.
- [ ] 1.8 Add failing CLI tests for `approval grant`, `approval list`, `approval revoke`, empty/broad scope acknowledgement, dry-run mismatch diagnostics, and revoked/expired approval behavior.
- [ ] 1.9 Implement approval CLI commands in `src/cli.ts` and approval mutation helpers in `src/approvals.ts`.
- [ ] 1.10 Verify approval CLI with `npm test -- tests/cli-prompt-surface.test.ts tests/approval-gates.test.ts -t "approval"` and `npm run typecheck`.

## 2. Shared Mutating Execution Gate

- [ ] 2.1 Add failing black-box tests proving unapproved strict `run <role>` and `task run` fail before Codex spawn, run metadata writes, or task mutation.
- [ ] 2.2 Add failing tests proving guided `--approved-by-user` succeeds with override metadata, fast prototype writes advisory provenance, and `--review` stays read-only in every studio mode.
- [ ] 2.3 Wire `src/runner.ts`, `src/tasks.ts`, `src/cli.ts`, and `src/codex-session.ts` through one eligibility result containing `allowed`, `writePolicy`, `allowFileEdits`, `codexSandbox`, `reason`, `requiredApproval`, and metadata.
- [ ] 2.4 Ensure allowed mutating implementation/fix defaults to `danger-full-access`; keep `workspace-write` only behind explicit constrained-sandbox override.
- [ ] 2.5 Verify shared gating with `npm test -- tests/runner.test.ts tests/tasks.test.ts tests/approval-gates.test.ts tests/cli-prompt-surface.test.ts` and `npm run validate`.

## 3. Context Contract and Prompt Builder

- [ ] 3.1 Add failing `tests/runner.test.ts` cases for a shared `# Context Contract` in implementation, review, and fix prompts, including active studio mode, write policy, selected context, and bounded blocker lists.
- [ ] 3.2 Create or update `src/prompt-context.ts` and refactor `src/runner.ts` to use it for run/review/fix prompt assembly.
- [ ] 3.3 Verify prompt builder with `npm test -- tests/runner.test.ts` and `npm run typecheck`.
- [ ] 3.4 Add failing `tests/codex-context-files.test.ts` cases for required context selection, missing required file status, max file count/character budgets, forbidden paths, symlink escapes, traversal rejection, and secret-like paths.
- [ ] 3.5 Create `src/context-manifest.ts` and replace ad hoc broad context with a path-safe selector used by runner/workflow code.
- [ ] 3.6 Verify selector behavior with `npm test -- tests/codex-context-files.test.ts` and `npm run typecheck`.
- [ ] 3.7 Add failing project generation/validation tests for `.codex/context-manifest.json`, `.codex/context-manifest.meta.json`, manifest schema, stale manifest hashes, and engine reference entries.
- [ ] 3.8 Generate context manifest files from `src/projects.ts`, validate them in `src/validation.ts`, and include project stage/studio mode in manifest inputs.
- [ ] 3.9 Verify manifest generation with `npm test -- tests/project-workflow.test.ts tests/validation.test.ts -t "context manifest"` and `npm run validate`.

## 4. Engine Reference Packs

- [ ] 4.1 Add failing `tests/engine-system.test.ts` and `tests/validation.test.ts` cases for engine reference registry entries, required file presence, reviewer/date/source-link metadata, package inclusion, and project materialization.
- [ ] 4.2 Create `src/engine-reference.ts` with registry entries for Godot, Unity, and Unreal package roots, project roots, required files, plugin/specialist files, prompt references, and validation rules.
- [ ] 4.3 Add skeleton `engine_reference/godot/**`, `engine_reference/unity/**`, and `engine_reference/unreal/**` files with version applicability, reviewer/date/source-link metadata, prefer/avoid guidance, pitfalls, verification notes, role notes, and official links.
- [ ] 4.4 Update `package.json.files`, package asset resolution, and validation so `npm pack --json` includes representative engine reference assets.
- [ ] 4.5 Verify engine package assets with `npm test -- tests/engine-system.test.ts tests/validation.test.ts -t "engine reference"` and `npm run validate`.
- [ ] 4.6 Add prompt-selection tests proving engine specialists and relevant programmers receive selected engine docs and unrelated engine docs are excluded by default.
- [ ] 4.7 Wire selected engine references into `src/agents.ts`, `src/roles.ts`, and `src/context-manifest.ts`.
- [ ] 4.8 Verify engine prompt selection with `npm test -- tests/agents-templates.test.ts tests/codex-context-files.test.ts` and `npm run validate`.

## 5. Studio Role Taxonomy

- [ ] 5.1 Add failing role tests for the built-in taxonomy covering directors/orchestration, department leads, market/data/product intelligence, programming specialists, design/UX specialists, content/art/audio specialists, and engine specialists.
- [ ] 5.2 Add failing tests for `activeRolesForStageAndStudioMode("prototype", "fast-prototype")`, `activeRolesForStageAndStudioMode("prototype", "guided-studio")`, and `activeRolesForStageAndStudioMode("development", "strict-studio")`.
- [ ] 5.3 Extend `src/roles.ts` or create `src/studio-taxonomy.ts` with role metadata: tier, department, default project stages, default studio modes, approval behavior, required context, forbidden globs, engine overlays, and canonical IDs.
- [ ] 5.4 Preserve or explicitly replace current orchestration, market analysis, data/analytics, UI/UX, QA, release, and handoff capability coverage.
- [ ] 5.5 Add an explicit `customRoles` or namespaced extension lane that validates schema, prompt, context, and materialization without old built-in alias shims.
- [ ] 5.6 Update generation and validation so only selected roles materialize prompt files.
- [ ] 5.7 Verify role taxonomy with `npm test -- tests/roles.test.ts tests/agents-templates.test.ts` and `npm run typecheck`.

## 6. Path-Scoped Rules and Session Recovery

- [ ] 6.1 Add failing `tests/rules.test.ts`, runner tests, and validation tests for rules registry schema, generated `.codex/rules/**` or `.codex/rules.json`, relevant-rule prompt inclusion, and forbidden cross-domain edit warnings.
- [ ] 6.2 Create `src/rules.ts` with path-scoped rules for gameplay, core engine, AI, networking, UI, tests, prototypes, assets, design docs, and production docs.
- [ ] 6.3 Wire rules into project generation, prompt-context selection, and validation.
- [ ] 6.4 Verify rules with `npm test -- tests/rules.test.ts tests/runner.test.ts tests/validation.test.ts` and `npm run validate`.
- [ ] 6.5 Add failing `tests/session-state.test.ts` and project workflow tests for `production/session-state/active.md`, optional `.codex/session-events.jsonl`, read-only state suggestions, and write-policy-controlled state updates.
- [ ] 6.6 Create `src/session-state.ts`, generate lightweight session state, include it only when relevant, and record write-policy metadata for updates.
- [ ] 6.7 Verify session recovery with `npm test -- tests/session-state.test.ts tests/project-workflow.test.ts` and `npm run validate`.

## 7. Workflow Catalog Expansion

- [ ] 7.1 Add failing workflow tests for registry metadata fields: family, owner role, exposure, approval behavior, input schema, expected artifacts, and write scope.
- [ ] 7.2 Add workflow families for onboarding/navigation, design, architecture, production, reviews, QA/testing, and release as catalog data first.
- [ ] 7.3 Expose only selected high-value CLI aliases initially: `start`, `brainstorm`, `setup-engine`, `architecture-decision`, `design-review`, `qa-plan`, `gate-check`, and `story-readiness`.
- [ ] 7.4 Verify catalog-only workflows do not appear as top-level CLI aliases.
- [ ] 7.5 Ensure write-capable workflows use the shared eligibility result and read-only workflows do not request write eligibility.
- [ ] 7.6 Verify workflow catalog with `npm test -- tests/project-workflow.test.ts tests/agents-templates.test.ts tests/cli-prompt-surface.test.ts` and `npm run validate`.

## 8. Generated Instructions, Validation, and Packaging

- [ ] 8.1 Add failing `tests/agents-templates.test.ts` and validation tests for generated `AGENTS.md` explaining project stage, studio mode, approval/override loop, context contract, engine references, path rules, session state, and no `CODEX.md`.
- [ ] 8.2 Update `src/agents.ts` as the single owner of generated `AGENTS.md` and role prompts.
- [ ] 8.3 Verify generated instructions with `npm test -- tests/agents-templates.test.ts tests/validation.test.ts -t "AGENTS"` and `npm run validate`.
- [ ] 8.4 Add failing validation tests for strict target-surface statuses, missing target surface failures, optional catalog skips, stale/corrupt sidecar metadata, package asset failures, and future-only surface absence.
- [ ] 8.5 Extend `src/validation.ts` with the new status taxonomy and generated-surface checks for approvals, manifests, rules, engine references, workflows, and richer role prompts.
- [ ] 8.6 Verify validation with `npm test -- tests/validation.test.ts tests/project-workflow.test.ts -t "validation status"` and `npm run validate`.
- [ ] 8.7 Add installed-bin smoke tests proving temp-cwd installed package can run `templates list`, `validate`, and engine-reference validation using package-root assets.
- [ ] 8.8 Ensure `package.json.files` and `npm pack --json` include `engine_reference/**`, `rules/**`, `templates/**`, `engine_configs/**`, and selected runtime docs.
- [ ] 8.9 Verify package behavior with `npm run build`, `npm run validate`, and `npm test -- --run`.

## 9. Docs, Truthmark, and Parity Closeout

- [ ] 9.1 Replace `.hermes/plans/2026-05-31_173614-depth-context-approval-engine-refactor.md` with a compact index pointing to this OpenSpec change as canonical.
- [ ] 9.2 Update README and behavior-bearing docs for project stage vs studio mode, approval commands, context manifests, engine references, role/workflow catalog, session state, validation, and future-only exclusions.
- [ ] 9.3 Update Truthmark-backed truth docs and routes for changed behavior after functional changes land.
- [ ] 9.4 Run OpenSpec validation: `openspec validate flexible-studio-depth-refactor --strict --json` and `openspec status --change flexible-studio-depth-refactor --json`.
- [ ] 9.5 Run repo validation: `npm run validate` and `npm test -- --run`.
- [ ] 9.6 Run Truthmark closeout after tests for behavior-bearing changes: `truthmark check --json` plus the repository Truthmark sync workflow when code changed.
- [ ] 9.7 Write the final parity report citing role/workflow/engine/context/approval coverage, human-reviewed engine references, installed-bin smoke results, and validation output.
