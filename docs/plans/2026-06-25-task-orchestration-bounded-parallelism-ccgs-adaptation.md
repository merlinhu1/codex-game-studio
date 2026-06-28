# Task Orchestration, Bounded Parallelism, and Curated CCGS Adaptation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add explicit local task orchestration with bounded parallel execution, and adapt the useful Claude Code Game Studios (CCGS) role/skill/workflow surface into Codex Game Studio without importing Claude-specific machinery or unbounded orchestration.

**Architecture:** Keep Codex Game Studio local-first and Codex-native. Extend the existing `.codex/tasks.json`, `.codex/runs/**`, role packages, workflow registry, template registry, approvals, and validation systems. Orchestration is a foreground CLI command that plans, locks, executes, verifies, reviews, and records bounded task runs; it is not a daemon, hosted scheduler, hidden planner, or generic workflow DAG engine.

**Tech Stack:** TypeScript ESM on Node 24, Commander CLI, Vitest, existing Codex runtime, existing project validation, Truthmark-backed docs.

---

## 1. Product Boundary Decisions

### 1.1 In scope

- `codex-game-studio task orchestrate --project <path>` as the primary orchestration entrypoint.
- Bounded task DAG execution using explicit task dependencies.
- Bounded parallelism with an explicit `--max-concurrency` flag and a hard product cap.
- Local reviewable state in `.codex/tasks.json`, `.codex/locks/**`, and `.codex/runs/<run-id>/**`.
- Existing Codex role execution, approval gates, sandbox/write policy, verification, review, and fix-pass behavior reused per task.
- Curated CCGS adaptation as Codex-native roles, workflow recipes, templates, and optional project-local `custom-*` overlays.

### 1.2 Out of scope

- Hosted orchestration, accounts, remote queues, remote artifact storage, billing, or server-side scheduling.
- Background autonomous loops or daemon workers.
- Unbounded parallelism.
- Hidden planner/`next` command behavior.
- Generated `CODEX.md`, `.gamestudio/**`, `project_orchestrator.md`, or Claude hook/skill runtime compatibility.
- General workflow DAGs unrelated to game-studio tasks.

### 1.3 Closed decisions

1. **Default concurrency is serial.** `task orchestrate` defaults to `--max-concurrency 1`.
2. **Parallelism is opt-in and capped.** The first implementation allows `--max-concurrency 1..3`; values above `3` fail with a clear error.
3. **Parallel mutating tasks require declared write sets.** A task without declared `writeFiles` uses a conservative project-wide write lock when file edits are allowed.
4. **No separate scheduler process.** Orchestration runs in the current foreground CLI process and exits when the bounded run completes.
5. **No hidden task generation.** CCGS workflow adaptation may create task graphs only through explicit commands that show the planned tasks before writing or executing them.
6. **CCGS adaptation is curated, not mirrored.** Use CCGS as source material, but translate into existing Codex-native IDs, bounded context selection, and Codex Game Studio's role/workflow/template contracts.

### 1.4 Review follow-up constraints

- Orchestration planning/preflight must be side-effect-free. Do not call any API path that writes `.codex/runs/**`, `.codex/tasks.json`, or `.codex/locks/**` before approvals, dependency validation, and lock planning pass.
- The orchestrator must serialize all `.codex/tasks.json` writes during parallel execution.
- In the first implementation, `writeFiles` are normalized literal project-relative file paths only. Reject globs, directories, `.git`, escaping paths, and control characters.
- Approval matching for mutating task runs is based on `writeFiles`; `files` are read/context inputs only.

---

## 2. Current Repository Baseline

Relevant existing files:

- `src/tasks.ts` owns `.codex/tasks.json`, task creation, task status updates, and `task run` integration.
- `src/runner.ts` owns role-run preparation, prompt cache metadata, Codex execution, verification, review, and fix passes.
- `src/codex-runtime.ts` owns Codex CLI command construction and availability checks.
- `src/cli.ts` exposes `run`, `task create`, `task run`, workflow shortcuts, approvals, templates, and validation.
- `src/roles.ts` contains built-in Codex role packages.
- `src/workflows.ts` contains prompt-only workflow registry entries.
- `src/templates.ts` contains package template registry and selection.
- `src/customization.ts` validates extend-only project-local `custom-*` roles, workflows, and templates.
- `src/validation.ts` validates repo/package/project behavior and future-only surfaces.
- `tests/tasks.test.ts`, `tests/runner.test.ts`, `tests/codex-runtime.test.ts`, `tests/functionality-gap-pass.test.ts`, `tests/customization.test.ts`, and `tests/validation.test.ts` are the main test anchors.

Current constraints to preserve:

- Every relative TypeScript import must use emitted `.js` specifiers.
- `run <role>` remains the primary single-role Codex execution path.
- `--dry-run` and `--print-prompt` remain inspection-only.
- Workflow shortcuts remain render-only unless explicitly converted into task-graph creation commands.
- Unknown legacy CCGS underscore role IDs remain invalid public role IDs.

---

## 3. Task Data Model

