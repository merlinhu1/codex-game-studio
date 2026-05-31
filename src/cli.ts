#!/usr/bin/env node
import { Command } from "commander";
import path from "node:path";
import { formatTemplateShow, listTemplates, templateRegistry, type TemplateId } from "./templates.js";
import { freezeProject, initProject, resumeProject, statusProject } from "./projects.js";
import { runValidation } from "./validation.js";
import { executeRunLifecycle, prepareRun } from "./runner.js";
import { checkCodexAvailability } from "./codex-runtime.js";
import { createTask, executeTaskRun, resolveTaskProject } from "./tasks.js";
import { renderWorkflowPrompt, workflowRegistry, type WorkflowId } from "./workflows.js";
import { isStudioRoleId, unknownStudioRoleMessage } from "./roles.js";

const program = new Command();

function collectCompetitor(value: string, previous: string[] = []): string[] {
  return [...previous, value.trim()].filter(Boolean);
}

program.name("opengamestudio").description("Codex Game Studio: a Codex-native game-development workflow layer").version("0.1.0");

function addInitCommand(name: "init" | "new"): void {
  program
    .command(name)
    .description(name === "new" ? "Create a new project through the init path" : "Initialize a game project")
    .requiredOption("--name <name>", "project name")
    .requiredOption("--engine <engine>", "godot, unity, or unreal")
    .requiredOption("--mode <mode>", "design, prototype, or development")
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
      const result = initProject({ ...opts, competitors: opts.competitor });
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
templates.command("list").description("List template IDs").action(() => {
  for (const info of listTemplates()) console.log(`${info.id}\t${info.category}\t${info.path}`);
});
templates
  .command("show")
  .description("Show a template")
  .argument("<template-id>")
  .action((id: TemplateId) => {
    if (!templateRegistry[id]) throw new Error(`Unknown template "${id}"`);
    console.log(formatTemplateShow(id));
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
  .option("--allow-broad-context", "explicitly allow broader context discovery")
  .option("--verify-command <command>", "structured verification command")
  .option("--verify-arg <arg>", "structured verification argument; repeat for multiple args", (value, previous: string[] = []) => [...previous, value], [])
  .option("--review", "render/run a schema-driven review pass")
  .option("--fix", "render/run bounded fix pass prompts when blocked")
  .option("--max-fix-passes <count>", "maximum automatic fix passes", "1")
  .action(async (role, objectiveParts: string[], opts) => {
    const verifyCommand = opts.verifyCommand ? { command: opts.verifyCommand as string, args: opts.verifyArg as string[] } : undefined;
    const result = prepareRun(role, {
      project: opts.project,
      task: opts.task ?? objectiveParts.join(" "),
      printPrompt: opts.printPrompt,
      dryRun: opts.dryRun,
      includeArtifact: opts.includeArtifact,
      allowBroadContext: opts.allowBroadContext,
      verifyCommand,
      review: opts.review,
      fix: opts.fix,
      maxFixPasses: Number(opts.maxFixPasses)
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
  .argument("<task-id>")
  .action(async (taskId: string, opts) => {
    const projectRoot = resolveTaskProject(opts.project);
    const result = await executeTaskRun(projectRoot, taskId, {
      dryRun: opts.dryRun,
      review: opts.review,
      fix: opts.fix,
      maxFixPasses: Number(opts.maxFixPasses)
    });
    console.log(opts.dryRun ? result.prepared.output : `${result.prepared.output}\n${result.lifecycle?.output ?? ""}\n${taskId} ${result.task.status}`);
    if (result.lifecycle?.finalStatus === "blocked") process.exitCode = 1;
  });

function renderWorkflowCommand(workflow: WorkflowId, opts: { project: string }): void {
  const projectRoot = resolveTaskProject(opts.project);
  console.log(renderWorkflowPrompt(projectRoot, workflow));
}

function addWorkflowCommand(name: "review" | "ship-check"): void {
  program
    .command(name)
    .description(`Render the ${name} workflow prompt`)
    .requiredOption("--project <path>", "project path")
    .option("--dry-run", "render prompt without launching Codex")
    .action((opts) => renderWorkflowCommand(name, opts));
}

for (const workflow of Object.values(workflowRegistry).filter((entry) => entry.cliAlias)) {
  program
    .command(workflow.cliAlias!)
    .description(`Render the ${workflow.id} workflow prompt`)
    .requiredOption("--project <path>", "project path")
    .option("--dry-run", "render prompt without launching Codex")
    .action((opts) => renderWorkflowCommand(workflow.id, opts));
}
addWorkflowCommand("review");
addWorkflowCommand("ship-check");

program.parseAsync().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
