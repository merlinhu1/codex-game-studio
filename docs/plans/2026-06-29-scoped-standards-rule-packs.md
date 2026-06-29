---
status: draft
doc_type: design
last_reviewed: 2026-06-29
source_of_truth:
  - ../architecture/product-boundary.md
  - ../../AGENTS.md
---

# Scoped Standards Rule Packs Design

## Goal

Add Codex-native, path-scoped standards guidance to Codex Game Studio without importing Claude Code hooks, `.claude/rules`, or hidden lifecycle automation.

The design keeps the current product boundary: explicit commands, reviewable project files, bounded selected context, and validation that runs through the CLI or test suite.

## Background

Claude Code Game Studios has useful path-scoped rules for gameplay code, UI code, tests, prototypes, design docs, data files, networking, AI, and engine hot paths. Those rules improve day-to-day agent guidance because a role editing `src/gameplay/**` sees gameplay standards instead of every standard in the repository.

Codex Game Studio should adapt that idea, not the Claude implementation. The CCGS hook and rule runtime depends on `.claude/settings.json` lifecycle events and host-specific automatic behavior. Codex Game Studio's architecture requires visible local files, deterministic CLI output, dry-run inspection, explicit validation, and selected context rather than hidden automation.

## Decisions

1. Rule packs are a Codex Game Studio surface, not a Claude compatibility surface.
2. Built-in package rule packs are the canonical defaults.
3. Generated project rule packs may be materialized under `.codex/studio/rules/**` when the project needs local reviewable copies or overrides.
4. Generated project role agents should be visible as clone-injectable `.codex/agents/**` files in addition to the runtime `.codex/prompts/**` prompts.
5. Workflow skills should be visible as clone-injectable `.agents/skills/**` packages when they are meant to behave like reusable agent workflows.
6. Rule selection is explicit and deterministic. It is based on declared task context, not ambient editor hooks.
7. Mechanically checkable rules become validation checks. Subjective guidance remains selected prompt context.
8. No `.claude/hooks`, `.claude/rules`, Git hooks, background daemons, or hidden lifecycle triggers are introduced.

## Non-goals

- Do not add Claude Code hook compatibility.
- Do not add a hidden session-start, pre-tool, post-write, compact, or stop hook runtime.
- Do not load every rule pack into every prompt.
- Do not make strict studio process mandatory for fast prototypes.
- Do not turn Truthmark route files into user-facing game-studio product features.
- Do not add CI, PR, release, or merge enforcement behavior.

## Product surface

### Built-in package registry

Codex Game Studio ships a rule-pack registry with package assets. The registry is read by CLI runtime code, not by a host-specific agent hook.

Proposed package asset layout:

```text
rules/
  registry.json
  gameplay-code.md
  engine-core.md
  ui-code.md
  network-code.md
  ai-code.md
  test-standards.md
  prototype-code.md
  design-docs.md
  data-files.md
  shader-code.md
```

`rules/registry.json` declares metadata for each pack:

```json
{
  "version": 1,
  "packs": [
    {
      "id": "gameplay-code",
      "title": "Gameplay Code Standards",
      "appliesTo": {
        "paths": ["source/**/gameplay/**", "src/gameplay/**"],
        "roles": ["gameplay-programmer", "senior-game-designer"],
        "stages": ["prototype", "development"],
        "strictness": ["guided-studio", "strict-studio"]
      },
      "checks": ["data-driven-gameplay-values"],
      "guidancePath": "rules/gameplay-code.md"
    }
  ]
}
```

The registry is a package asset and must be included in package shipping checks. Installed-bin execution from a non-repository working directory must still resolve built-in rule packs from the package root.

### Project-local copies and overrides

Generated projects may materialize local rule packs when reviewability or customization is needed:

```text
projects/<slug>/.codex/studio/rules/
  registry.json
  gameplay-code.md
  test-standards.md
```

Local copies are optional. A project without local copies uses built-in package defaults. A project with local copies can override or disable selected built-in packs through a registry entry, but the override is explicit and validated.

Generated local rule packs must include provenance metadata so validation can detect stale or malformed generated surfaces:

```markdown
<!-- generated-by: codex-game-studio -->
<!-- rule-pack-id: gameplay-code -->
<!-- source-registry-version: 1 -->
<!-- source-sha256: <hash> -->
```

### Clone-injectable agents and skills

Codex Game Studio should make generated projects self-describing after a plain `git clone`. The generated project should carry the role and workflow surfaces that a host can inject without requiring the original package checkout.

Proposed generated project layout:

```text
projects/<slug>/
  AGENTS.md
  .codex/
    agents/
      producer.md
      gameplay-programmer.md
      qa-playtester.md
    prompts/
      producer.md
      gameplay-programmer.md
      qa-playtester.md
    workflows/
      bugfix.md
      vertical-slice.md
    studio.json
  .agents/
    skills/
      bugfix/SKILL.md
      vertical-slice/SKILL.md
      ui-ux-review/SKILL.md
```

`AGENTS.md` remains the primary Codex instruction surface. `.codex/agents/**` is the browseable, clone-injectable agent catalog. `.codex/prompts/**` remains the runtime prompt surface used by `run <role>` and selected context contracts. The first implementation may make `.codex/agents/<role>.md` and `.codex/prompts/<role>.md` identical files or one may be a generated wrapper pointing to the other, but validation must keep both fresh if both are materialized.

`.agents/skills/**` is for reusable workflow packages, not for hidden hooks. A workflow skill package contains a `SKILL.md` with the workflow goal, required role, selected templates, validation expectations, and handoff format. It may include support files only when those files reduce prompt bloat or make the workflow auditable after clone.

Generated agent and skill files must include provenance metadata:

```markdown
<!-- generated-by: codex-game-studio -->
<!-- surface: role-agent | workflow-skill -->
<!-- source-id: gameplay-programmer -->
<!-- source-sha256: <hash> -->
```

This gives the CCGS-style "clone the repo and see the studio" experience while preserving Codex Game Studio's explicit runtime. A host may inject `.codex/agents/**` or `.agents/skills/**` directly, but Codex Game Studio still executes through explicit CLI commands and validates generated surface freshness.

## Selection inputs

Rule selection uses the same explicit context model as prompt and task preparation. The selector receives a structured input instead of inspecting an editor event.

Required input fields:

```ts
type RuleSelectionInput = {
  projectRoot: string;
  roleId: string;
  engine?: "godot" | "unity" | "unreal";
  projectStage?: "design" | "prototype" | "development";
  studioStrictness?: "fast-prototype" | "guided-studio" | "strict-studio";
  commandSurface: "run" | "task-dry-run" | "task-orchestrate" | "validate";
  declaredWriteFiles: string[];
  declaredReadFiles?: string[];
  workflowId?: string;
};
```

Selection factors:

- path patterns from `declaredWriteFiles` first;
- role ID;
- engine;
- project stage;
- studio strictness;
- workflow recipe ID;
- explicit project-local enables/disables.

`declaredWriteFiles` is the strongest signal because standards should match the files a task is allowed to change. Read-only context can add advisory packs, but it must not cause write-scope-only checks to fail.

## Selection algorithm

1. Load built-in registry from package assets.
2. Load project-local registry if present.
3. Validate local registry schema, IDs, provenance, and path containment.
4. Build candidate packs from built-in defaults plus project-local overrides.
5. Score each pack:
   - path match against declared write files;
   - role match;
   - engine match;
   - stage match;
   - strictness match;
   - workflow match.
6. Select packs above the configured threshold.
7. Apply hard caps for prompt budget:
   - maximum selected packs;
   - maximum total guidance characters;
   - deterministic priority tie-breaks.
8. Return both selected and omitted packs with reasons.

The selector must never fall back to loading all packs when no match is found. If no pack matches, the result is an empty selected set plus diagnostics explaining why.

## Output surfaces

### `run --dry-run`

Dry-run output includes a `Selected standards` section:

```text
Selected standards:
- gameplay-code: matched writeFiles source/gameplay/combat.ts and role gameplay-programmer
- test-standards: matched writeFiles tests/combat.test.ts

Omitted standards:
- ui-code: no declared write file matched src/ui/**
- prototype-code: project stage is development
```

Dry-run remains non-mutating.

### Prompt packets

Prepared Codex prompts include selected subjective guidance as a bounded section:

```markdown
## Selected Standards

### gameplay-code

<selected concise guidance>

### test-standards

<selected concise guidance>
```

The prompt metadata records selected pack IDs, source type, source hash, and omitted-pack diagnostics. That metadata is part of reviewable run evidence under `.codex/**` when a run writes prompt caches or run metadata.

### Task orchestration diagnostics

`task orchestrate --dry-run` reports selected standards per task. It must show conflicts before execution, such as a task with no declared write files attempting a mutating role that normally requires path-scoped standards.

Example:

```text
Task combat-implementation:
  selected standards: gameplay-code, test-standards
  omitted standards: ui-code, network-code
  diagnostics: all selected packs fit within 6,000 character budget
```

