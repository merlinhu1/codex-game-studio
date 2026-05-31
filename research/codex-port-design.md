# Codex-Native Game Studio Port Design

## Purpose

Port `pamirtuna/gamestudio-subagents` into this repository as a Codex-native TypeScript/Node toolkit without carrying over the legacy implementation's brittle execution model or false-green validation behavior.

The port must preserve upstream user-facing capabilities. Scope control should remove only **new Codex-era optional features**, not features that already exist upstream. If upstream supports a workflow, engine, agent, template, script-style entry point, or project-management action, the TypeScript port should preserve that capability with a cleaner implementation and hard-failing validation.

This document is split into three scopes:

1. **Clean parity contract**: upstream capabilities that must be preserved without legacy bugs.
2. **Codex-native improvements**: additions that make the port more useful but should remain tightly bounded.
3. **Future optional layer**: features not present upstream and not needed for the first implementation.

## Ground Rules

- Build the port as TypeScript/Node only.
- Use `open-gamestudio` as the canonical CLI.
- Preserve upstream user-facing capabilities unless explicitly documented as an intentional known difference.
- Do not copy legacy source during the research/design phase.
- Do not preserve Python internals, Python package metadata, or shell alias assumptions.
- Do not reproduce upstream false-green validation behavior.
- Do not claim parity until the new implementation passes clean, hard-failing validation.
- Scope reduction is allowed only for features that are new to this port, such as telemetry, direct Codex execution, planner logic, and parallel orchestration.

## Intentional Known Differences

The port may intentionally regress upstream implementation or UX details that add maintenance cost without preserving meaningful user value.

Allowed differences:

- **No duplicate script-wrapper implementation.** Upstream-style script wrappers are not part of the core parity promise. The port should preserve npm/package discoverability and the canonical `opengamestudio` CLI, but it does not need separate wrapper files such as `scripts/init_project.mjs` or `scripts/project_manager.mjs` unless they are demonstrably useful. If wrappers are added, they must be thin pass-throughs to the canonical CLI and must not own logic.
- **No interactive menu.** Do not port upstream's interactive `menu` flow. It creates a second UI surface with extra state and terminal complexity. Non-interactive CLI commands are the supported interface.
- **No `project_orchestrator.md` file parity.** Preserve the orchestration and handoff behavior through project `AGENTS.md`, the materialized `master_orchestrator` agent, and handoff templates/docs. Do not generate a separate upstream-style `project_orchestrator.md` file.
- **No exact `template_info.md` parity.** Replace the static upstream template-info document with a machine-readable template registry and/or `opengamestudio templates` commands. Generated docs may exist later, but exact file parity is not required.
- **No eager competitor report generation during init.** Initialization should record competitor names in config and create a market overview/seed document. Full competitor analysis reports should be created by the market analyst workflow when requested, not as init clutter.
- **No upstream license/authorship/citation doc parity.** This is a port/rewrite with project-owned licensing. Do not copy upstream license, authorship, or citation docs as parity artifacts. Use only this repository's chosen license outside the parity contract.
- **No `startover` command.** Do not implement upstream `startover`; the name is ambiguous and encourages destructive semantics. If revision/reset workflows are needed later, design them under explicit non-destructive names.

Every intentional difference must be listed here or in migration docs before parity is claimed.

## Verified Upstream Capability Baseline

The upstream repository includes these user-facing surfaces:

- **Engines**: Godot, Unity, and Unreal Engine configs and initializer branches.
- **Agents**: 12 studio role prompts plus project-specific agent customization.
- **Project initialization**: interactive initializer that creates project folders, engine files, market docs, config, milestones, and customized agents.
- **Project management**: status, new, resume, and freeze flows. Upstream also has `menu` and `startover`, but those are intentional known differences and should not be ported.
- **Templates**: GDD, feature spec, handoff, analytics setup, engine setup, market analysis, and project config. Upstream `template_info.md` is replaced by registry/command discoverability.
- **Validation scripts**: project workflow and engine-system checks.
- **Package scripts**: `init`, `manage`, and `test` command aliases.
- **Docs**: setup, examples, contribution, development rules, system verification, and workflow validation. Upstream license/authorship/citation files are not parity artifacts for this rewrite.

The upstream validation baseline is not clean. In particular, the engine-system test reports only part of the suite passing while still exiting successfully. Known legacy issues include:

- folder-structure helper argument mismatches;
- project-file path expectations that differ from generated source roots;
- inconsistent Unreal naming such as `Unreal`, `Unreal Engine`, and related aliases;
- shell-command assumptions around `python`.

The port must fix these mistakes by defining clean contracts and hard-failing tests. It must not avoid the features entirely.

---

# Part 1: Clean Parity Contract

## Parity Goal

The first complete port should preserve upstream workflow outcomes while replacing the fragile Python implementation with a clean TypeScript/Node architecture.

The core loop is:

```text
idea -> init project -> validate project -> use project-specific agents -> manage project state -> continue work
```

The Codex-native runner described later can improve this loop, but the baseline port must not regress upstream project creation, engine support, agent coverage, templates, or project management except for the intentional known differences listed above.

## Engine Support

The port must support all upstream engines:

- Godot
- Unity
- Unreal Engine

Use canonical IDs internally:

```text
godot
unity
unreal
```

Engine configs should include aliases so user input normalizes cleanly:

```json
{
  "id": "unreal",
  "display_name": "Unreal Engine",
  "aliases": ["Unreal", "Unreal Engine", "ue", "ue5"]
}
```

Required engine contract:

- all engine source roots are under `projects/<slug>/source/project-<slug>/`;
- engine display names are stable and user-facing;
- engine aliases normalize before folder or project-file generation;
- validation checks the generated folder and project-file contract for each engine;
- each engine has prompt-overlay data for project-specific agents;
- unsupported or unknown engine names fail clearly.
- Unreal `.uproject` filenames are generated from a shared `projectClassName(nameOrSlug)` helper: split on non-alphanumeric boundaries, PascalCase words, strip punctuation, prefix `Game` when the result would start with a digit, and fail clearly when no alphanumeric characters remain. Examples: `"Test Game" -> "TestGame"` and `"codex-unreal-smoke" -> "CodexUnrealSmoke"`.

Required generated project files:

```text
Godot:
  source/project-<slug>/project.godot

Unity:
  source/project-<slug>/Packages/manifest.json
  source/project-<slug>/ProjectSettings/ProjectSettings.asset or another documented Unity project-settings marker

Unreal:
  source/project-<slug>/<ProjectName>.uproject
```

Unreal naming must be fixed in the new contract: `Unreal`, `Unreal Engine`, `unreal`, and `ue5` should all normalize to canonical `unreal`, while display output remains `Unreal Engine`.

## Agent Support

The port must preserve all 12 upstream studio roles:

- `master_orchestrator`
- `producer_agent`
- `market_analyst`
- `data_scientist`
- `sr_game_designer`
- `mid_game_designer`
- `mechanics_developer`
- `game_feel_developer`
- `sr_game_artist`
- `technical_artist`
- `ui_ux_agent`
- `qa_agent`

These roles are not optional. The first parity target should include all 12 base prompts, adapted to Codex-style structured inputs/outputs.

Project initialization must also preserve project-specific agent materialization. In the TypeScript port this should be owned by `src/agents.ts` rather than copied from the Python `agent_customizer.py` implementation.

Required behavior:

- validate the 12 required base prompts exist;
- select active agents by project mode;
- inject project summary, engine overlay, and role-specific output guidance;
- materialize project-specific prompts under `projects/<slug>/.gamestudio/agents/`;
- generate a project-level `AGENTS.md` for Codex-local guidance;
- preserve upstream project orchestration/handoff behavior through compact `AGENTS.md`, the materialized `master_orchestrator` agent, and handoff templates/docs. Do not generate a separate `project_orchestrator.md` file.

Mode-specific active-agent behavior should preserve upstream intent:

```text
always:
  master_orchestrator
  producer_agent
  market_analyst
  data_scientist

design:
  sr_game_designer
  mid_game_designer
  sr_game_artist

prototype:
  sr_game_designer
  mechanics_developer
  qa_agent

development:
  sr_game_designer
  mid_game_designer
  mechanics_developer
  game_feel_developer
  qa_agent
  sr_game_artist
  technical_artist
  ui_ux_agent
```

## Project Initialization

`opengamestudio init` must preserve upstream project-creation outcomes while using a cleaner Node implementation.

Required initialization outputs:

```text
projects/<slug>/
  AGENTS.md
  project-config.json
  source/project-<slug>/...
  documentation/
  resources/market-research/
  .gamestudio/agents/
```

Project initialization should create:

- engine-specific folder structure for Godot, Unity, or Unreal;
- engine-specific project files;
- project config;
- market overview/seed document;
- configured competitor names in project config, without generating full competitor analysis reports during init;
- GDD or starter design documentation;
- milestone/timeline data equivalent to upstream behavior;
- project-specific agent prompts;
- project-level Codex guidance.

The port may simplify excessive folder creation only where it is clearly not user-facing or not validated upstream, but it must not remove engine support, market-analysis seeds, project config, milestones, or project-specific agents. Full competitor reports are intentionally deferred to the market analyst workflow.

## Project Config

Use Zod to validate a versioned project config and avoid implicit prompt contracts.

Required project fields:

```json
{
  "schema_version": "1.0",
  "project": {
    "name": "My Game",
    "slug": "my-game",
    "concept": "One sentence concept",
    "genre": "Action",
    "platform": "PC",
    "audience": "Players who like short sessions",
    "competitors": ["competitor-a", "competitor-b"],
    "monetization": "premium",
    "timeline": "12 weeks",
    "engine": "godot",
    "engine_version": "4.4.1",
    "mode": "prototype",
    "phase": "Initialization",
    "status": "active"
  },
  "team": {
    "active_agents": ["master_orchestrator", "producer_agent", "market_analyst", "data_scientist", "sr_game_designer", "mechanics_developer", "qa_agent"]
  },
  "production": {
    "milestones": [
      {
        "id": "m1",
        "title": "Playable prototype",
        "target": "Week 4",
        "exit_criteria": ["Core loop is playable"],
        "status": "planned"
      }
    ]
  }
}
```

The TypeScript schema may improve shape and naming, but it must preserve upstream information: project identity, audience, competitors, monetization, engine, engine version, mode, phase/status, team/active agents, and schema-validated milestones. Config serialization used for generated guidance hashes must be canonical: recursively sorted keys, two-space indentation, LF newlines, one trailing newline, and an operational-field omission mode for status/run-state fields.

## Templates and Docs

The port must preserve upstream template categories:

- `gdd` -> `gdd_template.md`
- `feature_spec` -> `feature_spec_template.md`
- `handoff` -> `handoff_template.md`
- `analytics_setup` -> `analytics_setup_template.md`
- `engine_setup` -> `engine_setup_template.md`
- `market_analysis` -> `market_analysis_template.md`
- `project_config` -> `project_config_template.json`

The TypeScript port may rename files only if the migration is documented and validation knows the new paths. Do not preserve exact `template_info.md` file parity; expose template discoverability through a typed registry and/or `opengamestudio templates` commands.

Template selection must be deterministic and bounded: `market_analyst` selects `market_analysis`, `data_scientist` selects `analytics_setup`, designer/spec tasks select `gdd`/`feature_spec`, engine/project setup tasks select `engine_setup`/`project_config`, and `handoff` is selected only for handoff/coordination tasks. QA does not load all templates by default.

The port should also carry forward equivalent docs for:

- setup/quickstart;
- examples;
- development rules;
- system verification;
- workflow validation;
- contribution notes.

Docs do not need to be copied verbatim, but the user-facing guidance should not disappear. Upstream license/authorship/citation docs are explicitly out of scope for this rewrite; use this repository's own licensing policy instead.

## Project Management

The port must preserve useful upstream project-management capabilities while intentionally dropping `menu` and `startover`.

Canonical CLI commands should include equivalents for:

```bash
opengamestudio status [--project projects/my-game]
opengamestudio new
opengamestudio resume --project projects/my-game
opengamestudio freeze --project projects/my-game
```

`opengamestudio init` may be the canonical implementation behind `new`.

Interactive `menu` behavior is intentionally not implemented. Users should rely on documented non-interactive commands.

Status/resume/freeze should operate on project config state and should not become a separate orchestration system.

Project-management command semantics:

- `status`: read-only summary of project config, phase/status, active agents, and latest validation state if available.
- `new`: alias or guided wrapper for `init`; it must not create a second project-creation path.
- `resume`: read-only continuation summary with the next suggested manual command; it must not run agents.
- `freeze`: change only project status to frozen/inactive without deleting source, docs, or run history. Status is operational state and is omitted from the project `AGENTS.md` guidance hash, so a status-only freeze must not make generated guidance stale.
- `menu`: intentionally omitted.
- `startover`: intentionally omitted. Future revision/reset workflows require a separate design with explicit non-destructive command names.

