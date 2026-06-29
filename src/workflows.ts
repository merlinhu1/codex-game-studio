import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createCodexStudioSession, type CodexStudioPhase } from "./codex-session.js";
import { selectContextEntries } from "./context-manifest.js";
import { renderCodexPrompt } from "./codex-prompts.js";
import type { EngineId } from "./engines.js";
import { renderContextContract } from "./prompt-context.js";
import type { StudioProjectState } from "./projects.js";
import { isStudioRoleId, type StudioRoleId } from "./roles.js";
import { evaluateStudioRunEligibility } from "./studio-policy.js";
import { engineReferenceContextRequests } from "./engine-reference.js";
import { renderSelectedTemplates, type TemplateId } from "./templates.js";
import { findCustomRole, findCustomWorkflow, projectRelativePath, renderCustomRolePrompt, type CustomWorkflowDefinition } from "./customization.js";
import { defaultModelPolicyForId, type CodexModelName, type ReasoningEffort } from "./prompt-surface-metadata.js";

export type WorkflowCategory =
  | "onboarding-discovery"
  | "design-architecture"
  | "implementation-planning"
  | "qa-testing"
  | "release-hotfix"
  | "localization-accessibility"
  | "team-coordination";

export type WorkflowId =
  | "vertical-slice"
  | "bugfix"
  | "playtest"
  | "market-analysis"
  | "analytics-setup"
  | "design-spec"
  | "game-feel-tuning"
  | "art-direction"
  | "ui-ux-review"
  | "production-milestone"
  | "handoff"
  | "review"
  | "ship-check"
  | "onboard"
  | "brainstorm"
  | "prototype"
  | "architecture-decision"
  | "architecture-review"
  | "create-epics"
  | "create-stories"
  | "sprint-plan"
  | "sprint-status"
  | "story-readiness"
  | "story-done"
  | "qa-plan"
  | "regression-suite"
  | "security-audit"
  | "perf-profile"
  | "release-checklist"
  | "hotfix"
  | "localization-plan";

export type WorkflowDefinition = {
  id: WorkflowId;
  role: StudioRoleId;
  phase: Extract<CodexStudioPhase, "plan" | "implement" | "review" | "ship">;
  objective: string;
  category: WorkflowCategory;
  gapCoverage: string[];
  file: `.codex/workflows/${string}.md`;
  contextFiles: string[];
  templateIds?: TemplateId[];
  cliAlias?: string;
  cliAliases?: string[];
  model: CodexModelName;
  modelReasoningEffort: ReasoningEffort;
};

type WorkflowInput = Omit<WorkflowDefinition, "file" | "contextFiles" | "model" | "modelReasoningEffort"> & {
  extraContextFiles?: string[];
};

function workflow(input: WorkflowInput): WorkflowDefinition {
  const modelPolicy = defaultModelPolicyForId(input.id);
  return {
    ...input,
    file: `.codex/workflows/${input.id}.md`,
    contextFiles: ["AGENTS.md", ".codex/studio.json", `.codex/workflows/${input.id}.md`, ...(input.extraContextFiles ?? [])],
    model: modelPolicy.model,
    modelReasoningEffort: modelPolicy.effort
  };
}

