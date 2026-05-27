# Codex-Native Game Studio Port Implementation Plan

> **For Hermes:** Use `subagent-driven-development` to implement this plan task-by-task. Keep each implementation step small, commit after each phase, and do not claim parity until the final hard-failing validation gate is green.

**Goal:** Port `pamirtuna/gamestudio-subagents` into `open-gamestudio` as a Codex-native TypeScript/Node game-studio agent toolkit with clean user-facing parity and bounded Codex workflow improvements.

**Architecture:** Build a TypeScript/Node CLI around typed registries, Zod schemas, file-backed agent prompts, engine configs, project-specific prompt materialization, compact project `AGENTS.md`, hard-failing validation, and a deterministic prompt-cache runner. Preserve upstream outcomes, not legacy Python internals.

**Tech Stack:** Node.js, TypeScript, `package.json`, `tsconfig.json`, `vitest`, `zod`, `commander` or `cac`, `tsx`, JSON configs, Markdown prompts/templates.

**Decision:** This is a TypeScript rewrite only. Do not add Python package metadata, Python runtime assumptions, duplicated wrapper logic, telemetry, direct Codex execution, planner logic, ownership enforcement, or parallel orchestration in the first implementation.

---

## Scope Contract From `research/codex-port-design.md`

### Preserve Now

- Godot, Unity, and Unreal Engine support.
- All 12 upstream studio agent roles.
- Project-specific agent materialization under `projects/<slug>/.gamestudio/agents/`.
- Project initialization with engine files, config, market overview/seed, GDD/starter docs, milestones/timeline, and project `AGENTS.md`.
- Project management equivalents for `status`, `new`/`init`, `resume`, and `freeze`.
- Template categories: GDD, feature spec, handoff, analytics setup, engine setup, market analysis, and project config.
- Package-level discoverability for `init`, `manage`, `test`, and `validate`.
- Hard-failing validation: any failed check must produce a non-zero exit.

### Intentional Differences / Do Not Implement

- No Python package or Python command aliases.
- No interactive `menu` flow.
- No `startover` command.
- No separate generated `project_orchestrator.md`; preserve orchestration through project `AGENTS.md`, the materialized `master_orchestrator`, and handoff templates/docs.
- No exact `template_info.md` parity; use a typed template registry and/or `open-gamestudio templates` discoverability.
- No eager full competitor reports during init; init records competitor names in config and creates a market overview/seed only.
- No upstream license/authorship/citation parity documents; use this repository's own licensing policy.
- No duplicate script-wrapper implementation. If wrappers are added later, they must be thin pass-throughs to the canonical CLI and must not own logic.

### Future-Only / Excluded From First Build

- `open-gamestudio next` planner.
- Telemetry, JSONL runtime metrics, changed-file tracking, productivity comparisons, or token estimates.
- Direct `codex exec` spawning via `--exec`.
- Parallel Hermes/subagent orchestration.
- Hard output-ownership enforcement.
- Prompt-size budgets, artifact summarization, and run-history compression.

---

## Initial Planned File Map

Create or update these files during the first implementation:

- `AGENTS.md`: repo-wide Codex guidance and Node validation commands.
- `package.json`: package metadata, bin entry, dependencies, and required scripts.
- `tsconfig.json`: strict TypeScript typecheck configuration for NodeNext across `src/**/*.ts` and `tests/**/*.ts`.
- `tsconfig.build.json`: build-only TypeScript configuration that emits `src/cli.ts` to `dist/cli.js`.
- `src/cli.ts`: canonical `open-gamestudio` CLI with built-bin shebang support and commands for `init`, `new`, `status`, `resume`, `freeze`, `validate`, `run`, and `templates list/show`.
- `src/paths.ts`: runtime path helpers that separate package assets from project paths.
- `src/config.ts`: Zod project-config schemas, JSON I/O, slug helpers, active-agent mode helpers.
- `src/engines.ts`: engine registry, alias normalization, source-root/project-file generation, and project display-name/class-name helpers.
- `src/templates.ts`: typed template registry, required-section metadata, and template discovery helpers for `templates list/show`.
- `src/agents.ts`: role registry, prompt materialization, active-agent selection, project `AGENTS.md` generation.
- `src/projects.ts`: project initialization and project-management commands.
- `src/runner.ts`: deterministic prompt assembly, prompt cache writing, minimal metadata writing, dry-run/print-prompt behavior.
- `src/validation.ts`: hard-failing repo and project validation.
- `agents/base/*.md`: 12 Codex-native base agent prompts.
- `engine_configs/godot.json`, `engine_configs/unity.json`, `engine_configs/unreal.json`: canonical engine configs.
- `templates/gdd_template.md`
- `templates/feature_spec_template.md`
- `templates/handoff_template.md`
- `templates/analytics_setup_template.md`
- `templates/engine_setup_template.md`
- `templates/market_analysis_template.md`
- `templates/project_config_template.json`
- `tests/engine-system.test.ts`
- `tests/project-workflow.test.ts`
- `tests/agents-templates.test.ts`
- `tests/runner-prompts.test.ts`
- `tests/validation.test.ts`
- `docs/known-upstream-differences.md`
- `docs/migration-from-claude.md`
- `docs/setup.md`
- `docs/examples.md`
- `docs/development-rules.md`
- `docs/system-verification.md`
- `docs/workflow-validation.md`
- `CONTRIBUTING.md` or `docs/contributing.md`

Do **not** create `src/telemetry.ts`, `docs/parallel-orchestration.md`, script wrappers, `template_info.md`, generated `project_orchestrator.md`, or Python compatibility files in the initial implementation.

---

## Phase 0: Baseline and Scope Guardrails

All commands in this plan assume the repository root is `/opt/data/repos/open-gamestudio`. Each agent handoff must start by changing to that directory before running relative commands so checks do not mutate or validate the wrong repository.

- [ ] Confirm the destination is a valid git worktree before using commit checkpoints.

Run:

```bash
cd /opt/data/repos/open-gamestudio
git rev-parse --is-inside-work-tree
git status --short
git config --global user.name
git config --global user.email
```