## Script-Style Entry Points

Upstream exposes script/package commands for init, manage, and test. The TypeScript port should preserve package-level discoverability without creating duplicate wrapper logic.

Required package metadata excerpt:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "init": "npm run build --silent && node dist/cli.js init",
    "manage": "npm run build --silent && node dist/cli.js status",
    "test": "vitest run",
    "validate": "npm run build --silent && node dist/cli.js validate",
    "templates": "npm run build --silent && node dist/cli.js templates"
  },
  "engines": {
    "node": ">=20"
  },
  "files": [
    "dist/",
    "engine_configs/",
    "agents/base/",
    "templates/"
  ]
}
```

Separate thin Node wrappers such as `scripts/init_project.mjs`, `scripts/project_manager.mjs`, and `scripts/validate.mjs` are optional known differences. Prefer package scripts that call the built CLI via `node dist/cli.js`, plus explicit smoke tests for the canonical `opengamestudio` binary through `npm exec opengamestudio -- ...` after build/link/install. Do not rely on a bare self-bin name inside the package's own npm scripts before install/link. If wrappers exist, they must call the same command handlers as the canonical CLI and must not fork logic.

The build config must keep the package bin stable: `tsconfig.json` may typecheck both `src/**/*.ts` and `tests/**/*.ts`, but `tsconfig.build.json` must emit `src/cli.ts` to `dist/cli.js` rather than `dist/src/cli.js`. Relative TypeScript imports must use emitted `.js` specifiers under NodeNext, for example `import { loadConfig } from "./config.js"`.

Runtime package assets (`engine_configs/`, `agents/base/`, and `templates/`) must resolve from the installed package root via `import.meta.url`-based helpers, not from `process.cwd()`. The package-root helper should walk upward from the current module URL until it finds this package's `package.json`, rather than assuming a fixed relative path from `dist`. Project paths resolve from explicit `--project` or documented current-project cwd behavior.

Package shipping must be tested, not assumed. `npm pack --json` must include the built CLI and runtime asset directories, and a temporary non-repo cwd install smoke must prove the installed package bin can load templates and engine configs. CLI black-box tests that execute `dist/cli.js` or the package bin must build first so they cannot accidentally pass against stale output or source-only execution.

## Clean Validation Design

Validation is a first-class product surface, not a copied legacy behavior.

`opengamestudio validate` must:

- return exit code `0` only when all selected checks pass;
- return non-zero when any selected check fails;
- print clear failure messages with paths and check names;
- avoid false-green behavior where failures are printed but the command succeeds;
- validate all upstream parity surfaces before parity is claimed.

Validation should use a typed internal result shape:

```ts
type CheckStatus = "pass" | "fail" | "skip";

