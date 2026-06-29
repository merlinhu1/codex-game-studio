import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { initProject } from "../src/projects.js";
import { createTask, executeTaskRun } from "../src/tasks.js";

describe("tasks", () => {
  test("task creation requires a valid Codex studio project", () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), "ogs-task-"));

    expect(() => createTask(projectRoot, { title: "Implement jump", role: "gameplay-programmer" })).toThrow();
    expect(existsSync(path.join(projectRoot, ".codex", "tasks.json"))).toBe(false);
  });

  test("strict studio blocks unapproved task runs before run metadata writes or task mutation", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-task-strict-"));
    const { projectRoot } = initProject({ name: "Strict Task Game", engine: "godot", mode: "prototype", studioMode: "strict-studio", nonInteractive: true }, cwd);
    const task = createTask(projectRoot, { title: "Implement jump", role: "gameplay-programmer", files: ["design/gdd.md"] });
    const beforeStore = readFileSync(path.join(projectRoot, ".codex", "tasks.json"), "utf8");
    const beforeRuns = readdirSync(path.join(projectRoot, ".codex", "runs"));

    await expect(executeTaskRun(projectRoot, task.id, { codexBin: path.join(cwd, "missing-codex") })).rejects.toThrow(/matching approval/i);

    expect(readFileSync(path.join(projectRoot, ".codex", "tasks.json"), "utf8")).toBe(beforeStore);
    expect(readdirSync(path.join(projectRoot, ".codex", "runs"))).toEqual(beforeRuns);
  });

  test("guided task run override shares eligibility metadata without approval", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-task-guided-"));
    const { projectRoot } = initProject({ name: "Guided Task Game", engine: "godot", mode: "prototype", studioMode: "guided-studio", nonInteractive: true }, cwd);
    const task = createTask(projectRoot, { title: "Implement jump", role: "gameplay-programmer" });

    const result = await executeTaskRun(projectRoot, task.id, { dryRun: true, approvedByUser: true });

    expect(result.prepared.eligibility).toMatchObject({
      allowed: true,
      writePolicy: "override-write",
      codexSandbox: "danger-full-access",
      metadata: { provenance: "override", approvedByUser: true }
    });
    expect(result.prepared.output).toContain("Write policy: override-write");
  });
});
