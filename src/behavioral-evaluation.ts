import { createCodexStudioSession, type CodexStudioPhase } from "./codex-session.js";
import { renderCodexPrompt } from "./codex-prompts.js";
import { renderWorkflowPrompt, workflowRegistry, type WorkflowId } from "./workflows.js";
import { rolePackages, type StudioRoleId } from "./roles.js";
import { renderSelectedTemplates, type TemplateId } from "./templates.js";

export type BehavioralEvaluationTarget =
  | { kind: "role"; role: StudioRoleId; phase: CodexStudioPhase; objective: string; contextFiles?: string[] }
  | { kind: "workflow"; workflow: WorkflowId };

export type BehavioralEvaluationScenario = {
  id: string;
  description: string;
  target: BehavioralEvaluationTarget;
  requiredPhrases: string[];
  forbiddenPhrases: string[];
  expectedContextCategories: string[];
  requiredTemplateIds?: TemplateId[];
  forbiddenTemplateIds?: TemplateId[];
  maxPromptLength?: number;
};

export type BehavioralEvaluationResult = {
  id: string;
  status: "pass" | "fail";
  prompt: string;
  promptLength: number;
  localDeterministic: true;
  usesHostedEvaluator: false;
  usesLlmCall: false;
  missingRequiredPhrases: string[];
  presentForbiddenPhrases: string[];
  missingContextCategories: string[];
  missingTemplateIds: TemplateId[];
  presentForbiddenTemplateIds: TemplateId[];
};

const defaultForbiddenDrift = ["CODEX.md", "telemetry", "hidden memory", "hosted service", "hosted orchestration", "background loop", "unbounded parallel", "planner/next"];

function withDefaultForbidden(extra: string[] = []): string[] {
  return [...new Set([...defaultForbiddenDrift, ...extra])];
}

