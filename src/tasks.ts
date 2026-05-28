import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCodexStudioSession, type VerificationCommand } from "./codex-session.js";
import { renderCodexPrompt } from "./codex-prompts.js";
import { resolveProjectRoot } from "./paths.js";
import { readStudioProject } from "./projects.js";
import { isStudioRoleId, type StudioRoleId } from "./roles.js";
import { executeRunLifecycle, prepareRun, type PreparedRun, type RunLifecycleResult } from "./runner.js";

export type StudioTaskStatus = "ready" | "running" | "blocked" | "done";

export type StudioTask = {
  id: string;
  title: string;
  role: StudioRoleId;
  status: StudioTaskStatus;
  files: string[];
  verification?: VerificationCommand;
  notes: string[];
};

export type TaskStore = {
  schemaVersion: 1;
  tasks: StudioTask[];
};

export type ExecuteTaskRunOptions = {
  dryRun?: boolean;
  codexBin?: string;
  review?: boolean;
  fix?: boolean;
  maxFixPasses?: number;
};

export type ExecuteTaskRunResult = {
  task: StudioTask;
  prepared: PreparedRun;
  lifecycle?: RunLifecycleResult;
};

export function taskStorePath(projectRoot: string): string {
  return path.join(projectRoot, ".codex", "tasks.json");
}

export function readTaskStore(projectRoot: string): TaskStore {
  const file = taskStorePath(projectRoot);
  if (!existsSync(file)) return { schemaVersion: 1, tasks: [] };
  let parsed: TaskStore;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8")) as TaskStore;
  } catch (error) {
    throw new Error(`Invalid task store JSON: ${(error as Error).message}`);
  }
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.tasks)) throw new Error("Invalid task store schema");
  const ids = new Set<string>();
  for (const task of parsed.tasks) {
    if (ids.has(task.id)) throw new Error(`Duplicate task id: ${task.id}`);
    ids.add(task.id);
    if (!isStudioRoleId(task.role)) throw new Error(`Invalid task role: ${task.role}`);
    if (!["ready", "running", "blocked", "done"].includes(task.status)) throw new Error(`Invalid task status: ${task.status}`);
    if (!Array.isArray(task.files) || !Array.isArray(task.notes)) throw new Error(`Invalid task shape: ${task.id}`);
  }
  return parsed;
}

export function writeTaskStore(projectRoot: string, store: TaskStore): void {
  const dir = path.join(projectRoot, ".codex");
  mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `tasks.${process.pid}.${Date.now()}.tmp`);
  try {
    writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`);
    renameSync(tmp, taskStorePath(projectRoot));
  } catch (error) {
    rmSync(tmp, { force: true });
    throw error;
  }
}

function nextTaskId(tasks: StudioTask[]): string {
  const max = tasks.reduce((found, task) => {
    const match = /^task-(\d+)$/.exec(task.id);
    return match ? Math.max(found, Number(match[1])) : found;
  }, 0);
  return `task-${String(max + 1).padStart(3, "0")}`;
}

function getTask(store: TaskStore, taskId: string): StudioTask {
  const task = store.tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new Error(`Unknown task ${taskId}`);
  return task;
}

export function createTask(projectRoot: string, input: { title: string; role: StudioRoleId; verification?: VerificationCommand; files?: string[] }): StudioTask {
  if (!input.title.trim()) throw new Error("task title is required");
  readStudioProject(projectRoot);
  const store = readTaskStore(projectRoot);
  const task: StudioTask = {
    id: nextTaskId(store.tasks),
    title: input.title.trim(),
    role: input.role,
    status: "ready",
    files: input.files ?? [],
    verification: input.verification,
    notes: []
  };
  writeTaskStore(projectRoot, { schemaVersion: 1, tasks: [...store.tasks, task] });
  return task;
}

export function updateTaskStatus(projectRoot: string, taskId: string, status: StudioTaskStatus, note?: string): StudioTask {
  const store = readTaskStore(projectRoot);
  const task = getTask(store, taskId);
  task.status = status;
  if (note?.trim()) task.notes.push(`${new Date().toISOString()} ${note.trim()}`);
  writeTaskStore(projectRoot, store);
  return task;
}

export function renderTaskRun(projectRoot: string, taskId: string): { task: StudioTask; prompt: string } {
  const studio = readStudioProject(projectRoot);
  const task = getTask(readTaskStore(projectRoot), taskId);
  const session = createCodexStudioSession({
    projectRoot,
    role: task.role,
    objective: task.title,
    phase: "implement",
    engine: studio.engine,
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/tasks.json", `.codex/prompts/${task.role}.md`, ...task.files],
    verification: task.verification
  });
  return { task, prompt: renderCodexPrompt(session) };
}

export async function executeTaskRun(projectRoot: string, taskId: string, options: ExecuteTaskRunOptions = {}): Promise<ExecuteTaskRunResult> {
  const task = getTask(readTaskStore(projectRoot), taskId);
  const prepared = prepareRun(
    task.role,
    {
      project: projectRoot,
      task: task.title,
      dryRun: options.dryRun,
      codexBin: options.codexBin,
      includeArtifact: task.files,
      verifyCommand: task.verification,
      review: options.review,
      fix: options.fix,
      maxFixPasses: options.maxFixPasses
    },
    process.cwd()
  );
  if (options.dryRun) return { task, prepared };

  updateTaskStatus(projectRoot, taskId, "running", "Codex task run started");
  try {
    const lifecycle = await executeRunLifecycle(prepared);
    const finalStatus: StudioTaskStatus = lifecycle.finalStatus === "done" ? "done" : "blocked";
    const updated = updateTaskStatus(projectRoot, taskId, finalStatus, `Codex task run finished: ${lifecycle.finalStatus}`);
    return { task: updated, prepared, lifecycle };
  } catch (error) {
    const updated = updateTaskStatus(projectRoot, taskId, "blocked", `Codex task run failed uncertainly: ${(error as Error).message}`);
    throw Object.assign(error as Error, { task: updated });
  }
}

export function resolveTaskProject(project: string | undefined, cwd = process.cwd()): string {
  return resolveProjectRoot(project, cwd);
}
