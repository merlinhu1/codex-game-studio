---
status: draft
doc_type: implementation-design
last_reviewed: 2026-06-29
source_of_truth:
  - "https://developers.openai.com/codex/skills"
  - "https://developers.openai.com/codex/subagents"
  - "https://developers.openai.com/codex/guides/agents-md"
  - "https://developers.openai.com/codex/rules"
  - "https://developers.openai.com/codex/hooks"
  - "../../../../Claude-Code-Game-Studios@984023d"
  - ../architecture/product-boundary.md
  - ../../AGENTS.md
---

# Codex-Native Repository-Root Game Studio Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make Codex Game Studio install and behave like CCGS: cloning the repository creates the game root, with Codex-native agents and skills already discoverable.

**Architecture:** The repository root is the game project. Codex surfaces live at root-level `AGENTS.md`, `.codex/agents/*.toml`, and `.agents/skills/*/SKILL.md`. Product-maintenance material that explains the Codex Game Studio implementation must not live in game-facing paths such as `docs/` or `src/`, because those paths should describe the user's game, not the tool that produced the template.

**Tech Stack:** TypeScript, NodeNext, Codex CLI native project files, repository-template layout, generated-surface provenance, Vitest, Truthmark.

---

## CCGS reference findings

Latest CCGS main was fetched at `/opt/data/repos/Claude-Code-Game-Studios`, commit `984023d`.

CCGS installation behavior is template-root behavior, not nested project generation:

```bash
git clone https://github.com/Donchitos/Claude-Code-Game-Studios.git my-game
cd my-game
claude
/start
```

The cloned repository is the game root. There is no separate installer that creates `projects/<slug>/`. CCGS root contains game-oriented runtime surfaces:

```text
CLAUDE.md
.claude/agents/**
.claude/skills/**
.claude/hooks/**
.claude/rules/**
src/                 # game source, initially nearly empty
design/              # game design docs
docs/                # game technical docs and engine reference
production/          # game production state
```

The important adaptation is not Claude-specific hooks. The important adaptation is that the repo itself is a prepared game workspace. The first Codex session should see game-development instructions, game roles, and game workflows, not package-maintainer plans about the tool implementation.

## Current CGS mismatch

Current Codex Game Studio still behaves like a package that generates child projects:

- `initProject()` writes into `projects/<slug>/`.
- Root `src/` contains the TypeScript CLI implementation, but a game root `src/` should contain game source.
- Root `docs/` contains product architecture, implementation plans, Truthmark docs, migration docs, and development rules. A game root `docs/` should contain game technical docs, engine reference, ADRs, postmortems, and player-facing project documentation.
- Root `AGENTS.md` tells agents how to maintain the Codex Game Studio package, not how to build a game.
- Root `.codex/agents/` currently contains Truthmark repository-maintenance agents, which are wrong for a game workspace.

This layout can derail a game-development Codex session because automatic guidance and normal file search point at tool-maintenance material.

## Correct target layout

A fresh clone should already be a usable game root:

```text
my-game/
  AGENTS.md
  .codex/
    agents/
      producer.toml
      gameplay-programmer.toml
      qa-playtester.toml
      godot-specialist.toml
    prompts/
      producer.md
      gameplay-programmer.md
      qa-playtester.md
    workflows/
      bugfix.md
      vertical-slice.md
      setup-engine.md
    studio.json
    tasks.json
    context-manifest.json
  .agents/
    skills/
      cgs-start/SKILL.md
      cgs-setup-engine/SKILL.md
      cgs-bugfix/SKILL.md
      cgs-vertical-slice/SKILL.md
      cgs-standards-gameplay/SKILL.md
      cgs-standards-tests/SKILL.md
  src/
    .gitkeep
  assets/
    .gitkeep
  design/
    gdd.md
  docs/
    engine-reference/
      godot/VERSION.md
    architecture/
      README.md
  tests/
    .gitkeep
  tools/
    .gitkeep
  production/
    session-state/.gitkeep
```

