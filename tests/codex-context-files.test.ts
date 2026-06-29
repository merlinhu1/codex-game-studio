import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { initProject } from "../src/projects.js";
import { prepareRun } from "../src/runner.js";
import { createTask, renderTaskRun } from "../src/tasks.js";
import { renderWorkflowPrompt } from "../src/workflows.js";
import { createContextManifest, selectContextEntries } from "../src/context-manifest.js";

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

  test("path-safe selector records required, missing, unsafe, and budgeted context", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-select-"));
    const { projectRoot } = initProject({ name: "Selector Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const outsideDir = mkdtempSync(path.join(tmpdir(), "ogs-outside-"));
    const outside = path.join(outsideDir, "outside.md");
    writeFileSync(outside, "outside");
    symlinkSync(outside, path.join(projectRoot, "design", "escape.md"));
    writeFileSync(path.join(projectRoot, "design", "large.md"), "x".repeat(20_000));

    const result = selectContextEntries(projectRoot, [
      { sourcePath: "AGENTS.md", reason: "project instructions", required: true },
      { sourcePath: "design/missing.md", reason: "missing required", required: true },
      { sourcePath: "design/gdd.md", reason: "design reference" },
      { sourcePath: "production/timeline.md", reason: "production reference" },
      { sourcePath: "design/large.md", reason: "large optional" },
      { sourcePath: "/absolute.md", reason: "absolute", required: true },
      { sourcePath: "../escape.md", reason: "traversal", required: true },
      { sourcePath: ".env", reason: "secret", required: true },
      { sourcePath: "design/escape.md", reason: "symlink escape", required: true }
    ], { maxFiles: 2, maxChars: 50_000, maxEntryChars: 10_000 });

    expect(result.selected.map((entry) => entry.sourcePath)).toEqual(["AGENTS.md", "design/gdd.md"]);
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "AGENTS.md", status: "selected", required: true, reason: "project instructions" }));
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "design/missing.md", status: "missing" }));
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "/absolute.md", status: "rejected", safety: "unsafe", statusReason: expect.stringMatching(/absolute/i) }));
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "../escape.md", status: "rejected", safety: "unsafe", statusReason: expect.stringMatching(/traversal/i) }));
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: ".env", status: "rejected", safety: "secret" }));
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "design/escape.md", status: "rejected", statusReason: expect.stringMatching(/symlink/i) }));
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "design/large.md", status: "omitted", statusReason: expect.stringMatching(/entry character budget/i) }));
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "production/timeline.md", status: "omitted", statusReason: expect.stringMatching(/file count budget/i) }));
  });

  test("selector prioritizes required context over earlier optional context within file budget", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-required-budget-"));
    const { projectRoot } = initProject({ name: "Required Budget Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    const result = selectContextEntries(projectRoot, [
      { sourcePath: "design/gdd.md", reason: "optional design reference" },
      { sourcePath: "AGENTS.md", reason: "project instructions", required: true }
    ], { maxFiles: 1, maxChars: 10_000, maxEntryChars: 10_000 });

    expect(result.selected.map((entry) => entry.sourcePath)).toEqual(["AGENTS.md"]);
    expect(result.budget.usedFiles).toBeLessThanOrEqual(1);
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "design/gdd.md", status: "omitted", statusReason: expect.stringMatching(/file count budget/i) }));
  });

  test("selector omits oversized required context instead of bypassing character budgets", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-required-size-"));
    const { projectRoot } = initProject({ name: "Required Size Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, "design", "huge-required.md"), "x".repeat(20_000));

    const result = selectContextEntries(projectRoot, [
      { sourcePath: "design/huge-required.md", reason: "required oversized reference", required: true },
      { sourcePath: "AGENTS.md", reason: "project instructions", required: true }
    ], { maxFiles: 2, maxChars: 50_000, maxEntryChars: 10_000 });

    expect(result.selected.map((entry) => entry.sourcePath)).toEqual(["AGENTS.md"]);
    expect(result.budget.usedChars).toBeLessThanOrEqual(50_000);
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "design/huge-required.md", status: "omitted", statusReason: expect.stringMatching(/entry character budget/i) }));
  });

  test("selector rejects dotenv variants as secret-like paths", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-env-local-"));
    const { projectRoot } = initProject({ name: "Env Local Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, ".env.local"), "TOKEN=secret\n");

    const result = selectContextEntries(projectRoot, [
      { sourcePath: ".env.local", reason: "local secrets", required: true }
    ]);

    expect(result.selected).toHaveLength(0);
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: ".env.local", status: "rejected", safety: "secret" }));
  });

  test("implement workflow context contract does not mix read-only policy with writable permissions", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-workflow-contract-"));
    const { projectRoot } = initProject({ name: "Workflow Contract Game", engine: "godot", mode: "prototype", studioMode: "fast-prototype", nonInteractive: true }, cwd);

    const workflow = renderWorkflowPrompt(projectRoot, "bugfix");

    expect(workflow).toContain("Phase: implement");
    expect(workflow).toContain("Write Policy: advisory-write");
    expect(workflow).toContain("Sandbox: danger-full-access");
    expect(workflow).toContain("File Edits: allowed");
    expect(workflow).not.toContain("Write Policy: read-only\nSandbox: danger-full-access\nFile Edits: allowed");
  });

  test("broad context selection records missing required files instead of widening reads", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-missing-"));
    const { projectRoot } = initProject({ name: "Missing Context Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "design", "gdd.md"));
    mkdirSync(path.join(projectRoot, "notes"), { recursive: true });
    writeFileSync(path.join(projectRoot, "notes", "unrequested.md"), "do not include");

    const result = selectContextEntries(projectRoot, [
      { sourcePath: "design/gdd.md", reason: "required design reference", required: true },
      { sourcePath: "AGENTS.md", reason: "project instructions", required: true }
    ]);

    expect(result.selected.map((entry) => entry.sourcePath)).toEqual(["AGENTS.md"]);
    expect(result.entries).toContainEqual(expect.objectContaining({ sourcePath: "design/gdd.md", status: "missing" }));
    expect(result.entries.map((entry) => entry.sourcePath)).not.toContain("notes/unrequested.md");
  });

  test("context manifest selects active engine references without unrelated engine docs", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-engine-reference-"));
    const { projectRoot } = initProject({ name: "Unity Context Game", engine: "unity", mode: "prototype", nonInteractive: true }, cwd);

    const manifest = createContextManifest(projectRoot, {
      schemaVersion: 1,
      product: "codex-game-studio",
      name: "Unity Context Game",
      slug: "unity-context-game",
      concept: "Unity Context Game concept",
      genre: "Unspecified",
      platform: "PC",
      audience: "General players",
      competitors: [],
      monetization: "undecided",
      timeline: "TBD",
      engine: "unity",
      engineVersion: "2022 LTS",
      mode: "prototype",
      studioMode: "guided-studio",
      phase: "Initialization",
      status: "active",
      currentMilestone: "prototype",
      roles: [],
      activeRoles: ["gameplay-programmer"],
      workflows: []
    });

    const sources = manifest.manifest.entries.map((entry) => entry.sourcePath);
    expect(sources).toContain("docs/engine-reference/unity/VERSION.md");
    expect(sources).toContain("docs/engine-reference/unity/current-best-practices.md");
    expect(sources).toContain("docs/engine-reference/unity/gameplay.md");
    expect(sources.some((source) => source.startsWith("docs/engine-reference/unreal/"))).toBe(false);
  });

  test("role runs and workflow prompts select task-relevant engine references without broad loading", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-engine-task-"));
    const { projectRoot } = initProject({ name: "Godot Netcode Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    const run = prepareRun("gameplay-programmer", { project: projectRoot, task: "Implement rollback networking input sync", printPrompt: true }, cwd);
    expect(run.contextFiles).toContain("docs/engine-reference/godot/modules/networking.md");
    expect(run.contextFiles).toContain("docs/engine-reference/godot/modules/input.md");
    expect(run.contextFiles).not.toContain("docs/engine-reference/godot/modules/audio.md");
    expect(run.contextFiles.some((source) => source.startsWith("docs/engine-reference/unity/"))).toBe(false);

    const workflow = renderWorkflowPrompt(projectRoot, "bugfix");
    expect(workflow).toContain("docs/engine-reference/godot/current-best-practices.md");
    expect(workflow).not.toContain("docs/engine-reference/godot/modules/audio.md");
  });

});
