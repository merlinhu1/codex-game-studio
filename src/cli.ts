#!/usr/bin/env node
import { Command } from "commander";
import { userInfo } from "node:os";
import path from "node:path";
import {
  appendApprovalRecord,
  approvalListState,
  canonicalObjectiveSha256,
  isBroadApprovalScope,
  normalizeApprovalScope,
  readApprovalStore,
  revokeApprovalRecord
} from "./approvals.js";
import { formatTemplateShow, listTemplates, templateRegistry, type TemplateId } from "./templates.js";
import { freezeProject, initProject, readStudioProject, refreshContextManifestProject, resumeProject, statusProject } from "./projects.js";
import { runValidation } from "./validation.js";
import { documentationImpactChecks } from "./documentation-impact.js";
import { executeRunLifecycle, prepareRun } from "./runner.js";
import { checkCodexAvailability } from "./codex-runtime.js";
import { renderAgentContext } from "./agent-context.js";
import { createTask, executeTaskRun, readTaskStore, resolveTaskProject } from "./tasks.js";
import { orchestrateTasks } from "./orchestrator.js";
import { renderWorkflowPrompt, workflowAliases, workflowRegistry, type WorkflowId } from "./workflows.js";
import { createWorkflowTasks } from "./workflow-recipes.js";
import { isStudioRoleId, unknownStudioRoleMessage } from "./roles.js";
import type { ProjectStage, StudioMode } from "./studio-policy.js";
import { isModelTier, type ModelTier } from "./prompt-surface-metadata.js";

const program = new Command();

function collectCompetitor(value: string, previous: string[] = []): string[] {
  return [...previous, value.trim()].filter(Boolean);
}

function collectScope(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

function parseModelTier(value: string): ModelTier {
  if (!isModelTier(value)) throw new Error(`Unsupported model tier: ${value}; use sol, terra, or luna`);
  return value;
}

program.name("codex-game-studio").description("Codex Game Studio: a Codex-native game-development workflow layer").version("0.1.0");

const sha256Pattern = /^[a-f0-9]{64}$/i;
const customRoleIdPattern = /^custom-[a-z0-9][a-z0-9-]*$/;

function localApprovedBy(): string {
  try {
    return userInfo().username || "local-user";
  } catch {
    return "local-user";
  }
}

function assertCanonicalIsoTimestamp(value: string, field: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== value) {
    throw new Error(`${field} must be a canonical ISO timestamp such as 2026-06-13T00:00:00.000Z`);
  }
  return value;
}

function approvalStudioMode(): StudioMode {
  return "guided-studio";
}

function approvalProjectStage(mode: string): ProjectStage {
  if (mode === "design" || mode === "prototype" || mode === "development") return mode;
  throw new Error(`Unsupported project stage: ${mode}`);
}

function readApprovalStudioMode(value: string): StudioMode {
  if (value === "fast-prototype" || value === "guided-studio" || value === "strict-studio") return value;
  throw new Error(`Unsupported studio mode: ${value}`);
}

function isApprovalRoleId(value: string): boolean {
  return isStudioRoleId(value) || customRoleIdPattern.test(value);
}

function addInitCommand(name: "init" | "new"): void {
  program
    .command(name)
    .description(name === "new" ? "Create a new project through the init path" : "Initialize a game project")
    .requiredOption("--name <name>", "project name")
    .requiredOption("--engine <engine>", "godot, unity, or unreal")
    .requiredOption("--mode <mode>", "design, prototype, or development")
    .option("--studio-mode <mode>", "fast-prototype, guided-studio, or strict-studio", "guided-studio")
    .option("--concept <text>", "project concept")
    .option("--genre <text>", "genre")
    .option("--platform <text>", "platform")
    .option("--audience <text>", "audience")
    .option("--competitor <name>", "competitor name; repeat for multiple competitors", collectCompetitor, [])
    .option("--monetization <text>", "monetization model")
    .option("--timeline <text>", "timeline")
    .option("--engine-version <version>", "engine version override")
    .option("--force-refresh", "refresh an existing root project with matching intent")
    .option("--keep-template-authoring", "keep maintainer-only template authoring files after init")
    .requiredOption("--non-interactive", "use deterministic defaults")
    .action((opts) => {
      const result = initProject({ ...opts, competitors: opts.competitor, studioMode: readApprovalStudioMode(opts.studioMode) });
      console.log(`Created ${result.config.project.name} at ${path.relative(process.cwd(), result.projectRoot)}`);
      if (result.prunedArtifacts.length > 0) console.log(`Pruned template authoring artifacts: ${result.prunedArtifacts.length}`);
    });
}