export const workflowRegistry: Record<WorkflowId, WorkflowDefinition> = {
  "vertical-slice": workflow({
    id: "vertical-slice",
    role: "producer",
    phase: "plan",
    category: "implementation-planning",
    gapCoverage: ["vertical-slice planning", "milestone decomposition"],
    objective: "Create a bounded vertical-slice plan with tasks, risks, and verification gates.",
    extraContextFiles: ["documentation/design/gdd.md"]
  }),
  bugfix: workflow({
    id: "bugfix",
    role: "gameplay-programmer",
    phase: "implement",
    category: "release-hotfix",
    gapCoverage: ["defect triage", "bounded implementation repair"],
    objective: "Reproduce, fix, verify, and document a defect with bounded scope."
  }),
  playtest: workflow({
    id: "playtest",
    role: "qa-playtester",
    phase: "review",
    category: "qa-testing",
    gapCoverage: ["playtest reporting", "reproducible issue capture"],
    objective: "Inspect the current build, report reproducible playtest issues, and separate blockers from warnings.",
    templateIds: ["playtest_report", "test_evidence"]
  }),
  "market-analysis": workflow({
    id: "market-analysis",
    role: "market-analyst",
    phase: "plan",
    category: "onboarding-discovery",
    gapCoverage: ["market discovery", "competitor positioning"],
    objective: "Analyze audience, competitors, positioning, pricing, and market risks for the current project.",
    extraContextFiles: ["resources/market-research/market-overview.md"],
    templateIds: ["market_analysis", "pitch_document"],
    cliAlias: "market"
  }),
  "analytics-setup": workflow({
    id: "analytics-setup",
    role: "data-scientist",
    phase: "plan",
    category: "onboarding-discovery",
    gapCoverage: ["analytics onboarding", "success metric planning"],
    objective: "Define analytics events, success metrics, experiment plans, and evidence loops for the current project.",
    templateIds: ["analytics_setup"],
    cliAlias: "analytics"
  }),
  "design-spec": workflow({
    id: "design-spec",
    role: "senior-game-designer",
    phase: "plan",
    category: "design-architecture",
    gapCoverage: ["feature specification", "design acceptance criteria"],
    objective: "Create or review a feature/design spec with rules, edge cases, implementation slices, and acceptance criteria.",
    extraContextFiles: ["documentation/design/gdd.md"],
    templateIds: ["feature_spec", "economy_model", "difficulty_curve", "player_journey"],
    cliAlias: "design-spec"
  }),
  "game-feel-tuning": workflow({
    id: "game-feel-tuning",
    role: "game-feel-designer",
    phase: "review",
    category: "design-architecture",
    gapCoverage: ["game-feel review", "tuning recommendations"],
    objective: "Review moment-to-moment feel, controls, feedback, pacing, and tuning risks with actionable changes.",
    templateIds: ["game_feel_tuning", "difficulty_curve"],
    cliAlias: "feel-review"
  }),
  "art-direction": workflow({
    id: "art-direction",
    role: "senior-game-artist",
    phase: "plan",
    category: "design-architecture",
    gapCoverage: ["art direction", "asset production planning"],
    objective: "Define art direction, visual constraints, asset list, production risks, and review criteria.",
    templateIds: ["art_direction", "art_bible"],
    cliAlias: "art-direction"
  }),
  "ui-ux-review": workflow({
    id: "ui-ux-review",
    role: "ui-ux-designer",
    phase: "review",
    category: "localization-accessibility",
    gapCoverage: ["UX review", "accessibility-aware UI inspection"],
    objective: "Review UI flows, HUD/menu clarity, usability, onboarding, accessibility, and interaction risks.",
    templateIds: ["ui_ux_review", "ux_spec", "accessibility_requirements", "player_journey"],
    cliAlias: "ui-review"
  }),
  "production-milestone": workflow({
    id: "production-milestone",
    role: "producer",
    phase: "plan",
    category: "team-coordination",
    gapCoverage: ["milestone planning", "production risk tracking"],
    objective: "Convert current project state into milestone goals, task slices, risks, owners, and verification gates.",
    extraContextFiles: ["documentation/production/timeline.md"],
    templateIds: ["production_milestone", "risk_register"],
    cliAlias: "milestone"
  }),
  handoff: workflow({
    id: "handoff",
    role: "studio-orchestrator",
    phase: "plan",
    category: "team-coordination",
    gapCoverage: ["role handoff", "next-action routing"],
    objective: "Summarize current state, route next work to the right role, identify blockers, and produce a concise handoff.",
    templateIds: ["handoff"],
    cliAlias: "handoff"
  }),
  review: workflow({
    id: "review",
    role: "qa-playtester",
    phase: "review",
    category: "qa-testing",
    gapCoverage: ["general project review", "verification gap reporting"],
    objective: "Review the current project state and report blockers, warnings, and verification gaps as JSON."
  }),
  "ship-check": workflow({
    id: "ship-check",
    role: "release-manager",
    phase: "ship",
    category: "release-hotfix",
    gapCoverage: ["ship readiness", "release blocker review"],
    objective: "Assess milestone readiness, package risk, validation status, and release blockers.",
    extraContextFiles: ["documentation/production/timeline.md"],
    templateIds: ["ship_check", "release_notes", "risk_register"]
  }),
  onboard: workflow({
    id: "onboard",
    role: "studio-orchestrator",
    phase: "plan",
    category: "onboarding-discovery",
    gapCoverage: ["project onboarding", "repository orientation"],
    objective: "Orient a contributor to the project goal, current stage, key files, active roles, and safest first actions.",
    extraContextFiles: ["documentation/design/gdd.md", "documentation/production/timeline.md"],
    templateIds: ["handoff", "pitch_document"],
    cliAlias: "start",
    cliAliases: ["onboard"]
  }),
  brainstorm: workflow({
    id: "brainstorm",
    role: "creative-director",
    phase: "plan",
    category: "design-architecture",
    gapCoverage: ["concept ideation", "creative option generation"],
    objective: "Generate bounded game ideas, feature variations, player fantasies, and tradeoff notes from the current project constraints.",
    extraContextFiles: ["documentation/design/gdd.md"],
    templateIds: ["pitch_document", "player_journey", "art_bible", "sound_bible"],
    cliAlias: "brainstorm"
  }),
  prototype: workflow({
    id: "prototype",
    role: "producer",
    phase: "plan",
    category: "implementation-planning",
    gapCoverage: ["prototype planning", "playable-loop slicing"],
    objective: "Plan the smallest playable prototype slice with owner roles, required assets, implementation tasks, and validation checks.",
    extraContextFiles: ["documentation/design/gdd.md"],
    templateIds: ["vertical_slice_report", "technical_design", "risk_register"],
    cliAlias: "prototype"
  }),
  "architecture-decision": workflow({
    id: "architecture-decision",
    role: "technical-director",
    phase: "plan",
    category: "design-architecture",
    gapCoverage: ["architecture decision records", "technical tradeoff capture"],
    objective: "Draft an architecture decision with context, options, selected direction, consequences, risks, and verification implications.",
    extraContextFiles: ["documentation/design/gdd.md"],
    templateIds: ["adr", "technical_design", "architecture_traceability"],
    cliAlias: "architecture-decision"
  }),
  "architecture-review": workflow({
    id: "architecture-review",
    role: "technical-director",
    phase: "review",
    category: "design-architecture",
    gapCoverage: ["architecture review", "technical risk review"],
    objective: "Review architecture, engine constraints, module boundaries, technical risks, and validation gaps for a proposed or existing feature.",
    templateIds: ["technical_design", "architecture_traceability"],
    cliAlias: "architecture-review"
  }),
  "create-epics": workflow({
    id: "create-epics",
    role: "producer",
    phase: "plan",
    category: "implementation-planning",
    gapCoverage: ["epic creation", "roadmap decomposition"],
    objective: "Create production epics from the project goal with scope, owners, dependencies, risks, and acceptance signals.",
    extraContextFiles: ["documentation/design/gdd.md", "documentation/production/timeline.md"],
    templateIds: ["production_milestone", "risk_register"],
    cliAlias: "create-epics"
  }),
  "create-stories": workflow({
    id: "create-stories",
    role: "producer",
    phase: "plan",
    category: "implementation-planning",
    gapCoverage: ["story breakdown", "implementation-ready task slicing"],
    objective: "Break an epic or feature into implementation-ready stories with role owner, files or artifacts to inspect, acceptance criteria, and verification gates.",
    extraContextFiles: ["documentation/production/timeline.md"],
    templateIds: ["feature_spec"],
    cliAlias: "create-stories"
  }),
  "sprint-plan": workflow({
    id: "sprint-plan",
    role: "producer",
    phase: "plan",
    category: "team-coordination",
    gapCoverage: ["sprint planning", "iteration commitment"],
    objective: "Plan the next sprint or iteration with committed goals, role assignments, risks, validation gates, and explicit non-goals.",
    extraContextFiles: ["documentation/production/timeline.md"],
    templateIds: ["sprint_plan", "risk_register"],
    cliAlias: "sprint-plan"
  }),
  "sprint-status": workflow({
    id: "sprint-status",
    role: "studio-orchestrator",
    phase: "review",
    category: "team-coordination",
    gapCoverage: ["sprint status", "blocker visibility"],
    objective: "Summarize sprint status, completed work, blockers, risks, next owners, and verification evidence without mutating task state.",
    extraContextFiles: ["documentation/production/timeline.md"],
    templateIds: ["sprint_plan", "postmortem"],
    cliAlias: "sprint-status"
  }),
  "story-readiness": workflow({
    id: "story-readiness",
    role: "producer",
    phase: "review",
    category: "team-coordination",
    gapCoverage: ["story readiness", "definition-of-ready review"],
    objective: "Review whether a story is ready for implementation by checking scope, owner role, context files, acceptance criteria, risks, and verification commands.",
    templateIds: ["feature_spec", "risk_register"],
    cliAlias: "story-readiness"
  }),
  "story-done": workflow({
    id: "story-done",
    role: "qa-playtester",
    phase: "review",
    category: "team-coordination",
    gapCoverage: ["definition of done", "completion review"],
    objective: "Review whether a story is done by checking acceptance criteria, changed artifacts, verification evidence, risks, and follow-up ownership.",
    templateIds: ["test_evidence", "vertical_slice_report", "postmortem"],
    cliAlias: "story-done"
  }),
  "qa-plan": workflow({
    id: "qa-plan",
    role: "qa-playtester",
    phase: "plan",
    category: "qa-testing",
    gapCoverage: ["test planning", "QA strategy"],
    objective: "Create a QA plan with target scenarios, risk areas, test data, manual checks, automated checks, and exit criteria.",
    extraContextFiles: ["documentation/design/gdd.md"],
    templateIds: ["test_plan", "test_evidence", "accessibility_requirements"],
    cliAlias: "qa-plan"
  }),
  "regression-suite": workflow({
    id: "regression-suite",
    role: "qa-playtester",
    phase: "review",
    category: "qa-testing",
    gapCoverage: ["regression suite planning", "test coverage review"],
    objective: "Design or review a regression suite for changed gameplay, UI, engine, content, and release-critical behavior.",
    templateIds: ["test_plan", "test_evidence"],
    cliAlias: "regression-suite"
  }),
  "security-audit": workflow({
    id: "security-audit",
    role: "security-engineer",
    phase: "review",
    category: "qa-testing",
    gapCoverage: ["security review", "abuse-case inspection"],
    objective: "Review security, secrets, dependencies, online surfaces, abuse cases, and mitigation priorities for the project or feature.",
    cliAlias: "security-audit"
  }),
  "perf-profile": workflow({
    id: "perf-profile",
    role: "performance-analyst",
    phase: "review",
    category: "qa-testing",
    gapCoverage: ["performance profiling", "optimization triage"],
    objective: "Plan or review performance profiling across frame time, memory, loading, asset cost, bottlenecks, and measurement evidence.",
    templateIds: ["test_evidence"],
    cliAlias: "perf-profile"
  }),
  "release-checklist": workflow({
    id: "release-checklist",
    role: "release-manager",
    phase: "ship",
    category: "release-hotfix",
    gapCoverage: ["release checklist", "ship gate verification"],
    objective: "Create a release checklist with blockers, warnings, validation commands, packaging checks, rollback notes, and communication needs.",
    extraContextFiles: ["documentation/production/timeline.md"],
    templateIds: ["release_notes", "risk_register", "test_plan"],
    cliAlias: "release-checklist"
  }),
  hotfix: workflow({
    id: "hotfix",
    role: "gameplay-programmer",
    phase: "review",
    category: "release-hotfix",
    gapCoverage: ["hotfix triage", "safe repair planning"],
    objective: "Triage a hotfix by identifying the minimal repair, risk surface, verification commands, rollback plan, and release communication notes.",
    templateIds: ["release_notes", "risk_register", "test_evidence"],
    cliAlias: "hotfix"
  }),
  "localization-plan": workflow({
    id: "localization-plan",
    role: "localization-lead",
    phase: "plan",
    category: "localization-accessibility",
    gapCoverage: ["localization planning", "culturalization readiness"],
    objective: "Create a localization plan with string scope, culturalization risks, asset dependencies, text expansion, subtitles, and verification checks.",
    extraContextFiles: ["documentation/design/gdd.md"],
    templateIds: ["accessibility_requirements", "ux_spec"],
    cliAlias: "localization-plan"
  })
};

