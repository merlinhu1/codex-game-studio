import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { readStudioProject } from "./projects.js";
import { isStudioRoleId, rolePackages, type StudioRoleId } from "./roles.js";
import { templateRegistry } from "./templates.js";
import { workflowAliases, workflowIds, workflowRegistry, type WorkflowId } from "./workflows.js";

export type AgentContextKind = "studio" | "role" | "workflow" | "task" | "changed";

export type AgentContextRequest = {
  kind: AgentContextKind;
  id?: string;
  projectRoot?: string;
  cwd?: string;
};

type RankedMatch<T extends string> = { id: T; score: number; reason: string };

export type AgentContextSuggestions = {
  query: string;
  workflows: RankedMatch<WorkflowId>[];
  roles: RankedMatch<StudioRoleId>[];
  templates: RankedMatch<string>[];
  commands: string[];
};

function lines(...items: Array<string | undefined | false>): string {
  return items.filter((item): item is string => Boolean(item)).join("\n");
}

function bullet(values: readonly string[], limit = 6): string[] {
  const selected = values.slice(0, limit);
  const extra = values.length - selected.length;
  return [...selected.map((value) => `- ${value}`), ...(extra > 0 ? [`- +${extra} more; inspect the owning file only if needed.`] : [])];
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
}

function scoreText(queryTokens: Set<string>, text: string): number {
  const textTokens = tokenize(text);
  let score = 0;
  for (const token of queryTokens) if (textTokens.has(token)) score += 2;
  for (const token of queryTokens) if (text.toLowerCase().includes(token)) score += 1;
  return score;
}

