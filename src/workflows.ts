import { readFileSync } from "node:fs";
import path from "node:path";
import { createCodexStudioSession, type CodexStudioPhase } from "./codex-session.js";
import { selectContextEntries } from "./context-manifest.js";
import { renderCodexPrompt } from "./codex-prompts.js";
import type { EngineId } from "./engines.js";
import { renderContextContract } from "./prompt-context.js";
import type { StudioProjectState } from "./projects.js";
import type { StudioRoleId } from "./roles.js";
import { evaluateStudioRunEligibility } from "./studio-policy.js";
import { renderSelectedTemplates, type TemplateId } from "./templates.js";

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
  | "ship-check";

export type WorkflowDefinition = {
  id: WorkflowId;
  role: StudioRoleId;
  phase: Extract<CodexStudioPhase, "plan" | "implement" | "review" | "ship">;
  objective: string;
  file: `.codex/workflows/${string}.md`;
  contextFiles: string[];
  templateIds?: TemplateId[];
  cliAlias?: string;
};

export const workflowRegistry: Record<WorkflowId, WorkflowDefinition> = {
  "vertical-slice": {
    id: "vertical-slice",
    role: "producer",
    phase: "plan",
    objective: "Create a bounded vertical-slice plan with tasks, risks, and verification gates.",
    file: ".codex/workflows/vertical-slice.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/vertical-slice.md", "documentation/design/gdd.md"]
  },
  bugfix: {
    id: "bugfix",
    role: "gameplay-programmer",
    phase: "implement",
    objective: "Reproduce, fix, verify, and document a defect with bounded scope.",
    file: ".codex/workflows/bugfix.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/bugfix.md"]
  },
  playtest: {
    id: "playtest",
    role: "qa-playtester",
    phase: "review",
    objective: "Inspect the current build, report reproducible playtest issues, and separate blockers from warnings.",
    file: ".codex/workflows/playtest.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/playtest.md"],
    templateIds: ["playtest_report"]
  },
  "market-analysis": {
    id: "market-analysis",
    role: "market-analyst",
    phase: "plan",
    objective: "Analyze audience, competitors, positioning, pricing, and market risks for the current project.",
    file: ".codex/workflows/market-analysis.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/market-analysis.md", "resources/market-research/market-overview.md"],
    templateIds: ["market_analysis"],
    cliAlias: "market"
  },
  "analytics-setup": {
    id: "analytics-setup",
    role: "data-scientist",
    phase: "plan",
    objective: "Define analytics events, success metrics, experiment plans, and evidence loops for the current project.",
    file: ".codex/workflows/analytics-setup.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/analytics-setup.md"],
    templateIds: ["analytics_setup"],
    cliAlias: "analytics"
  },
  "design-spec": {
    id: "design-spec",
    role: "senior-game-designer",
    phase: "plan",
    objective: "Create or review a feature/design spec with rules, edge cases, implementation slices, and acceptance criteria.",
    file: ".codex/workflows/design-spec.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/design-spec.md", "documentation/design/gdd.md"],
    templateIds: ["feature_spec"],
    cliAlias: "design-spec"
  },
  "game-feel-tuning": {
    id: "game-feel-tuning",
    role: "game-feel-designer",
    phase: "review",
    objective: "Review moment-to-moment feel, controls, feedback, pacing, and tuning risks with actionable changes.",
    file: ".codex/workflows/game-feel-tuning.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/game-feel-tuning.md"],
    templateIds: ["game_feel_tuning"],
    cliAlias: "feel-review"
  },
  "art-direction": {
    id: "art-direction",
    role: "senior-game-artist",
    phase: "plan",
    objective: "Define art direction, visual constraints, asset list, production risks, and review criteria.",
    file: ".codex/workflows/art-direction.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/art-direction.md"],
    templateIds: ["art_direction"],
    cliAlias: "art-direction"
  },
  "ui-ux-review": {
    id: "ui-ux-review",
    role: "ui-ux-designer",
    phase: "review",
    objective: "Review UI flows, HUD/menu clarity, usability, onboarding, accessibility, and interaction risks.",
    file: ".codex/workflows/ui-ux-review.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/ui-ux-review.md"],
    templateIds: ["ui_ux_review"],
    cliAlias: "ui-review"
  },
  "production-milestone": {
    id: "production-milestone",
    role: "producer",
    phase: "plan",
    objective: "Convert current project state into milestone goals, task slices, risks, owners, and verification gates.",
    file: ".codex/workflows/production-milestone.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/production-milestone.md", "documentation/production/timeline.md"],
    templateIds: ["production_milestone"],
    cliAlias: "milestone"
  },
  handoff: {
    id: "handoff",
    role: "studio-orchestrator",
    phase: "plan",
    objective: "Summarize current state, route next work to the right role, identify blockers, and produce a concise handoff.",
    file: ".codex/workflows/handoff.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/handoff.md"],
    templateIds: ["handoff"],
    cliAlias: "handoff"
  },
  review: {
    id: "review",
    role: "qa-playtester",
    phase: "review",
    objective: "Review the current project state and report blockers, warnings, and verification gaps as JSON.",
    file: ".codex/workflows/review.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/review.md"]
  },
  "ship-check": {
    id: "ship-check",
    role: "release-manager",
    phase: "ship",
    objective: "Assess milestone readiness, package risk, validation status, and release blockers.",
    file: ".codex/workflows/ship-check.md",
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/workflows/ship-check.md", "documentation/production/timeline.md"],
    templateIds: ["ship_check"]
  }
};

function renderWorkflowTemplates(workflow: WorkflowId): string {
  return renderSelectedTemplates(workflowRegistry[workflow].templateIds ?? [], "## Workflow Templates");
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
  return Object.values(workflowRegistry).find((workflow) => workflow.cliAlias === alias);
}

export function renderWorkflowPrompt(projectRoot: string, workflow: WorkflowId): string {
  const config = workflowRegistry[workflow];
  const studio = readWorkflowStudio(projectRoot);
  const selection = selectContextEntries(
    projectRoot,
    config.contextFiles.map((sourcePath) => ({ sourcePath, reason: `workflow ${workflow} context`, required: true }))
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
    ) + renderWorkflowTemplates(workflow)
  );
}
