import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { guidanceConfigHash, type ProjectConfig } from "./config.js";
import type { EngineConfigRegistry } from "./engines.js";
import { engineReferenceProjectPath, selectedEngineReferencePrompts } from "./engine-reference.js";
import { renderGeneratedSurfaceMetadata } from "./generated-surfaces.js";
import { projectRoleIdsForEngine, renderRoleContractSections, rolePackages, studioRoleIds, type StudioRoleId } from "./roles.js";
import { packageAssetPath } from "./paths.js";
import { isModelTier, modelPolicyForTier, parseTomlCommentStringField } from "./prompt-surface-metadata.js";


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


export const projectAgentsMdRequiredSections = [
  "## Project Goal",
  "## Engine",
  "## Commands",
  "## Context Bootstrap",
  "## Model Routing",
  "## Coding Conventions",
  "## Asset Conventions",
  "## Studio Roles",
  "## Current Milestone",
  "## Verification",
  "## Rules"
] as const;

export function generateProjectAgentsMd(config: ProjectConfig): string {
  const hash = guidanceConfigHash(config);
  return `<!-- generated-by: codex-game-studio src/agents.ts schema=1.0 -->
<!-- source-config-sha256: ${hash} -->
# ${config.project.name} Game Studio

Project: ${config.project.name}
Slug: ${config.project.slug}
Mode: ${config.project.mode}
Studio Mode: ${config.project.studio_mode}

## Project Goal

${config.project.concept}

## Engine

${config.project.engine} ${config.project.engine_version}

## Commands

- Validate: \`./codex-game-studio validate\`
- Refresh context manifest after editing selected project context: \`./codex-game-studio refresh-context\`

## Context Bootstrap

Before broad inspection, use compact context helpers when available, then read only surfaced files and explicit task targets:

- \`npm run ctx:studio\`
- \`npm run ctx:task -- "<task>"\`
- \`npm run ctx:role -- <role-id>\`
- \`npm run ctx:workflow -- <workflow-id>\`
- \`npm run ctx:changed\`

## Model Routing

- Prompt surfaces declare an explicit \`model_tier\`; runtime enforces that declaration instead of inferring importance from names.
- Use Sol for important, high-risk, architectural, security, release, or cross-system decisions.
- Use Terra for routine implementation, testing, QA, documentation, and other bounded work.
- Use Luna only for trivial, mechanical, objectively verifiable work; escalate ambiguity or failed verification to Terra.
- Explicit user or task-tier overrides take precedence; otherwise use the selected agent or workflow tier.
- Fixed fallbacks are Sol to GPT-5.5 at xhigh reasoning, Terra to GPT-5.4 at high reasoning, and Luna to GPT-5.4-mini at low reasoning.

## Coding Conventions

- Prefer engine-native idioms.
- Keep generated code scoped to the current task.

## Asset Conventions

- Do not edit imported binary assets without documenting the change.
- Describe scene, prefab, and material changes explicitly.

## Studio Roles

${projectRoleIdsForEngine(config.project.engine).map((role) => `- ${role}: .codex/agents/${role}.toml`).join("\n")}

## Current Milestone

${config.project.mode === "design" ? "design" : config.project.mode === "development" ? "development" : "prototype"}

## Verification

Run project validation before claiming parity or readiness.

## Rules

Use AGENTS.md, .codex/studio.json, the current role prompt, and task-relevant context only.
Codex is the default runtime for \`codex-game-studio run <role>\`; use \`--dry-run\` or \`--print-prompt\` only for inspection.
Do not use telemetry, planner/next, hosted/background orchestration, unbounded parallelism, or ownership enforcement in this build. Explicit local task orchestration must stay reviewable in .codex state.
`;
}

function tomlString(value: string): string {
  return JSON.stringify(value);
}

function tomlMultiline(value: string): string {
  return `"""\n${value.replace(/"""/g, '\"\"\"')}\n"""`;
}

function trackedRoleModelPolicy(role: StudioRoleId) {
  const body = readFileSync(packageAssetPath(`.codex/agents/${role}.toml`), "utf8");
  const tier = parseTomlCommentStringField(body, "model_tier");
  if (!isModelTier(tier)) throw new Error(`${role} has invalid or missing model_tier metadata`);
  return modelPolicyForTier(tier);
}

export function renderProjectCustomAgentToml(role: StudioRoleId, config: ProjectConfig, engines: EngineConfigRegistry): string {
  const pkg = rolePackages[role];
  const engine = engines[config.project.engine];
  const sourceInput = projectRolePromptSourceInput(role, config, engines);
  const modelPolicy = trackedRoleModelPolicy(role);
  const body = [
    `# generated-by: codex-game-studio`,
    `# surface: custom-agent`,
    `# source-role-id: ${role}`,
    `# source-input-sha256: ${renderGeneratedSurfaceMetadata({ surface: "custom-agent-source", role, sourceInput, body: "" }).match(/source-input-sha256: ([a-f0-9]+)/)?.[1] ?? ""}`,
    `# schema-version: 1`,
    "",
    `name = ${tomlString(role.replace(/-/g, "_"))}`,
    `description = ${tomlString(`Game development ${pkg.displayName} agent for ${role} tasks in this repository. Use for ${pkg.responsibilities.slice(0, 2).join(", ").toLowerCase()}.`)}`,
    `# model_tier = "${modelPolicy.tier}"`,
    `model = "${modelPolicy.primary.model}"`,
    `model_reasoning_effort = "${modelPolicy.primary.effort}"`,
    `developer_instructions = ${tomlMultiline([
      `You are the ${pkg.displayName} role for ${config.project.name}.`,
      `Engine: ${engine.display_name} ${config.project.engine_version}.`,
      "Follow AGENTS.md, .codex/studio.json, selected skills, and task-relevant files.",
      "Keep changes bounded to the requested game-development task.",
      "Report changed files, verification evidence, and remaining risks.",
      "",
      pkg.systemPrompt,
      "",
      renderRoleContractSections(pkg)
    ].join("\n"))}`,
    ""
  ].join("\n");
  return body;
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
    modelPolicy: trackedRoleModelPolicy(role),
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