Canonical meanings:

- `AGENTS.md`: Codex instruction surface loaded automatically for game development.
- `.codex/agents/*.toml`: official project-scoped Codex custom agents.
- `.agents/skills/*/SKILL.md`: official repository skill packages.
- `.codex/prompts/*.md`: CGS runtime prompt artifacts used by `run <role>` until direct custom-agent orchestration is stable.
- `.codex/workflows/*.md`: CGS workflow prompt artifacts, not Codex-native skills.
- `src/`, `assets/`, `design/`, `docs/`, `tests/`, `tools/`, and `production/`: game project paths.
- Codex Game Studio implementation docs and package-maintainer plans do not belong in game-facing root paths.

## Design decisions

1. The primary install path is now `git clone <repo> my-game`, then run Codex from `my-game`.
2. `init` configures the current repository root by default. It no longer creates `projects/<slug>/` in the primary path.
3. Nested `projects/<slug>/` creation becomes a legacy or explicit sandbox mode only, guarded by an option such as `init --nested` if kept at all.
4. Generate `.codex/agents/*.toml`, not `.codex/agents/*.md`.
5. Generate workflow and standards skills under `.agents/skills/**`, not `.codex/skills/**`.
6. Use `cgs-` prefixes for generated skill names to avoid collisions with user or global skills. Public Codex docs say duplicate skill names are not merged and can both appear.
7. Keep `AGENTS.md` concise. It should point to available agents and skills, not embed every role or workflow body.
8. Do not use Codex `rules` for coding standards. Official Codex rules are sandbox command permission rules. Encode coding standards as skills and selected prompt/context guidance.
9. Do not generate hooks by default. Add `.codex/hooks.json` only in a later design that handles Codex hook trust review.
10. Root `/docs` is game documentation. Product docs, implementation plans, Truthmark repository docs, and migration notes must move out of game-facing root paths or out of the distributed template.

## Documentation boundary

The root game template may contain these documentation classes:

- `docs/engine-reference/**`: version-pinned engine references useful to the game project;
- `docs/architecture/**`: game architecture docs and ADRs;
- `docs/api/**`: game API docs;
- `docs/postmortems/**`: game postmortems;
- `design/**`: game design docs;
- `production/**`: game production records.

The root game template must not contain these CGS maintainer classes:

- `docs/plans/**` implementation plans for Codex Game Studio itself;
- `docs/truthmark/**` repository-truth workflow docs;
- `docs/architecture/product-boundary.md` for the tool package;
- `docs/ai/repo-rules.md` for maintaining the tool repo;
- `docs/migration-from-claude.md` as a package-maintainer document;
- `docs/development*.md` that explain the package implementation;
- generated Truthmark agents under root `.codex/agents/**`.

First implementation choice: move CGS maintainer docs into a clearly non-game maintenance area that is excluded from the template export, such as `tooling/codex-game-studio/docs/**`, or split them to a separate maintainer branch/repository. Do not leave them under root `docs/`.

## Runtime behavior

### Clone-root path

After a plain clone, a user can launch Codex in the repository root and Codex can discover:

- game instructions from `AGENTS.md`;
- custom game agents from `.codex/agents/*.toml`;
- game workflow skills from `.agents/skills/*/SKILL.md`.

This path should not require running the CGS CLI before the first Codex session. A `/start`-style skill or `cgs-start` skill can guide configuration if the game has no engine or concept yet.

### CLI path

`codex-game-studio init --non-interactive ...` configures the current directory by default:

```bash
git clone <repo> my-game
cd my-game
./codex-game-studio init --non-interactive --name "My Game" --engine godot --mode prototype
```

The command writes or refreshes root files. It must refuse to run if the current directory looks like an unrelated source checkout unless the user passes an explicit force or template-maintenance flag.

`codex-game-studio run <role>` defaults to the current repository root when `.codex/studio.json` exists. `--project` remains accepted for legacy nested projects during migration.