### Validation advisory output

`validate` checks registry integrity and mechanically checkable standards. It also prints advisory diagnostics for subjective packs when selection data is available.

Validation must distinguish severity:

- `error`: malformed registry, stale generated rule pack, path traversal, package asset missing, mechanical rule failed;
- `warning`: subjective rule matched but only advisory, local override disables a recommended pack, no standards matched a declared write set;
- `info`: selected/omitted summary for inspection.

## Mechanical checks vs subjective guidance

Rule packs may contain two kinds of rules.

### Mechanical checks

Mechanical checks are deterministic and belong in validation. Examples:

- rule registry JSON schema is valid;
- local rule pack paths stay under `.codex/studio/rules/**`;
- generated local rule pack provenance hashes match the current registry;
- TypeScript relative imports use emitted `.js` specifiers;
- package assets include `rules/**` and installed-bin execution can load them;
- JSON data files are syntactically valid;
- generated project `AGENTS.md` provenance remains fresh;
- no forbidden future-only CLI surface appears in help output.

Mechanical checks can fail validation.

### Subjective guidance

Subjective guidance belongs in selected prompt context and dry-run diagnostics. Examples:

- gameplay values should be data-driven unless a prototype task explicitly allows inline tuning;
- UI code should not own authoritative game state;
- prototype code may prefer speed over final architecture but must document the hypothesis;
- design docs should include player fantasy, rules, edge cases, and acceptance criteria;
- tests should be behavior-oriented rather than source-inspection assertions.

Subjective guidance must not be hidden enforcement. It can appear in prompts, dry-runs, and warnings, but it does not block unless a separate deterministic validation check exists.

## Strictness and stage behavior

Project stage and studio strictness stay separate.

- `design` stage selects design-doc, planning, and scope standards by default.
- `prototype` stage selects prototype-friendly standards and may downgrade some production rules to advisory warnings.
- `development` stage selects stricter implementation and test standards.
- `fast-prototype` strictness keeps rule selection minimal and advisory.
- `guided-studio` strictness selects relevant guidance and warns on missing standards.
- `strict-studio` strictness enables more mechanical checks where deterministic checks exist.

This preserves lightweight prototype use while making deeper studio process available when explicitly chosen.

## Implementation plan

### Task 1: Add rule-pack data model and registry loader

Files:

- Create: `src/rule-packs.ts`
- Create: `tests/rule-packs.test.ts`
- Create: `rules/registry.json`
- Create: initial `rules/*.md` pack files

Behavior:

- load built-in package registry;
- validate schema;
- resolve guidance paths from the package root;
- reject absolute paths and traversal;
- return deterministic pack metadata.

Verification:

```bash
npm run typecheck
npm test -- tests/rule-packs.test.ts
```

### Task 2: Add rule selection

Files:

- Modify: `src/rule-packs.ts`
- Create: `tests/rule-selection.test.ts`

Behavior:

- select packs from path, role, engine, stage, strictness, workflow, and write files;
- never load all packs as fallback;
- return selected and omitted diagnostics;
- enforce prompt budget caps deterministically.

Verification:

```bash
npm test -- tests/rule-selection.test.ts
```

### Task 3: Materialize clone-injectable agent and skill surfaces

Files:

- Modify: `src/agents.ts`
- Modify: `src/generated-surfaces.ts`
- Modify: `src/projects.ts`
- Modify: `src/workflows.ts`
- Modify: `tests/project-workflow.test.ts`
- Modify: `tests/agents-templates.test.ts`
- Modify: `tests/validation.test.ts`

Behavior:

- materialize active-engine role agents under `.codex/agents/**` during `init`;
- keep runtime role prompts under `.codex/prompts/**` until a later migration proves one surface can replace the other;
- materialize workflow skill packages under `.agents/skills/<workflow-id>/SKILL.md` for reusable built-in workflows;
- include provenance metadata for every generated agent and skill file;
- validate freshness and reject wrong-engine generated agents just like wrong-engine prompts.

Verification:

```bash
npm test -- tests/project-workflow.test.ts tests/agents-templates.test.ts tests/validation.test.ts
```

### Task 4: Wire selection into run preparation

Files:

- Modify: `src/runner.ts`
- Modify: `src/codex-prompts.ts`
- Modify: `tests/runner.test.ts`
- Modify: `tests/codex-prompts.test.ts`

Behavior:

- include selected standards in `--dry-run` output;
- include selected standards in prompt packets;
- record selected and omitted pack metadata in run metadata;
- make selected `.codex/agents/**` and `.agents/skills/**` paths visible in dry-run diagnostics when those files are used as context;
- preserve non-mutating behavior for `--dry-run` and `--print-prompt`.

Verification:

```bash
npm test -- tests/runner.test.ts tests/codex-prompts.test.ts
```

### Task 5: Wire selection into task orchestration diagnostics

Files:

- Modify: `src/orchestrator.ts`
- Modify: `src/workflow-recipes.ts` if recipes need default write-scope hints
- Modify: `tests/orchestrator.test.ts`
- Modify: `tests/workflow-recipes.test.ts`

Behavior:

- show selected standards per task during `task orchestrate --dry-run`;
- warn when mutating tasks have no declared write files;
- keep orchestration bounded and foreground-only;
- do not introduce background hooks or hidden scheduler behavior.

Verification:

```bash
npm test -- tests/orchestrator.test.ts tests/workflow-recipes.test.ts
```

### Task 6: Add validation checks and package shipping coverage

Files:

- Modify: `src/validation.ts`
- Modify: `tests/validation.test.ts`
- Modify: `package.json` if `files` needs `rules/**`
- Modify: package smoke tests if present, or add a focused installed-bin asset-loading test

Behavior:

- validate built-in registry shape;
- validate project-local rule-pack overrides;
- validate generated local provenance when local packs are materialized;
- validate generated `.codex/agents/**` and `.agents/skills/**` provenance and freshness;
- fail on missing package assets;
- keep subjective guidance as advisory output only.

Verification:

```bash
npm run typecheck
npm test
npm run validate
```

### Task 7: Update truth and user docs

Files:

- Modify: `docs/architecture/product-boundary.md` only if the product boundary changes; this design should not require a boundary change.
- Modify: `docs/truthmark/engineering/codex/roles-and-workflows.md`
- Modify: `docs/truthmark/engineering/codex/runtime-and-tasks.md`
- Modify: `docs/truthmark/engineering/contracts/cli-and-validation.md`
- Modify: `docs/user-guide.md` if the feature becomes user-visible.

Behavior:

- document rule-pack selection as explicit selected context;
- document clone-injectable `.codex/agents/**` and `.agents/skills/**` surfaces;
- document validation severity split;
- document project-local override behavior;
- avoid describing Truthmark workflow mechanics as a product feature.

Verification:

```bash
truthmark check --json
truthmark index --json
git diff --check
```

## Acceptance criteria

- Built-in rule packs are package assets and load from installed-bin execution.
- A project can run without local rule packs and still receive built-in selected standards.
- A project can materialize local `.codex/studio/rules/**` rule packs with provenance.
- A generated project materializes clone-injectable `.codex/agents/**` files for active-engine roles.
- A generated project materializes clone-injectable `.agents/skills/**` packages for reusable workflow skills.
- Validation detects stale or wrong-engine generated agents and stale generated workflow skills.
- Selection can use path, role, engine, project stage, studio strictness, workflow, and declared write files.
- `run --dry-run` shows selected and omitted standards without writing state.
- Prompt packets include only selected guidance within budget caps.
- Task orchestration dry-runs show standards per task.
- Validation fails deterministic mechanical issues and only warns for subjective guidance.
- No `.claude/**`, Git hooks, background hooks, or hidden lifecycle automation are added.
- Tests prove no unmatched task falls back to loading every rule pack.

## Open questions

1. Should local rule packs be materialized by default during `init`, or only when a project enables customization?
2. Should `.codex/agents/**` duplicate `.codex/prompts/**` in the first pass, or should one surface become a lightweight wrapper pointing to the canonical body?
3. Which workflows deserve `.agents/skills/**` packages in the first pass: all built-in workflows, only task-recipe workflows, or only high-value reusable workflows?
4. Should built-in rules be engine-neutral first, with engine-specific overlays later, or should the first pass include Godot/Unity/Unreal overlays?
5. Should `strict-studio` require declared write files for every mutating task, or should it allow a conservative project-wide write scope with a warning?

## Recommended first implementation slice

Build the visible generated-surface and read-only selection path first:

1. package registry;
2. `.codex/agents/**` materialization for active-engine roles;
3. `.agents/skills/**` materialization for a small workflow-skill set;
4. generated-surface provenance validation;
5. selector;
6. `run --dry-run` selected/omitted diagnostics;
7. prompt inclusion;
8. registry validation.

Defer local rule-pack materialization, full workflow-skill coverage, and strict-studio hard failures until the built-in selector and generated agent/skill surfaces are proven with tests.