addInitCommand("init");
addInitCommand("new");

program
  .command("status")
  .description("Print project status")
  .option("--project <path>", "project path")
  .action((opts) => console.log(statusProject(opts.project)));

program
  .command("resume")
  .description("Print a read-only continuation summary")
  .option("--project <path>", "project path")
  .action((opts) => console.log(resumeProject(opts.project)));

program
  .command("refresh-context")
  .description("Regenerate the project context manifest and freshness metadata")
  .option("--project <path>", "project path")
  .action((opts) => console.log(refreshContextManifestProject(opts.project)));

const context = program.command("context").description("Print low-token context packs for agents");
context
  .command("studio")
  .description("Summarize initialized project state or template checkout state")
  .option("--project <path>", "project path")
  .action((opts) => console.log(renderAgentContext({ kind: "studio", projectRoot: opts.project })));
context
  .command("role <role-id>")
  .description("Summarize one role without dumping the full prompt")
  .action((roleId: string) => console.log(renderAgentContext({ kind: "role", id: roleId })));
context
  .command("workflow <workflow-id>")
  .description("Summarize one workflow without dumping the full workflow file")
  .action((workflowId: string) => console.log(renderAgentContext({ kind: "workflow", id: workflowId })));
context
  .command("task <query...>")
  .description("Suggest roles, workflows, templates, and commands for a natural-language task")
  .action((queryParts: string[]) => console.log(renderAgentContext({ kind: "task", id: queryParts.join(" ") })));
context
  .command("changed")
  .description("Summarize changed files and next inspection steps")
  .action(() => console.log(renderAgentContext({ kind: "changed", cwd: process.cwd() })));

program
  .command("freeze")
  .description("Set project status to frozen")
  .option("--project <path>", "project path")
  .action((opts) => console.log(freezeProject(opts.project)));

function printChecks(checks: readonly { status: string; id: string; message: string; path?: string }[]): boolean {
  for (const check of checks) {
    console.log(`${check.status.toUpperCase()} ${check.id}: ${check.message}${check.path ? ` (${check.path})` : ""}`);
  }
  return checks.some((check) => check.status === "fail");
}

program
  .command("validate")
  .description("Run hard-failing repo or project validation")
  .option("--project <path>", "project path")
  .option("--base <ref>", "Git base used for documentation-impact validation")
  .action(async (opts) => {
    const result = await runValidation({ project: opts.project, base: opts.base });
    if (printChecks(result.checks)) process.exitCode = 1;
  });

program
  .command("docs-impact")
  .description("Check documentation-impact evidence for functional game changes")
  .option("--project <path>", "project path")
  .option("--base <ref>", "Git base to compare against", "HEAD")
  .action((opts) => {
    const projectRoot = resolveTaskProject(opts.project);
    if (printChecks(documentationImpactChecks(projectRoot, { base: opts.base }))) process.exitCode = 1;
  });

const templates = program.command("templates").description("Discover templates");
templates.command("list").description("List template IDs").option("--project <path>", "project path for local templates").action((opts) => {
  const projectRoot = opts.project ? resolveTaskProject(opts.project) : undefined;
  for (const info of listTemplates(projectRoot)) console.log(`${info.id}\t${info.category}\t${info.path}`);
});
templates
  .command("show")
  .description("Show a template")
  .argument("<template-id>")
  .option("--project <path>", "project path for local templates")
  .action((id: string, opts) => {
    const projectRoot = opts.project ? resolveTaskProject(opts.project) : undefined;
    if (!templateRegistry[id as TemplateId] && !projectRoot) throw new Error(`Unknown template "${id}"`);
    console.log(formatTemplateShow(id, projectRoot ? { projectRoot } : {}));
  });

