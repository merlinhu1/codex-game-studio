# Codex Game Studio Functionality Gap Pass Implementation Plan

> **For Hermes:** Do not implement this plan until Merlin explicitly approves it. When approved, use subagent-driven-development skill to implement this plan task-by-task. Do not rewrite git history, push commits, or rename the package/repo unless Merlin explicitly asks.

**Goal:** Fill the five major functionality gaps versus the Claude Game Studio baseline while preserving the Codex-native architecture: role roster parity, project-specific role materialization, market/analytics workflows, studio orchestration, and richer studio workflow depth.

**Architecture:** Keep `.codex/studio.json` authoritative and `AGENTS.md` as the primary Codex instruction surface. Add richer Codex-native role packages and workflow specs rather than restoring legacy `.gamestudio` state, legacy agent aliases, or `project_orchestrator.md`. Keep the implementation file-backed, deterministic, package-friendly, and test-driven; telemetry, planner/`next`, hard ownership enforcement, and parallel orchestration remain future-only unless explicitly introduced by a later plan.

**Tech Stack:** TypeScript, NodeNext ESM, npm CLI package, Vitest, Codex CLI, file-backed JSON/Markdown project state.

---

## Scope

This pass addresses the first five functionality gaps identified in the Claude Game Studio comparison:

1. **Agent roster parity:** add missing specialized studio functions in Codex-native form.
2. **Project-specific agent materialization:** generate project-aware role prompt files, not just generic prompt stubs.
3. **Market/analytics workflows:** make market and analytics first-class renderable workflow prompts and role-owned inspection loops, not just templates selected by producer tasks. Workflow shortcut commands remain render-only in this pass; executable workflow lifecycle support is explicitly deferred.
4. **Studio orchestration:** add a Codex-native orchestration role/workflow without restoring legacy `project_orchestrator.md`.
5. **Workflow depth:** expand workflow files and CLI surfaces from thin prompt renderers into practical studio operating loops.

## Non-Goals

- Do not restore legacy `.gamestudio/*` state.
- Do not make `project-config.json` authoritative again.
- Do not add backwards-compatible legacy role aliases such as `producer_agent` or `qa_agent`.
- Do not generate `project_orchestrator.md`.
- Do not add interactive `menu` or `startover`.
- Do not add database-backed task storage.
- Do not add parallel orchestration.
- Do not add `opengamestudio next`, telemetry, changed-file tracking, or hard output-ownership enforcement in this pass.
- Do not eagerly generate full competitor reports during `init`; full reports belong to the market workflow.

## Design Decisions

### Role IDs

Decision: use the expanded 16-role Codex-native superset and retain the existing `narrative-designer` role for compatibility and story/content coverage. This yields 17 total roles: the 16-role functionality-gap superset plus the retained current Codex-native narrative role.

Keep Codex-native role IDs, but expand coverage to preserve the upstream functional roles while avoiding a silent compatibility cut:

```ts
export const studioRoleIds = [
  "studio-orchestrator",
  "producer",
  "market-analyst",
  "data-scientist",
  "creative-director",
  "senior-game-designer",
  "game-designer",
  "narrative-designer",
  "game-feel-designer",
  "gameplay-programmer",
  "engine-programmer",
  "tools-programmer",
  "senior-game-artist",
  "technical-artist",
  "ui-ux-designer",
  "qa-playtester",
  "release-manager"
] as const;
```

Rationale:

- This keeps existing Codex-native IDs where they already make sense.
- It adds explicit equivalents for upstream `master_orchestrator`, `market_analyst`, `data_scientist`, `game_feel_developer`, `sr_game_artist`, and `ui_ux_agent`.
- It splits senior/implementation design coverage without restoring underscore legacy names.
- It retains the existing Codex-native `narrative-designer` role so current projects, tests, and story/content workflows do not lose a first-class owner.
- It keeps existing `creative-director`, `engine-programmer`, `tools-programmer`, and `release-manager` as Codex-native value-add roles.

### Parity Crosswalk and Legacy Alias Cut

Decision: document functional parity as a role/function crosswalk, not as legacy role-ID compatibility. The implementation must reject representative legacy underscore aliases with clear guidance instead of silently accepting them.

| Upstream / baseline function | Codex-native owner(s) | Compatibility decision |
|---|---|---|
| `master_orchestrator` / studio routing | `studio-orchestrator` | No `master_orchestrator` or `project_orchestrator.md`; use `handoff` workflow. |
| `producer_agent` / production planning | `producer`, `studio-orchestrator` | No `producer_agent` alias; use `producer`. |
| market research / competitor analysis | `market-analyst` | First-class renderable `market-analysis` workflow and `market` shortcut. |
| analytics / metrics / experiments | `data-scientist` | First-class renderable `analytics-setup` workflow and `analytics` shortcut. |
| creative direction | `creative-director` | Keep Codex-native hyphenated ID. |
| senior systems / economy / progression design | `senior-game-designer` | New explicit senior design owner. |
| feature / acceptance design | `game-designer` | Keep as implementation-level design owner. |
| story / world / content | `narrative-designer` | Retained Codex-native compatibility role. |
| game feel / controls / juice | `game-feel-designer` | New explicit feel owner. |
| gameplay implementation | `gameplay-programmer` | Keep Codex-native hyphenated ID. |
| engine/platform implementation | `engine-programmer` | Keep Codex-native value-add role. |
| internal tools/editor automation | `tools-programmer` | Keep Codex-native value-add role. |
| senior art direction / asset quality bar | `senior-game-artist` | New explicit senior art owner. |
| technical art / pipeline constraints | `technical-artist` | Keep Codex-native value-add role. |
| UI/UX / onboarding / accessibility | `ui-ux-designer` | New explicit UI/UX owner. |
| `qa_agent` / playtest / QA review | `qa-playtester` | No `qa_agent` alias; use `qa-playtester`. |
| release / ship readiness | `release-manager` | Keep Codex-native value-add role. |

Acceptance tests must verify the Codex-native role IDs exist and representative legacy aliases such as `producer_agent`, `qa_agent`, and `master_orchestrator` are not treated as valid `StudioRoleId` values.

### Active Roles by Mode

Use functional parity with the upstream mode intent, adapted to Codex-native IDs:

```ts
always:
  studio-orchestrator
  producer
  market-analyst
  data-scientist

design:
  creative-director
  senior-game-designer
  game-designer
  narrative-designer
  senior-game-artist
  ui-ux-designer

prototype:
  senior-game-designer
  game-designer
  game-feel-designer
  gameplay-programmer
  qa-playtester

development:
  senior-game-designer
  game-designer
  game-feel-designer
  gameplay-programmer
  engine-programmer
  tools-programmer
  qa-playtester
  senior-game-artist
  technical-artist
  ui-ux-designer
  release-manager
```

### Authoritative Studio State Contract

Decision: `.codex/studio.json` must distinguish the full available roster from mode-active roles. Keep `roles` as the full expanded role roster for discoverability, add an explicit `activeRoles` field for `activeAgentsForMode(mode)`, and populate `workflows` from `Object.keys(workflowRegistry)` after the canonical registry exists.

Use this generated state contract or an equivalent typed shape:

```ts
export type StudioProjectState = {
  // existing fields omitted
  roles: StudioRoleId[]; // full available Codex-native roster
  activeRoles: StudioRoleId[]; // mode-active roles from activeAgentsForMode(mode)
  workflows: WorkflowId[]; // generated from workflowRegistry keys
};
```

`statusProject` should print `activeRoles` as active roles, not the full roster. Project validation must assert `roles` equals `studioRoleIds`, `activeRoles` equals `activeAgentsForMode(studio.mode)`, and `workflows` equals the canonical workflow registry keys.

### Project Prompt Materialization

Generated projects should contain project-aware prompt files:

```text
projects/<slug>/
  AGENTS.md
  .codex/
    studio.json
    prompts/
      studio-orchestrator.md
      producer.md
      market-analyst.md
      data-scientist.md
      creative-director.md
      senior-game-designer.md
      game-designer.md
      narrative-designer.md
      game-feel-designer.md
      gameplay-programmer.md
      engine-programmer.md
      tools-programmer.md
      senior-game-artist.md
      technical-artist.md
      ui-ux-designer.md
      qa-playtester.md
      release-manager.md
    workflows/
      vertical-slice.md
      bugfix.md
      playtest.md
      market-analysis.md
      analytics-setup.md
      design-spec.md
      game-feel-tuning.md
      art-direction.md
      ui-ux-review.md
      production-milestone.md
      handoff.md
      review.md
      ship-check.md
```

Only `src/agents.ts` owns generated project `AGENTS.md`. Project-specific prompt body generation may live in `src/agents.ts` or a new helper imported by it; do not put `AGENTS.md` body text in `src/projects.ts`.

### Template Delivery for Workflow Prompts

Decision: keep package templates as the source of truth and inline only the selected template bodies into rendered workflow prompts. Do not rely on project-relative `templates/...` paths unless a future customization feature deliberately materializes project-local template overrides.

Use this contract:

- Project context files remain project-relative and listed as context files, for example `AGENTS.md`, `.codex/studio.json`, `.codex/workflows/<workflow>.md`, `documentation/design/gdd.md`, and `resources/market-research/market-overview.md`.
- Workflow templates are package assets selected by deterministic template IDs such as `market_analysis`, `analytics_setup`, `feature_spec`, and `handoff`.
- `renderWorkflowPrompt` must append a `## Workflow Templates` section containing only the selected template IDs and bodies.
- Each inlined template section must include both the template ID and package source path, for example:

```markdown
## Workflow Templates

### Template: market_analysis
Source: package:templates/market_analysis_template.md

<template body>
```

Rationale:

- Generated projects do not need a copied `templates/` directory, avoiding stale generated assets after package upgrades.
- Codex receives the actual bounded template content, not a broken path string.
- Tests can assert exact template inclusion/exclusion without depending on global or installed-package filesystem layout.
- Package smoke still verifies templates are shipped via `npm pack --dry-run`.

### Workflow Phase Contract

Decision: workflow registry phases must use the existing Codex session phase vocabulary. Use `"implement"` for code-changing/build-style work instead of introducing a new `"build"` phase in this pass. Do not add `"build"` unless a later plan updates `CodexStudioPhase`, validation, defaults, prompt tests, and workflow tests together.

### Canonical Workflow Registry

Decision: create one exported workflow registry as the source of truth for workflow identity, role routing, generated workflow file, prompt context files, selected template IDs, and optional user-facing CLI alias. Project generation, prompt rendering, validation, docs, and tests must consume this registry instead of maintaining parallel hand-written workflow lists.

Use this shape or an equivalent typed object in `src/workflows.ts`:

```ts
export type WorkflowDefinition = {
  id: WorkflowId;
  role: StudioRoleId;
  phase: "plan" | "implement" | "review" | "ship";
  objective: string;
  file: `.codex/workflows/${string}.md`;
  contextFiles: string[];
  templateIds?: TemplateId[];
  cliAlias?: string;
};
```

Workflow identity decisions:

- `review` is a distinct workflow with its own `.codex/workflows/review.md`; it is not an alias for `playtest`.
- `bugfix`, `playtest`, `review`, `ship-check`, and `vertical-slice` remain renderable workflow IDs, but they do not receive new top-level shortcut commands in this pass unless already exposed by the current CLI.
- User-facing shortcut commands are limited to practical studio loops: `market`, `analytics`, `design-spec`, `feel-review`, `art-direction`, `ui-review`, `milestone`, and `handoff`.

### Workflow CLI Surface

Decision: shortcut workflow commands are prompt-rendering helpers in this pass. They render the selected workflow prompt for inspection and do not launch Codex. Actual Codex execution remains through `opengamestudio run <role>`; lifecycle workflow execution can be added by a later plan.

Add explicit workflow commands where they materially improve usability:

```bash
opengamestudio market --project projects/my-game --dry-run
opengamestudio analytics --project projects/my-game --dry-run
opengamestudio design-spec --project projects/my-game --dry-run
opengamestudio feel-review --project projects/my-game --dry-run
opengamestudio art-direction --project projects/my-game --dry-run
opengamestudio ui-review --project projects/my-game --dry-run
opengamestudio milestone --project projects/my-game --dry-run
opengamestudio handoff --project projects/my-game --dry-run
```

