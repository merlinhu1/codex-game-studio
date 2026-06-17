import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { studioRoleIds, type StudioRoleId } from "./roles.js";
import type { CodexStudioPhase } from "./codex-session.js";

const customIdSchema = z.string().regex(/^custom-[a-z0-9][a-z0-9-]*$/, "custom ids must start with custom- and use lowercase letters, numbers, and hyphens");
const relativePathSchema = z.string().min(1);

export const customRoleSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  promptFile: relativePathSchema,
  contextStrategy: z.enum(["minimal", "focused", "broad"]),
  phase: z.enum(["plan", "implement", "review", "ship"]).default("plan"),
  expectedOutputs: z.array(z.string().min(1)).min(1),
  reviewChecklist: z.array(z.string().min(1)).min(1),
  contextFiles: z.array(relativePathSchema).default([])
});

export const customTemplateSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  path: relativePathSchema,
  description: z.string().min(1),
  roles: z.array(z.string().min(1)).min(1),
  workflows: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).default([]),
  requiredSections: z.array(z.string().min(1)).default([])
});

export const customWorkflowSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  phase: z.enum(["plan", "implement", "review", "ship"]),
  objective: z.string().min(1),
  file: relativePathSchema,
  contextFiles: z.array(relativePathSchema).default([]),
  templateIds: z.array(z.string().min(1)).default([]),
  aliases: z.array(z.string().min(1)).default([])
});

export const projectCustomizationSchema = z.object({
  schemaVersion: z.literal(1),
  policy: z.object({ merge: z.literal("extend-only") }).default({ merge: "extend-only" }),
  roles: z.array(customRoleSchema).default([]),
  workflows: z.array(customWorkflowSchema).default([]),
  templates: z.array(customTemplateSchema).default([])
});

export type CustomRoleDefinition = z.infer<typeof customRoleSchema>;
export type CustomWorkflowDefinition = z.infer<typeof customWorkflowSchema>;
export type CustomTemplateDefinition = z.infer<typeof customTemplateSchema> & { custom: true };
export type ProjectCustomization = z.infer<typeof projectCustomizationSchema>;

export type CustomizationDiagnostic = {
  id: string;
  status: "pass" | "fail";
  message: string;
  path?: string;
};

export function customizationConfigPath(projectRoot: string): string {
  return path.join(projectRoot, ".codex", "studio", "config.json");
}

export function defaultProjectCustomization(): ProjectCustomization {
  return { schemaVersion: 1, policy: { merge: "extend-only" }, roles: [], workflows: [], templates: [] };
}

export function writeDefaultProjectCustomization(projectRoot: string): void {
  const configPath = customizationConfigPath(projectRoot);
  mkdirSync(path.dirname(configPath), { recursive: true });
  if (!existsSync(configPath)) writeFileSync(configPath, `${JSON.stringify(defaultProjectCustomization(), null, 2)}\n`);
}

function parseCustomizationFile(projectRoot: string): { ok: true; value: ProjectCustomization } | { ok: false; error: string; file: string } {
  const file = customizationConfigPath(projectRoot);
  if (!existsSync(file)) return { ok: true, value: defaultProjectCustomization() };
  try {
    return { ok: true, value: projectCustomizationSchema.parse(JSON.parse(readFileSync(file, "utf8"))) };
  } catch (error) {
    return { ok: false, error: (error as Error).message, file };
  }
}

export function readProjectCustomization(projectRoot: string): ProjectCustomization {
  const parsed = parseCustomizationFile(projectRoot);
  if (!parsed.ok) throw new Error(`Invalid Open Game Studio customization config: ${parsed.error}`);
  return parsed.value;
}

function hasDuplicate(values: string[]): string | undefined {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }
  return undefined;
}

export function projectRelativePath(projectRoot: string, relativePath: string): { ok: true; full: string; display: string } | { ok: false; error: string } {
  if (/[\u0000-\u001f\u007f]/.test(relativePath)) return { ok: false, error: "path contains control characters" };
  if (path.isAbsolute(relativePath)) return { ok: false, error: "path must be relative to the project root" };
  const normalized = path.normalize(relativePath).split(path.sep).join("/");
  if (normalized === "." || normalized.startsWith("../") || normalized === "..") return { ok: false, error: "path cannot escape the project root" };
  if (normalized.startsWith(".git/") || normalized === ".git") return { ok: false, error: "path cannot target .git" };
  const full = path.resolve(projectRoot, normalized);
  const root = path.resolve(projectRoot);
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) return { ok: false, error: "path cannot escape the project root" };
  return { ok: true, full, display: normalized };
}