const approval = program.command("approval").description("Manage auditable studio approvals");
approval
  .command("grant")
  .description("Grant a scoped approval for a role and task objective")
  .option("--project <path>", "project path")
  .requiredOption("--role <role>", "studio role")
  .requiredOption("--task <id-or-hash>", "task id or precomputed objective sha256")
  .option("--scope <glob>", "approved relative glob; repeat for multiple scopes", collectScope, [])
  .option("--approved-by <name>", "approval author")
  .option("--expires-at <ISO>", "canonical ISO expiry timestamp")
  .option("--allow-broad-scope", "acknowledge broad approval scope such as **/*")
  .action((opts) => {
    const projectRoot = resolveTaskProject(opts.project);
    if (!isApprovalRoleId(opts.role)) throw new Error(unknownStudioRoleMessage(opts.role));
    const scopes = normalizeApprovalScope(opts.scope, { projectRoot });
    if (scopes.length === 0) throw new Error("approval grant requires at least one --scope");
    const broadScope = scopes.find(isBroadApprovalScope);
    if (broadScope && !opts.allowBroadScope) {
      throw new Error(`approval scope "${broadScope}" is broad; pass --allow-broad-scope to acknowledge it`);
    }

    const studio = readStudioProject(projectRoot);
    const projectStage = approvalProjectStage(studio.mode);
    const studioMode = readApprovalStudioMode(studio.studioMode ?? approvalStudioMode());
    const taskRef = String(opts.task);
    let objectiveSha256: string;
    let objectiveLabel = taskRef;
    let objective: string | undefined;
    let approvedFiles: string[] | undefined;
    if (sha256Pattern.test(taskRef)) {
      objectiveSha256 = taskRef.toLowerCase();
      objectiveLabel = "precomputed objective hash";
    } else {
      const task = readTaskStore(projectRoot).tasks.find((candidate) => candidate.id === taskRef);
      if (!task) throw new Error(`Unknown task: ${taskRef}. Pass an existing task id or a 64-character sha256 objective hash.`);
      if (task.role !== opts.role) throw new Error(`Task ${task.id} is assigned to role ${task.role}; approval role ${opts.role} does not match.`);
      objective = task.title;
      objectiveLabel = task.title;
      approvedFiles = task.writeFiles.length > 0 ? task.writeFiles : undefined;
      objectiveSha256 = canonicalObjectiveSha256({
        role: opts.role,
        objective: task.title,
        approvedGlobs: scopes,
        approvedFiles,
        projectStage,
        studioMode
      });
    }

    const record = appendApprovalRecord(projectRoot, {
      role: opts.role,
      objectiveSha256,
      objective,
      projectStage,
      studioMode,
      approvedGlobs: scopes,
      approvedFiles,
      approvedBy: opts.approvedBy ?? localApprovedBy(),
      expiresAt: opts.expiresAt ? assertCanonicalIsoTimestamp(opts.expiresAt, "--expires-at") : undefined
    });
    console.log(
      [
        `Granted ${record.id}`,
        `role: ${record.role}`,
        `objective: ${objectiveLabel}`,
        `objectiveSha256: ${record.objectiveSha256}`,
        `scopes: ${record.approvedGlobs.join(", ")}`,
        record.approvedFiles?.length ? `files: ${record.approvedFiles.join(", ")}` : undefined,
        `inspect: ${path.relative(process.cwd(), path.join(projectRoot, ".codex", "approvals.json"))}`
      ]
        .filter(Boolean)
        .join("\n")
    );
  });
approval
  .command("list")
  .description("List approval records, including revoked and expired history")
  .option("--project <path>", "project path")
  .action((opts) => {
    const projectRoot = resolveTaskProject(opts.project);
    const store = readApprovalStore(projectRoot);
    if (store.records.length === 0) {
      console.log("No approvals recorded.");
      return;
    }
    for (const record of store.records) {
      const state = approvalListState(record);
      const auth = state.authorizing ? "authorizing" : "non-authorizing";
      console.log(
        [
          `${record.id}\t${state.state}\t${auth}`,
          `role: ${record.role}`,
          `scopes: ${record.approvedGlobs.join(", ")}`,
          record.expiresAt ? `expires: ${record.expiresAt}` : "expires: none",
          record.revokedAt ? `revoked: ${record.revokedAt}` : undefined,
          state.reasons.length ? `diagnostics: ${state.reasons.join(", ")}` : undefined
        ]
          .filter(Boolean)
          .join("\n")
      );
    }
  });
approval
  .command("revoke")
  .description("Revoke an approval while preserving history")
  .option("--project <path>", "project path")
  .requiredOption("--approval-id <id>", "approval id")
  .action((opts) => {
    const projectRoot = resolveTaskProject(opts.project);
    const record = revokeApprovalRecord(projectRoot, opts.approvalId);
    console.log(`Revoked ${record.id}`);
  });

