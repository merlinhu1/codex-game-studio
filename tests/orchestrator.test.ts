import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { initProject } from "../src/projects.js";
import { createTask, readTaskStore } from "../src/tasks.js";
import { orchestrateTasks } from "../src/orchestrator.js";

describe("task orchestration", () => {
  test("dry-run orchestration plans waves without mutating task state or runs", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-orchestrate-dry-"));
    const { projectRoot } = initProject({ name: "Dry Orchestration Game", engine: "godot", mode: "prototype", studioMode: "fast-prototype", nonInteractive: true }, cwd);
    const task = createTask(projectRoot, { title: "Implement jump", role: "gameplay-programmer", files: ["documentation/design/gdd.md"], writeFiles: ["source/project-dry-orchestration-game/player.gd"] });
    const before = readFileSync(path.join(projectRoot, ".codex", "tasks.json"), "utf8");

    const result = await orchestrateTasks({ project: projectRoot, taskIds: [task.id], dryRun: true, maxConcurrency: 1 });

    expect(result.status).toBe("planned");
    expect(result.output).toContain(task.id);
    expect(result.output).toContain("locks: source/project-dry-orchestration-game/player.gd");
    expect(readFileSync(path.join(projectRoot, ".codex", "tasks.json"), "utf8")).toBe(before);
    expect(existsSync(path.join(projectRoot, ".codex", "runs", result.runId))).toBe(false);
  });

  test("bounded orchestration runs dependency-ordered tasks and records local metadata", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-orchestrate-run-"));
    const { projectRoot } = initProject({ name: "Run Orchestration Game", engine: "godot", mode: "prototype", studioMode: "fast-prototype", nonInteractive: true }, cwd);
    const log = path.join(cwd, "codex-log.jsonl");
    const stub = path.join(cwd, "codex-stub.mjs");
    writeFileSync(
      stub,
      `#!/usr/bin/env node
import { appendFileSync, readFileSync } from "node:fs";
const input = readFileSync(0, "utf8");
appendFileSync(${JSON.stringify(log)}, JSON.stringify({ args: process.argv.slice(2), objective: /Objective: (.*)/.exec(input)?.[1] ?? "" }) + "\\n");
console.log("ok");
`
    );
    chmodSync(stub, 0o755);

    const first = createTask(projectRoot, { title: "Implement movement", role: "gameplay-programmer", writeFiles: ["source/project-run-orchestration-game/player.gd"] });
    const second = createTask(projectRoot, { title: "Verify movement", role: "qa-playtester", dependencies: [first.id] });

    const result = await orchestrateTasks({ project: projectRoot, taskIds: [first.id, second.id], maxConcurrency: 2, codexBin: stub });

    expect(result.status).toBe("done");
    const store = readTaskStore(projectRoot);
    expect(store.tasks.find((task) => task.id === first.id)?.status).toBe("done");
    expect(store.tasks.find((task) => task.id === second.id)?.status).toBe("done");
    expect(existsSync(path.join(projectRoot, ".codex", "runs", result.runId, "orchestration.json"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "runs", result.runId, "tasks", first.id, "output.txt"))).toBe(true);
    const invocations = readFileSync(log, "utf8").trim().split("\n");
    expect(invocations).toHaveLength(2);
  });

  test("max concurrency is capped", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-orchestrate-cap-"));
    const { projectRoot } = initProject({ name: "Cap Orchestration Game", engine: "godot", mode: "prototype", studioMode: "fast-prototype", nonInteractive: true }, cwd);
    createTask(projectRoot, { title: "Implement jump", role: "gameplay-programmer" });

    await expect(orchestrateTasks({ project: projectRoot, maxConcurrency: 4, dryRun: true })).rejects.toThrow(/cannot exceed 3/i);
  });
});