function sectionHasContent(body: string, section: string): boolean {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escaped}\\s*$`, "m").exec(body);
  if (!match) return false;
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const nextHeading = rest.search(/^#/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim().length > 0;
}

export function validateProjectCustomization(
  projectRoot: string,
  options: { builtInWorkflowIds?: string[]; builtInTemplateIds?: string[] } = {}
): CustomizationDiagnostic[] {
  const file = customizationConfigPath(projectRoot);
  const parsed = parseCustomizationFile(projectRoot);
  if (!parsed.ok) return [{ id: "codex.customization.config", status: "fail", message: `customization config invalid: ${parsed.error}`, path: parsed.file }];
  const config = parsed.value;
  const diagnostics: CustomizationDiagnostic[] = [
    { id: "codex.customization.config", status: "pass", message: "customization config schema-readable", path: file }
  ];
  const builtInRoles = new Set<string>(studioRoleIds);
  const builtInWorkflows = new Set(options.builtInWorkflowIds ?? []);
  const builtInTemplates = new Set(options.builtInTemplateIds ?? []);
  const roleIds = config.roles.map((role) => role.id);
  const workflowIds = config.workflows.map((workflow) => workflow.id);
  const templateIds = config.templates.map((template) => template.id);
  for (const [kind, duplicate] of [
    ["role", hasDuplicate(roleIds)],
    ["workflow", hasDuplicate(workflowIds)],
    ["template", hasDuplicate(templateIds)]
  ] as const) {
    if (duplicate) diagnostics.push({ id: `codex.customization.${kind}.${duplicate}`, status: "fail", message: `duplicate custom ${kind} id ${duplicate}`, path: file });
  }

  const customRoleIds = new Set(roleIds);
  const customWorkflowIds = new Set(workflowIds);
  const customTemplateIds = new Set(templateIds);

  for (const role of config.roles) {
    const problems: string[] = [];
    if (!customIdSchema.safeParse(role.id).success) problems.push("role id must start with custom- and use lowercase letters, numbers, and hyphens");
    if (builtInRoles.has(role.id)) problems.push("role id conflicts with a built-in role; extend-only packs cannot override built-ins");
    const prompt = projectRelativePath(projectRoot, role.promptFile);
    if (!prompt.ok) problems.push(`promptFile ${prompt.error}`);
    else if (!existsSync(prompt.full)) problems.push(`promptFile missing: ${prompt.display}`);
    for (const contextFile of role.contextFiles) {
      const context = projectRelativePath(projectRoot, contextFile);
      if (!context.ok) problems.push(`context file ${contextFile}: ${context.error}`);
    }
    diagnostics.push({ id: `codex.customization.role.${role.id}`, status: problems.length ? "fail" : "pass", message: problems.length ? problems.join("; ") : `${role.id} custom role is valid`, path: problems.length ? file : prompt.ok ? prompt.full : file });
  }

  for (const template of config.templates) {
    const problems: string[] = [];
    if (!customIdSchema.safeParse(template.id).success) problems.push("template id must start with custom- and use lowercase letters, numbers, and hyphens");
    if (builtInTemplates.has(template.id)) problems.push("template id conflicts with a built-in template; extend-only packs cannot override built-ins");
    const templatePath = projectRelativePath(projectRoot, template.path);
    if (!templatePath.ok) problems.push(`template path ${templatePath.error}`);
    else if (!existsSync(templatePath.full)) problems.push(`template file missing: ${templatePath.display}`);
    if (templatePath.ok && existsSync(templatePath.full)) {
      const body = readFileSync(templatePath.full, "utf8");
      for (const section of template.requiredSections) {
        if (!sectionHasContent(body, section)) problems.push(`template missing non-empty ${section}`);
      }
    }
    for (const role of template.roles) {
      if (!builtInRoles.has(role) && !customRoleIds.has(role)) problems.push(`template references unknown role ${role}`);
    }
    for (const workflow of template.workflows) {
      if (!builtInWorkflows.has(workflow) && !customWorkflowIds.has(workflow)) problems.push(`template references unknown workflow ${workflow}`);
    }
    diagnostics.push({ id: `codex.customization.template.${template.id}`, status: problems.length ? "fail" : "pass", message: problems.length ? problems.join("; ") : `${template.id} custom template is valid`, path: templatePath.ok ? templatePath.full : file });
  }

  for (const workflow of config.workflows) {
    const problems: string[] = [];
    if (!customIdSchema.safeParse(workflow.id).success) problems.push("workflow id must start with custom- and use lowercase letters, numbers, and hyphens");
    if (builtInWorkflows.has(workflow.id)) problems.push("workflow id conflicts with a built-in workflow; extend-only packs cannot override built-ins");
    if (!builtInRoles.has(workflow.role) && !customRoleIds.has(workflow.role)) problems.push(`workflow references unknown role ${workflow.role}`);
    const workflowPath = projectRelativePath(projectRoot, workflow.file);
    if (!workflowPath.ok) problems.push(`workflow file ${workflowPath.error}`);
    for (const contextFile of workflow.contextFiles) {
      const context = projectRelativePath(projectRoot, contextFile);
      if (!context.ok) problems.push(`context file ${contextFile}: ${context.error}`);
    }
    for (const templateId of workflow.templateIds) {
      if (!builtInTemplates.has(templateId) && !customTemplateIds.has(templateId)) problems.push(`workflow references unknown template ${templateId}`);
    }
    diagnostics.push({ id: `codex.customization.workflow.${workflow.id}`, status: problems.length ? "fail" : "pass", message: problems.length ? problems.join("; ") : `${workflow.id} custom workflow is valid`, path: workflowPath.ok ? workflowPath.full : file });
  }

  return diagnostics;
}

export function customizationIsValid(projectRoot: string, options: { builtInWorkflowIds?: string[]; builtInTemplateIds?: string[] } = {}): boolean {
  return validateProjectCustomization(projectRoot, options).every((diagnostic) => diagnostic.status === "pass");
}

export function findCustomRole(projectRoot: string, roleId: string): CustomRoleDefinition | undefined {
  const config = readProjectCustomization(projectRoot);
  return config.roles.find((role) => role.id === roleId);
}

export function findCustomWorkflow(projectRoot: string, workflowId: string): CustomWorkflowDefinition | undefined {
  const config = readProjectCustomization(projectRoot);
  return config.workflows.find((workflow) => workflow.id === workflowId || workflow.aliases.includes(workflowId));
}

export function findCustomTemplate(projectRoot: string, templateId: string): CustomTemplateDefinition | undefined {
  const config = readProjectCustomization(projectRoot);
  const template = config.templates.find((candidate) => candidate.id === templateId);
  return template ? { ...template, custom: true } : undefined;
}

export function listCustomTemplates(projectRoot: string): CustomTemplateDefinition[] {
  return readProjectCustomization(projectRoot).templates.map((template) => ({ ...template, custom: true }));
}

export function readCustomTemplate(projectRoot: string, templateId: string): string {
  const template = findCustomTemplate(projectRoot, templateId);
  if (!template) throw new Error(`Unknown custom template "${templateId}"`);
  const safe = projectRelativePath(projectRoot, template.path);
  if (!safe.ok) throw new Error(`Unsafe custom template path for ${templateId}: ${safe.error}`);
  return readFileSync(safe.full, "utf8");
}

export function customTemplateIdsForRole(projectRoot: string, roleId: string, task: string): string[] {
  const lower = task.toLowerCase();
  return listCustomTemplates(projectRoot)
    .filter((template) => template.roles.includes(roleId) || template.tags.some((tag) => lower.includes(tag.toLowerCase())))
    .map((template) => template.id);
}

export function renderCustomRolePrompt(projectRoot: string, role: CustomRoleDefinition): string {
  const promptPath = projectRelativePath(projectRoot, role.promptFile);
  const prompt = promptPath.ok && existsSync(promptPath.full) ? readFileSync(promptPath.full, "utf8").trim() : "Custom prompt file missing.";
  return [
    `# Project Custom Role Prompt: ${role.promptFile}`,
    "",
    `Role: ${role.displayName}`,
    `Role ID: ${role.id}`,
    `Context Strategy: ${role.contextStrategy}`,
    "",
    "## Role Instructions",
    "",
    prompt,
    "",
    "## Expected Outputs",
    "",
    ...role.expectedOutputs.map((item) => `- ${item}`),
    "",
    "## Review Checklist",
    "",
    ...role.reviewChecklist.map((item) => `- ${item}`)
  ].join("\n");
}

export function customPhaseForRun(role: CustomRoleDefinition): CodexStudioPhase {
  return role.phase;
}

export function isBuiltInRole(role: string): role is StudioRoleId {
  return (studioRoleIds as readonly string[]).includes(role);
}
