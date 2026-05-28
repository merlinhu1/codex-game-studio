import { chmodSync, existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { initProject } from "../src/projects.js";
import { executeRunLifecycle, prepareRun } from "../src/runner.js";

describe("runner", () => {
  test("inspection modes do not write run cache files", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-"));
    const { projectRoot } = initProject({ name: "Inspect Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const runsDir = path.join(projectRoot, ".codex", "runs");
    const before = readdirSync(runsDir);

    const dryRun = prepareRun("gameplay-programmer", { project: projectRoot, task: "Inspect movement", dryRun: true }, cwd);
    const printPrompt = prepareRun("gameplay-programmer", { project: projectRoot, task: "Inspect movement", printPrompt: true }, cwd);

    expect(readdirSync(runsDir)).toEqual(before);
    expect(existsSync(dryRun.promptPath)).toBe(false);
    expect(existsSync(dryRun.metadataPath)).toBe(false);
    expect(existsSync(printPrompt.promptPath)).toBe(false);
    expect(existsSync(printPrompt.metadataPath)).toBe(false);
  });

  test("review passes execute Codex with a read-only sandbox", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-review-"));
    const { projectRoot } = initProject({ name: "Review Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const log = path.join(cwd, "codex-invocations.jsonl");
    const stub = path.join(cwd, "codex-stub.mjs");
    writeFileSync(
      stub,
      `#!/usr/bin/env node
import { appendFileSync, readFileSync } from "node:fs";
const input = readFileSync(0, "utf8");
appendFileSync(${JSON.stringify(log)}, JSON.stringify({ args: process.argv.slice(2), input }) + "\\n");
console.log(JSON.stringify({ blockers: [], warnings: [], summary: "ok", needsFix: false }));
`
    );
    chmodSync(stub, 0o755);

    const run = prepareRun("gameplay-programmer", { project: projectRoot, task: "Implement movement", review: true, codexBin: stub }, cwd);
    await executeRunLifecycle(run);

    const invocations = readFileSync(log, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { args: string[]; input: string });
    expect(invocations).toHaveLength(2);
    expect(invocations[0].args).toEqual(expect.arrayContaining(["--sandbox", "workspace-write"]));
    expect(invocations[1].args).toEqual(expect.arrayContaining(["--sandbox", "read-only"]));
  });
});
