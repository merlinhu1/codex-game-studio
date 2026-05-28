# Codex Game Studio Deep Integration Implementation Plan

> **For Hermes:** Do not implement this plan until Merlin explicitly approves it. When approved, use subagent-driven-development skill to implement this plan task-by-task. Do not rewrite git history or push commits unless Merlin explicitly asks.

**Goal:** Reorient Open GameStudio into a Codex-native game-development workflow layer, even if that reduces compatibility with Claude Code, OpenCode, or generic agent backends.

**Architecture:** Codex becomes the required runtime spine rather than an optional `--exec` backend. The CLI routes studio roles and workflows through a structured Codex session model, generated projects gain Codex-native instruction/state files, and validation checks Codex readiness plus prompt/workflow rendering. Keep the first implementation file-backed and package-friendly; defer databases, parallel orchestration, and broad backend abstractions until they are proven necessary.

**Tech Stack:** TypeScript, NodeNext ESM, npm CLI package, Vitest, Codex CLI, file-backed JSON/Markdown project state.

---

## Product Direction

Codex Game Studio is not a generic multi-agent framework. It is a Codex-native game-development workflow layer.

Accepted tradeoffs:

- Codex CLI is required for normal execution; commands that run or validate the runtime must fail hard when Codex is unavailable.
- `run <role>` invokes Codex by default in the first implementation pass. There is no transitional `--exec` release.
- Role prompts, project files, and workflows may be optimized specifically for Codex behavior.
- Claude Code/OpenCode/model-agnostic compatibility is not a design constraint.
- Existing compatibility surfaces should be deleted or rewritten when they conflict with the Codex-first product. This repo is new; do not preserve compatibility for its own sake.

Non-goals for the first implementation pass:

- No database-backed scheduler/task store.
- No parallel multi-agent orchestration.
- No Claude Code/OpenCode adapters.
- No backwards-compatibility layer for legacy agent IDs, `.gamestudio/*`, `project-config.json` authority, or `--exec` semantics.
- No full package/repo rename until the runtime behavior matches the new identity.
- No hidden git commits or pushes during implementation unless Merlin explicitly asks.

## Authoritative Decisions

These decisions are final for this plan and should not be re-litigated during implementation:

1. **Breaking runtime change now:** `open-gamestudio run <role> ...` launches Codex by default. `--dry-run` / `--print-prompt` are the non-executing inspection paths. Remove or repurpose legacy `--exec` behavior instead of preserving it.
2. **No legacy role migration:** Replace old agent IDs such as `producer_agent`, `mechanics_developer`, and `qa_agent` with canonical `StudioRoleId` values. Do not add aliases for backwards compatibility.
3. **`.codex/studio.json` is authoritative:** Generated projects use `.codex/studio.json` as the source of truth for engine, milestone, roles, workflows, and task state references. Delete or rewrite code that treats `project-config.json` as authoritative.
4. **Codex state lives under `.codex/`:** Runtime prompt caches and run metadata go to `.codex/runs`. Delete `.gamestudio/runs` and do not create new `.gamestudio` state.
5. **Project state writes are project-scoped:** task/workflow commands require `--project projects/<slug>` unless the current working directory is already a valid generated project root containing `.codex/studio.json`.
6. **Verification commands are structured argv:** Store and execute verification as `{ command: string; args: string[] }` with `shell: false`, a project-root cwd, timeout, and bounded output capture.
7. **Review/fix automation is schema-driven:** Review passes must return machine-readable JSON. Fix passes run only from verification failure or parsed review blockers.
8. **Local development uses npm scripts:** Do not use `npx vitest run` in this plan. Use `npm test -- <test files>` plus `npm run typecheck` and `npm run validate`.
9. **Missing Codex is fatal:** `validate` and normal execution fail when Codex CLI is missing or not authenticated. Dry-run/print-prompt may still render without launching Codex.
10. **Default fix automation is bounded:** default `--max-fix-passes` is `1`; `0` disables automatic fixes; user-provided higher values must still be finite.

## Target User Experience

Installed/link package UX:

```bash
open-gamestudio run producer --project projects/rogue-core "Create a vertical-slice plan for a roguelike"
open-gamestudio run gameplay-programmer --project projects/rogue-core "Implement movement"
open-gamestudio review --project projects/rogue-core
open-gamestudio task create --project projects/rogue-core "Add player jump" --role gameplay-programmer --verify-command npm --verify-arg test
open-gamestudio task run --project projects/rogue-core task-001 --review --fix
```

Repo-local examples must use npm scripts or the built CLI, not bare `open-gamestudio`, until the package is linked/installed. For example: `npm run build && node dist/cli.js run producer --project projects/rogue-core "Plan milestone"`.

The package/binary name may remain `open-gamestudio` initially. Public docs and CLI help should describe the product as **Codex Game Studio** as soon as this plan lands, because the Codex runtime is the default.

## Proposed End-State Source Layout

```text
src/
  cli.ts
  codex-runtime.ts        # spawn Codex, detect CLI/auth, feed prompt files/stdin
  codex-session.ts        # structured Codex studio session contract
  codex-prompts.ts        # render role/workflow prompts from structured data
  roles.ts                # Codex-optimized studio role packages
  workflows.ts            # vertical-slice, task, review, fix, ship-check workflows
  engines.ts              # engine-specific Codex context and verification hints
  projects.ts             # project init/layout generation
  validation.ts           # package checks + Codex readiness/project contract checks
```

`runner.ts` should become a thin coordinator or be absorbed by `codex-session.ts`/`codex-runtime.ts`. Do not preserve legacy execution paths only for compatibility.

## Generated Project Contract

Generated game projects should become Codex-native. The full end-state layout is:
```text
AGENTS.md
.codex/
  studio.json              # authoritative generated-project state
  tasks.json               # file-backed task store, added in Phase 4
  runs/                    # prompt caches and run metadata; replaces .gamestudio/runs
  prompts/
    creative-director.md
    producer.md
    game-designer.md
    gameplay-programmer.md
    engine-programmer.md
    tools-programmer.md
    technical-artist.md
    narrative-designer.md
    qa-playtester.md
    release-manager.md
  workflows/
    vertical-slice.md
    bugfix.md
    playtest.md
    ship-check.md
```

Phase 2 only needs to create the declared minimum prompt/workflow subset listed in Task 8. Do not claim the full end-state layout is complete until all listed role and workflow files are generated and validated.

`AGENTS.md` is the primary Codex instruction surface and should include:

- project goal and genre
- selected engine
- coding conventions
- asset conventions
- build/test/run commands
- current milestone
- known constraints
- role routing rules
- verification expectations

Per repo rules, only `src/agents.ts` owns generated project `AGENTS.md`; `src/projects.ts` may call helpers but must not contain generated `AGENTS.md` body text.

## Structured Session Contract

Add a structured session model before expanding workflows:

```ts
export type CodexStudioPhase = "plan" | "implement" | "review" | "fix" | "ship";
export type CodexSandboxMode = "read-only" | "workspace-write" | "danger-full-access";

export type VerificationCommand = {
  command: string;
  args: string[];
};

export type CodexStudioSession = {
  projectRoot: string;
  role: StudioRoleId;
  objective: string;
  phase: CodexStudioPhase;
  engine?: EngineId;
  contextFiles: string[];
  expectedOutputs: string[];
  verification?: VerificationCommand;
  allowFileEdits: boolean;
  sandbox: CodexSandboxMode;
  reviewMode?: "none" | "diff" | "full";
};
```

Prompt rendering should consume this object. Avoid ad-hoc string concatenation spread through CLI handlers.

Sandbox defaults are part of the session contract:

- `plan`, `review`, and `ship` default to `read-only` and `allowFileEdits: false`.
- `implement` and `fix` default to `workspace-write` and `allowFileEdits: true`.
- `danger-full-access` is never a default and requires an explicit CLI flag.
- Validation must reject any session where `allowFileEdits: false` produces writable sandbox args.

## Role Package Contract

Codex role packages should be structured, not just loose markdown:

```ts
export type CodexRolePackage = {
  id: StudioRoleId;
  displayName: string;
  systemPrompt: string;
  contextStrategy: "minimal" | "focused" | "broad";
  expectedOutputs: string[];
  handoffTemplate: string;
  reviewChecklist: string[];
};
```