### 3.1 Upgrade `.codex/tasks.json` to schema version 2

Modify `src/tasks.ts` types and parser so schema v1 stores still read and normalize into schema v2 in memory.

```ts
export type StudioTaskStatus = "ready" | "running" | "blocked" | "done" | "cancelled" | "skipped";

export type StudioTaskDependency = {
  taskId: string;
  requiredStatus: "done";
};

export type StudioTaskRunPolicy = {
  maxFixPasses?: number;
  review?: boolean;
  constrainedSandbox?: boolean;
};

export type StudioTask = {
  id: string;
  title: string;
  role: StudioRoleId;
  status: StudioTaskStatus;
  files: string[];
  writeFiles: string[];
  dependencies: StudioTaskDependency[];
  workflowId?: string;
  groupId?: string;
  priority: number;
  verification?: VerificationCommand;
  runPolicy?: StudioTaskRunPolicy;
  notes: string[];
  createdAt: string;
  updatedAt: string;
  lastRunId?: string;
};

export type TaskStore = {
  schemaVersion: 2;
  tasks: StudioTask[];
};
```

### 3.2 Migration behavior

- Existing schema v1 task fields map as:
  - `files` remains selected read/context files.
  - `writeFiles` becomes `[]`.
  - `dependencies` becomes `[]`.
  - `priority` becomes `0`.
  - `createdAt` and `updatedAt` become a deterministic migration timestamp only when the store is rewritten.
- `readTaskStore()` may return normalized v2 data without rewriting.
- `writeTaskStore()` always writes schema v2.
- Missing `writeFiles` means parallel mutating execution falls back to project-wide lock, not unsafe optimism.

### 3.3 Task creation CLI additions

Extend `task create`:

```bash
codex-game-studio task create --project projects/demo \
  --role gameplay-programmer \
  --file documentation/design/gdd.md \
  --write-file source/project-demo/player.gd \
  --depends-on task-001 \
  --workflow vertical-slice \
  --priority 10 \
  --verify-command npm --verify-arg run --verify-arg validate --verify-arg -- --verify-arg --project --verify-arg projects/demo \
  "Implement player jump"
```

Rules:

- `--file` is context/read input.
- `--write-file` is declared mutation scope and lock input.
- `--depends-on` may repeat.
- `--workflow` records source workflow ID but does not imply hidden execution.
- Unknown dependencies fail before writing.
- Cycles are checked when orchestrating, not when creating one task, so users can assemble a graph incrementally.

---

## 4. Orchestration State and Locking

### 4.1 Run directory

Each orchestration invocation creates:

```text
.codex/runs/<orchestration-run-id>/
  orchestration.json
  events.jsonl
  tasks/<task-id>/
    prompt.md
    metadata.json
    output.txt
```

`orchestration.json` records:

```ts
type OrchestrationRunMetadata = {
  schemaVersion: 1;
  product: "codex-game-studio";
  runId: string;
  startedAt: string;
  finishedAt?: string;
  projectRoot: string;
  maxConcurrency: number;
  requestedTaskIds: string[];
  selectedTaskIds: string[];
  dryRun: boolean;
  review: boolean;
  fix: boolean;
  status: "planned" | "running" | "done" | "blocked" | "cancelled";
  summary: Array<{ taskId: string; status: StudioTaskStatus; runPath?: string; reason?: string }>;
};
```

`events.jsonl` appends deterministic event records:

- `orchestration.started`
- `task.eligible`
- `task.locked`
- `task.started`
- `task.finished`
- `task.blocked`
- `task.skipped`
- `task.unlocked`
- `orchestration.finished`

### 4.2 Lock files

Use a reviewable lock directory:

```text
.codex/locks/
  <lock-key>.json
```

Lock file shape:

```ts
type TaskLock = {
  schemaVersion: 1;
  lockKey: string;
  taskId: string;
  orchestrationRunId: string;
  role: string;
  writeFile: string;
  acquiredAt: string;
  expiresAt: string;
  releasedAt?: string;
};
```

Implementation details:

- Derive `lockKey` from canonical project-relative write path or conservative key `__project_write__`.
- Acquire with exclusive create (`fs.openSync(path, "wx")`) so concurrent CLI processes cannot silently share a write lock.
- Release by rewriting the lock with `releasedAt` and then removing it.
- If a stale lock exists past `expiresAt`, fail closed first; add a later explicit `task lock cleanup` command only after the basic orchestrator is stable.
- Read-only tasks do not acquire write locks.
- Mutating tasks with no `writeFiles` acquire `__project_write__`, making them serial with all other mutating tasks.

### 4.3 Conflict rules

Two tasks may run together only when all are true:

- Both have all dependencies satisfied.
- Neither is `running`, `done`, `cancelled`, or `skipped`.
- Their required approval/write-policy checks pass.
- Their lock sets do not conflict.
- The current running count is below `maxConcurrency`.
- They do not require the conservative project-wide write lock at the same time as any other mutating task.

---

## 5. Orchestration Engine

Create `src/orchestrator.ts`.

Core API:

