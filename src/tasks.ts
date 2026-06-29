import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCodexStudioSession, type VerificationCommand } from "./codex-session.js";
import { renderCodexPrompt } from "./codex-prompts.js";
import { projectRelativePath } from "./customization.js";
import { resolveProjectRoot } from "./paths.js";
import { readStudioProject } from "./projects.js";
import { isStudioRoleId, type StudioRoleId } from "./roles.js";
import { executeRunLifecycle, prepareRun, type PreparedRun, type RunLifecycleResult } from "./runner.js";

export type StudioTaskStatus = "ready" | "running" | "blocked" | "done" | "cancelled" | "skipped";

export type StudioTaskDependency = {
  taskId: string;
  requiredStatus: "done";
};

export type StudioTaskRunPolicy = {
  maxFixPasses?: number;
  review?: boolean;
  constrainedSandbox?: boolean;
};

export type StudioTask = {
  id: string;
  title: string;
  role: StudioRoleId;
  status: StudioTaskStatus;
  files: string[];
  writeFiles: string[];
  dependencies: StudioTaskDependency[];
  workflowId?: string;
  groupId?: string;
  priority: number;
  verification?: VerificationCommand;
  runPolicy?: StudioTaskRunPolicy;
  notes: string[];
  createdAt: string;
  updatedAt: string;
  lastRunId?: string;
};

export type TaskStore = {
  schemaVersion: 2;
  tasks: StudioTask[];
};

export type ExecuteTaskRunOptions = {
  dryRun?: boolean;
  noWrite?: boolean;
  codexBin?: string;
  review?: boolean;
  fix?: boolean;
  maxFixPasses?: number;
  approvedByUser?: boolean;
  constrainedSandbox?: boolean;
  approvalScope?: string[];
};

export type ExecuteTaskRunResult = {
  task: StudioTask;
  prepared: PreparedRun;
  lifecycle?: RunLifecycleResult;
};

const migrationTimestamp = "1970-01-01T00:00:00.000Z";
const statuses = new Set<StudioTaskStatus>(["ready", "running", "blocked", "done", "cancelled", "skipped"]);

type LegacyTask = {
  id: string;
  title: string;
  role: StudioRoleId;
  status: StudioTaskStatus;
  files?: string[];
  verification?: VerificationCommand;
  notes?: string[];
};

type RawTask = Partial<StudioTask> & LegacyTask;

export function taskStorePath(projectRoot: string): string {
  return path.join(projectRoot, ".codex", "tasks.json");
}

function nowIso(): string {
  return new Date().toISOString();
}

function assertLiteralTaskPath(projectRoot: string, value: string, label: string): string {
  if (value.includes("*") || value.includes("?") || value.includes("[")) throw new Error(`${label} must be a literal relative file path, not a glob: ${value}`);
  if (value.endsWith("/") || value.endsWith("\\")) throw new Error(`${label} must be a file path, not a directory: ${value}`);
  const safe = projectRelativePath(projectRoot, value);
  if (!safe.ok) throw new Error(`${label} ${safe.error}: ${value}`);
  if (safe.display === ".git" || safe.display.startsWith(".git/")) throw new Error(`${label} cannot target .git: ${value}`);
  return safe.display;
}

export function normalizeTaskFiles(projectRoot: string, values: string[] = [], label = "task file"): string[] {
  return [...new Set(values.map((value) => assertLiteralTaskPath(projectRoot, value, label)))];
}

function normalizeDependency(value: string | StudioTaskDependency): StudioTaskDependency {
  if (typeof value === "string") return { taskId: value, requiredStatus: "done" };
  return { taskId: value.taskId, requiredStatus: "done" };
}

function normalizeTask(raw: RawTask, projectRoot: string, timestamp = migrationTimestamp): StudioTask {
  if (!raw.id || typeof raw.id !== "string") throw new Error("Invalid task id");
  if (!raw.title || typeof raw.title !== "string") throw new Error(`Invalid task title: ${raw.id}`);
  if (!isStudioRoleId(raw.role)) throw new Error(`Invalid task role: ${raw.role}`);
  if (!statuses.has(raw.status)) throw new Error(`Invalid task status: ${raw.status}`);
  const files = normalizeTaskFiles(projectRoot, raw.files ?? [], "task file");
  const writeFiles = normalizeTaskFiles(projectRoot, raw.writeFiles ?? [], "task writeFile");
  const dependencies = (raw.dependencies ?? []).map(normalizeDependency);
  const notes = raw.notes ?? [];
  if (!Array.isArray(notes) || !notes.every((note) => typeof note === "string")) throw new Error(`Invalid task notes: ${raw.id}`);
  return {
    id: raw.id,
    title: raw.title,
    role: raw.role,
    status: raw.status,
    files,
    writeFiles,
    dependencies,
    workflowId: raw.workflowId,
    groupId: raw.groupId,
    priority: Number.isFinite(raw.priority) ? Number(raw.priority) : 0,
    verification: raw.verification,
    runPolicy: raw.runPolicy,
    notes,
    createdAt: raw.createdAt ?? timestamp,
    updatedAt: raw.updatedAt ?? timestamp,
    lastRunId: raw.lastRunId
  };
}

