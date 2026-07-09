import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { resolveProjectRoot } from "./paths.js";
import { executeRunLifecycle, prepareRun, type PreparedRun, type RunLifecycleResult } from "./runner.js";
import { acquireTaskLocks, releaseTaskLocks, taskLockKeys, type AcquiredTaskLock } from "./orchestrator-locks.js";
import { getTask, readTaskStore, writeTaskStore, type StudioTask, type StudioTaskStatus, type TaskStore } from "./tasks.js";
import type { ModelTier } from "./prompt-surface-metadata.js";
import { workflowRegistry, type WorkflowId } from "./workflows.js";

export type OrchestrateOptions = {
  project: string;
  taskIds?: string[];
  workflowId?: string;
  maxConcurrency?: number;
  dryRun?: boolean;
  review?: boolean;
  fix?: boolean;
  maxFixPasses?: number;
  approvedByUser?: boolean;
  constrainedSandbox?: boolean;
  approvalScope?: string[];
  codexBin?: string;
  modelTier?: ModelTier;
};

export type OrchestrationResult = {
  runId: string;
  status: "planned" | "done" | "blocked";
  selectedTaskIds: string[];
  startedTaskIds: string[];
  blockedTaskIds: string[];
  skippedTaskIds: string[];
  output: string;
};

type PlannedTask = {
  task: StudioTask;
  prepared: PreparedRun;
};

type RunningTask = {
  taskId: string;
  locks: AcquiredTaskLock[];
  promise: Promise<{ taskId: string; lifecycle?: RunLifecycleResult; error?: Error }>;
};

const maxConcurrencyCap = 3;

function nowIso(): string {
  return new Date().toISOString();
}

function newRunId(): string {
  return `${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 17)}-${process.pid}-${randomUUID().slice(0, 8)}`;
}

function taskRank(task: StudioTask): string {
  return `${String(999999 - task.priority).padStart(6, "0")}:${task.id}`;
}

function selectedTasks(store: TaskStore, options: OrchestrateOptions): StudioTask[] {
  if (options.taskIds?.length) return options.taskIds.map((id) => getTask(store, id));
  if (options.workflowId) return store.tasks.filter((task) => task.workflowId === options.workflowId && task.status === "ready").sort((a, b) => taskRank(a).localeCompare(taskRank(b)));
  return store.tasks.filter((task) => task.status === "ready").sort((a, b) => taskRank(a).localeCompare(taskRank(b)));
}

function validateMaxConcurrency(value: number): number {
  if (!Number.isFinite(value) || value < 1 || Math.floor(value) !== value) throw new Error("--max-concurrency must be a positive integer");
  if (value > maxConcurrencyCap) throw new Error(`--max-concurrency cannot exceed ${maxConcurrencyCap}`);
  return value;
}

