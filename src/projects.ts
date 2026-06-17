import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { activeAgentsForProject, slugify, type ProjectConfig, type ProjectMode } from "./config.js";
import { createEngineFolders, createEngineProjectFiles, loadEngineConfigs, normalizeEngine, projectClassName, sourceRoot, unrealProjectFileName } from "./engines.js";
import { materializeEngineReferences } from "./engine-reference.js";
import { materializeAgents } from "./agents.js";
import { writeApprovalStore } from "./approvals.js";
import { writeContextManifest } from "./context-manifest.js";
import { renderGeneratedSurfaceMetadata } from "./generated-surfaces.js";
import { packageAssetPath, resolveProjectRoot } from "./paths.js";
import { projectRoleIdsForEngine, rolePackages, type StudioRoleId } from "./roles.js";
import { workflowIds, workflowRegistry, type WorkflowId } from "./workflows.js";
import type { StudioMode } from "./studio-policy.js";

export type InitProjectOptions = {
  name: string;
  engine: string;
  mode?: ProjectMode;
  studioMode?: StudioMode;
  concept?: string;
  genre?: string;
  platform?: string;
  audience?: string;
  competitors?: string[];
  monetization?: string;
  timeline?: string;
  engineVersion?: string;
  nonInteractive?: boolean;
};

export type StudioProjectState = {
  schemaVersion: 1;
  product: "codex-game-studio";
  name: string;
  slug: string;
  concept: string;
  genre: string;
  platform: string;
  audience: string;
  competitors: string[];
  monetization: string;
  timeline: string;
  engine: ProjectConfig["project"]["engine"];
  engineVersion: string;
  mode: ProjectMode;
  studioMode: StudioMode;
  phase: string;
  status: "active" | "frozen" | "inactive";
  currentMilestone: string;
  roles: StudioRoleId[];
  activeRoles: StudioRoleId[];
  workflows: WorkflowId[];
};

export function defaultProjectConfig(options: InitProjectOptions): ProjectConfig {
  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  const engine = normalizeEngine(options.engine, engines);
  if (!options.nonInteractive) throw new Error("init requires --non-interactive");
  if (!options.mode) throw new Error("init requires --mode");
  const mode = options.mode;
  const studioMode = options.studioMode ?? "guided-studio";
  const slug = slugify(options.name);
  return {
    schema_version: "1.0",
    project: {
      name: options.name,
      slug,
      concept: options.concept ?? `${options.name} concept`,
      genre: options.genre ?? "Unspecified",
      platform: options.platform ?? "PC",
      audience: options.audience ?? "General players",
      competitors: options.competitors ?? [],
      monetization: options.monetization ?? "undecided",
      timeline: options.timeline ?? "TBD",
      engine,
      engine_version: options.engineVersion ?? engines[engine].default_version,
      mode,
      studio_mode: studioMode,
      phase: "Initialization",
      status: "active"
    },
    team: { active_agents: activeAgentsForProject(mode, engine) },
    production: {
      milestones: [
        {
          id: "m1",
          title: "Playable prototype",
          target: "Week 4",
          exit_criteria: ["Core loop is playable"],
          status: "planned"
        }
      ]
    }
  };
}

function writeStarterDocs(projectRoot: string, config: ProjectConfig): void {
  mkdirSync(path.join(projectRoot, "documentation", "design"), { recursive: true });
  mkdirSync(path.join(projectRoot, "documentation", "production"), { recursive: true });
  mkdirSync(path.join(projectRoot, "resources", "market-research"), { recursive: true });
  writeFileSync(
    path.join(projectRoot, "documentation", "design", "gdd.md"),
    `# ${config.project.name} GDD\n\n# Purpose\n\n${config.project.concept}\n\n# Core Loop\n\nDefine and validate the playable loop.\n\n# Validation\n\nRun \`npm run validate -- --project projects/${config.project.slug}\`.\n`
  );
  writeFileSync(
    path.join(projectRoot, "documentation", "production", "timeline.md"),
    `# Timeline\n\n${config.project.timeline}\n\n# Milestones\n\n${config.production.milestones.map((m) => `- ${m.id}: ${m.title} (${m.target})`).join("\n")}\n\n# Risks\n\n- Scope may exceed the first validation gate.\n\n# Next Validation Gate\n\nRun project validation after first playable setup.\n`
  );
  writeFileSync(
    path.join(projectRoot, "resources", "market-research", "market-overview.md"),
    `# Market Overview\n\nAudience: ${config.project.audience}\n\nCompetitors: ${config.project.competitors.join(", ")}\n\nThis is a seed, not a full competitor report.\n`
  );
}