export const behavioralEvaluationScenarios: BehavioralEvaluationScenario[] = [
  {
    id: "role.gameplay-programmer.contract",
    description: "Gameplay programmer prompts require implementation handoff fields, verification evidence, and bounded Codex-native edit guidance.",
    target: {
      kind: "role",
      role: "gameplay-programmer",
      phase: "implement",
      objective: "Implement a bounded playable movement change.",
      contextFiles: ["AGENTS.md", ".codex/studio.json", "source/project-game/player.gd"]
    },
    requiredPhrases: ["Role: Gameplay Programmer", "Context Strategy: focused", "## Responsibilities", "Changed files", "Verification evidence", "File Edits: allowed"],
    forbiddenPhrases: withDefaultForbidden(["Template: market_analysis"]),
    expectedContextCategories: ["project-instructions", "studio-state", "source-artifact", "role-contract", "output-contract"],
    maxPromptLength: 15000
  },
  {
    id: "role.qa-playtester.contract",
    description: "QA playtester prompts require reproducible issue evidence, severity, expected/actual result fields, and no implementation-only drift.",
    target: {
      kind: "role",
      role: "qa-playtester",
      phase: "review",
      objective: "Review current playtest blockers and warnings.",
      contextFiles: ["AGENTS.md", ".codex/studio.json", "documentation/design/gdd.md"]
    },
    requiredPhrases: ["Role: QA Playtester", "Issue ID", "Severity", "Reproduction steps", "Expected result", "Actual result", "File Edits: not allowed"],
    forbiddenPhrases: withDefaultForbidden(["danger-full-access", "Template: release_notes"]),
    expectedContextCategories: ["project-instructions", "studio-state", "project-docs", "role-contract", "output-contract"],
    maxPromptLength: 15000
  },
  {
    id: "role.release-manager.contract",
    description: "Release manager prompts require release decision structure, blocker separation, validation evidence, and release-readiness guidance.",
    target: {
      kind: "role",
      role: "release-manager",
      phase: "ship",
      objective: "Assess whether the milestone is ready to ship.",
      contextFiles: ["AGENTS.md", ".codex/studio.json", "documentation/production/timeline.md"]
    },
    requiredPhrases: ["Role: Release Manager", "Release decision", "Blocking issues", "Validation evidence", "Rollback notes", "release blockers"],
    forbiddenPhrases: withDefaultForbidden(["Template: analytics_setup"]),
    expectedContextCategories: ["project-instructions", "studio-state", "project-docs", "role-contract", "output-contract"],
    maxPromptLength: 15000
  },
  {
    id: "workflow.ship-check.release-readiness",
    description: "Ship-check workflow prompts must select release templates, timeline context, and release-manager evidence without pulling unrelated market or analytics templates.",
    target: { kind: "workflow", workflow: "ship-check" },
    requiredPhrases: ["Role: Release Manager", workflowRegistry["ship-check"].objective, "Blocking issues", "Validation evidence", "documentation/production/timeline.md"],
    forbiddenPhrases: withDefaultForbidden(["Template: market_analysis", "Template: analytics_setup"]),
    expectedContextCategories: ["project-instructions", "studio-state", "workflow-file", "project-docs", "templates", "role-contract", "output-contract"],
    requiredTemplateIds: ["ship_check", "release_notes", "risk_register"],
    forbiddenTemplateIds: ["market_analysis", "analytics_setup"],
    maxPromptLength: 15000
  },
  {
    id: "workflow.playtest.issue-evidence",
    description: "Playtest workflow prompts must select playtest evidence templates and QA issue contract fields without mutating project state.",
    target: { kind: "workflow", workflow: "playtest" },
    requiredPhrases: ["Role: QA Playtester", workflowRegistry.playtest.objective, "Reproduction steps", "Evidence", "File Edits: not allowed"],
    forbiddenPhrases: withDefaultForbidden(["Template: release_notes", "danger-full-access"]),
    expectedContextCategories: ["project-instructions", "studio-state", "workflow-file", "templates", "role-contract", "output-contract"],
    requiredTemplateIds: ["playtest_report", "test_evidence"],
    forbiddenTemplateIds: ["release_notes", "market_analysis"],
    maxPromptLength: 15000
  },
  {
    id: "workflow.market-analysis.positioning",
    description: "Market-analysis workflow prompts must select market and pitch material while avoiding analytics-only and release-only templates.",
    target: { kind: "workflow", workflow: "market-analysis" },
    requiredPhrases: ["Role: Market Analyst", workflowRegistry["market-analysis"].objective, "resources/market-research/market-overview.md", "Expected Outputs"],
    forbiddenPhrases: withDefaultForbidden(["Template: analytics_setup", "Template: release_notes"]),
    expectedContextCategories: ["project-instructions", "studio-state", "workflow-file", "project-docs", "templates", "role-contract"],
    requiredTemplateIds: ["market_analysis", "pitch_document"],
    forbiddenTemplateIds: ["analytics_setup", "release_notes"],
    maxPromptLength: 15000
  },
  {
    id: "workflow.vertical-slice.uplift-contract",
    description: "Vertical-slice prompts carry production planning structure, verification evidence, and stop-condition language.",
    target: { kind: "workflow", workflow: "vertical-slice" },
    requiredPhrases: ["Role: Producer", workflowRegistry["vertical-slice"].objective, "validation evidence", "Stop Conditions"],
    forbiddenPhrases: withDefaultForbidden(["Template: market_analysis"]),
    expectedContextCategories: ["project-instructions", "studio-state", "workflow-file", "project-docs", "role-contract", "output-contract"],
    maxPromptLength: 15000
  },
  {
    id: "workflow.bugfix.uplift-contract",
    description: "Bugfix prompts require reproduction, bounded fix output, and verification evidence.",
    target: { kind: "workflow", workflow: "bugfix" },
    requiredPhrases: ["Role: Gameplay Programmer", workflowRegistry.bugfix.objective, "Changed files", "Verification evidence", "Stop Conditions"],
    forbiddenPhrases: withDefaultForbidden(["Template: release_notes"]),
    expectedContextCategories: ["project-instructions", "studio-state", "workflow-file", "role-contract", "output-contract"],
    maxPromptLength: 15000
  },
  {
    id: "workflow.prototype.uplift-contract",
    description: "Prototype prompts require falsifiable experiment framing and cleanup/handoff boundaries.",
    target: { kind: "workflow", workflow: "prototype" },
    requiredPhrases: ["Role: Producer", workflowRegistry.prototype.objective, "Expected Outputs", "validation evidence", "Stop Conditions"],
    forbiddenPhrases: withDefaultForbidden(["Template: release_notes"]),
    expectedContextCategories: ["project-instructions", "studio-state", "workflow-file", "role-contract", "output-contract"],
    maxPromptLength: 15000
  },
  {
    id: "workflow.release-checklist.uplift-contract",
    description: "Release-checklist prompts require blocker separation and release verification evidence.",
    target: { kind: "workflow", workflow: "release-checklist" },
    requiredPhrases: ["Role: Release Manager", workflowRegistry["release-checklist"].objective, "Blocking issues", "Validation evidence", "Stop Conditions"],
    forbiddenPhrases: withDefaultForbidden(["Template: market_analysis"]),
    expectedContextCategories: ["project-instructions", "studio-state", "workflow-file", "role-contract", "output-contract"],
    maxPromptLength: 15000
  },
  {
    id: "role.game-designer.design-system-uplift",
    description: "Design-system prompts require game-designer output structure, quality gates, and handoff evidence.",
    target: { kind: "role", role: "game-designer", phase: "plan", objective: "Create a design-system update for player-facing ability rules.", contextFiles: ["AGENTS.md", ".codex/studio.json", "documentation/design/gdd.md"] },
    requiredPhrases: ["Role: Game Designer", "## Responsibilities", "Quality Gates", "Acceptance criteria", "## Verification"],
    forbiddenPhrases: withDefaultForbidden(["Template: release_notes"]),
    expectedContextCategories: ["project-instructions", "studio-state", "project-docs", "role-contract", "output-contract"],
    maxPromptLength: 15000
  }
];