program
  .command("run")
  .description("Run a Codex Game Studio role through Codex by default")
  .argument("<role>")
  .argument("[objective...]")
  .option("--project <path>", "project path")
  .option("--task <text>", "task text; positional objective is preferred")
  .option("--print-prompt", "print deterministic prompt body")
  .option("--dry-run", "print selected context and Codex command without launching Codex")
  .option("--include-artifact <relative-path>", "include one project artifact", (value, previous: string[] = []) => [...previous, value], [])
  .option("--approval-scope <glob>", "approval diagnostic scope for dry-run objective hashing; repeat for multiple scopes", collectScope, [])
  .option("--allow-broad-context", "explicitly allow broader context discovery")
  .option("--verify-command <command>", "structured verification command")
  .option("--verify-arg <arg>", "structured verification argument; repeat for multiple args", (value, previous: string[] = []) => [...previous, value], [])
  .option("--review", "render/run a schema-driven review pass")
  .option("--fix", "render/run bounded fix pass prompts when blocked")
  .option("--max-fix-passes <count>", "maximum automatic fix passes", "1")
  .option("--approved-by-user", "explicitly approve a guided-studio local override")
  .option("--constrained-sandbox", "use Codex workspace-write instead of the default full-access sandbox")
  .option("--model-tier <tier>", "override the selected surface model tier", parseModelTier)
  .action(async (role, objectiveParts: string[], opts) => {
    const verifyCommand = opts.verifyCommand ? { command: opts.verifyCommand as string, args: opts.verifyArg as string[] } : undefined;
    const result = prepareRun(role, {
      project: opts.project,
      task: opts.task ?? objectiveParts.join(" "),
      printPrompt: opts.printPrompt,
      dryRun: opts.dryRun,
      includeArtifact: opts.includeArtifact,
      approvalScope: opts.approvalScope,
      allowBroadContext: opts.allowBroadContext,
      verifyCommand,
      review: opts.review,
      fix: opts.fix,
      maxFixPasses: Number(opts.maxFixPasses),
      approvedByUser: opts.approvedByUser,
      constrainedSandbox: opts.constrainedSandbox,
      modelTier: opts.modelTier
    });
    console.log(result.output);
    if (opts.dryRun || opts.printPrompt) return;
    const availability = await checkCodexAvailability({ codexBin: result.codexCommand.command });
    if (!availability.ok) {
      console.error(availability.reason ?? "Codex CLI is unavailable or unauthenticated");
      process.exitCode = 1;
      return;
    }
    const lifecycle = await executeRunLifecycle(result);
    console.log(lifecycle.output);
    if (lifecycle.finalStatus !== "done") process.exitCode = 1;
  });

const task = program.command("task").description("Manage file-backed Codex studio tasks");
task
  .command("create")
  .description("Create a ready task in .codex/tasks.json")
  .option("--project <path>", "project path")
  .requiredOption("--role <role>", "studio role")
  .option("--file <relative-path>", "read/context file for the task; repeat for multiple files", (value, previous: string[] = []) => [...previous, value], [])
  .option("--write-file <relative-path>", "literal project-relative file this task may mutate; repeat for multiple files", (value, previous: string[] = []) => [...previous, value], [])
  .option("--depends-on <task-id>", "task dependency that must be done; repeat for multiple dependencies", (value, previous: string[] = []) => [...previous, value], [])
  .option("--workflow <workflow-id>", "source workflow id for this task")
  .option("--group <group-id>", "task group id")
  .option("--priority <number>", "task priority; higher values run earlier", "0")
  .option("--model-tier <tier>", "set the task's explicit model tier", parseModelTier)
  .option("--verify-command <command>", "structured verification command")
  .option("--verify-arg <arg>", "structured verification argument; repeat for multiple args", (value, previous: string[] = []) => [...previous, value], [])
  .argument("<title...>")
  .action((titleParts: string[], opts) => {
    if (!isStudioRoleId(opts.role)) throw new Error(unknownStudioRoleMessage(opts.role));
    const projectRoot = resolveTaskProject(opts.project);
    const verification = opts.verifyCommand ? { command: opts.verifyCommand as string, args: opts.verifyArg as string[] } : undefined;
    const created = createTask(projectRoot, {
      title: titleParts.join(" "),
      role: opts.role,
      verification,
      files: opts.file,
      writeFiles: opts.writeFile,
      dependencies: opts.dependsOn,
      workflowId: opts.workflow,
      groupId: opts.group,
      priority: Number(opts.priority),
      runPolicy: opts.modelTier ? { modelTier: opts.modelTier } : undefined
    });
    console.log(created.id);
  });
