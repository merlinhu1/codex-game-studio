---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-06-27
---

# CLI And Validation Contracts

## Purpose

The CLI and validation contracts define the public `codex-game-studio` command surface.

They also define package entrypoints, hard-failing validation checks, and future-surface guardrails.

## Scope

This leaf doc owns the repository CLI command contract, package scripts, package bin/files expectations, validation checks, and documented public-surface claims.

It does not own project scaffolding internals, role prompt content, or Codex runtime lifecycle details. Runtime details appear here only when they are exposed as CLI options.

## Current Implementation Behavior

- The repository exposes a package CLI named `codex-game-studio`.
- The source checkout exposes a root `./codex-game-studio` wrapper.
- The wrapper executes built TypeScript output at `dist/cli.js` and tells users to run `npm install && npm run build` when it is missing.
- The TypeScript build entrypoint remains `dist/cli.js` for contributor and package validation.
- The CLI supports project initialization and status commands.
- It supports template discovery and project-local customization inspection.
- It supports role execution, file-backed tasks, approval-store management, workflow prompt rendering, workflow shortcut aliases, context-manifest refresh, and validation.
- Repository validation is executable through `npm run validate`.
- `npm run validate` builds TypeScript output and runs the built CLI validation command.
- Validation includes deterministic behavioral-evaluation scenarios for representative prompts.
- Behavioral-evaluation subchecks render prompts and inspect obligations locally.
- They do not use hosted evaluators, telemetry, hidden memory, or LLM calls.

## Contract Surface

- Package name: `codex-game-studio`.
- Package bin: `codex-game-studio` points to `./dist/cli.js`.
- Package bin also keeps `opengamestudio` as a compatibility alias to the same built entrypoint.
- Primary scripts include `build`, `typecheck`, `test`, `validate`, `init`, `manage`, and `templates`.
- Source checkout usage requires `npm install && npm run build`, then goes through `./codex-game-studio`.
- Public command groups include initialization and status commands.
- Public command groups also include template discovery, role runs, file-backed tasks, approval management, generic workflow rendering, and render-only workflow shortcuts.
- `codex-game-studio templates list --project <path>` includes project-local custom templates beside built-in templates.
- `codex-game-studio templates show <template-id> --project <path>` can show project-local custom templates.
- `codex-game-studio workflow <workflow-id> --project <path>` renders built-in workflow IDs.
- The same command also renders extend-only project-local custom workflow IDs and aliases.
- Render-only discovery shortcuts include market, analytics, start, onboard, brainstorm, and prototype.
- Render-only design shortcuts include design-spec, feel-review, art-direction, ui-review, architecture-decision, and architecture-review.
- Render-only production shortcuts include milestone, handoff, review, ship-check, release-checklist, and hotfix.
- Render-only planning shortcuts include create-epics, create-stories, sprint-plan, sprint-status, story-readiness, and story-done.
- Render-only QA and operations shortcuts include qa-plan, regression-suite, security-audit, perf-profile, and localization-plan.
- `codex-game-studio init` and `codex-game-studio new` accept `--studio-mode fast-prototype|guided-studio|strict-studio`.
- Omitted `--studio-mode` defaults to `guided-studio`.
- Generated `.codex/studio.json` persists the value as `studioMode`.
- `codex-game-studio approval grant --project <path> --role <role> --task <id-or-hash> --scope <glob>` appends a scoped approval record.
- Approval grant accepts built-in roles and syntactically valid `custom-*` role IDs.
- Approval grant requires a safe, non-empty scope.
- Approval grant accepts either an existing same-role task ID or a 64-character SHA-256 objective hash.
- `codex-game-studio approval list --project <path>` prints approval history.
- Approval history includes revoked and expired records as visible non-authorizing records.
- `codex-game-studio approval revoke --project <path> --approval-id <id>` sets `revokedAt` on the matching record.
- Revocation preserves approval history.
- `codex-game-studio run <role> --project <path> --dry-run --approval-scope <glob>` prints approval mismatch diagnostics.
- The dry-run approval diagnostics apply to guided and strict studio modes.
- Dry-run approval diagnostics do not write prompt cache or run metadata.
- `codex-game-studio run <role>` and `codex-game-studio task run` expose `--approved-by-user` for guided-studio local override.
- They expose `--constrained-sandbox` for explicit `workspace-write` sandbox use.
- Without the constrained override, allowed mutating runs use `danger-full-access`.
- `codex-game-studio task run` accepts `--approval-scope <glob>`.
- Repository validation is exposed through `codex-game-studio validate` and `npm run validate`.
- Context-manifest refresh is exposed through `codex-game-studio refresh-context --project <path>`.