function validateTaskStore(store: TaskStore): TaskStore {
  const ids = new Set<string>();
  for (const task of store.tasks) {
    if (ids.has(task.id)) throw new Error(`Duplicate task id: ${task.id}`);
    ids.add(task.id);
    for (const dependency of task.dependencies) {
      if (!dependency.taskId) throw new Error(`Invalid dependency on task ${task.id}`);
    }
  }
  return store;
}

export function readTaskStore(projectRoot: string): TaskStore {
  const file = taskStorePath(projectRoot);
  if (!existsSync(file)) return { schemaVersion: 2, tasks: [] };
  let parsed: { schemaVersion?: number; tasks?: RawTask[] };
  try {
    parsed = JSON.parse(readFileSync(file, "utf8")) as { schemaVersion?: number; tasks?: RawTask[] };
  } catch (error) {
    throw new Error(`Invalid task store JSON: ${(error as Error).message}`);
  }
  if ((parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) || !Array.isArray(parsed.tasks)) throw new Error("Invalid task store schema");
  return validateTaskStore({ schemaVersion: 2, tasks: parsed.tasks.map((task) => normalizeTask(task, projectRoot)) });
}

export function writeTaskStore(projectRoot: string, store: TaskStore): void {
  validateTaskStore(store);
  const dir = path.join(projectRoot, ".codex");
  mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `tasks.${process.pid}.${Date.now()}.tmp`);
  try {
    writeFileSync(tmp, `${JSON.stringify({ schemaVersion: 2, tasks: store.tasks }, null, 2)}\n`);
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

export function getTask(store: TaskStore, taskId: string): StudioTask {
  const task = store.tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new Error(`Unknown task ${taskId}`);
  return task;
}

export function createTask(
  projectRoot: string,
  input: {
    title: string;
    role: StudioRoleId;
    verification?: VerificationCommand;
    files?: string[];
    writeFiles?: string[];
    dependencies?: string[];
    workflowId?: string;
    groupId?: string;
    priority?: number;
    runPolicy?: StudioTaskRunPolicy;
  }
): StudioTask {
  if (!input.title.trim()) throw new Error("task title is required");
  readStudioProject(projectRoot);
  const store = readTaskStore(projectRoot);
  for (const dependency of input.dependencies ?? []) {
    if (!store.tasks.some((task) => task.id === dependency)) throw new Error(`Unknown dependency task: ${dependency}`);
  }
  const timestamp = nowIso();
  const task: StudioTask = {
    id: nextTaskId(store.tasks),
    title: input.title.trim(),
    role: input.role,
    status: "ready",
    files: normalizeTaskFiles(projectRoot, input.files ?? [], "--file"),
    writeFiles: normalizeTaskFiles(projectRoot, input.writeFiles ?? [], "--write-file"),
    dependencies: (input.dependencies ?? []).map((taskId) => ({ taskId, requiredStatus: "done" })),
    workflowId: input.workflowId,
    groupId: input.groupId,
    priority: input.priority ?? 0,
    verification: input.verification,
    runPolicy: input.runPolicy,
    notes: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
  writeTaskStore(projectRoot, { schemaVersion: 2, tasks: [...store.tasks, task] });
  return task;
}

export function updateTaskStatus(projectRoot: string, taskId: string, status: StudioTaskStatus, note?: string, updates: Partial<Pick<StudioTask, "lastRunId">> = {}): StudioTask {
  const store = readTaskStore(projectRoot);
  const task = getTask(store, taskId);
  task.status = status;
  task.updatedAt = nowIso();
  if (updates.lastRunId) task.lastRunId = updates.lastRunId;
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
    contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/tasks.json", `.codex/agents/${task.role}.toml`, ...task.files],
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
      noWrite: options.noWrite,
      codexBin: options.codexBin,
      includeArtifact: task.files,
      approvedFiles: task.writeFiles.length ? task.writeFiles : undefined,
      verifyCommand: task.verification,
      review: options.review ?? task.runPolicy?.review,
      fix: options.fix,
      maxFixPasses: options.maxFixPasses ?? task.runPolicy?.maxFixPasses,
      approvedByUser: options.approvedByUser,
      constrainedSandbox: options.constrainedSandbox ?? task.runPolicy?.constrainedSandbox,
      approvalScope: options.approvalScope
    },
    process.cwd()
  );
  if (options.dryRun || options.noWrite) return { task, prepared };

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