```ts
export type OrchestrateOptions = {
  project: string;
  taskIds?: string[];
  workflowId?: string;
  maxConcurrency?: number;
  dryRun?: boolean;
  review?: boolean;
  fix?: boolean;
  maxFixPasses?: number;
  approvedByUser?: boolean;
  constrainedSandbox?: boolean;
  approvalScope?: string[];
  codexBin?: string;
};

export type OrchestrationResult = {
  runId: string;
  status: "planned" | "done" | "blocked";
  selectedTaskIds: string[];
  startedTaskIds: string[];
  blockedTaskIds: string[];
  skippedTaskIds: string[];
  output: string;
};

export async function orchestrateTasks(options: OrchestrateOptions): Promise<OrchestrationResult>;
```

Algorithm:

1. Resolve project root.
2. Read and normalize task store.
3. Select tasks:
   - explicit `taskIds` if provided;
   - else tasks matching `workflowId` if provided;
   - else all `ready` tasks.
4. Validate graph:
   - no unknown dependencies;
   - no cycles among selected tasks and their required dependencies;
   - no selected task depends on a `blocked`, `cancelled`, or `skipped` task unless user explicitly selected only downstream dry-run inspection;
   - no concurrency above hard cap.
5. Prepare every selected task using `prepareRun()` before starting any non-dry run.
6. In strict/guided modes, fail closed before starting any task if required approvals are missing.
7. For dry-run, print planned waves, lock sets, selected context, Codex command previews, and approval diagnostics; write no task/runs/locks state.
8. For execution:
   - mark orchestrator run as `running`;
   - compute ready wave;
   - acquire locks for up to `maxConcurrency` tasks;
   - start Codex lifecycle for each task;
   - stream or buffer task output into per-task run output;
   - update task status to `done` or `blocked`;
   - release locks;
   - recompute ready wave until no runnable tasks remain.
9. Tasks whose dependencies cannot be satisfied because another task blocked become `skipped` with a note naming the blocker.
10. Final orchestrator status is `done` only if every selected task is `done`; otherwise `blocked`.

---

## 6. Codex Runtime Changes for Parallelism

Current `executeRunLifecycle()` is `async` but calls synchronous Codex spawning. Parallel orchestration needs real asynchronous execution.

Modify `src/codex-runtime.ts` to add:

```ts
export async function executeCodexCommand(
  command: { command: string; args: string[] },
  input: string,
  options: { cwd: string; timeoutMs?: number }
): Promise<CodexExecutionResult>;
```

Modify `src/runner.ts`:

- Keep sync helpers only for tests or deprecate them internally.
- Update implementation, review, and fix pass execution to use the async function.
- Preserve existing output formatting and final status semantics.
- Add timeout support later only if a concrete test requires it; do not add global scheduler timeouts in the first pass.

Testing requirement:

- Use fake Codex binaries that sleep and write deterministic output to prove `--max-concurrency 2` completes faster than serial without relying on real Codex.
- Do not call hosted LLMs in tests.

---

## 7. CLI Design

### 7.1 New command

```bash
codex-game-studio task orchestrate --project <path> [task-id...]
```

Options:

```text
--workflow <workflow-id>            select ready tasks from one workflow/group
--max-concurrency <count>           default 1, allowed 1..3
--dry-run                           show plan, locks, approvals, and commands; no mutation
--review                            run per-task review pass
--fix                               run bounded per-task fix passes
--max-fix-passes <count>            reuse existing task run behavior
--approval-scope <glob>             repeatable diagnostic/approval scope
--approved-by-user                  guided-studio local override
--constrained-sandbox               use workspace-write instead of full-access sandbox
```

Examples:

```bash
codex-game-studio task orchestrate --project projects/demo --dry-run
codex-game-studio task orchestrate --project projects/demo --max-concurrency 2 --review --fix
codex-game-studio task orchestrate --project projects/demo --workflow vertical-slice --max-concurrency 2
codex-game-studio task orchestrate --project projects/demo task-001 task-002 task-003 --dry-run
```

### 7.2 Help surface guardrails

- Help may mention `orchestrate` and `--max-concurrency`.
- Help must not expose `next`, `telemetry`, hosted orchestration, daemon mode, or unbounded parallel options.
- Existing future-surface guard tests should be updated from "no parallel at all" to "no unbounded/hosted/background parallelism".

---

## 8. Workflow-to-Task Recipes

Prompt-only workflows should remain prompt-only. Add explicit recipe commands for workflows that should produce task graphs.

Create `src/workflow-recipes.ts`.

```ts
export type WorkflowTaskRecipe = {
  workflowId: WorkflowId | string;
  title: string;
  tasks: Array<{
    title: string;
    role: StudioRoleId;
    files: string[];
    writeFiles: string[];
    dependencies: string[]; // local recipe keys, not final task IDs
    verification?: VerificationCommand;
  }>;
};
```

Add CLI:

```bash
codex-game-studio workflow create-tasks <workflow-id> --project <path> --dry-run
codex-game-studio workflow create-tasks <workflow-id> --project <path>
```

