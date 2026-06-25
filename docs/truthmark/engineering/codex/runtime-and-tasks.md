---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-25
---

# Runtime And Task Execution

## Purpose

Runtime and task execution connects prepared Codex Game Studio prompts to the Codex CLI.

It also preserves explicit task state and runs bounded verification, review, and fix loops without hidden orchestration.

## Scope

This leaf doc owns `run` preparation and execution, Codex command construction, availability checks, and task-store persistence.

It also owns review/fix lifecycle behavior, studio policy primitives, sandbox policy, and structured verification command execution.

It does not own role prompt content, project scaffolding, or public CLI help wording unless runtime behavior depends on those options.

## Triggers

- A user invokes `run <role> ... --project <path>` to render or execute a role prompt.
- A user creates a file-backed task through `task create`.
- A user runs a file-backed task through `task run`.
- A run includes structured verification, review, or bounded fix-pass options.

## Inputs

- A valid project root with `.codex/studio.json`.
- A valid project root with `.codex/studio/config.json`.
- A generated built-in role prompt or a project-local custom role prompt for the requested role.
- A studio role ID or task ID.
- A non-empty task or objective.
- Optional included artifacts.
- Optional verification command and arguments.
- Optional review flag, fix flag, and max fix-pass count.

## Current Implementation Behavior

Runtime execution prepares bounded Codex prompts before side effects.

It evaluates studio write policy before mutation.

It records visible run and task state for non-inspection paths. It reports verification, review, and fix outcomes without hidden orchestration.

## Execution Model

- `prepareRun` resolves the project and reads studio state.
- `prepareRun` inlines the generated project role prompt plus selected package templates.
- `prepareRun` renders a Codex prompt, computes cache paths, and builds Codex execution commands.
- Custom `custom-*` role runs use the configured custom prompt file.
- Custom runs also use configured expected outputs, review checklist, selected local templates, and declared context files.
- Custom runs pass through the same path-safe selector and studio-policy gates as built-in roles.
- `prepareRun` rejects wrong-engine specialist roles before prompt construction.
- For example, a Godot project may run `godot-specialist` but not `unity-specialist`.
- `--print-prompt` and `--dry-run` are inspection-only paths.
- Inspection paths do not write prompt cache, metadata, task state, or run directories.
- Runtime prompt preparation uses the path-safe context selector.
- The selector handles required role context, task-relevant active-engine references, included artifacts, and explicit broad context.
- The selector rejects absolute paths, traversal, control characters, symlink escapes, secret-like paths, generated output, build output, binary entries, and non-file entries.
- Missing required context is recorded as a context-contract omission.
- Missing context never widens reads.
- Context selection gives required entries budget priority.
- Required entries still must pass path safety, generated-output checks, binary checks, per-entry character limits, total character limits, and file-count limits.
- Included artifact bodies are embedded only when the artifact is selected.
- Rejected or omitted artifacts remain visible in context-contract omissions.
- `--allow-broad-context` adds an explicit bounded list of candidate project files.
- Candidates include the GDD, production timeline, and market overview.
- Broad-context candidates still pass through the selector and must resolve under the project root.
- `run <role>` and `task run` compute one `evaluateStudioRunEligibility` result before prompt-cache writes, Codex spawn, or task mutation.
- Eligibility carries `allowed`, `writePolicy`, `allowFileEdits`, `codexSandbox`, `reason`, optional `requiredApproval`, and provenance metadata.
- Strict studio mutating implementation and fix runs require a matching approval.
- Without approval, strict non-dry runs fail before `.codex/runs/**` writes and task mutation.
- Guided studio mutating runs require a matching approval or `--approved-by-user`.
- The local override uses `override-write` provenance.
- Fast-prototype mutating runs use advisory write provenance.
- Dry-run output includes eligibility, write policy, sandbox, file-edit permission, provenance, and approval diagnostics.
- Dry-run does not write run metadata.
- Non-dry runs write prompt and metadata before executing Codex.
- Built-in implementation, review, and fix prompts include a shared `# Context Contract` section.
- The context contract records project stage, studio mode, phase, write policy, sandbox, file-edit permission, selected context, omissions, and blockers.
- Custom role review and fix prompts also use the shared context contract.
- Custom implementation prompts keep their custom-role session shape.
- Custom implementation prompts still list selected context and active policy fields.
- Review prompts add read-only review instructions.
- Fix prompts preserve selected implementation context and include bounded blocker placeholders.
- Implementation and fix passes use `danger-full-access` by default when file edits are allowed.
- `workspace-write` is used only when the caller passes `--constrained-sandbox`.
- Review passes use a read-only Codex sandbox.
- Built-in fix prompts receive the same role prompt and selected templates as the primary implementation prompt.
- Custom fix prompts receive the configured custom role prompt and selected local templates.
- Review prompts receive the generated QA playtester prompt plus selected QA templates.
- Prompt, session, and run metadata records active write policy, file-edit permission, sandbox, and eligibility metadata.
- `src/studio-policy.ts` defines pure project-stage and studio-mode policy helpers.
- Policy helpers keep lifecycle stage separate from studio mode.
- Plan, review, and ship phases map to read-only behavior.
- Implementation and fix phases classify mutating eligibility.
- Allowed mutating policies map to `danger-full-access` unless constrained sandbox is explicitly requested.
- Task runs mutate task status only for non-dry execution.

