import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { activeAgentsForProject, slugify, type ProjectConfig, type ProjectMode } from "./config.js";
import { createEngineFolders, createEngineProjectFiles, loadEngineConfigs, normalizeEngine, sourceRoot, unrealProjectFileName } from "./engines.js";
import { writeDefaultProjectCustomization, readProjectCustomization } from "./customization.js";
import { materializeEngineReferences } from "./engine-reference.js";

import { writeApprovalStore } from "./approvals.js";
import { writeContextManifest } from "./context-manifest.js";
import { renderGeneratedSurfaceMetadata } from "./generated-surfaces.js";
import { packageAssetPath, resolveProjectRoot } from "./paths.js";
import { projectRoleIdsForEngine, rolePackages, type StudioRoleId } from "./roles.js";
import { workflowAliases, workflowIds, workflowRegistry, type WorkflowId } from "./workflows.js";
import { workflowCatalogSummary } from "./workflow-catalog.js";
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
  forceRefresh?: boolean;
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
  for (const folder of ["src", "assets", "design", "docs", path.join("docs", "architecture"), "tests", "tools", "production", path.join("production", "session-state")]) {
    mkdirSync(path.join(projectRoot, folder), { recursive: true });
  }
  for (const marker of ["assets/.gitkeep", "tests/.gitkeep", "tools/.gitkeep", "production/session-state/.gitkeep"]) {
    writeFileSync(path.join(projectRoot, marker), "");
  }
  writeFileSync(
    path.join(projectRoot, "design", "gdd.md"),
    `# ${config.project.name} GDD\n\n# Purpose\n\n${config.project.concept}\n\n# Core Loop\n\nDefine and validate the playable loop.\n\n# Validation\n\nRun \`./codex-game-studio validate\` from the game root.\n`
  );
  writeFileSync(
    path.join(projectRoot, "production", "timeline.md"),
    `# Timeline\n\n${config.project.timeline}\n\n# Milestones\n\n${config.production.milestones.map((m) => `- ${m.id}: ${m.title} (${m.target})`).join("\n")}\n\n# Risks\n\n- Scope may exceed the first validation gate.\n\n# Next Validation Gate\n\nRun project validation after first playable setup.\n`
  );
  writeFileSync(path.join(projectRoot, "docs", "architecture", "README.md"), `# ${config.project.name} Architecture\n\nCapture game architecture decisions here.\n`);
  writeFileSync(
    path.join(projectRoot, "docs", "market-overview.md"),
    `# Market Overview\n\nAudience: ${config.project.audience}\n\nCompetitors: ${config.project.competitors.join(", ") || "none configured"}\n\nThis is a seed, not a full competitor report.\n`
  );
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
    "## Taxonomy",
    "",
    `Category: ${definition.category}`,
    "CCGS-derived gap coverage:",
    ...definition.gapCoverage.map((item) => `- ${item}`),
    "",
    "CLI aliases:",
    ...(workflowAliases(definition).length ? workflowAliases(definition).map((alias) => `- ${alias}`) : ["- none"]),
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
    category: definition.category,
    gapCoverage: definition.gapCoverage,
    aliases: workflowAliases(definition),
    file: definition.file,
    contextFiles: definition.contextFiles,
    templateIds: definition.templateIds ?? [],
    roleDisplayName: pkg.displayName,
    expectedOutputs: pkg.expectedOutputs,
    reviewChecklist: pkg.reviewChecklist
  };
}

export function initProject(options: InitProjectOptions, cwd = process.cwd()): { projectRoot: string; config: ProjectConfig } {
  const config = defaultProjectConfig(options);
  const projectRoot = path.resolve(cwd, ".");
  const studioPath = path.join(projectRoot, ".codex", "studio.json");
  if (existsSync(studioPath) && !options.forceRefresh) {
    const existing = readStudioProject(projectRoot);
    if (existing.name !== config.project.name) {
      throw new Error(`Project root already contains ${existing.name}; pass --force-refresh to reinitialize`);
    }
  }
  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  mkdirSync(projectRoot, { recursive: true });
  createEngineFolders({ projectRoot, projectSlug: config.project.slug, projectName: config.project.name, engine: config.project.engine, registry: engines });
  createEngineProjectFiles({ projectRoot, projectSlug: config.project.slug, projectName: config.project.name, engine: config.project.engine, registry: engines, engineVersion: config.project.engine_version });
  mkdirSync(path.join(projectRoot, ".codex", "runs"), { recursive: true });
  writeApprovalStore(projectRoot);
  writeStudioProject(projectRoot, studioStateFromConfig(config));
  writeDefaultProjectCustomization(projectRoot);
  writeStarterDocs(projectRoot, config);
  materializeEngineReferences(projectRoot, packageAssetPath("."), config.project.engine);
  writeContextManifest(projectRoot, readStudioProject(projectRoot));
  return { projectRoot, config };
}

export function statusProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const config = readStudioProject(root);
  const customization = readProjectCustomization(root);
  return [
    `${config.name}`,
    `phase: ${config.phase}`,
    `status: ${config.status}`,
    `mode: ${config.mode}`,
    `studio mode: ${config.studioMode}`,
    `engine: ${config.engine}`,
    `active roles: ${(config.activeRoles ?? config.roles).join(", ")}`,
    `custom agents: .codex/agents/*.toml`,
    `skills: .agents/skills/*/SKILL.md`,
    workflowCatalogSummary(root),
    `custom roles: ${customization.roles.length}, workflows: ${customization.workflows.length}, templates: ${customization.templates.length}`
  ].join("\n");
}

export function resumeProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const config = readStudioProject(root);
  return `Resume ${config.name}\nphase: ${config.phase}\nstatus: ${config.status}\nSuggested next command: ./codex-game-studio run producer --project ${path.relative(cwd, root) || "."} "Summarize current project state"`;
}

export function refreshContextManifestProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const config = readStudioProject(root);
  writeContextManifest(root, config);
  return [`Refreshed context manifest for ${config.name}`, path.join(root, ".codex", "context-manifest.json"), path.join(root, ".codex", "context-manifest.meta.json")].join("\n");
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