For this pass, these commands only render workflow prompts for inspection; they do not launch Codex. Keep actual Codex execution on the existing `opengamestudio run <role>` path. They must not introduce a planner, telemetry, ownership enforcement, or parallel orchestration.

---

## Phase 0: Baseline Audit and Guardrails

### Task 1: Add a parity-gap test scaffold

**Objective:** Create focused tests that encode the five gap areas before changing implementation.

**Files:**
- Create: `tests/functionality-gap-pass.test.ts`
- Modify later: `src/roles.ts`, `src/config.ts`, `src/agents.ts`, `src/projects.ts`, `src/workflows.ts`, `src/cli.ts`, `src/validation.ts`

**Step 1: Write failing tests for role roster coverage**

Create `tests/functionality-gap-pass.test.ts` with imports that compile against current modules:

```ts
import { describe, expect, it } from "vitest";
import { studioRoleIds, rolePackages } from "../src/roles.js";
import { activeAgentsForMode } from "../src/config.js";

const requiredRoles = [
  "studio-orchestrator",
  "producer",
  "market-analyst",
  "data-scientist",
  "creative-director",
  "senior-game-designer",
  "game-designer",
  "narrative-designer",
  "game-feel-designer",
  "gameplay-programmer",
  "engine-programmer",
  "tools-programmer",
  "senior-game-artist",
  "technical-artist",
  "ui-ux-designer",
  "qa-playtester",
  "release-manager"
] as const;

describe("functionality gap pass", () => {
  it("exposes Codex-native roles for the full studio function set", () => {
    expect(studioRoleIds).toEqual(requiredRoles);
    for (const role of requiredRoles) {
      expect(rolePackages[role].systemPrompt.length).toBeGreaterThan(80);
      expect(rolePackages[role].expectedOutputs.length).toBeGreaterThanOrEqual(2);
      expect(rolePackages[role].reviewChecklist.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("selects market, analytics, and orchestration roles in every project mode", () => {
    for (const mode of ["design", "prototype", "development"] as const) {
      expect(activeAgentsForMode(mode)).toEqual(expect.arrayContaining([
        "studio-orchestrator",
        "producer",
        "market-analyst",
        "data-scientist"
      ]));
    }
  });
});
```

**Step 2: Run the test to verify failure**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts
```

Expected: FAIL because `studio-orchestrator`, `market-analyst`, `data-scientist`, `senior-game-designer`, `game-feel-designer`, `senior-game-artist`, and `ui-ux-designer` do not exist yet.

**Step 3: Do not implement yet**

Leave the test failing until Phase 1.

---

## Phase 1: Agent Roster Parity

### Task 2: Expand `StudioRoleId` and role packages

**Objective:** Add the missing Codex-native role packages with concrete prompts and review checklists while retaining the existing `narrative-designer` role.

**Files:**
- Modify: `src/roles.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Test: `tests/roles.test.ts`

**Step 1: Update `studioRoleIds`**

Replace the current `studioRoleIds` list in `src/roles.ts` with the role list from the Design Decisions section.

**Step 2: Replace `rolePackages` with complete package entries**

Each package must have:

- `id`
- `displayName`
- `systemPrompt` of at least one substantial sentence
- `contextStrategy`
- at least two `expectedOutputs`
- `handoffTemplate`
- at least two `reviewChecklist` items

Use this behavior mapping:

```ts
"studio-orchestrator": "Route work between roles, maintain handoffs, protect scope, and identify the next bounded studio action without running hidden parallel work.",
"market-analyst": "Analyze audience, competitors, positioning, pricing, and market risks using project constraints and explicit assumptions.",
"data-scientist": "Define analytics events, success metrics, experiment plans, and evidence loops for design and production decisions.",
"senior-game-designer": "Own high-level systems, progression, economy, and design cohesion across feature slices.",
"narrative-designer": "Shape story, tone, world rules, character/content needs, and narrative consistency while respecting production constraints.",
"game-feel-designer": "Tune controls, feedback, pacing, animation timing, juice, and moment-to-moment player feel.",
"senior-game-artist": "Define art direction, asset style, visual constraints, production quality bars, and asset review notes.",
"ui-ux-designer": "Design interface flows, usability heuristics, HUD layout, onboarding, accessibility, and menu interactions."
```

Do not keep the old generic `game-designer` package as the only design role. Keep it as a mid/implementation designer focused on feature specs and acceptance criteria.

**Step 3: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts tests/roles.test.ts
```

Expected: role coverage tests pass or reveal tests that need legitimate updates for the expanded role set.

### Task 3: Update active role selection by mode

**Objective:** Make generated projects include orchestration, market, and analytics roles by default while preserving mode-specific role intent.

**Files:**
- Modify: `src/config.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Test: `tests/project-workflow.test.ts`

**Step 1: Update `activeAgentsForMode`**

Implement the active-role mapping from the Design Decisions section.

**Step 2: Add assertions for mode-specific roles**

Extend `tests/functionality-gap-pass.test.ts`:

```ts
it("selects mode-specific specialized roles", () => {
  expect(activeAgentsForMode("design")).toEqual(expect.arrayContaining([
    "creative-director",
    "senior-game-designer",
    "game-designer",
    "narrative-designer",
    "senior-game-artist",
    "ui-ux-designer"
  ]));

  expect(activeAgentsForMode("prototype")).toEqual(expect.arrayContaining([
    "senior-game-designer",
    "game-feel-designer",
    "gameplay-programmer",
    "qa-playtester"
  ]));

  expect(activeAgentsForMode("development")).toEqual(expect.arrayContaining([
    "game-feel-designer",
    "engine-programmer",
    "tools-programmer",
    "technical-artist",
    "ui-ux-designer",
    "release-manager"
  ]));
});
```

**Step 3: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts tests/project-workflow.test.ts
```

Expected: PASS after project workflow expected role lists are updated.

---

## Phase 2: Project-Specific Agent Materialization

### Task 4: Add a project prompt rendering helper

**Objective:** Generate project-aware `.codex/prompts/<role>.md` files with project, engine, milestone, role, outputs, and handoff content.

**Files:**
- Modify: `src/agents.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Test: `tests/codex-context-files.test.ts`