Rules:

- `--dry-run` prints proposed tasks and dependency graph, writes nothing.
- Non-dry writes tasks to `.codex/tasks.json` with `workflowId` and `groupId`.
- Recipe-local dependency keys are resolved to real task IDs after creation.
- The command does not run Codex. Users run `task orchestrate` explicitly.

Initial recipe set:

1. `vertical-slice`
   - producer plans slice
   - game-designer writes acceptance/spec detail
   - gameplay-programmer implements core loop
   - technical-artist or sound-designer handles asset/audio hook if declared
   - qa-playtester reviews and verifies
2. `bugfix`
   - qa-playtester reproduces/records expected behavior
   - gameplay-programmer fixes
   - qa-playtester verifies
3. `ui-ux-review`
   - ui-ux-designer reviews flow
   - ui-programmer implements bounded UI fix if needed
   - accessibility-specialist reviews accessibility gaps
4. `release-checklist`
   - qa-playtester validates evidence
   - performance-analyst checks performance risks
   - security-engineer checks release/security risks
   - release-manager synthesizes ship/no-ship

Do not create all CCGS team workflows in the first pass. Add recipes only when their lock/dependency/write-set behavior is obvious and testable.

---

## 9. Curated CCGS Adaptation Design

### 9.1 Source inventory

Reference source inspected for this design:

- `Donchitos/Claude-Code-Game-Studios`
- `.claude/agents`: 49 Claude agents
- `.claude/skills`: 73 Claude skills
- `.claude/hooks`: Claude hook runtime files
- `.claude/rules`: Claude-specific rule files

Important translation principle: CCGS is a rich reference library, not an implementation contract. Codex Game Studio adapts outcomes into local Codex-native primitives.

### 9.2 Role adaptation policy

Role decisions use four categories:

| Decision | Meaning |
|---|---|
| `built-in-existing` | Already represented by an Codex Game Studio role package. Improve prompt depth only if tests show a gap. |
| `built-in-add` | Add a new canonical hyphenated Codex Game Studio role. |
| `specialty-context` | Do not add a role; adapt as engine/module/plugin reference context selected by task keywords. |
| `custom-pack-example` | Keep as project-local `custom-*` example or docs, not built-in product surface. |

### 9.3 CCGS role mapping

| CCGS role | Codex Game Studio target | Decision |
|---|---|---|
| `producer` | `producer` | built-in-existing |
| `creative-director` | `creative-director` | built-in-existing |
| `game-designer` | `game-designer` / `senior-game-designer` | built-in-existing |
| `systems-designer` | `systems-designer` | built-in-existing |
| `economy-designer` | `economy-designer` | built-in-existing |
| `level-designer` | `level-designer` | built-in-existing |
| `world-builder` | `world-builder` | built-in-existing |
| `writer` | `writer` | built-in-existing |
| `gameplay-programmer` | `gameplay-programmer` | built-in-existing |
| `ai-programmer` | `ai-programmer` | built-in-existing |
| `network-programmer` | `network-programmer` | built-in-existing |
| `ui-programmer` | `ui-programmer` | built-in-existing |
| `engine-programmer` | `engine-programmer` | built-in-existing |
| `tools-programmer` | `tools-programmer` | built-in-existing |
| `technical-director` | `technical-director` | built-in-existing |
| `devops-engineer` | `devops-engineer` | built-in-existing |
| `security-engineer` | `security-engineer` | built-in-existing |
| `performance-analyst` | `performance-analyst` | built-in-existing |
| `technical-artist` | `technical-artist` | built-in-existing |
| `audio-director` | `audio-director` | built-in-existing |
| `sound-designer` | `sound-designer` | built-in-existing |
| `accessibility-specialist` | `accessibility-specialist` | built-in-existing |
| `localization-lead` | `localization-lead` | built-in-existing |
| `live-ops-designer` | `live-ops-designer` | built-in-existing |
| `community-manager` | `community-manager` | built-in-existing |
| `release-manager` | `release-manager` | built-in-existing |
| `godot-specialist` | active-engine `godot-specialist` | built-in-existing |
| `unity-specialist` | active-engine `unity-specialist` | built-in-existing |
| `unreal-specialist` | active-engine `unreal-specialist` | built-in-existing |
| `analytics-engineer` | `data-scientist` plus analytics templates | built-in-existing, prompt-depth improvement |
| `art-director` | `senior-game-artist` plus art-direction workflow | built-in-existing, maybe rename not needed |
| `narrative-director` | `narrative-designer` plus `world-builder` | built-in-existing, prompt-depth improvement |
| `ux-designer` | `ui-ux-designer` | built-in-existing |
| `qa-lead` | add `qa-lead` only if QA planning/release strategy needs a separate owner | built-in-add candidate |
| `qa-tester` | `qa-playtester`; maybe add `qa-tester` later for test-case execution | defer unless tests show split needed |
| `lead-programmer` | add `lead-programmer` if technical-director is too broad for code review/refactor ownership | built-in-add candidate |
| `prototyper` | keep as `prototype` workflow/recipe, not role | specialty workflow |
| Godot sub-specialists | engine references selected by task keywords | specialty-context |
| Unity sub-specialists | engine references selected by task keywords | specialty-context |
| Unreal sub-specialists | engine references selected by task keywords | specialty-context |

