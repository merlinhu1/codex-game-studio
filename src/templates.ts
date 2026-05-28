import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { packageAssetPath } from "./paths.js";
import type { AgentName } from "./config.js";

export type TemplateId =
  | "gdd"
  | "feature_spec"
  | "handoff"
  | "analytics_setup"
  | "engine_setup"
  | "market_analysis"
  | "project_config";

export type TemplateInfo = {
  id: TemplateId;
  category: string;
  path: string;
  roles: AgentName[];
  tags: string[];
  requiredSections: string[];
};

export const templateRegistry: Record<TemplateId, TemplateInfo> = {
  gdd: {
    id: "gdd",
    category: "design",
    path: "templates/gdd_template.md",
    roles: ["game-designer", "creative-director"],
    tags: ["design", "gdd"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  feature_spec: {
    id: "feature_spec",
    category: "design",
    path: "templates/feature_spec_template.md",
    roles: ["senior-game-designer", "game-designer", "gameplay-programmer"],
    tags: ["feature", "spec", "design"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  handoff: {
    id: "handoff",
    category: "coordination",
    path: "templates/handoff_template.md",
    roles: ["studio-orchestrator", "creative-director", "producer"],
    tags: ["handoff", "coordination"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  analytics_setup: {
    id: "analytics_setup",
    category: "analytics",
    path: "templates/analytics_setup_template.md",
    roles: ["data-scientist", "producer"],
    tags: ["analytics", "metrics"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  engine_setup: {
    id: "engine_setup",
    category: "engine",
    path: "templates/engine_setup_template.md",
    roles: ["gameplay-programmer", "engine-programmer", "technical-artist"],
    tags: ["engine", "setup"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  market_analysis: {
    id: "market_analysis",
    category: "market",
    path: "templates/market_analysis_template.md",
    roles: ["market-analyst", "producer"],
    tags: ["market", "competitors"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  project_config: {
    id: "project_config",
    category: "config",
    path: "templates/project_config_template.json",
    roles: ["producer", "creative-director"],
    tags: ["config", "setup"],
    requiredSections: []
  }
};

export function listTemplates(): TemplateInfo[] {
  return Object.values(templateRegistry);
}

export function readTemplate(id: TemplateId): string {
  const info = templateRegistry[id];
  if (!info) throw new Error(`Unknown template "${id}"`);
  return readFileSync(packageAssetPath(info.path), "utf8");
}

export function formatTemplateShow(id: TemplateId): string {
  const info = templateRegistry[id];
  if (!info) throw new Error(`Unknown template "${id}"`);
  return [
    `ID: ${info.id}`,
    `Category: ${info.category}`,
    `Path: ${info.path}`,
    `Roles: ${info.roles.join(", ")}`,
    `Tags: ${info.tags.join(", ")}`,
    "",
    readTemplate(id)
  ].join("\n");
}

export function templatePath(id: TemplateId): string {
  return packageAssetPath(templateRegistry[id].path);
}

function sectionHasContent(body: string, section: string): boolean {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escaped}\\s*$`, "m").exec(body);
  if (!match) return false;
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const nextHeading = rest.search(/^#/m);
  const content = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return content.trim().length > 0;
}

export function validateTemplateFiles(): string[] {
  const failures: string[] = [];
  for (const info of listTemplates()) {
    const fullPath = path.resolve(packageAssetPath(info.path));
    if (!existsSync(fullPath)) {
      failures.push(`Missing template ${info.id}: ${info.path}`);
      continue;
    }
    const body = readFileSync(fullPath, "utf8");
    for (const section of info.requiredSections) {
      if (!sectionHasContent(body, section)) failures.push(`Template ${info.id} missing non-empty ${section}`);
    }
    if (info.id === "project_config") JSON.parse(body);
  }
  return failures;
}

export function selectTemplates(agent: AgentName, task: string): TemplateId[] {
  const lower = task.toLowerCase();
  const selected = new Set<TemplateId>();
  if (/(handoff|coordination|coordinate)/.test(lower)) selected.add("handoff");
  if ((agent === "producer" || agent === "market-analyst") && /(market|competitor|audience)/.test(lower)) selected.add("market_analysis");
  if ((agent === "producer" || agent === "data-scientist") && /(analytics|metric|telemetry)/.test(lower)) selected.add("analytics_setup");
  if ((agent === "senior-game-designer" || agent === "game-designer" || agent === "gameplay-programmer") && /(design|spec|gdd|feature)/.test(lower)) {
    selected.add("gdd");
    selected.add("feature_spec");
  }
  if (/(engine|setup|project config|initialize|init)/.test(lower)) {
    selected.add("engine_setup");
    selected.add("project_config");
  }
  if (agent === "qa-playtester" && /(spec review|review spec)/.test(lower)) selected.add("feature_spec");
  return [...selected];
}