function renderScenarioPrompt(scenario: BehavioralEvaluationScenario, options: { projectRoot?: string } = {}): string {
  if (scenario.target.kind === "workflow") {
    const definition = workflowRegistry[scenario.target.workflow];
    if (options.projectRoot) return renderWorkflowPrompt(options.projectRoot, scenario.target.workflow);
    return (
      renderCodexPrompt(
        createCodexStudioSession({
          projectRoot: options.projectRoot ?? process.cwd(),
          role: definition.role,
          objective: definition.objective,
          phase: definition.phase,
          engine: "godot",
          contextFiles: definition.contextFiles
        })
      ) + renderSelectedTemplates(definition.templateIds ?? [], "## Workflow Templates")
    );
  }

  return renderCodexPrompt(
    createCodexStudioSession({
      projectRoot: options.projectRoot ?? process.cwd(),
      role: scenario.target.role,
      objective: scenario.target.objective,
      phase: scenario.target.phase,
      engine: "godot",
      contextFiles: scenario.target.contextFiles
    })
  );
}

function actualContextCategories(scenario: BehavioralEvaluationScenario, prompt: string): string[] {
  const categories = new Set<string>();
  if (prompt.includes("AGENTS.md")) categories.add("project-instructions");
  if (prompt.includes(".codex/studio.json")) categories.add("studio-state");
  if (prompt.includes(".codex/workflows/")) categories.add("workflow-file");
  if (/documentation\/|resources\//.test(prompt)) categories.add("project-docs");
  if (/source\//.test(prompt)) categories.add("source-artifact");
  if (prompt.includes("docs/engine-reference/")) categories.add("engine-reference");
  if (prompt.includes("## Workflow Templates") || (scenario.target.kind === "workflow" && (workflowRegistry[scenario.target.workflow].templateIds?.length ?? 0) > 0)) categories.add("templates");
  if (prompt.includes("## Responsibilities") && prompt.includes("## Quality Gates")) categories.add("role-contract");
  if (prompt.includes("## Output Format") || prompt.includes("## Expected Outputs")) categories.add("output-contract");
  return [...categories];
}

function templateToken(id: TemplateId): string {
  return `Template: ${id}`;
}

function containsForbiddenDrift(prompt: string, phrase: string): boolean {
  const haystack = prompt.toLowerCase();
  const needle = phrase.toLowerCase();
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    const window = haystack.slice(Math.max(0, index - 90), Math.min(haystack.length, index + needle.length + 90));
    const negated = /do not|must not|not exposed|without|forbidden|excluded|absent/.test(window);
    if (!negated) return true;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return false;
}

export function evaluateBehavioralScenario(scenario: BehavioralEvaluationScenario, options: { projectRoot?: string } = {}): BehavioralEvaluationResult {
  const prompt = renderScenarioPrompt(scenario, options);
  const categories = actualContextCategories(scenario, prompt);
  const missingRequiredPhrases = scenario.requiredPhrases.filter((phrase) => !prompt.includes(phrase));
  const presentForbiddenPhrases = scenario.forbiddenPhrases.filter((phrase) => containsForbiddenDrift(prompt, phrase));
  const missingContextCategories = scenario.expectedContextCategories.filter((category) => !categories.includes(category));
  const missingTemplateIds = (scenario.requiredTemplateIds ?? []).filter((id) => !prompt.includes(templateToken(id)));
  const presentForbiddenTemplateIds = (scenario.forbiddenTemplateIds ?? []).filter((id) => prompt.includes(templateToken(id)));
  const tooLong = prompt.length > (scenario.maxPromptLength ?? 15000);
  const status = missingRequiredPhrases.length || presentForbiddenPhrases.length || missingContextCategories.length || missingTemplateIds.length || presentForbiddenTemplateIds.length || tooLong ? "fail" : "pass";

  return {
    id: scenario.id,
    status,
    prompt,
    promptLength: prompt.length,
    localDeterministic: true,
    usesHostedEvaluator: false,
    usesLlmCall: false,
    missingRequiredPhrases,
    presentForbiddenPhrases,
    missingContextCategories,
    missingTemplateIds,
    presentForbiddenTemplateIds
  };
}

export function runBehavioralEvaluations(options: { projectRoot?: string } = {}): BehavioralEvaluationResult[] {
  return behavioralEvaluationScenarios.map((scenario) => evaluateBehavioralScenario(scenario, options));
}
