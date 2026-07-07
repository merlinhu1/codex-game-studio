import { readFileSync } from "node:fs";
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
    expect(pack).toContain("npm run ctx:role -- gameplay-programmer");
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
    expect(suggestions.commands).toContain("npm run ctx:workflow -- bugfix");
    expect(JSON.stringify(suggestions)).not.toContain("systemPrompt");
  });

  test("runtime Codex prompts tell agents to use compact context helpers before broad reads", () => {
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

    expect(prompt).toContain("## Compact Context First");
    expect(prompt).toContain("npm run ctx:role -- gameplay-programmer");
    expect(prompt).toContain("npm run ctx:changed");
  });

  test("tracked agent and workflow surfaces advertise context helpers without relying only on AGENTS.md", () => {
    const root = packageRoot();
    const agent = readFileSync(path.join(root, ".codex", "agents", "gameplay-programmer.toml"), "utf8");
    const workflow = readFileSync(path.join(root, ".codex", "workflows", "bugfix.md"), "utf8");

    expect(agent).toContain("npm run ctx:role -- gameplay-programmer");
    expect(agent).toContain("npm run ctx:changed");
    expect(workflow).toContain("npm run ctx:workflow -- bugfix");
    expect(workflow).toContain("npm run ctx:role -- gameplay-programmer");
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
