import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { packageRoot } from "../src/paths.js";
import { renderAgentContext, suggestAgentContext } from "../src/agent-context.js";
import { renderCodexPrompt } from "../src/codex-prompts.js";

describe("agent context helper scripts", () => {
  test("render a compact role context pack without dumping prompt bodies", () => {
    const pack = renderAgentContext({ kind: "role", id: "gameplay-programmer" });

    expect(pack).toContain("# Agent Context Pack: role/gameplay-programmer");
    expect(pack).toContain("Role: Gameplay Programmer");
    expect(pack).toContain("Context strategy:");
    expect(pack).toContain("Related workflows:");
    expect(pack).toContain("Suggested agent command:");
    expect(pack).toContain("./codex-game-studio context role gameplay-programmer");
    expect(pack).not.toContain("## Responsibilities");
    expect(pack.split("\n").length).toBeLessThan(90);
  });

  test("render a workflow context pack with only selected role, files, templates, and commands", () => {
    const pack = renderAgentContext({ kind: "workflow", id: "bugfix" });

    expect(pack).toContain("# Agent Context Pack: workflow/bugfix");
    expect(pack).toContain("Owner role: gameplay-programmer");
    expect(pack).toContain("Context files:");
    expect(pack).toContain(".codex/workflows/bugfix.md");
    expect(pack).toContain("Suggested agent command:");
    expect(pack).not.toContain("# Bugfix Workflow");
    expect(pack.split("\n").length).toBeLessThan(80);
  });

  test("task suggestions rank relevant workflows and roles for a natural-language request", () => {
    const suggestions = suggestAgentContext("fix a combat bug and verify a regression test");

    expect(suggestions.workflows[0]?.id).toBe("bugfix");
    expect(suggestions.roles.map((role) => role.id)).toContain("gameplay-programmer");
    expect(suggestions.commands).toContain("./codex-game-studio context workflow bugfix");
    expect(JSON.stringify(suggestions)).not.toContain("systemPrompt");
  });

  test("shared context bootstrap guidance lives in AGENTS.md, not repeated prompt surfaces", () => {
    const root = packageRoot();
    const agentsMd = readFileSync(path.join(root, "AGENTS.md"), "utf8");
    const agent = readFileSync(path.join(root, ".codex", "agents", "gameplay-programmer.toml"), "utf8");
    const workflow = readFileSync(path.join(root, ".codex", "workflows", "bugfix.md"), "utf8");
    const prompt = renderCodexPrompt({
      projectRoot: "/repo/game",
      role: "gameplay-programmer",
      objective: "Fix movement bug",
      phase: "implement",
      engine: "godot",
      contextFiles: ["AGENTS.md", ".codex/studio.json"],
      expectedOutputs: ["Code changes"],
      allowFileEdits: true,
      sandbox: "danger-full-access"
    });

    expect(agentsMd).toContain("## Context Bootstrap");
    expect(agentsMd).toContain("./codex-game-studio context role <role-id>");
    expect(agentsMd).toContain("./codex-game-studio context workflow <workflow-id>");
    expect(agent).not.toContain("Context bootstrap:");
    expect(workflow).not.toContain("Context bootstrap:");
    expect(prompt).not.toContain("## Context Bootstrap");
    expect(agent).not.toContain("Compact Context First");
    expect(workflow).not.toContain("Compact Context First");
  });

  test("changed context degrades gracefully outside Git checkouts", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-context-no-git-"));
    const pack = renderAgentContext({ kind: "changed", cwd });

    expect(pack).toContain("Changed files: unavailable");
    expect(pack).toContain("Git is unavailable or this directory is not a Git checkout");
    expect(pack).toContain("context task");
  });

  test("package exposes low-output npm scripts for agents", () => {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot(), "package.json"), "utf8")) as { scripts: Record<string, string> };

    expect(pkg.scripts["ctx:studio"]).toContain("context studio");
    expect(pkg.scripts["ctx:role"]).toContain("context role");
    expect(pkg.scripts["ctx:workflow"]).toContain("context workflow");
    expect(pkg.scripts["ctx:task"]).toContain("context task");
    expect(pkg.scripts["ctx:changed"]).toContain("context changed");
  });
});
