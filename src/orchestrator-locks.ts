import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync, closeSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { projectRelativePath } from "./customization.js";
import type { StudioTask } from "./tasks.js";

export type TaskLock = {
  schemaVersion: 1;
  lockKey: string;
  taskId: string;
  orchestrationRunId: string;
  role: string;
  writeFile: string;
  acquiredAt: string;
  expiresAt: string;
  releasedAt?: string;
};

export type AcquiredTaskLock = {
  file: string;
  lock: TaskLock;
};

export const projectWriteLockKey = "__project_write__";

export function locksDir(projectRoot: string): string {
  return path.join(projectRoot, ".codex", "locks");
}

function hashLockKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function lockFile(projectRoot: string, lockKey: string): string {
  return path.join(locksDir(projectRoot), `${hashLockKey(lockKey)}.json`);
}

export function normalizeWriteFile(projectRoot: string, value: string): string {
  if (value.includes("*") || value.includes("?") || value.includes("[")) throw new Error(`writeFiles must be literal file paths, not globs: ${value}`);
  if (value.endsWith("/") || value.endsWith("\\")) throw new Error(`writeFiles must be file paths, not directories: ${value}`);
  const safe = projectRelativePath(projectRoot, value);
  if (!safe.ok) throw new Error(`Unsafe writeFile ${value}: ${safe.error}`);
  if (safe.display === ".git" || safe.display.startsWith(".git/")) throw new Error(`writeFiles cannot target .git: ${value}`);
  return safe.display;
}

export function taskLockKeys(projectRoot: string, task: Pick<StudioTask, "writeFiles">): string[] {
  if (task.writeFiles.length === 0) return [projectWriteLockKey];
  return [...new Set(task.writeFiles.map((file) => normalizeWriteFile(projectRoot, file)))];
}

export function acquireTaskLocks(projectRoot: string, task: Pick<StudioTask, "id" | "role" | "writeFiles">, orchestrationRunId: string, ttlMs = 60 * 60 * 1000): AcquiredTaskLock[] {
  mkdirSync(locksDir(projectRoot), { recursive: true });
  const acquired: AcquiredTaskLock[] = [];
  const now = new Date();
  try {
    for (const lockKey of taskLockKeys(projectRoot, task)) {
      const file = lockFile(projectRoot, lockKey);
      if (existsSync(file)) {
        let existing: TaskLock | undefined;
        try {
          existing = JSON.parse(readFileSync(file, "utf8")) as TaskLock;
        } catch {
          // malformed lock still blocks
        }
        throw new Error(`Lock already held for ${lockKey}${existing ? ` by ${existing.taskId}` : ""}`);
      }
      const lock: TaskLock = {
        schemaVersion: 1,
        lockKey,
        taskId: task.id,
        orchestrationRunId,
        role: task.role,
        writeFile: lockKey,
        acquiredAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + ttlMs).toISOString()
      };
      const fd = openSync(file, "wx");
      try {
        writeFileSync(fd, `${JSON.stringify(lock, null, 2)}\n`);
      } finally {
        closeSync(fd);
      }
      acquired.push({ file, lock });
    }
    return acquired;
  } catch (error) {
    releaseTaskLocks(acquired);
    throw error;
  }
}

export function releaseTaskLocks(locks: AcquiredTaskLock[]): void {
  for (const acquired of locks.reverse()) {
    try {
      writeFileSync(acquired.file, `${JSON.stringify({ ...acquired.lock, releasedAt: new Date().toISOString() }, null, 2)}\n`);
      rmSync(acquired.file, { force: true });
    } catch {
      // Best-effort cleanup; callers still record task failure.
    }
  }
}
