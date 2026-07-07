import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { packageRoot } from "../src/paths.js";
import { renderAgentContext, suggestAgentContext } from "../src/agent-context.js";

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

  test("package exposes low-output npm scripts for agents", () => {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot(), "package.json"), "utf8")) as { scripts: Record<string, string> };

    expect(pkg.scripts["ctx:studio"]).toContain("context studio");
    expect(pkg.scripts["ctx:role"]).toContain("context role");
    expect(pkg.scripts["ctx:workflow"]).toContain("context workflow");
    expect(pkg.scripts["ctx:task"]).toContain("context task");
    expect(pkg.scripts["ctx:changed"]).toContain("context changed");
  });
});