task
  .command("run")
  .description("Run a task through Codex")
  .option("--project <path>", "project path")
  .option("--dry-run", "render task prompt without mutation")
  .option("--review", "render/run a schema-driven review pass")
  .option("--fix", "render/run bounded fix pass prompts when blocked")
  .option("--max-fix-passes <count>", "maximum automatic fix passes", "1")
  .option("--approval-scope <glob>", "approval diagnostic scope for task run objective hashing; repeat for multiple scopes", collectScope, [])
  .option("--approved-by-user", "explicitly approve a guided-studio local override")
  .option("--constrained-sandbox", "use Codex workspace-write instead of the default full-access sandbox")
  .option("--model-tier <tier>", "override the task or workflow model tier", parseModelTier)
  .argument("<task-id>")
  .action(async (taskId: string, opts) => {
    const projectRoot = resolveTaskProject(opts.project);
    const result = await executeTaskRun(projectRoot, taskId, {
      dryRun: opts.dryRun,
      review: opts.review,
      fix: opts.fix,
      maxFixPasses: Number(opts.maxFixPasses),
      approvedByUser: opts.approvedByUser,
      constrainedSandbox: opts.constrainedSandbox,
      approvalScope: opts.approvalScope,
      modelTier: opts.modelTier
    });
    console.log(opts.dryRun ? result.prepared.output : `${result.prepared.output}\n${result.lifecycle?.output ?? ""}\n${taskId} ${result.task.status}`);
    if (result.lifecycle?.finalStatus === "blocked") process.exitCode = 1;
  });
task
  .command("orchestrate")
  .description("Run ready tasks with explicit local orchestration and bounded parallelism")
  .option("--project <path>", "project path")
  .option("--workflow <workflow-id>", "select ready tasks from one workflow")
  .option("--max-concurrency <count>", "maximum concurrent task runs, capped at 3", "1")
  .option("--dry-run", "show task waves, locks, approvals, and commands without mutation")
  .option("--review", "run a schema-driven review pass per task")
  .option("--fix", "run bounded fix pass prompts when blocked")
  .option("--max-fix-passes <count>", "maximum automatic fix passes", "1")
  .option("--approval-scope <glob>", "approval diagnostic scope for task run objective hashing; repeat for multiple scopes", collectScope, [])
  .option("--approved-by-user", "explicitly approve a guided-studio local override")
  .option("--constrained-sandbox", "use Codex workspace-write instead of the default full-access sandbox")
  .option("--model-tier <tier>", "override all selected task model tiers", parseModelTier)
  .argument("[task-id...]", "specific task ids to orchestrate")
  .action(async (taskIds: string[], opts) => {
    const result = await orchestrateTasks({
      project: opts.project,
      taskIds: taskIds.length ? taskIds : undefined,
      workflowId: opts.workflow,
      maxConcurrency: Number(opts.maxConcurrency),
      dryRun: opts.dryRun,
      review: opts.review,
      fix: opts.fix,
      maxFixPasses: Number(opts.maxFixPasses),
      approvedByUser: opts.approvedByUser,
      constrainedSandbox: opts.constrainedSandbox,
      approvalScope: opts.approvalScope,
      modelTier: opts.modelTier
    });
    console.log(result.output);
    if (result.status === "blocked") process.exitCode = 1;
  });

function renderWorkflowCommand(workflow: string, opts: { project: string }): void {
  const projectRoot = resolveTaskProject(opts.project);
  console.log(renderWorkflowPrompt(projectRoot, workflow));
}

const workflow = program.command("workflow").description("Render a built-in or project-local workflow prompt by id");
workflow
  .command("render <workflow-id>", { isDefault: true })
  .description("Render a built-in or project-local workflow prompt by id")
  .option("--project <path>", "project path")
  .option("--dry-run", "render prompt without launching Codex")
  .action((workflowId: string, opts) => renderWorkflowCommand(workflowId, opts));

const workflowTasks = workflow.command("create-tasks <workflow-id>").description("Create explicit file-backed tasks from a workflow recipe");
workflowTasks
  .option("--project <path>", "project path")
  .option("--dry-run", "show proposed tasks without writing .codex/tasks.json")
  .action((workflowId: string, opts) => {
    const projectRoot = resolveTaskProject(opts.project);
    const result = createWorkflowTasks(projectRoot, workflowId, { dryRun: opts.dryRun });
    console.log(result.output);
  });

function addWorkflowCommand(name: "review" | "ship-check"): void {
  program
    .command(name)
    .description(`Render the ${name} workflow prompt`)
    .option("--project <path>", "project path")
    .option("--dry-run", "render prompt without launching Codex")
    .action((opts) => renderWorkflowCommand(name, opts));
}

for (const workflow of Object.values(workflowRegistry)) {
  for (const alias of workflowAliases(workflow)) {
    program
      .command(alias)
      .description(`Render the ${workflow.id} workflow prompt`)
      .option("--project <path>", "project path")
      .option("--dry-run", "render prompt without launching Codex")
      .action((opts) => renderWorkflowCommand(workflow.id, opts));
  }
}
addWorkflowCommand("review");
addWorkflowCommand("ship-check");

program.parseAsync().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