Initial roles:

- `creative-director`
- `producer`
- `game-designer`
- `narrative-designer`
- `gameplay-programmer`
- `engine-programmer`
- `tools-programmer`
- `technical-artist`
- `qa-playtester`
- `release-manager`

Each role should produce Codex-friendly task prompts with concrete output contracts, not vague “act as this role” text. Legacy `AgentName` identifiers are removed rather than aliased.

---

## Phase 1: Make Codex the Default Runtime Spine

**Objective:** Replace the current “Codex as an execution option” feel with a centralized Codex runtime and default Codex execution path.

### Task 1: Add Codex Runtime Detection Tests

**Objective:** Define the expected Codex runtime detection behavior before implementation.

**Files:**
- Create or modify: `tests/codex-runtime.test.ts`
- Later create: `src/codex-runtime.ts`

**Step 1: Write failing tests**

Add tests for:

- `resolveCodexCommand()` uses `CODEX_BIN` if provided.
- `resolveCodexCommand()` defaults to `codex`.
- `resolveCodexCommand()` does not read legacy Open GameStudio env names.
- `buildCodexExecArgs()` uses `exec`, `--cd <projectRoot>`, sandbox args, and stdin/file prompt mode.
- `checkCodexAvailability()` returns structured diagnostics for tests and error messages.
- normal execution and `validate` fail hard when Codex is unavailable or unauthenticated.

Expected shape:

```ts
expect(buildCodexExecArgs({ projectRoot: "/repo", sandbox: "read-only" })).toContain("exec");
expect(buildCodexExecArgs({ projectRoot: "/repo", sandbox: "read-only" })).toContain("--cd");
expect(buildCodexExecArgs({ projectRoot: "/repo", sandbox: "read-only" })).toContain("/repo");
```

**Step 2: Run focused test**

Run:

```bash
npm test -- tests/codex-runtime.test.ts
```

Expected: FAIL because `src/codex-runtime.ts` does not exist yet.

### Task 2: Implement `src/codex-runtime.ts`

**Objective:** Centralize Codex command resolution, argument construction, prompt feeding, and readiness checks.

**Files:**
- Create: `src/codex-runtime.ts`
- Modify: `tests/codex-runtime.test.ts`

**Implementation notes:**

Export pure helpers first:

```ts
export type CodexSandboxMode = "read-only" | "workspace-write" | "danger-full-access";

export type CodexRuntimeOptions = {
  projectRoot: string;
  sandbox?: CodexSandboxMode;
  codexBin?: string;
};

export function resolveCodexCommand(env = process.env): string;
export function buildCodexExecArgs(options: CodexRuntimeOptions): string[];
export async function checkCodexAvailability(options?: { codexBin?: string }): Promise<CodexAvailability>;
```

Use prompt stdin/file feeding for actual execution. Do not build unsafe shell-quoted inline prompts.

**Step 1:** Implement pure helpers.

**Step 2:** Run:

```bash
npm test -- tests/codex-runtime.test.ts
```

Expected: PASS.

### Task 3: Route Existing `run` Execution Through `codex-runtime.ts`

**Objective:** Make existing direct execution use the new runtime rather than local process-spawning logic in `runner.ts`.

**Files:**
- Modify: `src/runner.ts`
- Modify: `src/cli.ts` if execution flags are parsed there
- Modify: `tests/runner-prompts.test.ts`

**Step 1: Write/adjust failing test**

Add tests that verify `run <role>` launches Codex by default through `codex-runtime.ts`, while `--dry-run` and `--print-prompt` render without launching Codex. Remove or rewrite tests that preserve legacy `--exec` behavior.

**Step 2: Implement minimal wiring**

- Keep dry-run/prompt-render behavior as the only non-executing path.
- Move Codex process arg construction to `codex-runtime.ts`.
- Remove legacy `--exec` semantics instead of preserving them for compatibility.
- Store prompt caches and run metadata under `.codex/runs`, not `.gamestudio/runs`.

**Step 3: Run focused tests**

