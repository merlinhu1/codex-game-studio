import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { activeAgentsForProject } from "./config.js";
import { projectAgentsMdRequiredSections, projectRolePromptSourceInput, renderProjectRolePrompt, validateBaseAgents } from "./agents.js";
import { validateApprovalStore } from "./approvals.js";
import { runBehavioralEvaluations } from "./behavioral-evaluation.js";
import { checkCodexAvailability } from "./codex-runtime.js";
import { validatePerformanceEvaluationFramework } from "./performance-evaluation.js";
import { contextManifestInput, createContextManifest, type ContextManifest, type ContextManifestMeta } from "./context-manifest.js";
import { validateProjectCustomization } from "./customization.js";
import { createCodexStudioSession } from "./codex-session.js";
import { renderCodexPrompt } from "./codex-prompts.js";
import { loadEngineConfigs, sourceRoot, unrealProjectFileName } from "./engines.js";
import { engineReferenceRegistry, selectedEngineReferencePrompts, validateEngineReferencePacks } from "./engine-reference.js";
import { hashGeneratedBody, parseGeneratedSurfaceMetadataParts, stripGeneratedMetadata, stableHash } from "./generated-surfaces.js";
import { packageAssetPath } from "./paths.js";
import { readStudioProject, resumeProject, statusProject, type StudioProjectState } from "./projects.js";
import { isEngineSpecialistRoleId, projectRoleIdsForEngine, rolePackages, studioRoleIds, type StudioRoleId } from "./roles.js";
import { templateRegistry, validateTemplateFiles } from "./templates.js";
import { renderWorkflowPrompt, workflowIds, workflowRegistry } from "./workflows.js";
import { templateSkillDefinitions } from "./skills.js";
import {
  isCodexModelName,
  isReasoningEffort,
  parsePromptSurfaceFrontmatter,
  parseTomlArrayField,
  parseTomlCommentArrayField,
  parseTomlCommentStringField,
  parseTomlStringField,
  validateAgentDescriptionQuality,
  validateModelPolicy,
  validateSkillDescriptionQuality,
  validateWorkflowArgumentHintQuality
} from "./prompt-surface-metadata.js";

export type CheckStatus = "pass" | "fail" | "skip";
export type ValidationCheck = { id: string; status: CheckStatus; message: string; path?: string };

function pass(id: string, message: string, file?: string): ValidationCheck {
  return { id, status: "pass", message, path: file };
}

function fail(id: string, message: string, file?: string): ValidationCheck {
  return { id, status: "fail", message, path: file };
}

function skip(id: string, message: string, file?: string): ValidationCheck {
  return { id, status: "skip", message, path: file };
}