function assertNoSameParentCollision(parent: string, config: ProjectConfig): void {
  if (!existsSync(parent)) return;
  const nextClass = projectClassName(config.project.name);
  for (const entry of readdirSync(parent, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const studioPath = path.join(parent, entry.name, ".codex", "studio.json");
    if (!existsSync(studioPath)) continue;
    const existing = readStudioProject(path.join(parent, entry.name));
    if (existing.name === config.project.name) continue;
    if (existing.slug === config.project.slug) {
      throw new Error(`Project name "${config.project.name}" collides with existing slug "${existing.slug}" in ${parent}`);
    }
    if (existing.engine === "unreal" || config.project.engine === "unreal") {
      const existingClass = projectClassName(existing.name);
      if (existingClass === nextClass) {
        throw new Error(`Project name "${config.project.name}" collides with existing Unreal class name "${existingClass}" in ${parent}`);
      }
    }
  }
}

export function studioStateFromConfig(config: ProjectConfig): StudioProjectState {
  return {
    schemaVersion: 1,
    product: "codex-game-studio",
    name: config.project.name,
    slug: config.project.slug,
    concept: config.project.concept,
    genre: config.project.genre,
    platform: config.project.platform,
    audience: config.project.audience,
    competitors: config.project.competitors,
    monetization: config.project.monetization,
    timeline: config.project.timeline,
    engine: config.project.engine,
    engineVersion: config.project.engine_version,
    mode: config.project.mode,
    studioMode: config.project.studio_mode,
    phase: config.project.phase,
    status: config.project.status,
    currentMilestone: config.project.mode === "design" ? "design" : config.project.mode === "development" ? "development" : "prototype",
    roles: projectRoleIdsForEngine(config.project.engine),
    activeRoles: activeAgentsForProject(config.project.mode, config.project.engine),
    workflows: workflowIds()
  };
}

export function readStudioProject(projectRoot: string): StudioProjectState {
  const value = JSON.parse(readFileSync(path.join(projectRoot, ".codex", "studio.json"), "utf8")) as Partial<StudioProjectState>;
  if (value.mode !== "design" && value.mode !== "prototype" && value.mode !== "development") {
    throw new Error("studio.json mode must be design, prototype, or development");
  }
  if (value.studioMode !== "fast-prototype" && value.studioMode !== "guided-studio" && value.studioMode !== "strict-studio") {
    throw new Error("studio.json studioMode must be fast-prototype, guided-studio, or strict-studio");
  }
  return value as StudioProjectState;
}

function writeStudioProject(projectRoot: string, state: StudioProjectState): void {
  writeFileSync(path.join(projectRoot, ".codex", "studio.json"), `${JSON.stringify(state, null, 2)}\n`);
}

function workflowTitle(id: WorkflowId): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function workflowBody(workflow: WorkflowId): string {
  const definition = workflowRegistry[workflow];
  const pkg = rolePackages[definition.role];
  const body = [
    `# ${workflowTitle(workflow)} Workflow`,
    "",
    "## Purpose",
    "",
    definition.objective,
    "",
    "## Inputs",
    "",
    ...definition.contextFiles.map((file) => `- ${file}`),
    "",
    "## Role",
    "",
    `${pkg.displayName} (${definition.role}) owns this workflow.`,
    "",
    "## Outputs",
    "",
    ...pkg.expectedOutputs.map((item) => `- ${item}`),
    "",
    "## Validation",
    "",
    ...pkg.reviewChecklist.map((item) => `- ${item}`),
    ""
  ].join("\n");
  return `${renderGeneratedSurfaceMetadata({
    surface: "workflow",
    id: workflow,
    sourceInput: workflowSourceInput(workflow),
    body
  })}${body}`;
}

export function workflowSourceInput(workflow: WorkflowId): unknown {
  const definition = workflowRegistry[workflow];
  const pkg = rolePackages[definition.role];
  return {
    workflow,
    role: definition.role,
    phase: definition.phase,
    objective: definition.objective,
    file: definition.file,
    contextFiles: definition.contextFiles,
    templateIds: definition.templateIds ?? [],
    roleDisplayName: pkg.displayName,
    expectedOutputs: pkg.expectedOutputs,
    reviewChecklist: pkg.reviewChecklist
  };
}

function writeCodexWorkflowFiles(projectRoot: string): void {
  const workflows = path.join(projectRoot, ".codex", "workflows");
  mkdirSync(workflows, { recursive: true });
  for (const workflow of workflowIds()) writeFileSync(path.join(projectRoot, workflowRegistry[workflow].file), workflowBody(workflow));
}

export function initProject(options: InitProjectOptions, cwd = process.cwd()): { projectRoot: string; config: ProjectConfig } {
  const config = defaultProjectConfig(options);
  const projectRoot = path.resolve(cwd, path.join("projects", config.project.slug));
  if (existsSync(projectRoot)) throw new Error(`Project path already exists or collides: ${projectRoot}`);
  assertNoSameParentCollision(path.dirname(projectRoot), config);
  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  mkdirSync(projectRoot, { recursive: true });
  createEngineFolders({ projectRoot, projectSlug: config.project.slug, projectName: config.project.name, engine: config.project.engine, registry: engines });
  createEngineProjectFiles({ projectRoot, projectSlug: config.project.slug, projectName: config.project.name, engine: config.project.engine, registry: engines, engineVersion: config.project.engine_version });
  mkdirSync(path.join(projectRoot, ".codex", "runs"), { recursive: true });
  writeApprovalStore(projectRoot);
  writeStudioProject(projectRoot, studioStateFromConfig(config));
  writeCodexWorkflowFiles(projectRoot);
  writeStarterDocs(projectRoot, config);
  materializeEngineReferences(projectRoot, packageAssetPath("."), config.project.engine);
  materializeAgents({ projectRoot, config, engines });
  writeContextManifest(projectRoot, readStudioProject(projectRoot));
  return { projectRoot, config };
}

export function statusProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const config = readStudioProject(root);
  return [
    `${config.name}`,
    `phase: ${config.phase}`,
    `status: ${config.status}`,
    `mode: ${config.mode}`,
    `studio mode: ${config.studioMode}`,
    `engine: ${config.engine}`,
    `active roles: ${(config.activeRoles ?? config.roles).join(", ")}`
  ].join("\n");
}

export function resumeProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const config = readStudioProject(root);
  return `Resume ${config.name}\nphase: ${config.phase}\nstatus: ${config.status}\nSuggested next command: npm run build && node dist/cli.js run producer --project ${path.relative(cwd, root) || "."} "Summarize current project state"`;
}

export function freezeProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const config = readStudioProject(root);
  config.status = "frozen";
  writeStudioProject(root, config);
  return `Frozen ${config.name}`;
}

export function expectedEngineProjectFile(projectRoot: string, config: ProjectConfig): string {
  const root = sourceRoot(projectRoot, config.project.slug);
  if (config.project.engine === "godot") return path.join(root, "project.godot");
  if (config.project.engine === "unity") return path.join(root, "Packages", "manifest.json");
  return path.join(root, unrealProjectFileName(config.project.name));
}

export function readFileIfExists(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, "utf8") : undefined;
}
