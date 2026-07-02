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
  keywords?: string[];
  required: boolean;
};

export type EngineReferencePack = {
  engine: EngineReferenceId;
  packageRoot: string;
  projectRoot: string;
  requiredFiles: string[];
  moduleFiles: string[];
  pluginFiles: string[];
  specialistFiles: string[];
  promptReferences: EngineReferencePrompt[];
  validation: {
    requiredMetadata: ["reviewer", "date", "source-link", "engine", "version-reviewed", "tags", "roles", "workflows"];
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

const godotRoles: StudioRoleId[] = ["godot-specialist", "godot-gdscript-specialist", "godot-csharp-specialist", "godot-shader-specialist", "godot-gdextension-specialist"];
const unityRoles: StudioRoleId[] = ["unity-specialist", "unity-dots-specialist", "unity-shader-specialist", "unity-addressables-specialist", "unity-ui-specialist"];
const unrealRoles: StudioRoleId[] = ["unreal-specialist", "ue-gas-specialist", "ue-blueprint-specialist", "ue-replication-specialist", "ue-umg-specialist"];
const engineScopedRoles: Record<EngineReferenceId, StudioRoleId[]> = { godot: godotRoles, unity: unityRoles, unreal: unrealRoles };
const programmingRoles: StudioRoleId[] = ["gameplay-programmer", "engine-programmer", "tools-programmer", "technical-artist", ...godotRoles, ...unityRoles, ...unrealRoles];
const qaRoles: StudioRoleId[] = ["qa-playtester", "performance-analyst"];
const designRoles: StudioRoleId[] = ["game-designer", "senior-game-designer", "game-feel-designer", "systems-designer", "level-designer"];
const artRoles: StudioRoleId[] = ["senior-game-artist", "technical-artist", "ui-ux-designer"];
const audioRoles: StudioRoleId[] = ["audio-director", "sound-designer"];

const moduleFiles = [
  "modules/animation.md",
  "modules/audio.md",
  "modules/input.md",
  "modules/navigation.md",
  "modules/networking.md",
  "modules/physics.md",
  "modules/rendering.md",
  "modules/ui.md"
];

const moduleReferences: EngineReferencePrompt[] = [
  { path: "modules/animation.md", reason: "animation systems, state machines, blend trees, and timing guidance", roles: [...programmingRoles, ...artRoles, ...designRoles], keywords: ["animation", "animator", "blend", "state machine", "montage", "timeline", "skeletal"], required: false },
  { path: "modules/audio.md", reason: "audio routing, sound effects, music, and mix guidance", roles: [...programmingRoles, ...audioRoles], keywords: ["audio", "sound", "sfx", "music", "mix", "voice", "subtitle"], required: false },
  { path: "modules/input.md", reason: "input actions, remapping, devices, and accessibility guidance", roles: [...programmingRoles, ...designRoles, "accessibility-specialist"], keywords: ["input", "control", "controls", "gamepad", "keyboard", "remap", "binding", "accessibility"], required: false },
  { path: "modules/navigation.md", reason: "AI navigation, navmesh, pathfinding, and movement-agent guidance", roles: [...programmingRoles, "ai-programmer", "level-designer"], keywords: ["navigation", "navmesh", "pathfinding", "ai", "agent", "steering"], required: false },
  { path: "modules/networking.md", reason: "multiplayer, replication, rollback, synchronization, and authority guidance", roles: [...programmingRoles, "network-programmer", ...qaRoles], keywords: ["network", "networking", "multiplayer", "replication", "rollback", "netcode", "sync", "authority", "server", "client"], required: false },
  { path: "modules/physics.md", reason: "physics bodies, collision, queries, and deterministic simulation guidance", roles: [...programmingRoles, "game-feel-designer", ...qaRoles], keywords: ["physics", "collision", "rigidbody", "raycast", "query", "deterministic", "simulation"], required: false },
  { path: "modules/rendering.md", reason: "rendering pipeline, materials, lighting, post-processing, and performance guidance", roles: [...programmingRoles, ...artRoles, "performance-analyst"], keywords: ["render", "rendering", "material", "shader", "lighting", "post-processing", "postprocess", "gpu", "performance"], required: false },
  { path: "modules/ui.md", reason: "UI layout, HUD, menus, focus, and accessibility guidance", roles: [...programmingRoles, "ui-programmer", "ui-ux-designer", "accessibility-specialist"], keywords: ["ui", "ux", "hud", "menu", "menus", "widget", "interface", "focus", "screen"], required: false }
];

const pluginReferences: Record<EngineReferenceId, EngineReferencePrompt[]> = {
  godot: [
    { path: "plugins.md", reason: "Godot addons, asset library, and GDExtension guidance", roles: ["tools-programmer", "engine-programmer", "godot-specialist", "godot-gdextension-specialist"], keywords: ["plugin", "addon", "gdextension", "asset library", "tool script", "native", "binding"], required: false }
  ],
  unity: [
    { path: "plugins.md", reason: "Unity package manager and verified package guidance", roles: ["tools-programmer", "engine-programmer", "unity-specialist", "unity-addressables-specialist", "unity-dots-specialist"], keywords: ["plugin", "package", "upm", "manifest"], required: false },
    { path: "plugins/addressables.md", reason: "Unity Addressables asset loading and content update guidance", roles: ["tools-programmer", "engine-programmer", "technical-artist", "unity-specialist", "unity-addressables-specialist"], keywords: ["addressables", "assetbundle", "asset bundle", "content update", "remote content", "asset loading", "memory"], required: false },
    { path: "plugins/cinemachine.md", reason: "Unity Cinemachine camera and follow-target guidance", roles: ["gameplay-programmer", "technical-artist", "game-feel-designer", "unity-specialist"], keywords: ["cinemachine", "camera", "follow", "look at", "confiner", "dolly"], required: false },
    { path: "plugins/dots.md", reason: "Unity DOTS, ECS, Burst, and Jobs guidance", roles: ["engine-programmer", "performance-analyst", "unity-specialist", "unity-dots-specialist"], keywords: ["dots", "ecs", "entities", "burst", "jobs", "job system", "data-oriented"], required: false }
  ],
  unreal: [
    { path: "plugins.md", reason: "Unreal plugin, module, and marketplace guidance", roles: ["tools-programmer", "engine-programmer", "unreal-specialist", "ue-blueprint-specialist"], keywords: ["plugin", "module", "marketplace"], required: false },
    { path: "plugins/gas.md", reason: "Unreal Gameplay Ability System guidance", roles: ["gameplay-programmer", "systems-designer", "network-programmer", "unreal-specialist", "ue-gas-specialist"], keywords: ["gas", "gameplay ability", "ability system", "attribute", "effect", "tag", "prediction"], required: false },
    { path: "plugins/common-ui.md", reason: "Unreal Common UI input routing and screen stack guidance", roles: ["ui-programmer", "ui-ux-designer", "accessibility-specialist", "unreal-specialist", "ue-umg-specialist"], keywords: ["common ui", "commonui", "widget", "input routing", "screen stack", "ui", "umg"], required: false },
    { path: "plugins/pcg.md", reason: "Unreal PCG procedural content guidance", roles: ["level-designer", "technical-artist", "tools-programmer", "unreal-specialist"], keywords: ["pcg", "procedural", "generation", "scatter", "graph"], required: false }
  ]
};

const requiredMetadata = ["reviewer", "date", "source-link", "engine", "version-reviewed", "tags", "roles", "workflows"] as EngineReferencePack["validation"]["requiredMetadata"];

function pack(engine: EngineReferenceId): EngineReferencePack {
  const packageRoot = `engine_reference/${engine}`;
  const projectRoot = `docs/engine-reference/${engine}`;
  const requiredFiles = ["VERSION.md", "current-best-practices.md", "deprecated-apis.md", "breaking-changes.md", "gameplay.md", "specialist.md"];
  const pluginFiles = pluginReferences[engine].map((reference) => reference.path);
  const allReferenceFiles = [...new Set([...requiredFiles, ...moduleFiles, ...pluginFiles])];
  return {
    engine,
    packageRoot,
    projectRoot,
    requiredFiles,
    moduleFiles,
    pluginFiles,
    specialistFiles: ["specialist.md"],
    promptReferences: [
      { path: "VERSION.md", reason: `${engine} version applicability and official links`, required: true },
      { path: "current-best-practices.md", reason: `${engine} current best practices and default guardrails`, required: true },
      { path: "gameplay.md", reason: `${engine} gameplay implementation reference`, roles: programmingRoles, required: false },
      { path: "deprecated-apis.md", reason: `${engine} deprecated API avoidance guidance`, roles: [...programmingRoles, ...qaRoles], keywords: ["deprecated", "deprecation", "obsolete", "upgrade", "migration"], required: false },
      { path: "breaking-changes.md", reason: `${engine} breaking-change and migration guidance`, roles: [...programmingRoles, ...qaRoles], keywords: ["breaking", "migration", "upgrade", "version", "compatibility"], required: false },
      { path: "specialist.md", reason: `${engine} specialist role reference`, roles: engineScopedRoles[engine], required: false },
      ...moduleReferences,
      ...pluginReferences[engine]
    ],
    validation: { requiredMetadata },
    packageSmokeFiles: allReferenceFiles,
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

function keywordMatches(task: string | undefined, keywords: string[] | undefined): boolean {
  if (!task || !keywords?.length) return false;
  const normalized = task.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function selectedEngineReferencePrompts(engine: EngineReferenceId, role: StudioRoleId, task?: string): EngineReferencePrompt[] {
  return engineReferenceRegistry[engine].promptReferences.filter((reference) => {
    if (reference.required) return true;
    const roleMatches = !reference.roles || reference.roles.includes(role);
    if (!roleMatches) return false;
    if (reference.keywords?.length) return keywordMatches(task, reference.keywords);
    return true;
  });
}

export function engineReferenceContextRequests(engine: EngineReferenceId, role: StudioRoleId, task?: string): { sourcePath: string; reason: string; required?: boolean }[] {
  return selectedEngineReferencePrompts(engine, role, task).map((reference) => ({
    sourcePath: engineReferenceProjectPath(engine, reference.path),
    reason: reference.reason,
    required: reference.required
  }));
}

export function defaultEngineReferenceContextRequests(studio: StudioProjectState): { sourcePath: string; reason: string; required?: boolean }[] {
  return engineReferenceContextRequests(studio.engine, "gameplay-programmer");
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

function allPackFiles(pack: EngineReferencePack): string[] {
  return [...new Set([...pack.requiredFiles, ...pack.moduleFiles, ...pack.pluginFiles, ...pack.specialistFiles])];
}

export function validateEngineReferencePacks(packageRoot: string): EngineReferenceCheck[] {
  const checks: EngineReferenceCheck[] = [];
  for (const pack of Object.values(engineReferenceRegistry)) {
    for (const file of allPackFiles(pack)) {
      const full = engineReferencePackagePath(packageRoot, pack.engine, file);
      if (!existsSync(full)) {
        checks.push(fail(`engine_reference.${pack.engine}.${file}.exists`, `${pack.engine} ${file} missing`, full));
        continue;
      }
      checks.push(pass(`engine_reference.${pack.engine}.${file}.exists`, `${pack.engine} ${file} exists`, full));
      const metadata = readEngineReferenceMetadata(readFileSync(full, "utf8"));
      const hasBaseMetadata =
        typeof metadata.reviewer === "string" &&
        metadata.reviewer.trim().length > 0 &&
        /^\d{4}-\d{2}-\d{2}$/.test(metadata.date ?? "") &&
        /^https:\/\/.+/.test(metadata["source-link"] ?? "");
      const hasReferenceMetadata =
        metadata.engine === pack.engine &&
        typeof metadata["version-reviewed"] === "string" &&
        metadata["version-reviewed"].trim().length > 0 &&
        typeof metadata.tags === "string" &&
        metadata.tags.trim().length > 0 &&
        typeof metadata.roles === "string" &&
        metadata.roles.trim().length > 0 &&
        typeof metadata.workflows === "string" &&
        metadata.workflows.trim().length > 0;
      checks.push(
        hasBaseMetadata && hasReferenceMetadata
          ? pass(`engine_reference.${pack.engine}.${file}.metadata`, `${pack.engine} ${file} seed review metadata present`, full)
          : fail(`engine_reference.${pack.engine}.${file}.metadata`, `${pack.engine} ${file} must include reviewer/date/source-link/engine/version-reviewed/tags/roles/workflows metadata`, full)
      );
    }
  }
  return checks;
}

export function materializeEngineReferences(projectRoot: string, packageRoot: string, engine: EngineReferenceId): string[] {
  const pack = engineReferenceRegistry[engine];
  const written: string[] = [];
  for (const file of allPackFiles(pack)) {
    const source = engineReferencePackagePath(packageRoot, engine, file);
    const destination = path.join(projectRoot, pack.projectPath(file));
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
    written.push(destination);
  }
  return written;
}
