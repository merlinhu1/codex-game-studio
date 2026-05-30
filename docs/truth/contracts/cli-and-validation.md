---
status: active
doc_type: contract
truth_kind: contract
last_reviewed: 2026-05-30
source_of_truth:
  - ../../truthmark/areas/repository.md
---

# CLI And Validation Contracts

## Purpose

The CLI and validation contracts define the public `open-gamestudio` command surface, package entrypoints, hard-failing validation checks, and future-surface guardrails for this repository.

## Scope

This bounded leaf truth doc owns the repository CLI command contract, package scripts/bin/files expectations, validation check behavior, and documented public-surface claims. It does not own the internal details of project scaffolding, role prompt content, or Codex runtime lifecycle beyond the options exposed through the CLI.

## Contract Surface

- Package name: `open-gamestudio`.
- Package bin: `open-gamestudio` points to `./dist/cli.js`.
- Primary scripts include `build`, `typecheck`, `test`, `validate`, `init`, `manage`, and `templates`.
- Public CLI command groups include initialization/status commands, template discovery, role run execution, file-backed tasks, and render-only workflow shortcuts.
- Repository validation is exposed through `open-gamestudio validate` and the `npm run validate` script.

## Inputs

- CLI options and arguments parsed by Commander in `src/cli.ts`.
- Repository files checked by validation, including package metadata, source files, templates, generated build output, engine configs, and optional project paths.
- Project validation input when `--project <path>` is supplied.

## Outputs

- CLI commands print human-readable status, prompt, task, validation, or workflow output.
- Validation emits one line per check in `STATUS id: message (path)` shape and exits non-zero when any check fails.
- Package smoke validation builds and exercises the packed package bin and template loading behavior.

## Errors And Diagnostics

- Unknown roles fail with a message naming Codex-native hyphenated role IDs.
- Missing package scripts, missing package bin/files, missing source files, unavailable Codex CLI, invalid templates, exposed future surfaces, missing build output, and package smoke failures are validation failures.
- Project validation fails for invalid `.codex/studio.json`, missing generated project files, missing workflow/prompt sections, stale or tampered generated-surface metadata, current-renderer mismatches, malformed or incomplete generated-surface metadata markers, forbidden generated surfaces, or read-only command mutations.
- Project validation reports generated prompt or workflow files with no generated-surface metadata markers as legacy skip diagnostics that require regeneration before relying on freshness checks.

## Compatibility Rules

- The TypeScript project uses NodeNext ESM semantics; relative TypeScript imports must use emitted `.js` specifiers.
- Node support requires a package engine floor that includes Node >=20.
- Packaged files must include `dist/`, `engine_configs/`, and `templates/` so the installed bin can load runtime assets.
- Future-only command surfaces such as `next`, `telemetry`, `parallel`, and ownership enforcement must stay hidden until implemented intentionally.

## Versioning And Migration

- Current package version is managed in `package.json` and rendered by Commander.
- CLI contract changes should update README claims, validation expectations, and tests in the same change.

## Product Decisions

- Decision (2026-05-28): Keep `validate` as the hard-failing parity gate before claiming repository or project readiness.
- Decision (2026-05-28): Document and test that future planner/telemetry/parallel/ownership surfaces are not exposed by the CLI.
- Decision (2026-05-30): Validate generated-surface source metadata, rendered-body hashes, and current renderer output for new generated prompt/workflow files, fail malformed or partial generated metadata with the stable freshness/body check IDs, and treat only fully absent metadata as a legacy skip diagnostic.

## Rationale

The CLI is the stable integration boundary for humans, package installs, and generated project smoke checks. Validation makes those claims executable so prompt-surface and packaging drift fail before release or parity claims.

## Non-Goals

- This contract does not document every generated prompt body; those belong to the Codex role/workflow truth doc.
- This contract does not define npm audit remediation policy.

## Maintenance Notes

- Update this doc with changes to `src/cli.ts`, `src/validation.ts`, package metadata, README public command claims, or validation check IDs.
- Relevant verification includes `npm run validate`, CLI help smoke checks, validation tests, package dry-run/smoke checks, and future-surface guard tests.