```bash
npm test -- tests/runner-prompts.test.ts tests/codex-runtime.test.ts
```

Expected: PASS.

### Task 4: Update CLI Help and README Positioning

**Objective:** Make user-facing copy say Codex is the studio runtime, not merely an optional backend.

**Files:**
- Modify: `src/cli.ts`
- Modify: `README.md`
- Modify docs mentioning Claude/generic compatibility if directly contradicted by the new runtime direction.

**Copy direction:**

- Product label: **Codex Game Studio**.
- Package/binary can remain `open-gamestudio` for this phase.
- Say “requires Codex CLI for execution and validation.”
- Say “use `--dry-run` or `--print-prompt` to inspect prompts without launching Codex.”
- Remove docs that present Claude/OpenCode/generic backends or `--exec` as supported compatibility paths.

**Step 1:** Update tests that assert help/readme text if present.

**Step 2:** Update implementation/docs.

**Step 3:** Run:

```bash
npm test
npm run typecheck
npm run validate
```

Expected: all PASS.

---

## Phase 2: Add Codex-Native Project Files

**Objective:** Generated projects should contain Codex-specific instruction and state files.

### Task 5: Add Project Layout Tests for `AGENTS.md` and `.codex/studio.json`

**Files:**
- Modify: `tests/project-workflow.test.ts`
- Modify later: `src/projects.ts`
- Modify later: `src/agents.ts`

**Step 1: Write failing tests**

Assert that project init creates:

- `AGENTS.md`
- `.codex/studio.json`
- `.codex/runs/`
- `.codex/prompts/producer.md`
- `.codex/prompts/gameplay-programmer.md`
- `.codex/workflows/vertical-slice.md`
- no `.gamestudio/runs` directory
- no authoritative `project-config.json` dependency

Expected: FAIL until generation is implemented.

### Task 6: Implement `AGENTS.md` Generation

**Objective:** Generate a primary Codex instruction file for each game project.

**Files:**
- Modify: `src/projects.ts` only to call helpers; generated instruction body text must not live there
- Modify: `src/agents.ts` for all generated `AGENTS.md` changes; this is mandatory because `src/agents.ts` owns generated project `AGENTS.md`
- Test: `tests/project-workflow.test.ts`

**Required `AGENTS.md` sections:**

```md
# <Project Name> Agents

## Project Goal

## Engine

## Commands

## Coding Conventions

## Asset Conventions

## Studio Roles

## Current Milestone

## Verification
```

**Step 1:** Implement deterministic markdown generation.

**Step 2:** Ensure `AGENTS.md` contains the full project instruction contract from `src/agents.ts`; do not duplicate `AGENTS.md` body text in `src/projects.ts`.

**Step 3:** Run focused tests.

### Task 7: Implement `.codex/studio.json`

**Objective:** Add minimal file-backed project state and make it authoritative.

**Files:**
- Modify: `src/projects.ts`
- Modify or replace `src/config.ts` readers that treat `project-config.json` as authoritative
- Create or modify: `src/codex-session.ts` if shared types are introduced here
- Test: `tests/project-workflow.test.ts`

Initial JSON shape:

```json
{
  "schemaVersion": 1,
  "product": "codex-game-studio",
  "engine": "godot",
  "currentMilestone": "prototype",
  "roles": [],
  "workflows": []
}
```

Use deterministic formatting. `.codex/studio.json` is the generated project source of truth. Do not keep `project-config.json` as an authority; delete it or reduce it to derived output only if a later package test proves it is still needed.

### Task 8: Generate Codex Prompt and Workflow Templates

**Objective:** Ship project-local prompt/workflow files that Codex can use as durable context.

**Files:**
- Modify: `src/projects.ts`
- Modify or create: `src/roles.ts` only for the Phase 2 minimum constants, or move Task 10 before this task if full structured role packages are needed
- Modify or create: `src/workflows.ts` only for the Phase 2 minimum constants, or move Task 10 before this task if full structured workflows are needed
- Test: `tests/project-workflow.test.ts`

Required initial prompt files:

- `.codex/prompts/producer.md`
- `.codex/prompts/gameplay-programmer.md`
- `.codex/prompts/qa-playtester.md`

