import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { createTask } from "../src/tasks.js";

describe("tasks", () => {
  test("task creation requires a valid Codex studio project", () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), "ogs-task-"));

    expect(() => createTask(projectRoot, { title: "Implement jump", role: "gameplay-programmer" })).toThrow();
    expect(existsSync(path.join(projectRoot, ".codex", "tasks.json"))).toBe(false);
  });
});
