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
  - ../architecture/product-boundary.md
  - ../../AGENTS.md
---

# Codex-Native Agent and Skill Surfaces Implementation Design

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Generate Codex-native project agents and workflow skills that become visible and usable after a plain `git clone`.

**Architecture:** Codex Game Studio keeps its TypeScript registries as package source of truth, but `init` materializes official Codex surfaces into each generated project: `.codex/agents/*.toml` for custom agents, `.agents/skills/*/SKILL.md` for reusable workflow and standards skills, and `AGENTS.md` for repository instructions. Existing `.codex/prompts/**` and `.codex/workflows/**` remain Codex Game Studio runtime artifacts until a later migration proves they can be removed.

**Tech Stack:** TypeScript, NodeNext, Codex CLI native project files, generated-surface provenance, Vitest, Truthmark.

---

## Online Codex documentation findings

The previous `.codex/agents/*.md` idea was wrong. Current Codex docs define different native surfaces:

1. **Custom agents are TOML files.** Project-scoped custom agents live under `.codex/agents/`. Each standalone agent file must define `name`, `description`, and `developer_instructions`. Optional fields include `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, and `skills.config`. Source: <https://developers.openai.com/codex/subagents>.
2. **Skills live under `.agents/skills`.** For repositories, Codex scans `.agents/skills` from the current working directory up to the repository root. A skill is a directory with `SKILL.md` plus optional `scripts/`, `references/`, `assets/`, and `agents/openai.yaml`. Codex initially sees each skill's name, description, and path, then loads full `SKILL.md` only when the skill is selected. Source: <https://developers.openai.com/codex/skills>.
3. **`AGENTS.md` is the instruction surface.** Codex reads global and project `AGENTS.md` or `AGENTS.override.md` files before work. Project discovery starts at the repository root and walks down to the current working directory. Files closer to the working directory appear later and override broader guidance. Source: <https://developers.openai.com/codex/guides/agents-md>.
4. **Codex rules are permission rules, not coding standards.** Project-local command permission rules live under `<repo>/.codex/rules/*.rules` and control whether commands can run outside the sandbox. They are experimental. They should not be used for gameplay/UI/test coding standards. Source: <https://developers.openai.com/codex/rules>.
5. **Codex hooks are official but trusted lifecycle automation.** Project hooks can live in `<repo>/.codex/hooks.json` or `<repo>/.codex/config.toml`, but non-managed command hooks must be reviewed and trusted before they run. Matching hooks from multiple files all run. Source: <https://developers.openai.com/codex/hooks>.

## Correct target layout

A generated project should look like this after `init`:

```text
projects/<slug>/
  AGENTS.md
  .codex/
    agents/
      producer.toml
      gameplay-programmer.toml
      qa-playtester.toml
    prompts/
      producer.md
      gameplay-programmer.md
      qa-playtester.md
    workflows/
      bugfix.md
      vertical-slice.md
    studio.json
    tasks.json
    context-manifest.json
  .agents/
    skills/
      cgs-bugfix/SKILL.md
      cgs-vertical-slice/SKILL.md
      cgs-ui-ux-review/SKILL.md
      cgs-standards-gameplay/SKILL.md
      cgs-standards-tests/SKILL.md
```

Canonical meanings:

- `AGENTS.md`: Codex instruction surface loaded automatically.
- `.codex/agents/*.toml`: official project-scoped Codex custom agents.
- `.agents/skills/*/SKILL.md`: official repository skill packages.
- `.codex/prompts/*.md`: Codex Game Studio runtime prompt artifacts used by `codex-game-studio run <role>` until the CLI is migrated to direct custom-agent orchestration.
- `.codex/workflows/*.md`: Codex Game Studio workflow prompt artifacts, not Codex-native skills.
- `.codex/rules/*.rules`: reserved for sandbox command permission rules only.
- `.codex/hooks.json`: optional future surface for trust-reviewed lifecycle hooks; not part of the first implementation slice.

## Design decisions

1. Generate `.codex/agents/*.toml`, not `.codex/agents/*.md`.
2. Generate workflow and standards skills under `.agents/skills/**`, not `.codex/skills/**`.
3. Use `cgs-` prefixes for generated skill names to avoid collisions with user or global skills. Public docs say duplicate skill names are not merged and can both appear.
4. Keep `AGENTS.md` concise. It should point to available agents and skills, not embed all role or workflow bodies.
5. Keep `.codex/prompts/**` for current runtime compatibility. Do not pretend it is the Codex custom-agent format.
6. Do not use Codex `rules` for coding standards. Encode standards as skills and selected prompt/context guidance. Use `.codex/rules/*.rules` only for permission-policy rules if a later design needs them.
7. Do not generate hooks by default. Add `<project>/.codex/hooks.json` only in a later explicit design that handles Codex hook trust and user review.
8. Validate all generated surfaces with source hashes and schema versions.

## Agent generation contract

Each generated role agent is a TOML file:

```toml
# generated-by: codex-game-studio
# surface: custom-agent
# source-role-id: gameplay-programmer
# source-sha256: <hash>
# schema-version: 1

name = "gameplay_programmer"
description = "Game development implementation agent for gameplay-programmer tasks in this project. Use for gameplay feature code, mechanics integration, and implementation verification."
model_reasoning_effort = "medium"
developer_instructions = """
You are the gameplay-programmer role for this Codex Game Studio project.
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
- Only active-engine roles are materialized. A Godot project gets `godot-specialist.toml` and must not get `unity-specialist.toml` or `unreal-specialist.toml`.
- Optional `skills.config` is deferred until tested with relative project paths. The first pass relies on repository skill discovery from `.agents/skills`.

## Skill generation contract

Each generated workflow or standards skill is a directory with `SKILL.md`:

```markdown
---
name: cgs-bugfix
description: Use for Codex Game Studio bugfix workflow tasks: reproduce, repair, verify, and report a bounded defect.
---

# Codex Game Studio Bugfix Workflow

Use this skill when the task is a bounded defect repair in this generated game project.

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

- Workflow skills: `cgs-bugfix`, `cgs-vertical-slice`, `cgs-ui-ux-review`, `cgs-release-checklist` in the first pass because these already have task recipes.
- Standards skills: `cgs-standards-gameplay`, `cgs-standards-tests`, `cgs-standards-prototype`, `cgs-standards-ui` in the first pass.
- Later workflow skills can be generated for all built-in workflows after prompt-budget and selector behavior is verified.

## AGENTS.md contract

Generated `AGENTS.md` remains the primary project guidance file. It should include:

- project identity;
- engine and mode;
- validation commands;
- the active role-agent catalog path `.codex/agents/*.toml`;
- the generated skill catalog path `.agents/skills/*/SKILL.md`;
- the rule that coding standards are skills, not Codex permission rules;
- current no-hidden-hooks boundary.

It should not embed every role prompt, workflow prompt, template, or standards body. Codex docs state `AGENTS.md` discovery has a default combined size cap, so `AGENTS.md` must stay a compact index and contract.

## Runtime behavior

### Current runtime path

`codex-game-studio run <role>` continues to prepare and execute a bounded Codex prompt from existing role packages and `.codex/prompts/<role>.md`.

Dry-run must show both runtime and native Codex surfaces:

```text
Runtime role prompt: .codex/prompts/gameplay-programmer.md
Codex custom agent: .codex/agents/gameplay-programmer.toml
Relevant skills:
- .agents/skills/cgs-standards-gameplay/SKILL.md
- .agents/skills/cgs-bugfix/SKILL.md
```

### Clone-injectable path

After a plain `git clone`, a user can launch Codex in the generated project and Codex can discover:

- project instructions from `AGENTS.md`;
- custom agents from `.codex/agents/*.toml`;
- skills from `.agents/skills/*/SKILL.md`.

This path does not require `codex-game-studio` to be installed, though validation and regeneration still require the CLI.

## Validation contract

Repository validation must check package assets and generators.

Project validation must check generated project surfaces:

- `AGENTS.md` exists and has fresh provenance;
- active-engine `.codex/agents/*.toml` files exist;
- wrong-engine `.codex/agents/*.toml` files are absent;
- every generated agent TOML parses and contains `name`, `description`, and `developer_instructions`;
- generated agent source hashes match current role package inputs;
- `.agents/skills/<name>/SKILL.md` exists for required first-pass workflow and standards skills;
- generated skill `SKILL.md` files include `name` and `description` metadata;
- generated skill hashes match current workflow or standards source inputs;
- `.codex/rules/**` is absent unless a permission-rules feature is explicitly enabled;
- `.codex/hooks.json` is absent unless a hooks feature is explicitly enabled.

Optional Codex CLI smoke validation, when Codex is available:

```bash
codex debug prompt-input "probe generated project skills" > /tmp/cgs-prompt-input.json
```

The probe should confirm generated skill names appear in the skill list. A later test can inspect custom agent availability once the CLI exposes a stable debug shape for custom agents.

## Implementation tasks

### Task 1: Add generated custom-agent renderer

**Objective:** Convert existing role packages into Codex custom agent TOML.

**Files:**

- Modify: `src/agents.ts`
- Modify: `src/generated-surfaces.ts`
- Test: `tests/agents-templates.test.ts`

**Steps:**

1. Add `renderProjectCustomAgentToml(role, config, engines)`.
2. Serialize TOML with required fields: `name`, `description`, `developer_instructions`.
3. Add provenance comments with source role ID, schema version, and source hash.
4. Use active-engine filtering through `projectRoleIdsForEngine`.
5. Test that a Godot project renders `godot-specialist.toml` and does not render Unity or Unreal agents.

**Verification:**

```bash
npm test -- tests/agents-templates.test.ts
```

### Task 2: Materialize `.codex/agents/*.toml` during init

**Objective:** Write project-scoped custom agents into generated projects.

**Files:**

- Modify: `src/agents.ts`
- Modify: `src/projects.ts`
- Test: `tests/project-workflow.test.ts`

**Steps:**

1. Update `materializeAgents` to create `.codex/agents`.
2. Write one TOML file per active project role.
3. Keep existing `.codex/prompts/*.md` writes unchanged.
4. Update generated `AGENTS.md` to reference `.codex/agents/*.toml`.
5. Test generated file existence and wrong-engine omission.

**Verification:**

```bash
npm test -- tests/project-workflow.test.ts
```

### Task 3: Add workflow skill renderer

**Objective:** Convert first-pass built-in workflows into Codex skills.

**Files:**

- Create: `src/skills.ts`
- Modify: `src/workflows.ts` if helper exports are needed
- Test: `tests/skills.test.ts`

**Steps:**

1. Add `GeneratedSkillDefinition` with `name`, `description`, `sourceId`, `body`, and `sourceHash`.
2. Render `SKILL.md` with frontmatter `name` and `description`.
3. Generate first-pass workflow skills for `bugfix`, `vertical-slice`, `ui-ux-review`, and `release-checklist`.
4. Include references to existing `.codex/workflows/<id>.md` files instead of duplicating the full workflow body when a pointer is enough.
5. Test frontmatter, trigger descriptions, and provenance.

**Verification:**

```bash
npm test -- tests/skills.test.ts
```

### Task 4: Add standards skills, not Codex rules

**Objective:** Encode path/domain coding standards as skills rather than `.codex/rules`.

**Files:**

- Modify: `src/skills.ts`
- Create: `tests/standards-skills.test.ts`

**Steps:**

1. Add standards skill definitions for gameplay, tests, prototype, and UI.
2. Put path and domain trigger words in each skill description.
3. Keep deterministic checks in validation, not in the subjective `SKILL.md` body.
4. Do not create `.codex/rules/*.rules`.
5. Test that generated skills have clear `description` triggers and valid frontmatter.

**Verification:**

```bash
npm test -- tests/standards-skills.test.ts
```

### Task 5: Materialize `.agents/skills/**` during init

**Objective:** Write generated skills into the project so Codex discovers them after clone.

**Files:**

- Modify: `src/projects.ts`
- Modify: `src/skills.ts`
- Test: `tests/project-workflow.test.ts`

**Steps:**

1. Create `.agents/skills/<skill-name>/`.
2. Write `SKILL.md` for each first-pass workflow and standards skill.
3. Keep skill names stable and `cgs-` prefixed.
4. Update `AGENTS.md` to list `.agents/skills` as the workflow and standards skill catalog.
5. Test generated skill paths after `init`.

**Verification:**

```bash
npm test -- tests/project-workflow.test.ts tests/skills.test.ts
```

### Task 6: Validate generated Codex-native surfaces

**Objective:** Add hard validation for generated agents and skills.

**Files:**

- Modify: `src/validation.ts`
- Test: `tests/validation.test.ts`

**Steps:**

1. Validate `.codex/agents/*.toml` presence for active roles.
2. Validate wrong-engine agent absence.
3. Validate TOML required fields. If no TOML parser exists, add a narrow parser for generated scalar/string fields or use simple structural validation for generated files only.
4. Validate skill directories and `SKILL.md` frontmatter.
5. Validate provenance hashes for generated agent and skill files.
6. Fail if `.codex/rules/**` or `.codex/hooks.json` appears without an explicit future feature flag.

**Verification:**

```bash
npm test -- tests/validation.test.ts
npm run validate
```

### Task 7: Show native surfaces in dry-run and status output

**Objective:** Make the clone-injectable surfaces discoverable without reading source code.

**Files:**

- Modify: `src/runner.ts`
- Modify: `src/projects.ts`
- Modify: `docs/user-guide.md`
- Test: `tests/runner.test.ts`

**Steps:**

1. Add `Codex custom agent: .codex/agents/<role>.toml` to `run --dry-run` output.
2. Add selected generated skill paths to dry-run output when a workflow or standards skill is relevant.
3. Add `status` output that points to `.codex/agents` and `.agents/skills`.
4. Update user docs with official Codex path names.
5. Test dry-run and status strings.

**Verification:**

```bash
npm test -- tests/runner.test.ts tests/project-workflow.test.ts
```

### Task 8: Add optional Codex debug smoke probe

**Objective:** Verify generated repository skills are visible to Codex when Codex CLI is available.

**Files:**

- Modify: `src/validation.ts` or add a dev-only test helper
- Test: focused integration test, skipped when `codex` is unavailable

**Steps:**

1. Create a temp project with generated `.agents/skills`.
2. Run `codex debug prompt-input "probe generated project skills"` from the generated project root.
3. Parse JSON or text for `cgs-bugfix` and one standards skill.
4. Skip with an explicit diagnostic if Codex is not installed or authenticated.

**Verification:**

```bash
npm test -- tests/codex-skill-discovery.test.ts
```

### Task 9: Update truth and architecture docs

**Objective:** Record the corrected Codex-native surface contract.

**Files:**

- Modify: `docs/architecture/product-boundary.md` only if product boundary wording needs clarification.
- Modify: `docs/truthmark/engineering/projects/project-scaffolding.md`
- Modify: `docs/truthmark/engineering/codex/roles-and-workflows.md`
- Modify: `docs/truthmark/engineering/contracts/cli-and-validation.md`
- Modify: `docs/project-anatomy.md`
- Modify: `docs/user-guide.md`

**Steps:**

1. Describe `.codex/agents/*.toml` as native custom-agent files.
2. Describe `.agents/skills/**` as native Codex skill packages.
3. Describe `.codex/prompts/**` and `.codex/workflows/**` as CGS runtime artifacts.
4. State that coding standards are skills or AGENTS.md guidance, not Codex permission rules.
5. State that hooks are not generated by default.
6. Run Truthmark checks.

**Verification:**

```bash
truthmark check --json
truthmark index --json
git diff --check
```

## Acceptance criteria

- Generated projects contain `.codex/agents/*.toml` for active roles.
- Generated custom-agent TOML files include required Codex fields: `name`, `description`, and `developer_instructions`.
- Generated projects contain `.agents/skills/<name>/SKILL.md` for first-pass workflow and standards skills.
- Generated skills include `name` and `description` metadata.
- Generated `AGENTS.md` points to native agents and skills without embedding all content.
- Existing `run <role>` behavior still works through `.codex/prompts/**`.
- Validation fails stale generated agent and skill files.
- Validation fails wrong-engine generated agents.
- No `.codex/agents/*.md` files are generated.
- No `.codex/rules/*.rules` files are generated for coding standards.
- No `.codex/hooks.json` is generated by default.
- Optional Codex debug probe confirms repository skills are discoverable when Codex CLI is available.

## Deferred work

- Migrate `run <role>` to use Codex custom agents directly if the CLI exposes a stable noninteractive custom-agent selection contract.
- Generate workflow skills for all built-in workflows after prompt-budget behavior is measured.
- Add project-local Codex hooks only after a design covers trust review, hook disablement, and deterministic failure behavior.
- Add `.codex/rules/*.rules` only for sandbox command permission policy, not coding standards.

## Rollback plan

If the generated native surfaces create confusion or Codex discovery changes, keep existing runtime behavior stable by leaving `.codex/prompts/**`, `.codex/workflows/**`, and `AGENTS.md` intact. Disable native surface materialization behind one generator flag, regenerate affected projects, and keep validation focused on the old runtime surfaces until the native surface contract is repaired.