First role additions, if any, should be only:

1. `lead-programmer` — code architecture, code review, refactor strategy, programming work assignment.
2. `qa-lead` — QA strategy, bug triage, test plan ownership, release quality gates.

Do not add every engine sub-specialist as a first-class role. Use active-engine references and templates instead.

### 9.4 CCGS skill adaptation policy

Do not generate `.claude/skills` or implement a Claude skill runtime. Convert CCGS skills into one of these Codex Game Studio surfaces:

| CCGS skill kind | Codex Game Studio surface |
|---|---|
| Planning or review skill | built-in workflow prompt or workflow task recipe |
| Structured output document | package template |
| Team coordination skill | explicit workflow task recipe with dependencies |
| Maintenance skill for Claude skills/hooks | out of scope or project-local example only |
| Hook/rule-driven behavior | explicit CLI option, validation check, or docs; never hidden hook behavior |

### 9.5 Initial CCGS skill decisions

Already covered or mostly covered:

- `architecture-decision` → existing workflow/template.
- `architecture-review` → existing workflow/template.
- `brainstorm` → existing workflow.
- `bug-triage` / `bug-report` → `bugfix` workflow plus future bug-report template if needed.
- `create-epics` → existing workflow.
- `create-stories` → existing workflow.
- `hotfix` → existing workflow.
- `onboard` / `start` → existing workflow aliases.
- `perf-profile` → existing workflow.
- `playtest-report` → `playtest` workflow/template.
- `prototype` → existing workflow, future task recipe.
- `qa-plan` → existing workflow/template.
- `regression-suite` → existing workflow.
- `release-checklist` / `launch-checklist` → existing release workflow; add alias if needed.
- `security-audit` → existing workflow.
- `sprint-plan` → existing workflow.
- `sprint-status` → existing workflow.
- `story-readiness` → existing workflow.
- `story-done` → existing workflow.
- `ux-review` → `ui-ux-review` workflow.
- `vertical-slice` → existing workflow, future task recipe.

High-value additions:

- `gate-check` → new workflow for stage readiness verdict.
- `project-stage-detect` → new read-only workflow for repo state audit and recommended next action.
- `scope-check` → new workflow/template for scope risk and feature cut decisions.
- `estimate` → new producer workflow/template for rough schedule/complexity estimates.
- `tech-debt` → new lead-programmer or technical-director workflow/template.
- `smoke-check` → new QA/release workflow with minimal validation checklist.
- `test-evidence-review` → new QA workflow for evidence completeness.
- `asset-audit` → new technical-artist/senior-game-artist workflow/template.
- `asset-spec` → new art-direction template/workflow.
- `balance-check` → new systems/economy design workflow.
- `map-systems` → new systems-design workflow/template.
- `reverse-document` → new documentation workflow that derives missing docs from implementation.
- `propagate-design-change` → new architecture/design impact workflow using traceability docs.
- `create-control-manifest` → new technical-director workflow/template after ADRs are accepted.
- `ux-design` → new UI/UX design workflow distinct from review.

Team skills become recipes, not prompt-only aliases:

- `team-combat` → game-designer → gameplay-programmer/ai-programmer/sound-designer → qa-playtester.
- `team-ui` → ui-ux-designer → ui-programmer → accessibility-specialist → qa-playtester.
- `team-audio` → audio-director → sound-designer/technical-artist → gameplay-programmer integration → qa-playtester.
- `team-qa` → qa-lead/qa-playtester split, if `qa-lead` is added.
- `team-release` → release-manager with QA/perf/security dependencies.
- `team-polish` → producer/creative-director triage plus focused UI/audio/perf/QA tasks.
- `team-live-ops` → live-ops-designer/community-manager/data-scientist/release-manager sequence.
- `team-narrative` → narrative-designer/world-builder/writer/localization-lead sequence.
- `team-level` → level-designer/gameplay-programmer/technical-artist/qa-playtester sequence.

Defer or keep out of product:

- `adopt`, `help`, `skill-improve`, `skill-test`, `test-helpers` as Claude-skill maintenance concepts.
- Claude hook/rule-only mechanics unless translated into explicit validation or CLI flags.
- Any CCGS skill that depends on persistent Claude memory or hidden hooks.

---

## 10. Implementation Tasks

### Task 1: Add task schema v2 tests

**Objective:** Lock the task-store migration contract before changing implementation.

**Files:**

- Modify: `tests/tasks.test.ts`
- Later modify: `src/tasks.ts`

**Steps:**

1. Add a test that writes a schema v1 `.codex/tasks.json` and expects `readTaskStore()` to return schema v2 with empty dependencies/writeFiles and valid timestamps.
2. Add a test that `writeTaskStore()` writes `schemaVersion: 2`.
3. Run:
   ```bash
   npx vitest run tests/tasks.test.ts -t "task store"
   ```