function validateGraph(store: TaskStore, selected: StudioTask[], options: OrchestrateOptions): void {
  const all = new Map(store.tasks.map((task) => [task.id, task]));
  const selectedIds = new Set(selected.map((task) => task.id));
  for (const task of selected) {
    for (const dependency of task.dependencies) {
      const dep = all.get(dependency.taskId);
      if (!dep) throw new Error(`Task ${task.id} depends on unknown task ${dependency.taskId}`);
      if (["blocked", "cancelled", "skipped"].includes(dep.status) && !(options.dryRun && options.taskIds?.length === 1)) {
        throw new Error(`Task ${task.id} depends on ${dep.status} task ${dep.id}`);
      }
      if (dep.status !== dependency.requiredStatus && !selectedIds.has(dep.id)) {
        throw new Error(`Task ${task.id} depends on ${dep.id}; include it in this run or complete it first`);
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (task: StudioTask): void => {
    if (visited.has(task.id)) return;
    if (visiting.has(task.id)) throw new Error(`Task dependency cycle includes ${task.id}`);
    visiting.add(task.id);
    for (const dependency of task.dependencies) {
      const dep = all.get(dependency.taskId);
      if (dep && selectedIds.has(dep.id)) visit(dep);
    }
    visiting.delete(task.id);
    visited.add(task.id);
  };
  for (const task of selected) visit(task);
}

function dependenciesSatisfied(task: StudioTask, store: TaskStore, selectedIds: Set<string>): boolean {
  for (const dependency of task.dependencies) {
    const dep = getTask(store, dependency.taskId);
    if (dep.status !== dependency.requiredStatus && selectedIds.has(dep.id)) return false;
    if (dep.status !== dependency.requiredStatus && !selectedIds.has(dep.id)) return false;
  }
  return true;
}

function dependenciesBlocked(task: StudioTask, store: TaskStore): string | undefined {
  for (const dependency of task.dependencies) {
    const dep = getTask(store, dependency.taskId);
    if (["blocked", "cancelled", "skipped"].includes(dep.status)) return dep.id;
  }
  return undefined;
}

function updateTask(store: TaskStore, taskId: string, status: StudioTaskStatus, note?: string, lastRunId?: string): StudioTask {
  const task = getTask(store, taskId);
  task.status = status;
  task.updatedAt = nowIso();
  if (lastRunId) task.lastRunId = lastRunId;
  if (note) task.notes.push(`${nowIso()} ${note}`);
  return task;
}

function runDir(projectRoot: string, runId: string): string {
  return path.join(projectRoot, ".codex", "runs", runId);
}

function taskRunDir(projectRoot: string, runId: string, taskId: string): string {
  return path.join(runDir(projectRoot, runId), "tasks", taskId);
}

function appendEvent(projectRoot: string, runId: string, event: Record<string, unknown>): void {
  const file = path.join(runDir(projectRoot, runId), "events.jsonl");
  writeFileSync(file, `${JSON.stringify({ timestamp: nowIso(), ...event })}\n`, { flag: "a" });
}

function writeRunMetadata(projectRoot: string, runId: string, metadata: Record<string, unknown>): void {
  mkdirSync(runDir(projectRoot, runId), { recursive: true });
  writeFileSync(path.join(runDir(projectRoot, runId), "orchestration.json"), `${JSON.stringify(metadata, null, 2)}\n`);
}

function planSummary(projectRoot: string, planned: PlannedTask[], maxConcurrency: number): string {
  const lines = [`Orchestration plan: ${planned.length} task(s), max concurrency ${maxConcurrency}`];
  for (const { task, prepared } of planned) {
    const locks = prepared.eligibility.allowFileEdits ? taskLockKeys(projectRoot, task).join(", ") : "read-only";
    lines.push(`- ${task.id} [${task.role}] ${task.title}`);
    lines.push(`  status: ${task.status}; deps: ${task.dependencies.map((dep) => dep.taskId).join(", ") || "none"}; locks: ${locks}`);
    lines.push(`  context: ${prepared.contextFiles.join(", ") || "none"}`);
    lines.push(`  codex: ${prepared.codexCommand.display}`);
  }
  return lines.join("\n");
}

async function executePlannedTask(projectRoot: string, runId: string, planned: PlannedTask): Promise<{ taskId: string; lifecycle?: RunLifecycleResult; error?: Error }> {
  const dir = taskRunDir(projectRoot, runId, planned.task.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "prompt.md"), planned.prepared.prompt);
  writeFileSync(
    path.join(dir, "metadata.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        taskId: planned.task.id,
        role: planned.task.role,
        title: planned.task.title,
        promptChars: planned.prepared.prompt.length,
        contextFiles: planned.prepared.contextFiles,
        writeFiles: planned.task.writeFiles,
        writePolicy: planned.prepared.eligibility.writePolicy,
        codexSandbox: planned.prepared.eligibility.codexSandbox,
        eligibility: planned.prepared.eligibility
      },
      null,
      2
    )}\n`
  );
  try {
    const lifecycle = await executeRunLifecycle(planned.prepared);
    writeFileSync(path.join(dir, "output.txt"), `${lifecycle.output}\n`);
    return { taskId: planned.task.id, lifecycle };
  } catch (error) {
    writeFileSync(path.join(dir, "output.txt"), `error: ${(error as Error).message}\n`);
    return { taskId: planned.task.id, error: error as Error };
  }
}

export async function orchestrateTasks(options: OrchestrateOptions): Promise<OrchestrationResult> {
  const projectRoot = resolveProjectRoot(options.project, process.cwd());
  const maxConcurrency = validateMaxConcurrency(options.maxConcurrency ?? 1);
  let store = readTaskStore(projectRoot);
  const selected = selectedTasks(store, options);
  validateGraph(store, selected, options);
  const runId = newRunId();
  const selectedTaskIds = selected.map((task) => task.id);
  const selectedIds = new Set(selectedTaskIds);
  const planned = selected.map((task) => ({
    task,
    prepared: prepareRun(
      task.role,
      {
        project: projectRoot,
        task: task.title,
        noWrite: true,
        dryRun: options.dryRun,
        codexBin: options.codexBin,
        includeArtifact: task.files,
        approvedFiles: task.writeFiles.length ? task.writeFiles : undefined,
        verifyCommand: task.verification,
        review: options.review ?? task.runPolicy?.review,
        fix: options.fix,
        maxFixPasses: options.maxFixPasses ?? task.runPolicy?.maxFixPasses,
        approvedByUser: options.approvedByUser,
        constrainedSandbox: options.constrainedSandbox ?? task.runPolicy?.constrainedSandbox,
        approvalScope: options.approvalScope,
        modelTier: options.modelTier ?? task.runPolicy?.modelTier ?? (task.workflowId ? workflowRegistry[task.workflowId as WorkflowId]?.modelTier : undefined)
      },
      process.cwd()
    )
  }));

  if (options.dryRun) {
    return { runId, status: "planned", selectedTaskIds, startedTaskIds: [], blockedTaskIds: [], skippedTaskIds: [], output: planSummary(projectRoot, planned, maxConcurrency) };
  }

  const output: string[] = [planSummary(projectRoot, planned, maxConcurrency)];
  const startedTaskIds: string[] = [];
  const blockedTaskIds: string[] = [];
  const skippedTaskIds: string[] = [];
  const remaining = new Map(planned.map((item) => [item.task.id, item]));
  const running: RunningTask[] = [];

  writeRunMetadata(projectRoot, runId, {
    schemaVersion: 1,
    product: "codex-game-studio",
    runId,
    startedAt: nowIso(),
    projectRoot,
    maxConcurrency,
    requestedTaskIds: options.taskIds ?? [],
    selectedTaskIds,
    dryRun: false,
    review: Boolean(options.review),
    fix: Boolean(options.fix),
    status: "running",
    summary: []
  });
  appendEvent(projectRoot, runId, { event: "orchestration.started", selectedTaskIds, maxConcurrency });

  const persist = (): void => writeTaskStore(projectRoot, store);

  const startReady = (): void => {
    const ready = [...remaining.values()]
      .filter(({ task }) => task.status === "ready" && dependenciesSatisfied(getTask(store, task.id), store, selectedIds))
      .sort((a, b) => taskRank(a.task).localeCompare(taskRank(b.task)));
    for (const plannedTask of ready) {
      if (running.length >= maxConcurrency) return;
      const current = getTask(store, plannedTask.task.id);
      let locks: AcquiredTaskLock[] = [];
      try {
        if (plannedTask.prepared.eligibility.allowFileEdits) locks = acquireTaskLocks(projectRoot, current, runId);
      } catch (error) {
        updateTask(store, current.id, "blocked", `Lock acquisition failed: ${(error as Error).message}`);
        blockedTaskIds.push(current.id);
        remaining.delete(current.id);
        persist();
        appendEvent(projectRoot, runId, { event: "task.blocked", taskId: current.id, reason: (error as Error).message });
        continue;
      }
      updateTask(store, current.id, "running", "Orchestration task run started", runId);
      persist();
      remaining.delete(current.id);
      startedTaskIds.push(current.id);
      appendEvent(projectRoot, runId, { event: "task.started", taskId: current.id, locks: locks.map((lock) => lock.lock.lockKey) });
      const promise = executePlannedTask(projectRoot, runId, plannedTask);
      running.push({ taskId: current.id, locks, promise });
    }
  };

  while (remaining.size > 0 || running.length > 0) {
    startReady();
    for (const [taskId, task] of [...remaining.entries()]) {
      const blocker = dependenciesBlocked(task.task, store);
      if (blocker) {
        updateTask(store, taskId, "skipped", `Dependency ${blocker} did not complete`);
        skippedTaskIds.push(taskId);
        remaining.delete(taskId);
        persist();
        appendEvent(projectRoot, runId, { event: "task.skipped", taskId, blocker });
      }
    }
    if (running.length === 0) {
      if (remaining.size > 0) {
        for (const taskId of [...remaining.keys()]) {
          updateTask(store, taskId, "blocked", "No runnable dependency wave remained");
          blockedTaskIds.push(taskId);
          appendEvent(projectRoot, runId, { event: "task.blocked", taskId, reason: "no runnable dependency wave" });
          remaining.delete(taskId);
        }
        persist();
      }
      continue;
    }
    const finished = await Promise.race(running.map((item) => item.promise));
    const index = running.findIndex((item) => item.taskId === finished.taskId);
    const runningTask = running.splice(index, 1)[0];
    releaseTaskLocks(runningTask.locks);
    appendEvent(projectRoot, runId, { event: "task.unlocked", taskId: finished.taskId });
    store = readTaskStore(projectRoot);
    const finalStatus: StudioTaskStatus = finished.lifecycle?.finalStatus === "done" ? "done" : "blocked";
    updateTask(store, finished.taskId, finalStatus, finished.error ? `Task failed: ${finished.error.message}` : `Task finished: ${finished.lifecycle?.finalStatus ?? "blocked"}`, runId);
    if (finalStatus === "blocked") blockedTaskIds.push(finished.taskId);
    persist();
    appendEvent(projectRoot, runId, { event: finalStatus === "done" ? "task.finished" : "task.blocked", taskId: finished.taskId, status: finalStatus });
    output.push(`${finished.taskId}: ${finalStatus}`);
  }

  const status: "done" | "blocked" = blockedTaskIds.length === 0 && skippedTaskIds.length === 0 ? "done" : "blocked";
  writeRunMetadata(projectRoot, runId, {
    schemaVersion: 1,
    product: "codex-game-studio",
    runId,
    startedAt: nowIso(),
    finishedAt: nowIso(),
    projectRoot,
    maxConcurrency,
    requestedTaskIds: options.taskIds ?? [],
    selectedTaskIds,
    dryRun: false,
    review: Boolean(options.review),
    fix: Boolean(options.fix),
    status,
    summary: selectedTaskIds.map((taskId) => ({ taskId, status: getTask(readTaskStore(projectRoot), taskId).status, runPath: path.relative(projectRoot, taskRunDir(projectRoot, runId, taskId)) }))
  });
  appendEvent(projectRoot, runId, { event: "orchestration.finished", status });
  output.push(`orchestration status: ${status}`);
  return { runId, status, selectedTaskIds, startedTaskIds, blockedTaskIds, skippedTaskIds, output: output.join("\n") };
}
