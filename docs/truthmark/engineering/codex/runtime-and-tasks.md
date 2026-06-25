---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-25
---

# Runtime And Task Execution

## Purpose

Runtime and task execution connect prepared Codex Game Studio prompts to the Codex CLI, preserve explicit task state, and run bounded verification/review/fix loops without hidden orchestration.

## Scope

This bounded leaf truth doc owns `run` preparation and execution, Codex command construction and availability checks, task-store persistence, review/fix lifecycle behavior, studio policy primitives, sandbox policy, and structured verification command execution. It does not own role prompt content, project scaffolding, or public CLI help wording except where runtime behavior depends on those options.

## Triggers

- A user invokes `run <role> ... --project <path>` to render or execute a role prompt.
- A user creates or runs a file-backed task through `task create` or `task run`.
- A run includes structured verification, review, or bounded fix-pass options.

## Inputs

- A valid project root with `.codex/studio.json`, `.codex/studio/config.json`, and either a generated built-in role prompt or a project-local custom role prompt for the requested role.
- A studio role ID or task ID.
- A non-empty task/objective.
- Optional included artifacts, verification command/args, review flag, fix flag, and max fix-pass count.

## Current Implementation Behavior

Runtime execution prepares bounded Codex prompts, evaluates studio write policy before side effects, records visible run/task state for non-inspection paths, and reports verification/review/fix outcomes without hidden orchestration.

## Execution Model

- `prepareRun` resolves the project, reads studio state, inlines the generated project role prompt plus selected package templates, renders a Codex prompt, computes prompt and metadata cache paths, and builds Codex execution commands.
- When the requested role is a project-local `custom-*` role from `.codex/studio/config.json`, `prepareRun` renders the configured custom prompt file, expected outputs, review checklist, selected project-local templates, and declared context files through the same path-safe selector and studio-policy gates used by built-in roles.
- `prepareRun` rejects wrong-engine specialist roles before prompt construction; for example, a Godot project may run `godot-specialist` but not `unity-specialist` or `unreal-specialist`.
- `--print-prompt` and `--dry-run` are inspection-only paths and do not write prompt cache, metadata, task state, or run directories.
- Runtime prompt preparation uses the path-safe context selector for required role context, task-relevant active-engine reference files, included artifacts, and explicitly allowed broad context. The selector rejects absolute paths, traversal, control characters, symlink escapes, secret-like paths, generated/build output, and binary or non-file entries; missing required context is recorded as a context-contract omission instead of widening reads.
- Context selection allocates file and character budgets to required entries before optional entries, but required entries cannot bypass path safety, generated-output, binary, per-entry character, total character, or file-count limits.
- Included artifact file bodies are appended to the rendered prompt only when the artifact entry is selected by the context selector; rejected or omitted artifacts remain visible in context-contract omissions without embedding their contents.
- `--allow-broad-context` adds only an explicit bounded list of candidate project files such as the GDD, production timeline, and market overview; candidates still pass through the selector and must resolve under the project root.
- `run <role>` and `task run` compute one `evaluateStudioRunEligibility` result before any prompt-cache write, Codex spawn, or task-status mutation. The result carries `allowed`, `writePolicy`, `allowFileEdits`, `codexSandbox`, `reason`, optional `requiredApproval`, and provenance metadata.
- Strict studio mutating implementation/fix runs require a matching approval. Without one, non-dry `run <role>` and `task run` fail before `.codex/runs/**` prompt/metadata writes and before task-store mutation.
- Guided studio mutating runs require either a matching approval or `--approved-by-user`; the explicit override uses `override-write` provenance. Fast-prototype mutating runs use advisory write provenance.
- Dry-run output includes the eligibility result, active write policy, sandbox, file-edit permission, approval/override/advisory provenance, and approval diagnostics for guided and strict studio modes. Dry-run does not write run metadata.
- Non-dry runs write prompt and metadata before executing Codex.
- Built-in implementation, review, and fix prompts include a shared `# Context Contract` section that records project stage, studio mode, phase, write policy, sandbox, file-edit permission, selected context entries, and bounded omissions/blockers. Custom role review and fix prompts also use the shared context contract; custom implementation prompts keep their custom-role session shape while listing selected context and the active policy fields. Review prompts add read-only review instructions, and fix prompts preserve the same selected implementation context plus a bounded blocker placeholder for execution-time review/verification blockers.
- Implementation and fix passes use `danger-full-access` by default when eligibility allows file edits; `workspace-write` is used only when the caller passes the explicit constrained-sandbox option. Review passes use a read-only Codex sandbox. Built-in fix prompts receive the same generated role prompt and selected package templates as the primary implementation prompt, custom fix prompts receive the configured custom role prompt and selected project-local templates, and review prompts receive the generated QA playtester prompt plus selected QA templates.
- Prompt/session/run metadata records the active write policy, file-edit permission, sandbox, and eligibility metadata used for the runtime path.
- `src/studio-policy.ts` defines pure, dependency-light project-stage/studio-mode policy primitives. These helpers keep lifecycle stage (`design`, `prototype`, `development`) separate from studio mode (`fast-prototype`, `guided-studio`, `strict-studio`), map plan/review/ship phases to read-only, classify implementation/fix eligibility, and map allowed mutating policies to `danger-full-access` by default unless a constrained sandbox option explicitly requests `workspace-write`.
- Task runs mutate task status only for non-dry execution.

