---
status: active
doc_type: behavior
truth_kind: engineering-behavior
last_reviewed: 2026-06-13
source_of_truth:
  - ../../routes/areas/repository.md
---

# Approval Stores

## Purpose

Approval stores preserve auditable authorization records used by studio write-gating workflows.

## Scope

This bounded leaf truth doc owns the approval store schema, canonical objective hashing, approval scope normalization, approval matching, expiry and revocation semantics, and approval-store read/write/mutation helpers. It does not own approval CLI command syntax, runner/task mutating eligibility, project initialization ordering, or project validation diagnostics.

This doc was created from the editable engineering-behavior template at docs/truthmark/templates/engineering-behavior.md.

## Current Implementation Behavior

- Approval stores are JSON objects with `schemaVersion: 1`, `product: "codex-game-studio"`, and a `records` array.
- Empty stores contain no approval records and are written deterministically.
- Approval stages are `question`, `options`, `decision`, `draft`, `approved`, `implemented`, `reviewed`, and `blocked`.
- Approval records include an ID, stage, role, canonical objective SHA-256, optional normalized objective text, optional project stage and studio mode, approved glob scope, optional approved file scope, source, approver, approval timestamp, optional expiry/revocation timestamps, and baseline metadata.
- Approval timestamps must use canonical UTC ISO strings in `YYYY-MM-DDTHH:mm:ss.sssZ` form.
- Canonical objective hashes include normalized role ID, normalized objective text, normalized approved globs, normalized approved files, project stage, and studio mode.
- Approval matching only authorizes records in the `approved` stage whose normalized role, canonical objective hash, approved globs, approved files, project stage, and studio mode match and that are neither expired nor revoked.
- Runtime eligibility uses approval matching for guided and strict studio mutating `run <role>` and `task run` paths. Strict mode requires a matching approval; guided mode accepts a matching approval or an explicit local override from the runtime command.
- Revoked and expired approvals remain valid record shapes but do not match authorization checks.
- Approval mismatch diagnostics report the expected objective hash and per-record non-authorization reasons such as role mismatch, normalized objective mismatch, scope mismatch, approved files mismatch, project stage mismatch, studio mode mismatch, objective hash mismatch, revocation, expiry, or non-approved stage.
- Approval mutation helpers append deterministic `approval-###` records with source `approval-command`, normalized scope fields, approver metadata, baseline metadata, and canonical timestamps; revocation sets `revokedAt` on first revoke while preserving the record and original revocation timestamp on repeated revoke.
- Approval grant baseline metadata includes git HEAD and a SHA-256 of the current git diff when git metadata is available from the project root. When git metadata is unavailable, grants still store a stable explicit unavailable marker and deterministic fallback diff SHA.

## Core Rules

- Scope normalization rejects absolute paths, parent traversal, control characters, secret-like path segments, and symlink escapes when a project root is supplied.
- Scope entries normalize Windows separators to POSIX-style separators, deduplicate entries, and sort entries for deterministic hashing and storage.
- Canonical serialization sorts object keys and omits `undefined` values before hashing.
- Broad approval scope detection treats `.`, `*`, `**`, and `**/*` as repository-wide scopes.
- Approval validation rejects malformed stores and reports field-specific errors for invalid records, duplicate approval IDs, and project-root-aware scope validation when a project root is supplied.

## Flows And States

- Store creation flow: create an empty versioned store, ensure the `.codex` parent directory exists, serialize it deterministically, and write it to `.codex/approvals.json`.
- Store read flow: parse `.codex/approvals.json`, validate it with the project root, and return the typed store only when validation passes.
- Match flow: compute the canonical objective hash from the requested role/objective/scope/stage/mode, scan approval records, require stored scope/files/stage/mode metadata to match when present, ignore revoked/expired/non-approved records, and return mismatch reasons when no active record matches.
- List-state flow: classify each record as authorizing only when it is approved, unexpired, and not revoked; revoked and expired records remain visible as non-authorizing history.

## Contracts

- `src/approvals.ts` exports helpers for canonical hashing, scope normalization, approval matching, mismatch diagnostics, store validation, store read/write paths, deterministic approval append, revocation, broad-scope detection, and list-state classification.
- The approval source values are `draft-workflow`, `approval-command`, and `cli-override`.

## Product Truth Links

- None. This engineering behavior realizes internal repository write-gating and approval persistence; no separate product-lane promise is currently authored.

## Engineering Decisions

- Decision (2026-06-13): Keep approval schema, matching helpers, and store mutation helpers independent from runner/task write eligibility logic, while allowing runtime execution to consume the matching result.
- Decision (2026-06-13): Include project stage and studio mode in both the canonical objective hash and approval records when available so approval intent is tied to both lifecycle and policy axes.
- Decision (2026-06-13): Approval command grants always store baseline metadata; git-backed projects use git HEAD plus diff SHA, while non-git projects use an explicit deterministic unavailable marker.

## Rationale

Separating approval storage from runtime execution keeps approval records auditable and deterministic while allowing the runtime gate to consume a simple matching result. Hashing normalized role, objective, scope, project stage, and studio mode makes approval matching resistant to incidental text or ordering differences.

## Non-Goals

- This behavior does not define Codex sandbox selection or runtime mutation behavior.

## Maintenance Notes

- Update this doc with changes to `src/approvals.ts` or `tests/approval-gates.test.ts`.
- Related generated project and validation claims live in the Project Scaffolding and CLI And Validation Contracts truth docs.

## Source References

- ../../routes/areas/repository.md