function sectionHasContent(body: string, section: string): boolean {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escaped}\\s*$`, "m").exec(body);
  if (!match) return false;
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const nextHeading = rest.search(/^#/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim().length > 0;
}

function configFromStudio(studio: StudioProjectState) {
  return {
    schema_version: "1.0" as const,
    project: {
      name: studio.name,
      slug: studio.slug,
      concept: studio.concept,
      genre: studio.genre,
      platform: studio.platform,
      audience: studio.audience,
      competitors: studio.competitors ?? [],
      monetization: studio.monetization ?? "undecided",
      timeline: studio.timeline ?? "TBD",
      engine: studio.engine,
      engine_version: studio.engineVersion,
      mode: studio.mode,
      studio_mode: studio.studioMode,
      phase: studio.phase,
      status: studio.status
    },
    team: { active_agents: studio.activeRoles },
    production: { milestones: [] }
  };
}

function generatedSurfaceChecks(args: { file: string; body: string; surface: string; id: string; target: { role?: string; id?: string }; sourceInput: unknown; expectedBody?: string }): ValidationCheck[] {
  const metadata = parseGeneratedSurfaceMetadataParts(args.body);
  if (!metadata.hasAnyMarker) {
    return [skip(args.id, "legacy generated surface lacks freshness metadata; regenerate before relying on freshness checks", args.file)];
  }
  const checks: ValidationCheck[] = [];
  const targetMatches =
    metadata.generated?.surface === args.surface && (!args.target.role || metadata.generated.role === args.target.role) && (!args.target.id || metadata.generated.id === args.target.id) && metadata.generated.schema === "1.0";
  const sourceHash = stableHash(args.sourceInput);
  checks.push(targetMatches && metadata.sourceInputSha256 === sourceHash ? pass(args.id, `${args.surface} source metadata is fresh`, args.file) : fail(args.id, `${args.surface} source metadata is stale`, args.file));
  const bodyId = args.id.replace(/\.freshness$/, ".body");
  const strippedBody = stripGeneratedMetadata(args.body);
  const bodyHash = hashGeneratedBody(strippedBody);
  const currentRendererBody = args.expectedBody ? stripGeneratedMetadata(args.expectedBody) === strippedBody : true;
  checks.push(metadata.renderedBodySha256 === bodyHash && currentRendererBody ? pass(bodyId, `${args.surface} body hash matches current renderer`, args.file) : fail(bodyId, `${args.surface} body hash mismatch`, args.file));
  return checks;
}

function parseJsonFile<T>(file: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(readFileSync(file, "utf8")) as T };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

function hashJsonBody(value: unknown): string {
  return createHash("sha256").update(`${JSON.stringify(value, null, 2)}\n`).digest("hex");
}

function contextManifestChecks(projectRoot: string, studio: StudioProjectState): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const manifestPath = path.join(projectRoot, ".codex", "context-manifest.json");
  const metaPath = path.join(projectRoot, ".codex", "context-manifest.meta.json");
  if (!existsSync(manifestPath)) return [fail("codex.project.context_manifest", "context manifest missing", manifestPath)];
  if (!existsSync(metaPath)) return [pass("codex.project.context_manifest", "context manifest exists", manifestPath), fail("codex.project.context_manifest.meta", "context manifest metadata missing", metaPath)];

  const manifestParsed = parseJsonFile<ContextManifest>(manifestPath);
  if (!manifestParsed.ok) return [fail("codex.project.context_manifest", `context manifest invalid JSON: ${manifestParsed.error}`, manifestPath)];
  const metaParsed = parseJsonFile<ContextManifestMeta>(metaPath);
  if (!metaParsed.ok) return [pass("codex.project.context_manifest", "context manifest JSON is valid", manifestPath), fail("codex.project.context_manifest.meta", `context manifest metadata invalid JSON: ${metaParsed.error}`, metaPath)];
  const manifest = manifestParsed.value;
  const meta = metaParsed.value;
  const entryStatuses = new Set(["selected", "missing", "omitted", "rejected"]);
  const entrySafeties = new Set(["safe", "unsafe", "secret", "generated", "binary"]);
  const schemaOk =
    manifest.schemaVersion === 1 &&
    manifest.product === "codex-game-studio" &&
    manifest.projectStage === studio.mode &&
    manifest.studioMode === studio.studioMode &&
    Array.isArray(manifest.entries) &&
    manifest.entries.every(
      (entry) =>
        typeof entry.sourcePath === "string" &&
        typeof entry.reason === "string" &&
        typeof entry.required === "boolean" &&
        entryStatuses.has(entry.status) &&
        entrySafeties.has(entry.safety) &&
        typeof entry.statusReason === "string" &&
        typeof entry.chars === "number"
    ) &&
    manifest.budget &&
    typeof manifest.budget.maxFiles === "number" &&
    typeof manifest.budget.maxChars === "number" &&
    typeof manifest.budget.maxEntryChars === "number";
  checks.push(schemaOk ? pass("codex.project.context_manifest", "context manifest schema-readable", manifestPath) : fail("codex.project.context_manifest", "context manifest schema invalid", manifestPath));

  const expected = createContextManifest(projectRoot, studio);
  const freshnessOk =
    meta.schemaVersion === 1 &&
    meta.product === "codex-game-studio" &&
    meta.projectStage === studio.mode &&
    meta.studioMode === studio.studioMode &&
    meta.manifestSha256 === hashJsonBody(manifest) &&
    meta.inputsSha256 === stableHash(contextManifestInput(studio)) &&
    JSON.stringify(manifest) === JSON.stringify(expected.manifest);
  checks.push(freshnessOk ? pass("codex.project.context_manifest.freshness", "context manifest freshness metadata is current", metaPath) : fail("codex.project.context_manifest.freshness", "context manifest freshness metadata is stale", metaPath));
  return checks;
}

function engineReferenceRepoChecks(root: string): ValidationCheck[] {
  return validateEngineReferencePacks(root).map((check) => ({
    id: check.id,
    status: check.status,
    message: check.message,
    path: check.path
  }));
}

function engineReferenceProjectChecks(projectRoot: string, studio: StudioProjectState): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const pack = engineReferenceRegistry[studio.engine];
  const materializedFiles = [...new Set([...pack.requiredFiles, ...pack.moduleFiles, ...pack.pluginFiles, ...pack.specialistFiles])];
  for (const file of materializedFiles) {
    const projectFile = path.join(projectRoot, pack.projectPath(file));
    checks.push(existsSync(projectFile) ? pass(`engine_reference.project.${studio.engine}.${file}`, `${studio.engine} ${file} materialized`, projectFile) : fail(`engine_reference.project.${studio.engine}.${file}`, `${studio.engine} ${file} missing from generated project`, projectFile));
  }
  for (const check of validateEngineReferencePacks(packageAssetPath("."))) {
    if (!check.id.startsWith(`engine_reference.${studio.engine}.`)) continue;
    checks.push({
      id: check.id.replace(`engine_reference.${studio.engine}.`, `engine_reference.package.${studio.engine}.`),
      status: check.status,
      message: check.message,
      path: check.path
    });
  }
  return checks;
}

function customAgentChecks(projectRoot: string, role: StudioRoleId, studio: StudioProjectState): ValidationCheck[] {
  const file = path.join(projectRoot, ".codex", "agents", `${role}.toml`);
  if (!existsSync(file)) return [fail(`codex.agent.${role}.exists`, `${role} custom agent missing`, file)];
  const body = readFileSync(file, "utf8");
  return [
    pass(`codex.agent.${role}.exists`, `${role} custom agent exists`, file),
    /name\s*=\s*"[^"]+"/.test(body) ? pass(`codex.agent.${role}.name`, `${role} custom agent has name`, file) : fail(`codex.agent.${role}.name`, `${role} custom agent missing name`, file),
    /description\s*=\s*"[^"]+"/.test(body) ? pass(`codex.agent.${role}.description`, `${role} custom agent has description`, file) : fail(`codex.agent.${role}.description`, `${role} custom agent missing description`, file),
    /developer_instructions\s*=\s*"""/.test(body) ? pass(`codex.agent.${role}.developer_instructions`, `${role} custom agent has developer instructions`, file) : fail(`codex.agent.${role}.developer_instructions`, `${role} custom agent missing developer_instructions`, file)
  ];
}


function slugCheckId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "marker";
}

function sectionBody(body: string, heading: string): string {
  const marker = `## ${heading}`;
  const start = body.indexOf(marker);
  if (start === -1) return "";
  const after = body.slice(start + marker.length);
  const next = after.search(/\n## /);
  return next === -1 ? after : after.slice(0, next);
}

