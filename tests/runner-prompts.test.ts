import { chmodSync, existsSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { initProject } from "../src/projects.js";
import { codexExecInvocation, executeCodexRun, prepareRun } from "../src/runner.js";

describe("bounded runner", () => {
  test("requires non-empty task", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-"));
    const { projectRoot } = initProject({ name: "Run Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    expect(() => prepareRun("qa_agent", { project: projectRoot, task: "" }, cwd)).toThrow(/--task/);
  });

  test("writes prompt cache and metadata with bounded context", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-"));
    const { projectRoot } = initProject({ name: "Market Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const result = prepareRun("market_analyst", { project: projectRoot, task: "Create first market overview", printPrompt: true }, cwd);
    expect(existsSync(result.promptPath)).toBe(true);
    expect(existsSync(result.metadataPath)).toBe(true);
    expect(result.prompt).toContain("# Template: market_analysis");
    expect(result.prompt).toContain("resources/market-research/market-analysis.md");
    expect(result.prompt).not.toContain("# Template: analytics_setup");
    expect(result.prompt).not.toContain("Data scientist prompt");
    const metadata = JSON.parse(readFileSync(result.metadataPath, "utf8"));
    expect(metadata.prompt_chars).toBe(result.prompt.length);
    expect(metadata.prompt_cache_path).toContain("prompt.md");
  });

  test("dry-run lists context and explicit artifacts only", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-"));
    const { projectRoot } = initProject({ name: "Qa Game", engine: "Unreal Engine", mode: "development", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, "documentation", "design", "note.md"), "# Note\n");
    const result = prepareRun(
      "qa_agent",
      { project: projectRoot, task: "Review validation readiness", dryRun: true, includeArtifact: ["documentation/design/note.md"] },
      cwd
    );
    expect(result.output).toContain("Context files:");
    expect(result.output).toContain("documentation/design/note.md");
    expect(result.prompt).toContain("Unreal Engine");
    expect(result.prompt).toContain("npm run validate");
    expect(() => prepareRun("qa_agent", { project: projectRoot, task: "x", includeArtifact: ["../outside.md"] }, cwd)).toThrow(/escape/);
  });

  test("included artifacts cannot escape through project-local symlinks", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-"));
    const { projectRoot } = initProject({ name: "Symlink Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const outside = path.join(cwd, "outside.md");
    writeFileSync(outside, "# Secret\n");
    symlinkSync(outside, path.join(projectRoot, "documentation", "design", "outside-link.md"));
    expect(() =>
      prepareRun("qa_agent", { project: projectRoot, task: "x", includeArtifact: ["documentation/design/outside-link.md"] }, cwd)
    ).toThrow(/escape/);
  });

  test("prompt cache paths are unique for repeated runs", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-"));
    const { projectRoot } = initProject({ name: "Unique Run Game", engine: "unity", mode: "prototype", nonInteractive: true }, cwd);
    const a = prepareRun("data_scientist", { project: projectRoot, task: "Create analytics plan" }, cwd);
    const b = prepareRun("data_scientist", { project: projectRoot, task: "Create analytics plan" }, cwd);
    expect(a.promptPath).not.toBe(b.promptPath);
    expect(a.metadataPath).not.toBe(b.metadataPath);
  });

  test("same inputs produce same deterministic prompt body aside from metadata path", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-"));
    const { projectRoot } = initProject({ name: "Stable Game", engine: "unity", mode: "prototype", nonInteractive: true }, cwd);
    const a = prepareRun("data_scientist", { project: projectRoot, task: "Create analytics plan" }, cwd).prompt;
    const b = prepareRun("data_scientist", { project: projectRoot, task: "Create analytics plan" }, cwd).prompt;
    expect(a).toBe(b);
    expect(a).toContain("# Template: analytics_setup");
    expect(a).toContain("documentation/technical/analytics/analytics-plan.md");
  });

  test("builds a direct codex exec invocation for prepared prompts", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-"));
    const { projectRoot } = initProject({ name: "Codex Exec Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const result = prepareRun("qa_agent", { project: projectRoot, task: "Review validation readiness", exec: true, codexBin: "codex-test" }, cwd);
    expect(result.output).toContain("Executing Codex:");
    expect(result.codexCommand.command).toBe("codex-test");
    expect(result.codexCommand.args.slice(0, 3)).toEqual(["exec", "--cd", projectRoot]);
    expect(result.codexCommand.args[3]).toMatch(/Read \.gamestudio\/runs\/.+prompt\.md and perform the requested task\./);
    expect(codexExecInvocation(projectRoot, result.promptPath, "codex-test").display).toContain("codex-test");
    expect(() => prepareRun("qa_agent", { project: projectRoot, task: "x", exec: true, dryRun: true }, cwd)).toThrow(/--exec cannot be combined/);
  });

  test("can execute a codex-compatible binary with argument isolation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-"));
    const { projectRoot } = initProject({ name: "Stub Codex Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const stub = path.join(cwd, "codex-stub.mjs");
    writeFileSync(stub, "#!/usr/bin/env node\nconsole.log(JSON.stringify(process.argv.slice(2)));\n");
    chmodSync(stub, 0o755);
    const result = prepareRun("qa_agent", { project: projectRoot, task: "Review validation readiness", exec: true, codexBin: stub }, cwd);
    const execution = executeCodexRun(result);
    expect(execution.status).toBe(0);
    expect(JSON.parse(execution.stdout)).toEqual(result.codexCommand.args);
  });
});
