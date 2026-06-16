## Context

Open Game Studio is a TypeScript/NodeNext Commander CLI that already supports project initialization, Codex role runs, task creation/runs, workflow prompt rendering, templates, validation, generated project `AGENTS.md`, `.codex/studio.json`, role prompts, workflow prompts, run metadata, and package validation. The current implementation is Codex-native but shallower than CCGS: role depth is concise, context selection is mostly hardcoded, engine knowledge is shallow, approval/session recovery flows are not first-class, and workflow breadth is narrower.

This refactor must preserve the primary product principles:

- Open Game Studio remains Codex-native and executable through package-friendly TypeScript/Node CLI surfaces.
- Generated instructions remain `AGENTS.md` and `.codex/**`; `CODEX.md` remains forbidden.
- Mutating Codex implementation/fix runs default to `danger-full-access` because practical Codex CLI usage often needs full repo/tool access.
- CCGS is a depth/reference benchmark, not a naming or process template to clone blindly.
- The tool expands how developers can make games; it must not force strict studio ceremony on solo/prototype work.
- Planner/next, telemetry, parallel orchestration, and hard output-ownership enforcement remain future-only unless separately built and tested.

## Goals / Non-Goals

**Goals:**

- Separate project stage (`design|prototype|development`) from studio mode (`fast-prototype|guided-studio|strict-studio`).
- Centralize write eligibility for `run <role>` and `task run` before Codex spawn or any local mutation.
- Add auditable approval records, approval commands, and dry-run diagnostics.
- Replace ad hoc broad context with structured manifests and a shared prompt-context builder.
- Add engine reference packs with registry-driven packaging, materialization, prompt selection, and human-review evidence before richness claims.
- Expand roles/workflows to CCGS-level coverage while keeping active/materialized prompt surfaces bounded.
- Add path-scoped rules and lightweight session recovery state.
- Harden validation, packaging, installed-bin smoke, and docs/Truthmark closeout.

**Non-Goals:**

- No non-Codex runtime integration as first-class execution host.
- No runtime compatibility shims, old-role aliases, `CODEX.md`, `project_orchestrator.md`, or legacy `.gamestudio` compatibility.
- No full parallel orchestration, planner/next, telemetry, changed-file tracking, or hard output-ownership enforcement in this change.
- No claim of CCGS comparability until the parity rubric and verification gates pass.

## Decisions

### Decision 1: Keep project stage and studio mode separate

`--mode` currently means project lifecycle stage. Reusing it for approval/process strictness would collapse two independent concepts. This design keeps `--mode design|prototype|development` for lifecycle and adds `--studio-mode fast-prototype|guided-studio|strict-studio` for policy.

Alternatives considered:

- Replace `--mode` with studio policy: rejected because it loses lifecycle/role activation semantics.
- Rename lifecycle immediately to `--stage`: possible later, but not required for this pass and would increase surface churn.

### Decision 2: Centralize mutating eligibility

`src/studio-policy.ts` should own pure policy mapping and eligibility result types. `src/approvals.ts` should own approval schema, canonical hashing, path-scope normalization, grant/list/revoke helpers, and approval matching. `run <role>` and `task run` must call the same eligibility function after dry-run/preparation data is known and before Codex spawn, metadata write, or task mutation.

The eligibility result should include:

```ts
{
  allowed: boolean;
  writePolicy: WritePolicy;
  allowFileEdits: boolean;
  codexSandbox: "read-only" | "workspace-write" | "danger-full-access";
  reason: string;
  requiredApproval?: ApprovalRequirement;
  metadata: Record<string, unknown>;
}
```

### Decision 3: Default mutating Codex sandbox to danger-full-access

The practical default for allowed implementation/fix runs is `danger-full-access`. `workspace-write` remains an explicit constrained override only for environments where it works reliably. Plan/review/blocked paths stay `read-only`.

Rationale: Codex CLI implementation work commonly needs package managers, generated assets, build/test tools, and repository-local helpers. A constrained sandbox can make nominally approved work fail for tooling reasons unrelated to product policy.

### Decision 4: JSON generated surfaces use sidecar metadata

Generated JSON surfaces must remain valid JSON. Freshness and provenance should live in `.meta.json` sidecars unless a surface already has a proven metadata pattern. Canonical serialization must omit operational fields such as timestamps that would create unstable hashes.

### Decision 5: Add depth through registries, not prompt bloat

The full role taxonomy and workflow catalog should exist as registry data. Project generation should materialize only selected active roles/workflows. Prompts should include selected templates, context entries, engine references, and path rules based on task relevance rather than loading the entire studio.

### Decision 6: Preserve current useful capabilities in the new taxonomy