Required initial workflow files:

- `.codex/workflows/vertical-slice.md`
- `.codex/workflows/bugfix.md`
- `.codex/workflows/playtest.md`

---

## Phase 3: Structured Codex Sessions and Role Packages

**Objective:** Replace loose prompt assembly with structured sessions and role packages.

### Task 9: Add `src/codex-session.ts`

**Files:**
- Create: `src/codex-session.ts`
- Create or modify: `tests/codex-session.test.ts`

**Step 1: Write failing tests**

Test that a session requires:

- project root
- role
- objective
- phase
- expected outputs

Test invalid role/phase rejection if runtime validation exists.

**Step 2: Implement types and small validation helpers**

Keep this lightweight. Do not add a schema dependency unless one already exists in the project.

### Task 10: Add `src/roles.ts`

**Files:**
- Create: `src/roles.ts`
- Create or modify: `tests/roles.test.ts`

**Required exports:**

```ts
export type StudioRoleId =
  | "creative-director"
  | "producer"
  | "game-designer"
  | "narrative-designer"
  | "gameplay-programmer"
  | "engine-programmer"
  | "tools-programmer"
  | "technical-artist"
  | "qa-playtester"
  | "release-manager";

export type CodexRolePackage = {
  id: StudioRoleId;
  displayName: string;
  systemPrompt: string;
  contextStrategy: "minimal" | "focused" | "broad";
  expectedOutputs: string[];
  handoffTemplate: string;
  reviewChecklist: string[];
};
```

Tests should verify all role IDs have packages and no package has empty prompt/checklist fields.

### Task 11: Add Prompt Renderer

**Files:**
- Create: `src/codex-prompts.ts`
- Create or modify: `tests/codex-prompts.test.ts`
- Modify: `src/runner.ts`

**Objective:** Render a complete Codex prompt from a `CodexStudioSession` and role package.

Prompt should include:

- role identity
- project root
- objective
- phase
- engine hints if present
- context files
- expected outputs
- verification command
- explicit instruction to report changed files and verification results

### Task 12: Refactor Runner to Use Sessions

**Files:**
- Modify: `src/runner.ts`
- Modify: `tests/runner-prompts.test.ts`

**Objective:** `runner.ts` should construct a `CodexStudioSession`, render it, then call `codex-runtime.ts`.

Verification:

```bash
npm test -- tests/codex-session.test.ts tests/codex-prompts.test.ts tests/runner-prompts.test.ts
npm run typecheck
```

---

## Phase 4: Add File-Backed Studio Tasks and Workflows

**Objective:** Move beyond one-off role invocation into a Codex-powered production loop.

### Task 13: Add Task Store Types

**Files:**
- Create: `src/tasks.ts`
- Create: `tests/tasks.test.ts`

Task shape:

```ts
export type StudioTask = {
  id: string;
  title: string;
  role: StudioRoleId;
  status: "ready" | "running" | "blocked" | "done";
  files: string[];
  verification?: VerificationCommand;
  notes: string[];
};
```

Store path:

```text
<projectRoot>/.codex/tasks.json
```

Keep deterministic JSON and stable IDs. Do not add a database. Allocate IDs by scanning existing tasks and writing the next zero-padded ID (`task-001`, `task-002`, ...). Write atomically by writing a temp file in `.codex/` and renaming it into place. Tests must cover invalid JSON, duplicate IDs, and atomic write failure cleanup.

### Task 14: Add `task create` CLI Command

**Files:**
- Modify: `src/cli.ts`
- Modify or create: `src/tasks.ts`
- Test: add CLI/task tests in existing test style

Command:

```bash
open-gamestudio task create --project projects/rogue-core "Add player jump" --role gameplay-programmer --verify-command npm --verify-arg test
```

Expected behavior:

- Requires `--project projects/<slug>` unless cwd is a generated project root containing `.codex/studio.json`.
- Creates `<projectRoot>/.codex/tasks.json` if absent.
- Appends a ready task.
- Prints task ID.
- Does not invoke Codex.

### Task 15: Add `task run` CLI Command