## Inputs

- CLI options and arguments parsed by Commander in `src/cli.ts`.
- Repository files checked by validation.
- Checked files include package metadata, source files, templates, generated build output, engine configs, and engine reference packs.
- Checked inputs also include behavioral-evaluation scenarios and optional project paths.
- Project validation input when `--project <path>` is supplied.
- Project-local customization config at `.codex/studio/config.json`.
- Referenced local prompt, context, workflow, and template files.

## Outputs

- CLI commands print human-readable status, prompt, task, validation, or workflow output.
- Approval grant output includes the new approval ID, normalized role, objective/hash information, scopes, and approval-store path.
- Stored approval records include baseline metadata.
- Dry-run role-run output includes eligibility, write policy, Codex sandbox, file-edit permission, provenance, project stage, and studio mode.
- It also includes approval scopes, current objective hash, match status, and authorization reasons.
- Authorization reasons include role, objective, scope, project stage, studio mode, expiry, revocation, and stage mismatches.
- Validation emits one line per check in `STATUS id: message (path)` shape.
- Context refresh prints the refreshed project name and both context manifest paths.
- Validation exits non-zero when any check fails.
- Behavioral evaluation check IDs use `behavioral.scenario.<scenario-id>`.
- Behavioral checks fail when prompts miss required obligations.
- They also fail on unnegated future-only drift, prompt-size overflow, missing selected-context categories, missing required templates, or forbidden templates.
- Package smoke validation builds TypeScript output and exercises the packed package bin.
- Package smoke validation also checks template loading behavior.
- Package validation checks every registered engine reference asset is included in `npm pack`.

## Errors And Diagnostics

- Unknown roles fail with a message naming Codex-native hyphenated role IDs.
- Approval grant rejects empty scopes.
- Approval grant rejects unsafe scopes.
- Approval grant rejects broad scopes unless `--allow-broad-scope` is supplied.
- Broad scopes include `**`, `**/*`, `*`, and `.`.
- Approval grant rejects invalid roles, unknown task IDs, wrong-role task IDs, and malformed canonical expiry timestamps.
- Approval revoke fails clearly for unknown approval IDs.
- Unapproved strict-studio mutating `run <role>` and `task run` fail before Codex launch, run metadata writes, or task mutation.
- Validation fails on missing package scripts, package bin/files, source wrapper, source files, Codex CLI, role packages, templates, and engine reference assets.
- It also fails on missing build output or broken package smoke behavior.
- Validation fails when engine reference metadata is missing reviewer, date, source link, engine, reviewed version, tags, roles, or workflows.
- Validation fails when future surfaces are exposed early.
- Project validation fails when `.codex/studio.json` is invalid.
- It fails when `.codex/approvals.json` is missing, malformed, or schema-invalid.
- It fails when `.codex/context-manifest.json` or its metadata sidecar is missing, malformed, or stale.
- It fails when `.codex/studio/config.json` is invalid.
- It fails when custom IDs override built-ins or omit the `custom-*` prefix.
- It fails for unsafe custom paths, missing custom files, missing custom template sections, and unknown custom references.
- It fails for missing generated project files and missing active-engine references.
- It fails for missing active-engine specialist prompts or materialized wrong-engine specialist prompts.
- It fails for missing workflow/prompt sections, stale generated metadata, tampered metadata, and current-renderer mismatches.
- It also fails for forbidden generated surfaces and read-only command mutations.
- Generated prompt or workflow files with no metadata markers are legacy skip diagnostics.
- Legacy skip diagnostics require regeneration before freshness checks can be trusted.

## Compatibility Rules

- The TypeScript project uses NodeNext ESM semantics.
- Relative TypeScript imports must use emitted `.js` specifiers.
- Node support requires a package engine floor that includes Node >=24.
- Packaged files must include `dist/`, `engine_configs/`, `engine_reference/`, and `templates`.
- Future-only command surfaces stay hidden until implemented intentionally.
- Future-only examples include `next`, `telemetry`, hosted/background orchestration, unbounded parallelism, and ownership enforcement.