The new taxonomy must keep or explicitly replace current studio coordination, market analysis, data/analytics, UI/UX, QA, release, and handoff coverage. Built-in canonical IDs are strict, but a `customRoles`/namespaced extension lane is reserved for future local declarative custom prompt roles that pass validation; it is not an executable plugin system or alternate runtime.

### Decision 7: Engine references are validated structurally and reviewed qualitatively

Automated validation should check required files, metadata shape, package inclusion, materialization, and prompt selection. Human review metadata gates any claim that engine references are rich/comparable to CCGS.

### Decision 8: OpenSpec governs the implementation plan

The original `.hermes/plans/2026-05-31_173614-depth-context-approval-engine-refactor.md` should become a compact index to this OpenSpec change. The canonical implementation contract lives in `proposal.md`, `design.md`, `specs/**/spec.md`, and `tasks.md`.

## Risks / Trade-offs

- **Approval gates could become annoying** → Keep strictness mode-controlled, preserve `fast-prototype`, and make guided overrides noisy but easy.
- **Role/workflow expansion could bloat prompts** → Enforce available/active/materialized split, registry-first workflows, context budgets, and selected-only prompt generation.
- **`danger-full-access` increases trust requirements** → Keep policy transparency, dry-run diagnostics, approval/override metadata, and read-only plan/review phases; default to full access only after the run is allowed to mutate.
- **Engine reference docs can rot** → Require review metadata, compact files, source links, and parity report evidence.
- **Clean generated-surface contract can invalidate old fixtures/projects** → Current product assumption permits recreation; if that changes, add a non-runtime diagnose/recreate path rather than compatibility shims.
- **Truth/docs drift** → Add slice closeout requiring README/docs/Truthmark sync/check after behavior changes.

## Product Boundary Check

- This change improves the local Codex game-development workflow by making project depth, approval intent, selected context, and generated surfaces more explicit and reviewable.
- In-scope surfaces are the package CLI, generated `AGENTS.md` and `.codex/**` files, role/workflow registries, approval policy primitives, validation, package assets, and behavior-bearing docs.
- Lightweight prototype use is preserved through the separate `fast-prototype` studio mode; lifecycle stage remains `design|prototype|development` and is not reused for process strictness.
- Codex-native execution remains the default path, and generated instructions stay in `AGENTS.md` plus `.codex/**`; this design does not add `CODEX.md` or legacy compatibility shims.
- Reviewable evidence lives in local project JSON, generated prompts/workflows, approval records, dry-run output, validation output, and tests.
- Writes are limited to explicit CLI project/task/approval/generated-surface operations; inspection paths such as `--dry-run` and `--print-prompt` remain non-mutating. Mutating paths must reject absolute paths, traversal, symlink escapes, secret-like paths, and writes outside the project or approved scope; strict/guided failures occur before Codex spawn, metadata writes, or task-state mutation.
- Context selection is registry and relevance driven; expanded roles, workflows, engine references, and rules must not load wholesale for a single role task.
- The design does not introduce a hosted service, daemon, hidden memory layer, CI gate, parallel orchestrator, telemetry surface, or heavyweight lifecycle platform.
- Boundary evidence comes from focused tests, `npm run typecheck`, `npm run validate`, OpenSpec validation, and Truthmark-backed behavior docs after functional changes.

## Migration Plan

1. Create policy and approval primitives with failing tests first; do not wire them into CLI until pure contracts pass.
2. Gate mutating execution paths through the shared eligibility result.
3. Extract shared prompt-context rendering before adding more context sources.
4. Add context manifest generation/validation.
5. Add engine reference registry/assets, package shipping, and prompt selection.
6. Expand role taxonomy and workflow catalog through registries with bounded materialization.
7. Add path-scoped rules and session state.
8. Harden validation, installed-bin smoke, docs/Truthmark sync, and parity reporting.
9. Recreate generated fixtures/projects under the new clean contract instead of preserving stale generated surfaces.

Rollback strategy: because this is planned as a clean refactor before external production use, rollback is a git revert of the implementation branch plus deletion/recreation of generated test projects. Do not add runtime compatibility shims as rollback machinery.

## Verification Strategy

- Focused task checks use `npm test -- <focused test files>` and `npm run typecheck`.
- Readiness/parity claims require `npm run validate` and `npm test -- --run`.
- Generated project behavior changes build first and exercise `node dist/cli.js`.
- Package behavior is verified via `npm pack --json` and temp installed-bin smoke from a non-repo cwd.
- OpenSpec health is verified with `openspec validate flexible-studio-depth-refactor --strict --json` and `openspec status --change flexible-studio-depth-refactor --json`.
- Behavior-bearing docs/truth closeout uses repository Truthmark workflow after tests.

## Open Questions

None blocking. If Merlin later requires preservation of existing generated projects, add a separate OpenSpec change for a non-runtime diagnose/recreate migration path.