### Development-maintenance path

Maintaining the CGS package is a different mode from building a game. If the repository keeps package source in the same Git history, maintenance files must be isolated away from game-facing paths and root game instructions must not ask game agents to read them.

Candidate maintenance locations:

```text
tooling/codex-game-studio/src/**
tooling/codex-game-studio/tests/**
tooling/codex-game-studio/docs/**
tooling/codex-game-studio/truthmark/**
```

Long-term cleaner option: keep the game template repository separate from the package-maintenance repository. The template repository should contain only game-root files.

## Agent generation contract

Each generated role agent is a TOML file:

```toml
# generated-by: codex-game-studio
# surface: custom-agent
# source-role-id: gameplay-programmer
# source-sha256: <hash>
# schema-version: 1

name = "gameplay_programmer"
description = "Game development implementation agent for gameplay-programmer tasks in this repository. Use for gameplay feature code, mechanics integration, and implementation verification."
model_reasoning_effort = "medium"
developer_instructions = """
You are the gameplay-programmer role for this Codex Game Studio repository.
Follow AGENTS.md, .codex/studio.json, and selected task context.
Keep changes bounded to the requested task.
Report changed files and verification evidence.
"""
```

Mapping rules:

- Filename uses existing role ID: `.codex/agents/gameplay-programmer.toml`.
- TOML `name` uses a safe Codex agent identifier derived from the role ID by replacing `-` with `_`.
- `description` front-loads trigger words for when Codex should use the agent.
- `developer_instructions` reuses the role package contract but is formatted for a custom Codex agent, not for a one-shot prompt.
- Only active-engine roles are materialized. A Godot repository gets `godot-specialist.toml` and must not get `unity-specialist.toml` or `unreal-specialist.toml`.
- Optional `skills.config` is deferred until tested with relative project paths. The first pass relies on repository skill discovery from `.agents/skills`.

## Skill generation contract

Each generated workflow or standards skill is a directory with `SKILL.md`:

```markdown
---
name: cgs-bugfix
description: Use for Codex Game Studio bugfix workflow tasks in a game repository: reproduce, repair, verify, and report a bounded defect.
---

# Codex Game Studio Bugfix Workflow

Use this skill when the task is a bounded defect repair in this game repository.

## Inputs

- `AGENTS.md`
- `.codex/studio.json`
- `.codex/workflows/bugfix.md`
- task-relevant files named by the user or task record

## Procedure

1. Reproduce or characterize the defect.
2. Identify the smallest relevant implementation surface.
3. Make a bounded fix.
4. Run focused verification.
5. Report changed files, verification evidence, and remaining risks.
```

Skill categories:

- Onboarding skills: `cgs-start`, `cgs-setup-engine`, `cgs-adopt`.
- Workflow skills: `cgs-bugfix`, `cgs-vertical-slice`, `cgs-ui-ux-review`, `cgs-release-checklist` in the first pass because these already have task recipes.
- Standards skills: `cgs-standards-gameplay`, `cgs-standards-tests`, `cgs-standards-prototype`, `cgs-standards-ui` in the first pass.
- Later workflow skills can be generated for all built-in workflows after prompt-budget and selector behavior is verified.

## AGENTS.md contract

Root `AGENTS.md` is game-facing and should include:

- project identity;
- engine and mode;
- validation commands;
- expected game directory layout;
- active role-agent catalog path `.codex/agents/*.toml`;
- generated skill catalog path `.agents/skills/*/SKILL.md`;
- the rule that coding standards are skills, not Codex permission rules;
- current no-hidden-hooks boundary;
- an explicit ignore rule for any retained maintenance/tooling tree.

It must not include CGS package-maintainer instructions unless the user intentionally enters a maintainer mode.

## Validation contract

Repository validation must check the root game template:

- `AGENTS.md` is game-facing and does not contain package-maintainer instructions;
- root `src/` is game source, not TypeScript CLI source, in the distributed template;
- root `docs/` contains only game-facing docs;
- active-engine `.codex/agents/*.toml` files exist;
- wrong-engine `.codex/agents/*.toml` files are absent;
- every generated agent TOML parses and contains `name`, `description`, and `developer_instructions`;
- generated agent source hashes match current role inputs;
- `.agents/skills/<name>/SKILL.md` exists for required first-pass onboarding, workflow, and standards skills;
- generated skill `SKILL.md` files include `name` and `description` metadata;
- generated skill hashes match current workflow or standards source inputs;
- `.codex/rules/**` is absent unless a permission-rules feature is explicitly enabled;
- `.codex/hooks.json` is absent unless a hooks feature is explicitly enabled;
- no root Truthmark maintenance agents are shipped in `.codex/agents/**` for game use.

Optional Codex CLI smoke validation, when Codex is available:

```bash
codex debug prompt-input "probe generated repository skills" > /tmp/cgs-prompt-input.json
```

The probe should confirm generated skill names appear in the skill list. A later test can inspect custom agent availability once the CLI exposes a stable debug shape for custom agents.

## Implementation tasks

### Task 1: Capture CCGS install behavior as a fixture

**Objective:** Add a regression fixture documenting that the reference strategy is clone-root installation.

**Files:**

- Create: `tooling/codex-game-studio/docs/reference/ccgs-installation.md`
- Test: `tooling/codex-game-studio/tests/reference-layout.test.ts`

**Steps:**

1. Record the CCGS commit and root layout facts from `/opt/data/repos/Claude-Code-Game-Studios`.
2. Assert the reference setup command is clone-to-game-root, not nested project generation.
3. Assert CCGS `src/` is game source and CCGS `docs/` is game/workflow docs, not package-maintainer docs.
4. Keep this fixture out of root game-facing `docs/`.

**Verification:**

```bash
npm test -- tooling/codex-game-studio/tests/reference-layout.test.ts
```

### Task 2: Introduce template-root mode

**Objective:** Change project initialization so the default project root is the current repository root.

**Files:**

- Modify: `src/projects.ts` or its moved path under `tooling/codex-game-studio/src/projects.ts`
- Modify: `src/paths.ts` or moved equivalent
- Test: `tests/project-workflow.test.ts`

**Steps:**

1. Add a `rootMode` project initializer path that resolves `projectRoot = cwd`.
2. Make root mode the default for `init`.
3. Preserve nested `projects/<slug>/` only behind an explicit legacy option.
4. Refuse root initialization if `.codex/studio.json` already exists with a different project name unless `--force-refresh` is passed.
5. Test that `init` writes `.codex/studio.json` directly under the temp cwd.
6. Test that no `projects/<slug>/` directory is created in default mode.

**Verification:**

```bash
npm test -- tests/project-workflow.test.ts
```

### Task 3: Move package implementation out of game-facing root paths

**Objective:** Prevent game sessions from reading tool-maintenance source as game source.

**Files:**

- Move: `src/**` to `tooling/codex-game-studio/src/**`
- Move: `tests/**` to `tooling/codex-game-studio/tests/**`
- Move: package config files if needed: `package.json`, `tsconfig*.json`, `vitest.config.ts`
- Modify: package scripts and imports after the move
- Test: full package test suite

**Steps:**

1. Move CLI implementation source out of root `src/`.
2. Leave root `src/.gitkeep` as the game source placeholder.
3. Update package scripts to run from the new tooling package root.
4. Update TypeScript config paths.
5. Build once to catch broken NodeNext imports.
6. Test that a clean template root has no TypeScript package source under root `src/`.

**Verification:**

```bash
npm run build
npm test
```

### Task 4: Move CGS maintainer docs out of root `docs/`

**Objective:** Make root `docs/` safe for game development.

**Files:**