function topRanked<T extends string>(items: Array<RankedMatch<T>>, limit: number): Array<RankedMatch<T>> {
  return items
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

function roleWorkflows(role: StudioRoleId): WorkflowId[] {
  return workflowIds().filter((id) => workflowRegistry[id].role === role);
}

function workflowTemplates(workflow: WorkflowId): string[] {
  return workflowRegistry[workflow].templateIds ?? [];
}

export function suggestAgentContext(query: string): AgentContextSuggestions {
  const queryTokens = tokenize(query);
  const workflows = topRanked(
    workflowIds().map((id) => {
      const workflow = workflowRegistry[id];
      const aliases = workflowAliases(workflow).join(" ");
      const score = scoreText(queryTokens, `${id} ${aliases} ${workflow.objective} ${workflow.category} ${workflow.gapCoverage.join(" ")}`);
      return { id, score, reason: `${workflow.phase}/${workflow.role}: ${workflow.objective}` };
    }),
    5
  );

  const workflowRoleBoost = new Map<StudioRoleId, number>();
  for (const [index, workflow] of workflows.entries()) {
    const role = workflowRegistry[workflow.id].role;
    workflowRoleBoost.set(role, (workflowRoleBoost.get(role) ?? 0) + Math.max(1, 6 - index));
  }

  const roles = topRanked(
    (Object.keys(rolePackages) as StudioRoleId[]).map((id) => {
      const role = rolePackages[id];
      const score = scoreText(queryTokens, `${id} ${role.displayName} ${role.responsibilities.join(" ")} ${role.expectedOutputs.join(" ")}`) + (workflowRoleBoost.get(id) ?? 0);
      return { id, score, reason: `${role.displayName}: ${role.expectedOutputs.slice(0, 3).join(", ")}` };
    }),
    5
  );

  const templates = topRanked(
    Object.values(templateRegistry).map((template) => {
      const score = scoreText(queryTokens, `${template.id} ${template.category} ${template.description} ${template.tags.join(" ")} ${template.workflows.join(" ")}`);
      return { id: template.id, score, reason: `${template.category}: ${template.description}` };
    }),
    5
  );

  const primaryWorkflowRole = workflows[0] ? workflowRegistry[workflows[0].id].role : undefined;
  const primaryRole = primaryWorkflowRole ?? roles[0]?.id;

  return {
    query,
    workflows,
    roles,
    templates,
    commands: [
      workflows[0] ? `npm run ctx:workflow -- ${workflows[0].id}` : undefined,
      primaryRole ? `npm run ctx:role -- ${primaryRole}` : undefined,
      "npm run ctx:changed"
    ].filter((command): command is string => Boolean(command))
  };
}

function renderSuggestions(query: string): string {
  const suggestions = suggestAgentContext(query);
  return lines(
    `# Agent Context Pack: task`,
    `Query: ${query}`,
    "",
    "## Suggested workflows",
    ...bullet(suggestions.workflows.map((item) => `${item.id} — ${item.reason}`), 5),
    "",
    "## Suggested roles",
    ...bullet(suggestions.roles.map((item) => `${item.id} — ${item.reason}`), 5),
    "",
    "## Suggested templates",
    ...bullet(suggestions.templates.map((item) => `${item.id} — ${item.reason}`), 5),
    "",
    "## Next low-token commands",
    ...bullet(suggestions.commands, 5)
  );
}

function renderRolePack(id: string): string {
  if (!isStudioRoleId(id)) throw new Error(`Unknown role: ${id}`);
  const role = rolePackages[id];
  const workflows = roleWorkflows(id);
  const templates = Object.values(templateRegistry).filter((template) => template.roles.includes(id));
  return lines(
    `# Agent Context Pack: role/${id}`,
    `Role: ${role.displayName}`,
    `Context strategy: ${role.contextStrategy}`,
    "",
    "## Compact responsibilities",
    ...bullet(role.responsibilities, 4),
    "",
    "## Inspect only when needed",
    ...bullet([`.codex/agents/${id}.toml`, ...role.inputsToInspect], 6),
    "",
    "## Expected output",
    ...bullet(role.expectedOutputs, 5),
    "",
    "## Quality gates",
    ...bullet(role.qualityGates, 5),
    "",
    "## Related workflows:",
    ...bullet(workflows.map((workflow) => `${workflow} — ${workflowRegistry[workflow].objective}`), 8),
    "",
    "## Related templates",
    ...bullet(templates.map((template) => `${template.id} — ${template.path}`), 8),
    "",
    "## Suggested agent command:",
    `- npm run ctx:role -- ${id}`,
    workflows[0] ? `- npm run ctx:workflow -- ${workflows[0]}` : undefined
  );
}

function renderWorkflowPack(id: string): string {
  const workflow = workflowRegistry[id as WorkflowId];
  if (!workflow) throw new Error(`Unknown workflow: ${id}`);
  const role = rolePackages[workflow.role];
  const aliases = workflowAliases(workflow);
  const templates = workflowTemplates(workflow.id);
  return lines(
    `# Agent Context Pack: workflow/${workflow.id}`,
    `Objective: ${workflow.objective}`,
    `Owner role: ${workflow.role}`,
    `Role name: ${role.displayName}`,
    `Phase: ${workflow.phase}`,
    `Category: ${workflow.category}`,
    "",
    "## Context files:",
    ...bullet(workflow.contextFiles, 8),
    "",
    "## Templates",
    ...(templates.length ? bullet(templates.map((template) => `${template} — ${(templateRegistry as Record<string, { path: string } | undefined>)[template]?.path ?? "custom/project template"}`), 8) : ["- none"]),
    "",
    "## CLI aliases",
    ...(aliases.length ? bullet(aliases, 8) : ["- none"]),
    "",
    "## Expected output",
    ...bullet(role.expectedOutputs, 5),
    "",
    "## Suggested agent command:",
    `- npm run ctx:workflow -- ${workflow.id}`,
    `- npm run ctx:role -- ${workflow.role}`
  );
}

function renderStudioPack(projectRoot: string): string {
  const studioPath = path.join(projectRoot, ".codex", "studio.json");
  if (!existsSync(studioPath)) {
    return lines(
      "# Agent Context Pack: studio",
      "Project state: repository template checkout; .codex/studio.json is not initialized here.",
      "",
      "## Low-token entry points",
      "- npm run ctx:task -- \"<task>\"",
      "- npm run ctx:workflow -- <workflow-id>",
      "- npm run ctx:role -- <role-id>",
      "- npm run ctx:changed"
    );
  }
  const studio = readStudioProject(projectRoot);
  return lines(
    "# Agent Context Pack: studio",
    `Project: ${studio.name}`,
    `Engine: ${studio.engine} ${studio.engineVersion}`,
    `Mode: ${studio.mode}`,
    `Studio mode: ${studio.studioMode}`,
    `Status: ${studio.status}`,
    `Current milestone: ${studio.currentMilestone}`,
    "",
    "## Active roles",
    ...bullet(studio.activeRoles, 10),
    "",
    "## Low-token entry points",
    "- npm run ctx:task -- \"<task>\"",
    "- npm run ctx:workflow -- <workflow-id>",
    "- npm run ctx:role -- <role-id>",
    "- npm run ctx:changed"
  );
}

function renderChangedPack(cwd: string): string {
  const output = execFileSync("git", ["status", "--short"], { cwd, encoding: "utf8" }).trim();
  const files = output ? output.split("\n").slice(0, 40) : [];
  return lines(
    "# Agent Context Pack: changed",
    files.length ? "Changed files:" : "Changed files: none",
    ...files.map((file) => `- ${file}`),
    files.length >= 40 ? "- +more; run git status --short for full list." : undefined,
    "",
    "## Suggested follow-up",
    "- Inspect only the changed files relevant to the task.",
    "- Run focused tests before broad validation."
  );
}

export function renderAgentContext(request: AgentContextRequest): string {
  const projectRoot = path.resolve(request.projectRoot ?? request.cwd ?? process.cwd());
  const cwd = path.resolve(request.cwd ?? projectRoot);
  if (request.kind === "studio") return renderStudioPack(projectRoot);
  if (request.kind === "role") return renderRolePack(request.id ?? "");
  if (request.kind === "workflow") return renderWorkflowPack(request.id ?? "");
  if (request.kind === "task") return renderSuggestions(request.id ?? "");
  if (request.kind === "changed") return renderChangedPack(cwd);
  throw new Error(`Unknown context kind: ${request.kind}`);
}
