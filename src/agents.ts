import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { agentNames, guidanceConfigHash, type AgentName, type ProjectConfig } from "./config.js";
import type { EngineConfigRegistry } from "./engines.js";
import { packageAssetPath } from "./paths.js";

export type MaterializeAgentsInput = {
  projectRoot: string;
  config: ProjectConfig;
  engines: EngineConfigRegistry;
};

export function validateBaseAgents(): string[] {
  return agentNames.flatMap((agent) => {
    const file = packageAssetPath(`agents/base/${agent}.md`);
    if (!existsSync(file)) return [`Missing base agent ${agent}`];
    const body = readFileSync(file, "utf8");
    return ["# Role", "# Inputs", "# Outputs", "# Validation", "# Engine Notes", "# Rules"].filter((section) => !sectionHasContent(body, section)).map((section) => `${agent} missing non-empty ${section}`);
  });
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

export function readAgentPrompt(agent: AgentName, projectRoot?: string): string {
  const projectPrompt = projectRoot ? path.join(projectRoot, ".gamestudio", "agents", `${agent}.md`) : "";
  if (projectPrompt && existsSync(projectPrompt)) return readFileSync(projectPrompt, "utf8");
  return readFileSync(packageAssetPath(`agents/base/${agent}.md`), "utf8");
}

export function generateProjectAgentsMd(config: ProjectConfig): string {
  const hash = guidanceConfigHash(config);
  return `<!-- generated-by: open-gamestudio src/agents.ts schema=1.0 -->
<!-- source-config-sha256: ${hash} -->
# ${config.project.name} Agents

Project: ${config.project.name}
Slug: ${config.project.slug}
Engine: ${config.project.engine}
Mode: ${config.project.mode}

# Validation

Run \`npm run validate -- --project projects/${config.project.slug}\`.

# Agent Prompts

${config.team.active_agents.map((agent) => `- ${agent}: .gamestudio/agents/${agent}.md`).join("\n")}

# Rules

Use bounded context. Load the current role prompt, project config, engine overlay, and task-relevant templates only.
Do not use direct Codex execution, telemetry, planner/next, parallel orchestration, or ownership enforcement in this first build.
`;
}

export function materializeAgents(input: MaterializeAgentsInput): string[] {
  const config = input.config;
  const engine = input.engines[config.project.engine];
  const target = path.join(input.projectRoot, ".gamestudio", "agents");
  mkdirSync(target, { recursive: true });
  const written: string[] = [];
  for (const agent of config.team.active_agents) {
    const base = readFileSync(packageAssetPath(`agents/base/${agent}.md`), "utf8");
    const body = `${base}

# Project Context

- Name: ${config.project.name}
- Concept: ${config.project.concept}
- Audience: ${config.project.audience}
- Engine: ${engine.display_name} ${config.project.engine_version}
- Mode: ${config.project.mode}

# Engine Overlay

${Object.values(engine.agent_specializations).join("\n")}
`;
    const file = path.join(target, `${agent}.md`);
    writeFileSync(file, body);
    written.push(file);
  }
  const agentsMd = path.join(input.projectRoot, "AGENTS.md");
  writeFileSync(agentsMd, generateProjectAgentsMd(config));
  written.push(agentsMd);
  return written;
}
