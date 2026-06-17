import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ProjectConfig } from "./config.js";
import type { StudioProjectState } from "./projects.js";
import type { StudioRoleId } from "./roles.js";

export type EngineReferenceId = ProjectConfig["project"]["engine"];

export type EngineReferencePrompt = {
  path: string;
  reason: string;
  roles?: StudioRoleId[];
  required: boolean;
};

export type EngineReferencePack = {
  engine: EngineReferenceId;
  packageRoot: string;
  projectRoot: string;
  requiredFiles: string[];
  pluginFiles: string[];
  specialistFiles: string[];
  promptReferences: EngineReferencePrompt[];
  validation: {
    requiredMetadata: ["reviewer", "date", "source-link"];
  };
  packageSmokeFiles: string[];
  projectPath(file: string): string;
};

export type EngineReferenceCheck = {
  id: string;
  status: "pass" | "fail";
  message: string;
  path?: string;
};

const programmingRoles: StudioRoleId[] = ["gameplay-programmer", "engine-programmer", "tools-programmer", "technical-artist"];

function pack(engine: EngineReferenceId): EngineReferencePack {
  const packageRoot = `engine_reference/${engine}`;
  const projectRoot = `docs/engine-reference/${engine}`;
  return {
    engine,
    packageRoot,
    projectRoot,
    requiredFiles: ["VERSION.md", "gameplay.md", "specialist.md"],
    pluginFiles: ["plugins.md"],
    specialistFiles: ["specialist.md"],
    promptReferences: [
      { path: "VERSION.md", reason: `${engine} version applicability and official links`, required: true },
      { path: "gameplay.md", reason: `${engine} gameplay implementation reference`, roles: programmingRoles, required: false },
      { path: "plugins.md", reason: `${engine} plugin and package guidance`, roles: ["tools-programmer", "engine-programmer"], required: false },
      { path: "specialist.md", reason: `${engine} specialist role reference`, roles: [`${engine}-specialist` as StudioRoleId], required: false }
    ],
    validation: { requiredMetadata: ["reviewer", "date", "source-link"] },
    packageSmokeFiles: ["VERSION.md", "gameplay.md"],
    projectPath(file: string): string {
      return `${projectRoot}/${file}`;
    }
  };
}

export const engineReferenceRegistry: Record<EngineReferenceId, EngineReferencePack> = {
  godot: pack("godot"),
  unity: pack("unity"),
  unreal: pack("unreal")
};

export function engineReferencePackagePath(packageRoot: string, engine: EngineReferenceId, file: string): string {
  return path.join(packageRoot, engineReferenceRegistry[engine].packageRoot, file);
}

export function engineReferenceProjectPath(engine: EngineReferenceId, file: string): string {
  return engineReferenceRegistry[engine].projectPath(file);
}

export function selectedEngineReferencePrompts(engine: EngineReferenceId, role: StudioRoleId): EngineReferencePrompt[] {
  return engineReferenceRegistry[engine].promptReferences.filter((reference) => reference.required || !reference.roles || reference.roles.includes(role));
}

export function defaultEngineReferenceContextRequests(studio: StudioProjectState): { sourcePath: string; reason: string; required?: boolean }[] {
  return selectedEngineReferencePrompts(studio.engine, "gameplay-programmer").map((reference) => ({
    sourcePath: engineReferenceProjectPath(studio.engine, reference.path),
    reason: reference.reason,
    required: reference.required
  }));
}

function pass(id: string, message: string, file?: string): EngineReferenceCheck {
  return { id, status: "pass", message, path: file };
}

function fail(id: string, message: string, file?: string): EngineReferenceCheck {
  return { id, status: "fail", message, path: file };
}

export function readEngineReferenceMetadata(body: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  for (const line of body.split(/\r?\n/)) {
    const match = /^([a-z][a-z-]+):\s*(.+)$/.exec(line.trim());
    if (!match) continue;
    metadata[match[1]] = match[2];
  }
  return metadata;
}

export function validateEngineReferencePacks(packageRoot: string): EngineReferenceCheck[] {
  const checks: EngineReferenceCheck[] = [];
  for (const pack of Object.values(engineReferenceRegistry)) {
    for (const file of [...new Set([...pack.requiredFiles, ...pack.pluginFiles, ...pack.specialistFiles])]) {
      const full = engineReferencePackagePath(packageRoot, pack.engine, file);
      if (!existsSync(full)) {
        checks.push(fail(`engine_reference.${pack.engine}.${file}.exists`, `${pack.engine} ${file} missing`, full));
        continue;
      }
      checks.push(pass(`engine_reference.${pack.engine}.${file}.exists`, `${pack.engine} ${file} exists`, full));
      const metadata = readEngineReferenceMetadata(readFileSync(full, "utf8"));
      const metadataOk =
        typeof metadata.reviewer === "string" &&
        metadata.reviewer.trim().length > 0 &&
        /^\d{4}-\d{2}-\d{2}$/.test(metadata.date ?? "") &&
        /^https:\/\/.+/.test(metadata["source-link"] ?? "");
      checks.push(
        metadataOk
          ? pass(`engine_reference.${pack.engine}.${file}.metadata`, `${pack.engine} ${file} seed review metadata present`, full)
          : fail(`engine_reference.${pack.engine}.${file}.metadata`, `${pack.engine} ${file} must include reviewer/date/source-link metadata`, full)
      );
    }
  }
  return checks;
}

export function materializeEngineReferences(projectRoot: string, packageRoot: string, engine: EngineReferenceId): string[] {
  const pack = engineReferenceRegistry[engine];
  const files = [...new Set([...pack.requiredFiles, ...pack.pluginFiles, ...pack.specialistFiles])];
  const written: string[] = [];
  for (const file of files) {
    const source = engineReferencePackagePath(packageRoot, engine, file);
    const destination = path.join(projectRoot, pack.projectPath(file));
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
    written.push(destination);
  }
  return written;
}