4. Expected before implementation: failure because schema v2 is not implemented.

### Task 2: Implement task schema v2 normalization

**Objective:** Support old task stores while writing the new shape.

**Files:**

- Modify: `src/tasks.ts`
- Modify: `tests/tasks.test.ts`

**Steps:**

1. Update task types.
2. Add normalization helpers.
3. Preserve v1 parsing behavior.
4. Ensure status validation accepts `cancelled` and `skipped`.
5. Run:
   ```bash
   npx vitest run tests/tasks.test.ts
   ```
6. Expected: pass.

### Task 3: Extend task creation CLI

**Objective:** Let users declare dependencies, context files, write files, workflow/group metadata, and priority.

**Files:**

- Modify: `src/tasks.ts`
- Modify: `src/cli.ts`
- Modify: `tests/tasks.test.ts`
- Modify: `tests/cli-prompt-surface.test.ts` if CLI help assertions need updates.

**Steps:**

1. Add `createTask()` input fields.
2. Add `--file`, `--write-file`, `--depends-on`, `--workflow`, and `--priority` options.
3. Validate project-safe relative paths using the same path rules used by customizations/context selection.
4. Test duplicate dependencies and unknown dependency IDs.
5. Run:
   ```bash
   npx vitest run tests/tasks.test.ts tests/cli-prompt-surface.test.ts
   ```

### Task 4: Add asynchronous Codex execution

**Objective:** Make parallel execution possible without blocking the event loop on `spawnSync`.

**Files:**

- Modify: `src/codex-runtime.ts`
- Modify: `src/runner.ts`
- Modify: `tests/codex-runtime.test.ts`
- Modify: `tests/runner.test.ts`

**Steps:**

1. Add `executeCodexCommand()` using `node:child_process` `spawn`.
2. Preserve `CodexExecutionResult` shape.
3. Update implementation/review/fix passes to await async execution.
4. Keep current output formatting unchanged.
5. Run:
   ```bash
   npx vitest run tests/codex-runtime.test.ts tests/runner.test.ts
   ```

### Task 5: Add lock acquisition tests

**Objective:** Define lock behavior before implementation.

**Files:**

- Create: `tests/orchestrator-locks.test.ts`
- Create later: `src/orchestrator-locks.ts`

**Steps:**

1. Test two tasks with disjoint `writeFiles` can both acquire locks.
2. Test overlapping write file lock acquisition fails for the second task.
3. Test missing `writeFiles` uses `__project_write__`.
4. Test released locks are removed or marked released according to final implementation choice.
5. Run:
   ```bash
   npx vitest run tests/orchestrator-locks.test.ts
   ```
6. Expected before implementation: failure because module does not exist.

### Task 6: Implement lock store

**Objective:** Provide atomic file-backed locks for bounded parallel execution.

**Files:**

- Create: `src/orchestrator-locks.ts`
- Modify: `tests/orchestrator-locks.test.ts`

**Steps:**

1. Implement canonical lock key generation.
2. Implement exclusive lock creation with `fs.openSync(path, "wx")`.
3. Implement release cleanup.
4. Implement stale lock diagnostics but do not auto-clean stale locks yet.
5. Run:
   ```bash
   npx vitest run tests/orchestrator-locks.test.ts
   ```

### Task 7: Add orchestration graph tests

**Objective:** Define dependency selection, cycle detection, and skipped-task behavior.

**Files:**

- Create: `tests/orchestrator.test.ts`
- Create later: `src/orchestrator.ts`

**Steps:**

1. Test ready tasks with dependencies are ordered in waves.
2. Test cycle detection fails before mutation.
3. Test a blocked dependency causes downstream tasks to become `skipped`.
4. Test `--max-concurrency 4` fails because first cap is 3.
5. Run:
   ```bash
   npx vitest run tests/orchestrator.test.ts
   ```

### Task 8: Implement dry-run orchestration planning

**Objective:** Add `orchestrateTasks()` dry-run mode without mutation.

**Files:**

- Create: `src/orchestrator.ts`
- Modify: `src/tasks.ts` if helper exports are needed.
- Modify: `tests/orchestrator.test.ts`

**Steps:**

1. Implement task selection.
2. Implement dependency graph validation.
3. Implement wave planning.
4. Reuse `prepareRun()` to show eligibility and commands.
5. Assert dry-run writes no `.codex/runs/**`, locks, or task status changes.
6. Run:
   ```bash
   npx vitest run tests/orchestrator.test.ts
   ```

### Task 9: Implement serial orchestration execution

**Objective:** Make `maxConcurrency: 1` execute selected tasks safely.

**Files:**

- Modify: `src/orchestrator.ts`
- Modify: `tests/orchestrator.test.ts`

**Steps:**

1. Create orchestration run directory.
2. Write `orchestration.json` and append `events.jsonl`.
3. Execute tasks one at a time using `executeTaskRun()` or a shared lower-level lifecycle helper.
4. Update task status and `lastRunId`.
5. Mark downstream tasks skipped when blockers occur.
6. Run:
   ```bash
   npx vitest run tests/orchestrator.test.ts tests/tasks.test.ts
   ```