export function workflowAliases(workflow: WorkflowDefinition): string[] {
  return [...new Set([workflow.cliAlias, ...(workflow.cliAliases ?? [])].filter((alias): alias is string => Boolean(alias)))];
}

function renderWorkflowTemplates(workflow: WorkflowId, projectRoot?: string): string {
  return renderSelectedTemplates(workflowRegistry[workflow].templateIds ?? [], "## Workflow Templates", projectRoot ? { projectRoot } : {});
}

function readBuiltInWorkflowBody(projectRoot: string, workflow: WorkflowId): string {
  const file = path.join(projectRoot, workflowRegistry[workflow].file);
  return existsSync(file) ? readFileSync(file, "utf8").trim() : `Workflow file missing: ${workflowRegistry[workflow].file}`;
}

function readStudioEngine(projectRoot: string): EngineId {
  const studio = JSON.parse(readFileSync(path.join(projectRoot, ".codex", "studio.json"), "utf8")) as { engine: EngineId };
  return studio.engine;
}

function readWorkflowStudio(projectRoot: string): Pick<StudioProjectState, "mode" | "studioMode" | "engine"> {
  return JSON.parse(readFileSync(path.join(projectRoot, ".codex", "studio.json"), "utf8")) as Pick<StudioProjectState, "mode" | "studioMode" | "engine">;
}

