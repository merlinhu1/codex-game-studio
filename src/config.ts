import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

export const agentNames = [
  "master_orchestrator",
  "producer_agent",
  "market_analyst",
  "data_scientist",
  "sr_game_designer",
  "mid_game_designer",
  "mechanics_developer",
  "game_feel_developer",
  "sr_game_artist",
  "technical_artist",
  "ui_ux_agent",
  "qa_agent"
] as const;

export const modeSchema = z.enum(["design", "prototype", "development"]);
export const agentNameSchema = z.enum(agentNames);
export type AgentName = z.infer<typeof agentNameSchema>;
export type ProjectMode = z.infer<typeof modeSchema>;

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
  const always: AgentName[] = ["master_orchestrator", "producer_agent", "market_analyst", "data_scientist"];
  const byMode: Record<ProjectMode, AgentName[]> = {
    design: ["sr_game_designer", "mid_game_designer", "sr_game_artist"],
    prototype: ["sr_game_designer", "mechanics_developer", "qa_agent"],
    development: [
      "sr_game_designer",
      "mid_game_designer",
      "mechanics_developer",
      "game_feel_developer",
      "qa_agent",
      "sr_game_artist",
      "technical_artist",
      "ui_ux_agent"
    ]
  };
  return [...always, ...byMode[mode]];
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
