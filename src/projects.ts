import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { activeAgentsForMode, readProjectConfig, slugify, writeProjectConfig, type ProjectConfig, type ProjectMode } from "./config.js";
import { createEngineFolders, createEngineProjectFiles, loadEngineConfigs, normalizeEngine, projectClassName, sourceRoot, unrealProjectFileName } from "./engines.js";
import { materializeAgents } from "./agents.js";
import { packageAssetPath, resolveProjectRoot } from "./paths.js";

export type InitProjectOptions = {
  name: string;
  engine: string;
  mode?: ProjectMode;
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

export function defaultProjectConfig(options: InitProjectOptions): ProjectConfig {
  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  const engine = normalizeEngine(options.engine, engines);
  if (!options.nonInteractive) throw new Error("init requires --non-interactive");
  if (!options.mode) throw new Error("init requires --mode");
  const mode = options.mode;
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
      phase: "Initialization",
      status: "active"
    },
    team: { active_agents: activeAgentsForMode(mode) },
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
    const configPath = path.join(parent, entry.name, "project-config.json");
    if (!existsSync(configPath)) continue;
    const existing = readProjectConfig(configPath);
    if (existing.project.name === config.project.name) continue;
    if (existing.project.slug === config.project.slug) {
      throw new Error(`Project name "${config.project.name}" collides with existing slug "${existing.project.slug}" in ${parent}`);
    }
    if (existing.project.engine === "unreal" || config.project.engine === "unreal") {
      const existingClass = projectClassName(existing.project.name);
      if (existingClass === nextClass) {
        throw new Error(`Project name "${config.project.name}" collides with existing Unreal class name "${existingClass}" in ${parent}`);
      }
    }
  }
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
  writeProjectConfig(path.join(projectRoot, "project-config.json"), config);
  writeStarterDocs(projectRoot, config);
  materializeAgents({ projectRoot, config, engines });
  return { projectRoot, config };
}

export function statusProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const config = readProjectConfig(path.join(root, "project-config.json"));
  return [
    `${config.project.name}`,
    `phase: ${config.project.phase}`,
    `status: ${config.project.status}`,
    `mode: ${config.project.mode}`,
    `engine: ${config.project.engine}`,
    `active agents: ${config.team.active_agents.join(", ")}`
  ].join("\n");
}

export function resumeProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const config = readProjectConfig(path.join(root, "project-config.json"));
  return `Resume ${config.project.name}\nphase: ${config.project.phase}\nstatus: ${config.project.status}\nSuggested next command: npm exec open-gamestudio -- run producer_agent --project ${path.relative(cwd, root) || "."} --task "Summarize current project state"`;
}

export function freezeProject(project?: string, cwd = process.cwd()): string {
  const root = resolveProjectRoot(project, cwd);
  const file = path.join(root, "project-config.json");
  const config = readProjectConfig(file);
  config.project.status = "frozen";
  writeProjectConfig(file, config);
  return `Frozen ${config.project.name}`;
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
