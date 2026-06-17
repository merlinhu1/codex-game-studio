---
status: active
doc_type: contract
truth_kind: engineering-contract
last_reviewed: 2026-06-14
source_of_truth:
  - ../../routes/areas/repository.md
---

# CLI And Validation Contracts

## Purpose

The CLI and validation contracts define the public `opengamestudio` command surface, package entrypoints, hard-failing validation checks, and future-surface guardrails for this repository.

## Scope

This bounded leaf truth doc owns the repository CLI command contract, package scripts/bin/files expectations, validation check behavior, and documented public-surface claims. It does not own the internal details of project scaffolding, role prompt content, or Codex runtime lifecycle beyond the options exposed through the CLI.

## Current Implementation Behavior

- The repository exposes a package CLI named `opengamestudio` from the built `dist/cli.js` entrypoint.
- The CLI currently supports project initialization/status, template discovery, project-local customization inspection, role execution, task management, approval-store management, workflow prompt rendering, workflow shortcut aliases, and validation surfaces.
- Repository validation is executable through `npm run validate`, which builds the package and runs the built CLI validation command.
- Repository validation includes local deterministic behavioral-evaluation scenarios for representative role and workflow prompt contracts; these subchecks render prompts and inspect obligations without hosted evaluators, telemetry, hidden memory, or LLM calls.

## Contract Surface

- Package name: `open-gamestudio`.
- Package bin: `opengamestudio` points to `./dist/cli.js`.
- Primary scripts include `build`, `typecheck`, `test`, `validate`, `init`, `manage`, and `templates`.
- Public CLI command groups include initialization/status commands, template discovery, role run execution, file-backed tasks, approval management, generic workflow prompt rendering, and render-only workflow shortcuts.
- `opengamestudio templates list --project <path>` and `opengamestudio templates show <template-id> --project <path>` include project-local custom templates from `.codex/studio/config.json` alongside built-in package templates.
- `opengamestudio workflow <workflow-id> --project <path>` renders either a built-in workflow ID or an extend-only project-local custom workflow ID/alias.
- Render-only workflow shortcut commands include market, analytics, design-spec, feel-review, art-direction, ui-review, milestone, handoff, review, ship-check, start, onboard, brainstorm, prototype, architecture-decision, architecture-review, create-epics, create-stories, sprint-plan, sprint-status, story-readiness, story-done, qa-plan, regression-suite, security-audit, perf-profile, release-checklist, hotfix, and localization-plan.
- `opengamestudio init` and `opengamestudio new` accept `--studio-mode fast-prototype|guided-studio|strict-studio`, default to `guided-studio` when omitted, and persist that value as `studioMode` in generated `.codex/studio.json`.
- `opengamestudio approval grant --project <path> --role <role> --task <id-or-hash> --scope <glob>` appends a scoped approval record when the role is valid, the scope is safe and non-empty, and the task reference is either an existing task ID assigned to the same role or a 64-character SHA-256 objective hash.
- `opengamestudio approval list --project <path>` prints approval history, including revoked and expired records as visible non-authorizing records.
- `opengamestudio approval revoke --project <path> --approval-id <id>` sets `revokedAt` on the matching record and preserves approval history.
- `opengamestudio run <role> --project <path> --dry-run --approval-scope <glob>` prints approval mismatch diagnostics for guided and strict studio modes without writing prompt cache or run metadata.
- `opengamestudio run <role>` and `opengamestudio task run` expose `--approved-by-user` for guided-studio local override and `--constrained-sandbox` for the explicit `workspace-write` sandbox override. Without the constrained override, allowed mutating runs use `danger-full-access`.
- `opengamestudio task run` accepts `--approval-scope <glob>` for shared approval matching diagnostics and eligibility.
- Repository validation is exposed through `opengamestudio validate` and the `npm run validate` script.

## Inputs

- CLI options and arguments parsed by Commander in `src/cli.ts`.
- Repository files checked by validation, including package metadata, source files, templates, generated build output, engine configs, engine reference packs, deterministic behavioral-evaluation scenarios, and optional project paths.
- Project validation input when `--project <path>` is supplied.
- Project-local customization config at `.codex/studio/config.json`, plus any referenced local prompt, context, workflow, and template files.

## Outputs

- CLI commands print human-readable status, prompt, task, validation, or workflow output.
- Approval grant output includes the new approval ID, normalized role, objective/hash information, scopes, and the approval-store path for inspection. The stored record includes baseline metadata as part of the approval store contract.
- Dry-run role-run output includes eligibility, write policy, Codex sandbox, file-edit permission, approval/override/advisory provenance, project stage, studio mode, diagnostic approval scopes, the current objective hash, matched/no-match status, and per-record authorization reasons such as role, normalized objective, scope, project stage, studio mode, expiry, revocation, and stage mismatches.
- Validation emits one line per check in `STATUS id: message (path)` shape and exits non-zero when any check fails.
- Behavioral evaluation check IDs use `behavioral.scenario.<scenario-id>` and fail when a built-in role/workflow prompt misses required obligations, includes unnegated forbidden future-only drift, exceeds the prompt-size bound, lacks expected selected-context categories, or selects forbidden templates.
- Package smoke validation builds and exercises the packed package bin and template loading behavior, including all template paths registered in `src/templates.ts`.
- Package validation checks every engine reference asset registered for Godot, Unity, and Unreal packs is included in `npm pack`.

## Errors And Diagnostics