- Move: `docs/plans/**` to `tooling/codex-game-studio/docs/plans/**`
- Move: `docs/truthmark/**` to `tooling/codex-game-studio/docs/truthmark/**` or remove from the template repository
- Move: `docs/architecture/product-boundary.md` to tooling docs
- Move: `docs/ai/repo-rules.md` to tooling docs
- Move: `docs/development*.md` to tooling docs
- Keep or rewrite: `docs/engine-reference/**` as game-facing reference
- Keep or rewrite: `docs/architecture/**` only for game architecture
- Test: new layout validation

**Steps:**

1. Classify every current root `docs/**` file as game-facing or maintainer-facing.
2. Move maintainer-facing docs out of root `docs/`.
3. Rewrite root `docs/README.md` to describe game documentation only.
4. Update any internal links from moved docs.
5. Add a validation check that root `docs/` cannot contain `doc_type: implementation-design`, Truthmark route docs, package development docs, or CGS product-boundary docs.
6. Test the validator with one forbidden fixture.

**Verification:**

```bash
npm test -- tests/validation.test.ts
```

### Task 5: Replace root AGENTS.md with game-facing guidance

**Objective:** Make Codex start in game-development mode after clone.

**Files:**

- Modify: `AGENTS.md`
- Move old maintainer instructions to: `tooling/codex-game-studio/AGENTS.md`
- Test: `tests/agents-templates.test.ts`

**Steps:**

1. Generate or write root `AGENTS.md` as a game project contract.
2. Include references to `.codex/agents/*.toml`, `.agents/skills/**`, and game validation commands.
3. Add a short rule: ignore `tooling/codex-game-studio/**` unless the task explicitly says to maintain Codex Game Studio.
4. Move package-maintainer rules into tooling-local `AGENTS.md`.
5. Test that root `AGENTS.md` does not mention NodeNext, Truthmark, or package release rules.
6. Test that tooling `AGENTS.md` retains package-maintainer rules.

**Verification:**

```bash
npm test -- tests/agents-templates.test.ts
```

### Task 6: Generate root `.codex/agents/*.toml`

**Objective:** Materialize Codex custom agents at the game root.

**Files:**

- Modify: `src/agents.ts` or moved equivalent
- Modify: `src/generated-surfaces.ts` or moved equivalent
- Test: `tests/agents-templates.test.ts`

**Steps:**

1. Add `renderProjectCustomAgentToml(role, config, engines)`.
2. Serialize TOML with required fields: `name`, `description`, `developer_instructions`.
3. Add provenance comments with source role ID, schema version, and source hash.
4. Use active-engine filtering through `projectRoleIdsForEngine`.
5. Write agents under root `.codex/agents/`.
6. Test that a Godot project renders `godot-specialist.toml` and does not render Unity or Unreal agents.
7. Test that Truthmark maintenance agents are absent from the game template.

**Verification:**

```bash
npm test -- tests/agents-templates.test.ts
```

### Task 7: Generate root `.agents/skills/**`

**Objective:** Materialize Codex skills at the game root.

**Files:**

- Create or modify: `src/skills.ts` or moved equivalent
- Modify: `src/projects.ts` or moved equivalent
- Test: `tests/skills.test.ts`
- Test: `tests/project-workflow.test.ts`

**Steps:**

1. Add `GeneratedSkillDefinition` with `name`, `description`, `sourceId`, `body`, and `sourceHash`.
2. Render `SKILL.md` with frontmatter `name` and `description`.
3. Generate onboarding skills for start/setup/adopt.
4. Generate first-pass workflow skills for bugfix, vertical-slice, UI/UX review, and release checklist.
5. Generate standards skills for gameplay, tests, prototype, and UI.
6. Write skills under root `.agents/skills/<skill-name>/SKILL.md`.
7. Test generated skill paths after root `init`.

**Verification:**

```bash
npm test -- tests/skills.test.ts tests/project-workflow.test.ts
```

### Task 8: Update dry-run, status, and validation for root mode

**Objective:** Make CLI inspection report root-mode Codex-native surfaces.

