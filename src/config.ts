import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { engineSpecialistRoleId, studioRoleIds, type RoleEngineId, type StudioRoleId } from "./roles.js";
import type { StudioMode } from "./studio-policy.js";

export const agentNames = studioRoleIds;

export const modeSchema = z.enum(["design", "prototype", "development"]);
export const studioModeSchema = z.enum(["fast-prototype", "guided-studio", "strict-studio"]);
export const agentNameSchema = z.enum(agentNames);
export type AgentName = StudioRoleId;
export type ProjectMode = z.infer<typeof modeSchema>;
export type ProjectStudioMode = StudioMode;

export const milestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  target: z.string().min(1),
  exit_criteria: z.array(z.string().min(1)).min(1),
  status: z.enum(["planned", "active", "complete", "blocked"]).default("planned")
});

export const projectConfigSchema = z.object({
  schema_version: z.literal("1.0"),
  project: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    concept: z.string().min(1),
    genre: z.string().min(1),
    platform: z.string().min(1),
    audience: z.string().min(1),
    competitors: z.array(z.string().min(1)),
    monetization: z.string().min(1),
    timeline: z.string().min(1),
    engine: z.enum(["godot", "unity", "unreal"]),
    engine_version: z.string().min(1),
    mode: modeSchema,
    studio_mode: studioModeSchema,
    phase: z.string().min(1),
    status: z.enum(["active", "frozen", "inactive"])
  }),
  team: z.object({
    active_agents: z.array(agentNameSchema).min(1)
  }),
  production: z.object({
    milestones: z.array(milestoneSchema).min(1)
  })
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) throw new Error(`Cannot create slug from "${value}"`);
  return slug;
}

export function activeAgentsForMode(mode: ProjectMode): AgentName[] {
  const always: AgentName[] = ["studio-orchestrator", "producer", "market-analyst", "data-scientist"];
  const byMode: Record<ProjectMode, AgentName[]> = {
    design: [
      "creative-director",
      "senior-game-designer",
      "game-designer",
      "narrative-designer",
      "writer",
      "world-builder",
      "level-designer",
      "systems-designer",
      "economy-designer",
      "audio-director",
      "senior-game-artist",
      "ui-ux-designer",
      "accessibility-specialist"
    ],
    prototype: [
      "senior-game-designer",
      "game-designer",
      "systems-designer",
      "level-designer",
      "game-feel-designer",
      "gameplay-programmer",
      "ui-programmer",
      "sound-designer",
      "qa-playtester",
      "accessibility-specialist"
    ],
    development: [
      "technical-director",
      "senior-game-designer",
      "game-designer",
      "game-feel-designer",
      "gameplay-programmer",
      "engine-programmer",
      "tools-programmer",
      "ai-programmer",
      "network-programmer",
      "ui-programmer",
      "devops-engineer",
      "security-engineer",
      "performance-analyst",
      "qa-playtester",
      "senior-game-artist",
      "technical-artist",
      "localization-lead",
      "live-ops-designer",
      "community-manager",
      "ui-ux-designer",
      "release-manager"
    ]
  };
  return [...always, ...byMode[mode]];
}

export function activeAgentsForProject(mode: ProjectMode, engine: RoleEngineId): AgentName[] {
  return [...activeAgentsForMode(mode), engineSpecialistRoleId(engine)];
}

function ordered(value: unknown, omitOperationalFields: boolean): unknown {
  if (Array.isArray(value)) return value.map((item) => ordered(item, omitOperationalFields));
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      if (omitOperationalFields && key === "status") continue;
      if (omitOperationalFields && /timestamp|run_state|validation/i.test(key)) continue;
      result[key] = ordered((value as Record<string, unknown>)[key], omitOperationalFields);
    }
    return result;
  }
  return value;
}

export function canonicalProjectConfigJson(
  config: ProjectConfig,
  options: { omitOperationalFields?: boolean } = {}
): string {
  return `${JSON.stringify(ordered(config, options.omitOperationalFields ?? false), null, 2)}\n`;
}

export function guidanceConfigHash(config: ProjectConfig): string {
  return createHash("sha256")
    .update(canonicalProjectConfigJson(config, { omitOperationalFields: true }))
    .digest("hex");
}

export function readProjectConfig(filePath: string): ProjectConfig {
  return projectConfigSchema.parse(JSON.parse(readFileSync(filePath, "utf8")));
}

export function writeProjectConfig(filePath: string, config: ProjectConfig): void {
  writeFileSync(filePath, canonicalProjectConfigJson(projectConfigSchema.parse(config)));
}