- Unknown roles fail with a message naming Codex-native hyphenated role IDs.
- Approval grant rejects empty scopes, unsafe scopes, broad scopes such as `**`, `**/*`, `*`, or `.` unless `--allow-broad-scope` is supplied, invalid roles, unknown task IDs, existing task IDs assigned to a different role, and malformed canonical expiry timestamps.
- Approval revoke fails clearly for unknown approval IDs.
- Unapproved strict-studio mutating `run <role>` and `task run` fail before Codex launch, run metadata writes, or task mutation.
- Missing package scripts, missing package bin/files, missing source files, unavailable Codex CLI, invalid role packages or templates, missing engine reference pack files or reviewer/date/source-link/engine/version-reviewed/tags/roles/workflows metadata, exposed future surfaces, missing build output, and package smoke failures are validation failures.
- Project validation fails for invalid `.codex/studio.json` including invalid `studioMode`, missing or malformed `.codex/approvals.json`, missing or malformed `.codex/context-manifest.json` or `.codex/context-manifest.meta.json`, stale context-manifest hashes or stage/mode inputs, invalid `.codex/studio/config.json`, custom IDs that override built-ins or omit the `custom-*` prefix, unsafe custom file paths, missing custom prompt/template files, missing custom template sections, custom references to unknown roles/workflows/templates, missing generated project files, missing any materialized active-engine reference files, missing active-engine-specialist prompt files, materialized wrong-engine-specialist prompt files, missing workflow/prompt sections, stale or tampered generated-surface metadata, current-renderer mismatches, malformed or incomplete generated-surface metadata markers, forbidden generated surfaces, or read-only command mutations.
- Project validation reports generated prompt or workflow files with no generated-surface metadata markers as legacy skip diagnostics that require regeneration before relying on freshness checks.

## Compatibility Rules

- The TypeScript project uses NodeNext ESM semantics; relative TypeScript imports must use emitted `.js` specifiers.
- Node support requires a package engine floor that includes Node >=20.
- Packaged files must include `dist/`, `engine_configs/`, `engine_reference/`, and `templates/` so the installed bin can load runtime assets.
- Future-only command surfaces such as `next`, `telemetry`, `parallel`, and ownership enforcement must stay hidden until implemented intentionally.

## Versioning And Migration

- Current package version is managed in `package.json` and rendered by Commander.
- CLI contract changes should update README claims, validation expectations, and tests in the same change.

## Product Truth Links

- docs/truthmark/product/open-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Keep `validate` as the hard-failing parity gate before claiming repository or project readiness.
- Decision (2026-05-28): Document and test that future planner/telemetry/parallel/ownership surfaces are not exposed by the CLI.
- Decision (2026-05-30): Validate generated-surface source metadata, rendered-body hashes, and current renderer output for new generated prompt/workflow files, fail malformed or partial generated metadata with the stable freshness/body check IDs, and treat only fully absent metadata as a legacy skip diagnostic.
- Decision (2026-06-13): Treat `.codex/approvals.json` as a required generated project contract and fail project validation with `codex.project.approvals` when the store is missing, malformed JSON, or schema-invalid.
- Decision (2026-06-13): Expose approval grant/list/revoke as audit-store management commands and wire approval matching into `run <role>` and `task run` eligibility for mutating execution.
- Decision (2026-06-13): Expose approval mismatch information through dry-run diagnostics, and fail non-dry unapproved strict-studio mutation before side effects.
- Decision (2026-06-13): Treat `.codex/context-manifest.json` and `.codex/context-manifest.meta.json` as required generated project contracts and validate manifest schema plus sidecar freshness.
- Decision (2026-06-14): Validate engine reference packs structurally by registered file presence and seed-review metadata shape, and validate all active-engine materialized reference files in generated projects without judging prose quality.
- Decision (2026-06-17): Expose the expanded workflow catalog as render-only CLI shortcut commands while keeping future planner/next, telemetry, parallel orchestration, and ownership-enforcement surfaces hidden.
- Decision (2026-06-17): Add local deterministic behavioral-evaluation validation subchecks for representative role/workflow prompt contracts rather than hosted evaluators, telemetry, hidden memory, or LLM judges.
- Decision (2026-06-17): Support project-local customization as an extend-only `custom-*` overlay with schema validation, project-safe paths, generic workflow rendering, and template inspection rather than mutable replacement of built-in registries.

## Rationale

The CLI is the stable integration boundary for humans, package installs, and generated project smoke checks. Validation makes those claims executable so prompt-surface and packaging drift fail before release or parity claims.

## Non-Goals

- This contract does not document every generated prompt body; those belong to the Codex role/workflow truth doc.
- This contract does not define approval matching, revocation, expiry, or scope normalization rules; those belong to the Approval Stores truth doc.
- This contract does not define the internal runtime lifecycle implementation; runtime approval enforcement details belong to the Runtime And Task Execution truth doc.
- This contract does not define npm audit remediation policy.

## Maintenance Notes

- Update this doc with changes to `src/cli.ts`, `src/validation.ts`, `src/customization.ts`, `src/behavioral-evaluation.ts`, `src/context-manifest.ts`, `src/engine-reference.ts`, package metadata, README public command claims, or validation check IDs.
- Relevant verification includes `npm run validate`, CLI help smoke checks, customization tests, behavioral-evaluation tests, validation tests, package dry-run/smoke checks, and future-surface guard tests.

## Source References

- ../../routes/areas/repository.md
