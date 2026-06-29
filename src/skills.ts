import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ProjectConfig } from "./config.js";
import { renderGeneratedSurfaceMetadata } from "./generated-surfaces.js";
import { workflowRegistry, type WorkflowId } from "./workflows.js";

export type GeneratedSkillDefinition = {
  name: string;
  description: string;
  sourceId: string;
  body: string;
  sourceInput: unknown;
};

const firstPassWorkflowSkills: WorkflowId[] = ["bugfix", "vertical-slice", "ui-ux-review", "release-checklist"];

const standardsSkills = [
  {
    name: "cgs-standards-gameplay",
    sourceId: "standards-gameplay",
    description: "Use for gameplay code standards in Codex Game Studio repositories: mechanics, tuning, data-driven values, and engine idioms.",
    title: "Gameplay Standards",
    procedure: ["Keep gameplay values data-driven.", "Keep engine code separate from UI state.", "Verify mechanics with focused tests or playable checks."]
  },
  {
    name: "cgs-standards-tests",
    sourceId: "standards-tests",
    description: "Use for Codex Game Studio test standards: unit, integration, engine smoke, playtest, and regression coverage.",
    title: "Test Standards",
    procedure: ["Name the behavior under test.", "Run the narrow test first, then the relevant suite.", "Record verification evidence in the handoff."]
  },
  {
    name: "cgs-standards-prototype",
    sourceId: "standards-prototype",
    description: "Use for prototype code standards in Codex Game Studio repositories: fast experiments with explicit hypotheses and cleanup boundaries.",
    title: "Prototype Standards",
    procedure: ["State the prototype hypothesis.", "Keep throwaway code isolated from production paths.", "Document what graduates or gets deleted."]
  },
  {
    name: "cgs-standards-ui",
    sourceId: "standards-ui",
    description: "Use for UI and UX implementation standards in Codex Game Studio repositories: HUD, menus, accessibility, localization, and input states.",
    title: "UI Standards",
    procedure: ["Keep UI from owning gameplay state.", "Support keyboard/controller navigation where relevant.", "Keep text localization-ready."]
  }
] as const;

const onboardingSkills = [
  {
    name: "cgs-start",
    sourceId: "start",
    description: "Use to start a newly cloned Codex Game Studio repository: clarify concept, engine, mode, and first milestone.",
    title: "Start Workflow",
    procedure: ["Identify whether the project has no idea, a vague concept, a clear design, or existing work.", "Select engine and mode.", "Create the first bounded milestone and validation gate."]
  },
  {
    name: "cgs-setup-engine",
    sourceId: "setup-engine",
    description: "Use to configure or verify the selected engine for a Codex Game Studio repository.",
    title: "Setup Engine Workflow",
    procedure: ["Confirm engine and version.", "Inspect engine project files.", "Run the engine-specific validation command when available."]
  },
  {
    name: "cgs-adopt",
    sourceId: "adopt",
    description: "Use when adopting existing game work into a Codex Game Studio repository.",
    title: "Adopt Existing Project Workflow",
    procedure: ["Inventory existing source, assets, docs, and tests.", "Map current state to studio roles and workflows.", "Create migration tasks without moving unrelated files first."]
  }
] as const;

function skillBody(args: { title: string; intro: string; inputs: string[]; procedure: string[] }): string {
  return [
    `# ${args.title}`,
    "",
    args.intro,
    "",
    "## Inputs",
    "",
    ...args.inputs.map((input) => `- ${input}`),
    "",
    "## Procedure",
    "",
    ...args.procedure.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Handoff",
    "",
    "Report changed files, verification evidence, and remaining risks.",
    ""
  ].join("\n");
}

function renderSkill(definition: GeneratedSkillDefinition): string {
  const body = [
    "---",
    `name: ${definition.name}`,
    `description: ${definition.description}`,
    "---",
    "",
    definition.body.trimEnd(),
    ""
  ].join("\n");
  return `${renderGeneratedSurfaceMetadata({ surface: "skill", id: definition.name, sourceInput: definition.sourceInput, body })}${body}`;
}

export function generatedSkillDefinitions(config: ProjectConfig): GeneratedSkillDefinition[] {
  const commonInputs = ["AGENTS.md", ".codex/studio.json", "task-relevant files named by the user or task record"];
  const workflowDefs = firstPassWorkflowSkills.map((id) => {
    const workflow = workflowRegistry[id];
    const name = `cgs-${id}`;
    return {
      name,
      sourceId: id,
      description: `Use for Codex Game Studio ${id} workflow tasks in a game repository: ${workflow.objective}`,
      body: skillBody({
        title: `Codex Game Studio ${id} Workflow`,
        intro: `Use this skill for ${id} work in ${config.project.name}.`,
        inputs: [...commonInputs, workflow.file],
        procedure: ["Read the workflow file and task context.", "Keep changes bounded to the requested game work.", "Run focused verification before handoff."]
      }),
      sourceInput: { type: "workflow", id, workflow, projectMode: config.project.mode, engine: config.project.engine }
    } satisfies GeneratedSkillDefinition;
  });
  const onboardingDefs = onboardingSkills.map((skill) => ({
    name: skill.name,
    sourceId: skill.sourceId,
    description: skill.description,
    body: skillBody({ title: `Codex Game Studio ${skill.title}`, intro: `Use this skill in ${config.project.name}.`, inputs: commonInputs, procedure: [...skill.procedure] }),
    sourceInput: { type: "onboarding", ...skill, projectMode: config.project.mode, engine: config.project.engine }
  }));
  const standardDefs = standardsSkills.map((skill) => ({
    name: skill.name,
    sourceId: skill.sourceId,
    description: skill.description,
    body: skillBody({ title: `Codex Game Studio ${skill.title}`, intro: `Use this standards skill in ${config.project.name}.`, inputs: commonInputs, procedure: [...skill.procedure] }),
    sourceInput: { type: "standards", ...skill, projectMode: config.project.mode, engine: config.project.engine }
  }));
  return [...onboardingDefs, ...workflowDefs, ...standardDefs];
}

export function renderGeneratedSkill(definition: GeneratedSkillDefinition): string {
  return renderSkill(definition);
}

export function materializeSkills(projectRoot: string, config: ProjectConfig): string[] {
  const written: string[] = [];
  for (const definition of generatedSkillDefinitions(config)) {
    const dir = path.join(projectRoot, ".agents", "skills", definition.name);
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "SKILL.md");
    writeFileSync(file, renderGeneratedSkill(definition));
    written.push(file);
  }
  return written;
}