function recursiveFiles(root: string, relativeDir: string): string[] {
  const full = path.join(root, relativeDir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name).slice(root.length + 1).split(path.sep).join("/"))
    .sort();
}

function gitTracked(root: string, pattern: string): Set<string> {
  try {
    const raw = execFileSync("git", ["ls-files", pattern], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return new Set(raw.split("\n").filter(Boolean));
  } catch {
    return new Set();
  }
}

export function validateTemplateSurfaces(root = process.cwd()): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const agentFiles = recursiveFiles(root, ".codex/agents").filter((file) => file.endsWith(".toml"));
  const workflowFiles = recursiveFiles(root, ".codex/workflows").filter((file) => file.endsWith(".md"));
  const skillFiles = recursiveFiles(root, ".agents/skills").filter((file) => file.endsWith("/SKILL.md"));
  const trackedAgents = gitTracked(root, ".codex/agents/*.toml");
  const trackedWorkflows = gitTracked(root, ".codex/workflows/*.md");
  const trackedSkills = gitTracked(root, ".agents/skills/*/SKILL.md");

  checks.push(agentFiles.length > 0 && agentFiles.every((file) => trackedAgents.size === 0 || trackedAgents.has(file)) ? pass("template.agents.tracked", "tracked Codex custom agents are clone-visible", path.join(root, ".codex", "agents")) : fail("template.agents.tracked", "tracked Codex custom agents missing", path.join(root, ".codex", "agents")));
  checks.push(workflowFiles.length > 0 && workflowFiles.every((file) => trackedWorkflows.size === 0 || trackedWorkflows.has(file)) ? pass("template.workflows.tracked", "tracked Codex workflows are clone-visible", path.join(root, ".codex", "workflows")) : fail("template.workflows.tracked", "tracked Codex workflows missing", path.join(root, ".codex", "workflows")));
  checks.push(skillFiles.length > 0 && skillFiles.every((file) => trackedSkills.size === 0 || trackedSkills.has(file)) ? pass("template.skills.tracked", "tracked repository skills are clone-visible", path.join(root, ".agents", "skills")) : fail("template.skills.tracked", "tracked repository skills missing", path.join(root, ".agents", "skills")));
  checks.push(...promptSurfaceQualityChecks(root, agentFiles, workflowFiles, skillFiles));
  checks.push(...openAiSkillMetadataChecks(root));

  for (const forbidden of [
    ".codex/agents/truth-claim-verifier.toml",
    ".codex/agents/truth-doc-reviewer.toml",
    ".codex/agents/truth-doc-writer.toml",
    ".codex/agents/truth-route-auditor.toml"
  ]) {
    checks.push(existsSync(path.join(root, forbidden)) ? fail(`template.forbidden.${forbidden}`, `${forbidden} must not live in the game-facing agent folder`, path.join(root, forbidden)) : pass(`template.forbidden.${forbidden}`, `${forbidden} absent`));
  }
  for (const skill of ["truthmark-check", "truthmark-document", "truthmark-realize", "truthmark-structure", "truthmark-sync"]) {
    const file = path.join(root, ".agents", "skills", skill);
    checks.push(existsSync(file) ? fail(`template.forbidden.skill.${skill}`, `${skill} must not live in the game-facing skill folder`, file) : pass(`template.forbidden.skill.${skill}`, `${skill} absent`));
  }

  const agentsMd = path.join(root, "AGENTS.md");
  if (!existsSync(agentsMd)) {
    checks.push(fail("template.AGENTS.exists", "AGENTS.md missing", agentsMd));
  } else {
    const body = readFileSync(agentsMd, "utf8");
    checks.push(body.includes("template") && body.includes(".codex/agents") && !body.includes("NodeNext") && !body.includes("Truthmark Workflow") ? pass("template.AGENTS.game_facing", "AGENTS.md is game-facing", agentsMd) : fail("template.AGENTS.game_facing", "AGENTS.md must be game-facing template guidance", agentsMd));
  }
  return checks;
}


