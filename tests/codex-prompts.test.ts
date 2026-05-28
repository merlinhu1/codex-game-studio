import { describe, expect, test } from "vitest";
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
});