Expected:

- `git rev-parse --is-inside-work-tree` prints `true`.
- Git identity is available or intentionally out of scope.
- Existing local changes are understood before implementation starts.

- [ ] Record legacy baseline and intentional differences in `docs/known-upstream-differences.md`.

Include:

- Legacy engine-system checks only partially pass while still reporting success.
- Legacy folder-structure checks and project-file path expectations differ from the desired `source/project-<slug>/` contract.
- Legacy Unreal naming uses multiple labels that must normalize to canonical `unreal`.
- Legacy validation depends on Python/shell assumptions; the TypeScript port uses Node tooling only.
- Intentional omissions: `menu`, `startover`, `project_orchestrator.md`, exact `template_info.md`, eager competitor reports, and upstream license/authorship/citation parity.

Validation:

```bash
git diff -- docs/known-upstream-differences.md
```

Commit checkpoint:

```bash
git add docs/known-upstream-differences.md
git commit -m "docs: record legacy parity baseline"
```

---

## Phase 1: TypeScript Package Skeleton and Repo Guidance

- [ ] Create `package.json`.

Required minimum content:

```json
{
  "name": "open-gamestudio",
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "files": [
    "dist/",
    "engine_configs/",
    "agents/base/",
    "templates/"
  ],
  "bin": {
    "open-gamestudio": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "validate": "npm run build --silent && node dist/cli.js validate",
    "init": "npm run build --silent && node dist/cli.js init",
    "manage": "npm run build --silent && node dist/cli.js status",
    "templates": "npm run build --silent && node dist/cli.js templates"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

`cac` may replace `commander` if used consistently. The public package scripts must preserve `init`, `manage`, `test`, `validate`, and template discoverability while exercising the built CLI path via `node dist/cli.js`, not `tsx src/cli.ts` and not a bare self-bin call. A package's own `bin` name is not guaranteed to be on `PATH` inside its own npm scripts before install/link. Built packages expose `open-gamestudio` through `bin`, and verification must prove both direct built-CLI usage (`node dist/cli.js ...`) and installed package-bin usage from a temporary non-repo cwd. The package manifest must ship runtime assets through `files` or an equivalent publish manifest: `dist/`, `engine_configs/`, `agents/base/`, and `templates/`.

- [ ] Install dependencies and commit the lockfile.

Run:

```bash
npm install
```

Expected:

- `node_modules/` is available for local validation.
- `package-lock.json` is created or updated and included in the package-skeleton commit.

- [ ] Create `tsconfig.json` and `tsconfig.build.json`.

Required `tsconfig.json` settings:

- `target`: `ES2022`
- `module`: `NodeNext`
- `moduleResolution`: `NodeNext`
- `strict`: `true`
- include `src/**/*.ts` and `tests/**/*.ts`
- no `outDir` requirement and no emit during `npm run typecheck`

Required `tsconfig.build.json` settings:

- `extends`: `./tsconfig.json`
- `compilerOptions.rootDir`: `src`
- `compilerOptions.outDir`: `dist`
- `compilerOptions.noEmit`: `false`
- include `src/**/*.ts` only
- exclude `tests/**/*.ts`

This split is required because `package.json` points the package bin and scripts at `dist/cli.js`. With `rootDir: "."` and tests included in the emitting config, TypeScript would emit `src/cli.ts` as `dist/src/cli.js`, breaking `node dist/cli.js` and the package bin.

- [ ] Create root `AGENTS.md`.

Required guidance:

- Use `npm run validate` before any parity claim.
- Because this project uses `"type": "module"`, `module: "NodeNext"`, and `moduleResolution: "NodeNext"`, every relative TypeScript import must use the emitted `.js` specifier: write `import { x } from "./config.js"`, never `import { x } from "./config"`.
- For local development before install/link, use `npm run ...` scripts. Use `npm exec open-gamestudio -- ...` only after build/link/install or inside the package-bin smoke fixture. Bare `open-gamestudio ...` is only guaranteed after package install/link.
- Package scripts build first and then exercise the built CLI through `node dist/cli.js`; use `npm run init -- ...`, `npm run manage -- ...`, `npm run templates -- list`, and `npm run validate -- ...`.
- Keep generated game projects under `projects/<slug>/`.
- Do not load all agents or all templates for a single role task.
- State that `src/agents.ts` is the single owner for generated project `AGENTS.md`.
- State that direct Codex execution, telemetry, and parallel orchestration are future-only.

- [ ] Create placeholder TypeScript modules.

Files:

- `src/cli.ts` with a portable Node shebang; it registers commander/cac commands and delegates to source modules. It must not shell out to `dist/cli.js`, depend on already-built output, or create a second implementation path. Package scripts are what invoke the built `dist/cli.js`.
- `src/paths.ts` with package/project path helpers
- `src/config.ts`
- `src/engines.ts`
- `src/templates.ts`
- `src/agents.ts`
- `src/projects.ts`
- `src/runner.ts`
- `src/validation.ts`

Validation:

```bash
npm run typecheck
npm test
```

Expected:

- Placeholder modules compile.
- Initial or placeholder tests pass.
- `src/cli.ts` is written so compiled `dist/cli.js` has a portable Node shebang and can be executed as the package bin.

- [ ] Define runtime path resolution in `src/paths.ts` before any file-loading code depends on paths.

Required exports:

```ts
export function packageRoot(metaUrl?: string): string;
export function packageAssetPath(relativePath: string): string;
export function resolveProjectRoot(input?: string, cwd?: string): string;
```

Contract:

- Package assets (`engine_configs/`, `agents/base/`, and `templates/`) are resolved from the installed package root, not from `process.cwd()`.
- `packageRoot(import.meta.url)` for built files under `dist/` resolves to the directory containing this package's `package.json`. Implement it by walking upward from `fileURLToPath(import.meta.url)` until it finds `package.json` with `name: "open-gamestudio"`; do not assume a fixed `../` from `dist/`, and fail clearly if the package root cannot be found.
- `packageAssetPath("templates/gdd_template.md")` resolves beside the package assets even when the CLI is invoked from a subdirectory or through npm bin.
- Project paths are resolved from explicit `--project` when provided, otherwise from the current working directory only for commands whose documented default is “current project”.
- Package-asset loading and project-artifact loading must remain separate in code and tests.
- Tests must simulate a subdirectory invocation so installed/package-bin behavior cannot silently depend on repository-root cwd.
- CLI black-box tests that execute `dist/cli.js` or the package bin must run `npm run build` first or build in test setup. Source-module tests may run without a build, but they do not replace built-CLI/package-bin smoke tests.

Commit checkpoint:

```bash
git add AGENTS.md package.json package-lock.json tsconfig.json tsconfig.build.json src tests
git commit -m "chore: scaffold codex-native node package"
```

---

## Phase 2: Engine Registry and Clean Engine Contract

- [ ] Create engine config files.

Files:

- `engine_configs/godot.json`
- `engine_configs/unity.json`
- `engine_configs/unreal.json`

Each config must include:

- `id`
- `display_name`
- `aliases`
- `default_version`
- `source_root_pattern`
- `folders`
- `project_files`
- `best_practices`
- `agent_specializations` or equivalent prompt-overlay data

- [ ] Implement `src/engines.ts`.

Required exports:

```ts
export type EngineId = "godot" | "unity" | "unreal";
export type EngineConfigRegistry = Record<EngineId, EngineConfig>;
export function loadEngineConfigs(configDir: string): EngineConfigRegistry;
export function normalizeEngine(value: string, registry: EngineConfigRegistry): EngineId;
export function sourceRoot(projectRoot: string, projectSlug: string): string;
export function projectClassName(displayNameOrSlug: string): string;
export function unrealProjectFileName(displayNameOrSlug: string): string;
export function createEngineFolders(input: EngineCreateInput): string[];
export function createEngineProjectFiles(input: EngineCreateInput): string[];
```

Contract:

- All engine source roots are under `source/project-<slug>/`.
- `Unreal`, `Unreal Engine`, `unreal`, and `ue5` normalize to `unreal`.
- Unreal display output remains `Unreal Engine`.
- Unreal `.uproject` filenames use `projectClassName(nameOrSlug) + ".uproject"`.
- `projectClassName` splits on non-alphanumeric boundaries, converts words to PascalCase, strips punctuation, prefixes `Game` when the result would start with a digit, and fails clearly when no alphanumeric characters remain. Examples: `projectClassName("Test Game") === "TestGame"`, `projectClassName("codex-unreal-smoke") === "CodexUnrealSmoke"`, and `projectClassName("2d arena") === "Game2dArena"`.
- If two different input names normalize to the same slug/class name in the same parent directory, initialization must fail with a collision message rather than overwrite.
- Unknown engines fail clearly before folder or project-file generation.
- Unity creates `Packages/manifest.json` plus `ProjectSettings/ProjectSettings.asset` or another documented project-settings marker.

- [ ] Write `tests/engine-system.test.ts`.

Minimum tests:

- All engine configs parse through Zod.
- Alias normalization resolves Godot, Unity, and Unreal variants.
- Unknown engine input fails with a clear error.
- Folder creation accepts `projectSlug` and does not require omitted positional args.
- Godot creates `source/project-test-game/project.godot`.
- Unity creates `source/project-test-game/Packages/manifest.json` and the documented settings marker.
- Unreal creates `source/project-test-game/TestGame.uproject`.
- Unreal class-name generation is tested for `"Test Game" -> "TestGame"`, `"codex-unreal-smoke" -> "CodexUnrealSmoke"`, punctuation, digits, empty/invalid names, and same-directory collisions.
- No test expects direct project files under bare `source/`.

Validation:

```bash
npm test -- tests/engine-system.test.ts
npm run typecheck
```

Expected:

- All engine tests pass.
- Engine contracts are independent of legacy naming/path bugs.

Commit checkpoint:

```bash
git add engine_configs src/engines.ts tests/engine-system.test.ts
git commit -m "feat: add canonical engine registry"
```

---

## Phase 3: Schemas, Templates, Agents, and Project `AGENTS.md`

Execution note: do not dispatch this whole phase as one coding-agent task. Split it into red/green slices in this order: config schema tests and implementation; template registry tests and implementation; base-prompt content tests and prompts; active-agent selection tests and implementation; project `AGENTS.md` provenance tests and implementation.

- [ ] Implement `src/config.ts`.

Required behavior:

- `slugify("My Game") === "my-game"`.
- Use Zod to validate versioned `project-config.json`.
- Preserve project fields: name, slug, concept, genre, platform, audience, competitors, monetization, timeline, engine, engine version, mode, phase, and status.
- Preserve milestone parity with a schema-validated `production.milestones` array plus a generated timeline document; do not rely on a vague timeline string alone.
- Preserve team/active agent information.
- Provide `activeAgentsForMode(mode)` with the design contract: always-on agents plus mode-specific agents.
- Provide `canonicalProjectConfigJson(config, options?)`: recursively sort object keys, preserve array order, format with two-space indentation, normalize to LF, and add exactly one trailing newline.
- Provide `guidanceConfigHash(config)`: SHA-256 over `canonicalProjectConfigJson(config, { omitOperationalFields: true })`, where operational fields include `project.status` and any future validation timestamps/run-state fields. This keeps `freeze` from making generated `AGENTS.md` stale when it changes only status.

Minimum config shape:

```json
{
  "schema_version": "1.0",
  "project": {
    "name": "Test Game",
    "slug": "test-game",
    "concept": "A focused test concept",
    "genre": "Puzzle",
    "platform": "PC",
    "audience": "Players who like compact strategy games",
    "competitors": ["mini-metro", "dorfromantik"],
    "monetization": "premium",
    "timeline": "8 weeks",
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

Canonical serialization tests must prove semantically identical objects with different key insertion orders produce the same hash, while meaningful non-operational changes change the hash. `freeze`/status-only changes must not change `guidanceConfigHash`.

- [ ] Create templates and implement `src/templates.ts`.

Required template files:

- `templates/gdd_template.md`
- `templates/feature_spec_template.md`
- `templates/handoff_template.md`
- `templates/analytics_setup_template.md`
- `templates/engine_setup_template.md`
- `templates/market_analysis_template.md`
- `templates/project_config_template.json`

Required lightweight template contract:

- Markdown templates include testable sections such as `# Purpose`, `# Inputs`, `# Outputs`, and `# Validation` where applicable.
- `project_config_template.json` parses as JSON and conforms to the Zod project-config schema or documented template placeholder schema.
- Template registry metadata records required sections so tests can validate content quality.

Required behavior:

- Expose a typed registry of template IDs, categories, file paths, intended agent roles, and selection tags.
- Use exact canonical template IDs: `gdd`, `feature_spec`, `handoff`, `analytics_setup`, `engine_setup`, `market_analysis`, and `project_config`.
- Define deterministic agent/task-to-template selection rules:
  - every prompt-run may include `handoff` only when the task asks for handoff/coordination output;
  - `market_analyst` selects `market_analysis`;
  - `data_scientist` selects `analytics_setup`;
  - designer roles select `gdd` and `feature_spec` when the task mentions design/spec work;
  - engine/project setup tasks select `engine_setup` and `project_config`;
  - `qa_agent` selects no content template by default beyond validation guidance unless the task explicitly asks for a spec review.
- Support CLI discoverability through explicit built-CLI commands: `open-gamestudio templates list` and `open-gamestudio templates show <template-id>`.
- Do not create or require exact `template_info.md` parity.
- Validation knows the canonical template paths, categories, and required lightweight sections/frontmatter for each template.

- [ ] Create 12 Codex-native base prompts in `agents/base/`.

Files:

- `agents/base/master_orchestrator.md`
- `agents/base/producer_agent.md`
- `agents/base/market_analyst.md`
- `agents/base/data_scientist.md`
- `agents/base/sr_game_designer.md`
- `agents/base/mid_game_designer.md`
- `agents/base/mechanics_developer.md`
- `agents/base/game_feel_developer.md`
- `agents/base/sr_game_artist.md`
- `agents/base/technical_artist.md`
- `agents/base/ui_ux_agent.md`
- `agents/base/qa_agent.md`

Each prompt must include lightweight, testable sections so validation proves prompt usefulness rather than file existence only:

- `# Role` with role responsibilities;
- `# Inputs` with expected inputs;
- `# Outputs` with expected outputs;
- `# Output Paths` or explicit output conventions;
- `# Validation` with the validation command;
- `# Engine Notes` with engine-specific adaptation placeholder;
- `# Rules` with rule-compliance reminder.

- [ ] Implement `src/agents.ts`.

Required behavior:

- Validate exactly the 12 required agent names.
- Select active agents by mode:
  - always: `master_orchestrator`, `producer_agent`, `market_analyst`, `data_scientist`
  - design: add `sr_game_designer`, `mid_game_designer`, `sr_game_artist`
  - prototype: add `sr_game_designer`, `mechanics_developer`, `qa_agent`
  - development: add `sr_game_designer`, `mid_game_designer`, `mechanics_developer`, `game_feel_developer`, `qa_agent`, `sr_game_artist`, `technical_artist`, `ui_ux_agent`
- Materialize project prompts by reading the base prompt and injecting project summary, engine overlay, mode, and output guidance.
- Write materialized prompts under `projects/<slug>/.gamestudio/agents/`.
- Generate compact project `AGENTS.md` as the only project-level Codex guidance file.
- Add provenance markers to generated project `AGENTS.md` and compute the hash with `guidanceConfigHash(config)`, not raw file bytes:

```md
<!-- generated-by: open-gamestudio src/agents.ts schema=1.0 -->
<!-- source-config-sha256: <hash> -->
```

- Do not generate `project_orchestrator.md`.
- Do not embed all prompts, all templates, full market docs, run history, or operational status in project `AGENTS.md`. Regenerate or fail validation when `source-config-sha256` does not match the current guidance hash. A status-only `freeze` update must not make the hash stale.

- [ ] Write `tests/agents-templates.test.ts`.

Minimum tests:

- All 12 base prompts exist.
- Active-agent selection matches design/prototype/development contracts.
- Template registry includes all required categories.
- `open-gamestudio templates list` lists all template IDs and categories.
- `open-gamestudio templates show gdd` prints the correct template metadata/path.
- Template selection tests cover the canonical IDs and the deterministic agent/task selection rules above.
- Required template files contain their required lightweight sections/frontmatter.
- No `template_info.md` is required.
- Materialized prompts include project summary, role guidance, and engine-specific overlay text from the selected engine config; missing overlay content fails tests.
- Project `AGENTS.md` includes provenance markers and pointers to materialized agents.
- Project `AGENTS.md` does not embed all agent prompts or all templates.
- Recomputed `source-config-sha256` matches `guidanceConfigHash(config)`, stale hashes fail validation/tests, and status-only `freeze` changes do not stale the hash.
- No generated `project_orchestrator.md` exists.

Validation:

```bash
npm run build
npm test -- tests/agents-templates.test.ts
npm run typecheck
```

Expected:

- Agent and template registry tests pass.
- Project guidance generation is compact and provenance-verifiable.

Commit checkpoint:

```bash
git add src/config.ts src/templates.ts src/agents.ts agents templates tests/agents-templates.test.ts
git commit -m "feat: add schemas templates and studio agents"
```

---

## Phase 4: Project Initialization and Management

Execution note: do not dispatch this whole phase as one coding-agent task. Split it into red/green slices: init config/folders; engine file creation through `src/engines.ts`; starter docs/market seed; agent materialization and project `AGENTS.md`; status/resume read-only commands; `new` delegation; `freeze` state update.

- [ ] Implement `src/projects.ts`.

Required initialization behavior for `open-gamestudio init` / `open-gamestudio new`:

Non-interactive CLI contract:

- Required flags: `--name`, `--engine`, `--mode`, and `--non-interactive`.
- Optional config flags: `--concept`, `--genre`, `--platform`, `--audience`, repeated `--competitor <name>`, `--monetization`, `--timeline`, and `--engine-version`.
- Deterministic defaults for omitted optional fields in `--non-interactive` mode: `concept: "<name> concept"`, `genre: "Unspecified"`, `platform: "PC"`, `audience: "General players"`, `competitors: []`, `monetization: "undecided"`, `timeline: "TBD"`, and engine default version from the engine registry.
- Deterministic milestone defaults in `--non-interactive` mode: create at least one schema-valid planned milestone derived from `--timeline` or `"TBD"`, so milestone parity does not depend on free-text timeline only.
- Interactive prompts may collect richer values later, but tests must assert the non-interactive defaults exactly so generated config is reproducible.

- Create `projects/<slug>/`.
- Create `project-config.json` with schema-valid fields and `status: "active"`.
- Create engine folders/files through `src/engines.ts`.
- Create `documentation/design/gdd.md` or equivalent starter GDD.
- Create `documentation/production/timeline.md` or equivalent milestones/timeline artifact with validated sections: `# Timeline`, `# Milestones`, `# Risks`, and `# Next Validation Gate`.
- Create `resources/market-research/market-overview.md` as a seed/overview.
- Record competitor names in project config.
- Do not generate full per-competitor reports during init.
- Create project `.gitignore` if useful.
- Materialize project-specific agent prompts through `src/agents.ts`.
- Generate project `AGENTS.md` through `src/agents.ts`.

The common folder set may be simplified if not user-facing, but must preserve source, documentation, market research, QA/build areas when they are part of upstream workflow outcomes or validation.

Required management behavior:

- `status`: read-only summary of project config, phase/status, active agents, and latest validation state if available.
- `new`: alias or guided wrapper for `init`; it must not create a second project-creation path.
- `resume`: read-only continuation summary with the next suggested manual command; it must not run agents.
- `freeze`: change only `project.status` to frozen/inactive without deleting source, docs, run history, or prompts. Because `project.status` is omitted from `guidanceConfigHash`, this status-only change must not require regenerating project `AGENTS.md` and must not make validation fail for a stale hash.
- `menu`: omitted.
- `startover`: omitted.

Required CLI examples:

```bash
npm run init -- --name "Test Game" --engine godot --mode prototype --non-interactive
npm run manage -- --project projects/test-game
npm exec open-gamestudio -- status --project projects/test-game
npm exec open-gamestudio -- new --name "Test Game 2" --engine unity --mode design --non-interactive
npm exec open-gamestudio -- resume --project projects/test-game
npm exec open-gamestudio -- freeze --project projects/test-game
```

- [ ] Write `tests/project-workflow.test.ts`.

Minimum tests:

- `init` creates expected config/docs/source root/market seed/project agents/project `AGENTS.md`.
- `init --non-interactive` populates every required config field using provided flags or the deterministic defaults above.
- Starter GDD and milestone/timeline artifacts exist at the documented paths or explicitly documented equivalents, and timeline docs contain the required sections.
- Project config includes schema-valid `production.milestones`; missing/empty milestone data fails tests.
- Godot, Unity, and Unreal initialization all create the expected engine project files.
- Competitor names are preserved in config.
- Init does not create eager per-competitor reports.
- `new` delegates to the same creation path as `init`.
- `status` prints phase/status/mode/engine/active agents.
- `resume` prints a continuation summary and suggested manual next command without running agents.
- `freeze` changes only status without deleting source/docs/prompts and without staling the project `AGENTS.md` guidance hash.
- CLI help or tests prove `menu` and `startover` are not implemented.
- Project-management behavior is covered by workflow tests and read-only validation checks: `status` and `resume` are read-only under `validate --project`; `new` delegates to `init` and `freeze` changes only status in disposable fixture tests.

Validation:

```bash
npm run build
npm test -- tests/project-workflow.test.ts
npm run typecheck
```

Expected:

- Project workflow tests pass locally with Node tooling only.

Commit checkpoint:

```bash
git add src/projects.ts src/cli.ts tests/project-workflow.test.ts package.json
git commit -m "feat: add project initialization and management"
```

---

## Phase 5: Hard-Failing Validation

- [ ] Implement `src/validation.ts`.

Required result shape:

```ts
type CheckStatus = "pass" | "fail" | "skip";

type ValidationCheck = {
  id: string;
  status: CheckStatus;
  message: string;
  path?: string;
};
```

Exit behavior:

```text
any fail -> exit 1
no fail -> exit 0
skip -> allowed only for explicitly documented non-parity checks
```

Required repo checks:

- `package.json` has required `init`, `manage`, `test`, `validate`, and `templates` scripts, `build` uses `tsconfig.build.json`, the package bin points to `./dist/cli.js`, and user-facing scripts exercise the built CLI path.
- `package.json` declares a Node runtime floor such as `"engines": { "node": ">=20" }` and a package shipping contract that includes `dist/`, `engine_configs/`, `agents/base/`, and `templates/`.
- `tsconfig.build.json` emits `src/cli.ts` to `dist/cli.js`; tests must fail if the build would only produce `dist/src/cli.js`.
- Required source modules exist, including `src/paths.ts`.
- Relative TypeScript imports use NodeNext-compatible emitted `.js` specifiers.
- Runtime package-asset resolution works from a subdirectory invocation and does not depend on `process.cwd()` for `engine_configs/`, `agents/base/`, or `templates/`.
- `npm pack --json` output includes the built CLI and runtime asset directories, and an installed-package smoke test proves the package bin can load templates/engine configs from a temporary non-repo cwd.
- All 12 base agents exist.
- Required templates exist and registry maps to real files.
- Godot, Unity, and Unreal engine configs are valid.
- Engine aliases are unique and normalize correctly.
- No required parity artifact depends on Python files.
- Future-only features are documented as out of scope and are not implemented by this plan. During Phase 5, absence proof is limited to CLI/help tests plus already-existing scope docs such as this research plan and `docs/known-upstream-differences.md`; final user docs are added in Phase 7. Do not add a broad validator that hard-fails on every future-scope filename; instead, tests and docs should prove the shipped CLI/help does not expose `next`, `--exec`, telemetry commands/files, parallel orchestration surfaces, or ownership-enforcement behavior in the first build.

Required read-only project checks when `--project` is provided:

`open-gamestudio validate --project <real-project>` must not mutate the project. It may inspect `status` and `resume` behavior for read-only reporting, but mutating `freeze` and `new` checks belong in disposable test fixtures, not normal project validation.

- Project config is schema-valid.
- Project config includes audience, competitors, monetization, timeline, mode, phase, status, active agents, and schema-valid `production.milestones`.
- Active-agent selection matches the configured mode.
- Engine source root exists under `source/project-<slug>/`.
- Expected engine project file exists.
- Project-specific agents are materialized.
- Project `AGENTS.md` exists, includes provenance markers, and has a recomputed `source-config-sha256` matching `guidanceConfigHash(config)`.
- Market overview/seed exists and competitor names are preserved in project config.
- Starter GDD and milestone/timeline artifacts exist at the documented paths or explicitly documented equivalents, and timeline docs include `# Timeline`, `# Milestones`, `# Risks`, and `# Next Validation Gate`.
- No eager competitor reports are required by validation.
- No generated `project_orchestrator.md` is required or produced.
- `status` reports project config/phase/status without modifying files.
- `resume` reports a continuation summary and suggested manual command without running agents or modifying files.
- Normal project validation does not call mutating commands such as `freeze` or `new` against the provided project.

- [ ] Write `tests/validation.test.ts`.

Minimum tests:

- Fresh initialized Godot, Unity, and Unreal projects validate.
- Missing project `AGENTS.md` fails with a clear message and non-zero exit.
- Missing engine file fails with a clear message and non-zero exit.
- Invalid project config fails Zod validation and exits non-zero.
- Missing required template fails repo validation.
- Missing required package script fails repo validation.
- Missing package asset from `files`/publish manifest or `npm pack --json` output fails repo validation.
- Incorrect TypeScript build output path or missing `dist/cli.js` fails repo validation.
- Relative TypeScript imports without `.js` specifiers fail typecheck or lint-style validation.
- Package assets still load when the CLI runs from a subdirectory.
- A package installed from the local `npm pack` tarball can run `open-gamestudio --help` and `open-gamestudio templates list` from a temporary non-repo cwd.
- Stale project `AGENTS.md` config hash fails with a clear regeneration message.
- Status-only `freeze` changes do not change `guidanceConfigHash` and do not make project `AGENTS.md` stale.
- Missing starter GDD or milestone/timeline artifacts fail with clear messages.
- Missing/empty milestone schema data fails with a clear message.
- CLI/help tests prove no `next`, no `--exec`, no telemetry command/files, no parallel orchestration surface, and no ownership-enforcement behavior are exposed.
- Broken `status` or `resume` read-only behavior fails project validation.
- Broken `freeze` or `new` behavior fails only in disposable fixture tests, not by mutating a user-supplied `--project` during validation.
- Validation itself does not print failures and exit `0`.

Validation:

```bash
npm run build
npm test -- tests/validation.test.ts
npm run validate
npm run typecheck
```

Expected:

- Validator tests pass.
- Repo validation exits `0` only when all current repo checks pass.

Commit checkpoint:

```bash
git add src/validation.ts src/cli.ts tests/validation.test.ts
git commit -m "feat: add hard-failing validation gates"
```

---

## Phase 6: Bounded Runner, Prompt Cache, and Minimal Metadata

- [ ] Implement `src/runner.ts`.

Default `open-gamestudio run <agent> --project <path> --task <text>` behavior:

- Assemble one structured prompt packet.
- Load one selected materialized/base agent.
- Load a project config summary.
- Load the selected engine overlay from package assets through `packageAssetPath`, not from cwd.
- Load only task-relevant templates selected by the canonical rules in `src/templates.ts`.
- Include explicit output paths.
- Include the validation command.
- Write prompt cache and minimal metadata.
- Print the prompt path and next manual/Codex command.
- Do not execute Codex.
- Do not modify project artifacts beyond `.gamestudio/runs/<run-id>-<agent>/prompt.md` and `.gamestudio/runs/<run-id>-<agent>/metadata.json`.

Supported flags:

```bash
--print-prompt
--dry-run
--include-artifact <relative-path>
--allow-broad-context
```

Flag semantics:

- `--print-prompt`: require non-empty `--task`, then print the deterministic prompt body only after writing cache/metadata.
- `--dry-run`: require non-empty `--task`, then print selected context files, output paths, validation command, prompt cache path, and metadata path.
- `--include-artifact <relative-path>`: explicitly include one prior project artifact under the project root. Reject absolute paths and traversal outside the project.
- `--allow-broad-context`: explicitly opt in to broader project context discovery. Without this flag, the runner must not scan or include broad project artifacts.
- `--exec`: do not implement in this plan. Document direct Codex execution as future-only; do not add runtime ownership/telemetry/execution machinery.

Prompt cache paths:

```text
projects/<slug>/.gamestudio/runs/<run-id>-<agent>/prompt.md
projects/<slug>/.gamestudio/runs/<run-id>-<agent>/metadata.json
```

Minimal metadata shape:

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

Do not add JSONL telemetry, elapsed runtime, exit codes, validation-result history, changed-file tracking, token estimates, or productivity metrics in this phase.

Prompt determinism contract:

- The rendered prompt body must not include timestamps or random IDs.
- Run IDs and timestamps may appear in metadata and cache paths, not in the deterministic body comparison.
- Tests should compare normalized prompt bodies and separately assert metadata fields such as `timestamp`, `prompt_chars`, and `prompt_cache_path` exist.

Required CLI examples:

```bash
npm exec open-gamestudio -- run market_analyst --project projects/my-game --task "Create first market overview"
npm exec open-gamestudio -- run market_analyst --project projects/my-game --task "Create first market overview" --print-prompt
npm exec open-gamestudio -- run qa_agent --project projects/my-game --task "Review validation readiness" --dry-run
npm exec open-gamestudio -- run producer_agent --project projects/my-game --task "Summarize current GDD" --include-artifact documentation/design/gdd.md --dry-run
```

- [ ] Write `tests/runner-prompts.test.ts`.

Minimum tests:

- Missing or empty `--task` fails for default, dry-run, and print-prompt modes with a clear error.
- Same inputs produce the same prompt body, aside from run-id paths handled separately.
- Prompt cache file is written for default, dry-run, and print-prompt modes.
- Metadata records `prompt_chars` and `prompt_cache_path`.
- Dry-run output lists every included context file.
- Market analyst prompt references market template and market output paths.
- Data scientist prompt references analytics template and analytics output paths.
- QA prompt references validation command.
- Rendered prompts include engine-specific overlay content for Godot, Unity, and Unreal; a prompt that only includes generic engine text fails.
- A single-agent run does not include unrelated agents.
- A single-agent run does not include all templates.
- Named prior artifacts are included only when explicitly requested.
- Broad project reads require an explicit opt-in flag and are not used by default.
- Direct Codex execution is not exposed by the first-build CLI; docs mark it as a future toolkit feature and show only manual external Codex usage.

Validation:

```bash
npm run build
npm test -- tests/runner-prompts.test.ts
npm run typecheck
```

Expected:

- Runner tests pass.
- Prompt cache and metadata are reproducible and bounded.

Commit checkpoint:

```bash
git add src/runner.ts src/cli.ts tests/runner-prompts.test.ts
git commit -m "feat: add bounded codex prompt runner"
```

---

## Phase 7: Docs, Migration Guide, and End-to-End Smoke Tests

- [ ] Add user-facing docs.

Files:

- `docs/setup.md`
- `docs/examples.md`
- `docs/development-rules.md`
- `docs/system-verification.md`
- `docs/workflow-validation.md`
- `docs/migration-from-claude.md`
- `CONTRIBUTING.md` or `docs/contributing.md`

Required docs behavior:

- Show Node/TypeScript install/build/test commands.
- Show `open-gamestudio` CLI usage, including `templates list` and `templates show <id>`.
- Show equivalent Codex prompt-runner workflows without claiming toolkit direct execution. Manual `codex exec` examples must be labeled as external user-run commands that consume generated prompt cache output, not commands spawned by `open-gamestudio`.
- Document intentional omissions and future-only features.
- Include explicit absence checks/examples: no `open-gamestudio next`, no `run --exec`, no telemetry command or telemetry files, no parallel orchestration command/docs, and no ownership-enforcement behavior in the first build.
- Document validation gates and parity checklist.
- Do not copy upstream license/authorship/citation docs as parity artifacts.

Required migration examples:

```bash
npm exec open-gamestudio -- init --name "My Game" --engine godot --mode prototype --non-interactive
npm exec open-gamestudio -- run market_analyst --project projects/my-game --task "Create the initial market overview."
# Manual external Codex command; open-gamestudio does not spawn Codex in the first build.
codex exec --cd projects/my-game "Read .gamestudio/runs/<run-id>-<agent>/prompt.md and perform the requested task."
npm run validate -- --project projects/my-game
```

- [ ] Run disposable sample-project smoke tests for all engines.

Run:

```bash
npm run typecheck
npm run build
npm test
node dist/cli.js --help
node dist/cli.js validate
npm exec open-gamestudio -- --help
npm exec open-gamestudio -- validate
npm exec open-gamestudio -- run --help
npm run validate
rm -rf projects/codex-godot-smoke projects/codex-unity-smoke projects/codex-unreal-smoke
npm run init -- --name "Codex Godot Smoke" --engine godot --mode prototype --non-interactive
npm run init -- --name "Codex Unity Smoke" --engine unity --mode design --non-interactive
npm run init -- --name "Codex Unreal Smoke" --engine "Unreal Engine" --mode development --non-interactive
npm run validate -- --project projects/codex-godot-smoke
npm run validate -- --project projects/codex-unity-smoke
npm run validate -- --project projects/codex-unreal-smoke
npm exec open-gamestudio -- run market_analyst --project projects/codex-godot-smoke --task "Create first market overview" --print-prompt
npm exec open-gamestudio -- run qa_agent --project projects/codex-unreal-smoke --task "Review validation readiness" --dry-run
test -n "$(find projects/codex-godot-smoke/.gamestudio/runs -name prompt.md -print -quit)"
test -n "$(find projects/codex-unreal-smoke/.gamestudio/runs -name metadata.json -print -quit)"
PACK_TGZ="$(npm pack --json | node -e 'let s=""; process.stdin.on("data", d => s += d); process.stdin.on("end", () => { const p = JSON.parse(s)[0]; const paths = p.files.map(f => f.path); for (const need of ["dist/cli.js", "engine_configs/godot.json", "engine_configs/unity.json", "engine_configs/unreal.json", "templates/gdd_template.md", "agents/base/master_orchestrator.md"]) { if (!paths.includes(need)) { console.error(`missing ${need}`); process.exit(1); } } console.log(p.filename); });')"
rm -rf /tmp/open-gamestudio-pack-smoke
mkdir -p /tmp/open-gamestudio-pack-smoke
npm install --prefix /tmp/open-gamestudio-pack-smoke "$PWD/$PACK_TGZ"
cd /tmp/open-gamestudio-pack-smoke
npm exec open-gamestudio -- --help
npm exec open-gamestudio -- templates list
cd -
rm -rf /tmp/open-gamestudio-pack-smoke
rm -f "$PACK_TGZ"
```

Expected:

- Vitest passes.
- TypeScript typecheck passes.
- Build passes.
- Both `node dist/cli.js` and `npm exec open-gamestudio -- ...` prove the built CLI and local package bin are usable.
- `npm pack --json` includes `dist/`, `engine_configs/`, `agents/base/`, and `templates/`, and the installed tarball smoke can load package assets from `/tmp/open-gamestudio-pack-smoke`.
- CLI help excludes `next`, `--exec`, telemetry, parallel orchestration, and ownership-enforcement surfaces.
- Repo validation passes.
- Godot source root contains `project.godot`.
- Unity source root contains `Packages/manifest.json` and the documented settings marker.
- Unreal source root contains `CodexUnrealSmoke.uproject`.
- Each sample project validates.
- Market analyst prompt includes only market analyst, project config summary, engine summary, market template, and market output contract.
- QA dry-run lists included context files and validation command.
- Prompt cache and metadata exist under `.gamestudio/runs/` for runner invocations.

- [ ] Remove disposable sample projects before commit unless intentionally adding examples.

Run:

```bash
rm -rf projects/codex-godot-smoke projects/codex-unity-smoke projects/codex-unreal-smoke
git status --short
```

Expected:

- No sample project remains unless explicitly committed as an example.
- Final git status includes only intentional source/docs changes.

Commit checkpoint:

```bash
git add docs CONTRIBUTING.md package.json src tests agents engine_configs templates AGENTS.md tsconfig.json tsconfig.build.json
git commit -m "docs: add codex gamestudio usage and verification"
```

---

## Final Verification Gate

Run before any parity claim:

```bash
npm run typecheck
npm run build
npm test
node dist/cli.js --help
node dist/cli.js validate
npm exec open-gamestudio -- --help
npm exec open-gamestudio -- validate
npm exec open-gamestudio -- run --help
npm run validate
rm -rf projects/final-verification-godot projects/final-verification-unity projects/final-verification-unreal
npm run init -- --name "Final Verification Godot" --engine godot --mode prototype --non-interactive
npm run init -- --name "Final Verification Unity" --engine unity --mode design --non-interactive
npm run init -- --name "Final Verification Unreal" --engine "Unreal Engine" --mode development --non-interactive
npm run validate -- --project projects/final-verification-godot
npm run validate -- --project projects/final-verification-unity
npm run validate -- --project projects/final-verification-unreal
npm exec open-gamestudio -- run qa_agent --project projects/final-verification-unreal --task "Review final verification readiness" --print-prompt
test -n "$(find projects/final-verification-unreal/.gamestudio/runs -name prompt.md -print -quit)"
PACK_TGZ="$(npm pack --json | node -e 'let s=""; process.stdin.on("data", d => s += d); process.stdin.on("end", () => { const p = JSON.parse(s)[0]; const paths = p.files.map(f => f.path); for (const need of ["dist/cli.js", "engine_configs/godot.json", "engine_configs/unity.json", "engine_configs/unreal.json", "templates/gdd_template.md", "agents/base/master_orchestrator.md"]) { if (!paths.includes(need)) { console.error(`missing ${need}`); process.exit(1); } } console.log(p.filename); });')"
rm -rf /tmp/open-gamestudio-pack-smoke
mkdir -p /tmp/open-gamestudio-pack-smoke
npm install --prefix /tmp/open-gamestudio-pack-smoke "$PWD/$PACK_TGZ"
(cd /tmp/open-gamestudio-pack-smoke && npm exec open-gamestudio -- --help && npm exec open-gamestudio -- templates list)
rm -rf /tmp/open-gamestudio-pack-smoke
rm -f "$PACK_TGZ"
rm -rf projects/final-verification-godot projects/final-verification-unity projects/final-verification-unreal
git status --short
```

Expected:

- Tests pass.
- Typecheck passes.
- Build passes.
- Built CLI works through both `node dist/cli.js` and `npm exec open-gamestudio -- ...`.
- Packed tarball contains runtime assets and the installed package bin can load them from a non-repo cwd.
- CLI help excludes `next`, `--exec`, telemetry, parallel orchestration, and ownership-enforcement surfaces.
- Repo validation passes.
- Godot, Unity, and Unreal projects initialize and validate.
- Unreal aliases resolve to canonical `unreal` while display output remains `Unreal Engine`.
- Unreal project file exists under `source/project-final-verification-unreal/FinalVerificationUnreal.uproject` before cleanup.
- QA prompt includes validation commands and project rules.
- Prompt cache exists for the QA print-prompt run before cleanup.
- Final git status includes only intentional source/docs changes.

---

## Parity Claim Checklist

Do not claim full parity until all are true:

- [ ] Implementation is TypeScript/Node only.
- [ ] Required package scripts exist: `init`, `manage`, `test`, `validate`, and template discoverability; scripts exercise the built CLI path.
- [ ] Package metadata declares the Node runtime floor and ships `dist/`, `engine_configs/`, `agents/base/`, and `templates/`; `npm pack` plus temp install proves installed-bin asset loading.
- [ ] `open-gamestudio` is the canonical CLI.
- [ ] No required Python files, Python package metadata, or Python alias assumptions exist.
- [ ] All 12 agents exist with Codex-native prompts.
- [ ] Design, prototype, and development modes activate the expected agents.
- [ ] Godot, Unity, and Unreal projects initialize with engine files under `source/project-<slug>/`.
- [ ] `Unreal`, `Unreal Engine`, `unreal`, and `ue5` normalize consistently.
- [ ] Project management supports `status`, `new`/`init`, `resume`, and `freeze`.
- [ ] `menu` and `startover` are omitted and documented as intentional differences.
- [ ] Market overview/seed and configured competitor names are created during init; eager competitor reports are not required.
- [ ] Templates for GDD, feature spec, handoff, analytics setup, engine setup, market analysis, and project config exist, include required lightweight sections/frontmatter, and are discoverable through `templates list/show`.
- [ ] Project `AGENTS.md`, materialized `master_orchestrator`, and handoff templates preserve orchestration behavior without generating `project_orchestrator.md`; project `AGENTS.md` hash validation fails when stale.
- [ ] Validation exits non-zero on failed checks and does not reproduce false-green behavior.
- [ ] Runner dry-run/print-prompt requires `--task`, is deterministic, and remains bounded.
- [ ] Runner writes prompt cache and minimal metadata.
- [ ] Single-agent prompts do not load all agents, all templates, or broad project artifacts by default.
- [ ] Direct Codex execution, telemetry, parallel orchestration, planner/next, changed-file tracking, and ownership enforcement remain documented future-only features and are not implemented in the first build.
- [ ] Migration docs show equivalent Codex/native CLI workflows without claiming unsupported direct execution.