**Files:**
- Modify: `src/cli.ts`
- Modify: `src/tasks.ts`
- Modify: `src/runner.ts`
- Tests: CLI/task runner tests

Command:

```bash
open-gamestudio task run --project projects/rogue-core task-001 --dry-run
open-gamestudio task run --project projects/rogue-core task-001
```

Expected behavior:

- Requires `--project projects/<slug>` unless cwd is a generated project root containing `.codex/studio.json`.
- Loads task from `<projectRoot>/.codex/tasks.json`.
- Builds a `CodexStudioSession`.
- In dry-run, prints prompt/session without Codex execution and does not mutate status.
- In normal mode, invokes Codex runtime.
- Updates task status with this state table: `ready -> running` before Codex launch; `running -> done` only when Codex exits 0 and verification passes; `running -> blocked` when Codex exits nonzero, verification fails, review has blockers after fix passes, or output parsing is malformed. Interrupted runs must leave enough metadata to report uncertainty and should not be silently marked `done`.

### Task 16: Add Workflow Prompt Commands

**Files:**
- Create or modify: `src/workflows.ts`
- Modify: `src/cli.ts`
- Tests: workflow command tests

Commands:

```bash
open-gamestudio plan vertical-slice --project projects/example --dry-run
open-gamestudio review --project projects/example --dry-run
open-gamestudio ship-check --project projects/example --dry-run
```

Start with dry-run/rendering correctness. Actual Codex execution can reuse `codex-runtime.ts`.

---

## Phase 5: Add Review/Fix Automation

**Objective:** Make Codex implementation loops first-class: implement, verify, review, optionally fix.

### Task 17: Add Verification Command Runner Boundary

**Files:**
- Create or modify: `src/verification.ts`
- Tests: `tests/verification.test.ts`

**Objective:** Run user-provided verification commands and capture stdout/stderr/exit code in a structured result.

Verification command contract:

```ts
export type VerificationCommand = {
  command: string;
  args: string[];
};

export type VerificationResult = {
  command: string;
  args: string[];
  cwd: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
};
```

Execute with `spawn`/`execFile`, `shell: false`, `cwd = projectRoot`, a finite timeout, and bounded stdout/stderr capture. Do not parse shell strings. Tests must cover spaces, quotes, nonzero exit, timeout, cwd, and output truncation.

### Task 18: Add `--verify` to Run/Task Execution

**Files:**
- Modify: `src/cli.ts`
- Modify: `src/runner.ts`
- Modify: `src/tasks.ts`
- Tests: runner/task tests

Behavior:

```bash
open-gamestudio run gameplay-programmer --project projects/rogue-core "Add player jump" --verify-command npm --verify-arg test
```

After Codex exits, run verification and include result in final CLI output.

### Task 19: Add `--review` Prompt Pass

**Files:**
- Modify: `src/runner.ts`
- Modify: `src/codex-prompts.ts`
- Tests: prompt/runner tests

Behavior:

- After implementation and verification, render a review prompt.
- Review prompt asks Codex to inspect the diff and verification output.
- Review pass must return machine-readable JSON, preferably through Codex `--output-schema` when available. Minimum schema:

```json
{
  "blockers": [],
  "warnings": [],
  "summary": "",
  "needsFix": false
}
```

- Dry-run mode shows implementation prompt, review prompt, and expected schema separately.
- Malformed review JSON is treated as blocked/uncertain, not success.

### Task 20: Add `--fix --max-fix-passes <n>`

**Files:**
- Modify: `src/cli.ts`
- Modify: `src/runner.ts`
- Tests: runner loop tests

Behavior:

- If verification fails or parsed review JSON reports blockers, run a fix prompt.
- Default max fix passes: 1. `--max-fix-passes 0` disables automatic fixes.
- Always stop after max passes and report remaining blockers.
- Do not silently loop forever.
- Tests must cover: no blockers -> no fix pass; blockers -> one fix pass by default; malformed review output -> stop blocked; failed verification after max passes -> report blocked.

---

## Phase 6: Engine-Aware Codex Context

**Objective:** Make engine configs useful for Codex prompts and validation.

### Task 21: Extend Engine Config Schema

