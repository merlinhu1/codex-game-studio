import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

export type EngineId = "godot" | "unity" | "unreal";

const engineConfigSchema = z.object({
  id: z.enum(["godot", "unity", "unreal"]),
  display_name: z.string(),
  aliases: z.array(z.string()).min(1),
  default_version: z.string(),
  source_root_pattern: z.literal("source/project-{slug}"),
  folders: z.array(z.string()),
  project_files: z.array(z.string()),
  best_practices: z.array(z.string()),
  agent_specializations: z.record(z.string())
});

export type EngineConfig = z.infer<typeof engineConfigSchema>;
export type EngineConfigRegistry = Record<EngineId, EngineConfig>;
export type EngineCreateInput = {
  projectRoot: string;
  projectSlug: string;
  projectName: string;
  engine: EngineId;
  registry: EngineConfigRegistry;
  engineVersion?: string;
};

export function loadEngineConfigs(configDir: string): EngineConfigRegistry {
  const entries = ["godot", "unity", "unreal"] as const;
  const configs = Object.fromEntries(
    entries.map((id) => [id, engineConfigSchema.parse(JSON.parse(readFileSync(path.join(configDir, `${id}.json`), "utf8")))])
  ) as EngineConfigRegistry;
  return configs;
}

export function normalizeEngine(value: string, registry: EngineConfigRegistry): EngineId {
  const wanted = value.trim().toLowerCase();
  for (const [id, config] of Object.entries(registry) as [EngineId, EngineConfig][]) {
    if (id === wanted || config.display_name.toLowerCase() === wanted || config.aliases.some((a) => a.toLowerCase() === wanted)) {
      return id;
    }
  }
  throw new Error(`Unknown engine "${value}". Expected one of: godot, unity, unreal`);
}

export function sourceRoot(projectRoot: string, projectSlug: string): string {
  return path.join(projectRoot, "source", `project-${projectSlug}`);
}

export function projectClassName(displayNameOrSlug: string): string {
  const words = displayNameOrSlug.match(/[A-Za-z0-9]+/g);
  if (!words) throw new Error(`Cannot create project class name from "${displayNameOrSlug}"`);
  let result = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
  if (/^\d/.test(result)) result = `Game${result}`;
  return result;
}

export function unrealProjectFileName(displayNameOrSlug: string): string {
  return `${projectClassName(displayNameOrSlug)}.uproject`;
}

export function createEngineFolders(input: EngineCreateInput): string[] {
  const config = input.registry[input.engine];
  if (!config) throw new Error(`Unknown engine "${input.engine}"`);
  const root = sourceRoot(input.projectRoot, input.projectSlug);
  const created = [root, ...config.folders.map((folder) => path.join(root, folder))];
  for (const folder of created) mkdirSync(folder, { recursive: true });
  return created;
}

export function createEngineProjectFiles(input: EngineCreateInput): string[] {
  const root = sourceRoot(input.projectRoot, input.projectSlug);
  const files: string[] = [];
  if (input.engine === "godot") {
    const file = path.join(root, "project.godot");
    writeFileSync(file, `; Engine configuration file.\nconfig/name="${input.projectName}"\n`);
    files.push(file);
  } else if (input.engine === "unity") {
    const manifest = path.join(root, "Packages", "manifest.json");
    const settings = path.join(root, "ProjectSettings", "ProjectSettings.asset");
    mkdirSync(path.dirname(manifest), { recursive: true });
    mkdirSync(path.dirname(settings), { recursive: true });
    writeFileSync(manifest, `${JSON.stringify({ dependencies: {} }, null, 2)}\n`);
    writeFileSync(settings, `%YAML 1.1\nProjectSettings:\n  productName: ${input.projectName}\n`);
    files.push(manifest, settings);
  } else if (input.engine === "unreal") {
    const file = path.join(root, unrealProjectFileName(input.projectName));
    writeFileSync(file, `${JSON.stringify({ FileVersion: 3, EngineAssociation: input.engineVersion ?? input.registry.unreal.default_version }, null, 2)}\n`);
    files.push(file);
  } else {
    throw new Error(`Unknown engine "${input.engine}"`);
  }
  return files;
}

export { engineConfigSchema };
