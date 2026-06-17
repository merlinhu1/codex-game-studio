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
import { freezeProject, initProject, readStudioProject, resumeProject, statusProject } from "./projects.js";
import { runValidation } from "./validation.js";
import { executeRunLifecycle, prepareRun } from "./runner.js";
import { checkCodexAvailability } from "./codex-runtime.js";
import { createTask, executeTaskRun, readTaskStore, resolveTaskProject } from "./tasks.js";
import { renderWorkflowPrompt, workflowAliases, workflowRegistry, type WorkflowId } from "./workflows.js";
import { isStudioRoleId, unknownStudioRoleMessage } from "./roles.js";
import type { ProjectStage, StudioMode } from "./studio-policy.js";

const program = new Command();

function collectCompetitor(value: string, previous: string[] = []): string[] {
  return [...previous, value.trim()].filter(Boolean);
}

function collectScope(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

program.name("opengamestudio").description("Codex Game Studio: a Codex-native game-development workflow layer").version("0.1.0");

const sha256Pattern = /^[a-f0-9]{64}$/i;

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
    .requiredOption("--non-interactive", "use deterministic defaults")
    .action((opts) => {
      const result = initProject({ ...opts, competitors: opts.competitor, studioMode: readApprovalStudioMode(opts.studioMode) });
      console.log(`Created ${result.config.project.name} at ${path.relative(process.cwd(), result.projectRoot)}`);
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
  .requiredOption("--project <path>", "project path")
  .action((opts) => console.log(resumeProject(opts.project)));

program
  .command("freeze")
  .description("Set project status to frozen")
  .requiredOption("--project <path>", "project path")
  .action((opts) => console.log(freezeProject(opts.project)));

program
  .command("validate")
  .description("Run hard-failing repo or project validation")
  .option("--project <path>", "project path")
  .action(async (opts) => {
    const result = await runValidation({ project: opts.project });
    for (const check of result.checks) {
      console.log(`${check.status.toUpperCase()} ${check.id}: ${check.message}${check.path ? ` (${check.path})` : ""}`);
    }
    if (result.failed) process.exitCode = 1;
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
  .requiredOption("--project <path>", "project path")
  .requiredOption("--role <role>", "studio role")
  .requiredOption("--task <id-or-hash>", "task id or precomputed objective sha256")
  .option("--scope <glob>", "approved relative glob; repeat for multiple scopes", collectScope, [])
  .option("--approved-by <name>", "approval author")
  .option("--expires-at <ISO>", "canonical ISO expiry timestamp")
  .option("--allow-broad-scope", "acknowledge broad approval scope such as **/*")
  .action((opts) => {
    const projectRoot = resolveTaskProject(opts.project);
    if (!isStudioRoleId(opts.role)) throw new Error(unknownStudioRoleMessage(opts.role));
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
      approvedFiles = task.files.length > 0 ? task.files : undefined;
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
  .requiredOption("--project <path>", "project path")
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
  .requiredOption("--project <path>", "project path")
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
  .requiredOption("--project <path>", "project path")
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
      constrainedSandbox: opts.constrainedSandbox
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
  .requiredOption("--project <path>", "project path")
  .requiredOption("--role <role>", "studio role")
  .option("--verify-command <command>", "structured verification command")
  .option("--verify-arg <arg>", "structured verification argument; repeat for multiple args", (value, previous: string[] = []) => [...previous, value], [])
  .argument("<title...>")
  .action((titleParts: string[], opts) => {
    if (!isStudioRoleId(opts.role)) throw new Error(unknownStudioRoleMessage(opts.role));
    const projectRoot = resolveTaskProject(opts.project);
    const verification = opts.verifyCommand ? { command: opts.verifyCommand as string, args: opts.verifyArg as string[] } : undefined;
    const created = createTask(projectRoot, { title: titleParts.join(" "), role: opts.role, verification });
    console.log(created.id);
  });
task
  .command("run")
  .description("Run a task through Codex")
  .requiredOption("--project <path>", "project path")
  .option("--dry-run", "render task prompt without mutation")
  .option("--review", "render/run a schema-driven review pass")
  .option("--fix", "render/run bounded fix pass prompts when blocked")
  .option("--max-fix-passes <count>", "maximum automatic fix passes", "1")
  .option("--approval-scope <glob>", "approval diagnostic scope for task run objective hashing; repeat for multiple scopes", collectScope, [])
  .option("--approved-by-user", "explicitly approve a guided-studio local override")
  .option("--constrained-sandbox", "use Codex workspace-write instead of the default full-access sandbox")
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
      approvalScope: opts.approvalScope
    });
    console.log(opts.dryRun ? result.prepared.output : `${result.prepared.output}\n${result.lifecycle?.output ?? ""}\n${taskId} ${result.task.status}`);
    if (result.lifecycle?.finalStatus === "blocked") process.exitCode = 1;
  });

function renderWorkflowCommand(workflow: string, opts: { project: string }): void {
  const projectRoot = resolveTaskProject(opts.project);
  console.log(renderWorkflowPrompt(projectRoot, workflow));
}

program
  .command("workflow")
  .description("Render a built-in or project-local workflow prompt by id")
  .argument("<workflow-id>")
  .requiredOption("--project <path>", "project path")
  .option("--dry-run", "render prompt without launching Codex")
  .action((workflow: string, opts) => renderWorkflowCommand(workflow, opts));

function addWorkflowCommand(name: "review" | "ship-check"): void {
  program
    .command(name)
    .description(`Render the ${name} workflow prompt`)
    .requiredOption("--project <path>", "project path")
    .option("--dry-run", "render prompt without launching Codex")
    .action((opts) => renderWorkflowCommand(name, opts));
}

for (const workflow of Object.values(workflowRegistry)) {
  for (const alias of workflowAliases(workflow)) {
    program
      .command(alias)
      .description(`Render the ${workflow.id} workflow prompt`)
      .requiredOption("--project <path>", "project path")
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
