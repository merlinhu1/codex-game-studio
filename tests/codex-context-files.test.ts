import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { initProject } from "../src/projects.js";
import { prepareRun } from "../src/runner.js";
import { createTask, renderTaskRun } from "../src/tasks.js";
import { renderWorkflowPrompt } from "../src/workflows.js";

describe("Codex context files", () => {
  test("runner, workflows, and task prompts use AGENTS.md", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-"));
    const { projectRoot } = initProject({ name: "Context Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    const prepared = prepareRun("gameplay-programmer", { project: projectRoot, task: "Implement movement", dryRun: true }, cwd);
    expect(prepared.contextFiles[0]).toBe("AGENTS.md");
    expect(prepared.prompt).toContain("AGENTS.md");
    expect(prepared.output).toContain("- AGENTS.md");
    expect(prepared.prompt).not.toContain("CODEX.md");

    const workflow = renderWorkflowPrompt(projectRoot, "vertical-slice");
    expect(workflow).toContain("AGENTS.md");
    expect(workflow).not.toContain("CODEX.md");

    const task = createTask(projectRoot, { title: "Wire jump controls", role: "gameplay-programmer" });
    const taskRun = renderTaskRun(projectRoot, task.id);
    expect(taskRun.prompt).toContain("AGENTS.md");
    expect(taskRun.prompt).not.toContain("CODEX.md");
  });
});