export function workflowIds(): WorkflowId[] {
  return Object.keys(workflowRegistry) as WorkflowId[];
}

export function workflowForAlias(alias: string): WorkflowDefinition | undefined {
  return Object.values(workflowRegistry).find((workflow) => workflowAliases(workflow).includes(alias));
}

export function renderWorkflowPrompt(projectRoot: string, workflow: string): string {
  const builtIn = workflowRegistry[workflow as WorkflowId];
  if (!builtIn) return renderCustomWorkflowPrompt(projectRoot, workflow);
  const config = builtIn;
  const studio = readWorkflowStudio(projectRoot);
  const selection = selectContextEntries(
    projectRoot,
    [
      ...config.contextFiles.map((sourcePath) => ({ sourcePath, reason: `workflow ${workflow} context`, required: true })),
      ...engineReferenceContextRequests(studio.engine, config.role, config.objective)
    ]
  );
  const eligibility = evaluateStudioRunEligibility({
    projectStage: studio.mode,
    studioMode: studio.studioMode,
    phase: config.phase
  });
  const session = createCodexStudioSession({
    projectRoot,
    role: config.role,
    phase: config.phase,
    objective: config.objective,
    engine: readStudioEngine(projectRoot),
    contextFiles: selection.selected.map((entry) => entry.sourcePath),
    allowFileEdits: eligibility.allowFileEdits,
    sandbox: eligibility.codexSandbox,
    writePolicy: eligibility.writePolicy,
    eligibility
  });
  return (
    renderCodexPrompt(
      {
        ...session,
        contextContract: renderContextContract({
          session,
          projectStage: studio.mode,
          studioMode: studio.studioMode,
          entries: selection.entries,
          readOnlyReview: config.phase === "review"
        })
      }
    ) +
    [
      "",
      `## Workflow Instructions: ${config.file}`,
      "",
      readBuiltInWorkflowBody(projectRoot, workflow as WorkflowId),
      renderWorkflowTemplates(workflow as WorkflowId, projectRoot)
    ].join("\n")
  );
}