## Steps

1. Validate the requested role or task and project state.
2. Select path-safe context entries.
3. Record missing, omitted, and rejected entries for the context contract.
4. Compute shared studio-run eligibility.
5. Block non-dry mutating runs when eligibility is not allowed.
6. Let inspection paths render diagnostics without mutation.
7. Render the Codex prompt with active write policy and sandbox.
8. For non-dry allowed runs, write prompt and metadata cache under `.codex/runs/`.
9. Check Codex availability before execution.
10. Execute the implementation prompt.
11. Run verification when configured.
12. Run review when requested and verification passes or is absent.
13. Run bounded fix passes when requested and blockers remain.
14. Report final status as `done` or `blocked`.
15. Persist final task status for task runs.

## State, Retry, And Failure Behavior

- Task stores live at `.codex/tasks.json`.
- Task stores use schema version 1 and unique `task-###` IDs.
- `task create` requires a valid studio project before writing task state.
- Task statuses are `ready`, `running`, `blocked`, and `done`.
- Verification commands use bounded stdout and stderr capture.
- Verification commands use a default timeout.
- Timed-out verification receives SIGTERM, then SIGKILL after the configured grace period.
- Malformed review JSON leaves the lifecycle blocked unless a later fix pass clears it.
- Non-zero Codex execution leaves the lifecycle blocked unless a later fix pass clears it.
- Failed verification leaves the lifecycle blocked unless a later fix pass clears it.
- Review blockers leave the lifecycle blocked unless a later fix pass clears them.

## Outputs

- Dry-run output lists eligibility, write policy, sandbox, context files, approval diagnostics, and the Codex command.
- Dry-run output does not write cache files.
- Print-prompt output is the deterministic prompt body.
- Non-dry run output reports implementation, verification, review, fix-pass, and final-status summaries.
- Task creation prints the new task ID.

## Product Truth Links

- docs/truthmark/product/open-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Make dry-run and print-prompt non-mutating inspection paths.
- Decision (2026-05-28): Force review prompts through a read-only sandbox.
- Decision (2026-05-28): Require a valid project before task-store writes.
- Decision (2026-05-30): Use generated project role prompts and selected templates as runtime prompt input.
- Decision (2026-05-30): Keep broad context discovery bounded.
- Decision (2026-06-13): Keep the first studio-policy slice as pure mapping helpers.
- Decision (2026-06-13): Default allowed mutating policy results to `danger-full-access`.
- Decision (2026-06-13): Expose `workspace-write` only through the explicit constrained-sandbox option.
- Decision (2026-06-13): Route direct role runs and task runs through shared eligibility before mutation.
- Decision (2026-06-13): Fail closed for unapproved strict-studio mutation.
- Decision (2026-06-13): Use one shared context-contract renderer for implementation, review, and fix prompts.
- Decision (2026-06-13): Make selected context and write policy visible without broad prompt loading.
- Decision (2026-06-14): Fail wrong-engine specialist runs before contradictory prompts or run metadata writes.
- Decision (2026-06-17): Add task-relevant active-engine reference requests to role-run and workflow context contracts.
- Decision (2026-06-17): Select module and plugin depth by role/task relevance instead of broad prompt loading.
- Decision (2026-06-17): Route custom role runs through the same write-policy, sandbox, context, cache, and template contracts as built-in roles.
- Decision (2026-06-17): Do not introduce a separate plugin runtime for custom roles.
- Decision (2026-06-17): Honor review/fix flags for custom role runs with real lifecycle prompts.
- Decision (2026-06-17): Use a read-only QA review prompt and a bounded custom-role fix prompt.

## Rationale

Codex execution is intentionally explicit. Users can inspect prompts without side effects before running implementation.

Non-dry runs use visible cache paths and verification output. Read-only review prevents review from becoming a second implementation pass.

## Non-Goals

- This workflow does not implement hidden parallel execution.
- This workflow does not implement telemetry.
- This workflow does not implement ownership enforcement.
- This workflow does not implement a planner or next queue.
- This workflow does not choose role prompt content.

## Maintenance Notes

- Update this doc when runtime, task, customization, context, Codex runtime, or verification behavior changes.
- Update this doc when `src/studio-policy.ts` policy primitive behavior changes.
- Relevant verification includes studio-policy, runner, task, verification, Codex runtime, and lifecycle-focused tests.

## Source References

- ../../routes/areas/repository.md
- ../../../../src/runner.ts
- ../../../../src/studio-policy.ts
- ../../../../src/context.ts
- ../../../../src/customization.ts
- ../../../../src/context-manifest.ts
- ../../../../src/prompt-context.ts
- ../../../../src/tasks.ts
- ../../../../src/codex-runtime.ts
- ../../../../src/verification.ts
- ../../../../tests/runner.test.ts
- ../../../../tests/studio-policy.test.ts
- ../../../../tests/tasks.test.ts
- ../../../../tests/verification.test.ts
- ../../../../tests/codex-runtime.test.ts