**Files:**

- Modify: `src/runner.ts` or moved equivalent
- Modify: `src/projects.ts` or moved equivalent
- Modify: `src/validation.ts` or moved equivalent
- Test: `tests/runner.test.ts`
- Test: `tests/validation.test.ts`

**Steps:**

1. Make `run --dry-run` default to cwd when `.codex/studio.json` exists.
2. Print `Codex custom agent: .codex/agents/<role>.toml`.
3. Print selected skill paths under `.agents/skills/**`.
4. Add root layout validation for game-facing `src/` and `docs/`.
5. Add validation failure for root `.codex/agents/truth-*.toml` in game mode.
6. Preserve legacy `--project` behavior until migration is complete.

**Verification:**

```bash
npm test -- tests/runner.test.ts tests/validation.test.ts
```

### Task 9: Add package/template smoke tests

**Objective:** Prove a clone-style game root is usable without reading maintainer docs.

**Files:**

- Create: `tests/template-root-smoke.test.ts`
- Modify: package test script as needed

**Steps:**

1. Create a temp directory representing a fresh clone.
2. Run root `init` in the temp directory.
3. Assert root `.codex/agents/*.toml`, `.agents/skills/**`, `AGENTS.md`, game `src/`, and game `docs/` exist.
4. Assert no root `projects/<slug>/` exists.
5. Assert no forbidden maintainer docs exist under root `docs/`.
6. If `codex` is available, run the optional skill discovery probe from the temp root.

**Verification:**

```bash
npm test -- tests/template-root-smoke.test.ts
```

### Task 10: Update public docs and migration docs

**Objective:** Document the new CCGS-style install path.

**Files:**

- Modify: `README.md`
- Modify or move: `docs/setup.md`
- Modify or move: `docs/user-guide.md`
- Modify: `UPGRADING.md` if present after layout cleanup

**Steps:**

1. Replace `projects/<slug>` setup examples with clone-root setup examples.
2. Explain that root `docs/` is for game docs.
3. Explain that maintainer/tooling docs are not part of the game-facing template.
4. Document legacy nested projects only as a migration escape hatch.
5. Avoid parity claims unless `npm run validate` passes.

**Verification:**

```bash
git diff --check
npm run validate
```

## Acceptance criteria

- `git clone <repo> my-game` yields a game root, not a package-maintenance root.
- Default `init` writes root `.codex/studio.json` and does not create `projects/<slug>/`.
- Root `src/` is game source, not CGS TypeScript package source.
- Root `docs/` contains game-facing docs only.
- Root `AGENTS.md` is game-facing.
- `.codex/agents/*.toml` contains Codex custom game agents.
- `.agents/skills/*/SKILL.md` contains Codex repository skill packages.
- Existing `run <role>` behavior still works through `.codex/prompts/**` during migration.
- Validation fails if package-maintainer docs appear under root `docs/`.
- Validation fails if Truthmark maintenance agents appear under root `.codex/agents/**` in game mode.
- No `.codex/agents/*.md` files are generated.
- No `.codex/rules/*.rules` files are generated for coding standards.
- No `.codex/hooks.json` is generated by default.

## Deferred work

- Split the package-maintenance repository from the game-template repository if keeping both in one repository remains confusing.
- Migrate `run <role>` to use Codex custom agents directly if the CLI exposes a stable noninteractive custom-agent selection contract.
- Generate workflow skills for all built-in workflows after prompt-budget behavior is measured.
- Add project-local Codex hooks only after a design covers trust review, hook disablement, and deterministic failure behavior.
- Add `.codex/rules/*.rules` only for sandbox command permission policy, not coding standards.

## Rollback plan

If root-mode migration breaks existing users, keep `init --nested` and `--project` support for one release. The rollback path restores nested `projects/<slug>/` generation while preserving the corrected Codex-native file formats. Do not roll back to `.codex/agents/*.md` or to coding standards under `.codex/rules/**`.