type ValidationCheck = {
  id: string;
  status: CheckStatus;
  message: string;
  path?: string;
};
```

CLI exit behavior:

```text
any fail -> exit 1
no fail -> exit 0
skip -> allowed only for explicitly documented non-parity checks
```

Required validation checks:

- package scripts exist;
- TypeScript build output produces `dist/cli.js`, and NodeNext relative imports use `.js` specifiers;
- package assets resolve from the installed package root, including subdirectory invocation;
- package metadata declares a supported Node runtime, includes runtime assets in the publish set, and `npm pack` plus temp install proves installed-bin asset loading from a non-repo cwd;
- all 12 base agents exist;
- required templates exist;
- Godot, Unity, and Unreal engine configs are valid;
- engine aliases are unique and normalize correctly;
- generated project config is schema-valid;
- active-agent mode selection matches the contract;
- engine source root exists under `source/project-<slug>/`;
- expected engine project file exists;
- project-specific agents are materialized;
- project `AGENTS.md` exists, includes provenance markers, and its `source-config-sha256` matches the operational-field-omitting guidance hash;
- market overview exists and configured competitor names are preserved in project config;
- starter GDD and milestone/timeline artifacts exist, including schema-valid config milestones and timeline document sections;
- `status` and `resume` report status without mutating the project;
- mutating project-management commands such as `freeze` and `new` are verified only against disposable test fixtures, not by normal `validate --project` on a user project;
- CLI/help surfaces do not expose future-only `next`, `--exec`, telemetry, parallel orchestration, or hard ownership enforcement;
- validation itself fails hard when a check fails.

## Parity Acceptance Criteria

The clean parity contract is satisfied when all are true:

- TypeScript package builds.
- Typecheck passes.
- Tests pass.
- `opengamestudio init` can create Godot, Unity, and Unreal projects.
- Each generated engine project validates.
- All 12 base agents exist and can be materialized for a project.
- Materialized prompts include the selected engine's prompt-overlay content, not just generic engine text.
- Project-specific `AGENTS.md`, materialized `master_orchestrator`, and handoff guidance are generated without a separate `project_orchestrator.md` file.
- Market and analytics templates are present and reachable by agents.
- Project management supports status, new/init, resume, and freeze. `menu` and `startover` are intentional omissions.
- Package scripts preserve init/manage/test discoverability; separate wrapper files are optional known differences.
- Package metadata declares the Node runtime floor, `npm pack` includes `dist/`, `engine_configs/`, `agents/base/`, and `templates/`, and a temp-installed package bin can load those assets from outside the repo.
- Validation exits non-zero on failures.
- No parity claim appears until the above checks pass.

---

# Part 2: Codex-Native Improvements

These are improvements over upstream that are useful for a Codex-native port, but they should remain bounded and should not crowd out parity work.

## Canonical TypeScript CLI

`opengamestudio` is the canonical public interface. Npm scripts should call into it. Separate script wrappers are optional and should be avoided unless they provide clear compatibility value.

Recommended core commands:

```bash
opengamestudio init
opengamestudio status
opengamestudio resume --project projects/my-game
opengamestudio freeze --project projects/my-game
opengamestudio validate
opengamestudio run <agent> --project projects/my-game --task "..."
```

## Codex Runner

Upstream relies on users manually telling an AI CLI which project and agent files to read. The Codex-native port should add a bounded runner that assembles a structured prompt packet for one agent and one task.

Default `opengamestudio run <agent> --project <path> --task <text>` behavior:

- assemble one structured prompt packet;
- write prompt cache and minimal metadata;
- print the exact prompt path and next manual/Codex command;
- not execute Codex or modify project artifacts beyond the prompt cache.

`opengamestudio run` should:

- load one selected agent;
- load the project config summary;
- load the selected engine overlay;
- load only task-relevant templates;
- include explicit output paths;
- include a validation command;
- write a prompt cache;
- print the prompt path and next command for the user.

Runner flags:

```bash
--print-prompt
--dry-run
--include-artifact <relative-path>
--allow-broad-context
```

Flag semantics:

- `--print-prompt`: print the deterministic prompt body only.
- `--dry-run`: print selected context files, output paths, validation command, prompt cache path, and metadata path without executing Codex.
- `--include-artifact <relative-path>`: explicitly include one prior artifact under the project root; reject absolute paths and traversal outside the project.
- `--allow-broad-context`: explicitly opt in to broader project context discovery. Without this flag, the runner must not scan or include broad project artifacts.
- `--exec`: future-only. Do not implement direct Codex execution until command quoting, working-directory behavior, timeouts, failure handling, and write-scope rules are designed.

The runner must not load all agents, all templates, or unrelated project artifacts by default.

Initial runner acceptance guardrails:

- metadata records `prompt_chars` for every prepared run;
- dry-run output lists every included context file;
- tests prove a single-agent run does not include unrelated agents;
- tests prove a single-agent run does not include all templates;
- tests prove named prior artifacts are included only when explicitly requested;
- broad project reads require an explicit opt-in flag and are not used by default.

## Prompt Cache and Minimal Metadata

Every dry run or printed prompt should write:

```text
projects/<slug>/.gamestudio/runs/<run-id>-<agent>/prompt.md
projects/<slug>/.gamestudio/runs/<run-id>-<agent>/metadata.json
```

Minimal metadata is enough:

```json
{
  "timestamp": "...",
  "project": "projects/my-game",
  "agent": "market_analyst",
  "task": "Create the first market overview",
  "prompt_chars": 12345,
  "prompt_cache_path": "projects/my-game/.gamestudio/runs/<run-id>-<agent>/prompt.md"
}
```

This is not telemetry. Do not add changed-file tracking, runtime metrics, token estimates, productivity comparisons, or JSONL telemetry in the initial implementation.

## Project-Level AGENTS.md

Project-level `AGENTS.md` is a Codex-native replacement/addition for upstream's project-specific agent context.

`src/agents.ts` should own project `AGENTS.md` generation.

Project `AGENTS.md` must be a compact index and rules file, not a full prompt bundle. It should include project identity, engine/mode, validation commands, pointers to materialized agent prompts, and critical repo-local rules. It must not embed operational status, all agent prompts, all templates, full market docs, or run history. Those belong in config or explicit runner-selected context files.

Generated files must include provenance markers so validation can prove they came from the generator:

```md
<!-- generated-by: open-gamestudio src/agents.ts schema=1.0 -->
<!-- source-config-sha256: <hash> -->
```

The hash is computed from the canonical project-config serialization with operational fields such as `project.status` omitted. Therefore `freeze` may update status without regenerating project `AGENTS.md`; non-operational config changes must stale the hash and fail validation until regeneration.

## Bounded Context Loading

The main performance win should come from scoped prompt packets, not from adding a large orchestration system.

Default context for an agent run:

- one base/materialized agent;
- one project config summary;
- one engine overlay;
- task-relevant templates;
- named prior artifacts only when explicitly requested.

Broader project reads must be opt-in.

Bounded-context validation should check the generated prompt packet, not only source code. A regression that accidentally includes all agents, all templates, or broad project artifacts is a performance bug even if functional tests still pass.

---

# Part 3: Future Optional Layer

These features are not present upstream and are not required for the initial implementation. They should stay out of the first build unless explicitly requested later. First-build validation/docs must include explicit absence checks: no `opengamestudio next`, no `run --exec`, no telemetry command/files, no parallel orchestration surface, and no hard ownership-enforcement behavior.

## Planner / `next`

A real `opengamestudio next` can be useful, but it is easy to overbuild and easy to make stale recommendations.

Until project state, validation, run metadata, and handoff summaries are mature, the CLI should print simple static next-step suggestions rather than pretending to have a planner.

Future planner inputs may include:

- project phase;
- missing required artifacts;
- last validation status;
- run metadata;
- handoff summaries;
- output ownership.

## Telemetry

A future telemetry layer may record:

- prompt size trends;
- estimated token count;
- elapsed runtime;
- validation results;
- changed files;
- handoff paths;
- suggested next task;
- productivity comparisons.

This is not needed for the initial implementation. Minimal run metadata is enough.

## Direct Codex Execution

Future `--exec` support may spawn `codex exec`, but the initial runner should only prepare prompt packets and print commands.

Before direct execution is added, the design should define:

- command quoting rules;
- working-directory behavior;
- failure handling;
- timeout behavior;
- whether Codex can edit files outside declared output paths.

## Parallel Orchestration

Parallel Hermes/subagent execution is a future optimization only.

It requires mature ownership metadata and validation. Until then, workflows should be serial by default.

Future parallel execution must require disjoint ownership sets such as:

```yaml
agent: market_analyst
may_write:
  - resources/market-research/**

agent: data_scientist
may_write:
  - documentation/technical/analytics/**
```

If ownership overlaps, parallel execution must be rejected.

## Output Ownership Enforcement

Initial prompts can include suggested output paths, but hard ownership enforcement can wait.

Future enforcement may validate that generated changes stay inside `may_write` globs and avoid `must_not_write` globs.

## Performance Optimization Metrics

Prompt-size budgets, token estimates, artifact summarization, and run-history compression are future optimization work.

They should be added only after the parity workflow exists and real prompt sizes are measurable.

---

# Final Scope Summary

## Preserve From Upstream Now

```text
Godot / Unity / Unreal
12 agents
project-specific agent materialization
project init
market overview/seeds and templates
project config and milestones
status / new / resume / freeze
init / manage / test package discoverability
hard-failing validation
```

## Add as Bounded Codex Improvements

```text
canonical open-gamestudio CLI
project AGENTS.md
bounded run command
prompt cache
minimal metadata
scoped context loading
prompt context guardrails
```

## Keep Future-Only

```text
planner / next
telemetry
changed-file tracking
direct Codex execution
parallel orchestration
ownership enforcement
performance optimization metrics
```