## Steps

1. Validate the requested role/task and project state.
2. Select path-safe context entries, including task-relevant active-engine reference files, record missing/omitted/rejected entries for the context contract, and compute the shared studio-run eligibility result.
3. Block non-dry mutating runs when the eligibility result is not allowed; inspection paths may still render diagnostics.
4. Render the Codex prompt with the active write policy and sandbox.
5. For non-dry allowed runs, write the prompt and metadata cache under `.codex/runs/`.
6. Check Codex availability before execution through the CLI path.
7. Execute the implementation prompt.
8. Run verification when configured.
9. Run review when requested and verification passes or is absent.
10. Run bounded fix passes when requested and blockers remain.
11. Report final status as `done` or `blocked`; task runs also persist final task status.

## State, Retry, And Failure Behavior

- Task stores live at `.codex/tasks.json` with schema version 1 and unique `task-###` IDs.
- `task create` requires a valid studio project before writing task state.
- Task statuses are `ready`, `running`, `blocked`, and `done`.
- Verification commands are spawned with bounded stdout/stderr capture, a default timeout, SIGTERM on timeout, and SIGKILL after the configured grace period.
- Malformed review JSON, non-zero Codex execution, failed verification, or review blockers leave the lifecycle blocked unless a later bounded fix pass clears the blocker.

## Outputs

- Dry-run output lists eligibility, write policy, sandbox, context files, approval diagnostics, and the Codex command without writing cache files.
- Print-prompt output is the deterministic prompt body.
- Non-dry run output reports implementation, verification, review, fix-pass, and final-status summaries.
- Task creation prints the new task ID.

## Product Truth Links

- docs/truthmark/product/open-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Make dry-run and print-prompt non-mutating inspection paths.
- Decision (2026-05-28): Force review prompts through a read-only sandbox.
- Decision (2026-05-28): Require a valid project before task-store writes.
- Decision (2026-05-30): Treat generated project role prompts and selected package templates as runtime prompt input for role execution while keeping broad context discovery bounded.
- Decision (2026-06-13): Keep the first studio-policy slice as pure mapping helpers; allowed mutating policy results default to `danger-full-access`, and `workspace-write` is available only through an explicit constrained-sandbox option.
- Decision (2026-06-13): Route both direct role runs and task runs through the shared eligibility result before mutating side effects, failing closed for unapproved strict-studio mutation.
- Decision (2026-06-13): Use one shared context-contract renderer for implementation, review, and fix prompts so selected context and write policy are visible without loading broad prompt material.
- Decision (2026-06-14): Fail wrong-engine specialist role runs before constructing contradictory prompts or writing run metadata.
- Decision (2026-06-17): Add task-relevant active-engine reference requests to role-run and workflow context contracts so module/plugin depth is selected by role/task relevance instead of broad prompt loading.
- Decision (2026-06-17): Route project-local custom role runs through the same visible write-policy, sandbox, context-selection, prompt-cache, and template-selection contracts as built-in roles instead of introducing a separate plugin runtime.
- Decision (2026-06-17): Honor review/fix flags for project-local custom role runs by rendering a read-only QA review prompt and a bounded custom-role fix prompt rather than accepting the flags without lifecycle prompts.

## Rationale

Codex execution is intentionally explicit: users can inspect prompts without side effects, then run bounded implementation/review/fix loops with visible cache paths and verification output. Read-only review protects the review contract from accidentally becoming a second implementation pass.

## Non-Goals

- This workflow does not implement hidden parallel execution, telemetry, ownership enforcement, or a planner/next queue.
- This workflow does not choose role prompt content; it consumes the role and workflow surfaces owned by the Codex roles truth doc.

## Maintenance Notes

- Update this doc with changes to `src/runner.ts`, `src/tasks.ts`, `src/customization.ts`, `src/context-manifest.ts`, `src/prompt-context.ts`, `src/codex-runtime.ts`, or `src/verification.ts`.
- Update this doc with changes to `src/studio-policy.ts` when policy primitive behavior changes.
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
