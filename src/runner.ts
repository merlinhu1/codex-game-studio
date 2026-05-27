import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { agentNameSchema, readProjectConfig, type AgentName } from "./config.js";
import { readAgentPrompt } from "./agents.js";
import { loadEngineConfigs } from "./engines.js";
import { packageAssetPath, resolveProjectRoot } from "./paths.js";
import { readTemplate, selectTemplates } from "./templates.js";

export type RunOptions = {
  project: string;
  task: string;
  printPrompt?: boolean;
  dryRun?: boolean;
  exec?: boolean;
  codexBin?: string;
  includeArtifact?: string[];
  allowBroadContext?: boolean;
};

export type PreparedRun = {
  prompt: string;
  promptPath: string;
  metadataPath: string;
  projectRoot: string;
  contextFiles: string[];
  codexCommand: { command: string; args: string[]; display: string };
  output: string;
};

export type CodexExecutionResult = {
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  error?: Error;
};

function requireTask(task: string): string {
  if (!task || !task.trim()) throw new Error("--task is required and must be non-empty");
  return task.trim();
}

export function codexExecInvocation(projectRoot: string, promptPath: string, codexBin = "codex"): { command: string; args: string[]; display: string } {
  const promptRelative = path.relative(projectRoot, promptPath);
  const taskPrompt = `Read ${promptRelative} and perform the requested task.`;
  const args = ["exec", "--cd", projectRoot, taskPrompt];
  return { command: codexBin, args, display: [codexBin, ...args.map((arg) => JSON.stringify(arg))].join(" ") };
}

export function executeCodexRun(run: PreparedRun): CodexExecutionResult {
  const result = spawnSync(run.codexCommand.command, run.codexCommand.args, {
    cwd: run.projectRoot,
    encoding: "utf8"
  });
  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error
  };
}

function safeArtifact(projectRoot: string, artifact: string): string {
  if (path.isAbsolute(artifact)) throw new Error("--include-artifact must be relative");
  const full = path.resolve(projectRoot, artifact);
  if (!full.startsWith(`${projectRoot}${path.sep}`)) throw new Error("--include-artifact cannot escape the project root");
  const realRoot = realpathSync(projectRoot);
  const realFull = realpathSync(full);
  if (realFull !== realRoot && !realFull.startsWith(`${realRoot}${path.sep}`)) throw new Error("--include-artifact cannot escape the project root");
  return full;
}

let runSequence = 0;

export function prepareRun(agentInput: string, options: RunOptions, cwd = process.cwd()): PreparedRun {
  if (options.exec && (options.printPrompt || options.dryRun)) throw new Error("--exec cannot be combined with --print-prompt or --dry-run");
  const agent = agentNameSchema.parse(agentInput) as AgentName;
  const task = requireTask(options.task);
  const projectRoot = resolveProjectRoot(options.project, cwd);
  const config = readProjectConfig(path.join(projectRoot, "project-config.json"));
  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  const engine = engines[config.project.engine];
  const templates = selectTemplates(agent, task);
  const contextFiles = [
    path.relative(projectRoot, path.join(projectRoot, ".gamestudio", "agents", `${agent}.md`)),
    "project-config.json",
    `engine_configs/${config.project.engine}.json`,
    ...templates.map((id) => `templates/${id}`)
  ];
  const artifactBodies = (options.includeArtifact ?? []).map((artifact) => {
    const full = safeArtifact(projectRoot, artifact);
    contextFiles.push(artifact);
    return `# Included Artifact: ${artifact}\n\n${readFileSync(full, "utf8")}`;
  });
  const templateBodies = templates.map((id) => `# Template: ${id}\n\n${readTemplate(id)}`).join("\n\n");
  const outputPaths = [
    agent === "market_analyst" ? "resources/market-research/market-analysis.md" : undefined,
    agent === "data_scientist" ? "documentation/technical/analytics/analytics-plan.md" : undefined,
    agent === "qa_agent" ? "documentation/qa/validation-review.md" : undefined
  ].filter(Boolean);
  const prompt = [
    `# Open GameStudio Prompt`,
    `Agent: ${agent}`,
    `Task: ${task}`,
    `Project: ${config.project.name} (${config.project.slug})`,
    `Engine: ${engine.display_name} ${config.project.engine_version}`,
    `Validation: npm run validate -- --project ${path.relative(cwd, projectRoot) || "."}`,
    "",
    "# Agent Prompt",
    readAgentPrompt(agent, projectRoot),
    "",
    "# Project Summary",
    `Concept: ${config.project.concept}`,
    `Audience: ${config.project.audience}`,
    `Competitors: ${config.project.competitors.join(", ")}`,
    "",
    "# Engine Overlay",
    Object.values(engine.agent_specializations).join("\n"),
    "",
    templateBodies,
    ...artifactBodies,
    "",
    "# Output Paths",
    outputPaths.length ? outputPaths.map((p) => `- ${p}`).join("\n") : "- Use the role prompt output path conventions.",
    options.allowBroadContext ? "\n# Broad Context\nExplicit broad context opt-in was provided." : ""
  ].join("\n");
  const runId = `${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 17)}-${process.pid}-${++runSequence}`;
  const runDir = path.join(projectRoot, ".gamestudio", "runs", `${runId}-${agent}`);
  mkdirSync(runDir, { recursive: true });
  const promptPath = path.join(runDir, "prompt.md");
  const metadataPath = path.join(runDir, "metadata.json");
  writeFileSync(promptPath, prompt);
  writeFileSync(
    metadataPath,
    `${JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        project: path.relative(cwd, projectRoot) || ".",
        agent,
        task,
        prompt_chars: prompt.length,
        prompt_cache_path: path.relative(cwd, promptPath)
      },
      null,
      2
    )}\n`
  );
  const codexCommand = codexExecInvocation(projectRoot, promptPath, options.codexBin ?? process.env.OPEN_GAMESTUDIO_CODEX_BIN ?? "codex");
  const output = options.printPrompt
    ? prompt
    : options.dryRun
      ? `Prompt cache: ${promptPath}\nMetadata: ${metadataPath}\nContext files:\n${contextFiles.map((f) => `- ${f}`).join("\n")}\nValidation: npm run validate -- --project ${path.relative(cwd, projectRoot) || "."}`
      : options.exec
        ? `Prompt cache written: ${promptPath}\nExecuting Codex: ${codexCommand.display}`
        : `Prompt cache written: ${promptPath}\nNext Codex command: ${codexCommand.display}`;
  return { prompt, promptPath, metadataPath, projectRoot, contextFiles, codexCommand, output };
}