## Versioning And Migration

- Current package version is managed in `package.json`.
- Commander renders the package version.
- CLI contract changes should update README claims, validation expectations, and tests in the same change.

## Product Truth Links

- docs/truthmark/product/codex-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Keep `validate` as the hard-failing parity gate before readiness claims.
- Decision (2026-05-28): Test that future planner, telemetry, parallel, and ownership surfaces are not exposed.
- Decision (2026-05-30): Validate generated-surface source metadata and rendered-body hashes for new generated files.
- Decision (2026-05-30): Fail malformed or partial generated metadata with stable freshness/body check IDs.
- Decision (2026-05-30): Treat only fully absent metadata as a legacy skip diagnostic.
- Decision (2026-06-13): Treat `.codex/approvals.json` as a required generated project contract.
- Decision (2026-06-13): Fail project validation with `codex.project.approvals` when the approval store is missing, malformed, or schema-invalid.
- Decision (2026-06-13): Expose approval grant/list/revoke as audit-store management commands.
- Decision (2026-06-13): Wire approval matching into mutating `run <role>` and `task run` eligibility.
- Decision (2026-06-13): Expose approval mismatch information through dry-run diagnostics.
- Decision (2026-06-13): Fail unapproved strict-studio mutation before side effects.
- Decision (2026-06-13): Treat context manifest and sidecar metadata as required generated project contracts.
- Decision (2026-06-13): Validate manifest schema and sidecar freshness.
- Decision (2026-06-14): Validate engine reference packs by registered file presence and seed-review metadata shape.
- Decision (2026-06-14): Validate active-engine materialized references without judging prose quality.
- Decision (2026-06-17): Expose the expanded workflow catalog as render-only CLI shortcuts.
- Decision (2026-06-26): Keep planner/next, telemetry, hosted/background orchestration, unbounded parallelism, and ownership enforcement absent from public CLI and validation surfaces.
- Decision (2026-06-25): Treat explicit local task orchestration as in-boundary once it has CLI behavior, validation, tests, and truth docs; keep hosted/background orchestration and unbounded parallelism hidden.
- Decision (2026-06-17): Add local deterministic behavioral-evaluation subchecks.
- Decision (2026-06-17): Do not use hosted evaluators, telemetry, hidden memory, or LLM judges for those checks.
- Decision (2026-06-17): Support project-local customization as an extend-only `custom-*` overlay.
- Decision (2026-06-17): Validate customization schema, project-safe paths, generic workflow rendering, and template inspection.
- Decision (2026-06-17): Do not allow customization to replace built-in registries.

## Rationale

The CLI is the stable integration boundary for humans, package installs, and generated project smoke checks.

Validation makes those claims executable. Prompt-surface drift and packaging drift should fail before release or parity claims.

## Non-Goals

- This contract does not document every generated prompt body.
- This contract does not define approval matching, revocation, expiry, or scope normalization rules.
- This contract does not define the internal runtime lifecycle.
- This contract does not define npm audit remediation policy.

## Maintenance Notes

- Update this doc when CLI behavior, validation behavior, behavioral-evaluation checks, context-manifest checks, or engine-reference checks change.
- Also update it when package metadata, README claims, or validation IDs change.
- Relevant verification includes `npm run validate`, CLI help smoke checks, customization tests, and behavioral-evaluation tests.
- It also includes validation tests, package smoke checks, and future-surface guard tests.

## Source References

- ../../routes/areas/repository.md
- ../../../../package.json
- ../../../../src/cli.ts
- ../../../../src/projects.ts
- ../../../../src/validation.ts
- ../../../../src/customization.ts
- ../../../../src/context-manifest.ts
- ../../../../src/engine-reference.ts
- ../../../../src/generated-surfaces.ts
- ../../../../src/behavioral-evaluation.ts
- ../../../../tests/cli-prompt-surface.test.ts
- ../../../../tests/project-workflow.test.ts
- ../../../../tests/validation.test.ts
- ../../../../tests/functionality-gap-pass.test.ts
- ../../../../tests/customization.test.ts
- ../../../../tests/behavioral-evaluation.test.ts
