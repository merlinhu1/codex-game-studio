---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-25
---

# Approval Stores

## Purpose

Approval stores preserve auditable authorization records for studio write-gating workflows.

## Scope

This leaf doc owns the approval-store data model and helper behavior.

It covers canonical objective hashing, scope normalization, approval matching, expiry, and revocation.

It also covers reads, writes, and mutations. It does not own approval CLI syntax, runner/task eligibility, project initialization, or validation diagnostics.

This doc was created from the editable engineering-behavior template at docs/truthmark/templates/engineering-behavior.md.

## Current Implementation Behavior

- Approval stores are JSON objects.
- Store objects use `schemaVersion: 1`, `product: "codex-game-studio"`, and a `records` array.
- Empty stores contain no approval records and are written deterministically.
- Approval stages are `question`, `options`, `decision`, `draft`, `approved`, `implemented`, `reviewed`, and `blocked`.
- Approval records include an ID, stage, role, and canonical objective SHA-256.
- Records may include normalized objective text, project stage, and studio mode.
- Records include approved glob scope and optional approved file scope.
- Records also include source, approver, approval timestamp, optional expiry, optional revocation, and baseline metadata.
- Approval timestamps use canonical UTC ISO strings in `YYYY-MM-DDTHH:mm:ss.sssZ` form.
- Canonical objective hashes include normalized role ID and normalized objective text.
- They also include normalized approved globs, normalized approved files, project stage, and studio mode.
- Approval matching authorizes only `approved` records.
- Matching requires role, objective hash, glob scope, file scope, project stage, and studio mode to match.
- Expired and revoked records never authorize a run.
- Runtime eligibility consumes approval matching for guided and strict studio mutation paths.
- Strict studio mutation requires a matching approval.
- Guided studio mutation accepts either a matching approval or an explicit local override.
- Revoked and expired approvals remain valid history records.
- Approval mismatch diagnostics report the expected objective hash.
- Diagnostics also list per-record non-authorization reasons.
- Reasons include role, objective, scope, file scope, project stage, studio mode, objective hash, revocation, expiry, and stage mismatches.
- Approval mutation helpers append deterministic `approval-###` records.
- New approval records use source `approval-command`, normalized scopes, approver metadata, baseline metadata, and canonical timestamps.
- Revocation sets `revokedAt` the first time a record is revoked.
- Repeated revocation preserves both the record and the original revocation timestamp.
- Approval grant baseline metadata stores git HEAD and a SHA-256 of the current git diff when git metadata is available.
- When git metadata is unavailable, grants store an explicit unavailable marker and deterministic fallback diff SHA.

## Core Rules

- Scope normalization rejects unsafe paths.
- Unsafe paths include absolute paths, parent traversal, control characters, secret-like path segments, and symlink escapes.
- Scope entries normalize Windows separators to POSIX-style separators.
- Scope entries are deduplicated and sorted for deterministic hashing and storage.
- Canonical serialization sorts object keys and omits `undefined` values before hashing.
- Broad approval scope detection treats `.`, `*`, `**`, and `**/*` as repository-wide scopes.
- Approval validation rejects malformed stores.
- Validation reports field-specific errors for invalid records, duplicate approval IDs, and project-root-aware scope failures.

## Flows And States

- Store creation creates an empty versioned store.
- Store creation also ensures the `.codex` parent directory exists and writes deterministic JSON to `.codex/approvals.json`.
- Store reads parse `.codex/approvals.json` and validate it against the project root.
- Store reads return a typed store only when validation passes.
- Match flow computes the canonical objective hash for the requested role, objective, scope, stage, and mode.
- Match flow scans approval records and checks stored scope, files, stage, and mode when present.
- Match flow ignores revoked, expired, and non-approved records.
- When no active record matches, match flow returns mismatch reasons.
- List-state flow marks a record as authorizing only when it is approved, unexpired, and not revoked.
- Revoked and expired records remain visible as non-authorizing history.

## Contracts

- `src/approvals.ts` exports approval-store helpers.
- Exported helpers cover hashing, scope normalization, matching, mismatch diagnostics, and validation.
- They also cover reads, writes, appends, revocation, broad-scope detection, and list-state classification.
- Approval source values are `draft-workflow`, `approval-command`, and `cli-override`.

## Product Truth Links

- docs/truthmark/product/open-game-studio-cli.md

## Engineering Decisions

- Decision (2026-06-13): Keep approval storage independent from runner and task eligibility logic.
- Decision (2026-06-13): Let runtime execution consume approval matching as a simple authorization result.
- Decision (2026-06-13): Include project stage and studio mode in hashes and records when available.
- Decision (2026-06-13): Tie approval intent to both lifecycle stage and policy mode.
- Decision (2026-06-13): Approval grants always store baseline metadata.
- Decision (2026-06-13): Git-backed projects store git HEAD plus diff SHA.
- Decision (2026-06-13): Non-git projects store an explicit unavailable marker.

## Rationale

Approval storage stays separate from runtime execution so records remain deterministic and auditable. Runtime gates only need a matching result.

Hashing normalized role, objective, scope, project stage, and studio mode prevents incidental text or ordering differences from changing authorization intent.

## Non-Goals

- This behavior does not define Codex sandbox selection.
- This behavior does not define runtime mutation flow.

## Maintenance Notes

- Update this doc when `src/approvals.ts` changes.
- Update this doc when `tests/approval-gates.test.ts` changes.
- Related generated-project claims live in the Project Scaffolding truth doc.
- Related validation claims live in the CLI And Validation Contracts truth doc.

## Source References

- ../../routes/areas/repository.md
- ../../../../src/approvals.ts
- ../../../../src/runner.ts
- ../../../../src/tasks.ts
- ../../../../tests/approval-gates.test.ts
- ../../../../tests/runner.test.ts