### Task 10: Implement bounded parallel orchestration

**Objective:** Execute non-conflicting ready tasks concurrently up to the cap.

**Files:**

- Modify: `src/orchestrator.ts`
- Modify: `tests/orchestrator.test.ts`

**Steps:**

1. Start ready tasks in batches constrained by lock availability and `maxConcurrency`.
2. Await task promises with failure isolation.
3. Release locks in `finally` blocks.
4. Add fake Codex sleep tests proving concurrency without hosted calls.
5. Run:
   ```bash
   npx vitest run tests/orchestrator.test.ts
   ```

### Task 11: Add CLI command

**Objective:** Expose orchestration through `codex-game-studio task orchestrate`.

**Files:**

- Modify: `src/cli.ts`
- Modify: `tests/cli-prompt-surface.test.ts`
- Modify: `tests/functionality-gap-pass.test.ts`

**Steps:**

1. Add command and options.
2. Print dry-run wave plan and execution summary.
3. Set nonzero exit code when orchestrator status is blocked.
4. Update future-surface tests so `parallel` is not blanket-forbidden, but hosted/unbounded/background surfaces remain forbidden.
5. Run:
   ```bash
   npx vitest run tests/cli-prompt-surface.test.ts tests/functionality-gap-pass.test.ts
   ```

### Task 12: Add workflow recipe tests

**Objective:** Define explicit workflow-to-task creation without hidden execution.

**Files:**

- Create: `tests/workflow-recipes.test.ts`
- Create later: `src/workflow-recipes.ts`

**Steps:**

1. Test `vertical-slice` dry-run prints proposed tasks and dependencies without writing.
2. Test non-dry creates tasks with `workflowId`, `groupId`, dependencies, files, and writeFiles.
3. Test recipe creation does not call Codex.
4. Run:
   ```bash
   npx vitest run tests/workflow-recipes.test.ts
   ```

### Task 13: Implement initial workflow recipes

**Objective:** Add task graph creation for a small high-value workflow set.

**Files:**

- Create: `src/workflow-recipes.ts`
- Modify: `src/cli.ts`
- Modify: `tests/workflow-recipes.test.ts`

**Steps:**

1. Implement `vertical-slice`, `bugfix`, `ui-ux-review`, and `release-checklist` recipes.
2. Add `workflow create-tasks <workflow-id>` CLI.
3. Keep workflow shortcut commands render-only.
4. Run:
   ```bash
   npx vitest run tests/workflow-recipes.test.ts tests/functionality-gap-pass.test.ts
   ```

### Task 14: Add CCGS adaptation registry tests

**Objective:** Make the curated CCGS adaptation decisions executable and reviewable.

**Files:**

- Create: `tests/ccgs-adaptation.test.ts`
- Create later: `src/ccgs-adaptation.ts`

**Steps:**

1. Test every listed CCGS role has an adaptation decision.
2. Test no legacy underscore role IDs become built-in role IDs.
3. Test high-value skill additions are categorized as workflow/template/recipe/deferred.
4. Run:
   ```bash
   npx vitest run tests/ccgs-adaptation.test.ts
   ```

### Task 15: Implement CCGS adaptation registry

**Objective:** Record curated adaptation decisions in code, not only docs.

**Files:**

- Create: `src/ccgs-adaptation.ts`
- Modify: `tests/ccgs-adaptation.test.ts`
- Modify: `src/validation.ts` if validation should report registry coverage.

**Steps:**

1. Add role decision table.
2. Add skill decision table.
3. Add helper functions for reporting unmapped/high-value candidates.
4. Optionally add validation diagnostics for registry consistency.
5. Run:
   ```bash
   npx vitest run tests/ccgs-adaptation.test.ts tests/validation.test.ts
   ```

### Task 16: Add first curated roles only if justified

**Objective:** Add no more than `lead-programmer` and `qa-lead` as built-ins if tests show current roles cannot own those workflows cleanly.

**Files:**

- Modify: `src/roles.ts`
- Modify: `src/config.ts`
- Modify: `src/agents.ts` if generated prompt coverage changes.
- Modify: `tests/roles.test.ts`
- Modify: `tests/functionality-gap-pass.test.ts`

**Steps:**

1. Add failing tests for role package presence and active-role selection.
2. Add role packages with concise responsibilities, expected outputs, quality gates, and handoff templates.
3. Do not add engine sub-specialist roles.
4. Run:
   ```bash
   npx vitest run tests/roles.test.ts tests/functionality-gap-pass.test.ts
   ```

### Task 17: Add high-value CCGS-derived workflows/templates

**Objective:** Fill real workflow gaps without importing all CCGS skills.

**Files:**

- Modify: `src/workflows.ts`
- Modify: `src/templates.ts`
- Add package templates under `templates/` only where structured output is needed.
- Modify: `tests/functionality-gap-pass.test.ts`
- Modify: `tests/agents-templates.test.ts`