function renderCustomWorkflowPrompt(projectRoot: string, workflowId: string): string {
  const workflow = findCustomWorkflow(projectRoot, workflowId);
  if (!workflow) throw new Error(`Unknown workflow "${workflowId}"`);
  if (isStudioRoleId(workflow.role)) return renderBuiltInRoleCustomWorkflowPrompt(projectRoot, workflow, workflow.role);
  const role = findCustomRole(projectRoot, workflow.role);
  if (!role) throw new Error(`Custom workflow "${workflow.id}" references unavailable role "${workflow.role}"`);
  const workflowPath = projectRelativePath(projectRoot, workflow.file);
  const workflowBody = workflowPath.ok && existsSync(workflowPath.full) ? readFileSync(workflowPath.full, "utf8").trim() : "Custom workflow file missing.";
  const studio = readWorkflowStudio(projectRoot);
  const selection = selectContextEntries(
    projectRoot,
    [
      { sourcePath: "AGENTS.md", reason: `custom workflow ${workflow.id} instructions`, required: true },
      { sourcePath: ".codex/studio.json", reason: `custom workflow ${workflow.id} project state`, required: true },
      { sourcePath: workflow.file, reason: `custom workflow ${workflow.id} workflow prompt`, required: true },
      { sourcePath: role.promptFile, reason: `custom workflow ${workflow.id} role prompt`, required: true },
      ...workflow.contextFiles.map((sourcePath) => ({ sourcePath, reason: `custom workflow ${workflow.id} context`, required: false }))
    ]
  );
  const eligibility = evaluateStudioRunEligibility({
    projectStage: studio.mode,
    studioMode: studio.studioMode,
    phase: workflow.phase
  });
  return [
    "# Codex Game Studio Custom Workflow",
    "",
    `Workflow ID: ${workflow.id}`,
    `Role: ${role.displayName}`,
    `Role ID: ${role.id}`,
    `Context Strategy: ${role.contextStrategy}`,
    `Phase: ${workflow.phase}`,
    `Project Root: ${projectRoot}`,
    `Objective: ${workflow.objective}`,
    `Engine: ${studio.engine}`,
    `Sandbox: ${eligibility.codexSandbox}`,
    `Write Policy: ${eligibility.writePolicy}`,
    `File Edits: ${eligibility.allowFileEdits ? "allowed" : "not allowed"}`,
    "",
    "## Context Files",
    selection.selected.length ? selection.selected.map((entry) => `- ${entry.sourcePath}`).join("\n") : "- None selected",
    "",
    `## Workflow Instructions: ${workflow.file}`,
    "",
    workflowBody,
    "",
    renderCustomRolePrompt(projectRoot, role),
    renderSelectedTemplates(workflow.templateIds, "## Workflow Templates", { projectRoot })
  ].join("\n");
}

