import { describe, test } from "node:test";
import { expect } from "expect";
import { createCodexStudioSession } from "../src/codex-session.js";
import { renderCodexPrompt } from "../src/codex-prompts.js";

describe("Codex prompt renderer", () => {
  test("renders role, objective, context, outputs, and verification contract", () => {
    const session = createCodexStudioSession({
      projectRoot: "/repo/projects/rogue-core",
      role: "gameplay-programmer",
      objective: "Implement movement",
      phase: "implement",
      engine: "godot",
      contextFiles: ["AGENTS.md", ".codex/studio.json"],
      verification: { command: "npm", args: ["test"] }
    });
    const prompt = renderCodexPrompt(session);
    expect(prompt).toContain("Role: Gameplay Programmer");
    expect(prompt).toContain("Role ID: gameplay-programmer");
    expect(prompt).toContain("Context Strategy: focused");
    expect(prompt).toContain("Objective: Implement movement");
    expect(prompt).toContain("Phase: implement");
    expect(prompt).toContain("AGENTS.md");
    expect(prompt).not.toContain("CODEX.md");
    expect(prompt).toContain("npm test");
    expect(prompt).toContain("project.godot");
    expect(prompt).toContain("godot --headless");
    expect(prompt).toContain("Prefer Godot");
    expect(prompt).toContain("changed files");
    expect(prompt).toContain("verification results");
  });

  test("renders structured role contract sections without broad prompt bloat", () => {
    const session = createCodexStudioSession({
      projectRoot: "/repo/projects/ship-game",
      role: "release-manager",
      objective: "Prepare release checklist",
      phase: "review",
      engine: "unity",
      contextFiles: ["AGENTS.md", ".codex/studio.json", "docs/engine-reference/unity/VERSION.md"]
    });

    const prompt = renderCodexPrompt(session);

    expect(prompt).toContain("## Responsibilities");
    expect(prompt).toContain("## Inputs To Inspect");
    expect(prompt).toContain("## Output Format");
    expect(prompt).toContain("## Quality Gates");
    expect(prompt).toContain("## Collaboration Notes");
    expect(prompt).toContain("## Stop Conditions");
    expect(prompt).toContain("Release decision");
    expect(prompt).toContain("Blocking issues");
    expect(prompt).toContain("Validation evidence");
    expect(prompt).toContain("Stop and report a blocker");
    expect(prompt.length).toBeLessThan(12000);
    expect(prompt).not.toContain("# Gameplay Programmer");
    expect(prompt).not.toContain("# QA Playtester");
    expect(prompt).not.toContain("templates/gdd_template.md");
    expect(prompt).not.toContain("docs/engine-reference/unreal/");
  });
});