**Step 1: Add tests for project-specific prompt content**

Extend `tests/functionality-gap-pass.test.ts` with a temporary project init test. Use existing test fixture helpers if present; otherwise use `mkdtempSync`, `tmpdir`, and `initProject` directly.

Expected assertions:

```ts
expect(promptBody).toContain("Project: Test Studio Game");
expect(promptBody).toContain("Role: Market Analyst");
expect(promptBody).toContain("Engine:");
expect(promptBody).toContain("Current Milestone:");
expect(promptBody).toContain("Expected Outputs");
expect(promptBody).toContain("Handoff");
expect(promptBody).toContain("Competitors:");
```

**Step 2: Implement `renderProjectRolePrompt`**

Add a helper in `src/agents.ts`:

```ts
export function renderProjectRolePrompt(role: StudioRoleId, config: ProjectConfig, engines: EngineConfigRegistry): string {
  const pkg = rolePackages[role];
  const engine = engines[config.project.engine];
  return [
    `# ${pkg.displayName}`,
    "",
    `Project: ${config.project.name}`,
    `Slug: ${config.project.slug}`,
    `Role: ${pkg.displayName}`,
    `Mode: ${config.project.mode}`,
    `Engine: ${engine.display_name} ${config.project.engine_version}`,
    `Current Milestone: ${config.project.mode === "design" ? "design" : config.project.mode === "development" ? "development" : "prototype"}`,
    "",
    "## Project Summary",
    "",
    config.project.concept,
    "",
    `Genre: ${config.project.genre}`,
    `Platform: ${config.project.platform}`,
    `Audience: ${config.project.audience}`,
    `Monetization: ${config.project.monetization}`,
    `Timeline: ${config.project.timeline}`,
    `Competitors: ${config.project.competitors.join(", ") || "none configured"}`,
    "",
    "## Role Instructions",
    "",
    pkg.systemPrompt,
    "",
    "## Engine Context",
    "",
    ...engine.codex_hints.map((hint) => `- ${hint}`),
    "",
    "## Expected Outputs",
    "",
    ...pkg.expectedOutputs.map((item) => `- ${item}`),
    "",
    "## Review Checklist",
    "",
    ...pkg.reviewChecklist.map((item) => `- ${item}`),
    "",
    "## Handoff",
    "",
    pkg.handoffTemplate,
    ""
  ].join("\n");
}
```

Adjust field names if engine config uses a different display name property. Preserve NodeNext `.js` imports.

**Step 3: Update materialization**

In `materializeAgents`, write all `.codex/prompts/<role>.md` files using `renderProjectRolePrompt`. Keep `AGENTS.md` generation in the same owner module.

**Step 4: Remove duplicate generic prompt writer**

`src/projects.ts` currently writes generic prompt files in `writeCodexPromptAndWorkflowFiles`. Move role-prompt writing out of that helper, or make it write workflows only. Avoid writing prompt files in two places.

**Step 5: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts tests/codex-context-files.test.ts tests/project-workflow.test.ts
```

Expected: PASS.

### Task 5: Strengthen validation for project-specific prompts

**Objective:** Validation should reject prompt files that are generic stubs and require project-specific sections.

**Files:**
- Modify: `src/validation.ts`
- Test: `tests/validation.test.ts`
- Test: `tests/functionality-gap-pass.test.ts`

**Step 1: Add validation checks**

In `validateProject`, for each role prompt require these sections/strings:

- `Project: <project name>`
- `Role:`
- `## Project Summary`
- `## Role Instructions`
- `## Expected Outputs`
- `## Handoff`

Use the stable Task 13 validation ID scheme, for example:

```text
codex.role.<role>.prompt.project-summary
codex.role.<role>.prompt.role-instructions
codex.role.<role>.prompt.handoff
```

**Step 2: Add a failure fixture test**

In `tests/validation.test.ts`, create a disposable generated project, overwrite one `.codex/prompts/market-analyst.md` with `# Market Analyst\n`, run `validateProject`, and assert at least one `fail` check for that prompt.

**Step 3: Run validation tests**

Run:

```bash
npm test -- tests/validation.test.ts tests/functionality-gap-pass.test.ts
```

Expected: PASS.

---

## Phase 3: Market and Analytics as First-Class Renderable Workflows

### Task 6: Add canonical workflow registry entries for market and analytics

**Objective:** Add market analysis and analytics setup to the canonical workflow registry while preserving renderable baseline workflows (`vertical-slice`, `bugfix`, `playtest`, distinct `review`, and `ship-check`), and immediately materialize/validate registry-backed workflow files before any shortcut CLI command is exposed.

**Files:**
- Modify: `src/workflows.ts`
- Modify: `src/projects.ts`
- Modify: `src/validation.ts`
- Modify: `src/templates.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Test: `tests/codex-prompts.test.ts`
- Test: `tests/project-workflow.test.ts`
- Test: `tests/validation.test.ts`

**Step 1: Update canonical workflow IDs**

The canonical registry must expose these renderable workflow IDs at this point:

```ts
export type WorkflowId =
  | "vertical-slice"
  | "bugfix"
  | "playtest"
  | "market-analysis"
  | "analytics-setup"
  | "review"
  | "ship-check";