function scalarMetadata(value: string | string[] | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function arrayMetadata(value: string | string[] | boolean | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) return value.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function hashLooksValid(value: string | undefined): boolean {
  return !!value && /^[a-f0-9]{64}$/.test(value);
}

function promptSurfaceDepth(body: string, sections: string[]): number {
  let score = Math.min(25, Math.floor(body.split("\n").length / 20));
  for (const section of sections) if (new RegExp(`^## ${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(body)) score += 8;
  return Math.min(100, score);
}

function agentPromptSurfaceChecks(root: string, file: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const full = path.join(root, file);
  const id = path.basename(file, ".toml");
  const body = readFileSync(full, "utf8");
  const model = parseTomlStringField(body, "model");
  const effort = parseTomlStringField(body, "model_reasoning_effort");
  const description = parseTomlStringField(body, "description");
  const discovery = validateAgentDescriptionQuality(description, id);
  const policy = validateModelPolicy({ model: model ?? "", model_reasoning_effort: effort });
  checks.push(discovery.valid ? pass(`prompt_surface.agent.${id}.discovery_metadata`, `${id} discovery metadata is selection-oriented`, full) : fail(`prompt_surface.agent.${id}.discovery_metadata`, `${id} weak discovery metadata: ${discovery.diagnostics.map((diagnostic) => diagnostic.id).join(", ")}`, full));
  checks.push(policy.valid ? pass(`prompt_surface.agent.${id}.model`, `${id} uses exact Codex model policy`, full) : fail(`prompt_surface.agent.${id}.model`, `${id} invalid model policy: ${policy.issues.join(", ")}`, full));
  const sourceReference = parseTomlCommentStringField(body, "source_reference");
  const sourceHash = parseTomlCommentStringField(body, "source_hash");
  checks.push(hashLooksValid(sourceHash) && !!sourceReference ? pass(`prompt_surface.agent.${id}.traceability`, `${id} source traceability present`, full) : fail(`prompt_surface.agent.${id}.traceability`, `${id} missing commented source_reference/source_hash`, full));
  const skills = parseTomlCommentArrayField(body, "primary_skills");
  const brokenSkill = skills.find((skill) => !existsSync(path.join(root, ".agents", "skills", skill, "SKILL.md")));
  checks.push(skills.length && !brokenSkill ? pass(`prompt_surface.agent.${id}.links`, `${id} linked skills resolve`, full) : fail(`prompt_surface.agent.${id}.links`, brokenSkill ? `${id} linked skill missing: ${brokenSkill}` : `${id} missing linked skills`, full));
  checks.push(parseTomlCommentArrayField(body, "allowed_tool_categories").length ? pass(`prompt_surface.agent.${id}.tool_policy`, `${id} tool policy present`, full) : fail(`prompt_surface.agent.${id}.tool_policy`, `${id} missing tool policy`, full));
  checks.push(promptSurfaceDepth(body, ["Use When", "Do Not Use When", "Procedure", "Handoff Contract", "Stop Conditions"]) >= 40 ? pass(`prompt_surface.agent.${id}.depth`, `${id} prompt depth sufficient`, full) : fail(`prompt_surface.agent.${id}.depth`, `${id} prompt surface too thin`, full));
  return checks;
}

function skillPromptSurfaceChecks(root: string, file: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const full = path.join(root, file);
  const id = file.split("/")[2];
  const body = readFileSync(full, "utf8");
  const { frontmatter } = parsePromptSurfaceFrontmatter(body);
  const model = scalarMetadata(frontmatter.model);
  const effort = scalarMetadata(frontmatter.model_reasoning_effort);
  const discovery = validateSkillDescriptionQuality(scalarMetadata(frontmatter.description), id);
  const policy = validateModelPolicy({ model: model ?? "", model_reasoning_effort: effort });
  checks.push(discovery.valid ? pass(`prompt_surface.skill.${id}.discovery_metadata`, `${id} discovery metadata is selection-oriented`, full) : fail(`prompt_surface.skill.${id}.discovery_metadata`, `${id} weak discovery metadata: ${discovery.diagnostics.map((diagnostic) => diagnostic.id).join(", ")}`, full));
  checks.push(policy.valid ? pass(`prompt_surface.skill.${id}.model`, `${id} uses exact Codex model policy`, full) : fail(`prompt_surface.skill.${id}.model`, `${id} invalid model policy: ${policy.issues.join(", ")}`, full));
  checks.push(hashLooksValid(scalarMetadata(frontmatter["source-hash"]) ?? scalarMetadata(frontmatter.source_hash)) && !!(scalarMetadata(frontmatter["source-reference"]) ?? scalarMetadata(frontmatter.source_reference)) ? pass(`prompt_surface.skill.${id}.traceability`, `${id} source traceability present`, full) : fail(`prompt_surface.skill.${id}.traceability`, `${id} missing source-reference/source-hash`, full));
  const primaryAgent = scalarMetadata(frontmatter["primary-agent"]) ?? scalarMetadata(frontmatter.primary_agent);
  checks.push(primaryAgent && existsSync(path.join(root, ".codex", "agents", `${primaryAgent}.toml`)) ? pass(`prompt_surface.skill.${id}.agent_link`, `${id} primary agent resolves`, full) : fail(`prompt_surface.skill.${id}.agent_link`, `${id} primary agent link missing or broken`, full));
  checks.push(scalarMetadata(frontmatter["argument-hint"]) ? pass(`prompt_surface.skill.${id}.argument_hint`, `${id} argument hint present`, full) : fail(`prompt_surface.skill.${id}.argument_hint`, `${id} missing argument hint`, full));
  const requiredSections = ["Objective", "Inputs", "Arguments", "Procedure", "Output Contract", "Quality Gates", "Decision Gates", "Handoff"];
  const missingSection = requiredSections.find((section) => !sectionHasContent(body, `## ${section}`));
  checks.push(!missingSection ? pass(`prompt_surface.skill.${id}.contract`, `${id} concise skill contract sections present`, full) : fail(`prompt_surface.skill.${id}.contract`, `${id} missing concise section: ${missingSection}`, full));
  const redundantSections = ["Prerequisites", "Phased Procedure", "Failure Modes", "Adaptation Rationale"];
  const redundantSection = redundantSections.find((section) => new RegExp(`^## ${section.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\s*$`, "m").test(body));
  checks.push(!redundantSection ? pass(`prompt_surface.skill.${id}.concise`, `${id} avoids duplicated generic adapter sections`, full) : fail(`prompt_surface.skill.${id}.concise`, `${id} includes redundant generic section: ${redundantSection}`, full));
  checks.push(body.split("\n").length <= 90 ? pass(`prompt_surface.skill.${id}.length`, `${id} stays within concise skill line budget`, full) : fail(`prompt_surface.skill.${id}.length`, `${id} exceeds concise skill line budget`, full));
  return checks;
}

function workflowPromptSurfaceChecks(root: string, file: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const full = path.join(root, file);
  const id = path.basename(file, ".md");
  const body = readFileSync(full, "utf8");
  const { frontmatter } = parsePromptSurfaceFrontmatter(body);
  const model = scalarMetadata(frontmatter.model);
  const effort = scalarMetadata(frontmatter.model_reasoning_effort);
  const discovery = validateWorkflowArgumentHintQuality(scalarMetadata(frontmatter["argument-hint"]), id);
  const policy = validateModelPolicy({ model: model ?? "", model_reasoning_effort: effort });
  checks.push(discovery.valid ? pass(`prompt_surface.workflow.${id}.discovery_metadata`, `${id} discovery metadata is selection-oriented`, full) : fail(`prompt_surface.workflow.${id}.discovery_metadata`, `${id} weak discovery metadata: ${discovery.diagnostics.map((diagnostic) => diagnostic.id).join(", ")}`, full));
  checks.push(policy.valid ? pass(`prompt_surface.workflow.${id}.model`, `${id} uses exact Codex model policy`, full) : fail(`prompt_surface.workflow.${id}.model`, `${id} invalid model policy: ${policy.issues.join(", ")}`, full));
  const agent = scalarMetadata(frontmatter["primary-agent"]) ?? scalarMetadata(frontmatter.primary_agent);
  checks.push(agent && existsSync(path.join(root, ".codex", "agents", `${agent}.toml`)) ? pass(`prompt_surface.workflow.${id}.agent_link`, `${id} primary agent resolves`, full) : fail(`prompt_surface.workflow.${id}.agent_link`, `${id} primary agent link missing or broken`, full));
  const linkedSkills = arrayMetadata(frontmatter["linked-skills"] ?? frontmatter.linked_skills);
  const brokenSkill = linkedSkills.find((skill) => !existsSync(path.join(root, ".agents", "skills", skill, "SKILL.md")));
  checks.push(linkedSkills.length && !brokenSkill ? pass(`prompt_surface.workflow.${id}.skill_links`, `${id} linked skills resolve`, full) : fail(`prompt_surface.workflow.${id}.skill_links`, brokenSkill ? `${id} linked skill missing: ${brokenSkill}` : `${id} missing linked skills`, full));
  checks.push(hashLooksValid(scalarMetadata(frontmatter["source-hash"]) ?? scalarMetadata(frontmatter.source_hash)) && !!(scalarMetadata(frontmatter["source-reference"]) ?? scalarMetadata(frontmatter.source_reference)) ? pass(`prompt_surface.workflow.${id}.traceability`, `${id} source traceability present`, full) : fail(`prompt_surface.workflow.${id}.traceability`, `${id} missing source-reference/source-hash`, full));
  checks.push(promptSurfaceDepth(body, ["Purpose", "Inputs", "Phase Gates", "Required Artifacts", "Context Contract", "Output Contract", "Stop Conditions", "Handoff"]) >= 45 ? pass(`prompt_surface.workflow.${id}.depth`, `${id} prompt depth sufficient`, full) : fail(`prompt_surface.workflow.${id}.depth`, `${id} prompt surface too thin`, full));
  return checks;
}


function openAiSkillMetadataChecks(root: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  for (const skill of ["cgs-prototype", "cgs-vertical-slice", "cgs-bugfix", "cgs-release-checklist", "cgs-help"]) {
    const file = path.join(root, ".agents", "skills", skill, "agents", "openai.yaml");
    if (!existsSync(file)) {
      checks.push(fail(`prompt_surface.skill.${skill}.openai_metadata`, `${skill} optional OpenAI skill metadata missing`, file));
      continue;
    }
    const body = readFileSync(file, "utf8");
    const required = ["display_name:", "short_description:", "default_prompt:", "invocation_policy:", "dependencies:"];
    checks.push(required.every((marker) => body.includes(marker)) && body.includes("AGENTS.md") ? pass(`prompt_surface.skill.${skill}.openai_metadata`, `${skill} optional OpenAI skill metadata present`, file) : fail(`prompt_surface.skill.${skill}.openai_metadata`, `${skill} OpenAI metadata incomplete`, file));
  }
  return checks;
}

function promptSurfaceQualityChecks(root: string, agentFiles: string[], workflowFiles: string[], skillFiles: string[]): ValidationCheck[] {
  return [
    ...agentFiles.flatMap((file) => agentPromptSurfaceChecks(root, file)),
    ...workflowFiles.flatMap((file) => workflowPromptSurfaceChecks(root, file)),
    ...skillFiles.flatMap((file) => skillPromptSurfaceChecks(root, file))
  ];
}

function skillChecks(projectRoot: string, studio: StudioProjectState): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  for (const definition of templateSkillDefinitions(configFromStudio(studio))) {
    const file = path.join(projectRoot, ".agents", "skills", definition.name, "SKILL.md");
    if (!existsSync(file)) {
      checks.push(fail(`codex.skill.${definition.name}.exists`, `${definition.name} skill missing`, file));
      continue;
    }
    const body = readFileSync(file, "utf8");
    checks.push(pass(`codex.skill.${definition.name}.exists`, `${definition.name} skill exists`, file));
    checks.push(body.includes(`\nname: ${definition.name}\n`) ? pass(`codex.skill.${definition.name}.name`, `${definition.name} metadata has name`, file) : fail(`codex.skill.${definition.name}.name`, `${definition.name} metadata missing name`, file));
    checks.push(body.includes("\ndescription: ") ? pass(`codex.skill.${definition.name}.description`, `${definition.name} metadata has description`, file) : fail(`codex.skill.${definition.name}.description`, `${definition.name} metadata missing description`, file));
    const qualityGates = sectionBody(body, "Quality Gates");
    for (const marker of definition.requiredMarkers ?? []) {
      const id = `codex.skill.${definition.name}.marker.${slugCheckId(marker)}`;
      const expectedBullet = `- ${marker}`;
      checks.push(qualityGates.includes(expectedBullet) ? pass(id, `${definition.name} includes ${marker}`, file) : fail(id, `${definition.name} missing required marker ${marker}`, file));
    }
  }
  return checks;
}

export async function validateRepo(root = process.cwd()): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = [];
  checks.push(...validateTemplateSurfaces(root));
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, string>; bin?: Record<string, string>; files?: string[]; engines?: { node?: string } };
  const scripts = pkg.scripts ?? {};
  for (const script of ["build", "init", "manage", "test", "validate", "templates"]) {
    checks.push(scripts[script] ? pass(`pkg.script.${script}`, `script ${script} exists`) : fail(`pkg.script.${script}`, `missing script ${script}`, pkgPath));
  }
  checks.push(scripts.build === "tsc -p tsconfig.build.json" ? pass("package.build", "build uses tsconfig.build.json") : fail("package.build", "build must use tsconfig.build.json", pkgPath));
  checks.push(
    pkg.bin?.["codex-game-studio"] === "./dist/cli.js" && Object.keys(pkg.bin ?? {}).length === 1
      ? pass("package.bin", "codex-game-studio bin points to built dist CLI without legacy aliases")
      : fail("package.bin", "codex-game-studio must be the only package bin and must point to ./dist/cli.js", pkgPath)
  );
  checks.push(pkg.engines?.node?.includes(">=24") ? pass("package.node", "node 24 floor declared") : fail("package.node", "node >=24 must be declared", pkgPath));
  for (const file of ["dist/", "engine_configs/", "engine_reference/", "templates/"]) {
    checks.push(pkg.files?.includes(file) ? pass(`pkg.files.${file}`, `${file} shipped`) : fail(`pkg.files.${file}`, `${file} missing from package files`, pkgPath));
  }
  checks.push(existsSync(path.join(root, "codex-game-studio")) ? pass("source.wrapper", "source checkout wrapper exists") : fail("source.wrapper", "source checkout wrapper missing", path.join(root, "codex-game-studio")));
  for (const file of ["src/cli.ts", "src/behavioral-evaluation.ts", "src/customization.ts", "src/codex-runtime.ts", "src/codex-session.ts", "src/codex-prompts.ts", "src/prompt-context.ts", "src/context-manifest.ts", "src/roles.ts", "src/tasks.ts", "src/orchestrator.ts", "src/orchestrator-locks.ts", "src/workflow-recipes.ts", "src/ccgs-adaptation.ts", "src/workflows.ts", "src/verification.ts", "src/prompt-surface-metadata.ts", "src/projects.ts", "src/runner.ts", "src/validation.ts"]) {
    checks.push(existsSync(path.join(root, file)) ? pass(`src.${file}`, `${file} exists`) : fail(`src.${file}`, `${file} missing`, file));
  }

  const codex = await checkCodexAvailability();
  checks.push(codex.ok ? pass("codex.cli", "Codex CLI is available") : fail("codex.cli", codex.reason ?? "Codex CLI unavailable or unauthenticated"));

  const baseAgentFailures = validateBaseAgents();
  checks.push(...baseAgentFailures.map((message) => fail("codex.roles", message)));
  for (const role of studioRoleIds) {
    const rendered = renderCodexPrompt(createCodexStudioSession({ projectRoot: root, role, objective: "validate role rendering", phase: "plan" }));
    checks.push(rendered.includes(rolePackages[role].displayName) ? pass(`codex.role.${role}.package-render`, `${role} package renders`) : fail(`codex.role.${role}.package-render`, `${role} package did not render`));
  }

  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  for (const [id, config] of Object.entries(engines)) {
    checks.push(config.codex_hints.length && config.run_command && config.test_command ? pass(`codex.engine.${id}`, `${id} Codex hints parse`) : fail(`codex.engine.${id}`, `${id} Codex hints missing`));
  }
  checks.push(...engineReferenceRepoChecks(root));

  for (const workflow of workflowIds()) {
    const definition = workflowRegistry[workflow];
    checks.push(definition.file.endsWith(`${workflow}.md`) ? pass(`codex.workflow.${workflow}.registry`, `${workflow} registry entry exists`) : fail(`codex.workflow.${workflow}.registry`, `${workflow} registry file mismatch`));
    const rendered = renderCodexPrompt(createCodexStudioSession({ projectRoot: root, role: definition.role, objective: definition.objective, phase: definition.phase, contextFiles: definition.contextFiles }));
    checks.push(rendered.includes(definition.objective) ? pass(`codex.workflow.${workflow}.render`, `${workflow} workflow renders`) : fail(`codex.workflow.${workflow}.render`, `${workflow} workflow did not render`));
  }

  for (const result of runBehavioralEvaluations({})) {
    const message = result.status === "pass"
      ? `${result.id} behavioral scenario passes`
      : `${result.id} behavioral scenario failed: missing phrases [${result.missingRequiredPhrases.join(", ")}], forbidden phrases [${result.presentForbiddenPhrases.join(", ")}], missing context [${result.missingContextCategories.join(", ")}], missing templates [${result.missingTemplateIds.join(", ")}], forbidden templates [${result.presentForbiddenTemplateIds.join(", ")}]`;
    checks.push(result.status === "pass" ? pass(`behavioral.scenario.${result.id}`, message) : fail(`behavioral.scenario.${result.id}`, message));
  }

  checks.push(...validatePerformanceEvaluationFramework(root));

  const templateFailures = validateTemplateFiles();
  checks.push(...templateFailures.map((message) => fail("templates", message)));
  for (const [id, info] of Object.entries(templateRegistry)) {
    const file = packageAssetPath(info.path);
    if (!existsSync(file)) {
      checks.push(fail(`codex.template.${id}.exists`, `${id} template missing`, file));
      continue;
    }
    const body = readFileSync(file, "utf8");
    const missingSection = info.requiredSections.find((section) => !sectionHasContent(body, section));
    if (missingSection) {
      checks.push(fail(`codex.template.${id}.exists`, `${id} template missing non-empty ${missingSection}`, file));
      continue;
    }
    if (id === "project_config") {
      try {
        JSON.parse(body);
        checks.push(pass(`codex.template.${id}.exists`, `${id} template exists`, file));
      } catch (error) {
        checks.push(fail(`codex.template.${id}.exists`, `${id} template JSON invalid: ${(error as Error).message}`, file));
      }
      continue;
    }
    checks.push(pass(`codex.template.${id}.exists`, `${id} template exists`, file));
  }
  if (templateFailures.length === 0) checks.push(pass("templates", "all templates exist"));

  const builtCli = path.join(root, "dist", "cli.js");
  const cliHelp = existsSync(builtCli) ? execFileSync("node", [builtCli, "--help"], { cwd: root, encoding: "utf8" }) : "";
  checks.push(/\bnext\b/.test(cliHelp) ? fail("codex.surface.future.next", "future next command exposed") : pass("codex.surface.future.next", "future next command is not exposed"));
  checks.push(/\btelemetry\b/.test(cliHelp) ? fail("codex.surface.future.telemetry", "future telemetry command exposed") : pass("codex.surface.future.telemetry", "future telemetry command is not exposed"));
  checks.push(/\bparallel\b/.test(cliHelp) ? fail("codex.surface.future.parallel", "future parallel command exposed") : pass("codex.surface.future.parallel", "future parallel command is not exposed"));
  checks.push(/ownership/i.test(cliHelp) ? fail("codex.surface.future.ownership", "future ownership enforcement surface exposed") : pass("codex.surface.future.ownership", "future ownership enforcement surface is not exposed"));

  checks.push(existsSync(builtCli) ? pass("build.output", "dist/cli.js exists") : fail("build.output", "dist/cli.js missing; run npm run build", builtCli));
  if (existsSync(path.join(root, "dist", "cli.js"))) {
    try {
      const packRaw = execFileSync("npm", ["pack", "--json"], { cwd: root, encoding: "utf8", shell: false });
      const packInfo = JSON.parse(packRaw)[0] as { filename: string; files: { path: string }[] };
      const packed = new Set(packInfo.files.map((file) => file.path));
      for (const need of [
        "dist/cli.js",
        "engine_configs/godot.json",
        "engine_configs/unity.json",
        "engine_configs/unreal.json",
        ...Object.values(templateRegistry).map((template) => template.path),
        ...Object.values(engineReferenceRegistry).flatMap((pack) => pack.packageSmokeFiles.map((file) => `${pack.packageRoot}/${file}`))
      ]) {
        checks.push(packed.has(need) ? pass(`pack.${need}`, `${need} packed`) : fail(`pack.${need}`, `${need} missing from npm pack`));
      }
      const temp = mkdtempSync(path.join(tmpdir(), "codex-game-studio-pack-"));
      try {
        execFileSync("npm", ["install", "--silent", "--prefix", temp, path.join(root, packInfo.filename)], { cwd: root, encoding: "utf8", shell: false });
        execFileSync("npm", ["exec", "--prefix", temp, "codex-game-studio", "--", "templates", "list"], { cwd: temp, encoding: "utf8", shell: false });
        checks.push(pass("pack.install_smoke", "installed package bin loads templates from temp cwd"));
      } finally {
        rmSync(temp, { recursive: true, force: true });
        unlinkSync(path.join(root, packInfo.filename));
      }
    } catch (error) {
      checks.push(fail("pack.install_smoke", `package smoke failed: ${(error as Error).message}`));
    }
  }
  return checks;
}