**Files:**
- Modify: `engine_configs/godot.json`
- Modify: `engine_configs/unity.json`
- Modify: `engine_configs/unreal.json`
- Modify: `src/engines.ts`
- Tests: engine system tests

Add fields:

```json
{
  "project_files": ["project.godot", "scenes/**", "scripts/**"],
  "run_command": "godot --path .",
  "test_command": "godot --headless --path . --run-tests",
  "codex_hints": [
    "Prefer engine-native idioms.",
    "Do not edit imported assets directly.",
    "Describe binary scene/asset changes explicitly."
  ]
}
```

Use realistic commands per engine, and mark commands as examples if they depend on local installation. Keep engine config keys snake_case to match the existing JSON style, and update `engineConfigSchema` before prompt rendering uses the new fields.

### Task 22: Inject Engine Hints into Prompt Renderer

**Files:**
- Modify: `src/codex-prompts.ts`
- Modify tests: `tests/codex-prompts.test.ts`

Expected behavior:

- Prompt includes engine-specific files, commands, and Codex hints.
- Missing engine config does not crash dry-run; it produces a clear warning.

---

## Phase 7: Validation and Packaging Hardening

**Objective:** Ensure the package validates Codex readiness and ships all runtime assets.

### Task 23: Add Codex Readiness Checks to `validate`

**Files:**
- Modify: `src/validation.ts`
- Tests: `tests/validation.test.ts`

Checks:

- `codex.cli`: Codex command exists and is authenticated; missing/unusable Codex is a validation failure.
- `codex.project.AGENTS.md`: generated project contract exists when validating a project.
- `codex.roles`: all required role packages render.
- `codex.workflow.vertical-slice`: workflow prompt renders.
- `codex.engine.<engine>`: engine hints/config parse.

### Task 24: Verify Package Shipping

**Files:**
- Modify: `package.json` if `files` misses runtime assets
- Modify: validation/package tests if present

Required checks:

- Build before black-box CLI tests.
- `npm pack` includes Codex role/workflow assets if they are stored outside TypeScript source.
- Temporary install can run `open-gamestudio validate` from a non-repo cwd.

Commands:

```bash
npm run build
npm pack --dry-run
npm run validate
```

---

## Phase 8: Naming Decision

**Objective:** Decide whether to rename repo/package after Codex-native behavior lands.

Defer until after Phases 1–3 are complete.

Options:

1. Full rename:
   - repo: `codex-game-studio`
   - package: `codex-game-studio`
   - binary: `codex-game-studio`
2. Product-only rename:
   - repo/package/binary remain `open-gamestudio`
   - README title: **Codex Game Studio**
   - tagline: “A Codex-native AI game studio workflow.”

Recommendation: start with product-only rename, then full rename once commands and validation are truly Codex-first.

---

## Global Verification Gate

Before proposing any commit for review, run:

```bash
npm test
npm run typecheck
npm run validate
```

If package/runtime assets changed, also run:

```bash
npm run build
npm pack --dry-run
```

Before claiming parity or package readiness, follow the repo instruction in `AGENTS.md`: use `npm run validate`.

## Resolved Implementation Decisions

- `run <role>` invokes Codex by default in Phase 1. No transitional `--exec` compatibility release.
- Legacy agent IDs and old state layouts are removed instead of migrated.
- `.codex/studio.json` is authoritative generated-project state.
- Runtime caches and run metadata live in `.codex/runs`; `.gamestudio/runs` is deleted.
- `validate` fails when Codex CLI is missing or unusable.
- Task and workflow state writes are scoped to `--project projects/<slug>` unless cwd is a valid generated project root.
- `task run` mutates task status using the explicit state table in Task 15.
- Default automatic fix passes: `1`.
- Initial engine configs remain Godot, Unity, and Unreal for this plan; add web/Three.js only in a later plan if needed.
- Package/repo rename remains deferred; product copy changes now.

## Handoff Notes

- This is a review plan only. No implementation should start until Merlin approves.
- Do not commit or push the plan unless Merlin explicitly asks.
- When implementing, prefer Codex-authored source edits if Merlin wants the project to dogfood Codex deeply.
- Keep each implementation PR narrow. The first PR should likely be Phase 1 only.