```

`review` must point to `.codex/workflows/review.md`; do not map it to `playtest.md`.

**Step 2: Add workflow registry entries**

Map baseline and new entries in one registry. Existing `vertical-slice` behavior should be preserved; add explicit entries for `bugfix`, `playtest`, distinct `review`, `ship-check`, `market-analysis`, and `analytics-setup` if they do not already exist:

```ts
bugfix: {
  role: "gameplay-programmer",
  phase: "implement",
  objective: "Investigate and fix a focused defect with reproduction steps, targeted changes, and verification notes."
},
playtest: {
  role: "qa-playtester",
  phase: "review",
  objective: "Playtest the current build or slice, identify defects and friction, and recommend prioritized fixes."
},
review: {
  role: "qa-playtester",
  phase: "review",
  objective: "Review project state, implementation quality, risks, and acceptance readiness as a distinct workflow from playtest."
},
"ship-check": {
  role: "release-manager",
  phase: "ship",
  objective: "Check release readiness, risks, blockers, validation status, and ship/no-ship criteria."
},
"market-analysis": {
  role: "market-analyst",
  phase: "plan",
  objective: "Create a competitor-aware market analysis with audience, positioning, monetization, risks, and recommended validation steps.",
  templateIds: ["market_analysis"],
  cliAlias: "market"
},
"analytics-setup": {
  role: "data-scientist",
  phase: "plan",
  objective: "Define analytics events, success metrics, funnels, experiment questions, and implementation handoff notes.",
  templateIds: ["analytics_setup"],
  cliAlias: "analytics"
}
```

Update `src/templates.ts` role metadata so `market_analysis` is discoverable for `market-analyst` and `analytics_setup` is discoverable for `data-scientist`.

**Step 3: Generate and validate registry workflow files**

Before adding any CLI shortcut, update generated project materialization to write workflow files from the canonical registry for `vertical-slice`, `bugfix`, `playtest`, distinct `review`, `ship-check`, `market-analysis`, and `analytics-setup`. Also update `.codex/studio.json.workflows` to use the registry keys and update project validation to assert every `workflowRegistry[id].file` exists and every registry workflow renders.

**Step 4: Include relevant package templates inline**

Update `renderWorkflowPrompt` so:

- `market-analysis` includes a `## Workflow Templates` section with template ID `market_analysis`, source `package:templates/market_analysis_template.md`, and the actual `readTemplate("market_analysis")` body.
- `analytics-setup` includes a `## Workflow Templates` section with template ID `analytics_setup`, source `package:templates/analytics_setup_template.md`, and the actual `readTemplate("analytics_setup")` body.
- Template paths are not added to `contextFiles`; only project-local artifacts belong in `contextFiles`.
- Neither workflow loads all templates.

Use the registry `templateIds` field rather than a separate hand-maintained map. The market and analytics registry entries should declare:

```ts
"market-analysis": { templateIds: ["market_analysis"], /* ... */ }
"analytics-setup": { templateIds: ["analytics_setup"], /* ... */ }
```

**Step 5: Test rendering**

Add assertions that rendered prompts include actual selected template content and exclude unrelated templates:

```ts
const marketPrompt = renderWorkflowPrompt(projectRoot, "market-analysis");
const analyticsPrompt = renderWorkflowPrompt(projectRoot, "analytics-setup");

expect(marketPrompt).toContain("Market Analyst");
expect(marketPrompt).toContain("## Workflow Templates");
expect(marketPrompt).toContain("Template: market_analysis");
expect(marketPrompt).toContain("Source: package:templates/market_analysis_template.md");
expect(marketPrompt).toContain(readTemplate("market_analysis").trim().slice(0, 80));
expect(marketPrompt).not.toContain("Template: analytics_setup");

expect(analyticsPrompt).toContain("Data Scientist");
expect(analyticsPrompt).toContain("Template: analytics_setup");
expect(analyticsPrompt).toContain("Source: package:templates/analytics_setup_template.md");
expect(analyticsPrompt).toContain(readTemplate("analytics_setup").trim().slice(0, 80));
expect(analyticsPrompt).not.toContain("Template: market_analysis");

const marketContextFilesSection = marketPrompt.split("## Context Files")[1].split("## Workflow Templates")[0];
const analyticsContextFilesSection = analyticsPrompt.split("## Context Files")[1].split("## Workflow Templates")[0];
expect(marketContextFilesSection).not.toContain("templates/market_analysis_template.md");
expect(analyticsContextFilesSection).not.toContain("templates/analytics_setup_template.md");
```

The `Source: package:...` checks deliberately prove package-asset provenance; the negative `templates/...` context checks inspect only the `## Context Files` sections so they do not fail on the intended source labels.

