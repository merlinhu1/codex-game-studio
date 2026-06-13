---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-06-13
source_of_truth:
  - ../../routes/areas/repository.md
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

- A valid project root with `.codex/studio.json` and the generated role prompt for the requested role.
- A studio role ID or task ID.
- A non-empty task/objective.
- Optional included artifacts, verification command/args, review flag, fix flag, and max fix-pass count.

## Execution Model

- `prepareRun` resolves the project, reads studio state, inlines the generated project role prompt plus selected package templates, renders a Codex prompt, computes prompt and metadata cache paths, and builds Codex execution commands.
- `--print-prompt` and `--dry-run` are inspection-only paths and do not write prompt cache, metadata, task state, or run directories.
- `--allow-broad-context` adds an explicit bounded list of existing regular project files such as the GDD, production timeline, market overview, `AGENTS.md`, and `.codex/studio.json`; discovered files must resolve under the project root.
- Non-dry runs write prompt and metadata before executing Codex.
- Implementation and fix passes use a workspace-write Codex sandbox; review passes use a read-only Codex sandbox. Fix prompts receive the same generated role prompt and selected package templates as the primary implementation prompt, and review prompts receive the generated QA playtester prompt plus selected QA templates.
- `src/studio-policy.ts` defines pure, dependency-light project-stage/studio-mode policy primitives. These helpers keep lifecycle stage (`design`, `prototype`, `development`) separate from studio mode (`fast-prototype`, `guided-studio`, `strict-studio`), map plan/review/ship phases to read-only, classify implementation/fix eligibility, and map allowed mutating policies to `danger-full-access` by default unless a constrained sandbox option explicitly requests `workspace-write`. These helpers are not yet wired into runner or task execution.
- Task runs mutate task status only for non-dry execution.

## Steps

1. Validate the requested role/task and project state.
2. Build context-file lists, discover bounded broad context when requested, and render the Codex prompt.
3. For non-dry runs, write the prompt and metadata cache under `.codex/runs/`.
4. Check Codex availability before execution through the CLI path.
5. Execute the implementation prompt.
6. Run verification when configured.
7. Run review when requested and verification passes or is absent.
8. Run bounded fix passes when requested and blockers remain.
9. Report final status as `done` or `blocked`; task runs also persist final task status.

## State, Retry, And Failure Behavior

- Task stores live at `.codex/tasks.json` with schema version 1 and unique `task-###` IDs.
- `task create` requires a valid studio project before writing task state.
- Task statuses are `ready`, `running`, `blocked`, and `done`.
- Verification commands are spawned with bounded stdout/stderr capture, a default timeout, SIGTERM on timeout, and SIGKILL after the configured grace period.
- Malformed review JSON, non-zero Codex execution, failed verification, or review blockers leave the lifecycle blocked unless a later bounded fix pass clears the blocker.

## Outputs

- Dry-run output lists context files and the Codex command without writing cache files.
- Print-prompt output is the deterministic prompt body.
- Non-dry run output reports implementation, verification, review, fix-pass, and final-status summaries.
- Task creation prints the new task ID.

## Product Decisions

- Decision (2026-05-28): Make dry-run and print-prompt non-mutating inspection paths.
- Decision (2026-05-28): Force review prompts through a read-only sandbox while implementation/fix prompts retain workspace-write behavior.
- Decision (2026-05-28): Require a valid project before task-store writes.
- Decision (2026-05-30): Treat generated project role prompts and selected package templates as runtime prompt input for role execution while keeping broad context discovery bounded.
- Decision (2026-06-13): Keep the first studio-policy slice as pure mapping helpers; allowed mutating policy results default to `danger-full-access`, and `workspace-write` is available only through an explicit constrained-sandbox option.

## Rationale

Codex execution is intentionally explicit: users can inspect prompts without side effects, then run bounded implementation/review/fix loops with visible cache paths and verification output. Read-only review protects the review contract from accidentally becoming a second implementation pass.

## Non-Goals

- This workflow does not implement hidden parallel execution, telemetry, ownership enforcement, or a planner/next queue.
- This workflow does not choose role prompt content; it consumes the role and workflow surfaces owned by the Codex roles truth doc.

## Maintenance Notes

- Update this doc with changes to `src/runner.ts`, `src/tasks.ts`, `src/codex-runtime.ts`, or `src/verification.ts`.
- Update this doc with changes to `src/studio-policy.ts` when policy primitive behavior changes.
- Relevant verification includes studio-policy, runner, task, verification, Codex runtime, and lifecycle-focused tests.
