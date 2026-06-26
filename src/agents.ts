import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { guidanceConfigHash, type ProjectConfig } from "./config.js";
import type { EngineConfigRegistry } from "./engines.js";
import { engineReferenceProjectPath, selectedEngineReferencePrompts } from "./engine-reference.js";
import { renderGeneratedSurfaceMetadata } from "./generated-surfaces.js";
import { projectRoleIdsForEngine, renderRoleContractSections, rolePackages, studioRoleIds, type StudioRoleId } from "./roles.js";

export type MaterializeAgentsInput = {
  projectRoot: string;
  config: ProjectConfig;
  engines: EngineConfigRegistry;
};

export function validateBaseAgents(): string[] {
  return studioRoleIds.flatMap((role) => {
    const pkg = rolePackages[role];
    return pkg.systemPrompt.trim() &&
      pkg.responsibilities.length &&
      pkg.inputsToInspect.length &&
      pkg.expectedOutputs.length &&
      pkg.qualityGates.length &&
      pkg.collaborationNotes.length &&
      pkg.stopConditions.length &&
      pkg.sharedFragments.length &&
      pkg.reviewChecklist.length
      ? []
      : [`Invalid role package ${role}`];
  });
}

export function readAgentPrompt(agent: StudioRoleId, projectRoot?: string): string {
  const projectPrompt = projectRoot ? path.join(projectRoot, ".codex", "prompts", `${agent}.md`) : "";
  if (projectPrompt && existsSync(projectPrompt)) return readFileSync(projectPrompt, "utf8");
  return rolePackages[agent].systemPrompt;
}

export function readProjectAgentPrompt(agent: StudioRoleId, projectRoot: string): string {
  const projectPrompt = path.join(projectRoot, ".codex", "prompts", `${agent}.md`);
  if (!existsSync(projectPrompt)) throw new Error(`Missing generated project role prompt: ${path.relative(projectRoot, projectPrompt)}`);
  return readFileSync(projectPrompt, "utf8");
}

export const projectAgentsMdRequiredSections = [
  "## Project Goal",
  "## Engine",
  "## Commands",
  "## Coding Conventions",
  "## Asset Conventions",
  "## Studio Roles",
  "## Current Milestone",
  "## Verification",
  "## Rules"
] as const;

export function generateProjectAgentsMd(config: ProjectConfig): string {
  const hash = guidanceConfigHash(config);
  return `<!-- generated-by: open-gamestudio src/agents.ts schema=1.0 -->
<!-- source-config-sha256: ${hash} -->
# ${config.project.name} Agents

Project: ${config.project.name}
Slug: ${config.project.slug}
Mode: ${config.project.mode}
Studio Mode: ${config.project.studio_mode}

## Project Goal

${config.project.concept}

## Engine

${config.project.engine} ${config.project.engine_version}

## Commands

- Validate: \`npm run validate -- --project projects/${config.project.slug}\`

## Coding Conventions

- Prefer engine-native idioms.
- Keep generated code scoped to the current task.

## Asset Conventions

- Do not edit imported binary assets without documenting the change.
- Describe scene, prefab, and material changes explicitly.

## Studio Roles

${projectRoleIdsForEngine(config.project.engine).map((role) => `- ${role}: .codex/prompts/${role}.md`).join("\n")}

## Current Milestone

${config.project.mode === "design" ? "design" : config.project.mode === "development" ? "development" : "prototype"}

## Verification

Run project validation before claiming parity or readiness.

## Rules

Use AGENTS.md, .codex/studio.json, the current role prompt, and task-relevant context only.
Codex is the default runtime for \`opengamestudio run <role>\`; use \`--dry-run\` or \`--print-prompt\` only for inspection.
Do not use telemetry, planner/next, hosted/background orchestration, unbounded parallelism, or ownership enforcement in this build. Explicit local task orchestration must stay reviewable in .codex state.
`;
}

export function renderProjectRolePrompt(role: StudioRoleId, config: ProjectConfig, engines: EngineConfigRegistry): string {
  const pkg = rolePackages[role];
  const engine = engines[config.project.engine];
  const engineReferences = selectedEngineReferencePrompts(config.project.engine, role);
  const body = [
    `# ${pkg.displayName}`,
    "",
    `Project: ${config.project.name}`,
    `Slug: ${config.project.slug}`,
    `Role: ${pkg.displayName}`,
    `Context Strategy: ${pkg.contextStrategy}`,
    `Mode: ${config.project.mode}`,
    `Studio Mode: ${config.project.studio_mode}`,
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
    renderRoleContractSections(pkg),
    "",
    "## Engine Context",
    "",
    ...engine.codex_hints.map((hint) => `- ${hint}`),
    "",
    "Selected engine references:",
    ...engineReferences.map((reference) => `- ${engineReferenceProjectPath(config.project.engine, reference.path)} - ${reference.reason}`),
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
  return `${renderGeneratedSurfaceMetadata({
    surface: "role-prompt",
    role,
    sourceInput: projectRolePromptSourceInput(role, config, engines),
    body
  })}${body}`;
}

export function projectRolePromptSourceInput(role: StudioRoleId, config: ProjectConfig, engines: EngineConfigRegistry): unknown {
  const pkg = rolePackages[role];
  const engine = engines[config.project.engine];
  const engineReferences = selectedEngineReferencePrompts(config.project.engine, role).map((reference) => ({
    path: engineReferenceProjectPath(config.project.engine, reference.path),
    reason: reference.reason,
    required: reference.required
  }));
  return {
    role,
    displayName: pkg.displayName,
    contextStrategy: pkg.contextStrategy,
    systemPrompt: pkg.systemPrompt,
    responsibilities: pkg.responsibilities,
    inputsToInspect: pkg.inputsToInspect,
    expectedOutputs: pkg.expectedOutputs,
    outputSchema: pkg.outputSchema,
    qualityGates: pkg.qualityGates,
    collaborationNotes: pkg.collaborationNotes,
    stopConditions: pkg.stopConditions,
    sharedFragments: pkg.sharedFragments,
    reviewChecklist: pkg.reviewChecklist,
    handoffTemplate: pkg.handoffTemplate,
    engineDisplayName: engine.display_name,
    engineHints: engine.codex_hints,
    engineReferences,
    project: {
      name: config.project.name,
      slug: config.project.slug,
      mode: config.project.mode,
      studioMode: config.project.studio_mode,
      engine: config.project.engine,
      engineVersion: config.project.engine_version,
      concept: config.project.concept,
      genre: config.project.genre,
      platform: config.project.platform,
      audience: config.project.audience,
      monetization: config.project.monetization,
      timeline: config.project.timeline,
      competitors: config.project.competitors
    }
  };
}

export function materializeAgents(input: MaterializeAgentsInput): string[] {
  const written: string[] = [];
  const agentsMd = path.join(input.projectRoot, "AGENTS.md");
  writeFileSync(agentsMd, generateProjectAgentsMd(input.config));
  written.push(agentsMd);
  const prompts = path.join(input.projectRoot, ".codex", "prompts");
  mkdirSync(prompts, { recursive: true });
  for (const role of projectRoleIdsForEngine(input.config.project.engine)) {
    const prompt = path.join(prompts, `${role}.md`);
    writeFileSync(prompt, renderProjectRolePrompt(role, input.config, input.engines));
    written.push(prompt);
  }
  return written;
}
