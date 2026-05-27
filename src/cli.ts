#!/usr/bin/env node
import { Command } from "commander";
import path from "node:path";
import { formatTemplateShow, listTemplates, templateRegistry, type TemplateId } from "./templates.js";
import { freezeProject, initProject, resumeProject, statusProject } from "./projects.js";
import { runValidation } from "./validation.js";
import { executeCodexRun, prepareRun } from "./runner.js";

const program = new Command();

function collectCompetitor(value: string, previous: string[] = []): string[] {
  return [...previous, value.trim()].filter(Boolean);
}

program.name("open-gamestudio").description("Codex-native TypeScript game-studio toolkit").version("0.1.0");

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
  .description("Prepare one bounded prompt packet for a project agent, with optional direct Codex execution")
  .argument("<agent>")
  .requiredOption("--project <path>", "project path")
  .requiredOption("--task <text>", "task text")
  .option("--print-prompt", "print deterministic prompt body")
  .option("--dry-run", "print selected context and output paths")
  .option("--exec", "execute the prompt immediately with codex exec")
  .option("--include-artifact <relative-path>", "include one project artifact", (value, previous: string[] = []) => [...previous, value], [])
  .option("--allow-broad-context", "explicitly allow broader context discovery")
  .action((agent, opts) => {
    const result = prepareRun(agent, {
      project: opts.project,
      task: opts.task,
      printPrompt: opts.printPrompt,
      dryRun: opts.dryRun,
      exec: opts.exec,
      includeArtifact: opts.includeArtifact,
      allowBroadContext: opts.allowBroadContext
    });
    console.log(result.output);
    if (!opts.exec) return;
    const execution = executeCodexRun(result);
    if (execution.stdout) process.stdout.write(execution.stdout);
    if (execution.stderr) process.stderr.write(execution.stderr);
    if (execution.error) {
      console.error(execution.error.message);
      process.exitCode = 1;
      return;
    }
    if (execution.status !== 0) process.exitCode = execution.status ?? 1;
  });

program.parseAsync().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
