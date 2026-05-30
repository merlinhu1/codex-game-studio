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
  | "project_config"
  | "game_feel_tuning"
  | "art_direction"
  | "ui_ux_review"
  | "production_milestone"
  | "playtest_report"
  | "ship_check";

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
  },
  game_feel_tuning: {
    id: "game_feel_tuning",
    category: "design",
    path: "templates/game_feel_tuning_template.md",
    roles: ["game-feel-designer", "qa-playtester"],
    tags: ["feel", "controls", "tuning"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  art_direction: {
    id: "art_direction",
    category: "art",
    path: "templates/art_direction_template.md",
    roles: ["senior-game-artist", "technical-artist", "creative-director"],
    tags: ["art", "visual", "style"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  ui_ux_review: {
    id: "ui_ux_review",
    category: "ui",
    path: "templates/ui_ux_review_template.md",
    roles: ["ui-ux-designer", "qa-playtester"],
    tags: ["ui", "ux", "usability"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  production_milestone: {
    id: "production_milestone",
    category: "production",
    path: "templates/production_milestone_template.md",
    roles: ["producer", "studio-orchestrator"],
    tags: ["milestone", "scope", "schedule"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  playtest_report: {
    id: "playtest_report",
    category: "qa",
    path: "templates/playtest_report_template.md",
    roles: ["qa-playtester"],
    tags: ["playtest", "qa", "report"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
  },
  ship_check: {
    id: "ship_check",
    category: "release",
    path: "templates/ship_check_template.md",
    roles: ["release-manager", "producer"],
    tags: ["ship", "release", "readiness"],
    requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
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

export function renderSelectedTemplates(templateIds: TemplateId[], heading = "## Selected Templates"): string {
  if (templateIds.length === 0) return "";
  return [
    "",
    heading,
    "",
    ...templateIds.flatMap((id) => {
      const info = templateRegistry[id];
      return [`### Template: ${id}`, `Source: package:${info.path}`, "", readTemplate(id).trim(), ""];
    })
  ].join("\n");
}

export function selectTemplates(agent: AgentName, task: string): TemplateId[] {
  const lower = task.toLowerCase();
  const selected = new Set<TemplateId>();
  if (agent === "market-analyst") selected.add("market_analysis");
  if (agent === "data-scientist") selected.add("analytics_setup");
  if (agent === "game-feel-designer") selected.add("game_feel_tuning");
  if (agent === "ui-ux-designer") selected.add("ui_ux_review");
  if (agent === "qa-playtester") selected.add("playtest_report");
  if (agent === "release-manager") selected.add("ship_check");
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
  if (agent === "qa-playtester" && /(ui|ux|hud|menu|onboarding|accessibility|usability)/.test(lower)) selected.add("ui_ux_review");
  if (agent === "qa-playtester" && /(feel|control|movement|timing|camera|pacing)/.test(lower)) selected.add("game_feel_tuning");
  if ((agent === "senior-game-artist" || agent === "technical-artist" || agent === "creative-director") && /(art|visual|style|asset|direction)/.test(lower)) {
    selected.add("art_direction");
  }
  if ((agent === "producer" || agent === "studio-orchestrator") && /(milestone|scope|schedule|production)/.test(lower)) selected.add("production_milestone");
  if ((agent === "producer" || agent === "release-manager") && /(release|ship|readiness|package|launch)/.test(lower)) selected.add("ship_check");
  return [...selected];
}