**Steps:**

1. Add only the first batch: `gate-check`, `project-stage-detect`, `scope-check`, `estimate`, `tech-debt`, `smoke-check`, `test-evidence-review`, `asset-audit`, `balance-check`, `map-systems`, `ux-design`.
2. Add templates only for workflows that need durable structured artifacts.
3. Keep template selection bounded.
4. Run:
   ```bash
   npx vitest run tests/functionality-gap-pass.test.ts tests/agents-templates.test.ts
   ```

### Task 18: Update validation and future-surface guards

**Objective:** Validate orchestration without allowing hosted/unbounded drift.

**Files:**

- Modify: `src/validation.ts`
- Modify: `src/behavioral-evaluation.ts`
- Modify: `tests/validation.test.ts`
- Modify: `tests/behavioral-evaluation.test.ts`

**Steps:**

1. Add validation checks for task schema v2, orchestration command availability, lock directory safety, and recipe registry consistency.
2. Update forbidden drift phrases to forbid hosted/background/unbounded orchestration, not explicit local bounded orchestration.
3. Add absence checks for daemon/hosted/unbounded CLI/help/config surfaces.
4. Run:
   ```bash
   npx vitest run tests/validation.test.ts tests/behavioral-evaluation.test.ts
   ```

### Task 19: Update docs and generated truth surfaces

**Objective:** Keep product docs, architecture docs, and Truthmark docs in sync with implemented behavior.

**Files:**

- Modify: `README.md`
- Modify: `docs/development-rules.md`
- Modify: `docs/known-upstream-differences.md`
- Modify: `docs/migration-from-claude.md`
- Modify: `docs/workflow-validation.md`
- Modify: `docs/architecture/flows/role-run-lifecycle.md`
- Create: `docs/architecture/flows/task-orchestration.md`
- Modify relevant `docs/truthmark/**` docs after code behavior lands.

**Steps:**

1. Document `task orchestrate` and `workflow create-tasks` examples.
2. Document bounded parallelism cap and lock behavior.
3. Document CCGS adaptation as curated translation, not parity-by-copying.
4. Run Truthmark refresh only if `truthmark check` reports stale surfaces:
   ```bash
   npx truthmark check
   npx truthmark index
   ```

### Task 20: Full verification

**Objective:** Prove the feature works and product boundaries remain intact.

Run:

```bash
npm run typecheck
npm run build
npm test
npm run validate
npx truthmark check
npx truthmark index
git diff --check
```

Expected:

- Typecheck passes.
- Build passes.
- Tests pass.
- Validation reports bounded local orchestration as implemented.
- Validation still reports hosted/background/unbounded orchestration surfaces absent.
- Truthmark check/index pass.
- Diff has no whitespace errors.

---

## 11. Acceptance Criteria

Implementation is complete when all are true:

1. Existing `task run` behavior remains compatible.
2. Schema v1 task stores still read correctly.
3. `task create` supports dependencies, read files, write files, workflow IDs, and priority.
4. `task orchestrate --dry-run` writes no files and prints task waves, lock sets, approvals, and commands.
5. `task orchestrate` serial mode runs ready tasks in dependency order.
6. `task orchestrate --max-concurrency 2` runs non-conflicting tasks concurrently in tests.
7. Conflicting write sets do not run concurrently.
8. Tasks without write sets do not run concurrently with mutating tasks.
9. Strict-studio approvals are checked before any non-dry orchestration side effects.
10. Blocked tasks cause dependent tasks to become `skipped` with readable notes.
11. Orchestration run metadata and task outputs are persisted under `.codex/runs/**`.
12. Locks are released on success, failure, and thrown exceptions.
13. Help/validation exposes no hosted, daemon, background loop, or unbounded parallelism surface.
14. CCGS roles and skills have a curated adaptation registry with explicit keep/add/defer decisions.
15. Initial high-value CCGS additions improve OGS coverage without copying Claude-specific hooks/rules/skills wholesale.
16. Docs and Truthmark-backed behavior claims match code.

---

## 12. Explicit Non-Goals for This Implementation

- No hosted service.
- No remote worker.
- No background daemon.
- No auto-cleaning stale locks in the first pass.
- No generalized arbitrary DAG language.
- No unbounded `--max-concurrency 0` or `--max-concurrency unlimited` behavior.
- No automatic task generation from free-form LLM output without showing/writing reviewable task specs first.
- No import of `.claude/**` files into generated projects.
- No engine sub-specialist role explosion until selected-context references prove insufficient.

---

## 13. Recommended Implementation Order

1. Task schema v2.
2. CLI task creation enhancements.
3. Async Codex runtime.
4. Lock store.
5. Dry-run orchestration planner.
6. Serial orchestration execution.
7. Bounded parallel execution.
8. CLI command.
9. Workflow recipe creation.
10. CCGS adaptation registry.
11. First curated role/workflow/template additions.
12. Validation and docs.

This order keeps each step testable and avoids shipping a broad orchestration surface before locking, approvals, and failure behavior are explicit.