**Step 6: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts tests/codex-prompts.test.ts tests/project-workflow.test.ts tests/validation.test.ts
```

Expected: PASS.

### Task 7: Add CLI commands for market and analytics workflows

**Objective:** Make market and analytics workflows discoverable as prompt-rendering shortcut commands without requiring users to know role/task internals.

**Files:**
- Modify: `src/cli.ts`
- Test: `tests/functionality-gap-pass.test.ts` using the existing source-level CLI/help test style; reserve built CLI execution for Phase 7 package smoke.
- Docs later: `README.md`, `docs/examples.md`

**Step 1: Add commands**

Add commands:

```bash
opengamestudio market --project <path> [--dry-run]
opengamestudio analytics --project <path> [--dry-run]
```

Implementation must use the workflow registry `cliAlias` entries and call `renderWorkflowPrompt(projectRoot, "market-analysis")` / `renderWorkflowPrompt(projectRoot, "analytics-setup")`. These shortcut commands render prompts only; they must not launch Codex or create run/session state.

`--dry-run` is accepted as an explicit inspection flag for consistency with existing CLI patterns, but the command output remains a rendered prompt either way.

**Step 2: Add help-surface and inspection-only tests**

Assert CLI help contains `market` and `analytics` but still does not contain future-only `next`, telemetry, or parallel orchestration. Also prove the shortcuts are render-only: set the Codex command environment/config to a failing sentinel, execute each shortcut with and without `--dry-run`, assert the rendered workflow prompt is printed, and assert no new `.codex/runs/*` files are created.

**Step 3: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts
npm run typecheck
```

Expected: PASS.

---

## Phase 4: Codex-Native Studio Orchestration

### Task 8: Add a studio orchestration workflow

**Objective:** Provide orchestration/handoff behavior through Codex-native role prompts and workflow files without generating `project_orchestrator.md`.

**Files:**
- Modify: `src/workflows.ts`
- Modify: `src/projects.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Test: `tests/project-workflow.test.ts`

**Step 1: Add workflow IDs**

Add:

```ts
| "handoff"
| "production-milestone"
```

**Step 2: Add workflow config entries**

Map:

```ts
handoff: {
  role: "studio-orchestrator",
  phase: "plan",
  objective: "Summarize current state, route next work to the right role, identify blockers, and produce a concise handoff.",
  templateIds: ["handoff"],
  cliAlias: "handoff"
},
"production-milestone": {
  role: "producer",
  phase: "plan",
  objective: "Convert current project state into milestone goals, task slices, risks, owners, and verification gates.",
  cliAlias: "milestone"
}
```

**Step 3: Generate workflow files**

Update project workflow materialization so generated projects include:

- `.codex/workflows/handoff.md`
- `.codex/workflows/production-milestone.md`

Each file must include:

- purpose
- inputs
- role routing guidance
- expected outputs
- validation / review checklist

**Step 4: Add tests**

Assert generated projects contain the new workflow files and do **not** contain `project_orchestrator.md`.

```ts
expect(existsSync(path.join(projectRoot, ".codex", "workflows", "handoff.md"))).toBe(true);
expect(existsSync(path.join(projectRoot, "project_orchestrator.md"))).toBe(false);
```

**Step 5: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts tests/project-workflow.test.ts
```

Expected: PASS.

### Task 9: Add a handoff CLI command

**Objective:** Make orchestration visible as `opengamestudio handoff`, not as a hidden or legacy orchestrator file.

**Files:**
- Modify: `src/cli.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Docs later: `README.md`, `docs/examples.md`

**Step 1: Add command**

Add:

```bash
opengamestudio handoff --project <path> [--dry-run]
```

It should render `renderWorkflowPrompt(projectRoot, "handoff")` through the registry `cliAlias: "handoff"` path. It must not launch Codex or create run/session state.

**Step 2: Add assertions**

Assert the handoff prompt contains:

- `Studio Orchestrator`
- `blockers`
- `next role` or equivalent routing language
- `handoff`

Also prove `handoff` is render-only: set the Codex command environment/config to a failing sentinel, run with and without `--dry-run`, and assert no new `.codex/runs/*` files are created.

**Step 3: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts
```

Expected: PASS.

---

## Phase 5: Richer Studio Workflow Depth

### Task 10: Add design, art, UI, and milestone workflows

**Objective:** Expand beyond vertical-slice/bugfix/playtest into practical studio workflows that map to the expanded role roster.

**Files:**
- Modify: `src/workflows.ts`
- Modify: `src/projects.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Test: `tests/project-workflow.test.ts`

**Step 1: Add workflow IDs**

Add:

```ts
| "design-spec"
| "game-feel-tuning"
| "art-direction"
| "ui-ux-review"
```

**Step 2: Add workflow configs**

Map:

```ts
"design-spec": {
  role: "senior-game-designer",
  phase: "plan",
  objective: "Create or review a feature/design spec with rules, edge cases, implementation slices, and acceptance criteria.",
  templateIds: ["feature_spec"],
  cliAlias: "design-spec"
},
"game-feel-tuning": {
  role: "game-feel-designer",
  phase: "review",
  objective: "Review moment-to-moment feel, controls, feedback, pacing, and tuning risks with actionable changes.",
  cliAlias: "feel-review"
},
"art-direction": {
  role: "senior-game-artist",
  phase: "plan",
  objective: "Define art direction, visual constraints, asset list, production risks, and review criteria.",
  cliAlias: "art-direction"
},
"ui-ux-review": {
  role: "ui-ux-designer",
  phase: "review",
  objective: "Review UI flows, HUD/menu clarity, usability, onboarding, accessibility, and interaction risks.",
  cliAlias: "ui-review"
}
```

**Step 3: Generate workflow files**

Update workflow materialization from the canonical registry so generated projects include markdown files for each new workflow. Also ensure existing renderable registry entries materialize as files, including distinct `.codex/workflows/review.md` and `.codex/workflows/ship-check.md`. Each file must contain:

```markdown
# <Workflow Name>

## Purpose

## Inputs

## Role

## Outputs

## Validation
```

**Step 4: Add tests**

Assert all workflow files exist and render through `renderWorkflowPrompt`, including a distinct `review` prompt that reads `.codex/workflows/review.md` rather than `.codex/workflows/playtest.md`.

**Step 5: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts tests/project-workflow.test.ts
```

Expected: PASS.

### Task 11: Add CLI commands for the richer workflows

**Objective:** Expose selected user-facing workflows through simple prompt-rendering commands.

**Files:**
- Modify: `src/cli.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Docs later: `README.md`, `docs/examples.md`

**Step 1: Add commands**

Add command mappings:

```text
design-spec -> design-spec
feel-review -> game-feel-tuning
art-direction -> art-direction
ui-review -> ui-ux-review
milestone -> production-milestone
```

These aliases must come from the canonical workflow registry `cliAlias` field. Do not add shortcut commands for every `WorkflowId`; `bugfix`, `playtest`, `review`, `ship-check`, and `vertical-slice` remain renderable workflows without new top-level shortcuts in this pass unless the current CLI already exposes them.

Each command should require `--project <path>`, accept `--dry-run` as an explicit inspection flag, and render the workflow prompt without launching Codex.

**Step 2: Add help/discovery and inspection-only tests**

Assert help includes the new commands and still omits future-only surfaces:

- no `next`
- no telemetry command
- no parallel command

Also add one shared test over every `workflowRegistry` entry with a `cliAlias`: set Codex to a failing sentinel, execute the shortcut with and without `--dry-run`, assert prompt output, and assert no `.codex/runs/*` files are created.

**Step 3: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts
npm run typecheck
```

Expected: PASS.

### Task 12: Improve workflow prompt context and package-template selection

**Objective:** Ensure each workflow includes the right project artifacts and selected package-template bodies without loading everything or emitting broken project-relative template paths.

**Files:**
- Modify: `src/workflows.ts`
- Test: `tests/functionality-gap-pass.test.ts`
- Test: `tests/codex-prompts.test.ts`

**Step 1: Add registry context and template fields**

Use the canonical workflow registry for both project-local context files and package-template IDs. Do not put `templates/...` paths in context files.

```ts
import { readTemplate, templateRegistry, type TemplateId } from "./templates.js";

export const workflowRegistry = {
  "vertical-slice": {
    file: ".codex/workflows/vertical-slice.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/vertical-slice.md", "documentation/design/gdd.md"]
  },
  bugfix: {
    file: ".codex/workflows/bugfix.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/bugfix.md"]
  },
  playtest: {
    file: ".codex/workflows/playtest.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/playtest.md"]
  },
  review: {
    file: ".codex/workflows/review.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/review.md"]
  },
  "market-analysis": {
    file: ".codex/workflows/market-analysis.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/market-analysis.md", "resources/market-research/market-overview.md"],
    templateIds: ["market_analysis"]
  },
  "analytics-setup": {
    file: ".codex/workflows/analytics-setup.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/analytics-setup.md"],
    templateIds: ["analytics_setup"]
  },
  "design-spec": {
    file: ".codex/workflows/design-spec.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/design-spec.md", "documentation/design/gdd.md"],
    templateIds: ["feature_spec"]
  },
  "game-feel-tuning": {
    file: ".codex/workflows/game-feel-tuning.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/game-feel-tuning.md"]
  },
  "art-direction": {
    file: ".codex/workflows/art-direction.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/art-direction.md"]
  },
  "ui-ux-review": {
    file: ".codex/workflows/ui-ux-review.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/ui-ux-review.md"]
  },
  "production-milestone": {
    file: ".codex/workflows/production-milestone.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/production-milestone.md", "documentation/production/timeline.md"]
  },
  handoff: {
    file: ".codex/workflows/handoff.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/handoff.md"],
    templateIds: ["handoff"]
  },
  "ship-check": {
    file: ".codex/workflows/ship-check.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/ship-check.md", "documentation/production/timeline.md"]
  }
} satisfies Record<WorkflowId, WorkflowDefinition>;
```

The complete implementation should keep role, phase, objective, and `cliAlias` in the same registry entries; the snippet above focuses on context/template fields.
**Step 2: Render selected templates inline**

Add a deterministic helper that appends selected package-template bodies after the base prompt:

```ts
function renderWorkflowTemplates(workflow: WorkflowId): string {
  const templateIds = workflowRegistry[workflow].templateIds ?? [];
  if (templateIds.length === 0) return "";
  return [
    "",
    "## Workflow Templates",
    "",
    ...templateIds.flatMap((id) => {
      const info = templateRegistry[id];
      return [
        `### Template: ${id}`,
        `Source: package:${info.path}`,
        "",
        readTemplate(id).trim(),
        ""
      ];
    })
  ].join("\n");
}
```

Then `renderWorkflowPrompt` should call `renderCodexPrompt(...)` with only `workflowRegistry[workflow].contextFiles` as context files and append `renderWorkflowTemplates(workflow)` to the result.

**Step 3: Add tests for bounded context**

Assert:

- every workflow template ID is discoverable for its owning workflow role: for each `workflowRegistry` entry, every `templateIds` item has `templateRegistry[id].roles` containing `workflow.role`.
- market prompt includes `Template: market_analysis`, `Source: package:templates/market_analysis_template.md`, and actual `readTemplate("market_analysis")` content.
- analytics prompt includes `Template: analytics_setup`, `Source: package:templates/analytics_setup_template.md`, and actual `readTemplate("analytics_setup")` content.
- design-spec includes `Template: feature_spec`; handoff includes `Template: handoff`.
- market prompt does not include `Template: analytics_setup`; analytics prompt does not include `Template: market_analysis`.
- UI review, playtest, review, and QA-oriented prompts do not include `## Workflow Templates` unless they are deliberately assigned template IDs later.
- the `## Context Files` section never contains `templates/*.md` paths.

**Step 4: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts tests/codex-prompts.test.ts
```

Expected: PASS.

---

## Phase 6: Validation and Documentation

### Task 13: Update validation for expanded role/workflow contract

**Objective:** Make `opengamestudio validate` enforce the expanded functional contract.

**Files:**
- Modify: `src/validation.ts`
- Test: `tests/validation.test.ts`
- Test: `tests/functionality-gap-pass.test.ts`

**Step 1: Update repo validation**

Ensure repo validation checks:

- all expanded role packages render.
- all workflow prompts render from the canonical workflow registry.
- required templates still exist.
- CLI/help surface does not expose future-only planner/`next`, telemetry, or parallel features.
- ownership enforcement is rejected only when it appears as an explicit CLI/help/config surface; do not add brittle semantic scans for ownership behavior.
- `.codex/studio.json.roles` equals the full `studioRoleIds` roster, `.codex/studio.json.activeRoles` equals `activeAgentsForMode(studio.mode)`, and `.codex/studio.json.workflows` equals the canonical workflow registry keys.
- representative legacy aliases such as `producer_agent`, `qa_agent`, and `master_orchestrator` are rejected with clear guidance rather than accepted as roles.

Use stable validation IDs:

```text
codex.role.<role>.package-render
codex.role.<role>.prompt.exists
codex.role.<role>.prompt.project-summary
codex.role.<role>.prompt.engine-context
codex.role.<role>.prompt.role-instructions
codex.role.<role>.prompt.expected-outputs
codex.role.<role>.prompt.review-checklist
codex.role.<role>.prompt.handoff
codex.workflow.<id>.registry
codex.workflow.<id>.file.exists
codex.workflow.<id>.sections
codex.workflow.<id>.render
codex.template.<id>.exists
codex.surface.future.next
codex.surface.future.telemetry
codex.surface.future.parallel
codex.surface.future.ownership
```

`codex.surface.future.ownership` should only fail on a concrete exposed command, help text, or config field for hard ownership enforcement.

**Step 2: Update project validation**

Ensure project validation checks:

- every expanded role prompt exists.
- every expanded workflow file exists and every registry workflow renders.
- project-specific prompt sections are present.
- no `project_orchestrator.md` exists.
- no `.gamestudio/runs` exists.
- no generated `CODEX.md` exists.

**Step 3: Add failure tests**

Add tests that delete or corrupt:

- `.codex/prompts/studio-orchestrator.md`
- `.codex/workflows/market-analysis.md`
- `.codex/workflows/ui-ux-review.md`

Validation should fail with clear check IDs.

**Step 4: Run focused validation tests**

Run:

```bash
npm test -- tests/validation.test.ts tests/functionality-gap-pass.test.ts
```

Expected: PASS.

### Task 14: Update README and examples

**Objective:** Document the expanded functional surface without claiming future-only features.

**Files:**
- Modify: `README.md`
- Modify: `docs/examples.md`
- Modify: `docs/workflow-validation.md`
- Modify: `docs/known-upstream-differences.md`
- Test: docs are indirectly checked by validation; add direct tests only if existing docs tests exist.

**Step 1: Update role list**

Document the expanded Codex-native role roster and note it preserves Claude Game Studio functional coverage without legacy role IDs while retaining `narrative-designer` as an existing Codex-native story/content role.

**Step 2: Add workflow examples**

Add examples:

```bash
npm run build && node dist/cli.js market --project projects/rogue-core --dry-run
npm run build && node dist/cli.js analytics --project projects/rogue-core --dry-run
npm run build && node dist/cli.js handoff --project projects/rogue-core --dry-run
npm run build && node dist/cli.js design-spec --project projects/rogue-core --dry-run
npm run build && node dist/cli.js feel-review --project projects/rogue-core --dry-run
npm run build && node dist/cli.js ui-review --project projects/rogue-core --dry-run
```

Repo-local docs must use npm scripts or built CLI, not bare `open-gamestudio`, unless describing installed package UX.

**Step 3: Update known differences**

Move the first five gaps out of “future-only/missing” language where appropriate:

- role roster coverage now preserved in Codex-native IDs, with `narrative-designer` retained for compatibility and story/content ownership.
- project-specific role prompts now materialized in `.codex/prompts`.
- market and analytics are first-class renderable workflow prompts owned by dedicated roles; executable workflow lifecycle support remains future-only.
- orchestration is provided by `studio-orchestrator` and `handoff`, not `project_orchestrator.md`.
- richer workflows exist, but planner/telemetry/parallel remain future-only.

**Step 4: Run docs-adjacent checks**

Run:

```bash
npm run validate
```

Expected: PASS.

---

## Phase 7: Full Verification

### Task 15: Run full verification suite

**Objective:** Prove the expanded functionality is complete, typed, validated, and package-safe.

**Files:**
- No code changes unless verification finds defects.

**Step 1: Run focused tests**

Run:

```bash
npm test -- tests/functionality-gap-pass.test.ts tests/roles.test.ts tests/project-workflow.test.ts tests/codex-context-files.test.ts tests/validation.test.ts tests/codex-prompts.test.ts
```

Expected: PASS.

**Step 2: Run full tests**

Run:

```bash
npm test
```

Expected: PASS.

**Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

**Step 4: Run validation**

Run:

```bash
npm run validate
```

Expected: PASS. Because validation checks Codex readiness, failure here means Codex CLI/auth must be fixed before parity is claimed. Do not claim parity/readiness before this Phase 7 validation gate passes.

**Step 5: Run build and package smoke**

Run:

```bash
npm run build
npm pack --dry-run
```

Expected: PASS. `npm pack --dry-run` should include built CLI, engine configs, templates, and any runtime assets needed by expanded workflows.

---

## Acceptance Criteria

The functionality-gap pass is complete when all are true:

- `studioRoleIds` includes the expanded 16-role Codex-native superset plus retained `narrative-designer` role.
- Every role has a non-trivial role package with expected outputs, handoff, and review checklist.
- `activeAgentsForMode` includes orchestration, market, and analytics roles in every mode.
- `.codex/studio.json` records full `roles`, mode-specific `activeRoles`, and registry-derived `workflows`, and status output uses `activeRoles` for active-role reporting.
- Generated projects materialize project-specific `.codex/prompts/<role>.md` files for every role.
- Generated role prompt files include project summary, engine context, role instructions, expected outputs, review checklist, and handoff.
- Generated projects include the expanded workflow files.
- Market and analytics workflows render through dedicated roles and bounded template/context selection, without claiming executable workflow lifecycle support.
- Handoff/orchestration is available through `studio-orchestrator` and the prompt-rendering `opengamestudio handoff` shortcut, without `project_orchestrator.md`.
- Design, game-feel, art-direction, UI/UX, production milestone, distinct review, ship-check, playtest, bugfix, vertical-slice, market, analytics, and handoff workflows render successfully from the canonical workflow registry.
- Validation fails with the stable check IDs listed in Task 13 when required role prompts or workflow files are missing/corrupt.
- Representative legacy role aliases are rejected with clear guidance.
- Every workflow shortcut command with a `cliAlias` renders without launching Codex and without creating `.codex/runs/*` files.
- Validation still rejects future-only exposed surfaces: planner/`next`, telemetry, parallel orchestration, and explicit CLI/help/config surfaces for hard ownership enforcement.
- No generated `CODEX.md` appears.
- No `.gamestudio/runs` appears.
- `npm test`, `npm run typecheck`, `npm run validate`, `npm run build`, and `npm pack --dry-run` pass.

## Suggested Implementation Order

1. Role roster tests and `src/roles.ts` expansion.
2. Mode selection updates in `src/config.ts`.
3. Project-specific prompt rendering in `src/agents.ts`.
4. Project workflow file generation cleanup in `src/projects.ts`.
5. Market and analytics workflows in `src/workflows.ts`.
6. Handoff/orchestration workflow and CLI command.
7. Richer design/art/UI/milestone workflow set.
8. Validation hardening.
9. Docs and examples.
10. Full verification.

## Review Notes for Merlin

This plan intentionally fills the five practical functionality gaps while staying Codex-native. Review decisions are closed as follows: workflow phases use existing Codex phases (`implement`, not `build`); `.codex/studio.json` separates full `roles` from mode-specific `activeRoles`; registry workflow files and validation land before CLI aliases; shortcut commands are render-only and must not launch Codex or create run state; validation IDs use the Task 13 `codex.role.<role>.prompt.*` scheme; parity is documented through a crosswalk with explicit legacy-alias rejection. Merlin has approved the expanded 16-role Codex-native superset and retaining the current `narrative-designer` role, for 17 total roles. Merlin has also approved package templates as the source of truth with selected template bodies inlined into workflow prompts; do not switch back to project-relative `templates/...` context paths unless a future customization feature deliberately materializes project-local template overrides. Merlin has also approved the follow-up design calls: shortcut workflow commands render prompts only, `review` is a distinct workflow, one canonical workflow registry owns workflow metadata, only selected user-facing workflows get shortcut CLI aliases, and validation uses stable check IDs with ownership enforcement checked only as an explicit exposed surface.

Do not revise Phase 1 down to strict 12-role parity unless Merlin explicitly reopens the product decision.
