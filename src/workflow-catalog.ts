import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type WorkflowArtifactCheck = {
  path: string;
  pattern?: string;
  note?: string;
};

export type WorkflowCatalogStep = {
  id: string;
  label: string;
  command: string;
  required: boolean;
  repeatable?: boolean;
  artifact?: WorkflowArtifactCheck;
  description: string;
};

export type WorkflowCatalogPhase = {
  id: string;
  label: string;
  description: string;
  nextPhase?: string;
  steps: WorkflowCatalogStep[];
};

export const workflowCatalog: { phases: WorkflowCatalogPhase[] } = {
  phases: [
    {
      id: "concept",
      label: "Concept",
      description: "Develop a game idea into a documented concept and initial production constraints.",
      nextPhase: "systems-design",
      steps: [
        { id: "brainstorm", label: "Brainstorm", command: "./codex-game-studio run creative-director", required: false, description: "Explore fantasy, verbs, pillars, audience, and scope tiers." },
        { id: "engine-setup", label: "Engine Setup", command: "./codex-game-studio run engine-setup", required: true, artifact: { path: ".codex/studio.json", pattern: "\"engine\"" }, description: "Configure engine, version, project structure, and validation path." },
        { id: "game-concept", label: "Game Concept", command: "./codex-game-studio run game-concept", required: true, artifact: { path: "design/gdd.md" }, description: "Capture concept, pillars, and initial player promise." },
        { id: "design-review-concept", label: "Concept Design Review", command: "./codex-game-studio run design-review-concept", required: false, artifact: { path: "design/gdd.md", pattern: "Pillar|Scope|Risk" }, description: "Review the concept before deeper systems work." },
        { id: "art-bible", label: "Art Bible", command: "./codex-game-studio run art-bible", required: false, artifact: { path: "design/art/art-bible.md" }, description: "Define visual identity and asset constraints." },
        { id: "map-systems", label: "Systems Map", command: "./codex-game-studio run map-systems", required: true, artifact: { path: "design/gdd.md", pattern: "System" }, description: "Map systems and dependencies." }
      ]
    },
    {
      id: "systems-design",
      label: "Systems Design",
      description: "Turn the concept into implementable systems, UX, and architecture.",
      nextPhase: "technical-setup",
      steps: [
        { id: "design-system", label: "System GDDs", command: "./codex-game-studio run design-system", required: true, repeatable: true, artifact: { path: "design/gdd.md" }, description: "Author or update per-system GDD content." },
        { id: "design-review", label: "Design Review", command: "./codex-game-studio run design-review", required: false, artifact: { path: "design/gdd.md", pattern: "Risk|Scope|System" }, description: "Review design consistency and scope risk." },
        { id: "review-all-gdds", label: "Review All GDDs", command: "./codex-game-studio run review-all-gdds", required: false, artifact: { path: "design/gdd.md", pattern: "#|System" }, description: "Review all design documents for contradictions and missing ownership." },
        { id: "consistency-check", label: "Consistency Check", command: "./codex-game-studio run consistency-check", required: false, artifact: { path: "production/session-state/active.md" }, description: "Check cross-surface consistency before implementation planning." },
        { id: "create-architecture", label: "Architecture", command: "./codex-game-studio run create-architecture", required: true, artifact: { path: "docs/architecture/README.md" }, description: "Define technical architecture and implementation boundaries." },
        { id: "control-manifest", label: "Control Manifest", command: "./codex-game-studio run control-manifest", required: false, artifact: { path: "design/ux/controls.md" }, description: "Document inputs, remapping, prompts, devices, and accessibility constraints." },
        { id: "accessibility-doc", label: "Accessibility Requirements", command: "./codex-game-studio run accessibility-doc", required: false, artifact: { path: "design/ux/accessibility.md" }, description: "Document accessibility requirements and verification paths." },
        { id: "ux-design", label: "UX Design", command: "use skill cgs-ux-design", required: false, artifact: { path: "design/ux/ux-spec.md" }, description: "Document player journeys, HUD, menus, and accessibility." }
      ]
    },
    {
      id: "pre-production",
      label: "Pre-Production",
      description: "Validate build feasibility and production readiness.",
      nextPhase: "production",
      steps: [
        { id: "vertical-slice", label: "Vertical Slice", command: "use skill cgs-vertical-slice", required: true, artifact: { path: "production/session-state/active.md", pattern: "PROCEED" }, description: "Validate representative full-loop feasibility." },
        { id: "qa-plan", label: "QA Plan", command: "use skill cgs-qa-plan", required: true, artifact: { path: "tests/qa-plan.md" }, description: "Plan QA coverage before production." },
        { id: "scope-check", label: "Scope Check", command: "use skill cgs-scope-check", required: false, description: "Check production scope and cuts." }
      ]
    },
    {
      id: "release",
      label: "Release",
      description: "Validate release readiness and launch operations.",
      steps: [
        { id: "release-checklist", label: "Release Checklist", command: "use skill cgs-release-checklist", required: true, artifact: { path: "production/release-checklist.md" }, description: "Verify ship/no-ship readiness." },
        { id: "launch-checklist", label: "Launch Checklist", command: "use skill cgs-launch-checklist", required: false, artifact: { path: "production/launch-checklist.md" }, description: "Coordinate launch-day readiness." },
        { id: "changelog", label: "Changelog", command: "use skill cgs-changelog", required: true, artifact: { path: "docs/changelog.md" }, description: "Prepare player/developer-visible changes." }
      ]
    }
  ]
};

export function artifactStatus(projectRoot: string, artifact: WorkflowArtifactCheck): { status: "complete" | "missing" | "incomplete"; path: string; reason: string } {
  const file = path.join(projectRoot, artifact.path);
  if (!existsSync(file)) return { status: "missing", path: artifact.path, reason: "file missing" };
  if (artifact.pattern) {
    let pattern: RegExp;
    try {
      pattern = new RegExp(artifact.pattern);
    } catch (error) {
      return { status: "incomplete", path: artifact.path, reason: `invalid pattern: ${(error as Error).message}` };
    }
    if (!pattern.test(readFileSync(file, "utf8"))) return { status: "incomplete", path: artifact.path, reason: `pattern not found: ${artifact.pattern}` };
  }
  return { status: "complete", path: artifact.path, reason: "artifact present" };
}

function requiredStepStatus(projectRoot: string, step: WorkflowCatalogStep): "complete" | "missing" | "incomplete" {
  return step.artifact ? artifactStatus(projectRoot, step.artifact).status : "incomplete";
}

function nextIncompletePhase(projectRoot: string): WorkflowCatalogPhase {
  for (const phase of workflowCatalog.phases) {
    const required = phase.steps.filter((step) => step.required);
    if (required.some((step) => requiredStepStatus(projectRoot, step) !== "complete")) return phase;
  }
  return workflowCatalog.phases[workflowCatalog.phases.length - 1];
}

export function workflowCatalogSummary(projectRoot: string): string {
  const phase = nextIncompletePhase(projectRoot);
  const required = phase.steps.filter((step) => step.required);
  const lines = [`workflow phase: ${phase.id}`, "required next steps:"];
  for (const step of required) {
    const status = requiredStepStatus(projectRoot, step);
    lines.push(`- ${step.id}: ${status} (${step.command})`);
  }
  return lines.join("\n");
}