export function validateProject(projectRoot: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const studioPath = path.join(projectRoot, ".codex", "studio.json");
  let studio: ReturnType<typeof readStudioProject>;
  try {
    studio = readStudioProject(projectRoot);
    checks.push(pass("codex.project.studio", "studio.json schema-readable", studioPath));
  } catch (error) {
    return [fail("codex.project.studio", `invalid studio state: ${(error as Error).message}`, studioPath)];
  }

  const expectedProjectRoles = projectRoleIdsForEngine(studio.engine);
  const expectedActiveRoles = activeAgentsForProject(studio.mode, studio.engine);
  checks.push(JSON.stringify(studio.roles) === JSON.stringify(expectedProjectRoles) ? pass("codex.project.roles", "engine-scoped role roster recorded", studioPath) : fail("codex.project.roles", "studio roles must match engine-scoped project roles", studioPath));
  checks.push(JSON.stringify(studio.activeRoles) === JSON.stringify(expectedActiveRoles) ? pass("codex.project.activeRoles", "mode and engine-active roles recorded", studioPath) : fail("codex.project.activeRoles", "activeRoles must match project mode and engine", studioPath));
  checks.push(JSON.stringify(studio.workflows) === JSON.stringify(workflowIds()) ? pass("codex.project.workflows", "canonical workflows recorded", studioPath) : fail("codex.project.workflows", "workflows must match registry keys", studioPath));
  checks.push(
    ...validateProjectCustomization(projectRoot, { builtInWorkflowIds: workflowIds(), builtInTemplateIds: Object.keys(templateRegistry) }).map((check) =>
      check.status === "pass" ? pass(check.id, check.message, check.path) : fail(check.id, check.message, check.path)
    )
  );

  const approvalsPath = path.join(projectRoot, ".codex", "approvals.json");
  if (!existsSync(approvalsPath)) {
    checks.push(fail("codex.project.approvals", "approval store missing", approvalsPath));
  } else {
    try {
      const approvalStore = JSON.parse(readFileSync(approvalsPath, "utf8")) as unknown;
      const result = validateApprovalStore(approvalStore, { projectRoot });
      checks.push(result.ok ? pass("codex.project.approvals", "approval store schema-readable", approvalsPath) : fail("codex.project.approvals", `approval store invalid: ${result.errors.join("; ")}`, approvalsPath));
    } catch (error) {
      checks.push(fail("codex.project.approvals", `approval store invalid JSON: ${(error as Error).message}`, approvalsPath));
    }
  }

  checks.push(...contextManifestChecks(projectRoot, studio));
  checks.push(...engineReferenceProjectChecks(projectRoot, studio));

  const agentsMd = path.join(projectRoot, "AGENTS.md");
  if (existsSync(agentsMd)) {
    const body = readFileSync(agentsMd, "utf8");
    for (const section of projectAgentsMdRequiredSections) {
      checks.push(sectionHasContent(body, section) ? pass(`codex.project.AGENTS.md.${section}`, `${section} exists`, agentsMd) : fail(`codex.project.AGENTS.md.${section}`, `${section} missing content`, agentsMd));
    }
  } else {
    checks.push(fail("project.agents_md", "AGENTS.md missing", agentsMd));
  }

  for (const role of studioRoleIds) {
    checks.push(...customAgentChecks(projectRoot, role, studio));
  }
  checks.push(...skillChecks(projectRoot, studio));

  for (const workflow of workflowIds()) {
    const file = path.join(projectRoot, workflowRegistry[workflow].file);
    if (!existsSync(file)) {
      checks.push(fail(`codex.workflow.${workflow}.file.exists`, `${workflow} workflow missing`, file));
      continue;
    }
    const body = readFileSync(file, "utf8");
    checks.push(pass(`codex.workflow.${workflow}.file.exists`, `${workflow} workflow exists`, file));
    const hasSections = ["## Purpose", "## Inputs", "## Role", "## Outputs", "## Validation"].every((section) => sectionHasContent(body, section));
    checks.push(hasSections ? pass(`codex.workflow.${workflow}.sections`, `${workflow} workflow sections exist`, file) : fail(`codex.workflow.${workflow}.sections`, `${workflow} workflow sections missing content`, file));
    checks.push(renderWorkflowPrompt(projectRoot, workflow).includes(workflowRegistry[workflow].objective) ? pass(`codex.workflow.${workflow}.render`, `${workflow} workflow renders`) : fail(`codex.workflow.${workflow}.render`, `${workflow} workflow did not render`));
    checks.push(pass(`codex.workflow.${workflow}.registry`, `${workflow} registry entry exists`));
    checks.push(pass(`codex.workflow.${workflow}`, `${workflow} workflow exists`, file));
  }

  const root = sourceRoot(projectRoot, studio.slug);
  checks.push(existsSync(root) ? pass("project.source_root", "engine source root exists", root) : fail("project.source_root", "engine source root missing", root));
  const engineFile = studio.engine === "godot" ? path.join(root, "project.godot") : studio.engine === "unity" ? path.join(root, "Packages", "manifest.json") : path.join(root, unrealProjectFileName(studio.name));
  checks.push(existsSync(engineFile) ? pass("project.engine_file", "engine project file exists", engineFile) : fail("project.engine_file", "engine project file missing", engineFile));
  if (studio.engine === "unity") {
    const settings = path.join(root, "ProjectSettings", "ProjectSettings.asset");
    checks.push(existsSync(settings) ? pass("project.engine_settings", "Unity ProjectSettings marker exists", settings) : fail("project.engine_settings", "Unity ProjectSettings marker missing", settings));
  }

  for (const file of ["docs/market-overview.md", "design/gdd.md", "production/timeline.md", "docs/architecture/README.md"]) {
    checks.push(existsSync(path.join(projectRoot, file)) ? pass(`project.artifact.${file}`, `${file} exists`) : fail(`project.artifact.${file}`, `${file} missing`, path.join(projectRoot, file)));
  }
  const timeline = path.join(projectRoot, "production", "timeline.md");
  if (existsSync(timeline)) {
    const body = readFileSync(timeline, "utf8");
    for (const section of ["# Timeline", "# Milestones", "# Risks", "# Next Validation Gate"]) {
      checks.push(sectionHasContent(body, section) ? pass(`project.timeline.${section}`, `${section} exists`, timeline) : fail(`project.timeline.${section}`, `${section} missing non-empty content`, timeline));
    }
  }

  for (const forbidden of ["project_orchestrator.md", "CODEX.md", path.join(".gamestudio", "runs"), path.join(".codex", "hooks.json"), path.join(".codex", "agents", "truth-claim-verifier.toml"), path.join(".codex", "agents", "truth-doc-reviewer.toml"), path.join(".codex", "agents", "truth-doc-writer.toml"), path.join(".codex", "agents", "truth-route-auditor.toml")]) {
    const file = path.join(projectRoot, forbidden);
    checks.push(existsSync(file) ? fail(`project.forbidden.${forbidden}`, `${forbidden} must not exist`, file) : pass(`project.forbidden.${forbidden}`, `${forbidden} absent`));
  }

  const before = readFileSync(studioPath, "utf8");
  statusProject(projectRoot, path.dirname(projectRoot));
  resumeProject(projectRoot, path.dirname(projectRoot));
  const after = readFileSync(studioPath, "utf8");
  checks.push(before === after ? pass("project.read_only", "status/resume are read-only") : fail("project.read_only", "status/resume mutated project", studioPath));
  return checks;
}

export async function runValidation(options: { project?: string; root?: string } = {}): Promise<{ checks: ValidationCheck[]; failed: boolean }> {
  const root = options.root ?? process.cwd();
  const projectPath = options.project ? path.resolve(root, options.project) : existsSync(path.join(root, ".codex", "studio.json")) ? root : undefined;
  const checks = projectPath ? validateProject(projectPath) : await validateRepo(root);
  return { checks, failed: checks.some((check) => check.status === "fail") };
}