function renderBuiltInRoleCustomWorkflowPrompt(projectRoot: string, workflow: CustomWorkflowDefinition, role: StudioRoleId): string {
  const workflowPath = projectRelativePath(projectRoot, workflow.file);
  const workflowBody = workflowPath.ok && existsSync(workflowPath.full) ? readFileSync(workflowPath.full, "utf8").trim() : "Custom workflow file missing.";
  const studio = readWorkflowStudio(projectRoot);
  const selection = selectContextEntries(projectRoot, [
    { sourcePath: "AGENTS.md", reason: `custom workflow ${workflow.id} instructions`, required: true },
    { sourcePath: ".codex/studio.json", reason: `custom workflow ${workflow.id} project state`, required: true },
    { sourcePath: workflow.file, reason: `custom workflow ${workflow.id} workflow prompt`, required: true },
    ...workflow.contextFiles.map((sourcePath) => ({ sourcePath, reason: `custom workflow ${workflow.id} context`, required: false })),
    ...engineReferenceContextRequests(studio.engine, role, workflow.objective)
  ]);
  const eligibility = evaluateStudioRunEligibility({
    projectStage: studio.mode,
    studioMode: studio.studioMode,
    phase: workflow.phase
  });
  const session = createCodexStudioSession({
    projectRoot,
    role,
    phase: workflow.phase,
    objective: workflow.objective,
    engine: readStudioEngine(projectRoot),
    contextFiles: selection.selected.map((entry) => entry.sourcePath),
    allowFileEdits: eligibility.allowFileEdits,
    sandbox: eligibility.codexSandbox,
    writePolicy: eligibility.writePolicy,
    eligibility
  });
  return [
    renderCodexPrompt({
      ...session,
      contextContract: renderContextContract({
        session,
        projectStage: studio.mode,
        studioMode: studio.studioMode,
        entries: selection.entries,
        readOnlyReview: workflow.phase === "review"
      })
    }),
    "",
    `## Workflow Instructions: ${workflow.file}`,
    "",
    workflowBody,
    renderSelectedTemplates(workflow.templateIds, "## Workflow Templates", { projectRoot })
  ].join("\n");
}
