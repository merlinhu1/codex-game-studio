import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { initProject } from "../src/projects.js";
import { readTaskStore } from "../src/tasks.js";
import { createWorkflowTasks, workflowRecipeIds } from "../src/workflow-recipes.js";

describe("workflow task recipes", () => {
  test("vertical-slice dry-run prints proposed task graph without writing tasks", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-recipe-dry-"));
    const { projectRoot } = initProject({ name: "Recipe Dry Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const before = readTaskStore(projectRoot).tasks.length;

    const result = createWorkflowTasks(projectRoot, "vertical-slice", { dryRun: true });

    expect(result.dryRun).toBe(true);
    expect(result.output).toContain("vertical-slice");
    expect(result.output).toContain("Implement the vertical-slice core loop");
    expect(readTaskStore(projectRoot).tasks.length).toBe(before);
  });

  test("release-checklist recipe creates explicit dependent tasks", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-recipe-run-"));
    const { projectRoot } = initProject({ name: "Recipe Run Game", engine: "godot", mode: "development", nonInteractive: true }, cwd);

    const result = createWorkflowTasks(projectRoot, "release-checklist");

    expect(result.dryRun).toBe(false);
    const store = readTaskStore(projectRoot);
    const tasks = store.tasks.filter((task) => task.workflowId === "release-checklist");
    expect(tasks).toHaveLength(4);
    const release = tasks.find((task) => task.role === "release-manager");
    expect(release?.dependencies).toHaveLength(3);
    expect(existsSync(path.join(projectRoot, ".codex", "tasks.json"))).toBe(true);
  });

  test("recipe registry exposes only implemented explicit recipes", () => {
    expect(workflowRecipeIds()).toEqual(expect.arrayContaining(["vertical-slice", "bugfix", "ui-ux-review", "release-checklist"]));
  });
});
